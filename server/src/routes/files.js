import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/database.js';
import { uploadToS3, getSignedUrl, deleteFromS3 } from '../config/aws.js';
import { authenticate, checkTaskLimits } from '../middleware/auth.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';
import { validateFileUpload, validateUUID } from '../middleware/validation.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'text/html',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type', 400), false);
  }
};

const getMaxFileSize = (userPlan) => {
  switch (userPlan) {
    case 'free':
      return parseInt(process.env.MAX_FILE_SIZE_FREE) || 50 * 1024 * 1024; // 50MB
    case 'pro':
      return parseInt(process.env.MAX_FILE_SIZE_PRO) || 100 * 1024 * 1024; // 100MB
    case 'premium':
      return parseInt(process.env.MAX_FILE_SIZE_PREMIUM) || -1; // Unlimited
    default:
      return 50 * 1024 * 1024;
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max (will be checked per plan)
    files: 10 // Max 10 files per request
  }
});

// @route   POST /api/v1/files/upload
// @desc    Upload files
// @access  Private
router.post('/upload', uploadRateLimiter, upload.array('files', 10), validateFileUpload, async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new AppError('No files uploaded', 400));
    }

    const maxFileSize = getMaxFileSize(req.user.plan);
    const uploadedFiles = [];

    for (const file of req.files) {
      // Check file size per user plan
      if (maxFileSize > 0 && file.size > maxFileSize) {
        return next(new AppError(`File ${file.originalname} exceeds size limit for ${req.user.plan} plan`, 400));
      }

      try {
        // Generate unique file key
        const fileExtension = file.originalname.split('.').pop();
        const fileKey = `${req.user.id}/${uuidv4()}.${fileExtension}`;

        // Upload to S3
        const uploadResult = await uploadToS3(
          file.buffer,
          fileKey,
          file.mimetype,
          {
            originalName: file.originalname,
            userId: req.user.id,
            uploadedAt: new Date().toISOString()
          }
        );

        // Save file metadata to database
        const { data: fileRecord, error } = await supabase
          .from('files')
          .insert([
            {
              id: uuidv4(),
              user_id: req.user.id,
              original_name: file.originalname,
              file_name: fileKey.split('/').pop(),
              file_type: file.mimetype,
              file_size: file.size,
              s3_key: fileKey,
              s3_url: uploadResult.Location,
              status: 'uploaded',
              created_at: new Date()
            }
          ])
          .select()
          .single();

        if (error) {
          logger.error('Error saving file metadata:', error);
          // Clean up S3 file if database save fails
          await deleteFromS3(fileKey);
          throw new Error('Failed to save file metadata');
        }

        uploadedFiles.push(fileRecord);
      } catch (fileError) {
        logger.error(`Error uploading file ${file.originalname}:`, fileError);
        // Continue with other files, but log the error
      }
    }

    if (uploadedFiles.length === 0) {
      return next(new AppError('Failed to upload any files', 500));
    }

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      data: { files: uploadedFiles }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/files
// @desc    Get user files
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'desc';
    const status = req.query.status;
    const fileType = req.query.fileType;

    let query = supabase
      .from('files')
      .select('*')
      .eq('user_id', req.user.id);

    if (status) {
      query = query.eq('status', status);
    }

    if (fileType) {
      query = query.like('file_type', `${fileType}%`);
    }

    // Get total count
    const { count, error: countError } = await query
      .select('*', { count: 'exact', head: true });

    if (countError) {
      logger.error('Error counting files:', countError);
      return next(new AppError('Failed to fetch files', 500));
    }

    // Get files with pagination
    const { data: files, error } = await query
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

// @route   GET /api/v1/files/:id
// @desc    Get file details
// @access  Private
router.get('/:id', validateUUID, async (req, res, next) => {
  try {
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !file) {
      return next(new AppError('File not found', 404));
    }

    res.json({
      success: true,
      data: { file }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/v1/files/:id/download
// @desc    Get file download URL
// @access  Private
router.get('/:id/download', validateUUID, async (req, res, next) => {
  try {
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !file) {
      return next(new AppError('File not found', 404));
    }

    // Generate signed URL (valid for 1 hour)
    const downloadUrl = await getSignedUrl(file.s3_key, 3600);

    res.json({
      success: true,
      data: {
        downloadUrl,
        fileName: file.original_name,
        expiresIn: 3600
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/v1/files/:id
// @desc    Delete file
// @access  Private
router.delete('/:id', validateUUID, async (req, res, next) => {
  try {
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !file) {
      return next(new AppError('File not found', 404));
    }

    // Delete from S3
    await deleteFromS3(file.s3_key);

    // Delete from database
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', req.params.id);

    if (deleteError) {
      logger.error('Error deleting file from database:', deleteError);
      return next(new AppError('Failed to delete file', 500));
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/files/bulk-delete
// @desc    Delete multiple files
// @access  Private
router.post('/bulk-delete', async (req, res, next) => {
  try {
    const { fileIds } = req.body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return next(new AppError('File IDs array is required', 400));
    }

    // Get files to delete
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .in('id', fileIds)
      .eq('user_id', req.user.id);

    if (error) {
      logger.error('Error fetching files for deletion:', error);
      return next(new AppError('Failed to fetch files', 500));
    }

    if (files.length === 0) {
      return next(new AppError('No files found to delete', 404));
    }

    // Delete from S3
    for (const file of files) {
      try {
        await deleteFromS3(file.s3_key);
      } catch (s3Error) {
        logger.error(`Error deleting file ${file.s3_key} from S3:`, s3Error);
        // Continue with other files
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .in('id', files.map(f => f.id));

    if (deleteError) {
      logger.error('Error deleting files from database:', deleteError);
      return next(new AppError('Failed to delete files', 500));
    }

    res.json({
      success: true,
      message: `Successfully deleted ${files.length} file(s)`
    });
  } catch (error) {
    next(error);
  }
});

export default router;