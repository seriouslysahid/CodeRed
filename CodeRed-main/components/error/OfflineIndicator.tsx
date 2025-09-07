'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Wifi, WifiOff, Signal, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { useNetworkStatus } from '@/hooks/useOffline';

export interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
  position?: 'top' | 'bottom';
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className,
  showDetails = false,
  position = 'top',
}) => {
  const {
    isOffline,
    isOnline,
    wasOffline,
    isSlowConnection,
    effectiveType,
    offlineDuration,
    statusMessage,
    statusColor,
  } = useNetworkStatus();

  const [showNotification, setShowNotification] = useState(false);
  const [autoHideTimeout, setAutoHideTimeout] = useState<NodeJS.Timeout | null>(null);

  // Show notification when status changes
  useEffect(() => {
    if (isOffline || wasOffline || isSlowConnection) {
      setShowNotification(true);
      
      // Auto-hide after 5 seconds for non-critical states
      if (!isOffline) {
        const timeout = setTimeout(() => {
          setShowNotification(false);
        }, 5000);
        setAutoHideTimeout(timeout);
      }
    } else {
      setShowNotification(false);
    }

    return () => {
      if (autoHideTimeout) {
        clearTimeout(autoHideTimeout);
      }
    };
  }, [isOffline, wasOffline, isSlowConnection]);

  const handleDismiss = () => {
    setShowNotification(false);
    if (autoHideTimeout) {
      clearTimeout(autoHideTimeout);
    }
  };

  const handleRetry = () => {
    // Force a network check by trying to fetch a small resource
    fetch('/favicon.ico', { cache: 'no-cache' })
      .then(() => {
        // Connection successful
        setShowNotification(false);
      })
      .catch(() => {
        // Still offline
        console.log('Still offline');
      });
  };

  const getIcon = () => {
    if (isOffline) return <WifiOff className="w-4 h-4" />;
    if (wasOffline) return <CheckCircle className="w-4 h-4" />;
    if (isSlowConnection) return <Signal className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  const getBackgroundColor = () => {
    switch (statusColor) {
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTextColor = () => {
    switch (statusColor) {
      case 'red': return 'text-red-800';
      case 'yellow': return 'text-yellow-800';
      case 'green': return 'text-green-800';
      default: return 'text-gray-800';
    }
  };

  const getBorderColor = () => {
    switch (statusColor) {
      case 'red': return 'border-red-200';
      case 'yellow': return 'border-yellow-200';
      case 'green': return 'border-green-200';
      default: return 'border-gray-200';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div
      className={clsx(
        'fixed left-4 right-4 z-50 transition-all duration-300',
        position === 'top' ? 'top-4' : 'bottom-4',
        className
      )}
    >
      <div
        className={clsx(
          'mx-auto max-w-md rounded-lg border shadow-lg p-4',
          getBackgroundColor().replace('bg-', 'bg-opacity-10 bg-'),
          getBorderColor(),
          'backdrop-blur-sm'
        )}
      >
        <div className="flex items-start space-x-3">
          <div className={clsx('flex-shrink-0 mt-0.5', getTextColor())}>
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className={clsx('text-sm font-medium', getTextColor())}>
                {statusMessage}
              </p>
              
              <button
                onClick={handleDismiss}
                className={clsx(
                  'ml-2 text-xs hover:opacity-75 transition-opacity',
                  getTextColor()
                )}
              >
                ✕
              </button>
            </div>
            
            {showDetails && (
              <div className="mt-2 space-y-1">
                {isOffline && offlineDuration > 0 && (
                  <p className="text-xs text-gray-600">
                    Offline for {formatDuration(offlineDuration)}
                  </p>
                )}
                
                {effectiveType !== 'unknown' && (
                  <p className="text-xs text-gray-600">
                    Connection: {effectiveType.toUpperCase()}
                  </p>
                )}
                
                {isOffline && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleRetry}
                      className="text-xs"
                    >
                      Retry Connection
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple status badge component
export const NetworkStatusBadge: React.FC<{ className?: string }> = ({ className }) => {
  const { isOffline, isSlowConnection, effectiveType } = useNetworkStatus();

  if (!isOffline && !isSlowConnection) {
    return null;
  }

  return (
    <Badge
      variant={isOffline ? 'danger' : 'warning'}
      size="sm"
      className={className}
    >
      {isOffline ? (
        <>
          <WifiOff className="w-3 h-3 mr-1" />
          Offline
        </>
      ) : (
        <>
          <Signal className="w-3 h-3 mr-1" />
          {effectiveType.toUpperCase()}
        </>
      )}
    </Badge>
  );
};

export default OfflineIndicator;