// Data validation schemas and utilities
import { ValidationError as BaseValidationError } from './errors';
import type { Learner, CreateNudgeRequest, LearnersQueryParams } from './types';

// Frontend-specific ValidationError that matches our usage pattern
export class ValidationError extends Error {
  public readonly name = 'ValidationError';

  constructor(
    message: string,
    public readonly field?: string,
    public readonly validationErrors?: Record<string, string[]>
  ) {
    super(message);
  }
}

// Basic validation functions
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPercentage(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 100 && !isNaN(value);
}

export function isValidPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value >= 0 && !isNaN(value);
}

export function isValidRiskLabel(label: string): label is Learner['riskLabel'] {
  return ['low', 'medium', 'high'].includes(label);
}

// Validation schemas
export interface ValidationSchema<T> {
  validate(data: unknown): T;
}

export class LearnerValidationSchema implements ValidationSchema<Partial<Learner>> {
  validate(data: unknown): Partial<Learner> {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid data format', undefined, {
        root: ['Data must be an object']
      });
    }

    const learner = data as Record<string, any>;
    const errors: Record<string, string[]> = {};
    const result: Partial<Learner> = {};

    // Validate name
    if ('name' in learner) {
      if (typeof learner.name !== 'string') {
        errors.name = ['Name must be a string'];
      } else if (learner.name.trim().length === 0) {
        errors.name = ['Name is required'];
      } else if (learner.name.length > 100) {
        errors.name = ['Name must be less than 100 characters'];
      } else {
        result.name = learner.name.trim();
      }
    }

    // Validate email
    if ('email' in learner) {
      if (typeof learner.email !== 'string') {
        errors.email = ['Email must be a string'];
      } else if (!isValidEmail(learner.email)) {
        errors.email = ['Invalid email format'];
      } else {
        result.email = learner.email.toLowerCase().trim();
      }
    }

    // Validate completionPct
    if ('completionPct' in learner) {
      if (!isValidPercentage(learner.completionPct)) {
        errors.completionPct = ['Completion percentage must be between 0 and 100'];
      } else {
        result.completionPct = learner.completionPct;
      }
    }

    // Validate quizAvg
    if ('quizAvg' in learner) {
      if (!isValidPercentage(learner.quizAvg)) {
        errors.quizAvg = ['Quiz average must be between 0 and 100'];
      } else {
        result.quizAvg = learner.quizAvg;
      }
    }

    // Validate missedSessions
    if ('missedSessions' in learner) {
      if (!isValidPositiveNumber(learner.missedSessions)) {
        errors.missedSessions = ['Missed sessions must be a positive number'];
      } else {
        result.missedSessions = learner.missedSessions;
      }
    }

    // Validate riskScore
    if ('riskScore' in learner) {
      if (!isValidPositiveNumber(learner.riskScore)) {
        errors.riskScore = ['Risk score must be a positive number'];
      } else {
        result.riskScore = learner.riskScore;
      }
    }

    // Validate riskLabel
    if ('riskLabel' in learner) {
      if (!isValidRiskLabel(learner.riskLabel)) {
        errors.riskLabel = ['Risk label must be low, medium, or high'];
      } else {
        result.riskLabel = learner.riskLabel;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Validation failed', undefined, errors);
    }

    return result;
  }
}

export class CreateNudgeValidationSchema implements ValidationSchema<CreateNudgeRequest> {
  validate(data: unknown): CreateNudgeRequest {
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Invalid data format', undefined, {
        root: ['Data must be an object']
      });
    }

    const nudge = data as Record<string, any>;
    const errors: Record<string, string[]> = {};
    const result: Partial<CreateNudgeRequest> = {};

    // Validate learnerId (required)
    if (!('learnerId' in nudge)) {
      errors.learnerId = ['Learner ID is required'];
    } else if (typeof nudge.learnerId !== 'number' || nudge.learnerId <= 0) {
      errors.learnerId = ['Learner ID must be a positive number'];
    } else {
      result.learnerId = nudge.learnerId;
    }

    // Validate text (optional)
    if ('text' in nudge) {
      if (typeof nudge.text !== 'string') {
        errors.text = ['Text must be a string'];
      } else if (nudge.text.trim().length < 10) {
        errors.text = ['Text must be at least 10 characters'];
      } else if (nudge.text.length > 1000) {
        errors.text = ['Text must be less than 1000 characters'];
      } else {
        result.text = nudge.text.trim();
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Validation failed', undefined, errors);
    }

    return result as CreateNudgeRequest;
  }
}

export class QueryParamsValidationSchema implements ValidationSchema<LearnersQueryParams> {
  validate(data: unknown): LearnersQueryParams {
    if (!data || typeof data !== 'object') {
      return {};
    }

    const params = data as Record<string, any>;
    const result: LearnersQueryParams = {};

    // Validate cursor
    if ('cursor' in params && params.cursor !== undefined) {
      const cursor = Number(params.cursor);
      if (!isNaN(cursor) && cursor >= 0) {
        result.cursor = cursor;
      }
    }

    // Validate limit
    if ('limit' in params && params.limit !== undefined) {
      const limit = Number(params.limit);
      if (!isNaN(limit) && limit > 0 && limit <= 100) {
        result.limit = limit;
      }
    }

    // Validate search
    if ('search' in params && typeof params.search === 'string') {
      const search = params.search.trim();
      if (search.length > 0 && search.length <= 100) {
        result.search = search;
      }
    }

    // Validate riskFilter
    if ('riskFilter' in params && isValidRiskLabel(params.riskFilter)) {
      result.riskFilter = params.riskFilter;
    }

    // Validate sortBy
    if ('sortBy' in params) {
      const validSortFields = ['name', 'risk', 'lastLogin'];
      if (validSortFields.includes(params.sortBy)) {
        result.sortBy = params.sortBy;
      }
    }

    // Validate sortOrder
    if ('sortOrder' in params) {
      const validSortOrders = ['asc', 'desc'];
      if (validSortOrders.includes(params.sortOrder)) {
        result.sortOrder = params.sortOrder;
      }
    }

    return result;
  }
}

// Validation helper functions
export function validateLearner(data: unknown): Partial<Learner> {
  const schema = new LearnerValidationSchema();
  return schema.validate(data);
}

export function validateCreateNudge(data: unknown): CreateNudgeRequest {
  const schema = new CreateNudgeValidationSchema();
  return schema.validate(data);
}

export function validateQueryParams(data: unknown): LearnersQueryParams {
  const schema = new QueryParamsValidationSchema();
  return schema.validate(data);
}

// Sanitization utilities
export function sanitizeString(input: string, maxLength = 1000): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .substring(0, maxLength);
}

export function sanitizeNumber(input: any, min = 0, max = Number.MAX_SAFE_INTEGER): number | null {
  const num = Number(input);
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  return num;
}

// Validation result type
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

export function safeValidate<T>(
  validator: ValidationSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validData = validator.validate(data);
    return {
      isValid: true,
      data: validData,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        isValid: false,
        errors: error.validationErrors,
      };
    }
    return {
      isValid: false,
      errors: {
        root: [error instanceof Error ? error.message : 'Unknown validation error'],
      },
    };
  }
}