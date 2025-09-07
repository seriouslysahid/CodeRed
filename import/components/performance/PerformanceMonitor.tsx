'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Activity, BarChart3, Cpu, HardDrive, Wifi, X } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { 
  usePerformanceMetrics, 
  useMemoryUsage, 
  useConnectionQuality 
} from '@/hooks/usePerformance';

export interface PerformanceMonitorProps {
  enabled?: boolean;
  showInProduction?: boolean;
  className?: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  showInProduction = false,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const metrics = usePerformanceMetrics();
  const memoryInfo = useMemoryUsage();
  const connectionInfo = useConnectionQuality();

  const shouldShow = enabled && (process.env.NODE_ENV === 'development' || showInProduction);

  if (!shouldShow) return null;

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const formatMs = (ms?: number) => {
    if (ms === undefined) return 'N/A';
    return `${Math.round(ms * 100) / 100}ms`;
  };

  const getPerformanceScore = () => {
    const { fcp, lcp, fid, cls } = metrics;
    let score = 100;

    // First Contentful Paint (good: <1.8s, poor: >3s)
    if (fcp) {
      if (fcp > 3000) score -= 20;
      else if (fcp > 1800) score -= 10;
    }

    // Largest Contentful Paint (good: <2.5s, poor: >4s)
    if (lcp) {
      if (lcp > 4000) score -= 25;
      else if (lcp > 2500) score -= 15;
    }

    // First Input Delay (good: <100ms, poor: >300ms)
    if (fid) {
      if (fid > 300) score -= 20;
      else if (fid > 100) score -= 10;
    }

    // Cumulative Layout Shift (good: <0.1, poor: >0.25)
    if (cls) {
      if (cls > 0.25) score -= 15;
      else if (cls > 0.1) score -= 8;
    }

    return Math.max(0, score);
  };

  const performanceScore = getPerformanceScore();
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge variant="success" size="sm">Excellent</Badge>;
    if (score >= 70) return <Badge variant="warning" size="sm">Good</Badge>;
    return <Badge variant="danger" size="sm">Poor</Badge>;
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={clsx(
          'fixed bottom-4 left-4 z-50 p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
          className
        )}
        aria-label="Performance monitor"
      >
        <Activity className="w-5 h-5" />
      </button>

      {/* Performance panel */}
      {isVisible && (
        <div className="fixed bottom-20 left-4 z-50 w-80">
          <Card padding="md" className="bg-white shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Performance Monitor
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Overall Score */}
            <div className="mb-6 text-center">
              <div className={clsx('text-3xl font-bold mb-1', getScoreColor(performanceScore))}>
                {performanceScore}
              </div>
              <div className="text-sm text-gray-600 mb-2">Performance Score</div>
              {getScoreBadge(performanceScore)}
            </div>

            {/* Core Web Vitals */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Core Web Vitals
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-medium">FCP</div>
                    <div className="text-gray-600">{formatMs(metrics.fcp)}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-medium">LCP</div>
                    <div className="text-gray-600">{formatMs(metrics.lcp)}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-medium">FID</div>
                    <div className="text-gray-600">{formatMs(metrics.fid)}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="font-medium">CLS</div>
                    <div className="text-gray-600">
                      {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Memory Usage */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <HardDrive className="w-4 h-4 mr-2" />
                  Memory Usage
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Used:</span>
                    <span>{formatBytes(memoryInfo.usedJSHeapSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>{formatBytes(memoryInfo.totalJSHeapSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Limit:</span>
                    <span>{formatBytes(memoryInfo.jsHeapSizeLimit)}</span>
                  </div>
                  {memoryInfo.usedJSHeapSize && memoryInfo.totalJSHeapSize && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Connection Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <Wifi className="w-4 h-4 mr-2" />
                  Connection
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span>{connectionInfo.effectiveType?.toUpperCase() || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Downlink:</span>
                    <span>{connectionInfo.downlink ? `${connectionInfo.downlink} Mbps` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RTT:</span>
                    <span>{connectionInfo.rtt ? `${connectionInfo.rtt}ms` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Save Data:</span>
                    <span>{connectionInfo.saveData ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <Cpu className="w-4 h-4 mr-2" />
                  Other Metrics
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>TTFB:</span>
                    <span>{formatMs(metrics.ttfb)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>User Agent:</span>
                    <span className="truncate max-w-32" title={navigator.userAgent}>
                      {navigator.userAgent.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
              <div className="space-y-1 text-xs text-gray-600">
                {metrics.lcp && metrics.lcp > 2500 && (
                  <div>• Optimize images and reduce server response time</div>
                )}
                {metrics.fid && metrics.fid > 100 && (
                  <div>• Reduce JavaScript execution time</div>
                )}
                {metrics.cls && metrics.cls > 0.1 && (
                  <div>• Add size attributes to images and ads</div>
                )}
                {memoryInfo.usedJSHeapSize && memoryInfo.totalJSHeapSize && 
                 (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) > 0.8 && (
                  <div>• High memory usage detected</div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default PerformanceMonitor;