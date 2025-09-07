// Centralized API client for CodeRed Frontend
import { 
  ApiError, 
  NetworkError, 
  TimeoutError, 
  StreamError 
} from './errors';
import type {
  Learner,
  Nudge,
  PaginatedResponse,
  LearnersQueryParams,
  CreateNudgeRequest,
  CreateNudgeResponse,
  SimulationResponse,
  RiskDistribution,
  ApiResponse
} from './types';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || process.env.NEXT_PUBLIC_API_BASE || '/api';
    this.timeout = config.timeout || 30000; // 30 seconds
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    const controller = new AbortController();
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.timeout);

    try {
      const response = await fetch(url.toString(), {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await ApiError.fromResponse(response);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (!contentType || response.status === 204) {
        return {} as T;
      }

      if (contentType.includes('application/json')) {
        return await response.json();
      }

      return (await response.text()) as unknown as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError('Request timed out');
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Network connection failed');
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  async get<T>(
    endpoint: string, 
    params?: Record<string, any>
  ): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(
    endpoint: string, 
    data?: any
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string, 
    data?: any
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async stream(
    endpoint: string, 
    data?: any,
    signal?: AbortSignal
  ): Promise<ReadableStream<Uint8Array>> {
    const url = new URL(endpoint, this.baseURL);
    
    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          ...this.defaultHeaders,
          'Accept': 'text/plain, application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
        signal,
      });

      if (!response.ok) {
        throw await ApiError.fromResponse(response);
      }

      if (!response.body) {
        throw new StreamError('Response body is not available for streaming');
      }

      return response.body;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new StreamError('Stream was cancelled');
      }

      throw new StreamError(
        error instanceof Error ? error.message : 'Stream error occurred',
        error instanceof Error ? error : undefined
      );
    }
  }

  // Learner-specific methods
  async getLearners(params?: LearnersQueryParams): Promise<PaginatedResponse<Learner>> {
    return this.get<PaginatedResponse<Learner>>('/learners', params);
  }

  async getLearner(id: number): Promise<Learner> {
    return this.get<Learner>(`/learners/${id}`);
  }

  async getRiskDistribution(): Promise<RiskDistribution> {
    return this.get<RiskDistribution>('/learners/risk-distribution');
  }

  // Nudge-specific methods
  async createNudge(request: CreateNudgeRequest): Promise<CreateNudgeResponse> {
    return this.post<CreateNudgeResponse>('/nudges', request);
  }

  async streamNudge(
    learnerId: number, 
    signal?: AbortSignal
  ): Promise<ReadableStream<Uint8Array>> {
    return this.stream(`/learners/${learnerId}/nudge`, undefined, signal);
  }

  async getNudges(learnerId: number): Promise<Nudge[]> {
    return this.get<Nudge[]>(`/learners/${learnerId}/nudges`);
  }

  // Admin-specific methods
  async runSimulation(): Promise<SimulationResponse> {
    return this.post<SimulationResponse>('/admin/simulate');
  }

  async getSimulationStatus(): Promise<{ isRunning: boolean }> {
    return this.get<{ isRunning: boolean }>('/admin/simulation-status');
  }
}

// Create a default instance
export const apiClient = new ApiClient();

// Export for testing and custom configurations
export default ApiClient;