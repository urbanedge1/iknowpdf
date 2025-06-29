import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ProcessingOptions {
  quality?: 'high' | 'medium' | 'low';
  compression?: boolean;
  format?: string;
  pages?: number[];
}

export interface ProcessedFile {
  buffer: ArrayBuffer;
  fileName: string;
  mimeType: string;
  size: number;
}

export class SecurityValidator {
  static async validateFileContent(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const view = new Uint8Array(buffer.slice(0, 16));
        
        // Check magic numbers for common file types
        const isValid = this.checkMagicNumbers(view, file.type);
        resolve(isValid);
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 16));
    });
  }
  
  private static checkMagicNumbers(bytes: Uint8Array, mimeType: string): boolean {
    const signatures: Record<string, number[]> = {
      'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'application/zip': [0x50, 0x4B, 0x03, 0x04],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [0x50, 0x4B, 0x03, 0x04],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [0x50, 0x4B, 0x03, 0x04]
    };
    
    const signature = signatures[mimeType];
    if (!signature) return true; // Unknown type, allow
    
    return signature.every((byte, index) => bytes[index] === byte);
  }
}

export function validateFile(file: File, allowedTypes: string[], maxSize: number): ValidationResult {
  const errors: string[] = [];
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} not supported`);
  }
  
  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${formatBytes(maxSize)} limit`);
  }
  
  // Check file name
  if (file.name.length > 255) {
    errors.push('File name too long');
  }
  
  // Check for potentially dangerous file names
  const dangerousPatterns = [/\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.scr$/i];
  if (dangerousPatterns.some(pattern => pattern.test(file.name))) {
    errors.push('File type not allowed for security reasons');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export class ProgressTracker {
  private progressCallbacks = new Map<string, (progress: number) => void>();
  
  trackProgress(jobId: string, callback: (progress: number) => void) {
    this.progressCallbacks.set(jobId, callback);
  }
  
  updateProgress(jobId: string, progress: number) {
    const callback = this.progressCallbacks.get(jobId);
    if (callback) {
      callback(Math.min(100, Math.max(0, progress)));
    }
  }
  
  completeProgress(jobId: string) {
    this.updateProgress(jobId, 100);
    this.progressCallbacks.delete(jobId);
  }
  
  removeProgress(jobId: string) {
    this.progressCallbacks.delete(jobId);
  }
}

export class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly maxRequests = 50;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
  
  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
  
  getResetTime(identifier: string): number {
    const userRequests = this.requests.get(identifier) || [];
    if (userRequests.length === 0) return 0;
    
    const oldestRequest = Math.min(...userRequests);
    return oldestRequest + this.windowMs;
  }
}

export class ProcessingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = true,
    public readonly context?: string
  ) {
    super(message);
    this.name = 'ProcessingError';
  }
}

export class ErrorHandler {
  static handleProcessingError(error: Error, context: string): ProcessingError {
    const errorId = this.generateErrorId();
    
    // Log error for debugging
    console.error(`[${context}] Error ${errorId}:`, error);
    
    // Send to monitoring service (if available)
    this.reportError(error, context, errorId);
    
    // Return user-friendly error
    const message = this.getUserFriendlyMessage(error);
    const recoverable = this.isRecoverable(error);
    
    return new ProcessingError(message, errorId, recoverable, context);
  }
  
  private static getUserFriendlyMessage(error: Error): string {
    if (error.name === 'QuotaExceededError') {
      return 'Storage quota exceeded. Please free up space and try again.';
    }
    if (error.name === 'NetworkError') {
      return 'Network connection lost. Please check your internet and retry.';
    }
    if (error.message.includes('corrupted')) {
      return 'The file appears to be corrupted. Please try with a different file.';
    }
    if (error.message.includes('timeout')) {
      return 'Processing timed out. Please try with a smaller file.';
    }
    if (error.message.includes('memory')) {
      return 'Insufficient memory to process this file. Please try with a smaller file.';
    }
    return 'An unexpected error occurred. Please try again.';
  }
  
  private static isRecoverable(error: Error): boolean {
    const nonRecoverableErrors = [
      'QuotaExceededError',
      'SecurityError',
      'NotSupportedError'
    ];
    
    return !nonRecoverableErrors.includes(error.name);
  }
  
  private static generateErrorId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
  
