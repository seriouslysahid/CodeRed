'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { SimulationResponse } from '@/lib/types';

// Query keys
export const simulationKeys = {
  all: ['simulation'] as const,
  status: () => [...simulationKeys.all, 'status'] as const,
};

// Hook for getting simulation status
export function useSimulationStatus() {
  return useQuery({
    queryKey: simulationKeys.status(),
    queryFn: () => apiClient.getSimulationStatus(),
    refetchInterval: (data) => {
      // Poll every 2 seconds if simulation is running
      return data?.isRunning ? 2000 : false;
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 1 * 60 * 1000, // 1 minute
  });
}

// Hook for running simulation
export function useRunSimulation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.runSimulation(),
    onMutate: async () => {
      // Optimistically update simulation status to running
      await queryClient.cancelQueries({ queryKey: simulationKeys.status() });
      
      const previousStatus = queryClient.getQueryData(simulationKeys.status());
      
      queryClient.setQueryData(simulationKeys.status(), {
        isRunning: true,
      });

      return { previousStatus };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousStatus) {
        queryClient.setQueryData(simulationKeys.status(), context.previousStatus);
      }
    },
    onSuccess: (data: SimulationResponse) => {
      // Invalidate simulation status to get fresh data
      queryClient.invalidateQueries({
        queryKey: simulationKeys.status(),
      });
      
      // Invalidate learners data as simulation affects learner risk scores
      queryClient.invalidateQueries({
        queryKey: ['learners'],
      });
    },
  });
}

// Hook for simulation management with cooldown
export function useSimulationManager() {
  const { data: status, ...statusQuery } = useSimulationStatus();
  const runSimulationMutation = useRunSimulation();

  const canRunSimulation = !status?.isRunning && !runSimulationMutation.isPending;

  const runSimulation = async () => {
    if (!canRunSimulation) {
      throw new Error('Simulation is already running or cannot be started at this time');
    }

    return runSimulationMutation.mutateAsync();
  };

  return {
    status,
    canRunSimulation,
    runSimulation,
    isRunning: status?.isRunning || false,
    isLoading: statusQuery.isLoading || runSimulationMutation.isPending,
    error: runSimulationMutation.error,
    lastResult: runSimulationMutation.data,
    ...statusQuery,
  };
}