// tests/unit/supabase-client.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ error: null, data: [{ id: 1 }] }))
      }))
    }))
  }))
}));

describe('Supabase Client', () => {
  beforeEach(() => {
    // Clear global client before each test
    globalThis.__supabaseClient = undefined;
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('getSupabaseAdmin', () => {
    it('should not throw in TEST_MODE when credentials are missing', async () => {
      vi.stubEnv('TEST_MODE', 'true');
      vi.stubEnv('SUPABASE_URL', '');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

      const { getSupabaseAdmin } = await import('@/lib/supabase');
      
      expect(() => getSupabaseAdmin()).not.toThrow();
      const client = getSupabaseAdmin();
      expect(client).toBeDefined();
    });

    it('should throw when credentials are missing and not in TEST_MODE', async () => {
      vi.stubEnv('TEST_MODE', '');
      vi.stubEnv('SUPABASE_URL', '');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

      const { getSupabaseAdmin } = await import('@/lib/supabase');

      expect(() => getSupabaseAdmin()).toThrow('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    });

    it('should reuse the same client instance (global caching)', async () => {
      vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');

      const { getSupabaseAdmin } = await import('@/lib/supabase');

      const client1 = getSupabaseAdmin();
      const client2 = getSupabaseAdmin();

      expect(client1).toBe(client2);
    });

    it('should create client with proper configuration when credentials are present', async () => {
      vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');

      const { getSupabaseAdmin } = await import('@/lib/supabase');

      const client = getSupabaseAdmin();
      expect(client).toBeDefined();
    });
  });

  describe('supabasePing', () => {
    it('should return ok:true in TEST_MODE', async () => {
      vi.stubEnv('TEST_MODE', 'true');

      const { supabasePing } = await import('@/lib/supabase');
      const result = await supabasePing();

      expect(result).toEqual({ ok: true, info: 'test-mode' });
    });

    it('should return ok:true when database query succeeds', async () => {
      vi.stubEnv('TEST_MODE', '');
      vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');

      const { supabasePing } = await import('@/lib/supabase');
      const result = await supabasePing();

      expect(result.ok).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return ok:false when database query fails', async () => {
      vi.stubEnv('TEST_MODE', '');
      vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');

      // Mock a failing query
      const { createClient } = await import('@supabase/supabase-js');
      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ error: { message: 'Connection failed' }, data: null }))
          }))
        }))
      } as any);

      const { supabasePing } = await import('@/lib/supabase');
      const result = await supabasePing();

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Connection failed');
    });

    it('should handle exceptions gracefully', async () => {
      vi.stubEnv('TEST_MODE', '');
      vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');

      // Mock a throwing query
      const { createClient } = await import('@supabase/supabase-js');
      vi.mocked(createClient).mockReturnValue({
        from: vi.fn(() => {
          throw new Error('Network error');
        })
      } as any);

      const { supabasePing } = await import('@/lib/supabase');
      const result = await supabasePing();

      expect(result.ok).toBe(false);
      expect(result.error).toBe('Error: Network error');
    });
  });
});