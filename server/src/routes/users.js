import express from 'express';
import { supabase } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { validateProfileUpdate, validatePagination } from '../middleware/validation.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/v1/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, email, name, plan, tasks_used, tasks_limit, 
        is_active, email_verified, created_at, last_login,
        subscription:subscriptions(*)
      `)
      .eq('id', req.user.id)
      .single();

    if (error) {
      logger.error('Error fetching user profile:', error);
      return next(new AppError('Failed to fetch profile', 500));
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/v1/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', validateProfileUpdate, async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (email && email !== req.user.email) {
      // Check if email is already taken
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', req.user.id)
        .single();

      if (existingUser) {
        return next(new AppError('Email already in use', 400));
      }

      updateData.email = email;
      updateData.email_verified = false; // Reset email verification
    }

    if (Object.keys(updateData).length === 0) {
      return next(new AppError('No valid fields to update', 400));
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select(`
        id, email, name, plan, tasks_used, tasks_limit, 
        is_active, email_verified, created_at, last_login
      `)
      .single();

    if (error) {
      logger.error('Error updating user profile:', error);
      return next(new AppError('Failed to update profile', 500));
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/users/usage
// @desc    Get user usage statistics
// @access  Private
router.get('/usage', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Get monthly stats
    const { data: monthlyJobs, error: monthlyError } = await supabase
      .from('processing_jobs')
      .select('id, status, created_at')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (monthlyError) {
      logger.error('Error fetching monthly usage:', monthlyError);
      return next(new AppError('Failed to fetch usage statistics', 500));
    }

    // Get daily stats
    const { data: dailyJobs, error: dailyError } = await supabase
      .from('processing_jobs')
      .select('id, status, created_at')
      .eq('user_id', userId)
      .gte('created_at', startOfDay.toISOString());

    if (dailyError) {
      logger.error('Error fetching daily usage:', dailyError);
      return next(new AppError('Failed to fetch usage statistics', 500));
    }

    // Get storage usage
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('size')
      .eq('user_id', userId);

    if (filesError) {
      logger.error('Error fetching storage usage:', filesError);
      return next(new AppError('Failed to fetch storage statistics', 500));
    }

    const monthlyStats = {
      total: monthlyJobs.length,
      completed: monthlyJobs.filter(job => job.status === 'completed').length,
      failed: monthlyJobs.filter(job => job.status === 'failed').length,
      processing: monthlyJobs.filter(job => job.status === 'processing').length
    };

    const dailyStats = {
      total: dailyJobs.length,
      completed: dailyJobs.filter(job => job.status === 'completed').length,
      failed: dailyJobs.filter(job => job.status === 'failed').length,
      processing: dailyJobs.filter(job => job.status === 'processing').length
    };

    const storageUsed = files.reduce((total, file) => total + (file.size || 0), 0);

    res.json({
      success: true,
      data: {
        monthly: monthlyStats,
        daily: dailyStats,
        storage: {
          used: storageUsed,
          limit: req.user.plan === 'free' ? 1024 * 1024 * 1024 : -1 // 1GB for free, unlimited for paid
        },
        plan: {
          current: req.user.plan,
          tasksUsed: req.user.tasks_used,
          tasksLimit: req.user.tasks_limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/users/files
// @desc    Get user files
// @access  Private
router.get('/files', validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'desc';

    // Get total count
    const { count, error: countError } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    if (countError) {
      logger.error('Error counting files:', countError);
      return next(new AppError('Failed to fetch files', 500));
    }

    // Get files with pagination
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', req.user.id)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching files:', error);
      return next(new AppError('Failed to fetch files', 500));
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        files,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/users/jobs
// @desc    Get user processing jobs
// @access  Private
router.get('/jobs', validatePagination, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'desc';
    const status = req.query.status;

    let query = supabase
      .from('processing_jobs')
      .select(`
        *, 
        files:job_files(
          file:files(*)
        )
      `)
      .eq('user_id', req.user.id);

    if (status) {
      query = query.eq('status', status);
    }

    // Get total count
    const { count, error: countError } = await query
      .select('*', { count: 'exact', head: true });

    if (countError) {
      logger.error('Error counting jobs:', countError);
      return next(new AppError('Failed to fetch jobs', 500));
    }

    // Get jobs with pagination
    const { data: jobs, error } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('Error fetching jobs:', error);
      return next(new AppError('Failed to fetch jobs', 500));
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/v1/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Start transaction-like operations
    // Delete user files from S3 and database
    const { data: files } = await supabase
      .from('files')
      .select('s3_key')
      .eq('user_id', userId);

    if (files && files.length > 0) {
      // Delete files from S3
      const { deleteFromS3 } = await import('../config/aws.js');
      for (const file of files) {
        if (file.s3_key) {
          await deleteFromS3(file.s3_key);
        }
      }
    }

    // Delete user data
    await supabase.from('files').delete().eq('user_id', userId);
    await supabase.from('processing_jobs').delete().eq('user_id', userId);
    await supabase.from('subscriptions').delete().eq('user_id', userId);
    await supabase.from('refresh_tokens').delete().eq('user_id', userId);
    await supabase.from('password_reset_tokens').delete().eq('user_id', userId);

    // Finally delete user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      logger.error('Error deleting user account:', error);
      return next(new AppError('Failed to delete account', 500));
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;