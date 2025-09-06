'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import React, { useState } from 'react';
import { Settings, Play, RefreshCw, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, Badge } from '@/components/ui';
import SimulationModal from '@/components/admin/SimulationModal';
import SimulationHistory from '@/components/admin/SimulationHistory';
import { useSimulationManager, useAllLearners } from '@/hooks';
import { formatDateTime } from '@/lib/utils';

const AdminPage: React.FC = () => {
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  
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

  const handleRunSimulation = () => {
    if (canRunSimulation) {
      setShowSimulationModal(true);
    }
  };

  const handleConfirmSimulation = async () => {
    try {
      await runSimulation();
      setShowSimulationModal(false);
    } catch (error) {
      console.error('Failed to run simulation:', error);
    }
  };

  const getStatusBadge = () => {
    if (isRunning) {
      return (
        <Badge variant="info" className="bg-blue-100 text-blue-800">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          Running
        </Badge>
      );
    }
    
    if (lastResult) {
      return (
        <Badge variant="success" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    
    return (
      <Badge variant="default" className="bg-gray-100 text-gray-800">
        <Clock className="w-3 h-3 mr-1" />
        Ready
      </Badge>
    );
  };

  return (
    <DashboardLayout
      title="Admin Panel"
      description="Manage system settings and run risk simulations"
    >
      <div className="space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="md" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">System Status</p>
                <p className="text-2xl font-bold">Active</p>
              </div>
              <Settings className="w-8 h-8 text-purple-200" />
            </div>
          </Card>

          <Card padding="md" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Learners</p>
                <p className="text-2xl font-bold">{learners.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </Card>

          <Card padding="md" className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Simulation Status</p>
                <p className="text-xl font-bold">{isRunning ? 'Running' : 'Ready'}</p>
              </div>
              <Play className="w-8 h-8 text-green-200" />
            </div>
          </Card>
        </div>

        {/* Risk Simulation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Simulation Control */}
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

                {/* Current Status */}
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

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <h3 className="text-sm font-medium text-red-800">Simulation Error</h3>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      {error instanceof Error ? error.message : 'An unknown error occurred'}
                    </p>
                  </div>
                )}

                {/* Action Button */}
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
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Please wait before running another simulation
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* System Information */}
          <Card padding="lg">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">System Information</h2>

              <div className="space-y-4">
                {/* Risk Distribution */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Current Risk Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-sm text-gray-600">High Risk</span>
                      </div>
                      <span className="text-sm font-medium">
                        {learners.filter(l => l.riskLabel === 'high').length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <span className="text-sm text-gray-600">Medium Risk</span>
                      </div>
                      <span className="text-sm font-medium">
                        {learners.filter(l => l.riskLabel === 'medium').length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-sm text-gray-600">Low Risk</span>
                      </div>
                      <span className="text-sm font-medium">
                        {learners.filter(l => l.riskLabel === 'low').length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Metrics */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">System Metrics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">
                        {learners.length > 0 
                          ? (learners.reduce((sum, l) => sum + l.completionPct, 0) / learners.length).toFixed(1)
                          : '0'
                        }%
                      </div>
                      <div className="text-xs text-gray-600">Avg Completion</div>
                    </div>
                    
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">
                        {learners.length > 0 
                          ? (learners.reduce((sum, l) => sum + l.quizAvg, 0) / learners.length).toFixed(1)
                          : '0'
                        }%
                      </div>
                      <div className="text-xs text-gray-600">Avg Quiz Score</div>
                    </div>
                  </div>
                </div>

                {/* Last Simulation Result */}
                {lastResult && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Last Simulation</h3>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-sm text-green-800">
                        <p className="font-medium">{lastResult.message}</p>
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

        {/* Simulation History */}
        <SimulationHistory />
      </div>

      {/* Simulation Confirmation Modal */}
      <SimulationModal
        open={showSimulationModal}
        onOpenChange={setShowSimulationModal}
        onConfirm={handleConfirmSimulation}
        learnerCount={learners.length}
        isRunning={isLoading}
      />
    </DashboardLayout>
  );
};

export default AdminPage;