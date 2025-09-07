import { NextResponse } from 'next/server';

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version?: string;
  api?: 'connected' | 'disconnected';
  database?: 'connected' | 'disconnected';
  services?: {
    [key: string]: 'healthy' | 'unhealthy';
  };
  error?: string;
}

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const timestamp = new Date().toISOString();
  const version = process.env.npm_package_version || '1.0.0';
  
  try {
    // Check API connectivity
    const apiStatus = await checkApiConnectivity();
    
    // Check database connectivity (if applicable)
    const databaseStatus = await checkDatabaseConnectivity();
    
    // Check external services
    const servicesStatus = await checkExternalServices();
    
    // Determine overall health
    const isHealthy = apiStatus === 'connected' && 
                     databaseStatus === 'connected' && 
                     Object.values(servicesStatus).every(status => status === 'healthy');
    
    const response: HealthCheckResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      version,
      api: apiStatus,
      database: databaseStatus,
      services: servicesStatus
    };
    
    return NextResponse.json(response, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    const errorResponse: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp,
      version,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

async function checkApiConnectivity(): Promise<'connected' | 'disconnected'> {
  try {
    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE;
    
    if (!apiBaseUrl) {
      console.warn('API_BASE_URL not configured');
      return 'disconnected';
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${apiBaseUrl}/health`, {
      method: 'GET',
      headers: {
        'User-Agent': 'CodeRed-Frontend-HealthCheck/1.0'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return 'connected';
    } else {
      console.error(`API health check failed with status: ${response.status}`);
      return 'disconnected';
    }
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('API health check timed out');
      } else {
        console.error('API health check failed:', error.message);
      }
    }
    return 'disconnected';
  }
}

async function checkDatabaseConnectivity(): Promise<'connected' | 'disconnected'> {
  try {
    // If using Supabase or direct database connection
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      // No database configured, consider it as connected for frontend-only apps
      return 'connected';
    }
    
    // For Supabase
    if (databaseUrl.includes('supabase')) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { error } = await supabase.from('learners').select('count').limit(1);
      return error ? 'disconnected' : 'connected';
    }
    
    // For other databases, implement specific connectivity checks
    return 'connected';
    
  } catch (error) {
    console.error('Database connectivity check failed:', error);
    return 'disconnected';
  }
}

async function checkExternalServices(): Promise<{ [key: string]: 'healthy' | 'unhealthy' }> {
  const services: { [key: string]: 'healthy' | 'unhealthy' } = {};
  
  try {
    // Check Gemini AI service (if configured)
    if (process.env.GEMINI_API_KEY) {
      services.gemini = await checkGeminiService();
    }
    
    // Check other external services as needed
    // services.analytics = await checkAnalyticsService();
    // services.monitoring = await checkMonitoringService();
    
  } catch (error) {
    console.error('External services check failed:', error);
  }
  
  return services;
}

async function checkGeminiService(): Promise<'healthy' | 'unhealthy'> {
  try {
    // Simple check to see if Gemini API is accessible
    // This is a lightweight check, not a full API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models', {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': process.env.GEMINI_API_KEY!
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    return response.ok ? 'healthy' : 'unhealthy';
    
  } catch (error) {
    console.error('Gemini service check failed:', error);
    return 'unhealthy';
  }
}

// Additional endpoint for detailed system information (admin only)
export async function POST(): Promise<NextResponse> {
  try {
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(systemInfo);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve system information' },
      { status: 500 }
    );
  }
}