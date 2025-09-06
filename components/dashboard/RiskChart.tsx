'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Users } from 'lucide-react';
import { Card, Badge, Skeleton } from '@/components/ui';
import { useRiskDistribution } from '@/hooks';
import { formatPercentage } from '@/lib/utils';
import type { RiskDistribution } from '@/lib/types';

export interface RiskChartProps {
  className?: string;
  showDetails?: boolean;
  chartType?: 'pie' | 'bar';
}

const RISK_COLORS = {
  high: '#ef4444',    // red-500
  medium: '#f59e0b',  // yellow-500
  low: '#10b981',     // green-500
};

const RiskChart: React.FC<RiskChartProps> = ({
  className,
  showDetails = true,
  chartType = 'pie',
}) => {
  const { data: riskData, isLoading, error } = useRiskDistribution();

  if (isLoading) {
    return (
      <Card className={className} padding="md">
        <div className="space-y-4">
          <Skeleton height="1.5rem" width="60%" />
          <Skeleton height="200px" />
          {showDetails && (
            <div className="grid grid-cols-3 gap-4">
              <Skeleton height="4rem" />
              <Skeleton height="4rem" />
              <Skeleton height="4rem" />
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (error || !riskData) {
    return (
      <Card className={className} padding="md">
        <div className="text-center py-8">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 text-sm">Failed to load risk distribution</p>
        </div>
      </Card>
    );
  }

  const total = riskData.high + riskData.medium + riskData.low;
  
  const chartData = [
    {
      name: 'High Risk',
      value: riskData.high,
      percentage: total > 0 ? (riskData.high / total) * 100 : 0,
      color: RISK_COLORS.high,
    },
    {
      name: 'Medium Risk',
      value: riskData.medium,
      percentage: total > 0 ? (riskData.medium / total) * 100 : 0,
      color: RISK_COLORS.medium,
    },
    {
      name: 'Low Risk',
      value: riskData.low,
      percentage: total > 0 ? (riskData.low / total) * 100 : 0,
      color: RISK_COLORS.low,
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{formatPercentage(data.percentage, 1)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <Card className={className} padding="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Risk Distribution</h3>
          <Badge variant="default" size="sm">
            {total} Total Learners
          </Badge>
        </div>

        {/* Chart */}
        <div className="w-full">
          {chartType === 'pie' ? renderPieChart() : renderBarChart()}
        </div>

        {/* Details */}
        {showDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* High Risk */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">High Risk</span>
                </div>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-600 mb-1">
                {riskData.high}
              </div>
              <div className="text-sm text-red-600">
                {formatPercentage(chartData[0].percentage, 1)} of total
              </div>
            </div>

            {/* Medium Risk */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">Medium Risk</span>
                </div>
                <TrendingDown className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {riskData.medium}
              </div>
              <div className="text-sm text-yellow-600">
                {formatPercentage(chartData[1].percentage, 1)} of total
              </div>
            </div>

            {/* Low Risk */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">Low Risk</span>
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {riskData.low}
              </div>
              <div className="text-sm text-green-600">
                {formatPercentage(chartData[2].percentage, 1)} of total
              </div>
            </div>
          </div>
        )}

        {/* Legend for pie chart */}
        {chartType === 'pie' && (
          <div className="flex justify-center space-x-6">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RiskChart;