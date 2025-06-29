import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Crown, Zap, Shield, Users, Star } from 'lucide-react';
import { pricingPlans } from '../data/pricing';
import { useAuthStore } from '../store/authStore';

export const PricingPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();

  const handlePlanSelect = (planId: string) => {
    if (user && planId !== user.plan) {
      // In a real app, this would integrate with payment processing
      updateUser({ plan: planId as any });
    }
  };

  const PlanCard = ({ plan }: { plan: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className={`relative bg-white rounded-2xl p-8 shadow-sm border-2 transition-all duration-300 ${
        plan.popular 
          ? 'border-blue-500 shadow-blue-50 scale-105' 
          : user?.plan === plan.id 
            ? 'border-green-500 shadow-green-50' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
            <Star className="w-4 h-4 mr-1" />
            Most Popular
          </span>
        </div>
      )}
      
      {user?.plan === plan.id && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Current Plan
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          {plan.id === 'premium' && <Crown className="w-8 h-8 text-purple-600 mr-2" />}
          {plan.id === 'pro' && <Zap className="w-8 h-8 text-blue-600 mr-2" />}
          {plan.id === 'free' && <Shield className="w-8 h-8 text-gray-600 mr-2" />}
          <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
        </div>
        
        <div className="mb-2">
          <span className="text-4xl font-bold text-gray-900">
            {plan.price === 0 ? 'Free' : `₹${plan.price}`}
          </span>
          {plan.price > 0 && (
            <span className="text-gray-600 ml-1">/{plan.period}</span>
          )}
        </div>
        <p className="text-gray-600">{plan.description}</p>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature: string, index: number) => (
          <li key={index} className="flex items-center text-gray-700">
            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
            {feature}
          </li>
        ))}
        {plan.limitations.map((limitation: string, index: number) => (
          <li key={index} className="flex items-center text-gray-400">
            <X className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0" />
            {limitation}
          </li>
        ))}
      </ul>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handlePlanSelect(plan.id)}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
          user?.plan === plan.id
            ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
            : plan.popular
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
              : plan.id === 'premium'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-900 hover:bg-gray-800 text-white'
        }`}
        disabled={user?.plan === plan.id}
      >
        {user?.plan === plan.id ? 'Current Plan' : `Choose ${plan.name}`}
      </motion.button>
    </motion.div>
  );

  const features = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'AES-256 encryption and SOC 2 compliance'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process files in under 30 seconds'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share and collaborate on documents'
    },
    {
      icon: Crown,
      title: 'Premium Support',
      description: '24/7 priority customer support'
    }
  ];

  const faqs = [
    {
      question: 'Can I change my plan anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
    },
    {
      question: 'What happens to my files after processing?',
      answer: 'All files are automatically deleted after 2 hours for security. You can download them before then.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans.'
    },
    {
      question: 'Is there a limit on file size?',
      answer: 'Free: 50MB, Pro: 100MB, Premium: Unlimited. All plans support common PDF operations.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Flexible pricing for individuals, professionals, and teams. 
            Start free and upgrade when you need more power.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PlanCard plan={plan} />
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            All Plans Include
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who trust iknowpdf for their PDF needs
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Start Free Trial
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};