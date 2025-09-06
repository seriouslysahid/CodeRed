// app/api/learners/[id]/nudge/route.ts
// Nudge generation endpoint with streaming support and fallback

import { NextRequest } from 'next/server';
import { supabaseAdmin, type Database } from '@/lib/supabase';
import { withErrorHandling } from '@/lib/middleware';
import { withRateLimit } from '@/lib/rate-limit';
import { generateLearnerNudge, streamNudge, type LearnerForNudge } from '@/lib/gemini-client';
import { log } from '@/lib/logger';
import { NotFoundError } from '@/lib/errors';

interface RouteParams {
  params: {
    id: string;
  };
}

interface NudgeResponse {
  text: string;
  source: 'gemini' | 'template';
  streaming: boolean;
  nudgeId: number;
  learnerId: number;
}

// Helper to validate and parse learner ID
function parseLearnerId(id: string): number {
  const learnerId = parseInt(id, 10);
  if (isNaN(learnerId) || learnerId <= 0) {
    throw new Error('Invalid learner ID');
  }
  return learnerId;
}

// Helper to fetch learner for nudge generation
async function fetchLearnerForNudge(id: number): Promise<LearnerForNudge & { id: number }> {
  const { data, error } = await supabaseAdmin
    .from('learners')
    .select('id, name, completion_pct, quiz_avg, missed_sessions, risk_label')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      throw new NotFoundError('Learner', id);
    }
    throw new Error(`Failed to fetch learner: ${error.message}`);
  }
  
  if (!data) {
    throw new NotFoundError('Learner', id);
  }
  
  // Type assertion to help TypeScript understand the data structure
  const learnerData = data as {
    id: number;
    name: string;
    completion_pct: number;
    quiz_avg: number;
    missed_sessions: number;
    risk_label: 'low' | 'medium' | 'high';
  };
  
  return {
    id: learnerData.id,
    name: learnerData.name,
    completionPct: learnerData.completion_pct,
    quizAvg: learnerData.quiz_avg,
    missedSessions: learnerData.missed_sessions,
    riskLabel: learnerData.risk_label
  };
}

// Helper to persist nudge to database
async function persistNudge(
  learnerId: number, 
  text: string, 
  source: 'gemini' | 'template',
  status: 'sent' | 'fallback' = 'sent',
  streamed: boolean = false
): Promise<number> {
  const insertData: Database['public']['Tables']['nudges']['Insert'] = {
    learner_id: learnerId,
    text,
    source,
    status
  };
  
  const { data, error } = await (supabaseAdmin as any)
    .from('nudges')
    .insert(insertData)
    .select('id')
    .single();
  
  if (error) {
    log.error('Failed to persist nudge', { 
      error: error.message, 
      learnerId, 
      source, 
      textLength: text.length,
      streamed
    });
    throw new Error(`Failed to save nudge: ${error.message}`);
  }
  
  if (!data) {
    throw new Error('No data returned from nudge insertion');
  }
  
  log.info('Nudge persisted successfully', {
    nudgeId: data.id,
    learnerId,
    source,
    status,
    streamed,
    textLength: text.length
  });
  
  return data.id;
}

// Helper to create Server-Sent Events stream
function createSSEStream(stream: ReadableStream, learnerId: number): ReadableStream {
  const encoder = new TextEncoder();
  let accumulatedText = '';
  
  return new ReadableStream({
    async start(controller) {
      const reader = stream.getReader();
      
      try {
        // Send initial SSE headers
        controller.enqueue(encoder.encode('data: {"type":"start","learnerId":' + learnerId + '}\n\n'));
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Send final accumulated text and close
            if (accumulatedText.trim()) {
              const finalData = JSON.stringify({
                type: 'complete',
                text: accumulatedText.trim(),
                source: 'gemini'
              });
              controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
              
              // Persist the final nudge
              try {
                await persistNudge(learnerId, accumulatedText.trim(), 'gemini');
              } catch (error) {
                log.error('Failed to persist streamed nudge', { error, learnerId });
              }
            }
            break;
          }
          
          // Process the chunk (this is a simplified parser - production should handle JSON streaming properly)
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                  const text = data.candidates[0].content.parts[0].text;
                  accumulatedText += text;
                  
                  // Send incremental update
                  const updateData = JSON.stringify({
                    type: 'chunk',
                    text: text,
                    accumulated: accumulatedText
                  });
                  controller.enqueue(encoder.encode(`data: ${updateData}\n\n`));
                }
              } catch (parseError) {
                // Skip malformed JSON chunks
                log.debug('Skipped malformed streaming chunk', { line });
              }
            }
          }
        }
      } catch (error) {
        log.error('Streaming error', { error: error instanceof Error ? error.message : 'Unknown' });
        
        // Send error and fallback
        const errorData = JSON.stringify({
          type: 'error',
          message: 'Streaming failed, generating fallback...'
        });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
      } finally {
        controller.close();
      }
    }
  });
}

// POST /api/learners/[id]/nudge - Generate nudge for learner
async function generateNudgeHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  const learnerId = parseLearnerId(params.id);
  const url = new URL(request.url);
  const streaming = url.searchParams.get('streaming') !== 'false'; // Default to true
  
  log.info('Generating nudge for learner', { learnerId, streaming });
  
  // Fetch learner data
  const learner = await fetchLearnerForNudge(learnerId);
  
  // Check if streaming is requested and possible
  if (streaming) {
    try {
      // Attempt streaming generation using new resilient client
      const stream = await streamNudge('', { learner, learnerId });
      const sseStream = createSSEStream(stream, learnerId);
      
      log.info('Starting streaming nudge generation', { learnerId });
      
      return new Response(sseStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control'
        }
      });
      
    } catch (error) {
      log.warn('Streaming failed, falling back to non-streaming', {
        learnerId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Non-streaming generation using new resilient client
  try {
    const text = await generateLearnerNudge(learner);
    
    // Determine source based on content (simple heuristic)
    const source: 'gemini' | 'template' = text.includes('TEST NUDGE') ? 'template' : 'gemini';
    const status: 'sent' | 'fallback' = source === 'template' ? 'fallback' : 'sent';
    
    // Persist the nudge
    const nudgeId = await persistNudge(learnerId, text, source, status, false);
    
    const response: NudgeResponse = {
      text,
      source,
      streaming: false,
      nudgeId,
      learnerId
    };
    
    log.info('Nudge generated successfully', {
      learnerId,
      nudgeId,
      source,
      textLength: text.length,
      streaming: false
    });
    
    return Response.json(response);
    
  } catch (error) {
    log.error('All nudge generation methods failed', {
      learnerId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Last resort: simple fallback
    const fallbackText = `Hi ${learner.name.split(' ')[0]}, time for a quick study session! You've got this! 🚀`;
    
    const nudgeId = await persistNudge(learnerId, fallbackText, 'template', 'fallback', false);
    
    const response: NudgeResponse = {
      text: fallbackText,
      source: 'template',
      streaming: false,
      nudgeId,
      learnerId
    };
    
    log.info('Used emergency fallback nudge', { learnerId, nudgeId });
    
    return Response.json(response);
  }
}

// Export handler with error handling and rate limiting
export const POST = withRateLimit(
  withErrorHandling(async (request: NextRequest) => {
    // Extract params from the URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('learners') + 1];
    
    if (!id) {
      return Response.json({ error: 'Missing learner ID' }, { status: 400 });
    }
    
    return generateNudgeHandler(request, { params: { id } });
  })
);