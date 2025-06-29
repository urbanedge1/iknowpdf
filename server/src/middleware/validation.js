import { body, param, query, validationResult } from 'express-validator';
import { AppError } from '../utils/appError.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return next(new AppError('Validation failed', 400, errorMessages));
  }
  next();
};

// Auth validation rules
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// File validation rules
export const validateFileUpload = [
  body('fileName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('File name must be between 1 and 255 characters'),
  handleValidationErrors
];

// Tool processing validation
export const validateToolProcessing = [
  body('toolId')
    .notEmpty()
    .withMessage('Tool ID is required')
    .isIn([
      'merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-word', 'pdf-to-excel',
      'pdf-to-ppt', 'pdf-to-jpg', 'image-to-pdf', 'word-to-pdf', 'excel-to-pdf',
      'html-to-pdf', 'scan-to-pdf', 'edit-pdf', 'annotate-pdf', 'rotate-pages',
      'add-watermark', 'page-numbers', 'crop-pdf', 'protect-pdf', 'unlock-pdf',
      'redact-pdf', 'repair-pdf', 'sign-pdf', 'request-signature', 'digital-certificates',
      'organize-pages', 'extract-pages', 'compare-pdf', 'batch-process'
    ])
    .withMessage('Invalid tool ID'),
  body('fileIds')
    .isArray({ min: 1 })
    .withMessage('At least one file ID is required'),
  body('fileIds.*')
    .isUUID()
    .withMessage('Invalid file ID format'),
  body('options')
    .optional()
    .isObject()
    .withMessage('Options must be an object'),
  handleValidationErrors
];

// User profile validation
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors
];

// Subscription validation
export const validateSubscription = [
  body('planId')
    .notEmpty()
    .withMessage('Plan ID is required')
    .isIn(['free', 'pro', 'premium'])
    .withMessage('Invalid plan ID'),
  body('paymentMethodId')
    .optional()
    .isString()
    .withMessage('Payment method ID must be a string'),
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isString()
    .withMessage('Sort by must be a string'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];

// UUID parameter validation
export const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];