'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Mail, Calendar, TrendingUp, AlertTriangle, User } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, Badge, Skeleton } from '@/components/ui';
import { NudgeModal, NudgeHistory } from '@/components/nudges';
import ProgressTimeline from '@/components/learners/ProgressTimeline';
import { useLearner, useLearnersPrefetch } from '@/hooks';
import { formatDate, formatPercentage, getRiskBadgeColor } from '@/lib/utils';
import type { Learner } from '@/lib/types';

const LearnerDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const learnerId = parseInt(params.id as string);
  
  const [showNudgeModal, setShowNudgeModal] = useState(false);
  
  const { data: learner, isLoading, error } = useLearner(learnerId);
  const { prefetchLearners } = useLearnersPrefetch();

  // Prefetch learners list for better navigation experience
  React.useEffect(() => {
    prefetchLearners();
  }, [prefetchLearners]);

  const handleBack = () => {
    router.back();
  };

  const handleNudgeLearner = () => {
    setShowNudgeModal(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center space-x-4">
            <Skeleton width="2rem" height="2rem" variant="circular" />
            <Skeleton width="200px" height="2rem" />
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton height="300px" />
              <Skeleton height="400px" />
            </div>
            <div className="space-y-6">
              <Skeleton height="200px" />
              <Skeleton height="300px" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !learner) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Learner Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The learner you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900 self-start"
              touchOptimized={true}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="hidden sm:block h-6 w-px bg-gray-300" />
            
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{learner.name}</h1>
              <p className="text-gray-600 text-sm sm:text-base">Learner Profile</p>
            </div>
          </div>

          <Button 
            onClick={handleNudgeLearner}
            className="w-full sm:w-auto"
            touchOptimized={true}
          >
            <Send className="w-4 h-4 mr-2" />
            Send Nudge
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* Learner Overview */}
            <LearnerOverview learner={learner} />
            
            {/* Progress Timeline */}
            <ProgressTimeline learnerId={learner.id} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Quick Stats */}
            <LearnerQuickStats learner={learner} />
            
            {/* Nudge History */}
            <NudgeHistory
              learnerId={learner.id}
              maxItems={5}
              showActions={true}
            />
          </div>
        </div>
      </div>

      {/* Nudge Modal */}
      <NudgeModal
        open={showNudgeModal}
        onOpenChange={setShowNudgeModal}
        learner={learner}
      />
    </DashboardLayout>
  );
};

interface LearnerOverviewProps {
  learner: Learner;
}

const LearnerOverview: React.FC<LearnerOverviewProps> = ({ learner }) => {
  const getRiskIcon = (riskLabel: Learner['riskLabel']) => {
    switch (riskLabel) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      default:
        return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <Card padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{learner.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{learner.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {getRiskIcon(learner.riskLabel)}
            <Badge
              variant={
                learner.riskLabel === 'high' ? 'danger' :
                learner.riskLabel === 'medium' ? 'warning' : 'success'
              }
              className={getRiskBadgeColor(learner.riskLabel)}
            >
              {learner.riskLabel.toUpperCase()} RISK
            </Badge>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center p-3 sm:p-0">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
              {formatPercentage(learner.completionPct, 1)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Course Completion</div>
          </div>
          
          <div className="text-center p-3 sm:p-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
              {formatPercentage(learner.quizAvg, 1)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Quiz Average</div>
          </div>
          
          <div className="text-center p-3 sm:p-0">
            <div className="text-xl sm:text-2xl font-bold text-red-600 mb-1">
              {learner.missedSessions}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Missed Sessions</div>
          </div>
          
          <div className="text-center p-3 sm:p-0">
            <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
              {learner.riskScore.toFixed(2)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Risk Score</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Course Progress</span>
              <span>{formatPercentage(learner.completionPct, 1)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(learner.completionPct, 100)}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Quiz Performance</span>
              <span>{formatPercentage(learner.quizAvg, 1)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(learner.quizAvg, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Last Login: {formatDate(learner.lastLogin)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>Student ID: #{learner.id}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface LearnerQuickStatsProps {
  learner: Learner;
}

const LearnerQuickStats: React.FC<LearnerQuickStatsProps> = ({ learner }) => {
  const stats = [
    {
      label: 'Risk Level',
      value: learner.riskLabel.charAt(0).toUpperCase() + learner.riskLabel.slice(1),
      color: learner.riskLabel === 'high' ? 'text-red-600' : 
             learner.riskLabel === 'medium' ? 'text-yellow-600' : 'text-green-600',
    },
    {
      label: 'Completion Rate',
      value: formatPercentage(learner.completionPct, 1),
      color: 'text-blue-600',
    },
    {
      label: 'Quiz Average',
      value: formatPercentage(learner.quizAvg, 1),
      color: 'text-green-600',
    },
    {
      label: 'Sessions Missed',
      value: learner.missedSessions.toString(),
      color: learner.missedSessions > 3 ? 'text-red-600' : 'text-gray-600',
    },
  ];

  return (
    <Card padding="md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
      
      <div className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{stat.label}</span>
            <span className={`text-sm font-medium ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LearnerDetailPage;