  private static reportError(error: Error, context: string, errorId: string) {
    // In a real application, this would send to a monitoring service
    // like Sentry, LogRocket, or custom analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          error_id: errorId,
          context: context
        }
      });
    }
  }
}

export class FileProcessor {
  private workers: Worker[] = [];
  private maxWorkers = Math.min(navigator.hardwareConcurrency || 4, 8);
  private progressTracker = new ProgressTracker();
  
  async processFile(
    file: File, 
    toolId: string, 
    options: ProcessingOptions = {}
  ): Promise<ProcessedFile> {
    const jobId = this.generateJobId();
    
    try {
      // Validate file first
      const validation = await this.validateFileForTool(file, toolId);
      if (!validation.isValid) {
        throw new ProcessingError(
          validation.errors.join(', '),
          'VALIDATION_ERROR',
          true,
          'file_validation'
        );
      }
      
      // Start progress tracking
      this.progressTracker.updateProgress(jobId, 0);
      
      // Process based on tool type
      const result = await this.processFileByTool(file, toolId, options, jobId);
      
      // Complete progress
      this.progressTracker.completeProgress(jobId);
      
      return result;
    } catch (error) {
      this.progressTracker.removeProgress(jobId);
      throw ErrorHandler.handleProcessingError(error as Error, `tool_${toolId}`);
    }
  }
  
  private async validateFileForTool(file: File, toolId: string): Promise<ValidationResult> {
    const toolConfig = this.getToolConfig(toolId);
    
    // Validate file content
    const isValidContent = await SecurityValidator.validateFileContent(file);
    if (!isValidContent) {
      return {
        isValid: false,
        errors: ['File content validation failed']
      };
    }
    
    // Validate against tool requirements
    return validateFile(file, toolConfig.allowedTypes, toolConfig.maxSize);
  }
  
  private async processFileByTool(
    file: File, 
    toolId: string, 
    options: ProcessingOptions,
    jobId: string
  ): Promise<ProcessedFile> {
    switch (toolId) {
      case 'pdf-to-word':
        return this.processPDFToWord(file, options, jobId);
      case 'merge-pdf':
        return this.mergePDFs([file], options, jobId);
      case 'compress-pdf':
        return this.compressPDF(file, options, jobId);
      case 'image-resize':
        return this.resizeImage(file, options, jobId);
      case 'image-compress':
        return this.compressImage(file, options, jobId);
      default:
        throw new ProcessingError(
          `Tool ${toolId} not implemented`,
          'TOOL_NOT_FOUND',
          false,
          'tool_processing'
        );
    }
  }
  
  private async processPDFToWord(
    file: File, 
    options: ProcessingOptions,
    jobId: string
  ): Promise<ProcessedFile> {
    this.progressTracker.updateProgress(jobId, 10);
    
    const arrayBuffer = await file.arrayBuffer();
    this.progressTracker.updateProgress(jobId, 30);
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    this.progressTracker.updateProgress(jobId, 50);
    
    let fullText = '';
    const totalPages = pdf.numPages;
    
    // Extract text from each page
    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
      
      // Update progress
      const progress = 50 + (i / totalPages) * 40;
      this.progressTracker.updateProgress(jobId, progress);
    }
    
    // Create Word document content (simplified HTML format)
    const wordContent = this.createWordDocument(fullText);
    this.progressTracker.updateProgress(jobId, 95);
    
    const buffer = new TextEncoder().encode(wordContent);
    
