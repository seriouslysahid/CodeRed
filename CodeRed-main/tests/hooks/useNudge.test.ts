import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { useStreamNudge, useNudgeGeneration } from '@/hooks/useNudge';
import { apiClient } from '@/lib/api-client';
import { StreamError } from '@/lib/errors';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    streamNudge: vi.fn(),
    createNudge: vi.fn(),
    getNudges: vi.fn(),
  },
}));

// Create a wrapper component for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useStreamNudge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  test('should handle successful streaming nudge generation', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Hello '));
        setTimeout(() => {
          controller.enqueue(new TextEncoder().encode('world!'));
          controller.close();
        }, 10);
      }
    });

    vi.mocked(apiClient.streamNudge).mockResolvedValueOnce(mockStream);

    const { result } = renderHook(() => useStreamNudge(), {
      wrapper: createWrapper(),
    });

    expect(result.current.streamState.status).toBe('idle');
    expect(result.current.streamState.text).toBe('');

    await act(async () => {
      await result.current.startStream(1);
    });

    await waitFor(() => {
      expect(result.current.streamState.status).toBe('completed');
    });

    expect(result.current.streamState.text).toBe('Hello world!');
    expect(result.current.isCompleted).toBe(true);
    expect(result.current.isStreaming).toBe(false);
  });

  test('should handle streaming with multiple chunks', async () => {
    const chunks = ['Great ', 'job ', 'on ', 'your ', 'progress!'];
    const mockStream = new ReadableStream({
      start(controller) {
        chunks.forEach((chunk, index) => {
          setTimeout(() => {
            controller.enqueue(new TextEncoder().encode(chunk));
            if (index === chunks.length - 1) {
              controller.close();
            }
          }, index * 10);
        });
      }
    });

    vi.mocked(apiClient.streamNudge).mockResolvedValueOnce(mockStream);

    const { result } = renderHook(() => useStreamNudge(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.startStream(1);
    });

    await waitFor(() => {
      expect(result.current.streamState.status).toBe('completed');
    });

    expect(result.current.streamState.text).toBe('Great job on your progress!');
  });

  test('should handle stream cancellation', async () => {
    const mockStream = new ReadableStream({
      start(controller) {
        // Simulate a long-running stream
        setTimeout(() => {
          controller.enqueue(new TextEncoder().encode('This should be cancelled'));
        }, 100);
      }
    });

    vi.mocked(apiClient.streamNudge).mockImplementationOnce((learnerId, signal) => {
      // Simulate abort after 50ms
      setTimeout(() => {
        signal?.dispatchEvent(new Event('abort'));
      }, 50);
      
      return Promise.resolve(mockStream);
    });

    const { result } = renderHook(() => useStreamNudge(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.startStream(1);
    });

    // Cancel the stream
    act(() => {
      result.current.cancelStream();
    });

    await waitFor(() => {
      expect(result.current.streamState.status).toBe('cancelled');
    });

    expect(result.current.isCancelled).toBe(true);
  });

  test('should handle stream errors', async () => {
    const error = new StreamError('Stream failed');
    vi.mocked(apiClient.streamNudge).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useStreamNudge(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.startStream(1);
      } catch (e) {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.streamState.status).toBe('error');
    });

    expect(result.current.streamState.error).toBe('Stream failed');
    expect(result.current.isError).toBe(true);
  });

  test('should handle fallback responses', async () => {
    const error = new StreamError('Fallback response received');
    vi.mocked(apiClient.streamNudge).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useStreamNudge(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.startStream(1);
      } catch (e) {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.streamState.status).toBe('error');
    });

    expect(result.current.streamState.isFallback).toBe(true);
  });

  test('should reset stream state', () => {
    const { result } = renderHook(() => useStreamNudge(), {
      wrapper: createWrapper(),
    });

    // Set some state
    act(() => {
      result.current.startStream(1);
    });

    // Reset
    act(() => {
      result.current.resetStream();
    });

    expect(result.current.streamState.status).toBe('idle');
    expect(result.current.streamState.text).toBe('');
    expect(result.current.streamState.error).toBeUndefined();
  });
});

describe('useNudgeGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should enforce rate limiting', async () => {
    const { result } = renderHook(() => useNudgeGeneration(), {
      wrapper: createWrapper(),
    });

    // First nudge should be allowed
    expect(result.current.canGenerateNudge(1)).toBe(true);

    // Mock successful stream
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Test nudge'));
        controller.close();
      }
    });
    vi.mocked(apiClient.streamNudge).mockResolvedValueOnce(mockStream);

    await act(async () => {
      await result.current.generateStreamingNudge(1);
    });

    // Second nudge should be blocked by rate limiting
    expect(result.current.canGenerateNudge(1)).toBe(false);
    expect(result.current.getCooldownRemaining(1)).toBeGreaterThan(0);

    // Should throw error when trying to generate too soon
    await expect(
      act(async () => {
        await result.current.generateStreamingNudge(1);
      })
    ).rejects.toThrow(/Please wait/);
  });

  test('should allow nudge generation after cooldown', async () => {
    const { result } = renderHook(() => useNudgeGeneration(), {
      wrapper: createWrapper(),
    });

    // Mock successful stream
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Test nudge'));
        controller.close();
      }
    });
    vi.mocked(apiClient.streamNudge).mockResolvedValue(mockStream);

    // Generate first nudge
    await act(async () => {
      await result.current.generateStreamingNudge(1);
    });

    expect(result.current.canGenerateNudge(1)).toBe(false);

    // Fast-forward past cooldown period (30 seconds)
    act(() => {
      vi.advanceTimersByTime(31000);
    });

    // Should be able to generate again
    expect(result.current.canGenerateNudge(1)).toBe(true);
    expect(result.current.getCooldownRemaining(1)).toBe(0);
  });

  test('should track cooldown for different learners separately', async () => {
    const { result } = renderHook(() => useNudgeGeneration(), {
      wrapper: createWrapper(),
    });

    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Test nudge'));
        controller.close();
      }
    });
    vi.mocked(apiClient.streamNudge).mockResolvedValue(mockStream);

    // Generate nudge for learner 1
    await act(async () => {
      await result.current.generateStreamingNudge(1);
    });

    // Learner 1 should be rate limited
    expect(result.current.canGenerateNudge(1)).toBe(false);
    
    // Learner 2 should still be allowed
    expect(result.current.canGenerateNudge(2)).toBe(true);

    // Generate nudge for learner 2
    await act(async () => {
      await result.current.generateStreamingNudge(2);
    });

    // Both should now be rate limited
    expect(result.current.canGenerateNudge(1)).toBe(false);
    expect(result.current.canGenerateNudge(2)).toBe(false);
  });
});