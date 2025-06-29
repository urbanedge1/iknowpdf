import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Download, X } from 'lucide-react';
import { useFileStore } from '../../store/fileStore';
import { ProcessingJob } from '../../types';

export const ProcessingQueue: React.FC = () => {
  const { jobs } = useFileStore();

  if (jobs.length === 0) return null;

  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (job: ProcessingJob) => {
    switch (job.status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return `Processing... ${Math.round(job.progress)}%`;
      case 'error':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-96 overflow-hidden bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Processing Queue</h3>
        <p className="text-sm text-gray-500">{jobs.length} task{jobs.length !== 1 ? 's' : ''}</p>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        <AnimatePresence>
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 border-b border-gray-50 last:border-b-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getStatusIcon(job.status)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 capitalize">
                      {job.tool.replace('-', ' ')}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {job.files[0]?.name}
                      {job.files.length > 1 && ` +${job.files.length - 1} more`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {getStatusText(job)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {job.status === 'completed' && job.result && (
                    <button
                      onClick={() => {
                        // Simulate download
                        const link = document.createElement('a');
                        link.href = job.result.downloadUrl;
                        link.download = job.result.fileName;
                        link.click();
                      }}
                      className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              {job.status === 'processing' && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${job.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};