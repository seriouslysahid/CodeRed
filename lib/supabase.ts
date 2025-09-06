// lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types for type safety
export interface Database {
  public: {
    Tables: {
      learners: {
        Row: {
          id: number;
          name: string;
          email: string;
          completion_pct: number;
          quiz_avg: number;
          missed_sessions: number;
          last_login: string;
          risk_score: number;
          risk_label: 'low' | 'medium' | 'high';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          email: string;
          completion_pct?: number;
          quiz_avg?: number;
          missed_sessions?: number;
          last_login?: string;
          risk_score?: number;
          risk_label?: 'low' | 'medium' | 'high';
        };
        Update: {
          name?: string;
          email?: string;
          completion_pct?: number;
          quiz_avg?: number;
          missed_sessions?: number;
          last_login?: string;
          risk_score?: number;
          risk_label?: 'low' | 'medium' | 'high';
        };
      };
      nudges: {
        Row: {
          id: number;
          learner_id: number;
          text: string;
          status: 'sent' | 'fallback';
          source: 'gemini' | 'template';
          created_at: string;
        };
        Insert: {
          learner_id: number;
          text: string;
          status: 'sent' | 'fallback';
          source: 'gemini' | 'template';
        };
        Update: {
          text?: string;
          status?: 'sent' | 'fallback';
          source?: 'gemini' | 'template';
        };
      };
    };
  };
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  // In TEST_MODE we allow tests to provide mocks; health route will check presence.
  console.warn('[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing (TEST_MODE?)');
}

declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient: SupabaseClient<Database> | undefined;
}

export const getSupabaseAdmin = (): SupabaseClient<Database> => {
  if (typeof globalThis.__supabaseClient === 'undefined') {
    if (!url || !key) {
      // runtime will use mocks when TEST_MODE=true
      // throw only if not in TEST_MODE to fail loudly in production
      if (process.env.TEST_MODE !== 'true') {
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
      }
      // create a minimal dummy client placeholder to avoid null checks elsewhere
      // Real tests will swap with a mock via dependency injection
      // @ts-ignore
      globalThis.__supabaseClient = ({} as SupabaseClient<Database>);
    } else {
      globalThis.__supabaseClient = createClient<Database>(url, key, { 
        auth: { 
          autoRefreshToken: false,
          persistSession: false 
        },
        fetch: (input, init) => 
          import('node-fetch').then(({ default: fetch }) => 
            fetch(input as any, init as any)
          )
      });
    }
  }
  return globalThis.__supabaseClient!;
};

// health helper
export async function supabasePing(): Promise<{ ok: boolean; error?: string; info?: string }> {
  if (process.env.TEST_MODE === 'true') return { ok: true, info: 'test-mode' };
  const supabase = getSupabaseAdmin();
  try {
    const { error } = await supabase.from('learners').select('id').limit(1);
    return { ok: !error, error: error ? error.message : undefined };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// Legacy export for backward compatibility
export async function checkDatabaseHealth(): Promise<{ connected: boolean; error?: string }> {
  const result = await supabasePing();
  return { connected: result.ok, error: result.error };
}

export { getSupabaseAdmin as supabaseAdmin };
