'use client';

import React from 'react';
import { AlertTriangle, Play, Users, Clock, Zap } from 'lucide-react';
import { Modal, Button, Card } from '@/components/ui';

export interface SimulationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  learnerCount: number;
  isRunning?: boolean;
}

const SimulationModal: React.FC<SimulationModalProps> = ({
  open,
  onOpenChange,
  onConfirm,
  learnerCount,
  isRunning = false,
}) => {
  const estimatedTime = Math.ceil(learnerCount / 100); // Rough estimate: 100 learners per second

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      closeOnOverlayClick={!isRunning}
      showCloseButton={!isRunning}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Confirm Risk Simulation
          </h2>
          <p className="text-gray-600 mt-2">
            This will recalculate risk scores for all learners in the system
          </p>
        </div>

        {/* Simulation Details */}
        <Card padding="md" className="bg-blue-50 border-blue-200">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-blue-900">Simulation Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">{learnerCount}</p>
                  <p className="text-xs text-blue-700">Learners to Process</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">~{estimatedTime}s</p>
                  <p className="text-xs text-blue-700">Estimated Time</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Real-time</p>
                  <p className="text-xs text-blue-700">Processing Mode</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Warning Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Information
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Risk scores will be recalculated based on current learner data</li>
                <li>• This process may take several seconds to complete</li>
                <li>• Learner risk labels may change after the simulation</li>
                <li>• The dashboard will update automatically when complete</li>
                <li>• Only one simulation can run at a time</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Simulation Process</h3>
          <div className="space-y-2">
            {[
              'Analyze current learner progress and engagement',
              'Calculate new risk scores using updated algorithms',
              'Update risk labels based on score thresholds',
              'Refresh dashboard data and visualizations',
            ].map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-700">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {isRunning ? (
              <span className="text-blue-600 font-medium">
                Simulation is running... Please wait.
              </span>
            ) : (
              <span>
                This action cannot be undone. Risk scores will be updated immediately.
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {!isRunning && (
              <Button
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            )}
            
            <Button
              onClick={onConfirm}
              disabled={isRunning}
              loading={isRunning}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? 'Running Simulation...' : 'Start Simulation'}
            </Button>
          </div>
        </div>

        {/* Progress indicator when running */}
        {isRunning && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Processing learners...</span>
                  <span>Please wait</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SimulationModal;