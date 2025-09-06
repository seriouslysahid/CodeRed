// app/api/simulate/route.ts
// Batch risk recomputation endpoint with chunked cursor-based processing

import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { withErrorHandling } from '@/lib/middleware';
import { computeRiskScore, riskLabelFromScore } from '@/lib/risk';
import { log } from '@/lib/logger';

interface SimulationRequest {
  limit?: number;
  chunkSize?: number;
}

interface SimulationResponse {
  processed: number;
  updated: number;
  chunks: number;
  duration: number;
  summary: {
    riskDistribution: Record<string, number>;
    avgRiskScore: number;
  };
}

interface LearnerForProcessing {
  id: number;
  completion_pct: number;
  quiz_avg: number;
  missed_sessions: number;
  last_login: string;
  risk_score: number;
  risk_label: string;
}

// Default configuration
const DEFAULT_CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || '50', 10);
const MAX_CHUNK_SIZE = 1000;
const MAX_TOTAL_LIMIT = 10000;

// Parse and validate simulation request
function parseSimulationRequest(body: any): SimulationRequest {
  const request: SimulationRequest = {};
  
  if (body.limit !== undefined) {
    const limit = parseInt(body.limit, 10);
    if (isNaN(limit) || limit <= 0) {
      throw new Error('Limit must be a positive integer');
    }
    if (limit > MAX_TOTAL_LIMIT) {
      throw new Error(`Limit cannot exceed ${MAX_TOTAL_LIMIT}`);
    }
    request.limit = limit;
  }
  
  if (body.chunkSize !== undefined) {
    const chunkSize = parseInt(body.chunkSize, 10);
    if (isNaN(chunkSize) || chunkSize <= 0) {
      throw new Error('Chunk size must be a positive integer');
    }
    if (chunkSize > MAX_CHUNK_SIZE) {
      throw new Error(`Chunk size cannot exceed ${MAX_CHUNK_SIZE}`);
    }
    request.chunkSize = chunkSize;
  }
  
  return request;
}

// Process a single chunk of learners
async function processChunk(
  learners: LearnerForProcessing[]
): Promise<{ processed: number; updated: number }> {
  let updated = 0;
  
  // Process each learner in the chunk
  const updates = learners.map(learner => {
    // Compute new risk score
    const newRiskScore = computeRiskScore({
      completionPct: learner.completion_pct,
      quizAvg: learner.quiz_avg,
      missedSessions: learner.missed_sessions,
      lastLogin: learner.last_login
    });
    
    const newRiskLabel = riskLabelFromScore(newRiskScore);
    
    // Check if update is needed (avoid unnecessary writes)
    const riskScoreChanged = Math.abs(newRiskScore - learner.risk_score) > 0.0001;
    const riskLabelChanged = newRiskLabel !== learner.risk_label;
    
    if (riskScoreChanged || riskLabelChanged) {
      updated++;
      return {
        id: learner.id,
        risk_score: newRiskScore,
        risk_label: newRiskLabel
      };
    }
    
    return null;
  }).filter(Boolean);
  
  // Batch update if there are changes
  if (updates.length > 0) {
    const { error } = await (supabaseAdmin as any)
      .from('learners')
      .upsert(updates, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });
    
    if (error) {
      log.error('Failed to update learner chunk', { 
        error: error.message,
        chunkSize: learners.length,
        updatesCount: updates.length
      });
      throw new Error(`Failed to update learners: ${error.message}`);
    }
  }
  
  return { processed: learners.length, updated };
}

// Get risk distribution summary
async function getRiskSummary(): Promise<{
  riskDistribution: Record<string, number>;
  avgRiskScore: number;
}> {
  const { data, error } = await supabaseAdmin
    .from('learners')
    .select('risk_label, risk_score');
  
  if (error) {
    log.warn('Failed to get risk summary', { error: error.message });
    return {
      riskDistribution: {},
      avgRiskScore: 0
    };
  }
  
  if (!data || data.length === 0) {
    return {
      riskDistribution: { low: 0, medium: 0, high: 0 },
      avgRiskScore: 0
    };
  }
  
  const riskDistribution = data.reduce((acc, learner: any) => {
    acc[learner.risk_label] = (acc[learner.risk_label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const avgRiskScore = data.reduce((sum, learner: any) => sum + learner.risk_score, 0) / data.length;
  
  return { riskDistribution, avgRiskScore };
}

// POST /api/simulate - Run batch risk recomputation
async function simulateHandler(request: NextRequest): Promise<Response> {
  const startTime = Date.now();
  
  // Parse request body
  const body = await request.json().catch(() => ({}));
  const { limit, chunkSize = DEFAULT_CHUNK_SIZE } = parseSimulationRequest(body);
  
  log.info('Starting batch risk recomputation', { 
    limit, 
    chunkSize,
    requestedBy: request.headers.get('user-agent')
  });
  
  let totalProcessed = 0;
  let totalUpdated = 0;
  let chunks = 0;
  let cursor: number | undefined;
  
  try {
    // Process learners in chunks using cursor-based pagination
    while (true) {
      // Build query for next chunk
      let query = supabaseAdmin
        .from('learners')
        .select('id, completion_pct, quiz_avg, missed_sessions, last_login, risk_score, risk_label')
        .order('id', { ascending: true })
        .limit(chunkSize);
      
      // Apply cursor if we have one
      if (cursor) {
        query = query.gt('id', cursor);
      }
      
      // Apply overall limit if specified
      if (limit && totalProcessed >= limit) {
        break;
      }
      
      const { data: learners, error } = await query;
      
      if (error) {
        log.error('Failed to fetch learners chunk', { 
          error: error.message, 
          cursor, 
          chunkSize 
        });
        throw new Error(`Failed to fetch learners: ${error.message}`);
      }
      
      if (!learners || learners.length === 0) {
        log.info('No more learners to process');
        break;
      }
      
      // Respect overall limit
      const learnersToProcess = limit 
        ? learners.slice(0, Math.min(learners.length, limit - totalProcessed))
        : learners;
      
      if (learnersToProcess.length === 0) {
        break;
      }
      
      // Process this chunk
      const chunkResult = await processChunk(learnersToProcess);
      
      totalProcessed += chunkResult.processed;
      totalUpdated += chunkResult.updated;
      chunks++;
      
      // Update cursor for next iteration
      cursor = learnersToProcess.length > 0 ? (learnersToProcess[learnersToProcess.length - 1] as any).id : null;
      
      log.info('Processed chunk', {
        chunk: chunks,
        processed: chunkResult.processed,
        updated: chunkResult.updated,
        totalProcessed,
        totalUpdated,
        nextCursor: cursor
      });
      
      // Break if we've hit the limit or processed fewer than requested (end of data)
      if ((limit && totalProcessed >= limit) || learners.length < chunkSize) {
        break;
      }
    }
    
    // Get final summary
    const summary = await getRiskSummary();
    const duration = Date.now() - startTime;
    
    const response: SimulationResponse = {
      processed: totalProcessed,
      updated: totalUpdated,
      chunks,
      duration,
      summary
    };
    
    log.info('Batch risk recomputation completed', {
      ...response,
      avgProcessingTime: duration / totalProcessed || 0
    });
    
    return Response.json(response);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    log.error('Batch risk recomputation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      totalProcessed,
      totalUpdated,
      chunks,
      duration
    });
    
    throw error;
  }
}

// Export handler with error handling
export const POST = withErrorHandling(simulateHandler);