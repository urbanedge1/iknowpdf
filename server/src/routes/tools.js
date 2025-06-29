import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/database.js';
import { authenticate, checkTaskLimits, checkPlanAccess } from '../middleware/auth.js';
import { validateToolProcessing } from '../middleware/validation.js';
import { getPDFProcessingQueue } from '../config/queues.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Tool configurations
const TOOL_CONFIGS = {
  'merge-pdf': { free: true, premium: false, maxFiles: 10 },
  'split-pdf': { free: true, premium: false, maxFiles: 1 },
  'compress-pdf': { free: true, premium: false, maxFiles: 1 },
  'pdf-to-word': { free: true, premium: false, maxFiles: 1 },
  'pdf-to-excel': { free: true, premium: false, maxFiles: 1 },
  'pdf-to-ppt': { free: true, premium: false, maxFiles: 1 },
  'pdf-to-jpg': { free: true, premium: false, maxFiles: 1 },
  'image-to-pdf': { free: true, premium: false, maxFiles: 10 },
  'word-to-pdf': { free: true, premium: false, maxFiles: 1 },
  'excel-to-pdf': { free: true, premium: false, maxFiles: 1 },
  'html-to-pdf': { free: true, premium: false, maxFiles: 1 },
  'scan-to-pdf': { free: true, premium: false, maxFiles: 1 },
  'edit-pdf': { free: true, premium: false, maxFiles: 1 },
  'annotate-pdf': { free: true, premium: false, maxFiles: 1 },
  'rotate-pages': { free: true, premium: false, maxFiles: 1 },
  'add-watermark': { free: true, premium: false, maxFiles: 1 },
  'page-numbers': { free: true, premium: false, maxFiles: 1 },
  'crop-pdf': { free: true, premium: false, maxFiles: 1 },
  'protect-pdf': { free: true, premium: false, maxFiles: 1 },
  'unlock-pdf': { free: true, premium: false, maxFiles: 1 },
  'redact-pdf': { free: true, premium: false, maxFiles: 1 },
  'repair-pdf': { free: true, premium: false, maxFiles: 1 },
  'sign-pdf': { free: false, premium: false, maxFiles: 1 },
  'request-signature': { free: false, premium: false, maxFiles: 1 },
  'digital-certificates': { free: false, premium: true, maxFiles: 1 },
  'organize-pages': { free: true, premium: false, maxFiles: 1 },
  'extract-pages': { free: true, premium: false, maxFiles: 1 },
  'compare-pdf': { free: true, premium: false, maxFiles: 2 },
  'batch-process': { free: false, premium: true, maxFiles: 50 }
};

