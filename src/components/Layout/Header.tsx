import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Menu, X, Home, Wrench, BarChart3, 
  Shield, Clock, Star, Users, Globe
} from 'lucide-react';
import { useToolStore } from '../../store/toolStore';
import { useProcessingStore } from '../../store/processingStore';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { usageStats } = useToolStore();
  const { getActiveJobs } = useProcessingStore();

  const totalUsage = Object.values(usageStats).reduce((acc, stat) => acc + stat.count, 0);
  const activeJobs = getActiveJobs();

  const navigation = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 }
  ];

  const stats = [
    { label: 'Tools Used', value: totalUsage, icon: Zap },
    { label: 'Processing', value: activeJobs.length, icon: Clock },
    { label: 'Uptime', value: '99.9%', icon: Shield },
    { label: 'Users', value: '500K+', icon: Users }
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center cursor-pointer"
            onClick={() => setActiveSection('home')}
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ToolSuite Pro
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeSection === item.id 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Stats */}
          <div className="hidden lg:flex items-center space-x-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center space-x-1 text-sm">
                  <stat.icon className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900">{stat.value}</span>
                </div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <button onClick={() => setIsMenuOpen(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <nav className="space-y-4">
                  {navigation.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center space-x-3 w-full text-left py-3 px-4 rounded-lg transition-colors ${
                        activeSection === item.id 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
                
                <div className="mt-8 pt-8 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat) => (
                      <div key={stat.label} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center space-x-1 mb-1">
                          <stat.icon className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-gray-900">{stat.value}</span>
                        </div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};