    return {
      buffer: buffer.buffer,
      fileName: file.name.replace('.pdf', '.html'),
      mimeType: 'text/html',
      size: buffer.length
    };
  }
  
  private async compressPDF(
    file: File, 
    options: ProcessingOptions,
    jobId: string
  ): Promise<ProcessedFile> {
    this.progressTracker.updateProgress(jobId, 10);
    
    const arrayBuffer = await file.arrayBuffer();
    this.progressTracker.updateProgress(jobId, 30);
    
    const pdf = await PDFDocument.load(arrayBuffer);
    this.progressTracker.updateProgress(jobId, 60);
    
    // Apply compression settings
    const compressedBytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50
    });
    
    this.progressTracker.updateProgress(jobId, 90);
    
    return {
      buffer: compressedBytes.buffer,
      fileName: file.name.replace('.pdf', '_compressed.pdf'),
      mimeType: 'application/pdf',
      size: compressedBytes.length
    };
  }
  
  private async resizeImage(
    file: File, 
    options: ProcessingOptions,
    jobId: string
  ): Promise<ProcessedFile> {
    this.progressTracker.updateProgress(jobId, 10);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      img.onload = () => {
        this.progressTracker.updateProgress(jobId, 50);
        
        // Calculate new dimensions
        const { width, height } = this.calculateNewDimensions(
          img.width, 
          img.height, 
          options
        );
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);
        this.progressTracker.updateProgress(jobId, 80);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          
          blob.arrayBuffer().then(buffer => {
            resolve({
              buffer,
              fileName: file.name.replace(/\.[^.]+$/, '_resized.png'),
              mimeType: 'image/png',
              size: buffer.byteLength
            });
          });
        }, 'image/png', 0.9);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
  
  private async compressImage(
    file: File, 
    options: ProcessingOptions,
    jobId: string
  ): Promise<ProcessedFile> {
    this.progressTracker.updateProgress(jobId, 10);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      img.onload = () => {
        this.progressTracker.updateProgress(jobId, 40);
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        this.progressTracker.updateProgress(jobId, 70);
        
        // Determine quality based on options
        const quality = this.getCompressionQuality(options.quality || 'medium');
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          
          blob.arrayBuffer().then(buffer => {
            resolve({
              buffer,
              fileName: file.name.replace(/\.[^.]+$/, '_compressed.jpg'),
              mimeType: 'image/jpeg',
              size: buffer.byteLength
            });
          });
        }, 'image/jpeg', quality);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
  
  private async mergePDFs(
    files: File[], 
    options: ProcessingOptions,
    jobId: string
  ): Promise<ProcessedFile> {
    this.progressTracker.updateProgress(jobId, 10);
    
    const mergedPdf = await PDFDocument.create();
    const totalFiles = files.length;
    
    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
      
      // Update progress
      const progress = 10 + ((i + 1) / totalFiles) * 80;
      this.progressTracker.updateProgress(jobId, progress);
    }
    
    const mergedBytes = await mergedPdf.save();
    
    return {
      buffer: mergedBytes.buffer,
      fileName: 'merged_document.pdf',
      mimeType: 'application/pdf',
      size: mergedBytes.length
    };
  }
  
  private createWordDocument(text: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Converted Document</title>
    <style>
        body { 
            font-family: 'Times New Roman', serif; 
            line-height: 1.6; 
            margin: 1in; 
            font-size: 12pt;
        }
        p { margin-bottom: 12pt; }
        .page-break { page-break-before: always; }
    </style>
</head>
<body>
    <h1>Document Converted from PDF</h1>
    ${text.split('\n\n').map(paragraph => 
      paragraph.trim() ? `<p>${paragraph.replace(/\n/g, '<br>')}</p>` : ''
    ).join('')}
</body>
</html>`;
  }
  
  private calculateNewDimensions(
    originalWidth: number, 
    originalHeight: number, 
    options: ProcessingOptions
  ): { width: number; height: number } {
    // Default to 800px width if no options provided
    const targetWidth = 800;
    const aspectRatio = originalHeight / originalWidth;
    
    return {
      width: targetWidth,
      height: Math.round(targetWidth * aspectRatio)
    };
  }
  
  private getCompressionQuality(quality: string): number {
    switch (quality) {
      case 'high': return 0.9;
      case 'medium': return 0.7;
      case 'low': return 0.5;
      default: return 0.7;
    }
  }
  
  private getToolConfig(toolId: string) {
    const configs: Record<string, { allowedTypes: string[]; maxSize: number }> = {
      'pdf-to-word': {
        allowedTypes: ['application/pdf'],
        maxSize: 100 * 1024 * 1024 // 100MB
      },
      'merge-pdf': {
        allowedTypes: ['application/pdf'],
        maxSize: 100 * 1024 * 1024
      },
      'compress-pdf': {
        allowedTypes: ['application/pdf'],
        maxSize: 100 * 1024 * 1024
      },
      'image-resize': {
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 50 * 1024 * 1024 // 50MB
      },
      'image-compress': {
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 50 * 1024 * 1024
      }
    };
    
    return configs[toolId] || {
      allowedTypes: ['*/*'],
      maxSize: 100 * 1024 * 1024
    };
  }
  
  private generateJobId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Global instances
export const fileProcessor = new FileProcessor();
export const rateLimiter = new RateLimiter();
export const progressTracker = new ProgressTracker();