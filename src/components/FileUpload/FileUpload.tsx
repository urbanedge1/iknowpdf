import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFileStore } from '../../store/fileStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
  onFilesUploaded?: (files: any[]) => void;
  maxFiles?: number;
  accept?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesUploaded, 
  maxFiles = 10,
  accept = ['.pdf']
}) => {
  const { files, uploadFile, removeFile, isUploading } = useFileStore();
  const { user } = useAuthStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast.error('Please sign in to upload files');
      return;
    }

    // Check file size limits based on plan
    const maxSize = user.plan === 'free' ? 50 * 1024 * 1024 : 
                   user.plan === 'pro' ? 100 * 1024 * 1024 : 
                   Infinity;

    for (const file of acceptedFiles) {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} exceeds ${user.plan === 'free' ? '50MB' : '100MB'} limit`);
        continue;
      }

      try {
        const uploadedFile = await uploadFile(file);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (onFilesUploaded) {
      onFilesUploaded(files);
    }
  }, [uploadFile, user, files, onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': accept
    },
    maxFiles,
    disabled: isUploading
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMaxSizeText = () => {
    if (!user) return '';
    switch (user.plan) {
      case 'free': return 'Up to 50MB';
      case 'pro': return 'Up to 100MB';
      case 'premium': return 'Unlimited size';
      default: return '';
    }
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <motion.div
          animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
          className="flex flex-col items-center"
        >
          <Upload className={`w-16 h-16 mb-4 transition-colors ${
            isDragActive ? 'text-blue-500' : 'text-gray-400'
          }`} />
          
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {isDragActive ? 'Drop your files here' : 'Drag and drop your PDF files here'}
          </h3>
          
          <p className="text-gray-500 mb-4">
            or click to browse • {getMaxSizeText()}
          </p>
          
          <button
            type="button"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Choose Files'}
          </button>
        </motion.div>
      </div>

      {/* Plan Limitation Warning */}
      {user?.plan === 'free' && (
        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800">
                <strong>Free Plan:</strong> {user.tasksUsed}/{user.tasksLimit} tasks used today.
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1">
                Upgrade for unlimited tasks →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Uploaded Files ({files.length})
            </h4>
            
            <div className="space-y-3">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.status}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.status === 'uploading' && (
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};