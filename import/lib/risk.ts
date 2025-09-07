// lib/risk.ts
// Risk assessment engine for learner engagement scoring

import { log } from './logger';

export interface LearnerLike {
  completionPct: number;
  quizAvg: number;
  missedSessions: number;
  lastLogin: string | Date;
}

export interface RiskWeights {
  completion: number;
  quiz: number;
  missed: number;
  login: number;
}

export interface RiskCalculationResult {
  riskScore: number;
  riskLabel: 'low' | 'medium' | 'high';
  components: {
    completion: number;
    quiz: number;
    missed: number;
    login: number;
  };
}

// Get and validate risk weights from environment
export function getRiskWeights(): RiskWeights {
  const weights = {
    completion: parseFloat(process.env.RISK_WEIGHT_COMPLETION ?? '0.4'),
    quiz: parseFloat(process.env.RISK_WEIGHT_QUIZ ?? '0.35'),
    missed: parseFloat(process.env.RISK_WEIGHT_MISSED ?? '0.15'),
    login: parseFloat(process.env.RISK_WEIGHT_LOGIN ?? '0.1')
  };
  
  // Validate weights sum to 1.0 (with small tolerance for floating point)
  const sum = weights.completion + weights.quiz + weights.missed + weights.login;
  if (Math.abs(sum - 1.0) > 0.001) {
    log.warn('Risk weights do not sum to 1.0', { weights, sum });
  }
  
  // Ensure all weights are non-negative
  Object.entries(weights).forEach(([key, value]) => {
    if (value < 0 || value > 1) {
      log.warn(`Invalid risk weight for ${key}`, { value });
    }
  });
  
  return weights;
}

// Compute individual component scores (0-1, higher is better performance)
function computeComponentScores(learner: LearnerLike) {
  // Completion score: normalize percentage to 0-1
  const completion = Math.max(0, Math.min(1, learner.completionPct / 100));
  
  // Quiz score: normalize percentage to 0-1
  const quiz = Math.max(0, Math.min(1, learner.quizAvg / 100));
  
  // Missed sessions score: penalty-based, capped at 10 missed sessions
  const missedPenalty = Math.min(1, Math.max(0, learner.missedSessions) / 10);
  const missed = 1 - missedPenalty;
  
  // Login recency score: time-decay based on days since last login
  const lastLoginDate = typeof learner.lastLogin === 'string' 
    ? new Date(learner.lastLogin) 
    : learner.lastLogin;
    
  // Handle invalid dates
  if (isNaN(lastLoginDate.getTime())) {
    log.warn('Invalid lastLogin date', { lastLogin: learner.lastLogin });
    return { completion, quiz, missed, login: 0 };
  }
  
  const daysSinceLogin = Math.max(0, (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
  const login = Math.max(0, 1 - Math.min(1, daysSinceLogin / 30)); // 30-day decay
  
  return { completion, quiz, missed, login };
}

// Main risk score computation function
export function computeRiskScore(learner: LearnerLike): number {
  try {
    const weights = getRiskWeights();
    const components = computeComponentScores(learner);
    
    // Calculate weighted sum (higher score = better performance)
    const weightedSum = 
      components.completion * weights.completion +
      components.quiz * weights.quiz +
      components.missed * weights.missed +
      components.login * weights.login;
    
    // Risk score is inverse of performance (higher risk = worse performance)
    const riskScore = 1 - weightedSum;
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(1, riskScore));
  } catch (error) {
    log.error('Error computing risk score', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      learner 
    });
    // Return medium risk as fallback
    return 0.5;
  }
}

// Convert risk score to categorical label
export function riskLabelFromScore(score: number): 'low' | 'medium' | 'high' {
  if (score < 0) return 'low';
  if (score > 1) return 'high';
  
  if (score < 0.33) return 'low';
  if (score < 0.66) return 'medium';
  return 'high';
}

// Comprehensive risk assessment with detailed breakdown
export function assessRisk(learner: LearnerLike): RiskCalculationResult {
  const weights = getRiskWeights();
  const components = computeComponentScores(learner);
  const riskScore = computeRiskScore(learner);
  const riskLabel = riskLabelFromScore(riskScore);
  
  return {
    riskScore,
    riskLabel,
    components
  };
}

// Batch risk computation for multiple learners
export function computeBatchRiskScores(learners: LearnerLike[]): Array<{ index: number; riskScore: number; riskLabel: 'low' | 'medium' | 'high' }> {
  return learners.map((learner, index) => ({
    index,
    riskScore: computeRiskScore(learner),
    riskLabel: riskLabelFromScore(computeRiskScore(learner))
  }));
}
