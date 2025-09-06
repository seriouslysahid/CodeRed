// Core type definitions for CodeRed Frontend

export interface Learner {
  id: number;
  name: string;
  email: string;
  completionPct: number;
  quizAvg: number;
  missedSessions: number;
  lastLogin: string;
  riskScore: number;
  riskLabel: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Nudge {
  id: number;
  learnerId: number;
  text: string;
  status: 'sent' | 'fallback';
  source: 'gemini' | 'template';
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: number | null;
  hasMore: boolean;
}

export interface NudgeStreamState {
  text: string;
  status: 'idle' | 'streaming' | 'completed' | 'error' | 'cancelled';
  error?: string;
  isFallback?: boolean;
}

export interface FilterState {
  search: string;
  riskFilter: 'all' | 'low' | 'medium' | 'high';
  sortBy: 'name' | 'risk' | 'lastLogin';
  sortOrder: 'asc' | 'desc';
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface SimulationStatus {
  isRunning: boolean;
  processed: number;
  total: number;
  startedAt?: string;
  completedAt?: string;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
}

// Request/Response types for API endpoints
export interface CreateNudgeRequest {
  learnerId: number;
  text?: string;
}

export interface CreateNudgeResponse {
  nudge: Nudge;
  success: boolean;
}

export interface LearnersQueryParams {
  cursor?: number;
  limit?: number;
  search?: string;
  riskFilter?: 'low' | 'medium' | 'high';
  sortBy?: 'name' | 'risk' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

export interface SimulationResponse {
  success: boolean;
  processed: number;
  updated: number;
  message: string;
}