import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { getEmailQueue } from '../config/queues.js';

const router = express.Router();

// Apply auth rate limiting to all routes
router.use(authRateLimiter);

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );

  return { accessToken, refreshToken };
};

// @route   POST /api/v1/auth/register
// @desc    Register user
// @access  Public
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          name,
          plan: 'free',
          tasks_used: 0,
          tasks_limit: parseInt(process.env.DAILY_TASK_LIMIT_FREE) || 3,
          is_active: true,
          email_verified: false
        }
      ])
      .select()
      .single();

    if (error) {
      logger.error('User registration error:', error);
      return next(new AppError('Failed to create user', 500));
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token
    await supabase
      .from('refresh_tokens')
      .insert([
        {
          user_id: user.id,
          token: refreshToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      ]);

    // Send welcome email
    const emailQueue = getEmailQueue();
    await emailQueue.add('send-email', {
      to: email,
      subject: 'Welcome to iknowpdf!',
      template: 'welcome',
      data: { name }
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user with password
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return next(new AppError('Invalid credentials', 401));
    }

    if (!user.is_active) {
      return next(new AppError('Account is deactivated', 401));
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token
    await supabase
      .from('refresh_tokens')
      .insert([
        {
          user_id: user.id,
          token: refreshToken,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      ]);

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date() })
      .eq('id', user.id);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token required', 400));
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Check if refresh token exists in database
    const { data: tokenRecord, error } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('token', refreshToken)
      .eq('user_id', decoded.userId)
      .single();

    if (error || !tokenRecord) {
      return next(new AppError('Invalid refresh token', 401));
    }

    // Check if token is expired
    if (new Date() > new Date(tokenRecord.expires_at)) {
      // Delete expired token
      await supabase
        .from('refresh_tokens')
        .delete()
        .eq('id', tokenRecord.id);
      
      return next(new AppError('Refresh token expired', 401));
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    // Update refresh token in database
    await supabase
      .from('refresh_tokens')
      .update({
        token: newRefreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })
      .eq('id', tokenRecord.id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid refresh token', 401));
    }
    next(error);
  }
});

// @route   POST /api/v1/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete refresh token from database
      await supabase
        .from('refresh_tokens')
        .delete()
        .eq('token', refreshToken);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Email is required', 400));
    }

    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single();

    // Always return success to prevent email enumeration
    if (error || !user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token
    await supabase
      .from('password_reset_tokens')
      .insert([
        {
          user_id: user.id,
          token: resetToken,
          expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      ]);

    // Send reset email
    const emailQueue = getEmailQueue();
    await emailQueue.add('send-email', {
      to: email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      data: {
        name: user.name,
        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
      }
    });

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return next(new AppError('Token and password are required', 400));
    }

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'password-reset') {
      return next(new AppError('Invalid token type', 400));
    }

    // Check if reset token exists in database
    const { data: tokenRecord, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('user_id', decoded.userId)
      .single();

    if (error || !tokenRecord) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    // Check if token is expired
    if (new Date() > new Date(tokenRecord.expires_at)) {
      await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('id', tokenRecord.id);
      
      return next(new AppError('Reset token expired', 400));
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password
    await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', decoded.userId);

    // Delete reset token
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('id', tokenRecord.id);

    // Delete all refresh tokens for this user (force re-login)
    await supabase
      .from('refresh_tokens')
      .delete()
      .eq('user_id', decoded.userId);

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired reset token', 400));
    }
    next(error);
  }
});

export default router;