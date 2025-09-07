// Basic test to verify validation functionality
import { describe, it, expect } from 'vitest';
import { 
  validateLearner, 
  validateCreateNudge, 
  isValidEmail, 
  isValidPercentage,
  ValidationError 
} from '../validation';

describe('Validation', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('isValidPercentage', () => {
    it('should validate correct percentages', () => {
      expect(isValidPercentage(0)).toBe(true);
      expect(isValidPercentage(50.5)).toBe(true);
      expect(isValidPercentage(100)).toBe(true);
    });

    it('should reject invalid percentages', () => {
      expect(isValidPercentage(-1)).toBe(false);
      expect(isValidPercentage(101)).toBe(false);
      expect(isValidPercentage(NaN)).toBe(false);
    });
  });

  describe('validateLearner', () => {
    it('should validate correct learner data', () => {
      const validLearner = {
        name: 'John Doe',
        email: 'john@example.com',
        completionPct: 75.5,
        quizAvg: 85.0,
        missedSessions: 2,
      };

      const result = validateLearner(validLearner);
      expect(result).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        completionPct: 75.5,
        quizAvg: 85.0,
        missedSessions: 2,
      });
    });

    it('should throw ValidationError for invalid data', () => {
      const invalidLearner = {
        name: '',
        email: 'invalid-email',
        completionPct: 150,
      };

      expect(() => validateLearner(invalidLearner)).toThrow(ValidationError);
    });
  });

  describe('validateCreateNudge', () => {
    it('should validate correct nudge data', () => {
      const validNudge = {
        learnerId: 123,
        text: 'This is a valid nudge message that is long enough.',
      };

      const result = validateCreateNudge(validNudge);
      expect(result).toEqual(validNudge);
    });

    it('should throw ValidationError for missing learnerId', () => {
      const invalidNudge = {
        text: 'This is a valid nudge message.',
      };

      expect(() => validateCreateNudge(invalidNudge)).toThrow(ValidationError);
    });

    it('should throw ValidationError for short text', () => {
      const invalidNudge = {
        learnerId: 123,
        text: 'Short',
      };

      expect(() => validateCreateNudge(invalidNudge)).toThrow(ValidationError);
    });
  });
});