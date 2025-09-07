// app/api/admin/simulation-status/route.ts
// Simulation status endpoint for admin panel

import { NextRequest, NextResponse } from 'next/server';

interface SimulationStatusResponse {
  isRunning: boolean;
  lastRun?: string;
  nextAvailable?: string;
}

// In-memory simulation state (in production, this would be stored in Redis or database)
let simulationState = {
  isRunning: false,
  lastRun: null as string | null,
  cooldownUntil: null as number | null,
};

// GET /api/admin/simulation-status - Get current simulation status
export async function GET(): Promise<Response> {
  try {
    const now = Date.now();
    
    // Check if cooldown period has expired
    if (simulationState.cooldownUntil && now > simulationState.cooldownUntil) {
      simulationState.cooldownUntil = null;
    }
    
    const isRunning = simulationState.isRunning;
    const canRun = !isRunning && !simulationState.cooldownUntil;
    
    const response: SimulationStatusResponse = {
      isRunning,
      lastRun: simulationState.lastRun || undefined,
      nextAvailable: simulationState.cooldownUntil 
        ? new Date(simulationState.cooldownUntil).toISOString()
        : undefined,
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('GET /api/admin/simulation-status error:', error);
    return NextResponse.json(
      { error: 'Failed to get simulation status' },
      { status: 500 }
    );
  }
}

// POST /api/admin/simulation-status - Update simulation status (internal use)
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { isRunning, completed } = body;
    
    if (typeof isRunning === 'boolean') {
      simulationState.isRunning = isRunning;
      
      if (completed) {
        simulationState.lastRun = new Date().toISOString();
        // Set cooldown period of 30 seconds
        simulationState.cooldownUntil = Date.now() + 30000;
      }
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('POST /api/admin/simulation-status error:', error);
    return NextResponse.json(
      { error: 'Failed to update simulation status' },
      { status: 500 }
    );
  }
}
