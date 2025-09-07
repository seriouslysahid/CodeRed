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

declare global {
  // eslint-disable-next-line no-var
  var __supabase_admin: SupabaseClient<Database> | undefined;
}

// Mock Supabase client for when credentials are missing
function createMockSupabaseClient(): SupabaseClient<Database> {
  return {
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [], error: null }),
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        }),
        eq: () => ({
          select: () => Promise.resolve({ data: [], error: null })
        }),
        gt: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        }),
        upsert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({
          eq: () => ({
            select: () => Promise.resolve({ data: null, error: null })
          })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        })
      })
    }),
    auth: {} as any,
    storage: {} as any,
    realtime: {} as any,
    functions: {} as any
  } as any;
}

// Lazy initialization of Supabase client to avoid build-time errors
function getSupabaseAdmin(): SupabaseClient<Database> {
  if (globalThis.__supabase_admin) {
    return globalThis.__supabase_admin;
  }

  // Use service role key (server-side). Keep it secret.
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL) {
    console.warn('Missing SUPABASE_URL env var - API will return empty data');
    return createMockSupabaseClient();
  }

  // Fallback to anon key if service role key is missing (hackathon scenario)
  const keyToUse = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  
  if (!keyToUse) {
    console.warn('Missing both SUPABASE_SERVICE_ROLE_KEY and SUPABASE_ANON_KEY - API will return empty data');
    return createMockSupabaseClient();
  }

  if (!SUPABASE_SERVICE_ROLE_KEY && SUPABASE_ANON_KEY) {
    console.warn('Using anon key instead of service role key - this is a fallback for hackathon demo');
  }

  // Reuse across serverless invocations to prevent connection storms
  const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(SUPABASE_URL, keyToUse, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    fetch: (input, init) => 
      import('node-fetch').then(({ default: fetch }) => 
        fetch(input as any, init as any)
      )
  });

  globalThis.__supabase_admin = supabaseAdmin;
  return supabaseAdmin;
}

// Health check function for database connectivity
export async function checkDatabaseHealth(): Promise<{ connected: boolean; error?: string }> {
  try {
    const { error } = await getSupabaseAdmin()
      .from('learners')
      .select('id')
      .limit(1);
    
    if (error) {
      return { connected: false, error: error.message };
    }
    
    return { connected: true };
  } catch (err) {
    return { 
      connected: false, 
      error: err instanceof Error ? err.message : 'Unknown database error' 
    };
  }
}

export { getSupabaseAdmin as supabaseAdmin };
