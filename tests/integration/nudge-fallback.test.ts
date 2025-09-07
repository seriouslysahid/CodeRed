// tests/integration/nudge-fallback.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the dependencies
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 1,
              name: 'Test Learner',
              completion_pct: 50,
              quiz_avg: 75,
              missed_sessions: 2,
              risk_label: 'medium'
            },
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: 123 },
            error: null
          }))
        }))
      }))
    }))
  }
}));

vi.mock('@/lib/rate-limit', () => ({
  withRateLimit: vi.fn((handler) => handler)
}));

vi.mock('@/lib/middleware', () => ({
  withErrorHandling: vi.fn((handler) => handler)
}));

describe('Nudge Endpoint Fallback Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should use fallback when AI generation fails', async () => {
    vi.stubEnv('TEST_MODE', '');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('GEMINI_PROJECT', '');
    
    // Mock AI client to fail
    vi.doMock('@/lib/gemini-client', () => ({
      generateLearnerNudge: vi.fn(() => Promise.reject(new Error('AI service unavailable'))),
      streamNudge: vi.fn(() => Promise.reject(new Error('Streaming failed')))
    }));

    const { POST } = await import('@/app/api/learners/[id]/nudge/route');
    
    const mockRequest = {
      url: 'http://localhost:3000/api/learners/1/nudge',
      method: 'POST',
      headers: {
        get: vi.fn(() => null)
      },
      ip: '192.168.1.1'
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.source).toBe('template');
    expect(data.text).toContain('Test'); // Should contain learner name
    expect(data.nudgeId).toBe(123);
  });

  it('should save fallback nudge with correct status', async () => {
    vi.stubEnv('TEST_MODE', '');
    
    // Mock AI client to return fallback
    vi.doMock('@/lib/gemini-client', () => ({
      generateLearnerNudge: vi.fn(() => Promise.resolve('Hey Test, keep up the great work! Try to complete a quick lesson. Small steps win! 🚀')),
      streamNudge: vi.fn(() => Promise.resolve(new ReadableStream()))
    }));

    const { supabaseAdmin } = await import('@/lib/supabase');
    const insertSpy = vi.spyOn(supabaseAdmin, 'from');

    const { POST } = await import('@/app/api/learners/[id]/nudge/route');
    
    const mockRequest = {
      url: 'http://localhost:3000/api/learners/1/nudge',
      method: 'POST',
      headers: {
        get: vi.fn(() => null)
      },
      ip: '192.168.1.1'
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.source).toBe('template');
    
    // Verify database insert was called
    expect(insertSpy).toHaveBeenCalled();
  });

  it('should handle database persistence failure gracefully', async () => {
    vi.stubEnv('TEST_MODE', 'true');
    
    // Mock database insert to fail
    const { supabaseAdmin } = await import('@/lib/supabase');
    vi.mocked(supabaseAdmin.from).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 1,
              name: 'Test Learner',
              completion_pct: 50,
              quiz_avg: 75,
              missed_sessions: 2,
              risk_label: 'medium'
            },
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Database error' }
          }))
        }))
      }))
    } as any);

    const { POST } = await import('@/app/api/learners/[id]/nudge/route');
    
    const mockRequest = {
      url: 'http://localhost:3000/api/learners/1/nudge',
      method: 'POST',
      headers: {
        get: vi.fn(() => null)
      },
      ip: '192.168.1.1'
    } as any;

    const response = await POST(mockRequest);
    
    // Should return error when database fails
    expect(response.status).toBe(500);
  });

  it('should use emergency fallback when all else fails', async () => {
    vi.stubEnv('TEST_MODE', '');
    
    // Mock everything to fail
    vi.doMock('@/lib/gemini-client', () => ({
      generateLearnerNudge: vi.fn(() => Promise.reject(new Error('Complete failure'))),
      streamNudge: vi.fn(() => Promise.reject(new Error('Streaming failed')))
    }));

    const { POST } = await import('@/app/api/learners/[id]/nudge/route');
    
    const mockRequest = {
      url: 'http://localhost:3000/api/learners/1/nudge',
      method: 'POST',
      headers: {
        get: vi.fn(() => null)
      },
      ip: '192.168.1.1'
    } as any;

    const response = await POST(mockRequest);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.source).toBe('template');
    expect(data.text).toContain('Test'); // Emergency fallback should contain name
    expect(data.text).toContain('study session');
  });

  it('should handle streaming fallback', async () => {
    vi.stubEnv('TEST_MODE', 'true');
    
    const { POST } = await import('@/app/api/learners/[id]/nudge/route');
    
    const mockRequest = {
      url: 'http://localhost:3000/api/learners/1/nudge?streaming=true',
      method: 'POST',
      headers: {
        get: vi.fn(() => null)
      },
      ip: '192.168.1.1'
    } as any;

    const response = await POST(mockRequest);
    
    // In TEST_MODE, streaming should work
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
  });
});