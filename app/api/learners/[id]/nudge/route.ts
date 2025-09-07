// app/api/learners/[id]/nudge/route.ts
// Learner nudge streaming endpoint

import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: {
    id: string;
  };
}

function parseLearnerId(id: string): number {
  const parsed = parseInt(id, 10);
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error('Invalid learner ID');
  }
  return parsed;
}

// POST /api/learners/[id]/nudge - Stream nudge generation for a specific learner
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const learnerId = parseLearnerId(params.id);
    console.log(`POST /api/learners/${learnerId}/nudge - Starting nudge generation stream`);
    
    const body = await request.json().catch(() => ({}));
    const { type = 'encouragement', context } = body;
    
    // Create a readable stream for the nudge generation
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        // Simulate streaming nudge generation
        const messages = [
          'Analyzing learner data...',
          'Generating personalized message...',
          'Optimizing for engagement...',
          'Finalizing nudge content...',
          'Nudge ready!'
        ];
        
        let messageIndex = 0;
        
        const sendMessage = () => {
          if (messageIndex < messages.length) {
            const message = messages[messageIndex];
            const data = JSON.stringify({
              type: 'progress',
              message,
              progress: Math.round(((messageIndex + 1) / messages.length) * 100)
            }) + '\n';
            
            controller.enqueue(encoder.encode(data));
            messageIndex++;
            
            // Send next message after a delay
            setTimeout(sendMessage, 1000);
          } else {
            // Send final nudge
            const finalNudge = {
              type: 'complete',
              nudge: {
                id: Date.now(),
                learnerId,
                type,
                message: `Hi! This is a personalized ${type} nudge for learner ${learnerId}. Keep up the great work!`,
                status: 'sent',
                createdAt: new Date().toISOString(),
              }
            };
            
            controller.enqueue(encoder.encode(JSON.stringify(finalNudge) + '\n'));
            controller.close();
          }
        };
        
        // Start the streaming process
        sendMessage();
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error(`POST /api/learners/${params.id}/nudge error:`, error);
    
    if (error instanceof Error && error.message === 'Invalid learner ID') {
      return NextResponse.json(
        { error: 'Invalid learner ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate nudge' },
      { status: 500 }
    );
  }
}