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

  // Mock data generator for demo
  useEffect(() => {
    const generateMockActivity = (): ActivityItem => {
      const types: ActivityItem['type'][] = ['login', 'quiz', 'nudge', 'risk', 'engagement'];
      const learners = ['Sarah Chen', 'Mike Rodriguez', 'Emily Watson', 'Alex Johnson', 'Lisa Park'];
      const messages = {
        login: 'logged in and started a new session',
        quiz: 'completed a quiz with 85% accuracy',
        nudge: 'received a personalized nudge message',
        risk: 'shows signs of disengagement',
        engagement: 'increased engagement by 15%'
      };

      const type = types[Math.floor(Math.random() * types.length)];
      const learner = learners[Math.floor(Math.random() * learners.length)];
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        type,
        message: messages[type],
        timestamp: new Date(),
        learnerName: learner,
        severity: type === 'risk' ? 'high' : type === 'engagement' ? 'low' : 'medium'
      };
    };

    // Add initial activities
    const initialActivities = Array.from({ length: 5 }, generateMockActivity);
    setActivities(initialActivities);

    // Add new activity every 3-8 seconds
    const interval = setInterval(() => {
      const newActivity = generateMockActivity();
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only 10 items
    }, Math.random() * 5000 + 3000);

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

  return (
    <div className={`bg-card rounded-lg border border-border p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <h3 className="font-semibold text-foreground">Live Activity</h3>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
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
      </div>
    </div>
  );
};
