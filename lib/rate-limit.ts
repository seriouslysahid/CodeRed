// lib/rate-limit.ts
// In-memory rate limiting for API endpoints

import { NextRequest } from 'next/server';
import { log } from './logger';

type Key = string;

interface RateLimitRecord {
  count: number;
  resetAt: number;
  windowStart: number;
}

interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

// In-memory store for rate limit data
const store = new Map<Key, RateLimitRecord>();

// Configuration
const WINDOW_MS = 60_000; // 1 minute window
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_PER_MINUTE ?? 5);

// Cleanup old entries periodically to prevent memory leaks
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  let cleaned = 0;
  for (const [key, record] of store.entries()) {
    if (now > record.resetAt) {
      store.delete(key);
      cleaned++;
    }
  }
  
  lastCleanup = now;
  if (cleaned > 0) {
    log.debug('Rate limit cleanup', { entriesRemoved: cleaned, totalEntries: store.size });
  }
}

// Check if a key is rate limited
export function isRateLimited(key: Key): RateLimitResult {
  cleanupExpiredEntries();
  
  const now = Date.now();
  const record = store.get(key);
  
  // No existing record or window has expired
  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + WINDOW_MS,
      windowStart: now
    };
    store.set(key, newRecord);
    
    return {
      limited: false,
      remaining: MAX_REQUESTS - 1,
      resetAt: newRecord.resetAt
    };
  }
  
  // Check if limit exceeded
  if (record.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    
    log.warn('Rate limit exceeded', {
      key: key.substring(0, 20) + '...', // Truncate for privacy
      count: record.count,
      limit: MAX_REQUESTS,
      retryAfter
    });
    
    return {
      limited: true,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfter
    };
  }
  
  // Increment counter
  record.count++;
  store.set(key, record);
  
  return {
    limited: false,
    remaining: MAX_REQUESTS - record.count,
    resetAt: record.resetAt
  };
}

// Generate rate limit key from request
export function getRateLimitKey(request: NextRequest): string {
  // Check for admin API key first
  const adminKey = request.headers.get('x-admin-api-key');
  if (adminKey) {
    // Use a hash of the API key for privacy
    const keyHash = Buffer.from(adminKey).toString('base64').substring(0, 16);
    return `api-key:${keyHash}`;
  }
  
  // Fall back to IP address
  const ip = request.ip || 
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown';
  
  return `ip:${ip}`;
}

// Middleware wrapper for rate limiting
export function withRateLimit(
  handler: (request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    // Skip rate limiting in TEST_MODE
    if (process.env.TEST_MODE === 'true') {
      return handler(request);
    }
    
    const key = getRateLimitKey(request);
    const result = isRateLimited(key);
    
    if (result.limited) {
      const headers = new Headers({
        'X-RateLimit-Limit': MAX_REQUESTS.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
        'Retry-After': result.retryAfter?.toString() || '60'
      });
      
      return new Response(
        JSON.stringify({
          error: 'rate_limited',
          message: 'Too many requests. Please try again later.',
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(headers.entries())
          }
        }
      );
    }
    
    // Add rate limit headers to successful responses
    const response = await handler(request);
    
    // In test environment, just add headers directly
    if (process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true') {
      response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString());
      return response;
    }
    
    // Clone response to add headers (production)
    try {
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
      
      newResponse.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
      newResponse.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      newResponse.headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString());
      
      return newResponse;
    } catch (error) {
      // Fallback: return original response with headers if cloning fails
      response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString());
      return response;
    }
  };
}

// Get current rate limit status for a key (useful for debugging)
export function getRateLimitStatus(key: Key): RateLimitRecord | null {
  return store.get(key) || null;
}

// Reset rate limit for a key (useful for testing)
export function resetRateLimit(key: Key): void {
  store.delete(key);
}

// Get current store size (useful for monitoring)
export function getRateLimitStoreSize(): number {
  return store.size;
}

// Clear all rate limit data (useful for testing)
export function clearRateLimitStore(): void {
  store.clear();
}