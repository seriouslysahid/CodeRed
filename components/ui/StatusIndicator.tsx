'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'warning' | 'error' | 'loading';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  showLabel?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  animated = true,
  className,
  showLabel = true,
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    loading: 'bg-blue-500',
  };

  const labelClasses = {
    online: 'text-green-600',
    offline: 'text-gray-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    loading: 'text-blue-600',
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    static: {
      scale: 1,
      opacity: 1,
    },
  };

  const loadingVariants = {
    spin: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const renderIndicator = () => {
    if (status === 'loading') {
      return (
        <motion.div
          className={clsx(
            'rounded-full border-2 border-blue-500 border-t-transparent',
            sizeClasses[size]
          )}
          variants={loadingVariants}
          animate={animated ? "spin" : "static"}
        />
      );
    }

    return (
      <motion.div
        className={clsx(
          'rounded-full',
          sizeClasses[size],
          statusClasses[status]
        )}
        variants={pulseVariants}
        animate={animated && status === 'online' ? "pulse" : "static"}
      />
    );
  };

  return (
    <div className={clsx('flex items-center space-x-2', className)}>
      {renderIndicator()}
      {showLabel && label && (
        <span className={clsx('text-sm font-medium', labelClasses[status])}>
          {label}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;


