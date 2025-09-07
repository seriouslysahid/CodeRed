'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Shield, 
  Clock, 
  Users2,
  BarChart3,
  MessageSquare,
  Zap
} from 'lucide-react';

const FeaturesShowcase: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Risk Detection',
      description: 'Advanced machine learning algorithms analyze learner behavior patterns, quiz performance, and engagement metrics to identify at-risk students before they fall behind.',
      color: 'from-blue-500 to-blue-600',
      benefits: ['95% accuracy rate', 'Early intervention', 'Predictive analytics']
    },
    {
      icon: MessageSquare,
      title: 'Personalized Nudging System',
      description: 'Generate contextual, encouraging messages tailored to each learner\'s specific situation using AI-powered natural language processing.',
      color: 'from-green-500 to-green-600',
      benefits: ['Real-time streaming', 'Contextual messaging', 'Motivational content']
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Analytics Dashboard',
      description: 'Visualize learner progress, risk distribution, and engagement trends with interactive charts and real-time data updates.',
      color: 'from-purple-500 to-purple-600',
      benefits: ['Real-time insights', 'Interactive charts', 'Progress tracking']
    },
    {
      icon: Users2,
      title: 'Efficient Learner Management',
      description: 'Streamlined interface for tracking multiple learners with advanced filtering, search capabilities, and bulk action support.',
      color: 'from-orange-500 to-orange-600',
      benefits: ['Bulk operations', 'Advanced filtering', 'Quick actions']
    },
    {
      icon: Target,
      title: 'Precision Targeting',
      description: 'Focus your intervention efforts where they matter most with deterministic risk scoring and priority-based learner ranking.',
      color: 'from-red-500 to-red-600',
      benefits: ['Risk prioritization', 'Targeted interventions', 'Resource optimization']
    },
    {
      icon: Zap,
      title: 'Lightning-Fast Performance',
      description: 'Built on serverless architecture with cursor-based pagination and intelligent caching for optimal performance at scale.',
      color: 'from-yellow-500 to-yellow-600',
      benefits: ['Sub-second response', 'Infinite scroll', 'Auto-scaling']
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          >
            Powerful Features for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Educational Excellence
            </span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Discover how CodeRed transforms educational outcomes with cutting-edge AI technology 
            and intuitive design that puts learner success at the center.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional feature highlights */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center"
          >
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Security</h3>
            <p className="text-gray-600 text-sm">
              Bank-grade security with data encryption, secure API endpoints, and compliance-ready infrastructure.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center"
          >
            <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Monitoring</h3>
            <p className="text-gray-600 text-sm">
              Continuous learner monitoring with real-time alerts and automated risk assessment updates.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center"
          >
            <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Proven Results</h3>
            <p className="text-gray-600 text-sm">
              40% improvement in learner engagement and 60% reduction in dropout rates across institutions.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesShowcase;