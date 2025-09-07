'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface EngagementMeterProps {
  value: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export const EngagementMeter: React.FC<EngagementMeterProps> = ({
  value,
  label = 'Engagement',
  size = 'md',
  showPercentage = true,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-16 h-16',
          stroke: 'stroke-1',
          text: 'text-xs'
        };
      case 'md':
        return {
          container: 'w-24 h-24',
          stroke: 'stroke-2',
          text: 'text-sm'
        };
      case 'lg':
        return {
          container: 'w-32 h-32',
          stroke: 'stroke-3',
          text: 'text-base'
        };
      default:
        return {
          container: 'w-24 h-24',
          stroke: 'stroke-2',
          text: 'text-sm'
        };
    }
  };

  const getColor = (val: number) => {
    if (val >= 80) return '#10b981'; // green
    if (val >= 60) return '#f59e0b'; // yellow
    if (val >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const sizeClasses = getSizeClasses();
  const radius = size === 'sm' ? 30 : size === 'md' ? 40 : 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`relative ${sizeClasses.container}`}>
        <svg
          className="transform -rotate-90"
          width={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
          height={size === 'sm' ? 64 : size === 'md' ? 96 : 128}
        >
          {/* Background circle */}
          <circle
            cx={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
            cy={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-muted/20"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
            cy={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
            r={radius}
            stroke={getColor(value)}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="drop-shadow-sm"
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center"
          >
            {showPercentage && (
              <div className={`font-bold text-foreground ${sizeClasses.text}`}>
                {Math.round(value)}%
              </div>
            )}
          </motion.div>
        </div>
      </div>
      
      {label && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className={`text-muted-foreground font-medium mt-2 ${sizeClasses.text}`}
        >
          {label}
        </motion.div>
      )}
    </div>
  );
};
