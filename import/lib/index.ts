// Core library exports for CodeRed Frontend

// Types
export type * from './types';

// API Client
export { ApiClient, apiClient } from './api-client';
export type { ApiClientConfig } from './api-client';

// Error classes
export {
  ApiError,
  NetworkError,
  TimeoutError,
  StreamError,
  ValidationError,
  NotFoundError,
  AuthError,
  ExternalServiceError,
  normalizeError,
  generateRequestId,
} from './errors';
export type { ErrorResponse } from './errors';

// Utilities
export {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatPercentage,
  formatRiskScore,
  getRiskColor,
  getRiskBadgeColor,
  validateEmail,
  validatePercentage,
  validatePositiveNumber,
  validateLearnerData,
  applyFilters,
  createNudgeStreamState,
  updateNudgeStreamState,
  buildQueryString,
  parseQueryParams,
  getErrorMessage,
  isValidationError,
  sanitizeInput,
  truncateText,
  debounce,
} from './utils';

// Validation
export {
  isValidEmail,
  isValidPercentage,
  isValidPositiveNumber,
  isValidRiskLabel,
  LearnerValidationSchema,
  CreateNudgeValidationSchema,
  QueryParamsValidationSchema,
  validateLearner,
  validateCreateNudge,
  validateQueryParams,
  sanitizeString,
  sanitizeNumber,
  safeValidate,
} from './validation';
export type { ValidationSchema, ValidationResult } from './validation';

// Streaming utilities
export {
  StreamTextParser,
  SSEParser,
  createStreamReader,
  detectStreamFormat,
  StreamRateLimiter,
  createStreamTimeout,
} from './streaming';
export type { StreamChunk, StreamParserOptions } from './streaming';