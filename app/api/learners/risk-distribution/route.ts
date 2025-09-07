// app/api/learners/risk-distribution/route.ts
// Risk distribution endpoint for learners

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface RiskDistributionResponse {
  low: number;
  medium: number;
  high: number;
  total: number;
  percentages: {
    low: number;
    medium: number;
    high: number;
  };
}

// GET /api/learners/risk-distribution - Get risk distribution statistics
export async function GET(): Promise<Response> {
  try {
    console.log('GET /api/learners/risk-distribution - Fetching risk distribution');
    
    // Check for dev simulation mode
    const enableSim = process.env.NEXT_PUBLIC_ENABLE_DEV_SIM === 'true';
    
    // Build query to get risk distribution
    const { data, error } = await supabaseAdmin
      .from('learners')
      .select('riskLabel')
      .in('riskLabel', ['low', 'medium', 'high']);
    
    if (error) {
      console.error('GET /api/learners/risk-distribution - Supabase error:', error);
      
      // If it's a permission error and dev sim is enabled, return sample data
      if (enableSim && (error.message.includes('permission') || error.message.includes('RLS'))) {
        console.log('GET /api/learners/risk-distribution - Using dev simulation due to permission error');
        const response: RiskDistributionResponse = {
          low: 40,
          medium: 35,
          high: 25,
          total: 100,
          percentages: {
            low: 40,
            medium: 35,
            high: 25,
          },
        };
        
        return NextResponse.json(response);
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch risk distribution from database' },
        { status: 500 }
      );
    }
    
    // Calculate distribution
    const distribution = (data || []).reduce((acc, learner: any) => {
      acc[learner.riskLabel] = (acc[learner.riskLabel] || 0) + 1;
      return acc;
    }, { low: 0, medium: 0, high: 0 } as Record<string, number>);
    
    const total = distribution.low + distribution.medium + distribution.high;
    
    const response: RiskDistributionResponse = {
      low: distribution.low,
      medium: distribution.medium,
      high: distribution.high,
      total,
      percentages: {
        low: total > 0 ? Math.round((distribution.low / total) * 100) : 0,
        medium: total > 0 ? Math.round((distribution.medium / total) * 100) : 0,
        high: total > 0 ? Math.round((distribution.high / total) * 100) : 0,
      },
    };
    
    console.log(`GET /api/learners/risk-distribution - Returning distribution:`, response);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('GET /api/learners/risk-distribution error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk distribution' },
      { status: 500 }
    );
  }
}