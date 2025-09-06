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
  var __supabase_admin: SupabaseClient<Database> | undefined;
}

// Use service role key (server-side). Keep it secret.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

// Reuse across serverless invocations to prevent connection storms
const supabaseAdmin: SupabaseClient<Database> =
  globalThis.__supabase_admin ??
  createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    fetch: (input, init) => 
      import('node-fetch').then(({ default: fetch }) => 
        fetch(input as any, init as any)
      )
  });

if (!globalThis.__supabase_admin) {
  globalThis.__supabase_admin = supabaseAdmin;
}

// Health check function for database connectivity
export async function checkDatabaseHealth(): Promise<{ connected: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
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

export { supabaseAdmin };
