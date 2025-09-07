'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface PulseGlowProps {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'custom';
  customColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
}

const PulseGlow: React.FC<PulseGlowProps> = ({
  children,
  intensity = 'medium',
  color = 'blue',
  customColor,
  size = 'md',
  className,
  disabled = false,
}) => {
  const intensityClasses = {
    low: 'shadow-lg',
    medium: 'shadow-xl',
    high: 'shadow-2xl',
  };

  const colorClasses = {
    blue: 'shadow-blue-500/50',
    green: 'shadow-green-500/50',
    red: 'shadow-red-500/50',
    yellow: 'shadow-yellow-500/50',
    purple: 'shadow-purple-500/50',
  };

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const glowVariants = {
    pulse: {
      boxShadow: [
        `0 0 20px ${customColor || 'rgba(59, 130, 246, 0.5)'}`,
        `0 0 40px ${customColor || 'rgba(59, 130, 246, 0.8)'}`,
        `0 0 20px ${customColor || 'rgba(59, 130, 246, 0.5)'}`,
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    static: {
      boxShadow: `0 0 20px ${customColor || 'rgba(59, 130, 246, 0.5)'}`,
    },
  };

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={clsx(
        'relative',
        sizeClasses[size],
        className
      )}
      variants={glowVariants}
      animate="pulse"
    >
      {children}
    </motion.div>
  );
};

export default PulseGlow;


