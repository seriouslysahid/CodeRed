// app/api/learners/route.ts
// Learners collection endpoints: GET (list with pagination) and POST (create)

import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { withErrorHandling, getPaginationParams } from '@/lib/middleware';
import { parseBody, learnerCreateSchema, type CreateLearnerData } from '@/lib/validation';
import { computeRiskScore, riskLabelFromScore } from '@/lib/risk';
import { log } from '@/lib/logger';
import { NotFoundError } from '@/lib/errors';

interface PaginatedLearnersResponse {
  data: Array<{
    id: number;
    name: string;
    email: string;
    completion_pct: number;
    quiz_avg: number;
    missed_sessions: number;
    last_login: string;
    risk_score: number;
    risk_label: 'low' | 'medium' | 'high';
    created_at: string;
    updated_at: string;
  }>;
  nextCursor: number | null;
  hasMore: boolean;
  total?: number;
}

// GET /api/learners - List learners with cursor-based pagination
async function getLearnersHandler(request: NextRequest): Promise<Response> {
  const { cursor, limit } = getPaginationParams(request);
  
  log.info('Fetching learners', { cursor, limit });
  
  // Build query with cursor-based pagination
  let query = supabaseAdmin
    .from('learners')
    .select('*')
    .order('id', { ascending: true })
    .limit(limit + 1); // Fetch one extra to determine if there are more
  
  // Apply cursor if provided
  if (cursor) {
    query = query.gt('id', cursor);
  }
  
  const { data, error } = await query;
  
  if (error) {
    log.error('Failed to fetch learners', { error: error.message, cursor, limit });
    throw new Error(`Failed to fetch learners: ${error.message}`);
  }
  
  if (!data) {
    throw new Error('No data returned from learners query');
  }
  
  // Determine if there are more results
  const hasMore = data.length > limit;
  const learners = hasMore ? data.slice(0, limit) : data;
  const nextCursor = hasMore && learners.length > 0 ? learners[learners.length - 1].id : null;
  
  // Optionally get total count (can be expensive for large datasets)
  let total: number | undefined;
  if (!cursor) { // Only get total on first page to avoid performance issues
    const { count, error: countError } = await supabaseAdmin
      .from('learners')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      total = count || 0;
    }
  }
  
  const response: PaginatedLearnersResponse = {
    data: learners,
    nextCursor,
    hasMore,
    ...(total !== undefined && { total })
  };
  
  log.info('Learners fetched successfully', {
    count: learners.length,
    hasMore,
    nextCursor,
    total
  });
  
  return Response.json(response);
}

// POST /api/learners - Create a new learner
async function createLearnerHandler(request: NextRequest): Promise<Response> {
  const body = await request.json();
  const learnerData = parseBody(learnerCreateSchema, body);
  
  log.info('Creating new learner', { email: learnerData.email, name: learnerData.name });
  
  // Compute initial risk score
  const riskScore = computeRiskScore({
    completionPct: learnerData.completionPct,
    quizAvg: learnerData.quizAvg,
    missedSessions: learnerData.missedSessions,
    lastLogin: learnerData.lastLogin ? new Date(learnerData.lastLogin) : new Date()
  });
  
  const riskLabel = riskLabelFromScore(riskScore);
  
  // Prepare data for insertion
  const insertData = {
    name: learnerData.name,
    email: learnerData.email,
    completion_pct: learnerData.completionPct,
    quiz_avg: learnerData.quizAvg,
    missed_sessions: learnerData.missedSessions,
    last_login: learnerData.lastLogin || new Date().toISOString(),
    risk_score: riskScore,
    risk_label: riskLabel
  };
  
  const { data, error } = await supabaseAdmin
    .from('learners')
    .insert(insertData)
    .select()
    .single();
  
  if (error) {
    if (error.code === '23505') { // Unique constraint violation (email)
      log.warn('Attempted to create learner with duplicate email', { email: learnerData.email });
      throw new Error('A learner with this email already exists');
    }
    
    log.error('Failed to create learner', { 
      error: error.message, 
      code: error.code,
      learnerData 
    });
    throw new Error(`Failed to create learner: ${error.message}`);
  }
  
  if (!data) {
    throw new Error('No data returned from learner creation');
  }
  
  log.info('Learner created successfully', {
    id: data.id,
    email: data.email,
    riskScore: data.risk_score,
    riskLabel: data.risk_label
  });
  
  return Response.json(data, { status: 201 });
}

// Export handlers with error handling
export const GET = withErrorHandling(getLearnersHandler);
export const POST = withErrorHandling(createLearnerHandler);