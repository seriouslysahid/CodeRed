'use client';

import { useState, useCallback, useRef } from 'react';
import { useErrorHandling } from './useErrorHandling';

export interface RetryConfig {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown) => void;
  onMaxAttemptsReached?: (error: unknown) => void;
}

export interface RetryState {
  isRetrying: boolean;
  attemptCount: number;
  lastError: unknown;
  nextRetryIn: number;
}

export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  config: RetryConfig = {}
) {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    retryCondition,
    onRetry,
    onMaxAttemptsReached,
  } = config;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attemptCount: 0,
    lastError: null,
    nextRetryIn: 0,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { shouldRetry: defaultShouldRetry, getRetryDelay } = useErrorHandling();

  const calculateDelay = useCallback((attempt: number) => {
    const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt), maxDelay);
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }, [baseDelay, backoffFactor, maxDelay]);

  const executeWithRetry = useCallback(async (): Promise<T> => {
    let lastError: unknown;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      setState(prev => ({
        ...prev,
        attemptCount: attempt + 1,
        isRetrying: attempt > 0,
      }));

      try {
        const result = await asyncFunction();
        
        // Success - reset state
        setState({
          isRetrying: false,
          attemptCount: 0,
          lastError: null,
          nextRetryIn: 0,
        });
        
        return result;
      } catch (error) {
        lastError = error;
        
        setState(prev => ({
          ...prev,
          lastError: error,
        }));

        // Check if we should retry
        const shouldRetryThis = retryCondition 
          ? retryCondition(error)
          : defaultShouldRetry(error, attempt);

        if (!shouldRetryThis || attempt === maxAttempts - 1) {
          break;
        }

        // Calculate delay for next attempt
        const delay = calculateDelay(attempt);
        
        setState(prev => ({
          ...prev,
          nextRetryIn: delay,
        }));

        onRetry?.(attempt + 1, error);

        // Wait before next attempt
        await new Promise(resolve => {
          timeoutRef.current = setTimeout(resolve, delay);
        });
      }
    }

    // All attempts failed
    setState(prev => ({
      ...prev,
      isRetrying: false,
    }));

    onMaxAttemptsReached?.(lastError);
    throw lastError;
  }, [
    asyncFunction,
    maxAttempts,
    calculateDelay,
    retryCondition,
    defaultShouldRetry,
    onRetry,
    onMaxAttemptsReached,
  ]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setState({
      isRetrying: false,
      attemptCount: 0,
      lastError: null,
      nextRetryIn: 0,
    });
  }, []);

  const retry = useCallback(() => {
    return executeWithRetry();
  }, [executeWithRetry]);

  return {
    ...state,
    execute: executeWithRetry,
    retry,
    cancel,
  };
}

// Hook for automatic retry with exponential backoff
export function useAutoRetry<T>(
  asyncFunction: () => Promise<T>,
  dependencies: React.DependencyList,
  config: RetryConfig & { enabled?: boolean } = {}
) {
  const { enabled = true, ...retryConfig } = config;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    execute,
    isRetrying,
    attemptCount,
    lastError,
    cancel,
  } = useRetry(asyncFunction, {
    ...retryConfig,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}:`, error);
      retryConfig.onRetry?.(attempt, error);
    },
    onMaxAttemptsReached: (error) => {
      setError(error);
      setIsLoading(false);
      retryConfig.onMaxAttemptsReached?.(error);
    },
  });

  const executeAsync = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await execute();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [execute, enabled]);

  // Execute on dependency changes
  React.useEffect(() => {
    executeAsync();
    
    return () => {
      cancel();
    };
  }, [...dependencies, executeAsync]);

  const refetch = useCallback(() => {
    return executeAsync();
  }, [executeAsync]);

  return {
    data,
    error: error || lastError,
    isLoading: isLoading || isRetrying,
    isRetrying,
    attemptCount,
    refetch,
    cancel,
  };
}

// Utility function for creating retry-enabled API calls
export function createRetryableFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  config: RetryConfig = {}
) {
  return async (...args: T): Promise<R> => {
    const { execute } = useRetry(() => fn(...args), config);
    return execute();
  };
}

// Hook for rate limiting detection and handling
export function useRateLimit() {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  const handleRateLimit = useCallback((retryAfterSeconds: number) => {
    setIsRateLimited(true);
    setRetryAfter(retryAfterSeconds);
    setCooldownRemaining(retryAfterSeconds);

    // Start countdown
    const interval = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1) {
          setIsRateLimited(false);
          setRetryAfter(0);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const checkRateLimit = useCallback((error: unknown) => {
    // Check if error is a rate limit error (429)
    if (error && typeof error === 'object' && 'status' in error) {
      const apiError = error as { status: number; headers?: Headers };
      if (apiError.status === 429) {
        const retryAfterHeader = apiError.headers?.get('Retry-After');
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
        handleRateLimit(retryAfterSeconds);
        return true;
      }
    }
    return false;
  }, [handleRateLimit]);

  return {
    isRateLimited,
    retryAfter,
    cooldownRemaining,
    handleRateLimit,
    checkRateLimit,
  };
}