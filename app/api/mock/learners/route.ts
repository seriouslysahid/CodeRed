// app/api/mock/learners/route.ts (Next.js app router)
import { NextResponse } from 'next/server';

export async function GET() {
  const enableSim = process.env.NEXT_PUBLIC_ENABLE_DEV_SIM === 'true';
  const payload = {
    learners: enableSim ? [
      // optional: only include if dev sim explicitly enabled
      { id: 'dev-1', name: 'Developer (sim)', lastActive: '2025-09-01', risk: 'low' }
    ] : []
  };
  return NextResponse.json(payload);
}

