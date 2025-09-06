'use client';

import { useState, useEffect, useCallback } from 'react';

export interface OfflineState {
  isOffline: boolean;
  isOnline: boolean;
  wasOffline: boolean;
}

export function useOffline(): OfflineState {
  const [isOffline, setIsOffline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOffline(false);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOffline(true);
    setWasOffline(true);
  }, []);

  useEffect(() => {
    // Set initial state
    setIsOffline(!navigator.onLine);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    isOffline,
    isOnline: !isOffline,
    wasOffline,
  };
}

// Hook for detecting connection quality
export function useConnectionQuality() {
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [effectiveType, setEffectiveType] = useState<string>('unknown');
  const [downlink, setDownlink] = useState<number>(0);
  const [rtt, setRtt] = useState<number>(0);

  useEffect(() => {
    // Check if NetworkInformation API is available
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      const updateConnectionInfo = () => {
        setConnectionType(connection.type || 'unknown');
        setEffectiveType(connection.effectiveType || 'unknown');
        setDownlink(connection.downlink || 0);
        setRtt(connection.rtt || 0);
      };

      updateConnectionInfo();
      connection.addEventListener('change', updateConnectionInfo);

      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }
  }, []);

  const isSlowConnection = effectiveType === 'slow-2g' || effectiveType === '2g';
  const isFastConnection = effectiveType === '4g' || downlink > 10;

  return {
    connectionType,
    effectiveType,
    downlink,
    rtt,
    isSlowConnection,
    isFastConnection,
    isSupported: !!(navigator as any).connection,
  };
}

// Hook for network status with retry logic
export function useNetworkStatus() {
  const { isOffline, isOnline, wasOffline } = useOffline();
  const { isSlowConnection, effectiveType } = useConnectionQuality();
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);
  const [offlineDuration, setOfflineDuration] = useState<number>(0);

  useEffect(() => {
    if (isOnline) {
      setLastOnlineTime(new Date());
    }
  }, [isOnline]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOffline && lastOnlineTime) {
      interval = setInterval(() => {
        setOfflineDuration(Date.now() - lastOnlineTime.getTime());
      }, 1000);
    } else {
      setOfflineDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOffline, lastOnlineTime]);

  const getStatusMessage = useCallback(() => {
    if (isOffline) {
      return 'You are currently offline';
    }
    
    if (wasOffline) {
      return 'Connection restored';
    }
    
    if (isSlowConnection) {
      return `Slow connection detected (${effectiveType})`;
    }
    
    return 'Connected';
  }, [isOffline, wasOffline, isSlowConnection, effectiveType]);

  const getStatusColor = useCallback(() => {
    if (isOffline) return 'red';
    if (wasOffline) return 'green';
    if (isSlowConnection) return 'yellow';
    return 'green';
  }, [isOffline, wasOffline, isSlowConnection]);

  return {
    isOffline,
    isOnline,
    wasOffline,
    isSlowConnection,
    effectiveType,
    lastOnlineTime,
    offlineDuration,
    statusMessage: getStatusMessage(),
    statusColor: getStatusColor(),
  };
}