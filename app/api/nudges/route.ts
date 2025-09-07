// app/api/nudges/route.ts
// Nudges collection endpoints

import { NextRequest, NextResponse } from 'next/server';

interface Nudge {
  id: number;
  learnerId: number;
  type: 'reminder' | 'encouragement' | 'warning' | 'assessment';
  message: string;
  status: 'sent' | 'delivered' | 'read' | 'clicked';
  createdAt: string;
}

interface NudgesResponse {
  data: Nudge[];
  total: number;
}

// GET /api/nudges - List nudges with pagination
export async function GET(request: NextRequest): Promise<Response> {
  try {
    console.log('GET /api/nudges - Fetching nudges');
    
    const { searchParams } = new URL(request.url);
    const learnerId = searchParams.get('learnerId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Mock data for now - in production this would come from database
    const mockNudges: Nudge[] = [
      {
        id: 1,
        learnerId: 1,
        type: 'reminder',
        message: 'Don\'t forget to complete your weekly quiz!',
        status: 'sent',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 2,
        learnerId: 1,
        type: 'encouragement',
        message: 'Great job on your recent progress! Keep it up!',
        status: 'read',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        id: 3,
        learnerId: 2,
        type: 'warning',
        message: 'You\'re falling behind on your assignments. Let\'s get back on track!',
        status: 'delivered',
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      },
    ];
    
    // Filter by learnerId if provided
    let filteredNudges = mockNudges;
    if (learnerId) {
      filteredNudges = mockNudges.filter(n => n.learnerId === parseInt(learnerId));
    }
    
    // Apply pagination
    const paginatedNudges = filteredNudges.slice(offset, offset + limit);
    
    const response: NudgesResponse = {
      data: paginatedNudges,
      total: filteredNudges.length,
    };
    
    console.log(`GET /api/nudges - Returning ${paginatedNudges.length} nudges`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('GET /api/nudges error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nudges' },
      { status: 500 }
    );
  }
}

// POST /api/nudges - Create a new nudge
export async function POST(request: NextRequest): Promise<Response> {
  try {
    console.log('POST /api/nudges - Creating nudge');
    
    const body = await request.json();
    const { learnerId, type, message } = body;
    
    if (!learnerId || !type || !message) {
      return NextResponse.json(
        { error: 'learnerId, type, and message are required' },
        { status: 400 }
      );
    }
    
    // Mock nudge creation - in production this would save to database
    const newNudge: Nudge = {
      id: Date.now(), // Simple ID generation
      learnerId: parseInt(learnerId),
      type,
      message,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    
    console.log('POST /api/nudges - Created nudge:', newNudge.id);
    return NextResponse.json(newNudge, { status: 201 });
    
  } catch (error) {
    console.error('POST /api/nudges error:', error);
    return NextResponse.json(
      { error: 'Failed to create nudge' },
      { status: 500 }
    );
  }
}