'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, User, BookOpen, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'login' | 'quiz' | 'nudge' | 'risk' | 'engagement';
  message: string;
  timestamp: Date;
  learnerName: string;
  severity?: 'low' | 'medium' | 'high';
}

interface LiveActivityFeedProps {
  className?: string;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ className = '' }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real events data
  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/events?limit=10');
        const data = await response.json();
        
        if (data.events) {
          // Transform events to activity items
          const transformedActivities: ActivityItem[] = data.events.map((event: any) => {
            let type: ActivityItem['type'] = 'login';
            let message = '';
            let severity: ActivityItem['severity'] = 'medium';
            
            switch (event.type) {
              case 'login':
                type = 'login';
                message = event.metadata.lessonId 
                  ? `accessed lesson ${event.metadata.lessonId}`
                  : 'logged in and started a new session';
                severity = 'low';
                break;
              case 'quiz_attempt':
                type = 'quiz';
                message = `completed a quiz with ${event.metadata.quizScore || 'N/A'}% accuracy`;
                severity = event.metadata.quizScore > 80 ? 'low' : event.metadata.quizScore > 60 ? 'medium' : 'high';
                break;
              case 'lesson_completed':
                type = 'engagement';
                message = `completed lesson ${event.metadata.lessonId || 'N/A'}`;
                severity = 'low';
                break;
              case 'video_watched':
                type = 'engagement';
                message = `watched lesson ${event.metadata.lessonId || 'N/A'} video`;
                severity = 'low';
                break;
              default:
                type = 'login';
                message = `${event.type} activity`;
                severity = 'medium';
            }
            
            return {
              id: event.id.toString(),
              type,
              message,
              timestamp: new Date(event.createdAt),
              learnerName: `Learner ${event.learnerId}`, // We could fetch learner names if needed
              severity
            };
          });
          
          setActivities(transformedActivities);
        }
      } catch (error) {
        console.error('Failed to fetch recent events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentEvents();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRecentEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'login':
        return <User className="w-4 h-4" />;
      case 'quiz':
        return <BookOpen className="w-4 h-4" />;
      case 'nudge':
        return <MessageSquare className="w-4 h-4" />;
      case 'risk':
        return <AlertTriangle className="w-4 h-4" />;
      case 'engagement':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type'], severity?: string) => {
    if (type === 'risk') return 'text-red-500 bg-red-50 dark:bg-red-950';
    if (type === 'engagement') return 'text-green-500 bg-green-50 dark:bg-green-950';
    if (type === 'nudge') return 'text-blue-500 bg-blue-50 dark:bg-blue-950';
    return 'text-gray-500 bg-gray-50 dark:bg-gray-950';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  if (isLoading) {
    return (
      <div className={`bg-card rounded-lg border border-border p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          <h3 className="font-semibold text-foreground">Live Activity</h3>
        </div>
        
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg border border-border p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <h3 className="font-semibold text-foreground">Live Activity</h3>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-sm">No recent activity</div>
          </div>
        ) : (
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05 
                }}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className={`p-2 rounded-full ${getActivityColor(activity.type, activity.severity)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.learnerName}</span>{' '}
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
