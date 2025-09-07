'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface GradientCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'custom';
  customGradient?: string;
  glow?: boolean;
  animated?: boolean;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const GradientCard: React.FC<GradientCardProps> = ({
  children,
  className,
  gradient = 'primary',
  customGradient,
  glow = false,
  animated = false,
  hover = true,
  onClick,
  padding = 'lg',
  rounded = 'xl',
}) => {
  const gradientClasses = {
    primary: 'from-blue-600 via-purple-600 to-indigo-600',
    secondary: 'from-gray-600 via-gray-700 to-gray-800',
    success: 'from-green-500 via-emerald-500 to-teal-500',
    warning: 'from-yellow-500 via-orange-500 to-red-500',
    danger: 'from-red-500 via-pink-500 to-rose-500',
    info: 'from-cyan-500 via-blue-500 to-indigo-500',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const gradientStyle = customGradient || gradientClasses[gradient];

  const cardVariants = {
    initial: { scale: 1, y: 0 },
    hover: { 
      scale: hover ? 1.02 : 1, 
      y: hover ? -4 : 0,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div
      className={clsx(
        'relative overflow-hidden',
        'bg-gradient-to-br',
        gradientStyle,
        roundedClasses[rounded],
        paddingClasses[padding],
        glow && 'shadow-2xl shadow-current/25',
        animated && 'animate-pulse-slow',
        onClick && 'cursor-pointer',
        className
      )}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
    >
      {/* Animated background overlay */}
      {animated && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GradientCard;


