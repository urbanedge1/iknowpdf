import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Zap, Cloud, Users, Play, ArrowRight, Star, 
  CheckCircle, Clock, Globe, Wrench, BarChart3, Award
} from 'lucide-react';

interface HomePageProps {
  setActiveSection: (section: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setActiveSection }) => {
  const features = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your files are encrypted and automatically deleted after 24 hours. We never store your data permanently.',
      color: 'from-blue-100 to-indigo-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process files up to 100MB in under 30 seconds with our optimized cloud infrastructure.',
      color: 'from-green-100 to-emerald-100',
      iconColor: 'text-green-600'
    },
    {
      icon: Cloud,
      title: 'No Registration',
      description: 'Start using our tools immediately. 50 free uses per tool without any signup required.',
      color: 'from-purple-100 to-pink-100',
      iconColor: 'text-purple-600'
    },
    {
      icon: Globe,
      title: '99.9% Uptime',
      description: 'Reliable service with automated scaling and monitoring to ensure tools are always available.',
      color: 'from-orange-100 to-red-100',
      iconColor: 'text-orange-600'
    }
  ];

  const stats = [
    { number: '50+', label: 'Professional Tools' },
    { number: '500K+', label: 'Happy Users' },
    { number: '99.9%', label: 'Uptime' },
    { number: '< 30s', label: 'Processing Time' }
  ];

  const toolCategories = [
    {
      name: 'File Conversion',
      description: 'Convert between PDF, Word, Excel, PowerPoint, and image formats',
      icon: '🔄',
      count: 12
    },
    {
      name: 'PDF Tools',
      description: 'Merge, split, compress, protect, and edit PDF documents',
      icon: '📄',
      count: 8
    },
    {
      name: 'Image Tools',
      description: 'Resize, compress, crop, rotate, and convert images',
      icon: '🖼️',
      count: 6
    },
    {
      name: 'Audio & Video',
      description: 'Convert, compress, and edit audio and video files',
      icon: '🎵',
      count: 7
    },
    {
      name: 'Data Tools',
      description: 'Convert between CSV, JSON, Excel, and other data formats',
      icon: '📊',
      count: 5
    },
    {
      name: 'Utilities',
      description: 'QR codes, password generator, hash calculator, and more',
      icon: '🛠️',
      count: 8
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Manager',
      content: 'This tool suite has streamlined our document workflow. The batch processing feature saves us hours every week.',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'David Chen',
      role: 'Freelance Designer',
      content: 'The image tools are incredibly intuitive. I can make quick edits without expensive software.',
      rating: 5,
      avatar: '👨‍🎨'
    },
    {
      name: 'Maria Rodriguez',
      role: 'Legal Assistant',
      content: 'The PDF security features give us confidence when handling sensitive legal documents.',
      rating: 5,
      avatar: '👩‍⚖️'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <Award className="w-4 h-4 mr-2" />
            50+ Professional Tools • No Registration Required
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Complete
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
              Online Tool Suite
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Access 50+ professional online tools for file conversion, PDF editing, image processing, 
            and more. Fast, secure, and completely free to use.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection('tools')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Wrench className="w-5 h-5 mr-2" />
              Explore All Tools
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection('dashboard')}
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              View Dashboard
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="text-center group"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tool Categories */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Tool Categories
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for professional file processing and conversion
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {toolCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setActiveSection('tools')}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{category.icon}</div>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {category.count} tools
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Professionals Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about our tool suite
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Boost Your Productivity?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join 500,000+ users who trust our professional tool suite for their daily tasks
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection('tools')}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg flex items-center justify-center"
              >
                <Wrench className="w-5 h-5 mr-2" />
                Start Using Tools
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection('dashboard')}
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                View Analytics
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};