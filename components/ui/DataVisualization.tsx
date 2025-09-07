'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface DataVisualizationProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
    percentage?: number;
  }>;
  type?: 'bar' | 'pie' | 'line' | 'area';
  animated?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  showPercentages?: boolean;
  className?: string;
  height?: number;
  colors?: string[];
}

const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  type = 'bar',
  animated = true,
  showLabels = true,
  showValues = true,
  showPercentages = true,
  className,
  height = 200,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  const barVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: (i: number) => ({
      height: `${(data[i].value / maxValue) * 100}%`,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: i * 0.1,
        ease: "easeOut",
      },
    }),
  };

  const pieVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  const renderBarChart = () => (
    <div className="flex items-end justify-between h-full space-x-2">
      {data.map((item, index) => (
        <div key={item.label} className="flex flex-col items-center flex-1">
          <motion.div
            className={clsx(
              'w-full rounded-t-lg relative',
              item.color || colors[index % colors.length]
            )}
            style={{ backgroundColor: item.color || colors[index % colors.length] }}
            variants={barVariants}
            initial="hidden"
            animate={animated ? "visible" : "hidden"}
            custom={index}
          />
          {showLabels && (
            <div className="mt-2 text-xs text-gray-600 text-center">
              {item.label}
            </div>
          )}
          {showValues && (
            <div className="text-xs font-semibold text-gray-800">
              {item.value}
            </div>
          )}
          {showPercentages && (
            <div className="text-xs text-gray-500">
              {((item.value / totalValue) * 100).toFixed(1)}%
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderPieChart = () => {
    let cumulativePercentage = 0;
    
    return (
      <div className="relative w-full h-full">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = (item.value / totalValue) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            
            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;
            
            const largeArcFlag = percentage > 50 ? 1 : 0;
            
            const x1 = 50 + 40 * Math.cos(startAngleRad);
            const y1 = 50 + 40 * Math.sin(startAngleRad);
            const x2 = 50 + 40 * Math.cos(endAngleRad);
            const y2 = 50 + 40 * Math.sin(endAngleRad);
            
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z',
            ].join(' ');
            
            cumulativePercentage += percentage;
            
            return (
              <motion.path
                key={item.label}
                d={pathData}
                fill={item.color || colors[index % colors.length]}
                variants={pieVariants}
                initial="hidden"
                animate={animated ? "visible" : "hidden"}
                transition={{ delay: index * 0.1 }}
              />
            );
          })}
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">
              {totalValue}
            </div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>
      </div>
    );
  };

  const renderLineChart = () => (
    <div className="relative w-full h-full">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.polyline
          points={data.map((item, index) => 
            `${(index / (data.length - 1)) * 100},${100 - (item.value / maxValue) * 100}`
          ).join(' ')}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={animated ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Data points */}
        {data.map((item, index) => (
          <motion.circle
            key={item.label}
            cx={(index / (data.length - 1)) * 100}
            cy={100 - (item.value / maxValue) * 100}
            r="2"
            fill="#3B82F6"
            initial={{ scale: 0 }}
            animate={animated ? { scale: 1 } : { scale: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          />
        ))}
      </svg>
    </div>
  );

  const renderAreaChart = () => (
    <div className="relative w-full h-full">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          d={`M 0,100 ${data.map((item, index) => 
            `L ${(index / (data.length - 1)) * 100},${100 - (item.value / maxValue) * 100}`
          ).join(' ')} L 100,100 Z`}
          fill="url(#areaGradient)"
          initial={{ pathLength: 0 }}
          animate={animated ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'line':
        return renderLineChart();
      case 'area':
        return renderAreaChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div 
      className={clsx('w-full', className)}
      style={{ height: `${height}px` }}
    >
      {renderChart()}
    </div>
  );
};

export default DataVisualization;


