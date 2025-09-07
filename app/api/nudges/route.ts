// app/api/nudges/route.ts
// Nudges collection endpoints

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface Nudge {
  id: number;
  learnerId: number;
  text: string;
  status: 'sent' | 'fallback';
  source: 'gemini' | 'template';
  createdAt: string;
}

interface NudgesResponse {
  nudges: Nudge[];
  total: number;
}

// GET /api/nudges - List nudges with optional learner filter
async function getNudgesHandler(request: NextRequest): Promise<Response> {
  try {
    console.log('GET /api/nudges - Fetching nudges');
    
    const { searchParams } = new URL(request.url);
    const learnerId = searchParams.get('learnerId');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    // Build query
    let query = supabaseAdmin
      .from('nudges')
      .select('id, learnerId, text, status, source, createdAt')
      .order('createdAt', { ascending: false })
      .limit(limit);
    
    // Apply learner filter if provided
    if (learnerId) {
      query = query.eq('learnerId', parseInt(learnerId));
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('GET /api/nudges - Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch nudges from database' },
        { status: 500 }
      );
    }
    
    const response: NudgesResponse = {
      nudges: data || [],
      total: data?.length || 0
    };
    
    console.log(`GET /api/nudges - Returning ${response.total} nudges`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('GET /api/nudges error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nudges' },
      { status: 500 }
    );
  }
}

// Export handler
export const GET = getNudgesHandler;