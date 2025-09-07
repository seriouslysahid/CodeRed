'use client';

import React from 'react';
import { Clock, CheckCircle, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';

export interface SimulationHistoryProps {
  className?: string;
  maxItems?: number;
}

// Mock simulation history data - in real app this would come from API
const mockSimulationHistory = [
  {
    id: 1,
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 45000).toISOString(), // 45 seconds later
    status: 'completed' as const,
    processed: 156,
    updated: 23,
    duration: 45,
    changes: {
      highRisk: { before: 12, after: 15 },
      mediumRisk: { before: 34, after: 31 },
      lowRisk: { before: 110, after: 110 },
    },
  },
  {
    id: 2,
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 52000).toISOString(), // 52 seconds later
    status: 'completed' as const,
    processed: 156,
    updated: 18,
    duration: 52,
    changes: {
      highRisk: { before: 15, after: 12 },
      mediumRisk: { before: 38, after: 34 },
      lowRisk: { before: 103, after: 110 },
    },
  },
  {
    id: 3,
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    completedAt: null,
    status: 'failed' as const,
    processed: 89,
    updated: 0,
    duration: 30,
    error: 'Database connection timeout',
  },
  {
    id: 4,
    startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 38000).toISOString(), // 38 seconds later
    status: 'completed' as const,
    processed: 142,
    updated: 31,
    duration: 38,
    changes: {
      highRisk: { before: 8, after: 15 },
      mediumRisk: { before: 29, after: 38 },
      lowRisk: { before: 105, after: 89 },
    },
  },
];

const SimulationHistory: React.FC<SimulationHistoryProps> = ({
  className,
  maxItems = 10,
}) => {
  const historyItems = mockSimulationHistory.slice(0, maxItems);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" size="sm">Completed</Badge>;
      case 'failed':
        return <Badge variant="danger" size="sm">Failed</Badge>;
      case 'running':
        return <Badge variant="info" size="sm">Running</Badge>;
      default:
        return <Badge variant="default" size="sm">Unknown</Badge>;
    }
  };

  const getRiskChangeIndicator = (before: number, after: number) => {
    if (after > before) {
      return <TrendingUp className="w-3 h-3 text-red-500" />;
    } else if (after < before) {
      return <TrendingUp className="w-3 h-3 text-green-500 rotate-180" />;
    }
    return null;
  };

  return (
    <Card {...(className && { className })} padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Simulation History</h2>
          <Badge variant="default" size="sm">
            {historyItems.length} Recent Runs
          </Badge>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Risk Simulation #{item.id}
                    </h3>
                    <p className="text-xs text-gray-600">
                      Started {formatDateTime(item.startedAt)}
                    </p>
                  </div>
                </div>
                {getStatusBadge(item.status)}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {item.processed}
                  </div>
                  <div className="text-xs text-gray-600">Processed</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {item.updated}
                  </div>
                  <div className="text-xs text-gray-600">Updated</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">
                    {item.duration}s
                  </div>
                  <div className="text-xs text-gray-600">Duration</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {item.status === 'completed' ? '100%' : 
                     item.status === 'failed' ? '0%' : 
                     Math.round(((item as any).processed / 156) * 100) + '%'}
                  </div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
              </div>

              {/* Risk Changes */}
              {item.status === 'completed' && item.changes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Risk Distribution Changes</h4>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-gray-600">High</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">
                          {item.changes.highRisk.before} → {item.changes.highRisk.after}
                        </span>
                        {getRiskChangeIndicator(item.changes.highRisk.before, item.changes.highRisk.after)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-gray-600">Medium</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">
                          {item.changes.mediumRisk.before} → {item.changes.mediumRisk.after}
                        </span>
                        {getRiskChangeIndicator(item.changes.mediumRisk.before, item.changes.mediumRisk.after)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-gray-600">Low</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">
                          {item.changes.lowRisk.before} → {item.changes.lowRisk.after}
                        </span>
                        {getRiskChangeIndicator(item.changes.lowRisk.before, item.changes.lowRisk.after)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {item.status === 'failed' && item.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <h4 className="text-sm font-medium text-red-800">Error</h4>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{item.error}</p>
                </div>
              )}

              {/* Completion Time */}
              {item.completedAt && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Completed {formatDateTime(item.completedAt)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {historyItems.filter(item => item.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-600">Successful</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-red-600">
                {historyItems.filter(item => item.status === 'failed').length}
              </div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
            
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {historyItems.length > 0 
                  ? Math.round(historyItems.reduce((sum, item) => sum + item.duration, 0) / historyItems.length)
                  : 0
                }s
              </div>
              <div className="text-xs text-gray-600">Avg Duration</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SimulationHistory;