import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, Star, Clock, CheckCircle } from 'lucide-react';
import { ToolCard } from './ToolCard';
import { allTools, toolCategories } from '../../data/allTools';
import { useToolStore } from '../../store/toolStore';
import { Tool } from '../../types/tools';

export const ToolsGrid: React.FC = () => {
  const { usageStats, incrementUsage, isToolAvailable } = useToolStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'recent'>('name');

  const filteredTools = allTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTools = [...filteredTools].sort((a, b) => {
    switch (sortBy) {
      case 'usage':
        return (usageStats[b.id]?.count || 0) - (usageStats[a.id]?.count || 0);
      case 'recent':
        return (usageStats[b.id]?.lastUsed || 0) - (usageStats[a.id]?.lastUsed || 0);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const groupedTools = toolCategories.reduce((acc, category) => {
    acc[category] = sortedTools.filter(tool => tool.category === category);
    return acc;
  }, {} as Record<string, Tool[]>);

  const handleToolUse = (toolId: string) => {
    if (isToolAvailable(toolId)) {
      incrementUsage(toolId);
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Online Tools Suite
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access our comprehensive collection of online tools. Each tool offers 50 free uses with no registration required.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tools, features, or file types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {toolCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="usage">Most Used</option>
                <option value="recent">Recently Used</option>
              </select>
              
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>{sortedTools.length} tools available</span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                99.9% Uptime
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 text-blue-500 mr-1" />
                &lt;3s Processing
              </span>
              <span className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                50 Free Uses
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tools Display */}
        <AnimatePresence mode="wait">
          {selectedCategory === 'all' ? (
            // Show grouped by category
            <div key="grouped">
              {Object.entries(groupedTools).map(([category, tools]) => (
                tools.length > 0 && (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        {category}
                        <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                          {tools.length} tools
                        </span>
                      </h2>
                    </div>
                    
                    <div className={`grid gap-6 ${
                      viewMode === 'grid' 
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                        : 'grid-cols-1'
                    }`}>
                      {tools.map((tool, index) => (
                        <motion.div
                          key={tool.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ToolCard
                            tool={tool}
                            usageCount={usageStats[tool.id]?.count || 0}
                            isAvailable={isToolAvailable(tool.id)}
                            onUse={() => handleToolUse(tool.id)}
                            viewMode={viewMode}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )
              ))}
            </div>
          ) : (
            // Show filtered tools
            <motion.div
              key="filtered"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory} ({sortedTools.length} tools)
                </h2>
              </div>
              
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {sortedTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ToolCard
                      tool={tool}
                      usageCount={usageStats[tool.id]?.count || 0}
                      isAvailable={isToolAvailable(tool.id)}
                      onUse={() => handleToolUse(tool.id)}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Results */}
        {sortedTools.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};