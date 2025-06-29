import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, Clock, Users, Zap, Shield, 
  CheckCircle, AlertCircle, Info, ArrowRight 
} from 'lucide-react';
import { Tool } from '../../types/tools';
import { ToolInterface } from './ToolInterface';

interface ToolCardProps {
  tool: Tool;
  usageCount: number;
  isAvailable: boolean;
  onUse: () => boolean;
  viewMode: 'grid' | 'list';
}

export const ToolCard: React.FC<ToolCardProps> = ({ 
  tool, 
  usageCount, 
  isAvailable, 
  onUse, 
  viewMode 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInterface, setShowInterface] = useState(false);

  const handleUse = () => {
    if (onUse()) {
      setShowInterface(true);
    }
  };

  const remainingUses = Math.max(0, 50 - usageCount);
  const usagePercentage = (usageCount / 50) * 100;

  const getStatusColor = () => {
    if (!isAvailable) return 'text-red-500 bg-red-50';
    if (remainingUses <= 5) return 'text-orange-500 bg-orange-50';
    return 'text-green-500 bg-green-50';
  };

  const getStatusIcon = () => {
    if (!isAvailable) return <AlertCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                <tool.icon className="w-6 h-6 text-blue-600" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <span>{remainingUses} uses left</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{tool.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {tool.processingTime}
                  </span>
                  <span className="flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    Max {tool.maxFileSize}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {usageCount} uses
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="More info"
              >
                <Info className="w-4 h-4" />
              </button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUse}
                disabled={!isAvailable}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                  isAvailable
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>{isAvailable ? 'Use Tool' : 'Limit Reached'}</span>
                {isAvailable && <ArrowRight className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>

          {/* Usage Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full transition-all duration-300 ${
                  usagePercentage >= 90 ? 'bg-red-500' :
                  usagePercentage >= 70 ? 'bg-orange-500' : 'bg-blue-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>

          {/* Expanded Info */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Supported Formats</h4>
                  <div className="flex flex-wrap gap-1">
                    {tool.supportedFormats.map(format => (
                      <span key={format} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                  <ul className="space-y-1 text-gray-600">
                    {tool.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {showInterface && (
          <ToolInterface
            tool={tool}
            onClose={() => setShowInterface(false)}
          />
        )}
      </>
    );
  }

  // Grid view
  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{remainingUses} left</span>
          </div>
          <div className="text-xs text-gray-500">{usageCount} uses</div>
        </div>

        {/* Tool Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center mb-4 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
          <tool.icon className="w-6 h-6 text-blue-600" />
        </div>
        
        {/* Tool Info */}
        <h3 className="font-semibold text-gray-900 mb-2">{tool.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tool.description}</p>
        
        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {tool.processingTime}
          </span>
          <span className="flex items-center">
            <Shield className="w-3 h-3 mr-1" />
            {tool.maxFileSize}
          </span>
        </div>

        {/* Usage Progress */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full transition-all duration-300 ${
                usagePercentage >= 90 ? 'bg-red-500' :
                usagePercentage >= 70 ? 'bg-orange-500' : 'bg-blue-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleUse();
          }}
          disabled={!isAvailable}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
            isAvailable
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAvailable ? 'Use Tool' : 'Limit Reached'}
        </motion.button>

        {/* Expanded Details */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Supported Formats</h4>
                <div className="flex flex-wrap gap-1">
                  {tool.supportedFormats.map(format => (
                    <span key={format} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {format}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Key Features</h4>
                <ul className="space-y-1">
                  {tool.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center text-xs text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {showInterface && (
        <ToolInterface
          tool={tool}
          onClose={() => setShowInterface(false)}
        />
      )}
    </>
  );
};