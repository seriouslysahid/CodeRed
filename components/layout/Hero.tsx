'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Brain, Users, Zap, Target, TrendingUp, Database, Cpu, Shield } from 'lucide-react';
import { Button, EngagementMeter, PulseIndicator, GradientCard, AnimatedCounter, PulseGlow, StatusIndicator } from '@/components/ui';

const Hero: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
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

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Risk Detection',
      description: 'Predict drop-offs before they happen with advanced machine learning algorithms',
      gradient: 'primary',
    },
    {
      icon: Zap,
      title: 'Real-time Nudges',
      description: 'Automatically send personalized reminders and micro-assessments',
      gradient: 'warning',
    },
    {
      icon: Target,
      title: 'Engagement Intelligence',
      description: 'Monitor learner behavior patterns and motivation levels in real-time',
      gradient: 'success',
    },
    {
      icon: TrendingUp,
      title: 'Predictive Analytics',
      description: 'Track engagement trends and predict learning outcomes with precision',
      gradient: 'info',
    },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Enhanced main heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 sm:mb-8 leading-tight"
          >
            <span className="block sm:inline">Next-Gen </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500 block sm:inline animate-pulse-slow">
              Learning Intelligence
            </span>
            <span className="block sm:inline"> Platform</span>
          </motion.h1>

          {/* Enhanced subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0"
          >
            Transform learner engagement with <span className="text-primary font-semibold">AI-powered</span> risk prediction, 
            <span className="text-primary font-semibold"> real-time</span> nudges, and 
            <span className="text-primary font-semibold"> predictive</span> analytics
          </motion.p>

          {/* Enhanced CTA buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 sm:mb-20 px-4 sm:px-0"
          >
            <Link href="/dashboard" className="w-full sm:w-auto">
              <PulseGlow intensity="high" color="blue">
                <Button 
                  size="lg" 
                  className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  touchOptimized={true}
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Launch Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </PulseGlow>
            </Link>
            <Link href="/learners" className="w-full sm:w-auto">
              <PulseGlow intensity="medium" color="green">
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  touchOptimized={true}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Manage Learners
                </Button>
              </PulseGlow>
            </Link>
          </motion.div>

          {/* Enhanced features grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-16 sm:mt-20 px-4 sm:px-0"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="group"
                >
                  <GradientCard
                    gradient={feature.gradient as any}
                    glow={true}
                    animated={true}
                    className="text-white h-full"
                  >
                    <div className="text-center">
                      <PulseGlow intensity="medium" color="blue">
                        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </PulseGlow>
                      <h3 className="text-lg font-bold text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-white/80 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </GradientCard>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Enhanced engagement metrics */}
          <motion.div
            variants={itemVariants}
            className="mt-20 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 px-4 sm:px-0"
          >
            <GradientCard gradient="primary" className="text-white text-center">
              <EngagementMeter value={94} size="lg" label="Active Engagement" />
              <div className="mt-4">
                <StatusIndicator status="online" label="Real-time" size="sm" animated={true} />
              </div>
            </GradientCard>
            
            <GradientCard gradient="success" className="text-white text-center">
              <EngagementMeter value={89} size="lg" label="Retention Rate" />
              <div className="mt-4">
                <StatusIndicator status="online" label="Optimized" size="sm" animated={true} />
              </div>
            </GradientCard>
            
            <GradientCard gradient="warning" className="text-white text-center">
              <EngagementMeter value={96} size="lg" label="AI Accuracy" />
              <div className="mt-4">
                <StatusIndicator status="online" label="Learning" size="sm" animated={true} />
              </div>
            </GradientCard>
          </motion.div>

          {/* System Status */}
          <motion.div
            variants={itemVariants}
            className="mt-16 sm:mt-20"
          >
            <GradientCard gradient="secondary" className="text-white">
              <h3 className="text-xl font-bold text-white mb-6 text-center">System Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center justify-center space-x-3">
                  <Database className="w-6 h-6 text-blue-200" />
                  <div className="text-center">
                    <StatusIndicator status="online" label="Database" size="md" animated={true} />
                    <p className="text-blue-100 text-xs mt-1">Supabase Connected</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <Brain className="w-6 h-6 text-green-200" />
                  <div className="text-center">
                    <StatusIndicator status="online" label="AI Service" size="md" animated={true} />
                    <p className="text-green-100 text-xs mt-1">Gemini Active</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <Shield className="w-6 h-6 text-purple-200" />
                  <div className="text-center">
                    <StatusIndicator status="online" label="Security" size="md" animated={true} />
                    <p className="text-purple-100 text-xs mt-1">Fully Secured</p>
                  </div>
                </div>
              </div>
            </GradientCard>
          </motion.div>

          {/* Live activity indicator */}
          <motion.div
            variants={itemVariants}
            className="mt-12 sm:mt-16 flex justify-center"
          >
            <PulseIndicator size="lg" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;