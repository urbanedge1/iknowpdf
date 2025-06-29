import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/appError.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token required', 401);
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      throw new AppError('Invalid token', 401);
    }

    if (!user.is_active) {
      throw new AppError('Account deactivated', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

export const checkPlanAccess = (requiredPlan) => {
  const planHierarchy = { free: 0, pro: 1, premium: 2 };
  
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const userPlanLevel = planHierarchy[req.user.plan] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan] || 0;

    if (userPlanLevel < requiredPlanLevel) {
      return next(new AppError(`${requiredPlan} plan required`, 403));
    }

    next();
  };
};

export const checkTaskLimits = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Skip limit check for premium users
    if (req.user.plan === 'premium') {
      return next();
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Get today's task count
    const { data: tasks, error } = await supabase
      .from('processing_jobs')
      .select('id')
      .eq('user_id', req.user.id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (error) {
      logger.error('Error checking task limits:', error);
      return next(new AppError('Failed to check task limits', 500));
    }

    const taskCount = tasks?.length || 0;
    const dailyLimit = req.user.plan === 'free' ? 
      parseInt(process.env.DAILY_TASK_LIMIT_FREE) : 
      parseInt(process.env.DAILY_TASK_LIMIT_PRO);

    if (dailyLimit > 0 && taskCount >= dailyLimit) {
      return next(new AppError('Daily task limit exceeded', 429));
    }

    req.taskCount = taskCount;
    req.taskLimit = dailyLimit;
    next();
  } catch (error) {
    logger.error('Task limit check error:', error);
    next(new AppError('Failed to check task limits', 500));
  }
};