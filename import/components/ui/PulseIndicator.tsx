'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PulseIndicatorProps {
  status: 'active' | 'at-risk' | 'inactive' | 'engaged';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({ 
  status, 
  size = 'md',
  className = '' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-500',
          pulseColor: 'bg-green-400',
          label: 'Active'
        };
      case 'at-risk':
        return {
          color: 'bg-red-500',
          pulseColor: 'bg-red-400',
          label: 'At Risk'
        };
      case 'inactive':
        return {
          color: 'bg-gray-500',
          pulseColor: 'bg-gray-400',
          label: 'Inactive'
        };
      case 'engaged':
        return {
          color: 'bg-blue-500',
          pulseColor: 'bg-blue-400',
          label: 'Engaged'
        };
      default:
        return {
          color: 'bg-gray-500',
          pulseColor: 'bg-gray-400',
          label: 'Unknown'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'md':
        return 'w-3 h-3';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  const config = getStatusConfig();
  const sizeClasses = getSizeClasses();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <motion.div
          className={`${sizeClasses} ${config.color} rounded-full`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={`absolute inset-0 ${sizeClasses} ${config.pulseColor} rounded-full`}
          animate={{
            scale: [1, 2, 3],
            opacity: [0.7, 0.3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
    </div>
  );
};
