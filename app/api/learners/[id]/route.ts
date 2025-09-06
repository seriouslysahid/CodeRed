// app/api/learners/[id]/route.ts
// Individual learner endpoints: GET, PUT, DELETE

import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { withErrorHandling, requireAdmin } from '@/lib/middleware';
import { parseBody, learnerUpdateSchema, type UpdateLearnerData } from '@/lib/validation';
import { computeRiskScore, riskLabelFromScore } from '@/lib/risk';
import { log } from '@/lib/logger';
import { NotFoundError } from '@/lib/errors';

interface RouteParams {
  params: {
    id: string;
  };
}

// Helper to validate and parse learner ID
function parseLearnerId(id: string): number {
  const learnerId = parseInt(id, 10);
  if (isNaN(learnerId) || learnerId <= 0) {
    throw new Error('Invalid learner ID');
  }
  return learnerId;
}

// Helper to fetch learner by ID
async function fetchLearnerById(id: number) {
  const { data, error } = await supabaseAdmin
    .from('learners')
    .select('*')
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
  
  return data as any; // Type assertion to work around Supabase typing issues
}

// GET /api/learners/[id] - Get single learner
async function getLearnerHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  const learnerId = parseLearnerId(params.id);
  
  log.info('Fetching learner by ID', { learnerId });
  
  const learner = await fetchLearnerById(learnerId);
  
  log.info('Learner fetched successfully', {
    id: learner.id,
    email: learner.email,
    riskLabel: learner.risk_label
  });
  
  return Response.json(learner);
}

// PUT /api/learners/[id] - Update learner
async function updateLearnerHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  const learnerId = parseLearnerId(params.id);
  const body = await parseBody<UpdateLearnerData>(request);
  const updateData = learnerUpdateSchema.validate(body);
  
  log.info('Updating learner', { learnerId, updateFields: Object.keys(updateData) });
  
  // First, fetch the current learner to ensure it exists
  const currentLearner = await fetchLearnerById(learnerId);
  
  // Prepare update data with risk recalculation
  const updatedFields: any = {};
  
  // Copy provided fields
  if (updateData.name !== undefined) updatedFields.name = updateData.name;
  if (updateData.email !== undefined) updatedFields.email = updateData.email;
  if (updateData.completionPct !== undefined) updatedFields.completion_pct = updateData.completionPct;
  if (updateData.quizAvg !== undefined) updatedFields.quiz_avg = updateData.quizAvg;
  if (updateData.missedSessions !== undefined) updatedFields.missed_sessions = updateData.missedSessions;
  if (updateData.lastLogin !== undefined) updatedFields.last_login = updateData.lastLogin;
  
  // Recompute risk score if any risk-affecting fields were updated
  const riskAffectingFields = ['completionPct', 'quizAvg', 'missedSessions', 'lastLogin'];
  const shouldRecalculateRisk = riskAffectingFields.some(field => updateData[field as keyof UpdateLearnerData] !== undefined);
  
  if (shouldRecalculateRisk) {
    // Merge current data with updates for risk calculation
    const learnerForRisk = {
      completionPct: updatedFields.completion_pct ?? currentLearner.completion_pct,
      quizAvg: updatedFields.quiz_avg ?? currentLearner.quiz_avg,
      missedSessions: updatedFields.missed_sessions ?? currentLearner.missed_sessions,
      lastLogin: updatedFields.last_login ?? currentLearner.last_login
    };
    
    const newRiskScore = computeRiskScore(learnerForRisk);
    const newRiskLabel = riskLabelFromScore(newRiskScore);
    
    updatedFields.risk_score = newRiskScore;
    updatedFields.risk_label = newRiskLabel;
    
    log.info('Risk score recalculated', {
      learnerId,
      oldRiskScore: currentLearner.risk_score,
      newRiskScore,
      oldRiskLabel: currentLearner.risk_label,
      newRiskLabel
    });
  }
  
  // Perform the update
  const { data, error } = await (supabaseAdmin as any)
    .from('learners')
    .update(updatedFields)
    .eq('id', learnerId)
    .select()
    .single();
  
  if (error) {
    if (error.code === '23505') { // Unique constraint violation (email)
      log.warn('Attempted to update learner with duplicate email', { 
        learnerId, 
        email: updateData.email 
      });
      throw new Error('A learner with this email already exists');
    }
    
    log.error('Failed to update learner', {
      error: error.message,
      code: error.code,
      learnerId,
      updateData
    });
    throw new Error(`Failed to update learner: ${error.message}`);
  }
  
  if (!data) {
    throw new Error('No data returned from learner update');
  }
  
  log.info('Learner updated successfully', {
    id: data.id,
    email: data.email,
    updatedFields: Object.keys(updatedFields)
  });
  
  return Response.json(data);
}

// DELETE /api/learners/[id] - Delete learner (admin only)
async function deleteLearnerHandler(
  request: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  const learnerId = parseLearnerId(params.id);
  
  // Require admin authentication
  requireAdmin(request);
  
  log.info('Deleting learner (admin operation)', { learnerId });
  
  // First, verify the learner exists
  await fetchLearnerById(learnerId);
  
  // Delete the learner (cascading delete will handle nudges)
  const { error } = await supabaseAdmin
    .from('learners')
    .delete()
    .eq('id', learnerId);
  
  if (error) {
    log.error('Failed to delete learner', {
      error: error.message,
      code: error.code,
      learnerId
    });
    throw new Error(`Failed to delete learner: ${error.message}`);
  }
  
  log.info('Learner deleted successfully', { learnerId });
  
  // Return 204 No Content for successful deletion
  return new Response(null, { status: 204 });
}

// Export handlers with error handling
export const GET = withErrorHandling(async (request: NextRequest) => {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.indexOf('learners') + 1];
  
  if (!id) {
    return Response.json({ error: 'Missing learner ID' }, { status: 400 });
  }
  
  return getLearnerHandler(request, { params: { id } });
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.indexOf('learners') + 1];
  
  if (!id) {
    return Response.json({ error: 'Missing learner ID' }, { status: 400 });
  }
  
  return updateLearnerHandler(request, { params: { id } });
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.indexOf('learners') + 1];
  
  if (!id) {
    return Response.json({ error: 'Missing learner ID' }, { status: 400 });
  }
  
  return deleteLearnerHandler(request, { params: { id } });
});