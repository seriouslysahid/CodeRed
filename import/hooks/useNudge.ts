'use client';

import { useState, useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { StreamError } from '@/lib/errors';
import type { 
  Nudge, 
  CreateNudgeRequest, 
  CreateNudgeResponse,
  NudgeStreamState 
} from '@/lib/types';

// Query keys
export const nudgeKeys = {
  all: ['nudges'] as const,
  lists: () => [...nudgeKeys.all, 'list'] as const,
  list: (learnerId: number) => [...nudgeKeys.lists(), learnerId] as const,
};

// Hook for getting nudges for a specific learner
export function useNudges(learnerId: number, enabled = true) {
  return useQuery({
    queryKey: nudgeKeys.list(learnerId),
    queryFn: () => apiClient.getNudges(learnerId),
    enabled: enabled && !!learnerId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for creating nudges (non-streaming)
export function useCreateNudge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateNudgeRequest) => apiClient.createNudge(request),
    onSuccess: (data: CreateNudgeResponse) => {
      // Invalidate nudges list for this learner
      queryClient.invalidateQueries({
        queryKey: nudgeKeys.list(data.nudge.learnerId),
      });
      
      // Also invalidate learners data as nudge creation might affect learner state
      queryClient.invalidateQueries({
        queryKey: ['learners'],
      });
    },
  });
}

// Hook for streaming nudge generation
export function useStreamNudge() {
  const [streamState, setStreamState] = useState<NudgeStreamState>({
    text: '',
    status: 'idle',
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const startStream = useCallback(async (learnerId: number) => {
    // Reset state
    setStreamState({
      text: '',
      status: 'streaming',
    });

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const stream = await apiClient.streamNudge(
        learnerId, 
        abortControllerRef.current.signal
      );

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setStreamState(prev => ({
            ...prev,
            status: 'completed',
          }));
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setStreamState(prev => ({
          ...prev,
          text: accumulatedText,
        }));
      }

      // Invalidate nudges and learners data after successful stream
      queryClient.invalidateQueries({
        queryKey: nudgeKeys.list(learnerId),
      });
      queryClient.invalidateQueries({
        queryKey: ['learners'],
      });

    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setStreamState(prev => ({
          ...prev,
          status: 'cancelled',
        }));
      } else if (error instanceof StreamError) {
        setStreamState(prev => ({
          ...prev,
          status: 'error',
          error: error.message,
          isFallback: error.message.includes('fallback'),
        }));
      } else {
        setStreamState(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }));
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, [queryClient]);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const resetStream = useCallback(() => {
    cancelStream();
    setStreamState({
      text: '',
      status: 'idle',
    });
  }, [cancelStream]);

  return {
    streamState,
    startStream,
    cancelStream,
    resetStream,
    isStreaming: streamState.status === 'streaming',
    isCompleted: streamState.status === 'completed',
    isError: streamState.status === 'error',
    isCancelled: streamState.status === 'cancelled',
  };
}

// Hook for nudge generation with rate limiting and cooldown
export function useNudgeGeneration() {
  const [lastNudgeTime, setLastNudgeTime] = useState<Record<number, number>>({});
  const [cooldownRemaining, setCooldownRemaining] = useState<Record<number, number>>({});
  
  const COOLDOWN_DURATION = 30 * 1000; // 30 seconds
  
  const { startStream, ...streamHook } = useStreamNudge();
  const createNudgeMutation = useCreateNudge();

  const canGenerateNudge = useCallback((learnerId: number) => {
    const lastTime = lastNudgeTime[learnerId];
    if (!lastTime) return true;
    
    const timeSinceLastNudge = Date.now() - lastTime;
    return timeSinceLastNudge >= COOLDOWN_DURATION;
  }, [lastNudgeTime]);

  const getCooldownRemaining = useCallback((learnerId: number) => {
    const lastTime = lastNudgeTime[learnerId];
    if (!lastTime) return 0;
    
    const timeSinceLastNudge = Date.now() - lastTime;
    const remaining = Math.max(0, COOLDOWN_DURATION - timeSinceLastNudge);
    return Math.ceil(remaining / 1000); // Return seconds
  }, [lastNudgeTime]);

  const generateStreamingNudge = useCallback(async (learnerId: number) => {
    if (!canGenerateNudge(learnerId)) {
      throw new Error(`Please wait ${getCooldownRemaining(learnerId)} seconds before generating another nudge`);
    }

    setLastNudgeTime(prev => ({ ...prev, [learnerId]: Date.now() }));
    
    // Start cooldown timer
    const updateCooldown = () => {
      const remaining = getCooldownRemaining(learnerId);
      setCooldownRemaining(prev => ({ ...prev, [learnerId]: remaining }));
      
      if (remaining > 0) {
        setTimeout(updateCooldown, 1000);
      }
    };
    updateCooldown();

    return startStream(learnerId);
  }, [canGenerateNudge, getCooldownRemaining, startStream]);

  const generateNudge = useCallback(async (request: CreateNudgeRequest) => {
    if (!canGenerateNudge(request.learnerId)) {
      throw new Error(`Please wait ${getCooldownRemaining(request.learnerId)} seconds before generating another nudge`);
    }

    setLastNudgeTime(prev => ({ ...prev, [request.learnerId]: Date.now() }));
    
    return createNudgeMutation.mutateAsync(request);
  }, [canGenerateNudge, getCooldownRemaining, createNudgeMutation]);

  return {
    ...streamHook,
    generateStreamingNudge,
    generateNudge,
    canGenerateNudge,
    getCooldownRemaining: (learnerId: number) => cooldownRemaining[learnerId] || 0,
    isCreatingNudge: createNudgeMutation.isPending,
    createNudgeError: createNudgeMutation.error,
  };
}

// Cache utilities for nudges
export function useNudgeCache() {
  const queryClient = useQueryClient();

  const invalidateNudges = (learnerId?: number) => {
    if (learnerId) {
      return queryClient.invalidateQueries({
        queryKey: nudgeKeys.list(learnerId),
      });
    }
    return queryClient.invalidateQueries({
      queryKey: nudgeKeys.all,
    });
  };

  const addNudgeToCache = (nudge: Nudge) => {
    queryClient.setQueryData(
      nudgeKeys.list(nudge.learnerId),
      (old: Nudge[] | undefined) => {
        if (!old) return [nudge];
        return [nudge, ...old];
      }
    );
  };

  return {
    invalidateNudges,
    addNudgeToCache,
  };
}