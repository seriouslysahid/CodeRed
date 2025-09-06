'use client';

import React from 'react';
import { clsx } from 'clsx';
import { AlertTriangle, TrendingUp, Send, ExternalLink, Users } from 'lucide-react';
import { Card, Badge, Button, SkeletonList } from '@/components/ui';
import { useAllLearners } from '@/hooks';
import { formatPercentage, formatDate, getRiskBadgeColor } from '@/lib/utils';
import type { Learner } from '@/lib/types';

export interface TopRiskLearnersProps {
  className?: string;
  maxItems?: number;
  onNudgeLearner?: (learner: Learner) => void;
  onViewLearner?: (learner: Learner) => void;
  showActions?: boolean;
}

const TopRiskLearners: React.FC<TopRiskLearnersProps> = ({
  className,
  maxItems = 5,
  onNudgeLearner,
  onViewLearner,
  showActions = true,
}) => {
  const { learners, isLoading, error } = useAllLearners({
    sortBy: 'risk',
    sortOrder: 'desc',
    limit: maxItems * 2, // Get more to filter high-risk ones
  });

  if (isLoading) {
    return (
      <Card className={className} padding="md">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Top At-Risk Learners</h3>
        </div>
        <SkeletonList items={maxItems} showAvatar={false} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className} padding="md">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Top At-Risk Learners</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 text-sm">Failed to load at-risk learners</p>
        </div>
      </Card>
    );
  }

  // Filter and sort by risk score, prioritizing high-risk learners
  const topRiskLearners = learners
    .filter(learner => learner.riskLabel === 'high' || learner.riskLabel === 'medium')
    .sort((a, b) => {
      // First sort by risk label (high > medium > low)
      const riskOrder = { high: 3, medium: 2, low: 1 };
      const riskDiff = riskOrder[b.riskLabel] - riskOrder[a.riskLabel];
      if (riskDiff !== 0) return riskDiff;
      
      // Then by risk score
      return b.riskScore - a.riskScore;
    })
    .slice(0, maxItems);

  return (
    <Card className={className} padding="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">Top At-Risk Learners</h3>
          </div>
          
          {topRiskLearners.length > 0 && (
            <Badge variant="danger" size="sm">
              {topRiskLearners.length} Require Attention
            </Badge>
          )}
        </div>

        {/* Learners list */}
        {topRiskLearners.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">No high-risk learners found</p>
            <p className="text-gray-500 text-xs mt-1">All learners are performing well!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topRiskLearners.map((learner, index) => (
              <TopRiskLearnerItem
                key={learner.id}
                learner={learner}
                rank={index + 1}
                onNudge={onNudgeLearner}
                onView={onViewLearner}
                showActions={showActions}
              />
            ))}
          </div>
        )}

        {/* View all link */}
        {topRiskLearners.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-600 hover:text-gray-900"
              onClick={() => {
                // Navigate to learners page with high-risk filter
                window.location.href = '/learners?riskFilter=high';
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              View All At-Risk Learners
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

interface TopRiskLearnerItemProps {
  learner: Learner;
  rank: number;
  onNudge?: (learner: Learner) => void;
  onView?: (learner: Learner) => void;
  showActions: boolean;
}

const TopRiskLearnerItem: React.FC<TopRiskLearnerItemProps> = ({
  learner,
  rank,
  onNudge,
  onView,
  showActions,
}) => {
  const getRiskIndicator = (riskLabel: Learner['riskLabel']) => {
    switch (riskLabel) {
      case 'high':
        return <div className="w-3 h-3 bg-red-500 rounded-full" />;
      case 'medium':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full" />;
      case 'low':
        return <div className="w-3 h-3 bg-green-500 rounded-full" />;
      default:
        return <div className="w-3 h-3 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      {/* Rank */}
      <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
        <span className="text-xs font-bold text-red-600">#{rank}</span>
      </div>

      {/* Risk indicator */}
      <div className="flex-shrink-0">
        {getRiskIndicator(learner.riskLabel)}
      </div>

      {/* Learner info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {learner.name}
          </p>
          <Badge
            variant={learner.riskLabel === 'high' ? 'danger' : 'warning'}
            size="sm"
            className={getRiskBadgeColor(learner.riskLabel)}
          >
            {learner.riskLabel.toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <span>Score: {learner.riskScore.toFixed(2)}</span>
          <span>Completion: {formatPercentage(learner.completionPct, 0)}</span>
          <span>Last Login: {formatDate(learner.lastLogin)}</span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center space-x-2 flex-shrink-0">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(learner)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
          
          {onNudge && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNudge(learner)}
              className="text-blue-500 hover:text-blue-700"
            >
              <Send className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TopRiskLearners;