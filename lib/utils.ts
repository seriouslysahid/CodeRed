// Utility functions for data formatting and validation
import type { Learner, FilterState, NudgeStreamState } from './types';
import { ValidationError } from './errors';

// Date formatting utilities
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return 'Unknown';
  }
}

// Number formatting utilities
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatRiskScore(score: number): string {
  return score.toFixed(2);
}

// Risk label utilities
export function getRiskColor(riskLabel: Learner['riskLabel']): string {
  switch (riskLabel) {
    case 'low':
      return 'text-green-600 bg-green-50';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50';
    case 'high':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getRiskBadgeColor(riskLabel: Learner['riskLabel']): string {
  switch (riskLabel) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Data validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}

export function validatePositiveNumber(value: number): boolean {
  return value >= 0 && Number.isFinite(value);
}

export function validateLearnerData(data: Partial<Learner>): string[] {
  const errors: string[] = [];
  
  if (data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    } else if (data.name.length > 100) {
      errors.push('Name must be less than 100 characters');
    }
  }
  
  if (data.email !== undefined && !validateEmail(data.email)) {
    errors.push('Invalid email format');
  }
  
  if (data.completionPct !== undefined && !validatePercentage(data.completionPct)) {
    errors.push('Completion percentage must be between 0 and 100');
  }
  
  if (data.quizAvg !== undefined && !validatePercentage(data.quizAvg)) {
    errors.push('Quiz average must be between 0 and 100');
  }
  
  if (data.missedSessions !== undefined && !validatePositiveNumber(data.missedSessions)) {
    errors.push('Missed sessions must be a positive number');
  }
  
  return errors;
}

// Filter and search utilities
export function applyFilters(learners: Learner[], filters: FilterState): Learner[] {
  let filtered = [...learners];
  
  // Apply search filter
  if (filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase().trim();
    filtered = filtered.filter(learner =>
      learner.name.toLowerCase().includes(searchTerm) ||
      learner.email.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply risk filter
  if (filters.riskFilter !== 'all') {
    filtered = filtered.filter(learner => learner.riskLabel === filters.riskFilter);
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (filters.sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'risk':
        aValue = a.riskScore;
        bValue = b.riskScore;
        break;
      case 'lastLogin':
        aValue = new Date(a.lastLogin).getTime();
        bValue = new Date(b.lastLogin).getTime();
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return filtered;
}

// Stream processing utilities
export function createNudgeStreamState(): NudgeStreamState {
  return {
    text: '',
    status: 'idle',
  };
}

export function updateNudgeStreamState(
  current: NudgeStreamState,
  update: Partial<NudgeStreamState>
): NudgeStreamState {
  return {
    ...current,
    ...update,
  };
}

// URL and query parameter utilities
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export function parseQueryParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unknown error occurred';
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

// Data transformation utilities
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Debounce utility for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}