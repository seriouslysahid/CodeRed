'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Brain, Users, Zap, Target, TrendingUp } from 'lucide-react';
import { Button, EngagementMeter, PulseIndicator } from '@/components/ui';

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
      title: 'Real-time Risk Detection',
      description: 'Predict drop-offs before they happen with AI-powered analytics',
    },
    {
      icon: Zap,
      title: 'Auto-triggered Nudges',
      description: 'Automatically send reminders, micro-assessments, and peer challenges',
    },
    {
      icon: Target,
      title: 'Engagement Intelligence',
      description: 'Monitor learner behavior patterns and motivation levels',
    },
    {
      icon: TrendingUp,
      title: 'Retention Analytics',
      description: 'Track engagement trends and predict learning outcomes',
    },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight"
          >
            <span className="block sm:inline">Engagement & Retention </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 block sm:inline">
              Intelligence Layer
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0"
          >
            Real-time learner engagement dashboard that predicts drop-offs and auto-triggers personalized nudges to keep learners motivated.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-4 sm:px-0"
          >
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="group w-full sm:w-auto"
                touchOptimized={true}
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/learners" className="w-full sm:w-auto">
              <Button 
                variant="secondary" 
                size="lg"
                className="w-full sm:w-auto"
                touchOptimized={true}
              >
                View Learners
              </Button>
            </Link>
          </motion.div>

          {/* Features grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-12 sm:mt-16 px-4 sm:px-0"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="bg-card/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-sm border border-border hover:shadow-lg hover:scale-105 transition-all duration-200 active:scale-95 touch-manipulation group card-hover"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center mb-3 sm:mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-2 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed text-center">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Engagement Metrics */}
          <motion.div
            variants={itemVariants}
            className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 px-4 sm:px-0"
          >
            <div className="flex flex-col items-center">
              <EngagementMeter value={87} size="md" label="Active Engagement" />
            </div>
            <div className="flex flex-col items-center">
              <EngagementMeter value={92} size="md" label="Retention Rate" />
            </div>
            <div className="flex flex-col items-center">
              <EngagementMeter value={78} size="md" label="Nudge Success" />
            </div>
          </motion.div>

          {/* Live Status Indicators */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex flex-wrap justify-center items-center gap-6 px-4 sm:px-0"
          >
            <PulseIndicator status="engaged" size="md" />
            <PulseIndicator status="active" size="md" />
            <PulseIndicator status="at-risk" size="md" />
            <div className="text-sm text-muted-foreground">
              Real-time learner status monitoring
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;