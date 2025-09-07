// Basic test to verify API client functionality
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../api-client';
import { ApiError, NetworkError, TimeoutError } from '../errors';

// Mock fetch globally
global.fetch = vi.fn();

describe('ApiClient', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    apiClient = new ApiClient({ baseURL: 'http://localhost:3000/api' });
    vi.clearAllMocks();
  });

  it('should create an instance with default config', () => {
    const client = new ApiClient();
    expect(client).toBeInstanceOf(ApiClient);
  });

  it('should make a successful GET request', async () => {
    const mockResponse = { data: [{ id: 1, name: 'Test Learner' }] };
    
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(mockResponse),
    });

    const result = await apiClient.get('/learners');
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/learners',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should handle API errors correctly', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ error: 'Learner not found' }),
    });

    await expect(apiClient.get('/learners/999')).rejects.toThrow(ApiError);
  });

  it('should handle network errors', async () => {
    (fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(apiClient.get('/learners')).rejects.toThrow(NetworkError);
  });

  it('should build query parameters correctly', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ data: [] }),
    });

    await apiClient.get('/learners', { 
      search: 'test', 
      riskFilter: 'high',
      limit: 10 
    });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/learners?search=test&riskFilter=high&limit=10',
      expect.any(Object)
    );
  });
});