// app/api/learners/route.ts
// Learners collection endpoints: GET (list with pagination) and POST (create)

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface PaginatedLearnersResponse {
  data: Array<{
    id: number;
    name: string;
    email: string;
    completionPct: number;
    quizAvg: number;
    missedSessions: number;
    lastLogin: string;
    riskScore: number;
    riskLabel: 'low' | 'medium' | 'high';
    createdAt: string;
    updatedAt: string;
  }>;
  nextCursor: number | null;
  hasMore: boolean;
  total?: number;
}

// GET /api/learners - List learners with cursor-based pagination
async function getLearnersHandler(request: NextRequest): Promise<Response> {
  try {
    console.log('GET /api/learners - Starting request');
    
    // Test environment variables
    const envCheck = {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      DEV_SIM: process.env.NEXT_PUBLIC_ENABLE_DEV_SIM
    };
    console.log('Environment check:', envCheck);
    
    console.log('Supabase admin available:', !!supabaseAdmin);
    console.log('Supabase admin type:', typeof supabaseAdmin);
    console.log('Supabase admin has from method:', typeof supabaseAdmin?.from);
    
    // If supabaseAdmin is not working, create a direct client
    let client = supabaseAdmin;
    if (!client || typeof client.from !== 'function') {
      console.log('Creating direct Supabase client...');
      const { createClient } = await import('@supabase/supabase-js');
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
      }
      
      client = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      console.log('Direct Supabase client created');
    }
    
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    const riskFilter = searchParams.get('riskFilter');
    
    // Check for dev simulation mode
    const enableSim = process.env.NEXT_PUBLIC_ENABLE_DEV_SIM === 'true';
    
    // Build query
    let query = client
      .from('learners')
      .select('id, name, email, completionPct, quizAvg, missedSessions, lastLogin, riskScore, riskLabel, createdAt, updatedAt')
      .order('id', { ascending: true })
      .limit(limit + 1); // Get one extra to check if there are more
    
    // Apply cursor-based pagination
    if (cursor) {
      query = query.gt('id', parseInt(cursor));
    }
    
    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    // Apply risk filter
    if (riskFilter && ['low', 'medium', 'high'].includes(riskFilter)) {
      query = query.eq('riskLabel', riskFilter);
    }
    
    console.log('Executing Supabase query...');
    const { data, error } = await query;
    
    if (error) {
      console.error('GET /api/learners - Supabase error:', error);
      
      // If it's a permission error and dev sim is enabled, return sample data
      if (enableSim && (error.message.includes('permission') || error.message.includes('RLS'))) {
        console.log('GET /api/learners - Using dev simulation due to permission error');
        const sampleData = [{
          id: 1,
          name: 'Dev Learner (Sim)',
          email: 'dev@example.com',
          completionPct: 75,
          quizAvg: 85,
          missedSessions: 2,
          lastLogin: new Date().toISOString(),
          riskScore: 25,
          riskLabel: 'low' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }];
        
        const response: PaginatedLearnersResponse = {
          data: sampleData,
          nextCursor: null,
          hasMore: false,
          total: 1
        };
        
        return NextResponse.json(response);
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch learners from database',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }
    
    // Check if there are more records
    const hasMore = data && data.length > limit;
    const learners = hasMore ? data.slice(0, limit) : (data || []);
    const nextCursor = hasMore && learners.length > 0 ? learners[learners.length - 1].id : null;
    
    const response: PaginatedLearnersResponse = {
      data: learners,
      nextCursor,
      hasMore,
      total: learners.length
    };
    
    console.log(`GET /api/learners - Returning ${learners.length} learners`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('GET /api/learners error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch learners',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/learners - Create a new learner
async function createLearnerHandler(request: NextRequest): Promise<Response> {
  try {
    console.log('POST /api/learners - Creating learner');
    
    const body = await request.json();
    const { name, email, completionPct = 0, quizAvg = 0, missedSessions = 0 } = body;
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabaseAdmin
      .from('learners')
      .insert({
        name,
        email,
        completionPct,
        quizAvg,
        missedSessions,
        lastLogin: new Date().toISOString(),
        riskScore: 0,
        riskLabel: 'low'
      })
      .select()
      .single();
    
    if (error) {
      console.error('POST /api/learners - Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create learner in database' },
        { status: 500 }
      );
    }
    
    console.log('POST /api/learners - Created learner:', data.id);
    return NextResponse.json(data, { status: 201 });
    
  } catch (error) {
    console.error('POST /api/learners error:', error);
    return NextResponse.json(
      { error: 'Failed to create learner' },
      { status: 500 }
    );
  }
}

// Export handlers
export const GET = getLearnersHandler;
export const POST = createLearnerHandler;