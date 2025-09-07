// app/api/test-simple/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Simple test API - Environment check:', {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      DEV_SIM: process.env.NEXT_PUBLIC_ENABLE_DEV_SIM
    });

    return NextResponse.json({
      message: 'Simple test successful',
      env: {
        SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
        SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
        ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
        DEV_SIM: process.env.NEXT_PUBLIC_ENABLE_DEV_SIM
      }
    });
  } catch (error) {
    console.error('Simple test error:', error);
    return NextResponse.json({ error: 'Simple test failed' }, { status: 500 });
  }
}
