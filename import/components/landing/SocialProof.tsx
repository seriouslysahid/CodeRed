'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import Link from 'next/link';

const SocialProof: React.FC = () => {
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

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Dean of Academic Affairs',
      institution: 'Metropolitan University',
      avatar: '/api/placeholder/64/64',
      rating: 5,
      quote: 'CodeRed has revolutionized how we identify and support at-risk students. The AI-powered insights are incredibly accurate, and we\'ve seen a 40% improvement in student retention since implementation.',
      metrics: {
        improvement: '40%',
        metric: 'Student Retention'
      }
    },
    {
      name: 'Prof. Michael Rodriguez',
      role: 'Director of Online Learning',
      institution: 'TechEd Institute',
      avatar: '/api/placeholder/64/64',
      rating: 5,
      quote: 'The personalized nudging system is a game-changer. Students receive exactly the motivation they need at the right time. Our engagement rates have never been higher.',
      metrics: {
        improvement: '65%',
        metric: 'Engagement Rate'
      }
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Head of Student Success',
      institution: 'Global Learning Academy',
      avatar: '/api/placeholder/64/64',
      rating: 5,
      quote: 'The real-time analytics dashboard gives us unprecedented visibility into student progress. We can intervene early and make data-driven decisions that truly impact learning outcomes.',
      metrics: {
        improvement: '50%',
        metric: 'Early Intervention'
      }
    }
  ];

  const caseStudies = [
    {
      institution: 'Stanford Online',
      challenge: 'High dropout rates in MOOC courses',
      solution: 'Implemented CodeRed\'s AI risk detection',
      result: '60% reduction in course abandonment',
      students: '15,000+',
      timeframe: '6 months'
    },
    {
      institution: 'MIT OpenCourseWare',
      challenge: 'Identifying struggling learners at scale',
      solution: 'Deployed personalized nudging system',
      result: '45% increase in course completion',
      students: '25,000+',
      timeframe: '8 months'
    },
    {
      institution: 'Harvard Extension',
      challenge: 'Limited instructor-student interaction',
      solution: 'Automated AI-powered student support',
      result: '70% improvement in student satisfaction',
      students: '8,000+',
      timeframe: '4 months'
    }
  ];

  const logos = [
    { name: 'Stanford', width: 120 },
    { name: 'MIT', width: 80 },
    { name: 'Harvard', width: 100 },
    { name: 'Berkeley', width: 110 },
    { name: 'Carnegie Mellon', width: 140 },
    { name: 'Georgia Tech', width: 130 }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
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
            Loved by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Educators Worldwide
            </span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            See how leading educational institutions are transforming student outcomes 
            with CodeRed's AI-powered platform.
          </motion.p>
        </motion.div>

        {/* University Logos */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mb-20"
        >
          <motion.p
            variants={itemVariants}
            className="text-center text-gray-500 mb-8 font-medium"
          >
            Trusted by leading educational institutions
          </motion.p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {logos.map((logo, index) => (
              <motion.div
                key={logo.name}
                variants={itemVariants}
                className="bg-white rounded-lg px-6 py-4 shadow-sm border border-gray-200"
                style={{ width: logo.width }}
              >
                <div className="text-center font-bold text-gray-700 text-sm">
                  {logo.name}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      {testimonial.institution}
                    </div>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {testimonial.quote}
                </p>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {testimonial.metrics.improvement}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">
                    {testimonial.metrics.metric}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Case Studies */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mb-16"
        >
          <motion.h3
            variants={itemVariants}
            className="text-2xl font-bold text-gray-900 text-center mb-12"
          >
            Success Stories & Case Studies
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.institution}
                variants={itemVariants}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  {study.institution}
                </h4>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Challenge:</span>
                    <p className="text-gray-600 mt-1">{study.challenge}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Solution:</span>
                    <p className="text-gray-600 mt-1">{study.solution}</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3">
                    <span className="font-medium text-green-700">Result:</span>
                    <p className="text-green-600 mt-1 font-semibold">{study.result}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{study.students}</div>
                    <div className="text-xs text-gray-500">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600">{study.timeframe}</div>
                    <div className="text-xs text-gray-500">Timeline</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="text-center"
        >
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
          >
            <h3 className="text-2xl font-bold mb-4">
              Join These Leading Institutions
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Start your journey towards better learning outcomes with CodeRed's 
              proven AI-powered platform trusted by educators worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="group">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10">
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;