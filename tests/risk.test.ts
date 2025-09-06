// tests/risk.test.ts
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { 
  computeRiskScore, 
  riskLabelFromScore, 
  assessRisk, 
  computeBatchRiskScores,
  getRiskWeights,
  type LearnerLike 
} from '../lib/risk';

describe('Risk Engine', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    vi.unstubAllEnvs();
  });

  describe('computeRiskScore', () => {
    test('should calculate low risk for excellent performance', () => {
      const learner: LearnerLike = {
        completionPct: 95,
        quizAvg: 90,
        missedSessions: 0,
        lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      };
      
      const score = computeRiskScore(learner);
      expect(score).toBeLessThan(0.33);
      expect(riskLabelFromScore(score)).toBe('low');
    });

    test('should calculate high risk for poor performance', () => {
      const learner: LearnerLike = {
        completionPct: 10,
        quizAvg: 20,
        missedSessions: 8,
        lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      };
      
      const score = computeRiskScore(learner);
      expect(score).toBeGreaterThan(0.66);
      expect(riskLabelFromScore(score)).toBe('high');
    });

    test('should calculate medium risk for average performance', () => {
      const learner: LearnerLike = {
        completionPct: 60,
        quizAvg: 65,
        missedSessions: 3,
        lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      };
      
      const score = computeRiskScore(learner);
      expect(score).toBeGreaterThanOrEqual(0.33);
      expect(score).toBeLessThan(0.66);
      expect(riskLabelFromScore(score)).toBe('medium');
    });

    test('should handle edge case with zero values', () => {
      const learner: LearnerLike = {
        completionPct: 0,
        quizAvg: 0,
        missedSessions: 0,
        lastLogin: new Date()
      };
      
      const score = computeRiskScore(learner);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    test('should handle edge case with maximum values', () => {
      const learner: LearnerLike = {
        completionPct: 100,
        quizAvg: 100,
        missedSessions: 20, // More than cap of 10
        lastLogin: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
      };
      
      const score = computeRiskScore(learner);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    test('should handle string date format', () => {
      const learner: LearnerLike = {
        completionPct: 75,
        quizAvg: 80,
        missedSessions: 2,
        lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      const score = computeRiskScore(learner);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    test('should use custom weights from environment', () => {
      vi.stubEnv('RISK_WEIGHT_COMPLETION', '0.5');
      vi.stubEnv('RISK_WEIGHT_QUIZ', '0.3');
      vi.stubEnv('RISK_WEIGHT_MISSED', '0.1');
      vi.stubEnv('RISK_WEIGHT_LOGIN', '0.1');

      const learner: LearnerLike = {
        completionPct: 100,
        quizAvg: 0,
        missedSessions: 0,
        lastLogin: new Date()
      };
      
      const score = computeRiskScore(learner);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('riskLabelFromScore', () => {
    test('should return low for scores below 0.33', () => {
      expect(riskLabelFromScore(0)).toBe('low');
      expect(riskLabelFromScore(0.1)).toBe('low');
      expect(riskLabelFromScore(0.32)).toBe('low');
    });

    test('should return medium for scores between 0.33 and 0.66', () => {
      expect(riskLabelFromScore(0.33)).toBe('medium');
      expect(riskLabelFromScore(0.5)).toBe('medium');
      expect(riskLabelFromScore(0.65)).toBe('medium');
    });

    test('should return high for scores 0.66 and above', () => {
      expect(riskLabelFromScore(0.66)).toBe('high');
      expect(riskLabelFromScore(0.8)).toBe('high');
      expect(riskLabelFromScore(1.0)).toBe('high');
    });

    test('should handle edge cases outside normal range', () => {
      expect(riskLabelFromScore(-0.1)).toBe('low');
      expect(riskLabelFromScore(1.1)).toBe('high');
    });
  });

  describe('assessRisk', () => {
    test('should return comprehensive risk assessment', () => {
      const learner: LearnerLike = {
        completionPct: 75,
        quizAvg: 80,
        missedSessions: 2,
        lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      };
      
      const assessment = assessRisk(learner);
      
      expect(assessment).toHaveProperty('riskScore');
      expect(assessment).toHaveProperty('riskLabel');
      expect(assessment).toHaveProperty('components');
      
      expect(assessment.riskScore).toBeGreaterThanOrEqual(0);
      expect(assessment.riskScore).toBeLessThanOrEqual(1);
      expect(['low', 'medium', 'high']).toContain(assessment.riskLabel);
      
      expect(assessment.components).toHaveProperty('completion');
      expect(assessment.components).toHaveProperty('quiz');
      expect(assessment.components).toHaveProperty('missed');
      expect(assessment.components).toHaveProperty('login');
    });
  });

  describe('computeBatchRiskScores', () => {
    test('should compute risk scores for multiple learners', () => {
      const learners: LearnerLike[] = [
        {
          completionPct: 90,
          quizAvg: 85,
          missedSessions: 1,
          lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          completionPct: 30,
          quizAvg: 40,
          missedSessions: 6,
          lastLogin: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
        }
      ];
      
      const results = computeBatchRiskScores(learners);
      
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('index', 0);
      expect(results[0]).toHaveProperty('riskScore');
      expect(results[0]).toHaveProperty('riskLabel');
      expect(results[1]).toHaveProperty('index', 1);
      expect(results[1]).toHaveProperty('riskScore');
      expect(results[1]).toHaveProperty('riskLabel');
      
      // First learner should have lower risk than second
      expect(results[0].riskScore).toBeLessThan(results[1].riskScore);
    });

    test('should handle empty array', () => {
      const results = computeBatchRiskScores([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('getRiskWeights', () => {
    test('should return default weights when no env vars set', () => {
      const weights = getRiskWeights();
      
      expect(weights.completion).toBe(0.4);
      expect(weights.quiz).toBe(0.35);
      expect(weights.missed).toBe(0.15);
      expect(weights.login).toBe(0.1);
    });

    test('should use custom weights from environment', () => {
      vi.stubEnv('RISK_WEIGHT_COMPLETION', '0.5');
      vi.stubEnv('RISK_WEIGHT_QUIZ', '0.3');
      vi.stubEnv('RISK_WEIGHT_MISSED', '0.1');
      vi.stubEnv('RISK_WEIGHT_LOGIN', '0.1');

      const weights = getRiskWeights();
      
      expect(weights.completion).toBe(0.5);
      expect(weights.quiz).toBe(0.3);
      expect(weights.missed).toBe(0.1);
      expect(weights.login).toBe(0.1);
    });
  });
});