'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import React, { useState } from 'react';
import { Settings, Play, RefreshCw, AlertTriangle, CheckCircle, Clock, Users, Database, Cpu, Brain, Zap, Activity, BarChart3 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { 
  Button, 
  Card, 
  Badge, 
  GradientCard, 
  AnimatedCounter, 
  PulseGlow, 
  DataVisualization, 
  StatusIndicator 
} from '@/components/ui';
import SimulationModal from '@/components/admin/SimulationModal';
import SimulationHistory from '@/components/admin/SimulationHistory';
import SystemHealthDashboard from '@/components/dashboard/SystemHealthDashboard';
import NudgeManagementDashboard from '@/components/dashboard/NudgeManagementDashboard';
import ApiStatusDashboard from '@/components/dashboard/ApiStatusDashboard';
import BackendFeaturesShowcase from '@/components/dashboard/BackendFeaturesShowcase';
import { useSimulationManager, useAllLearners } from '@/hooks';
import { formatDateTime } from '@/lib/utils';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'system' | 'nudges' | 'simulation' | 'api' | 'features'>('overview');
  
  const {
    status,
    canRunSimulation,
    runSimulation,
    isRunning,
    isLoading,
    error,
    lastResult,
  } = useSimulationManager();

  const { learners } = useAllLearners();

  const handleRunSimulation = async () => {
    try {
      await runSimulation();
    } catch (error) {
      console.error('Failed to run simulation:', error);
    }
  };

  const getStatusBadge = () => {
    if (isRunning) {
      return (
        <Badge variant="info" className="bg-primary/10 text-primary">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          Running
        </Badge>
      );
    }
    
    if (lastResult) {
      return (
        <Badge variant="success" className="bg-green-500/10 text-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    
    return (
      <Badge variant="default" className="bg-muted text-muted-foreground">
        <Clock className="w-3 h-3 mr-1" />
        Ready
      </Badge>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'system', label: 'System Health', icon: Database },
    { id: 'nudges', label: 'AI Nudges', icon: Brain },
    { id: 'simulation', label: 'Simulation', icon: Activity },
    { id: 'api', label: 'API Status', icon: Cpu },
    { id: 'features', label: 'Backend Features', icon: Settings },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GradientCard gradient="primary" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">System Status</p>
              <AnimatedCounter
                value={100}
                suffix="%"
                className="text-2xl font-bold"
                color="primary"
              />
              <p className="text-blue-200 text-xs mt-1">All Systems Operational</p>
            </div>
            <StatusIndicator status="online" size="lg" animated={true} />
          </div>
        </GradientCard>

        <GradientCard gradient="success" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Learners</p>
              <AnimatedCounter
                value={learners.length}
                className="text-2xl font-bold"
                color="success"
              />
              <p className="text-green-200 text-xs mt-1">Active Users</p>
            </div>
            <Users className="w-8 h-8 text-green-200" />
          </div>
        </GradientCard>

        <GradientCard gradient="warning" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">AI Service</p>
              <StatusIndicator status="online" label="Active" size="lg" animated={true} />
              <p className="text-yellow-200 text-xs mt-1">Gemini AI Ready</p>
            </div>
            <Brain className="w-8 h-8 text-yellow-200" />
          </div>
        </GradientCard>

        <GradientCard gradient="info" className="text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm font-medium">Database</p>
              <StatusIndicator status="online" label="Connected" size="lg" animated={true} />
              <p className="text-cyan-200 text-xs mt-1">Supabase Active</p>
            </div>
            <Database className="w-8 h-8 text-cyan-200" />
          </div>
        </GradientCard>
      </div>

      {/* Risk Distribution Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GradientCard gradient="secondary" className="text-white">
          <h3 className="text-lg font-bold text-white mb-4">Risk Distribution</h3>
          <DataVisualization
            data={[
              { label: 'High Risk', value: learners.filter(l => l.riskLabel === 'high').length, color: '#EF4444' },
              { label: 'Medium Risk', value: learners.filter(l => l.riskLabel === 'medium').length, color: '#F59E0B' },
              { label: 'Low Risk', value: learners.filter(l => l.riskLabel === 'low').length, color: '#10B981' },
            ]}
            type="pie"
            animated={true}
            height={200}
            showLabels={true}
            showValues={true}
          />
        </GradientCard>

        <GradientCard gradient="secondary" className="text-white">
          <h3 className="text-lg font-bold text-white mb-4">Performance Metrics</h3>
          <DataVisualization
            data={[
              { label: 'Completion', value: learners.length > 0 ? Math.round(learners.reduce((sum, l) => sum + l.completionPct, 0) / learners.length) : 0, color: '#3B82F6' },
              { label: 'Quiz Avg', value: learners.length > 0 ? Math.round(learners.reduce((sum, l) => sum + l.quizAvg, 0) / learners.length) : 0, color: '#10B981' },
              { label: 'Engagement', value: learners.length > 0 ? Math.round(learners.filter(l => l.missedSessions < 2).length / learners.length * 100) : 0, color: '#8B5CF6' },
            ]}
            type="bar"
            animated={true}
            height={200}
            showLabels={true}
            showValues={true}
            showPercentages={true}
          />
        </GradientCard>
      </div>

      {/* Quick Actions */}
      <GradientCard gradient="primary" className="text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Quick Actions</h3>
            <p className="text-blue-100">
              Manage your system with powerful admin tools
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button
            onClick={() => setActiveTab('system')}
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 justify-start"
          >
            <Database className="w-4 h-4 mr-2" />
            System Health
          </Button>

          <Button
            onClick={() => setActiveTab('nudges')}
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 justify-start"
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Nudges
          </Button>

          <Button
            onClick={() => setActiveTab('simulation')}
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 justify-start"
          >
            <Activity className="w-4 h-4 mr-2" />
            Run Simulation
          </Button>
        </div>
      </GradientCard>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'system':
        return <SystemHealthDashboard />;
      case 'nudges':
        return <NudgeManagementDashboard />;
      case 'simulation':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card padding="lg">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Risk Simulation</h2>
                    {getStatusBadge()}
                  </div>

                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Run a comprehensive risk assessment simulation to update all learner risk scores 
                      based on their current progress, quiz performance, and engagement metrics.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Current Status</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Simulation State:</span>
                          <span className="font-medium">
                            {isRunning ? 'Running' : 'Idle'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Learners:</span>
                          <span className="font-medium">{learners.length}</span>
                        </div>
                        {lastResult && (
                          <>
                            <div className="flex justify-between">
                              <span>Last Run:</span>
                              <span className="font-medium">
                                {formatDateTime(new Date().toISOString())}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Processed:</span>
                              <span className="font-medium">{lastResult.processed}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Updated:</span>
                              <span className="font-medium">{lastResult.updated}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {error && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          <h3 className="text-sm font-medium text-destructive">Simulation Error</h3>
                        </div>
                        <p className="text-sm text-destructive/80 mt-1">
                          {error instanceof Error ? error.message : 'An unknown error occurred'}
                        </p>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button
                        onClick={handleRunSimulation}
                        disabled={!canRunSimulation || isLoading}
                        loading={isLoading}
                        className="w-full"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isRunning ? 'Simulation Running...' : 'Run Risk Simulation'}
                      </Button>
                      
                      {!canRunSimulation && !isRunning && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Please wait before running another simulation
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <Card padding="lg">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">System Information</h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Current Risk Distribution</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span className="text-sm text-gray-600">High Risk</span>
                          </div>
                          <AnimatedCounter
                            value={learners.filter(l => l.riskLabel === 'high').length}
                            className="text-sm font-medium"
                            color="danger"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                            <span className="text-sm text-gray-600">Medium Risk</span>
                          </div>
                          <AnimatedCounter
                            value={learners.filter(l => l.riskLabel === 'medium').length}
                            className="text-sm font-medium"
                            color="warning"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span className="text-sm text-gray-600">Low Risk</span>
                          </div>
                          <AnimatedCounter
                            value={learners.filter(l => l.riskLabel === 'low').length}
                            className="text-sm font-medium"
                            color="success"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">System Metrics</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <AnimatedCounter
                            value={learners.length > 0 
                              ? Math.round(learners.reduce((sum, l) => sum + l.completionPct, 0) / learners.length)
                              : 0
                            }
                            suffix="%"
                            className="text-lg font-semibold text-blue-600"
                            color="primary"
                          />
                          <div className="text-xs text-gray-600">Avg Completion</div>
                        </div>
                        
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <AnimatedCounter
                            value={learners.length > 0 
                              ? Math.round(learners.reduce((sum, l) => sum + l.quizAvg, 0) / learners.length)
                              : 0
                            }
                            suffix="%"
                            className="text-lg font-semibold text-green-600"
                            color="success"
                          />
                          <div className="text-xs text-gray-600">Avg Quiz Score</div>
                        </div>
                      </div>
                    </div>

                    {lastResult && (
                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Last Simulation</h3>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="text-sm text-green-800">
                            <p className="font-medium">Simulation completed successfully</p>
                            <p className="text-xs mt-1">
                              Processed {lastResult.processed} learners, updated {lastResult.updated} risk scores
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <SimulationHistory />
          </div>
        );
      case 'api':
        return <ApiStatusDashboard />;
      case 'features':
        return <BackendFeaturesShowcase />;
      default:
        return renderOverview();
    }
  };

  return (
    <DashboardLayout
      title="Admin Panel"
      description="Comprehensive system management and monitoring"
    >
      <div className="space-y-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;