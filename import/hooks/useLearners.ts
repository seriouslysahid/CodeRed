'use client';

import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { 
  Learner, 
  PaginatedResponse, 
  LearnersQueryParams,
  RiskDistribution 
} from '@/lib/types';

// Query keys
export const learnersKeys = {
  all: ['learners'] as const,
  lists: () => [...learnersKeys.all, 'list'] as const,
  list: (params: LearnersQueryParams) => [...learnersKeys.lists(), params] as const,
  details: () => [...learnersKeys.all, 'detail'] as const,
  detail: (id: number) => [...learnersKeys.details(), id] as const,
  riskDistribution: () => [...learnersKeys.all, 'risk-distribution'] as const,
};

// Hook for infinite learners list with cursor pagination
export function useLearners(params: LearnersQueryParams = {}) {
  return useInfiniteQuery({
    queryKey: learnersKeys.list(params),
    queryFn: async ({ pageParam = 0 }) => {
      const queryParams = {
        ...params,
        cursor: pageParam,
        limit: params.limit || 20,
      };
      
      return apiClient.getLearners(queryParams);
    },
    getNextPageParam: (lastPage: PaginatedResponse<Learner>) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for single learner details
export function useLearner(id: number, enabled = true) {
  return useQuery({
    queryKey: learnersKeys.detail(id),
    queryFn: () => apiClient.getLearner(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for risk distribution data
export function useRiskDistribution() {
  return useQuery({
    queryKey: learnersKeys.riskDistribution(),
    queryFn: () => apiClient.getRiskDistribution(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Prefetch utilities
export function useLearnersPrefetch() {
  const queryClient = useQueryClient();

  const prefetchLearners = (params: LearnersQueryParams = {}) => {
    return queryClient.prefetchInfiniteQuery({
      queryKey: learnersKeys.list(params),
      queryFn: async ({ pageParam = 0 }) => {
        const queryParams = {
          ...params,
          cursor: pageParam,
          limit: params.limit || 20,
        };
        
        return apiClient.getLearners(queryParams);
      },
      initialPageParam: 0,
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchLearner = (id: number) => {
    return queryClient.prefetchQuery({
      queryKey: learnersKeys.detail(id),
      queryFn: () => apiClient.getLearner(id),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchRiskDistribution = () => {
    return queryClient.prefetchQuery({
      queryKey: learnersKeys.riskDistribution(),
      queryFn: () => apiClient.getRiskDistribution(),
      staleTime: 1 * 60 * 1000,
    });
  };

  return {
    prefetchLearners,
    prefetchLearner,
    prefetchRiskDistribution,
  };
}

// Cache invalidation utilities
export function useLearnersCache() {
  const queryClient = useQueryClient();

  const invalidateLearners = () => {
    return queryClient.invalidateQueries({
      queryKey: learnersKeys.all,
    });
  };

  const invalidateLearnersList = (params?: LearnersQueryParams) => {
    if (params) {
      return queryClient.invalidateQueries({
        queryKey: learnersKeys.list(params),
      });
    }
    return queryClient.invalidateQueries({
      queryKey: learnersKeys.lists(),
    });
  };

  const invalidateLearner = (id: number) => {
    return queryClient.invalidateQueries({
      queryKey: learnersKeys.detail(id),
    });
  };

  const invalidateRiskDistribution = () => {
    return queryClient.invalidateQueries({
      queryKey: learnersKeys.riskDistribution(),
    });
  };

  const updateLearnerCache = (id: number, updater: (old: Learner) => Learner) => {
    queryClient.setQueryData(learnersKeys.detail(id), updater);
    
    // Also update the learner in any lists that might contain it
    queryClient.setQueriesData(
      { queryKey: learnersKeys.lists() },
      (old: any) => {
        if (!old?.pages) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: PaginatedResponse<Learner>) => ({
            ...page,
            data: page.data.map((learner) =>
              learner.id === id ? updater(learner) : learner
            ),
          })),
        };
      }
    );
  };

  return {
    invalidateLearners,
    invalidateLearnersList,
    invalidateLearner,
    invalidateRiskDistribution,
    updateLearnerCache,
  };
}

// Utility hook to get all learners from infinite query
export function useAllLearners(params: LearnersQueryParams = {}) {
  const { data, ...rest } = useLearners(params);
  
  const allLearners = data?.pages.flatMap(page => page.data) ?? [];
  
  return {
    learners: allLearners,
    totalCount: allLearners.length,
    ...rest,
  };
}