// app/api/learners-simple/route.ts
// Simplified learners route for testing

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return empty data for now to test the route structure
    return NextResponse.json({
      data: [],
      nextCursor: null,
      hasMore: false,
      total: 0
    });
  } catch (error) {
    console.error('Error in learners-simple route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
