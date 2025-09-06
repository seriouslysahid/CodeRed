'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Sparkles, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui';
import Link from 'next/link';

const CallToAction: React.FC = () => {
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

  const benefits = [
    'Setup in under 5 minutes',
    'No credit card required',
    'Full access to all features',
    '24/7 customer support',
    'Cancel anytime'
  ];

  const quickActions = [
    {
      icon: BarChart3,
      title: 'Explore Dashboard',
      description: 'See real-time learner analytics and risk insights',
      href: '/dashboard',
      color: 'from-blue-500 to-blue-600',
      buttonText: 'View Dashboard'
    },
    {
      icon: Users,
      title: 'Browse Learners',
      description: 'Discover learner profiles and engagement metrics',
      href: '/learners',
      color: 'from-green-500 to-green-600',
      buttonText: 'View Learners'
    },
    {
      icon: Sparkles,
      title: 'Try AI Nudging',
      description: 'Experience personalized AI-generated messages',
      href: '/dashboard',
      color: 'from-purple-500 to-purple-600',
      buttonText: 'Generate Nudge'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Main CTA Section */}
          <div className="text-center mb-16">
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
            >
              Ready to Transform{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                Learning Outcomes?
              </span>
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl text-blue-100 max-w-3xl mx-auto mb-8"
            >
              Join thousands of educators who are already using CodeRed to identify at-risk learners 
              and provide personalized support that makes a real difference.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 group">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10">
                  Schedule Demo
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center items-center gap-6 text-blue-200"
            >
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Or Explore CodeRed Right Now
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.title}
                    variants={itemVariants}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {action.title}
                    </h4>
                    <p className="text-blue-200 text-sm mb-4">
                      {action.description}
                    </p>
                    <Link href={action.href}>
                      <Button variant="ghost" size="sm" className="text-white border-white/30 hover:bg-white/10 w-full">
                        {action.buttonText}
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Final CTA with urgency */}
          <motion.div
            variants={itemVariants}
            className="text-center bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-semibold">
                🚀 Limited Time: Free Setup & Onboarding
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Don't Let At-Risk Learners Fall Behind
            </h3>
            <p className="text-blue-200 mb-6 max-w-2xl mx-auto">
              Every day without early intervention is a missed opportunity. Start identifying 
              and supporting at-risk learners today with CodeRed's proven AI platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 group">
                  Get Started Now
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <div className="text-blue-300 text-sm self-center">
                No commitment • Instant access • Full features
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            variants={itemVariants}
            className="mt-12 text-center"
          >
            <p className="text-blue-200 text-sm mb-4">
              Questions? Our education specialists are here to help.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-blue-300">
              <a href="mailto:support@codered.com" className="hover:text-white transition-colors">
                support@codered.com
              </a>
              <span className="hidden sm:block">•</span>
              <a href="tel:+1-555-0123" className="hover:text-white transition-colors">
                +1 (555) 012-3456
              </a>
              <span className="hidden sm:block">•</span>
              <Link href="/contact" className="hover:text-white transition-colors">
                Live Chat Support
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;