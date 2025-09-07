'use client';

import React from 'react';
import { Users, TrendingUp, TrendingDown, AlertTriangle, Clock, Target } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { useAllLearners, useRiskDistribution } from '@/hooks';
import { formatPercentage } from '@/lib/utils';

export interface DashboardStatsProps {
  className?: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ className }) => {
  const { learners, isLoading: learnersLoading } = useAllLearners();
  const { data: riskData, isLoading: riskLoading } = useRiskDistribution();

  const isLoading = learnersLoading || riskLoading;

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} padding="md">
              <Skeleton height="4rem" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalLearners = learners.length;
  const highRiskCount = riskData?.high || 0;
  const mediumRiskCount = riskData?.medium || 0;
  const lowRiskCount = riskData?.low || 0;

  // Calculate additional metrics
  const avgCompletion = totalLearners > 0 
    ? learners.reduce((sum, learner) => sum + learner.completionPct, 0) / totalLearners 
    : 0;

  const avgQuizScore = totalLearners > 0
    ? learners.reduce((sum, learner) => sum + learner.quizAvg, 0) / totalLearners
    : 0;

  const recentlyActive = learners.filter(learner => {
    const lastLogin = new Date(learner.lastLogin);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastLogin >= weekAgo;
  }).length;

  const stats = [
    {
      title: 'Total Learners',
      value: totalLearners.toString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-100',
      iconColor: 'text-blue-200',
      description: 'Active learners',
    },
    {
      title: 'At Risk',
      value: (highRiskCount + mediumRiskCount).toString(),
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-100',
      iconColor: 'text-red-200',
      description: 'Need attention',
    },
    {
      title: 'Avg Completion',
      value: formatPercentage(avgCompletion, 0),
      icon: Target,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-100',
      iconColor: 'text-green-200',
      description: 'Course progress',
    },
    {
      title: 'Recently Active',
      value: recentlyActive.toString(),
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-100',
      iconColor: 'text-purple-200',
      description: 'Last 7 days',
    },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              padding="md"
              className={`bg-gradient-to-r ${stat.color} text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${stat.textColor} text-sm font-medium`}>
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {stat.value}
                  </p>
                  <p className={`${stat.textColor} text-xs mt-1`}>
                    {stat.description}
                  </p>
                </div>
                <Icon className={`w-8 h-8 ${stat.iconColor}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Additional metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card padding="md" className="bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">High Risk</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {highRiskCount}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {totalLearners > 0 ? formatPercentage((highRiskCount / totalLearners) * 100, 1) : '0%'} of total
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </Card>

        <Card padding="md" className="bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Medium Risk</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {mediumRiskCount}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {totalLearners > 0 ? formatPercentage((mediumRiskCount / totalLearners) * 100, 1) : '0%'} of total
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </Card>

        <Card padding="md" className="bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Low Risk</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {lowRiskCount}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {totalLearners > 0 ? formatPercentage((lowRiskCount / totalLearners) * 100, 1) : '0%'} of total
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;