// Optimized React Query configuration

import { QueryClient } from '@tanstack/react-query';
import { ApiError, NetworkError, TimeoutError } from './errors';

// Cache time constants
export const CACHE_TIMES = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const;

// Stale time constants
export const STALE_TIMES = {
  IMMEDIATE: 0,
  SHORT: 30 * 1000,         // 30 seconds
  MEDIUM: 2 * 60 * 1000,    // 2 minutes
  LONG: 5 * 60 * 1000,      // 5 minutes
  VERY_LONG: 15 * 60 * 1000, // 15 minutes
} as const;

// Retry configuration
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  // Don't retry after 3 attempts
  if (failureCount >= 3) return false;

  if (error instanceof ApiError) {
    // Don't retry client errors (4xx) except for specific cases
    if (error.isClientError && !error.isRateLimited && error.status !== 408) {
      return false;
    }
    // Retry server errors and network issues
    return error.isServerError || error.isNetworkError || error.isRateLimited;
  }

  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true;
  }

  // Don't retry unknown errors
  return false;
};

const getRetryDelay = (attemptIndex: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 30000; // 30 seconds
  const backoffFactor = 2;

  const delay = baseDelay * Math.pow(backoffFactor, attemptIndex);
  return Math.min(delay, maxDelay);
};

// Create optimized query client
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache configuration
        staleTime: STALE_TIMES.MEDIUM,
        gcTime: CACHE_TIMES.LONG, // formerly cacheTime
        
        // Retry configuration
        retry: shouldRetry,
        retryDelay: getRetryDelay,
        
        // Background refetch configuration
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // Performance optimizations
        refetchInterval: false, // Disable automatic refetching by default
        refetchIntervalInBackground: false,
        
        // Error handling
        throwOnError: false,
        
        // Network mode
        networkMode: 'online',
      },
      mutations: {
        // Retry configuration for mutations
        retry: (failureCount, error) => {
          // Don't retry mutations on client errors
          if (error instanceof ApiError && error.isClientError) {
            return false;
          }
          return failureCount < 2;
        },
        retryDelay: getRetryDelay,
        
        // Network mode
        networkMode: 'online',
      },
    },
  });
}

// Query key factories for consistent caching
export const queryKeys = {
  // Learners
  learners: {
    all: ['learners'] as const,
    lists: () => [...queryKeys.learners.all, 'list'] as const,
    list: (params: Record<string, any>) => [...queryKeys.learners.lists(), params] as const,
    details: () => [...queryKeys.learners.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.learners.details(), id] as const,
    riskDistribution: () => [...queryKeys.learners.all, 'risk-distribution'] as const,
  },
  
  // Nudges
  nudges: {
    all: ['nudges'] as const,
    lists: () => [...queryKeys.nudges.all, 'list'] as const,
    list: (learnerId: number) => [...queryKeys.nudges.lists(), learnerId] as const,
  },
  
  // Simulation
  simulation: {
    all: ['simulation'] as const,
    status: () => [...queryKeys.simulation.all, 'status'] as const,
    history: () => [...queryKeys.simulation.all, 'history'] as const,
  },
} as const;

// Cache invalidation utilities
export const cacheUtils = {
  // Invalidate all learner-related queries
  invalidateLearners: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.learners.all,
    });
  },
  
  // Invalidate specific learner
  invalidateLearner: (queryClient: QueryClient, id: number) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.learners.detail(id),
    });
  },
  
  // Invalidate nudges for a learner
  invalidateNudges: (queryClient: QueryClient, learnerId?: number) => {
    if (learnerId) {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.nudges.list(learnerId),
      });
    }
    return queryClient.invalidateQueries({
      queryKey: queryKeys.nudges.all,
    });
  },
  
  // Invalidate simulation data
  invalidateSimulation: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.simulation.all,
    });
  },
  
  // Clear all caches
  clearAll: (queryClient: QueryClient) => {
    return queryClient.clear();
  },
};

