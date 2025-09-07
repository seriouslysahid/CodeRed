// tests/integration/nudge.rate-limit.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { POST } from '@/app/api/learners/[id]/nudge/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 123, name: 'Test Learner', completion_pct: 50, quiz_avg: 75, missed_sessions: 1, risk_label: 'medium' }, error: null }))
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))
        }))
      }))
    }))
  }
}));

vi.mock('@/lib/gemini-client', () => ({
    generateLearnerNudge: () => Promise.resolve({ text: 'mocked nudge', source: 'gemini' })
}));

vi.mock('@/lib/rate-limit', async () => {
    const original = await vi.importActual('@/lib/rate-limit');
    const rateLimitState = new Map();
    return {
        ...original,
        rateLimit: (ip) => {
            if (process.env.TEST_MODE !== 'true') {
                return { success: true };
            }
            const now = Date.now();
            const window = 60 * 1000; // 1 minute
            const limit = 5;
            const records = (rateLimitState.get(ip) || []).filter(ts => ts > now - window);
            
            if (records.length >= limit) {
                return { success: false, reset: (records[0] || now) + window };
            }
            
            records.push(now);
            rateLimitState.set(ip, records);
            return { success: true };
        }
    };
});


describe('POST /api/learners/:id/nudge - Rate Limiting', () => {

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return 429 after 5 requests in TEST_MODE', async () => {
    const learnerId = '123';
    const url = `http://localhost/api/learners/${learnerId}/nudge`;
    
    process.env.TEST_MODE = 'true';

    const responses = [];
    for (let i = 0; i < 5; i++) {
        const req = new NextRequest(url, { method: 'POST' });
        const response = await POST(req, { params: { id: learnerId } });
        responses.push(response);
    }

    for (const res of responses) {
      expect(res.status).toBe(200);
    }

    const req = new NextRequest(url, { method: 'POST' });
    const sixthResponse = await POST(req, { params: { id: learnerId } });

    expect(sixthResponse.status).toBe(429);
    const data = await sixthResponse.json();
    expect(data.error).toContain('Too many requests');
    expect(sixthResponse.headers.get('Retry-After')).toBeDefined();

    delete process.env.TEST_MODE;
  }, 10000);
});
