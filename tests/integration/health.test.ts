// tests/integration/health.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200
    }))
  }
}));

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabasePing: vi.fn()
}));

describe('/api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('should return 200 and status ok when all services are healthy', async () => {
    vi.stubEnv('TEST_MODE', 'true');
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    
    const { supabasePing } = await import('@/lib/supabase');
    vi.mocked(supabasePing).mockResolvedValue({ ok: true, info: 'test-mode' });

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.db.ok).toBe(true);
    expect(data.geminiConfigured).toBe(true);
    expect(data.timestamp).toBeDefined();
    expect(data.version).toBe('0.1.0'); // From package.json
  });

  it('should return 503 and status degraded when database is unhealthy', async () => {
    vi.stubEnv('TEST_MODE', '');
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    
    const { supabasePing } = await import('@/lib/supabase');
    vi.mocked(supabasePing).mockResolvedValue({ ok: false, error: 'Connection failed' });

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('degraded');
    expect(data.db.ok).toBe(false);
    expect(data.db.error).toBe('Connection failed');
    expect(data.geminiConfigured).toBe(true);
  });

  it('should return status degraded when AI service is not configured', async () => {
    vi.stubEnv('TEST_MODE', 'true');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('OPENAI_API_KEY', '');
    
    const { supabasePing } = await import('@/lib/supabase');
    vi.mocked(supabasePing).mockResolvedValue({ ok: true, info: 'test-mode' });

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200); // DB is ok, so 200
    expect(data.status).toBe('degraded'); // But overall degraded due to AI
    expect(data.db.ok).toBe(true);
    expect(data.geminiConfigured).toBe(false);
  });

  it('should work with OpenAI API key instead of Gemini', async () => {
    vi.stubEnv('TEST_MODE', 'true');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('OPENAI_API_KEY', 'test-openai-key');
    
    const { supabasePing } = await import('@/lib/supabase');
    vi.mocked(supabasePing).mockResolvedValue({ ok: true, info: 'test-mode' });

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.geminiConfigured).toBe(true);
  });

  it('should include proper timestamp format', async () => {
    vi.stubEnv('TEST_MODE', 'true');
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    
    const { supabasePing } = await import('@/lib/supabase');
    vi.mocked(supabasePing).mockResolvedValue({ ok: true, info: 'test-mode' });

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should use npm_package_version when available', async () => {
    vi.stubEnv('TEST_MODE', 'true');
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubEnv('npm_package_version', '1.2.3');
    
    const { supabasePing } = await import('@/lib/supabase');
    vi.mocked(supabasePing).mockResolvedValue({ ok: true, info: 'test-mode' });

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    expect(data.version).toBe('1.2.3');
  });
});