// app/api/learners/risk-distribution/route.ts
// Risk distribution analytics endpoint

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface RiskDistributionResponse {
  low: number;
  medium: number;
  high: number;
  total: number;
  avgRiskScore: number;
}

// GET /api/learners/risk-distribution - Get risk distribution analytics
async function getRiskDistributionHandler(): Promise<Response> {
  try {
    console.log('GET /api/learners/risk-distribution - Fetching risk distribution');
    
    // Get all learners with risk data - create direct client if needed
    let client = supabaseAdmin;
    if (!client || typeof client.from !== 'function') {
      const { createClient } = await import('@supabase/supabase-js');
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
      }
      
      client = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
    }
    
    const { data, error } = await client
      .from('learners')
      .select('riskLabel, riskScore');
    
    if (error) {
      console.error('GET /api/learners/risk-distribution - Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch risk distribution from database' },
        { status: 500 }
      );
    }
    
    // Calculate distribution
    const learners = data || [];
    const total = learners.length;
    
    const distribution = learners.reduce((acc, learner) => {
      acc[learner.riskLabel] = (acc[learner.riskLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const avgRiskScore = total > 0 
      ? learners.reduce((sum, learner) => sum + (learner.riskScore || 0), 0) / total 
      : 0;
    
    const response: RiskDistributionResponse = {
      low: distribution.low || 0,
      medium: distribution.medium || 0,
      high: distribution.high || 0,
      total,
      avgRiskScore: Math.round(avgRiskScore * 100) / 100 // Round to 2 decimal places
    };
    
    console.log(`GET /api/learners/risk-distribution - Returning distribution for ${total} learners`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('GET /api/learners/risk-distribution error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk distribution' },
      { status: 500 }
    );
  }
}

// Export handler
export const GET = getRiskDistributionHandler;