// Prefetch utilities
export const prefetchUtils = {
  // Prefetch learners list
  prefetchLearners: (queryClient: QueryClient, params: Record<string, any> = {}) => {
    return queryClient.prefetchInfiniteQuery({
      queryKey: queryKeys.learners.list(params),
      queryFn: async ({ pageParam = 0 }) => {
        // This would be replaced with actual API call
        return { data: [], nextCursor: null, hasMore: false };
      },
      initialPageParam: 0,
      staleTime: STALE_TIMES.MEDIUM,
    });
  },
  
  // Prefetch learner details
  prefetchLearner: (queryClient: QueryClient, id: number) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.learners.detail(id),
      queryFn: async () => {
        // This would be replaced with actual API call
        return null;
      },
      staleTime: STALE_TIMES.LONG,
    });
  },
  
  // Prefetch risk distribution
  prefetchRiskDistribution: (queryClient: QueryClient) => {
    return queryClient.prefetchQuery({
      queryKey: queryKeys.learners.riskDistribution(),
      queryFn: async () => {
        // This would be replaced with actual API call
        return { high: 0, medium: 0, low: 0 };
      },
      staleTime: STALE_TIMES.SHORT,
    });
  },
};

// Background sync utilities
export const backgroundSync = {
  // Set up background refetch for critical data
  setupCriticalDataSync: (queryClient: QueryClient) => {
    // Refetch risk distribution every 30 seconds
    queryClient.refetchQueries({
      queryKey: queryKeys.learners.riskDistribution(),
    });
    
    // Refetch simulation status every 5 seconds if running
    const simulationStatus = queryClient.getQueryData(queryKeys.simulation.status());
    if (simulationStatus && (simulationStatus as any).isRunning) {
      queryClient.refetchQueries({
        queryKey: queryKeys.simulation.status(),
      });
    }
  },
  
  // Optimistic updates for better UX
  optimisticUpdate: <T>(
    queryClient: QueryClient,
    queryKey: readonly unknown[],
    updater: (old: T | undefined) => T
  ) => {
    const previousData = queryClient.getQueryData<T>(queryKey);
    queryClient.setQueryData(queryKey, updater);
    
    return () => {
      queryClient.setQueryData(queryKey, previousData);
    };
  },
};

// Performance monitoring for queries
export const queryPerformance = {
  // Log slow queries in development
  logSlowQueries: (queryClient: QueryClient) => {
    if (process.env.NODE_ENV === 'development') {
      queryClient.getQueryCache().subscribe((event) => {
        if (event.type === 'updated' && event.action.type === 'success') {
          const query = event.query;
          const duration = Date.now() - (query.state.dataUpdatedAt || 0);
          
          if (duration > 1000) { // Log queries taking more than 1 second
            console.warn(`Slow query detected:`, {
              queryKey: query.queryKey,
              duration: `${duration}ms`,
              dataUpdatedAt: query.state.dataUpdatedAt,
            });
          }
        }
      });
    }
  },
  
  // Monitor cache hit rates
  monitorCacheHitRate: (queryClient: QueryClient) => {
    let cacheHits = 0;
    let cacheMisses = 0;
    
    queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated') {
        if (event.action.type === 'success' && event.query.state.dataUpdatedAt) {
          const timeSinceUpdate = Date.now() - event.query.state.dataUpdatedAt;
          if (timeSinceUpdate < 1000) { // Fresh data
            cacheHits++;
          } else {
            cacheMisses++;
          }
        }
      }
    });
    
    // Log cache hit rate every minute in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        const total = cacheHits + cacheMisses;
        if (total > 0) {
          const hitRate = (cacheHits / total) * 100;
          console.log(`Cache hit rate: ${hitRate.toFixed(1)}% (${cacheHits}/${total})`);
        }
      }, 60000);
    }
  },
};