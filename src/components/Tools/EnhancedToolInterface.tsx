import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Download, Settings, Play, Pause, 
  CheckCircle, AlertCircle, FileText, Image, 
  RotateCcw, Zap, Shield, Clock, AlertTriangle,
  Info, HelpCircle
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Tool } from '../../types/tools';
import { useProcessingStore } from '../../store/processingStore';
import { toast } from 'react-hot-toast';
import { 
  fileProcessor, 
  rateLimiter, 
  validateFile, 
  formatBytes,
  ProcessingError 
} from '../../utils/fileProcessor';

interface EnhancedToolInterfaceProps {
  tool: Tool;
  onClose: () => void;
}

export const EnhancedToolInterface: React.FC<EnhancedToolInterfaceProps> = ({ 
  tool, 
  onClose 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<ProcessingError | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { addJob, updateProgress } = useProcessingStore();

  // Get user identifier for rate limiting
  const getUserId = () => {
    return localStorage.getItem('user_id') || 
           sessionStorage.getItem('session_id') || 
           'anonymous';
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const userId = getUserId();
    
    // Check rate limiting
    if (!rateLimiter.isAllowed(userId)) {
      const resetTime = new Date(rateLimiter.getResetTime(userId));
      toast.error(`Rate limit exceeded. Try again at ${resetTime.toLocaleTimeString()}`);
      return;
    }

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(rejection => 
        `${rejection.file.name}: ${rejection.errors.map((e: any) => e.message).join(', ')}`
      );
      setValidationErrors(errors);
      toast.error('Some files were rejected');
      return;
    }

    // Validate accepted files
    const maxSize = parseFileSize(tool.maxFileSize);
    const validFiles: File[] = [];
    const errors: string[] = [];

    acceptedFiles.forEach(file => {
      const validation = validateFile(file, tool.supportedFormats, maxSize);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.errors.join(', ')}`);
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error(`${errors.length} file(s) failed validation`);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      setValidationErrors([]);
      toast.success(`${validFiles.length} file(s) added successfully`);
    }
  }, [tool.maxFileSize, tool.supportedFormats]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: tool.supportedFormats.reduce((acc, format) => {
      acc[getMimeType(format)] = [format];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: tool.maxFiles || 10,
    maxSize: parseFileSize(tool.maxFileSize)
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) {
      setValidationErrors([]);
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    const userId = getUserId();
    if (!rateLimiter.isAllowed(userId)) {
      toast.error('Rate limit exceeded. Please wait before trying again.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setResult(null);

    const jobId = Math.random().toString(36).substr(2, 9);
    
    try {
      // Add job to store
      addJob({
        id: jobId,
        toolId: tool.id,
        toolName: tool.name,
        files: files.map(f => ({ name: f.name, size: f.size })),
        status: 'processing',
        progress: 0,
        startTime: Date.now()
      });

      // Process the first file (for single file tools) or all files
      const fileToProcess = tool.maxFiles === 1 ? files[0] : files;
      
      // Set up progress tracking
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + Math.random() * 5, 95);
          updateProgress(jobId, newProgress);
          return newProgress;
        });
      }, 200);

      let processedResult;
      
      if (Array.isArray(fileToProcess)) {
        // Handle multiple files (like PDF merge)
        processedResult = await fileProcessor.processFile(
          fileToProcess[0], // Primary file
          tool.id,
          { ...options, additionalFiles: fileToProcess.slice(1) }
        );
      } else {
        // Handle single file
        processedResult = await fileProcessor.processFile(
          fileToProcess,
          tool.id,
          options
        );
      }

      clearInterval(progressInterval);
      
      // Create download URL
      const blob = new Blob([processedResult.buffer], { 
        type: processedResult.mimeType 
      });
      const downloadUrl = URL.createObjectURL(blob);
      
      const finalResult = {
        ...processedResult,
        downloadUrl,
        startTime: Date.now() - 3000 // Simulate processing time
      };
      
      setResult(finalResult);
      setProgress(100);
      updateProgress(jobId, 100, 'completed', finalResult);
      
      toast.success('Processing completed successfully!');
      
    } catch (error) {
      const processingError = error as ProcessingError;
      setError(processingError);
      updateProgress(jobId, 0, 'failed', null, processingError.message);
      toast.error(processingError.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (result?.downloadUrl) {
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started!');
      
      // Clean up URL after download
      setTimeout(() => {
        URL.revokeObjectURL(result.downloadUrl);
      }, 1000);
    }
  };

  const resetInterface = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    setProgress(0);
    setValidationErrors([]);
    setOptions({});
  };

  // Initialize default options
  useEffect(() => {
    if (tool.options) {
      const defaultOptions = tool.options.reduce((acc, option) => {
        acc[option.key] = option.default;
        return acc;
      }, {} as Record<string, any>);
      setOptions(defaultOptions);
    }
  }, [tool.options]);

  const remainingUses = rateLimiter.getRemainingRequests(getUserId());

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <tool.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{tool.name}</h2>
                <p className="text-sm text-gray-600">{tool.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-gray-600">Remaining uses</div>
                <div className="text-lg font-bold text-blue-600">{remainingUses}</div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Tool Info */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">{tool.processingTime}</div>
                <div className="text-xs text-gray-600">Processing Time</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">{tool.maxFileSize}</div>
                <div className="text-xs text-gray-600">Max File Size</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">Secure</div>
                <div className="text-xs text-gray-600">Auto-delete 24h</div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Processing Failed</h4>
                    <p className="text-sm text-red-700 mt-1">{error.message}</p>
                    {error.recoverable && (
                      <button
                        onClick={() => setError(null)}
                        className="text-sm text-red-600 hover:text-red-800 mt-2 underline"
                      >
                        Try again
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900">File Validation Errors</h4>
                    <ul className="text-sm text-orange-700 mt-1 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* File Upload */}
            {!result && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h3>
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    isDragActive && !isDragReject
                      ? 'border-blue-400 bg-blue-50' 
                      : isDragReject
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  
                  <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                    isDragActive && !isDragReject ? 'text-blue-500' : 
                    isDragReject ? 'text-red-500' : 'text-gray-400'
                  }`} />
                  
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    {isDragActive && !isDragReject ? 'Drop your files here' : 
                     isDragReject ? 'Some files are not supported' :
                     'Drag and drop your files here'}
                  </h4>
                  
                  <p className="text-gray-500 mb-4">
                    or click to browse • Max {tool.maxFileSize} • Up to {tool.maxFiles} files
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-2">
                    {tool.supportedFormats.map(format => (
                      <span key={format} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Uploaded Files */}
                {files.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Uploaded Files ({files.length})
                    </h4>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-sm text-gray-500">{formatBytes(file.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tool Options */}
            {tool.options && !result && files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Options
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {tool.options.map(option => (
                    <div key={option.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        {option.label}
                        {option.type === 'select' && (
                          <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
                        )}
                      </label>
                      {option.type === 'select' ? (
                        <select
                          value={options[option.key] || option.default}
                          onChange={(e) => setOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {option.choices?.map(choice => (
                            <option key={choice} value={choice}>{choice}</option>
                          ))}
                        </select>
                      ) : option.type === 'number' ? (
                        <input
                          type="number"
                          value={options[option.key] || option.default}
                          onChange={(e) => setOptions(prev => ({ ...prev, [option.key]: parseInt(e.target.value) }))}
                          min={option.min}
                          max={option.max}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : option.type === 'boolean' ? (
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={options[option.key] || option.default}
                            onChange={(e) => setOptions(prev => ({ ...prev, [option.key]: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">Enable</span>
                        </label>
                      ) : (
                        <input
                          type="text"
                          value={options[option.key] || option.default}
                          onChange={(e) => setOptions(prev => ({ ...prev, [option.key]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing */}
            {isProcessing && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Processing...</h3>
                  <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Please wait while we process your files...
                </p>
              </div>
            )}

            {/* Result */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Processing Complete!</h3>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-900">{result.fileName}</p>
                      <p className="text-sm text-green-700">
                        Size: {formatBytes(result.size)} • 
                        Processing time: {((Date.now() - result.startTime) / 1000).toFixed(1)}s
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={downloadResult}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </motion.button>
                      <button
                        onClick={resetInterface}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>New</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-3 text-xs text-gray-500">
                  <Info className="w-4 h-4" />
                  <span>Files will be automatically deleted after 24 hours for security.</span>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            {!result && (
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleProcess}
                  disabled={files.length === 0 || isProcessing || remainingUses <= 0}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    files.length > 0 && !isProcessing && remainingUses > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : remainingUses <= 0 ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Rate Limit Reached</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Start Processing</span>
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Helper functions
function parseFileSize(sizeStr: string): number {
  const units: Record<string, number> = { 
    KB: 1024, 
    MB: 1024 * 1024, 
    GB: 1024 * 1024 * 1024 
  };
  const match = sizeStr.match(/(\d+)\s*(KB|MB|GB)/i);
  if (match) {
    return parseInt(match[1]) * units[match[2].toUpperCase()];
  }
  return 100 * 1024 * 1024; // Default 100MB
}

function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.webp': 'image/webp',
    '.html': 'text/html',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.xml': 'application/xml'
  };
  return mimeTypes[format] || 'application/octet-stream';
}