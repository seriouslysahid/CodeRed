'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Calendar, TrendingUp, TrendingDown, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, Badge, Skeleton } from '@/components/ui';
import { formatDate, formatDateTime } from '@/lib/utils';

export interface ProgressTimelineProps {
  learnerId: number;
  className?: string;
}

// Mock data for timeline - in real app this would come from an API
const generateMockTimelineData = (learnerId: number) => {
  const events = [
    {
      id: 1,
      type: 'login' as const,
      title: 'Last Login',
      description: 'Accessed course dashboard',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const,
    },
    {
      id: 2,
      type: 'quiz' as const,
      title: 'Quiz Completed',
      description: 'Module 3 Assessment - Score: 85%',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const,
      score: 85,
    },
    {
      id: 3,
      type: 'session' as const,
      title: 'Missed Session',
      description: 'Weekly review session #12',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'missed' as const,
    },
    {
      id: 4,
      type: 'achievement' as const,
      title: 'Milestone Reached',
      description: '50% course completion achieved',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const,
    },
    {
      id: 5,
      type: 'quiz' as const,
      title: 'Quiz Completed',
      description: 'Module 2 Assessment - Score: 92%',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const,
      score: 92,
    },
    {
      id: 6,
      type: 'login' as const,
      title: 'Course Started',
      description: 'First login and course enrollment',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const,
    },
  ];

  return events;
};

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  learnerId,
  className,
}) => {
  // In a real app, this would be a hook that fetches timeline data
  const [isLoading] = React.useState(false);
  const timelineEvents = generateMockTimelineData(learnerId);

  if (isLoading) {
    return (
      <Card className={className} padding="md">
        <div className="space-y-4">
          <Skeleton height="1.5rem" width="60%" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex space-x-4">
                <Skeleton width="2rem" height="2rem" variant="circular" />
                <div className="flex-1 space-y-2">
                  <Skeleton height="1rem" width="80%" />
                  <Skeleton height="0.875rem" width="60%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const getEventIcon = (type: string, status: string) => {
    switch (type) {
      case 'login':
        return <Calendar className="w-4 h-4" />;
      case 'quiz':
        return status === 'completed' ? <Award className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;
      case 'session':
        return status === 'missed' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />;
      case 'achievement':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string, status: string) => {
    if (status === 'missed') return 'text-red-500 bg-red-100';
    
    switch (type) {
      case 'login':
        return 'text-blue-500 bg-blue-100';
      case 'quiz':
        return 'text-green-500 bg-green-100';
      case 'session':
        return 'text-purple-500 bg-purple-100';
      case 'achievement':
        return 'text-yellow-500 bg-yellow-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusBadge = (type: string, status: string, score?: number) => {
    if (status === 'missed') {
      return <Badge variant="danger" size="sm">Missed</Badge>;
    }
    
    if (type === 'quiz' && score !== undefined) {
      const variant = score >= 90 ? 'success' : score >= 70 ? 'warning' : 'danger';
      return <Badge variant={variant} size="sm">{score}%</Badge>;
    }
    
    if (status === 'completed') {
      return <Badge variant="success" size="sm">Completed</Badge>;
    }
    
    return null;
  };

  return (
    <Card className={className} padding="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Progress Timeline</h3>
          <Badge variant="default" size="sm">
            {timelineEvents.length} Events
          </Badge>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />

          {/* Timeline events */}
          <div className="space-y-6">
            {timelineEvents.map((event, index) => {
              const isLast = index === timelineEvents.length - 1;
              const colorClasses = getEventColor(event.type, event.status);
              
              return (
                <div key={event.id} className="relative flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className={clsx(
                    'relative z-10 flex items-center justify-center w-8 h-8 rounded-full',
                    colorClasses
                  )}>
                    {getEventIcon(event.type, event.status)}
                  </div>

                  {/* Event content */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {event.title}
                      </h4>
                      {getStatusBadge(event.type, event.status, event.score)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDateTime(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary stats */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {timelineEvents.filter(e => e.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-red-600">
                {timelineEvents.filter(e => e.status === 'missed').length}
              </div>
              <div className="text-xs text-gray-600">Missed</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {timelineEvents.filter(e => e.type === 'quiz').length}
              </div>
              <div className="text-xs text-gray-600">Quizzes</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProgressTimeline;