import React from 'react';
import { motion } from 'framer-motion';
import { UsageStats } from '../components/Dashboard/UsageStats';
import { BarChart3, TrendingUp, Users, Globe } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor your tool usage, performance metrics, and system status
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">All Systems Operational</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Usage Stats Component */}
        <UsageStats />
      </div>
    </div>
  );
};