'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Shield, 
  Globe, 
  Users, 
  Star, 
  CheckCircle,
  TrendingUp,
  Clock
} from 'lucide-react';

const TrustIndicators: React.FC = () => {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const stats = [
    {
      icon: Users,
      value: '50K+',
      label: 'Active Learners',
      description: 'Students actively monitored across institutions'
    },
    {
      icon: Globe,
      value: '200+',
      label: 'Educational Institutions',
      description: 'Schools and universities trust CodeRed'
    },
    {
      icon: TrendingUp,
      value: '95%',
      label: 'Accuracy Rate',
      description: 'In identifying at-risk learners early'
    },
    {
      icon: Clock,
      value: '24/7',
      label: 'Uptime Guarantee',
      description: 'Reliable monitoring and support'
    }
  ];

  const certifications = [
    {
      icon: Shield,
      title: 'SOC 2 Compliant',
      description: 'Enterprise-grade security standards'
    },
    {
      icon: Award,
      title: 'GDPR Ready',
      description: 'Full compliance with data protection regulations'
    },
    {
      icon: CheckCircle,
      title: 'ISO 27001',
      description: 'Information security management certified'
    },
    {
      icon: Star,
      title: 'WCAG AA',
      description: 'Accessibility standards compliant'
    }
  ];

  const achievements = [
    {
      year: '2024',
      title: 'EdTech Innovation Award',
      organization: 'Global Education Summit',
      description: 'Recognized for breakthrough AI-powered learner analytics'
    },
    {
      year: '2024',
      title: 'Best Learning Platform',
      organization: 'TechCrunch Education',
      description: 'Leading platform for educational risk management'
    },
    {
      year: '2023',
      title: 'AI Excellence Award',
      organization: 'Education Technology Association',
      description: 'Outstanding achievement in educational AI applications'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
            Trusted by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Educational Leaders
            </span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Join thousands of educators who rely on CodeRed to improve learning outcomes 
            and support student success with confidence.
          </motion.p>
        </motion.div>

        {/* Statistics */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-gray-700 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-500">
                  {stat.description}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Certifications */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mb-20"
        >
          <motion.h3
            variants={itemVariants}
            className="text-2xl font-bold text-gray-900 text-center mb-12"
          >
            Security & Compliance Certifications
          </motion.h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <motion.div
                  key={cert.title}
                  variants={itemVariants}
                  className="bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors"
                >
                  <Icon className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {cert.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {cert.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Awards and Recognition */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h3
            variants={itemVariants}
            className="text-2xl font-bold text-gray-900 text-center mb-12"
          >
            Awards & Recognition
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                variants={itemVariants}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    {achievement.year}
                  </div>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {achievement.title}
                </h4>
                <p className="text-sm font-medium text-blue-600 mb-3">
                  {achievement.organization}
                </p>
                <p className="text-sm text-gray-600">
                  {achievement.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-20 text-center"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-8 bg-gray-50 rounded-2xl px-8 py-6"
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">5-Star Support</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustIndicators;