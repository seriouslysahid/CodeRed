// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { supabasePing } from '@/lib/supabase';

export async function GET() {
  const geminiConfigured = !!process.env.GEMINI_API_KEY || !!process.env.OPENAI_API_KEY;
  const db = await supabasePing();
  const status = {
    status: db.ok && geminiConfigured ? 'ok' : 'degraded',
    db,
    geminiConfigured,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? 'dev',
  };
  const code = db.ok ? 200 : 503;
  return NextResponse.json(status, { status: code });
}