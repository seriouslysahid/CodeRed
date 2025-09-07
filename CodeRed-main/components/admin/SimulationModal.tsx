'use client';

import React from 'react';
import { AlertTriangle, Play, Users, Clock, Zap, X } from 'lucide-react';
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
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Confirm Risk Simulation
          </h2>
          <p className="text-muted-foreground mt-2">
            This will recalculate risk scores for all learners in the system
          </p>
        </div>

        {/* Simulation Details */}
        <Card padding="md" className="bg-accent/50 border-border">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Simulation Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{learnerCount}</p>
                  <p className="text-xs text-muted-foreground">Learners to Process</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">~{estimatedTime}s</p>
                  <p className="text-xs text-muted-foreground">Estimated Time</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Real-time</p>
                  <p className="text-xs text-muted-foreground">Processing Mode</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Warning Information */}
        <div className="bg-accent/30 border border-border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">
                Important Information
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
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
          <h3 className="text-sm font-medium text-foreground">Simulation Process</h3>
          <div className="space-y-2">
            {[
              'Analyze current learner progress and engagement',
              'Calculate new risk scores using updated algorithms',
              'Update risk labels based on score thresholds',
              'Refresh dashboard data and visualizations',
            ].map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {index + 1}
                </div>
                <span className="text-sm text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {isRunning ? (
              <span className="text-primary font-medium">
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
          <div className="pt-4 border-t border-border">
            <div className="flex items-center space-x-3">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Processing learners...</span>
                  <span>Please wait</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-primary h-2 rounded-full animate-pulse transition-all duration-300" style={{ width: '100%' }} />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Close simulation"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SimulationModal;