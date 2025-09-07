// tests/integration/nudge.streaming.test.ts
import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/learners/[id]/nudge/route';
import { NextRequest } from 'next/server';
import * as geminiClient from '@/lib/gemini-client';
import { supabaseAdmin } from '@/lib/supabase';

// Mock gemini-client
vi.mock('@/lib/gemini-client', async () => {
    const original = await vi.importActual('@/lib/gemini-client');
    const { Readable } = require('stream');
    return {
        ...original,
        streamNudge: vi.fn(() => {
            const stream = new Readable();
            stream.push('data: {"candidates":[{"content":{"parts":[{"text":"Hello"}]}}]}\n\n');
            stream.push('data: {"candidates":[{"content":{"parts":[{"text":" World"}]}}]}\n\n');
            stream.push(null);
            return Promise.resolve(stream);
        }),
    };
});

// Mock supabase
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

describe('POST /api/learners/:id/nudge - Streaming Behavior', () => {
  it('should return a streaming response and persist the nudge', async () => {
    process.env.TEST_MODE = 'true';
    const learnerId = '456';
    const url = `http://localhost/api/learners/${learnerId}/nudge?stream=true`;

    const req = new NextRequest(url, { method: 'POST' });
    const response = await POST(req, { params: { id: learnerId } });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.body).toBeInstanceOf(ReadableStream);

    // Consume the stream to verify its content
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let done = false;
    while(!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
            result += decoder.decode(value);
        }
    }

    expect(result).toContain('data: {"type":"start","learnerId":456}');
    expect(result).toContain('data: {"type":"chunk","text":"Hello"');
    expect(result).toContain('data: {"type":"chunk","text":" World"');
    expect(result).toContain('data: {"type":"complete","text":"Hello World"');

    // Let stream processing finish
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify that the final nudge was persisted
    const insertCall = (supabaseAdmin.from('nudges').insert as any).mock.calls[0][0];
    expect(insertCall.learner_id).toBe(456);
    expect(insertCall.text).toBe('Hello World');
    expect(insertCall.source).toBe('gemini');

    delete process.env.TEST_MODE;
  });
});
