'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Brain,
  Database,
  Cpu,
  Wifi,
  Shield,
  Clock,
  BarChart3
} from 'lucide-react';
import { 
  GradientCard, 
  AnimatedCounter, 
  PulseGlow, 
  DataVisualization, 
  StatusIndicator,
  Card,
  Button
} from '@/components/ui';

interface SystemHealthData {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version?: string;
  api?: 'connected' | 'disconnected';
  database?: 'connected' | 'disconnected';
  services?: {
    [key: string]: 'healthy' | 'unhealthy';
  };
}

interface SimulationData {
  processed: number;
  updated: number;
  chunks: number;
  duration: number;
  summary: {
    riskDistribution: Record<string, number>;
    avgRiskScore: number;
  };
}

const SystemHealthDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchSystemHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setHealthData(data);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch system health:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const runSimulation = async () => {
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: 100,
          chunkSize: 20,
        }),
      });
      const data = await response.json();
      setSimulationData(data);
    } catch (error) {
      console.error('Failed to run simulation:', error);
    }
  };

  const getSystemStatus = () => {
    if (!healthData) return 'loading';
    return healthData.status === 'healthy' ? 'online' : 'error';
  };

  const getServiceStatus = (service: string) => {
    if (!healthData?.services) return 'offline';
    return healthData.services[service] === 'healthy' ? 'online' : 'error';
  };

  const riskDistributionData = simulationData?.summary.riskDistribution 
    ? Object.entries(simulationData.summary.riskDistribution).map(([label, count]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value: count,
        color: label === 'high' ? '#EF4444' : label === 'medium' ? '#F59E0B' : '#10B981',
      }))
    : [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} padding="lg">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GradientCard
          gradient="success"
          glow={healthData?.status === 'healthy'}
          className="text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">System Status</p>
              <AnimatedCounter
                value={healthData?.status === 'healthy' ? 100 : 0}
                suffix="%"
                className="text-2xl font-bold"
                color="success"
              />
              <p className="text-green-200 text-xs mt-1">
                {healthData?.status === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
              </p>
            </div>
            <StatusIndicator
              status={getSystemStatus()}
              size="lg"
              animated={true}
            />
          </div>
        </GradientCard>

        <GradientCard
          gradient="info"
          className="text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">API Version</p>
              <AnimatedCounter
                value={parseFloat(healthData?.version || '0')}
                decimals={1}
                className="text-2xl font-bold"
                color="primary"
              />
              <p className="text-blue-200 text-xs mt-1">
                Last Updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            <Database className="w-8 h-8 text-blue-200" />
          </div>
        </GradientCard>

        <GradientCard
          gradient="warning"
          className="text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Database</p>
              <StatusIndicator
                status={healthData?.database === 'connected' ? 'online' : 'error'}
                label={healthData?.database === 'connected' ? 'Connected' : 'Disconnected'}
                size="lg"
                animated={true}
              />
              <p className="text-yellow-200 text-xs mt-1">
                Supabase Integration
              </p>
            </div>
            <Cpu className="w-8 h-8 text-yellow-200" />
          </div>
        </GradientCard>

        <GradientCard
          gradient="danger"
          className="text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">AI Services</p>
              <StatusIndicator
                status={getServiceStatus('gemini')}
                label={getServiceStatus('gemini') === 'online' ? 'Active' : 'Offline'}
                size="lg"
                animated={true}
              />
              <p className="text-red-200 text-xs mt-1">
                Gemini AI Integration
              </p>
            </div>
            <Brain className="w-8 h-8 text-red-200" />
          </div>
        </GradientCard>
      </div>

      {/* Simulation Controls */}
      <GradientCard
        gradient="primary"
        className="text-white"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">AI Risk Simulation</h3>
            <p className="text-blue-100">
              Run batch risk recomputation across all learners
            </p>
          </div>
          <Button
            onClick={runSimulation}
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Zap className="w-4 h-4 mr-2" />
            Run Simulation
          </Button>
        </div>

        {simulationData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm">Processed</span>
                <Users className="w-4 h-4 text-blue-200" />
              </div>
              <AnimatedCounter
                value={simulationData.processed}
                className="text-2xl font-bold text-white"
                color="primary"
              />
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm">Updated</span>
                <TrendingUp className="w-4 h-4 text-blue-200" />
              </div>
              <AnimatedCounter
                value={simulationData.updated}
                className="text-2xl font-bold text-white"
                color="primary"
              />
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 text-sm">Duration</span>
                <Clock className="w-4 h-4 text-blue-200" />
              </div>
              <AnimatedCounter
                value={simulationData.duration}
                suffix="ms"
                className="text-2xl font-bold text-white"
                color="primary"
              />
            </div>
          </div>
        )}
      </GradientCard>

      {/* Risk Distribution Visualization */}
      {riskDistributionData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GradientCard gradient="secondary" className="text-white">
            <h3 className="text-lg font-bold text-white mb-4">Risk Distribution</h3>
            <DataVisualization
              data={riskDistributionData}
              type="pie"
              animated={true}
              height={200}
              showLabels={true}
              showValues={true}
            />
          </GradientCard>

          <GradientCard gradient="secondary" className="text-white">
            <h3 className="text-lg font-bold text-white mb-4">Risk Breakdown</h3>
            <DataVisualization
              data={riskDistributionData}
              type="bar"
              animated={true}
              height={200}
              showLabels={true}
              showValues={true}
              showPercentages={true}
            />
          </GradientCard>
        </div>
      )}

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">API Connectivity</h4>
            <Wifi className="w-5 h-5 text-gray-500" />
          </div>
          <StatusIndicator
            status={healthData?.api === 'connected' ? 'online' : 'error'}
            label={healthData?.api === 'connected' ? 'Connected' : 'Disconnected'}
            size="md"
            animated={true}
          />
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Database Status</h4>
            <Database className="w-5 h-5 text-gray-500" />
          </div>
          <StatusIndicator
            status={healthData?.database === 'connected' ? 'online' : 'error'}
            label={healthData?.database === 'connected' ? 'Connected' : 'Disconnected'}
            size="md"
            animated={true}
          />
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">Security</h4>
            <Shield className="w-5 h-5 text-gray-500" />
          </div>
          <StatusIndicator
            status="online"
            label="Secured"
            size="md"
            animated={true}
          />
        </Card>
      </div>
    </div>
  );
};

export default SystemHealthDashboard;


