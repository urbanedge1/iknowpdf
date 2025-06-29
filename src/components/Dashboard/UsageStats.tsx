import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Clock, Zap, 
  CheckCircle, AlertCircle, Users, Globe 
} from 'lucide-react';
import { useToolStore } from '../../store/toolStore';
import { useProcessingStore } from '../../store/processingStore';

export const UsageStats: React.FC = () => {
  const { usageStats } = useToolStore();
  const { jobs } = useProcessingStore();

  const totalUsage = Object.values(usageStats).reduce((acc, stat) => acc + stat.count, 0);
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const failedJobs = jobs.filter(job => job.status === 'failed').length;
  const successRate = totalUsage > 0 ? ((completedJobs / totalUsage) * 100).toFixed(1) : '100';

  const stats = [
    {
      label: 'Total Tools Used',
      value: totalUsage,
      icon: Zap,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      change: '+12%'
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      change: '+2.1%'
    },
    {
      label: 'Processing Time',
      value: '< 30s',
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      change: '-15%'
    },
    {
      label: 'Active Users',
      value: '500K+',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      change: '+8.2%'
    }
  ];

  const topTools = Object.entries(usageStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([toolId, stats]) => ({
      id: toolId,
      name: toolId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      usage: stats.count,
      percentage: (stats.count / totalUsage) * 100
    }));

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last week</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Usage Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Most Used Tools</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {topTools.map((tool, index) => (
              <div key={tool.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tool.name}</p>
                    <p className="text-sm text-gray-500">{tool.usage} uses</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${tool.percentage}%` }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{tool.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-900">All Systems Operational</span>
              </div>
              <span className="text-sm text-green-600">99.9% Uptime</span>
            </div>
            
            <div className="space-y-3">
              {[
                { service: 'File Processing', status: 'operational', latency: '< 30s' },
                { service: 'API Gateway', status: 'operational', latency: '< 100ms' },
                { service: 'Storage System', status: 'operational', latency: '< 50ms' },
                { service: 'Security Layer', status: 'operational', latency: '< 10ms' }
              ].map((item) => (
                <div key={item.service} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{item.service}</span>
                  </div>
                  <span className="text-sm text-gray-500">{item.latency}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-3">
          {jobs.slice(0, 5).map((job, index) => (
            <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  job.status === 'completed' ? 'bg-green-500' :
                  job.status === 'failed' ? 'bg-red-500' :
                  job.status === 'processing' ? 'bg-blue-500' : 'bg-gray-400'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">{job.toolName}</p>
                  <p className="text-sm text-gray-500">
                    {job.files.length} file{job.files.length !== 1 ? 's' : ''} • 
                    {new Date(job.startTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${
                  job.status === 'completed' ? 'text-green-600' :
                  job.status === 'failed' ? 'text-red-600' :
                  job.status === 'processing' ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {job.status === 'processing' ? `${job.progress}%` : job.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};