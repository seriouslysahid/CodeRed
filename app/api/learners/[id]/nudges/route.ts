// app/api/learners/[id]/nudges/route.ts
// Learner-specific nudges endpoints

import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

interface Nudge {
  id: number;
  learnerId: number;
  type: 'reminder' | 'encouragement' | 'warning' | 'assessment';
  message: string;
  status: 'sent' | 'delivered' | 'read' | 'clicked';
  createdAt: string;
}

function parseLearnerId(id: string): number {
  const parsed = parseInt(id, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error('Invalid learner ID');
  }
  return parsed;
}

// GET /api/learners/[id]/nudges - Get nudges for a specific learner
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const learnerId = parseLearnerId(params.id);
    console.log(`GET /api/learners/${learnerId}/nudges - Fetching nudges for learner`);
    
    // Mock data for now - in production this would come from database
    const mockNudges: Nudge[] = [
      {
        id: 1,
        learnerId,
        type: 'reminder',
        message: 'Don\'t forget to complete your weekly quiz!',
        status: 'sent',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 2,
        learnerId,
        type: 'encouragement',
        message: 'Great job on your recent progress! Keep it up!',
        status: 'read',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        id: 3,
        learnerId,
        type: 'warning',
        message: 'You\'re falling behind on your assignments. Let\'s get back on track!',
        status: 'delivered',
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      },
    ];
    
    console.log(`GET /api/learners/${learnerId}/nudges - Returning ${mockNudges.length} nudges`);
    return NextResponse.json(mockNudges);
    
  } catch (error) {
    console.error(`GET /api/learners/${params.id}/nudges error:`, error);
    
    if (error instanceof Error && error.message === 'Invalid learner ID') {
      return NextResponse.json(
        { error: 'Invalid learner ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch learner nudges' },
      { status: 500 }
    );
  }
}

// POST /api/learners/[id]/nudges - Create a nudge for a specific learner
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const learnerId = parseLearnerId(params.id);
    console.log(`POST /api/learners/${learnerId}/nudges - Creating nudge for learner`);
    
    const body = await request.json();
    const { type, message } = body;
    
    if (!type || !message) {
      return NextResponse.json(
        { error: 'type and message are required' },
        { status: 400 }
      );
    }
    
    // Mock nudge creation - in production this would save to database
    const newNudge: Nudge = {
      id: Date.now(), // Simple ID generation
      learnerId,
      type,
      message,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    
    console.log(`POST /api/learners/${learnerId}/nudges - Created nudge:`, newNudge.id);
    return NextResponse.json(newNudge, { status: 201 });
    
  } catch (error) {
    console.error(`POST /api/learners/${params.id}/nudges error:`, error);
    
    if (error instanceof Error && error.message === 'Invalid learner ID') {
      return NextResponse.json(
        { error: 'Invalid learner ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create learner nudge' },
      { status: 500 }
    );
  }
}
