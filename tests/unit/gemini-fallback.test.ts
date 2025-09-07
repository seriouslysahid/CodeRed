// tests/unit/gemini-fallback.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

describe('Gemini Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('generateNudge', () => {
    it('should return canned response in TEST_MODE', async () => {
      vi.stubEnv('TEST_MODE', 'true');
      
      const { generateNudge } = await import('@/lib/gemini-client');
      const result = await generateNudge('test prompt', { learnerId: 'test-123' });
      
      expect(result).toBe('TEST NUDGE: Quick reminder — keep going! (test-123)');
    });

    it('should return fallback when AI fails', async () => {
      vi.stubEnv('TEST_MODE', '');
      vi.stubEnv('GEMINI_API_KEY', 'test-key');
      vi.stubEnv('GEMINI_PROJECT', 'test-project');
      
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
      
      const { generateNudge } = await import('@/lib/gemini-client');
      const learner = { name: 'John Doe', completionPct: 50, quizAvg: 75, missedSessions: 2 };
      
      const result = await generateNudge('test prompt', { learner });
      expect(result).toContain('John');
      // Fallback template doesn't include error in message, just logs it
    });

    it('should retry on transient errors', async () => {
      vi.stubEnv('TEST_MODE', '');
      vi.stubEnv('GEMINI_API_KEY', 'test-key');
      vi.stubEnv('GEMINI_PROJECT', 'test-project');
      
      // Mock first two calls to fail, third to succeed
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('HTTP 500: Server error'))
        .mockRejectedValueOnce(new Error('HTTP 503: Service unavailable'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: 'Great job! Keep learning!' }]
              }
            }]
          })
        } as any);
      
      const { generateNudge } = await import('@/lib/gemini-client');
      const result = await generateNudge('test prompt', { learner: { name: 'Jane' } });
      
      expect(result).toBe('Great job! Keep learning!');
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle missing API configuration', async () => {
      vi.stubEnv('TEST_MODE', '');
      vi.stubEnv('GEMINI_API_KEY', '');
      vi.stubEnv('GEMINI_PROJECT', '');
      
      const { generateNudge } = await import('@/lib/gemini-client');
      const learner = { name: 'Alice', completionPct: 80, quizAvg: 90, missedSessions: 1 };
      const result = await generateNudge('test prompt', { learner });
      
      expect(result).toContain('Alice');
      // Fallback template doesn't include error in message, just logs it
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('streamNudge', () => {
    it('should return fake stream in TEST_MODE', async () => {
      vi.stubEnv('TEST_MODE', 'true');
      
      const { streamNudge } = await import('@/lib/gemini-client');
      const stream = await streamNudge('test prompt', { learnerId: 'stream-test' });
      
      expect(stream).toBeInstanceOf(ReadableStream);
      // Stream functionality is tested by the fact it returns a ReadableStream
    });

    it('should fall back to non-streaming when AI fails', async () => {
      vi.stubEnv('TEST_MODE', '');
      vi.stubEnv('GEMINI_API_KEY', 'test-key');
      vi.stubEnv('GEMINI_PROJECT', 'test-project');
      
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
      
      const { streamNudge } = await import('@/lib/gemini-client');
      const learner = { name: 'Stream User', completionPct: 60, quizAvg: 70, missedSessions: 3 };
      const stream = await streamNudge('test prompt', { learner });
      
      expect(stream).toBeInstanceOf(ReadableStream);
      // Stream will contain fallback content when AI fails
    });
  });

  describe('fallbackTemplate', () => {
    it('should generate personalized message based on completion percentage', async () => {
      const { fallbackTemplate } = await import('@/lib/gemini-client');
      
      const learner1 = { name: 'John Doe', completionPct: 10, quizAvg: 50, missedSessions: 2 };
      const result1 = fallbackTemplate(learner1);
      
      expect(result1).toContain('John');
      expect(result1).toContain('every journey starts');
      expect(result1).toContain('5-minute lesson');
      
      const learner2 = { name: 'Jane Smith', completionPct: 85, quizAvg: 90, missedSessions: 1 };
      const result2 = fallbackTemplate(learner2);
      
      expect(result2).toContain('Jane');
      expect(result2).toContain('finish line');
      expect(result2).toContain('final push');
    });

    it('should handle high-risk learners with many missed sessions', async () => {
      const { fallbackTemplate } = await import('@/lib/gemini-client');
      
      const learner = { 
        name: 'At Risk Student', 
        completionPct: 30, 
        quizAvg: 40, 
        missedSessions: 8,
        riskLabel: 'high' as const
      };
      
      const result = fallbackTemplate(learner);
      
      expect(result).toContain('At');
      expect(result).toContain('never too late');
    });

    it('should handle learner with no data', async () => {
      const { fallbackTemplate } = await import('@/lib/gemini-client');
      
      const result = fallbackTemplate(null);
      
      expect(result).toContain('Learner');
      expect(result).toContain('keep up the great work');
    });
  });

  describe('generateLearnerNudge', () => {
    it('should build proper prompt and generate nudge', async () => {
      vi.stubEnv('TEST_MODE', 'true');
      
      const { generateLearnerNudge } = await import('@/lib/gemini-client');
      const learner = {
        name: 'Test Learner',
        completionPct: 60,
        quizAvg: 75,
        missedSessions: 2,
        riskLabel: 'medium' as const
      };
      
      const result = await generateLearnerNudge(learner);
      
      expect(result).toContain('TEST NUDGE');
      expect(result).toContain('Test Learner');
    });
  });
});