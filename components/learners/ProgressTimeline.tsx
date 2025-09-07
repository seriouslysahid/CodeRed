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

// Transform API event data to timeline format
const transformEventToTimeline = (event: any) => {
  const { id, type, metadata, createdAt } = event;
  
  // Map event types to timeline format
  switch (type) {
    case 'login':
      return {
        id,
        type: 'login' as const,
        title: 'Login',
        description: metadata.lessonId ? `Accessed lesson ${metadata.lessonId}` : 'Accessed course dashboard',
        timestamp: createdAt,
        status: 'completed' as const,
      };
    case 'quiz_attempt':
      return {
        id,
        type: 'quiz' as const,
        title: 'Quiz Attempt',
        description: `Quiz Score: ${metadata.quizScore || 'N/A'}%`,
        timestamp: createdAt,
        status: 'completed' as const,
        score: metadata.quizScore,
      };
    case 'lesson_completed':
      return {
        id,
        type: 'achievement' as const,
        title: 'Lesson Completed',
        description: `Lesson ${metadata.lessonId || 'N/A'} completed`,
        timestamp: createdAt,
        status: 'completed' as const,
      };
    case 'video_watched':
      return {
        id,
        type: 'session' as const,
        title: 'Video Watched',
        description: `Watched lesson ${metadata.lessonId || 'N/A'} video`,
        timestamp: createdAt,
        status: 'completed' as const,
      };
    default:
      return {
        id,
        type: 'session' as const,
        title: 'Activity',
        description: `${type} activity`,
        timestamp: createdAt,
        status: 'completed' as const,
      };
  }
};

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  learnerId,
  className,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [timelineEvents, setTimelineEvents] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch real timeline data from API
  React.useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/events?learnerId=${learnerId}&limit=10`);
        if (!response.ok) {
          throw new Error('Failed to fetch timeline data');
        }
        
        const data = await response.json();
        const transformedEvents = data.events.map(transformEventToTimeline);
        setTimelineEvents(transformedEvents);
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load timeline');
        // Fallback to empty array on error
        setTimelineEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimelineData();
  }, [learnerId]);

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

  if (error) {
    return (
      <Card className={className} padding="md">
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">⚠️ Timeline Error</div>
          <div className="text-sm text-gray-600">{error}</div>
        </div>
      </Card>
    );
  }

  if (timelineEvents.length === 0) {
    return (
      <Card className={className} padding="md">
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">📅 No Activity Yet</div>
          <div className="text-sm text-gray-600">No timeline events found for this learner.</div>
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