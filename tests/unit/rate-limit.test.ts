// tests/unit/rate-limit.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  isRateLimited, 
  getRateLimitKey, 
  withRateLimit,
  resetRateLimit,
  clearRateLimitStore,
  getRateLimitStoreSize 
} from '@/lib/rate-limit';

// Mock NextRequest
const createMockRequest = (overrides: Partial<any> = {}): any => ({
  ip: '192.168.1.1',
  headers: {
    get: vi.fn((name: string) => {
      const headers: Record<string, string> = {
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '192.168.1.1',
        ...overrides.headers
      };
      return headers[name] || null;
    })
  },
  ...overrides
});

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    clearRateLimitStore();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    clearRateLimitStore();
  });

  describe('isRateLimited', () => {
    it('should allow first request', () => {
      const result = isRateLimited('test-key');
      
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(4); // Default limit is 5
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('should track multiple requests', () => {
      // First request
      const result1 = isRateLimited('test-key');
      expect(result1.limited).toBe(false);
      expect(result1.remaining).toBe(4);
      
      // Second request
      const result2 = isRateLimited('test-key');
      expect(result2.limited).toBe(false);
      expect(result2.remaining).toBe(3);
      
      // Third request
      const result3 = isRateLimited('test-key');
      expect(result3.limited).toBe(false);
      expect(result3.remaining).toBe(2);
    });

    it('should enforce rate limit after max requests', () => {
      const key = 'test-key';
      
      // Make 5 requests (default limit)
      for (let i = 0; i < 5; i++) {
        const result = isRateLimited(key);
        expect(result.limited).toBe(false);
      }
      
      // 6th request should be limited
      const result = isRateLimited(key);
      expect(result.limited).toBe(true);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset after window expires', () => {
      const key = 'test-key';
      
      // Fill up the limit
      for (let i = 0; i < 5; i++) {
        isRateLimited(key);
      }
      
      // Should be limited
      expect(isRateLimited(key).limited).toBe(true);
      
      // Mock time advancement
      vi.useFakeTimers();
      vi.advanceTimersByTime(61000); // Advance past 1 minute window
      
      // Should be allowed again
      const result = isRateLimited(key);
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(4);
      
      vi.useRealTimers();
    });

    it('should handle different keys independently', () => {
      // Fill up limit for key1
      for (let i = 0; i < 5; i++) {
        isRateLimited('key1');
      }
      
      // key1 should be limited
      expect(isRateLimited('key1').limited).toBe(true);
      
      // key2 should still be allowed
      expect(isRateLimited('key2').limited).toBe(false);
    });

    it('should respect custom rate limit from environment', async () => {
      vi.stubEnv('RATE_LIMIT_PER_MINUTE', '2');
      
      // Need to reimport the module to pick up new env var
      vi.resetModules();
      const { isRateLimited } = await import('@/lib/rate-limit');
      
      const key = 'test-key';
      
      // First two requests should be allowed
      expect(isRateLimited(key).limited).toBe(false);
      expect(isRateLimited(key).limited).toBe(false);
      
      // Third request should be limited
      expect(isRateLimited(key).limited).toBe(true);
    });
  });

  describe('getRateLimitKey', () => {
    it('should use admin API key when present', () => {
      const request = createMockRequest({
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'x-admin-api-key') return 'admin-secret-key';
            return null;
          })
        }
      });
      
      const key = getRateLimitKey(request);
      expect(key).toMatch(/^api-key:/);
      expect(key).not.toContain('admin-secret-key'); // Should be hashed
    });

    it('should use IP address when no API key', () => {
      const request = createMockRequest({
        ip: '192.168.1.100'
      });
      
      const key = getRateLimitKey(request);
      expect(key).toBe('ip:192.168.1.100');
    });

    it('should use x-forwarded-for header when no direct IP', () => {
      const request = createMockRequest({
        ip: undefined,
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'x-forwarded-for') return '10.0.0.1, 192.168.1.1';
            return null;
          })
        }
      });
      
      const key = getRateLimitKey(request);
      expect(key).toBe('ip:10.0.0.1'); // Should use first IP
    });

    it('should use x-real-ip header as fallback', () => {
      const request = createMockRequest({
        ip: undefined,
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'x-real-ip') return '172.16.0.1';
            return null;
          })
        }
      });
      
      const key = getRateLimitKey(request);
      expect(key).toBe('ip:172.16.0.1');
    });

    it('should use unknown when no IP available', () => {
      const request = createMockRequest({
        ip: undefined,
        headers: {
          get: vi.fn(() => null)
        }
      });
      
      const key = getRateLimitKey(request);
      expect(key).toBe('ip:unknown');
    });
  });

  describe('withRateLimit middleware', () => {
    it('should skip rate limiting in TEST_MODE', async () => {
      vi.stubEnv('TEST_MODE', 'true');
      
      const mockHandler = vi.fn().mockResolvedValue(new Response('OK'));
      const middleware = withRateLimit(mockHandler);
      const request = createMockRequest();
      
      // Make many requests - should all pass in TEST_MODE
      for (let i = 0; i < 10; i++) {
        const response = await middleware(request);
        expect(response.status).toBe(200);
      }
      
      expect(mockHandler).toHaveBeenCalledTimes(10);
    });

    it('should enforce rate limiting in normal mode', async () => {
      vi.stubEnv('TEST_MODE', '');
      vi.stubEnv('RATE_LIMIT_PER_MINUTE', '2');
      
      vi.resetModules();
      const { withRateLimit } = await import('@/lib/rate-limit');
      
      const mockHandler = vi.fn().mockResolvedValue(
        Response.json({ success: true })
      );
      const middleware = withRateLimit(mockHandler);
      const request = createMockRequest();
      
      // First two requests should succeed
      const response1 = await middleware(request);
      expect(response1.status).toBe(200);
      
      const response2 = await middleware(request);
      expect(response2.status).toBe(200);
      
      // Third request should be rate limited
      const response3 = await middleware(request);
      expect(response3.status).toBe(429);
      
      // Check that it has the proper headers
      expect(response3.headers.get('Retry-After')).toBeTruthy();
      expect(response3.headers.get('X-RateLimit-Remaining')).toBe('0');
      
      // Handler should only be called twice
      expect(mockHandler).toHaveBeenCalledTimes(2);
    });

    it('should add rate limit headers to successful responses', async () => {
      vi.stubEnv('TEST_MODE', '');
      vi.stubEnv('RATE_LIMIT_PER_MINUTE', '5');
      
      vi.resetModules();
      const { withRateLimit } = await import('@/lib/rate-limit');
      
      const mockHandler = vi.fn().mockResolvedValue(
        Response.json({ success: true })
      );
      const middleware = withRateLimit(mockHandler);
      const request = createMockRequest();
      
      const response = await middleware(request);
      
      expect(response.headers.get('X-RateLimit-Limit')).toBe('5');
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('4');
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy();
    });

    it('should include retry-after header in 429 responses', async () => {
      vi.stubEnv('TEST_MODE', '');
      vi.stubEnv('RATE_LIMIT_PER_MINUTE', '1');
      
      vi.resetModules();
      const { withRateLimit } = await import('@/lib/rate-limit');
      
      const mockHandler = vi.fn().mockResolvedValue(
        Response.json({ success: true })
      );
      const middleware = withRateLimit(mockHandler);
      const request = createMockRequest();
      
      // First request succeeds
      await middleware(request);
      
      // Second request is rate limited
      const response = await middleware(request);
      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBeTruthy();
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    });
  });

  describe('utility functions', () => {
    it('should reset rate limit for specific key', () => {
      const key = 'test-key';
      
      // Use up the limit
      for (let i = 0; i < 5; i++) {
        isRateLimited(key);
      }
      
      expect(isRateLimited(key).limited).toBe(true);
      
      // Reset the key
      resetRateLimit(key);
      
      // Should be allowed again
      expect(isRateLimited(key).limited).toBe(false);
    });

    it('should track store size', () => {
      expect(getRateLimitStoreSize()).toBe(0);
      
      isRateLimited('key1');
      expect(getRateLimitStoreSize()).toBe(1);
      
      isRateLimited('key2');
      expect(getRateLimitStoreSize()).toBe(2);
      
      clearRateLimitStore();
      expect(getRateLimitStoreSize()).toBe(0);
    });
  });
});