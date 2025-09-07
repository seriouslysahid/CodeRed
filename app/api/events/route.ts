// app/api/events/route.ts
// Events collection endpoints for learner activity tracking

import { NextRequest, NextResponse } from 'next/server';

interface Event {
  id: number;
  learnerId: number;
  type: string;
  metadata: Record<string, any>;
  createdAt: string;
}

interface EventsResponse {
  events: Event[];
  total: number;
}

// GET /api/events - List events with filtering
async function getEventsHandler(request: NextRequest): Promise<Response> {
  try {
    console.log('GET /api/events - Fetching events');
    
    const { searchParams } = new URL(request.url);
    const learnerId = searchParams.get('learnerId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Create direct client if needed
    let client;
    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      client = supabaseAdmin;
      console.log('Using imported supabaseAdmin, type:', typeof client);
      console.log('Has from method:', typeof client?.from);
    } catch (importError) {
      console.log('Import failed, creating direct client:', importError);
      const { createClient } = await import('@supabase/supabase-js');
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
      }
      
      client = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      console.log('Direct client created');
    }
    
    // If supabaseAdmin is not working, create a direct client
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
    
    // Build query
    let query = client
      .from('events')
      .select('id, learnerId, type, metadata, createdAt')
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply filters
    if (learnerId) {
      query = query.eq('learnerId', parseInt(learnerId));
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('GET /api/events - Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events from database' },
        { status: 500 }
      );
    }
    
    const response: EventsResponse = {
      events: data || [],
      total: data?.length || 0
    };
    
    console.log(`GET /api/events - Returning ${response.events.length} events`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('GET /api/events error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
async function createEventHandler(request: NextRequest): Promise<Response> {
  try {
    console.log('POST /api/events - Creating event');
    
    const body = await request.json();
    const { learnerId, type, metadata = {} } = body;
    
    if (!learnerId || !type) {
      return NextResponse.json(
        { error: 'learnerId and type are required' },
        { status: 400 }
      );
    }
    
    // Create direct client if needed
    let client;
    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      client = supabaseAdmin;
    } catch (importError) {
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
      .from('events')
      .insert({
        learnerId: parseInt(learnerId),
        type,
        metadata
      })
      .select()
      .single();
    
    if (error) {
      console.error('POST /api/events - Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create event in database' },
        { status: 500 }
      );
    }
    
    console.log('POST /api/events - Event created successfully:', data.id);
    return NextResponse.json(data, { status: 201 });
    
  } catch (error) {
    console.error('POST /api/events error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

export const GET = getEventsHandler;
export const POST = createEventHandler;
