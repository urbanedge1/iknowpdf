import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Download, Settings, Play, Pause, 
  CheckCircle, AlertCircle, FileText, Image, 
  RotateCcw, Zap, Shield, Clock
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Tool } from '../../types/tools';
import { useProcessingStore } from '../../store/processingStore';
import { toast } from 'react-hot-toast';

interface ToolInterfaceProps {
  tool: Tool;
  onClose: () => void;
}

export const ToolInterface: React.FC<ToolInterfaceProps> = ({ tool, onClose }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const { addJob, updateProgress } = useProcessingStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file size
    const maxSize = parseFileSize(tool.maxFileSize);
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} exceeds ${tool.maxFileSize} limit`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  }, [tool.maxFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: tool.supportedFormats.reduce((acc, format) => {
      acc[getMimeType(format)] = [format];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: tool.maxFiles || 10
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

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

      // Simulate processing with progress updates
      const processingTime = getEstimatedProcessingTime(files, tool);
      const updateInterval = processingTime / 20; // 20 updates

      for (let i = 0; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, updateInterval));
        setProgress(i);
        updateProgress(jobId, i);
      }

      // Simulate result generation
      const processedResult = await simulateProcessing(files, tool, options);
      setResult(processedResult);
      
      updateProgress(jobId, 100, 'completed', processedResult);
      toast.success('Processing completed successfully!');
      
    } catch (error) {
      updateProgress(jobId, 0, 'failed', null, error.message);
      toast.error('Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (result) {
      // Create download link
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started!');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                <tool.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{tool.name}</h2>
                <p className="text-sm text-gray-600">{tool.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
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

            {/* File Upload */}
            {!result && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h3>
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                    isDragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  
                  <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                    isDragActive ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    {isDragActive ? 'Drop your files here' : 'Drag and drop your files here'}
                  </h4>
                  
                  <p className="text-gray-500 mb-4">
                    or click to browse • Max {tool.maxFileSize}
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
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tool Options */}
            {tool.options && !result && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Options</h3>
                <div className="grid grid-cols-2 gap-4">
                  {tool.options.map(option => (
                    <div key={option.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {option.label}
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
                  <span className="text-sm text-gray-600">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-blue-500 h-3 rounded-full"
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
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Processing Complete!</h3>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-900">{result.fileName}</p>
                      <p className="text-sm text-green-700">
                        Size: {formatFileSize(result.fileSize)} • 
                        Processing time: {((Date.now() - result.startTime) / 1000).toFixed(1)}s
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={downloadResult}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </motion.button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Files will be automatically deleted after 24 hours for security.
                </p>
              </div>
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
                  disabled={files.length === 0 || isProcessing}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    files.length > 0 && !isProcessing
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
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
  const units = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
  const match = sizeStr.match(/(\d+)\s*(KB|MB|GB)/i);
  if (match) {
    return parseInt(match[1]) * units[match[2].toUpperCase()];
  }
  return 100 * 1024 * 1024; // Default 100MB
}

function getMimeType(format: string): string {
  const mimeTypes = {
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
    '.html': 'text/html',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.avi': 'video/avi',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed'
  };
  return mimeTypes[format] || 'application/octet-stream';
}

function getEstimatedProcessingTime(files: File[], tool: Tool): number {
  const baseTime = 2000; // 2 seconds base
  const sizeMultiplier = files.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024); // MB
  return baseTime + (sizeMultiplier * 100); // 100ms per MB
}

async function simulateProcessing(files: File[], tool: Tool, options: any): Promise<any> {
  // Simulate actual processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    fileName: `processed_${files[0].name}`,
    fileSize: files[0].size * 0.8, // Simulate compression
    downloadUrl: URL.createObjectURL(files[0]), // Simulate download URL
    startTime: Date.now() - 3000 // Simulate start time
  };
}