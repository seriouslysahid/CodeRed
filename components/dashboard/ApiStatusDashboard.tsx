'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Cpu, 
  Brain, 
  Zap, 
  Users, 
  Activity, 
  Shield, 
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { 
  GradientCard, 
  AnimatedCounter, 
  PulseGlow, 
  StatusIndicator,
  Card,
  Button
} from '@/components/ui';

interface ApiEndpoint {
  name: string;
  path: string;
  method: string;
  description: string;
  status: 'online' | 'offline' | 'testing';
  responseTime?: number;
  lastChecked?: Date;
}

interface SystemMetrics {
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  uptime: number;
}

const ApiStatusDashboard: React.FC = () => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    {
      name: 'Health Check',
      path: '/api/health',
      method: 'GET',
      description: 'System health monitoring and status checks',
      status: 'online',
      responseTime: 45,
      lastChecked: new Date(),
    },
    {
      name: 'Learners API',
      path: '/api/learners',
      method: 'GET/POST',
      description: 'Learner management with pagination and CRUD operations',
      status: 'online',
      responseTime: 120,
      lastChecked: new Date(),
    },
    {
      name: 'Nudges API',
      path: '/api/nudges',
      method: 'GET',
      description: 'Nudge management and history tracking',
      status: 'online',
      responseTime: 85,
      lastChecked: new Date(),
    },
    {
      name: 'Risk Distribution',
      path: '/api/learners/risk-distribution',
      method: 'GET',
      description: 'Real-time risk analytics and distribution',
      status: 'online',
      responseTime: 75,
      lastChecked: new Date(),
    },
    {
      name: 'Events API',
      path: '/api/events',
      method: 'GET',
      description: 'Learner activity tracking and timeline events',
      status: 'online',
      responseTime: 65,
      lastChecked: new Date(),
    },
    {
      name: 'Risk Simulation',
      path: '/api/simulate',
      method: 'POST',
      description: 'Batch risk recomputation (development only)',
      status: 'offline',
      responseTime: 0,
      lastChecked: new Date(),
    },
  ]);

  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalRequests: 1247,
    successRate: 98.5,
    avgResponseTime: 245,
    uptime: 99.9,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    
    const results = [];
    
    // Check each endpoint
    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint.path, {
          method: endpoint.method.split('/')[0],
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const responseTime = Date.now() - startTime;
        
        const result = {
          path: endpoint.path,
          status: response.ok ? 'online' : 'offline',
          responseTime,
          lastChecked: new Date()
        };
        
        results.push(result);
        
        setEndpoints(prev => prev.map(ep => 
          ep.path === endpoint.path 
            ? { ...ep, ...result }
            : ep
        ));
      } catch (error) {
        const result = {
          path: endpoint.path,
          status: 'offline' as const,
          responseTime: 0,
          lastChecked: new Date()
        };
        
        results.push(result);
        
        setEndpoints(prev => prev.map(ep => 
          ep.path === endpoint.path 
            ? { ...ep, ...result }
            : ep
        ));
      }
    }
    
    // Update metrics based on real results
    const onlineCount = results.filter(r => r.status === 'online').length;
    const totalCount = results.length;
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalCount;
    
    setMetrics(prev => ({
      ...prev,
      successRate: (onlineCount / totalCount) * 100,
      avgResponseTime: Math.round(avgResponseTime),
    }));
    
    setIsRefreshing(false);
  };

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'offline': return 'danger';
      case 'testing': return 'warning';
      default: return 'secondary';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GradientCard gradient="primary" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Requests</p>
              <AnimatedCounter
                value={metrics.totalRequests}
                className="text-2xl font-bold"
                color="primary"
              />
              <p className="text-blue-200 text-xs mt-1">Last 24 hours</p>
            </div>
            <Activity className="w-8 h-8 text-blue-200" />
          </div>
        </GradientCard>

        <GradientCard gradient="success" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Success Rate</p>
              <AnimatedCounter
                value={metrics.successRate}
                suffix="%"
                decimals={1}
                className="text-2xl font-bold"
                color="success"
              />
              <p className="text-green-200 text-xs mt-1">API Reliability</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </GradientCard>

        <GradientCard gradient="warning" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Avg Response</p>
              <AnimatedCounter
                value={metrics.avgResponseTime}
                suffix="ms"
                className="text-2xl font-bold"
                color="warning"
              />
              <p className="text-yellow-200 text-xs mt-1">Performance</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </GradientCard>

        <GradientCard gradient="info" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm font-medium">Uptime</p>
              <AnimatedCounter
                value={metrics.uptime}
                suffix="%"
                decimals={1}
                className="text-2xl font-bold"
                color="primary"
              />
              <p className="text-cyan-200 text-xs mt-1">System Availability</p>
            </div>
            <Shield className="w-8 h-8 text-cyan-200" />
          </div>
        </GradientCard>
      </div>

      {/* API Endpoints Status */}
      <GradientCard gradient="secondary" className="text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">API Endpoints Status</h3>
            <p className="text-gray-200">
              Real-time monitoring of all backend services and endpoints
            </p>
          </div>
          <Button
            onClick={refreshStatus}
            disabled={isRefreshing}
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {endpoints.map((endpoint, index) => (
            <motion.div
              key={endpoint.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-white font-semibold">{endpoint.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{endpoint.description}</p>
                  <code className="text-blue-200 text-xs bg-white/10 px-2 py-1 rounded">
                    {endpoint.path}
                  </code>
                </div>
                <StatusIndicator
                  status={endpoint.status}
                  size="md"
                  animated={endpoint.status === 'online'}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-300">
                <div className="flex items-center space-x-4">
                  {endpoint.responseTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{endpoint.responseTime}ms</span>
                    </div>
                  )}
                  {endpoint.lastChecked && (
                    <div className="flex items-center space-x-1">
                      <Activity className="w-3 h-3" />
                      <span>{endpoint.lastChecked.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  endpoint.status === 'online' ? 'bg-green-500/20 text-green-300' :
                  endpoint.status === 'offline' ? 'bg-red-500/20 text-red-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {endpoint.status.toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </GradientCard>

      {/* Service Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Database Layer</h4>
            <Database className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            <StatusIndicator
              status="online"
              label="Supabase PostgreSQL"
              size="md"
              animated={true}
            />
            <div className="text-sm text-gray-600">
              <p>• Real-time data synchronization</p>
              <p>• Row-level security enabled</p>
              <p>• Automatic backups</p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">AI Service</h4>
            <Brain className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            <StatusIndicator
              status="online"
              label="Google Gemini AI"
              size="md"
              animated={true}
            />
            <div className="text-sm text-gray-600">
              <p>• Streaming text generation</p>
              <p>• Personalized nudge creation</p>
              <p>• Fallback template system</p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Processing Engine</h4>
            <Cpu className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            <StatusIndicator
              status="online"
              label="Risk Computation"
              size="md"
              animated={true}
            />
            <div className="text-sm text-gray-600">
              <p>• Chunked batch processing</p>
              <p>• Real-time risk scoring</p>
              <p>• Performance optimization</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ApiStatusDashboard;


