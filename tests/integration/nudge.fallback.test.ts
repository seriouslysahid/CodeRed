// tests/integration/nudge.fallback.test.ts
import { describe, it, expect, vi } from 'vitest';
import { POST as nudgePostHandler } from '@/app/api/learners/[id]/nudge/route';
import { NextRequest } from 'next/server';
import * as geminiClient from '@/lib/gemini-client';
import * as supabase from '@/lib/supabase';

// Mock the whole gemini-client module
vi.mock('@/lib/gemini-client', async () => {
  const original = await vi.importActual('@/lib/gemini-client');
  return {
    ...original,
    generateLearnerNudge: vi.fn(),
    streamNudge: vi.fn(),
  };
});

const mockSupabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 123, name: 'Test Learner', completion_pct: 50, quiz_avg: 75, missed_sessions: 1, risk_label: 'medium' }, error: null }))
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 1, learner_id: 123, text: 'Fallback nudge', source: 'template', status: 'fallback' }, error: null }))
        }))
      }))
    }))
  };

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: mockSupabase
}));

describe('POST /api/learners/:id/nudge - Fallback Behavior', () => {
  it('should return a fallback nudge when Gemini fails', async () => {
    process.env.TEST_MODE = 'true';
    const learnerId = '123';
    const url = `http://localhost/api/learners/${learnerId}/nudge`;

    // Stub gemini-client to throw an error
    vi.spyOn(geminiClient, 'generateLearnerNudge').mockRejectedValue(new Error('Gemini API failed'));

    const req = new NextRequest(url, { method: 'POST' });
    const response = await nudgePostHandler(req, { params: { id: learnerId } });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.source).toBe('template');
    expect(data.text).toContain('keep up the great work'); // Check for fallback text content

    // Verify that the nudge was persisted with the correct source and status
    const insertCall = (mockSupabase.from('nudges').insert as any).mock.calls[0][0];
    expect(insertCall.source).toBe('template');
    expect(insertCall.status).toBe('fallback');
    
    delete process.env.TEST_MODE;
  });
});
