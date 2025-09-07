'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError, NetworkError, TimeoutError } from '@/lib/errors';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

export function useErrorHandling() {
  const queryClient = useQueryClient();

  const getErrorMessage = useCallback((error: unknown): string => {
    if (error instanceof ApiError) {
      if (error.isNetworkError) {
        return 'Network connection failed. Please check your internet connection.';
      }
      if (error.isServerError) {
        return 'Server error occurred. Please try again later.';
      }
      if (error.isRateLimited) {
        return 'Too many requests. Please wait a moment before trying again.';
      }
      if (error.isUnauthorized) {
        return 'Authentication required. Please log in again.';
      }
      if (error.isForbidden) {
        return 'You do not have permission to perform this action.';
      }
      if (error.isNotFound) {
        return 'The requested resource was not found.';
      }
      return error.message;
    }

    if (error instanceof NetworkError) {
      return 'Network connection failed. Please check your internet connection and try again.';
    }

    if (error instanceof TimeoutError) {
      return 'Request timed out. Please try again.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }, []);

  const shouldRetry = useCallback((error: unknown, failureCount: number): boolean => {
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
  }, []);

  const getRetryDelay = useCallback((
    attemptIndex: number, 
    options: RetryOptions = {}
  ): number => {
    const {
      baseDelay = 1000,
      maxDelay = 30000,
      backoffFactor = 2,
    } = options;

    const delay = baseDelay * Math.pow(backoffFactor, attemptIndex);
    return Math.min(delay, maxDelay);
  }, []);

  const retryWithBackoff = useCallback(async <T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const { maxRetries = 3 } = options;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries || !shouldRetry(error, attempt)) {
          throw error;
        }

        const delay = getRetryDelay(attempt, options);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }, [shouldRetry, getRetryDelay]);

  const invalidateOnError = useCallback((error: unknown, queryKeys: string[][]) => {
    // Invalidate specific queries on certain errors to refetch fresh data
    if (error instanceof ApiError && (error.isServerError || error.status === 404)) {
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    }
  }, [queryClient]);

  const handleMutationError = useCallback((error: unknown) => {
    // Log error for monitoring (in production, send to error tracking service)
    console.error('Mutation error:', error);

    // Return user-friendly error message
    return getErrorMessage(error);
  }, [getErrorMessage]);

  return {
    getErrorMessage,
    shouldRetry,
    getRetryDelay,
    retryWithBackoff,
    invalidateOnError,
    handleMutationError,
  };
}