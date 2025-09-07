// app/api/admin/simulate/route.ts
// Admin simulation endpoint that updates the simulation status

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/middleware';
import { log } from '@/lib/logger';

interface SimulationRequest {
  limit?: number;
  chunkSize?: number;
}

interface SimulationResponse {
  processed: number;
  updated: number;
  chunks: number;
  duration: number;
  summary: {
    riskDistribution: Record<string, number>;
    avgRiskScore: number;
  };
}

// POST /api/admin/simulate - Run simulation with status tracking
async function simulateHandler(request: NextRequest): Promise<Response> {
  const startTime = Date.now();
  
  try {
    // Update simulation status to running
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'}/api/admin/simulation-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRunning: true }),
      });
    } catch (error) {
      console.warn('Failed to update simulation status:', error);
    }
    
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { limit = 100, chunkSize = 50 } = body as SimulationRequest;
    
    log.info('Starting admin simulation', { 
      limit, 
      chunkSize,
      requestedBy: request.headers.get('user-agent')
    });
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock results
    const processed = Math.min(limit, 100);
    const updated = Math.floor(processed * 0.7);
    const chunks = Math.ceil(processed / chunkSize);
    const duration = Date.now() - startTime;
    
    const response: SimulationResponse = {
      processed,
      updated,
      chunks,
      duration,
      summary: {
        riskDistribution: {
          low: Math.floor(processed * 0.4),
          medium: Math.floor(processed * 0.35),
          high: Math.floor(processed * 0.25),
        },
        avgRiskScore: 45.2,
      },
    };
    
    // Update simulation status to completed
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'}/api/admin/simulation-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRunning: false, completed: true }),
      });
    } catch (error) {
      console.warn('Failed to update simulation status:', error);
    }
    
    log.info('Admin simulation completed', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    // Update simulation status to failed
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'}/api/admin/simulation-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRunning: false, completed: false }),
      });
    } catch (error) {
      console.warn('Failed to update simulation status:', error);
    }
    
    const duration = Date.now() - startTime;
    
    log.error('Admin simulation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    });
    
    throw error;
  }
}

// Export handler with error handling
export const POST = withErrorHandling(simulateHandler);
