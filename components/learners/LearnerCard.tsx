'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Calendar, Mail, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Card, Badge, Checkbox } from '@/components/ui';
import { formatDate, formatPercentage, getRiskBadgeColor } from '@/lib/utils';
import type { Learner } from '@/lib/types';

export interface LearnerCardProps {
  learner: Learner;
  selected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  onClick?: () => void;
  showSelection?: boolean;
  className?: string;
}

const LearnerCard: React.FC<LearnerCardProps> = ({
  learner,
  selected = false,
  onSelectionChange,
  onClick,
  showSelection = false,
  className,
}) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleSelectionChange = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked);
    }
  };

  const getRiskIcon = (riskLabel: Learner['riskLabel']) => {
    switch (riskLabel) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <TrendingDown className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card
      className={clsx(
        'transition-all duration-200 hover:shadow-md active:scale-[0.98] touch-manipulation',
        selected && 'ring-2 ring-blue-500 ring-offset-2',
        onClick && 'cursor-pointer active:shadow-lg',
        'min-h-[280px] sm:min-h-[320px]', // Ensure consistent card heights
        className
      )}
      onClick={handleCardClick}
      hover={!!onClick}
    >
      {/* Header with selection and risk badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {showSelection && (
            <div className="flex-shrink-0 pt-1">
              <Checkbox
                checked={selected}
                onCheckedChange={handleSelectionChange}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${learner.name}`}
                className="touch-manipulation min-w-[20px] min-h-[20px]"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate leading-tight">
              {learner.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 truncate">
                {learner.email}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
          {getRiskIcon(learner.riskLabel)}
          <Badge
            variant={
              learner.riskLabel === 'high' ? 'danger' :
              learner.riskLabel === 'medium' ? 'warning' : 'success'
            }
            size="sm"
            className={clsx(getRiskBadgeColor(learner.riskLabel), 'text-xs whitespace-nowrap')}
          >
            <span className="hidden sm:inline">{learner.riskLabel.toUpperCase()} RISK</span>
            <span className="sm:hidden">{learner.riskLabel.toUpperCase()}</span>
          </Badge>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
        <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
          <div className={clsx('text-xl sm:text-2xl font-bold', getCompletionColor(learner.completionPct))}>
            {formatPercentage(learner.completionPct, 0)}
          </div>
          <div className="text-xs text-gray-600 mt-1">Completion</div>
        </div>
        
        <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
          <div className={clsx('text-xl sm:text-2xl font-bold', getCompletionColor(learner.quizAvg))}>
            {formatPercentage(learner.quizAvg, 0)}
          </div>
          <div className="text-xs text-gray-600 mt-1">Quiz Average</div>
        </div>
      </div>

      {/* Additional metrics */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Missed Sessions:</span>
          <span className={clsx(
            'font-medium',
            learner.missedSessions > 3 ? 'text-red-600' :
            learner.missedSessions > 1 ? 'text-yellow-600' : 'text-green-600'
          )}>
            {learner.missedSessions}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Risk Score:</span>
          <span className="font-medium text-gray-900">
            {learner.riskScore.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-1 text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>Last Login:</span>
          </div>
          <span className="font-medium text-gray-900">
            {formatDate(learner.lastLogin)}
          </span>
        </div>
      </div>

      {/* Progress bar for completion */}
      <div className="mt-4">
        <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
          <span>Overall Progress</span>
          <span>{formatPercentage(learner.completionPct, 0)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={clsx(
              'h-2 rounded-full transition-all duration-300',
              learner.completionPct >= 80 ? 'bg-green-500' :
              learner.completionPct >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${Math.min(learner.completionPct, 100)}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

export default LearnerCard;