// lib/errors.ts
// Custom error classes and response normalization for the API

export class ValidationError extends Error {
  public readonly details: Record<string, string[]>;
  
  constructor(details: Record<string, string[]>) {
    super('validation_failed');
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends Error {
  public readonly resource: string;
  public readonly id: string | number;
  
  constructor(resource: string, id: string | number) {
    super(`${resource} not found: ${id}`);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.id = id;
  }
}

export class AuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
  }
}

export class ExternalServiceError extends Error {
  public readonly service: string;
  public readonly originalError?: Error;
  
  constructor(service: string, message: string, originalError?: Error) {
    super(`${service} error: ${message}`);
    this.name = 'ExternalServiceError';
    this.service = service;
    this.originalError = originalError;
  }
}

// Frontend-specific API client error classes
export class ApiError extends Error {
  public readonly name: string = 'ApiError';
  public readonly timestamp = new Date().toISOString();

  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: Response,
    public readonly data?: any
  ) {
    super(message);
  }

  get isNetworkError(): boolean {
    return this.status === 0 || !this.status;
  }

  get isServerError(): boolean {
    return this.status ? this.status >= 500 : false;
  }

  get isClientError(): boolean {
    return this.status ? this.status >= 400 && this.status < 500 : false;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let data: any;
    let message = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
        message = data.error || data.message || message;
      } else {
        data = await response.text();
        message = data || message;
      }
    } catch {
      // If we can't parse the response, use the default message
    }

    return new ApiError(message, response.status, response, data);
  }
}

export class NetworkError extends ApiError {
  public readonly name = 'NetworkError';

  constructor(message = 'Network connection failed') {
    super(message, 0);
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class TimeoutError extends ApiError {
  public readonly name = 'TimeoutError';

  constructor(message = 'Request timed out') {
    super(message);
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class StreamError extends ApiError {
  public readonly name = 'StreamError';

  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, StreamError.prototype);
  }
}

// Error response interface
export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: string;
  requestId?: string;
}

// Normalize errors into consistent API responses
export function normalizeError(error: unknown, requestId?: string): {
  status: number;
  response: ErrorResponse;
} {
  const timestamp = new Date().toISOString();
  
  if (error instanceof ValidationError) {
    return {
      status: 400,
      response: {
        error: 'validation_failed',
        message: 'Request validation failed',
        details: error.details,
        timestamp,
        requestId
      }
    };
  }
  
  if (error instanceof NotFoundError) {
    return {
      status: 404,
      response: {
        error: 'not_found',
        message: error.message,
        timestamp,
        requestId
      }
    };
  }
  
  if (error instanceof AuthError) {
    return {
      status: 401,
      response: {
        error: 'unauthorized',
        message: error.message,
        timestamp,
        requestId
      }
    };
  }
  
  if (error instanceof ExternalServiceError) {
    return {
      status: 502,
      response: {
        error: 'external_service_error',
        message: `External service unavailable: ${error.service}`,
        timestamp,
        requestId
      }
    };
  }
  
  // Generic server error - sanitize the message
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  return {
    status: 500,
    response: {
      error: 'internal_server_error',
      message: 'An internal server error occurred',
      timestamp,
      requestId
    }
  };
}

// Helper to generate request IDs for tracking
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}