// app/api/test/route.ts
// Simple test route to verify API structure

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Test route working',
    timestamp: new Date().toISOString()
  });
}
