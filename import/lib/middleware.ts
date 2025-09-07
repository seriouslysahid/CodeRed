// lib/middleware.ts
// Middleware utilities for API routes

import { NextRequest } from 'next/server';
import { AuthError, generateRequestId, normalizeError } from './errors';
import { log } from './logger';
import { z } from 'zod';
import { parseBody } from './validation';

// Admin authentication middleware
export function requireAdmin(request: NextRequest): void {
  const adminKey = process.env.ADMIN_API_KEY;
  
  if (!adminKey) {
    log.error('ADMIN_API_KEY not configured');
    throw new AuthError('Admin operations not available');
  }
  
  const providedKey = request.headers.get('x-admin-api-key');
  
  if (!providedKey || providedKey !== adminKey) {
    log.warn('Unauthorized admin access attempt', {
      ip: request.ip,
      userAgent: request.headers.get('user-agent')
    });
    throw new AuthError('Invalid admin credentials');
  }
}

// Validation middleware wrapper
export function withValidation<T>(
  schema: z.ZodType<T>,
  handler: (data: T, request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    const requestId = generateRequestId();
    
    try {
      const body = await request.json().catch(() => ({}));
      const validatedData = parseBody(schema, body);
      
      log.info('Request validated', {
        requestId,
        method: request.method,
        url: request.url,
        dataKeys: Object.keys(validatedData as any)
      });
      
      return await handler(validatedData, request);
    } catch (error) {
      log.error('Request validation failed', {
        requestId,
        method: request.method,
        url: request.url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      const { status, response } = normalizeError(error, requestId);
      return Response.json(response, { status });
    }
  };
}

// Generic error handling wrapper for API routes
export function withErrorHandling(
  handler: (request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    const requestId = generateRequestId();
    
    try {
      log.info('API request started', {
        requestId,
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent')
      });
      
      const response = await handler(request);
      
      log.info('API request completed', {
        requestId,
        status: response.status
      });
      
      return response;
    } catch (error) {
      log.error('API request failed', {
        requestId,
        method: request.method,
        url: request.url,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      const { status, response } = normalizeError(error, requestId);
      return Response.json(response, { status });
    }
  };
}

// Helper to parse JSON body safely
export async function parseJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

// Helper to get pagination parameters from URL
export function getPaginationParams(request: NextRequest): { cursor?: number; limit: number } {
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');
  const limit = url.searchParams.get('limit');
  
  return {
    cursor: cursor ? parseInt(cursor, 10) : undefined,
    limit: limit ? Math.min(parseInt(limit, 10), 100) : 50
  };
}