// @route   GET /api/v1/tools
// @desc    Get available tools for user
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const userPlan = req.user.plan;
    const availableTools = [];

    for (const [toolId, config] of Object.entries(TOOL_CONFIGS)) {
      let available = false;

      if (config.free) {
        available = true;
      } else if (config.premium && userPlan === 'premium') {
        available = true;
      } else if (!config.premium && (userPlan === 'pro' || userPlan === 'premium')) {
        available = true;
      }

      availableTools.push({
        id: toolId,
        name: toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        available,
        maxFiles: config.maxFiles,
        requiresPlan: config.free ? null : (config.premium ? 'premium' : 'pro')
      });
    }

    res.json({
      success: true,
      data: { tools: availableTools }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/tools/process
// @desc    Process files with selected tool
// @access  Private
router.post('/process', checkTaskLimits, validateToolProcessing, async (req, res, next) => {
  try {
    const { toolId, fileIds, options = {} } = req.body;
    const userId = req.user.id;

    // Check if tool exists and is available for user
    const toolConfig = TOOL_CONFIGS[toolId];
    if (!toolConfig) {
      return next(new AppError('Invalid tool ID', 400));
    }

    // Check plan access
    if (!toolConfig.free) {
      if (toolConfig.premium && req.user.plan !== 'premium') {
        return next(new AppError('Premium plan required for this tool', 403));
      } else if (!toolConfig.premium && req.user.plan === 'free') {
        return next(new AppError('Pro or Premium plan required for this tool', 403));
      }
    }

    // Check file count limits
    if (fileIds.length > toolConfig.maxFiles) {
      return next(new AppError(`Maximum ${toolConfig.maxFiles} files allowed for this tool`, 400));
    }

    // Verify files belong to user
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*')
      .in('id', fileIds)
      .eq('user_id', userId);

    if (filesError) {
      logger.error('Error fetching files:', filesError);
      return next(new AppError('Failed to fetch files', 500));
    }

    if (files.length !== fileIds.length) {
      return next(new AppError('Some files not found or not accessible', 404));
    }

    // Check if all files are in uploaded status
    const invalidFiles = files.filter(file => file.status !== 'uploaded');
    if (invalidFiles.length > 0) {
      return next(new AppError('Some files are not ready for processing', 400));
    }

    // Create processing job
    const jobId = uuidv4();
    const { data: job, error: jobError } = await supabase
      .from('processing_jobs')
      .insert([
        {
          id: jobId,
          user_id: userId,
          tool_id: toolId,
          status: 'pending',
          progress: 0,
          options: options,
          created_at: new Date()
        }
      ])
      .select()
      .single();

    if (jobError) {
      logger.error('Error creating processing job:', jobError);
      return next(new AppError('Failed to create processing job', 500));
    }

    // Link files to job
    const jobFiles = files.map(file => ({
      job_id: jobId,
      file_id: file.id
    }));

    const { error: linkError } = await supabase
      .from('job_files')
      .insert(jobFiles);

    if (linkError) {
      logger.error('Error linking files to job:', linkError);
      return next(new AppError('Failed to link files to job', 500));
    }

    // Add job to processing queue
    const processingQueue = getPDFProcessingQueue();
    await processingQueue.add('process-pdf', {
      jobId,
      toolId,
      files,
      options,
      userId
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: 10,
      removeOnFail: 5
    });

    // Update user task count
    await supabase
      .from('users')
      .update({ tasks_used: req.user.tasks_used + 1 })
      .eq('id', userId);

    res.status(201).json({
      success: true,
      message: 'Processing job created successfully',
      data: {
        job: {
          id: job.id,
          toolId: job.tool_id,
          status: job.status,
          progress: job.progress,
          createdAt: job.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/tools/jobs
// @desc    Get user processing jobs
// @access  Private
router.get('/jobs', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
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
      .order('created_at', { ascending: false })
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

// @route   GET /api/v1/tools/jobs/:id
// @desc    Get processing job details
// @access  Private
router.get('/jobs/:id', async (req, res, next) => {
  try {
    const { data: job, error } = await supabase
      .from('processing_jobs')
      .select(`
        *,
        files:job_files(
          file:files(*)
        ),
        result_files:result_files(*)
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !job) {
      return next(new AppError('Job not found', 404));
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/v1/tools/jobs/:id
// @desc    Cancel/delete processing job
// @access  Private
router.delete('/jobs/:id', async (req, res, next) => {
  try {
    const { data: job, error } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !job) {
      return next(new AppError('Job not found', 404));
    }

    if (job.status === 'processing') {
      return next(new AppError('Cannot delete job that is currently processing', 400));
    }

    // Delete result files from S3 if they exist
    const { data: resultFiles } = await supabase
      .from('result_files')
      .select('s3_key')
      .eq('job_id', req.params.id);

    if (resultFiles && resultFiles.length > 0) {
      const { deleteFromS3 } = await import('../config/aws.js');
      for (const file of resultFiles) {
        if (file.s3_key) {
          await deleteFromS3(file.s3_key);
        }
      }
    }

    // Delete job and related records
    await supabase.from('result_files').delete().eq('job_id', req.params.id);
    await supabase.from('job_files').delete().eq('job_id', req.params.id);
    
    const { error: deleteError } = await supabase
      .from('processing_jobs')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) {
      logger.error('Error deleting job:', deleteError);
      return next(new AppError('Failed to delete job', 500));
    }

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;