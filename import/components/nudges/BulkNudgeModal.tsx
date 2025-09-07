'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Send, Users, AlertTriangle, CheckCircle, X, StopCircle } from 'lucide-react';
import { Modal, Button, Badge, Spinner, Card } from '@/components/ui';
import { useNudgeGeneration } from '@/hooks';
import type { Learner } from '@/lib/types';

export interface BulkNudgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLearners: Learner[];
}

interface NudgeProgress {
  learnerId: number;
  learnerName: string;
  status: 'pending' | 'generating' | 'completed' | 'error' | 'cancelled';
  text?: string;
  error?: string;
}

const BulkNudgeModal: React.FC<BulkNudgeModalProps> = ({
  open,
  onOpenChange,
  selectedLearners,
}) => {
  const [progress, setProgress] = useState<NudgeProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCancelled, setCancelled] = useState(false);
  
  const { generateStreamingNudge, canGenerateNudge } = useNudgeGeneration();

  // Initialize progress when modal opens
  useEffect(() => {
    if (open && selectedLearners.length > 0) {
      const initialProgress = selectedLearners.map(learner => ({
        learnerId: learner.id,
        learnerName: learner.name,
        status: 'pending' as const,
      }));
      setProgress(initialProgress);
      setCurrentIndex(0);
      setIsGenerating(false);
      setCancelled(false);
    }
  }, [open, selectedLearners]);

  const updateProgress = (learnerId: number, update: Partial<NudgeProgress>) => {
    setProgress(prev => prev.map(item => 
      item.learnerId === learnerId ? { ...item, ...update } : item
    ));
  };

  const generateNudgesSequentially = async () => {
    if (isGenerating || isCancelled) return;
    
    setIsGenerating(true);
    
    for (let i = 0; i < selectedLearners.length; i++) {
      if (isCancelled) break;
      
      const learner = selectedLearners[i];
      setCurrentIndex(i);
      
      // Check if we can generate nudge for this learner
      if (!canGenerateNudge(learner.id)) {
        updateProgress(learner.id, {
          status: 'error',
          error: 'Rate limit exceeded. Please wait before generating more nudges.',
        });
        continue;
      }

      updateProgress(learner.id, { status: 'generating' });

      try {
        // Note: In a real implementation, you'd want to modify the hook to return the generated text
        await generateStreamingNudge(learner.id);
        
        updateProgress(learner.id, {
          status: 'completed',
          text: 'Nudge generated successfully', // This would be the actual generated text
        });
        
        // Add delay between generations to respect rate limits
        if (i < selectedLearners.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        updateProgress(learner.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to generate nudge',
        });
      }
    }
    
    setIsGenerating(false);
  };

  const handleCancel = () => {
    setCancelled(true);
    setIsGenerating(false);
    
    // Mark pending items as cancelled
    setProgress(prev => prev.map(item => 
      item.status === 'pending' || item.status === 'generating' 
        ? { ...item, status: 'cancelled' }
        : item
    ));
  };

  const handleClose = () => {
    if (isGenerating) {
      handleCancel();
    }
    onOpenChange(false);
  };

  const completedCount = progress.filter(p => p.status === 'completed').length;
  const errorCount = progress.filter(p => p.status === 'error').length;
  const cancelledCount = progress.filter(p => p.status === 'cancelled').length;
  const totalCount = selectedLearners.length;

  const canStart = !isGenerating && progress.length > 0 && !isCancelled;
  const isComplete = !isGenerating && (completedCount + errorCount + cancelledCount) === totalCount;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      closeOnOverlayClick={!isGenerating}
      showCloseButton={!isGenerating}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Bulk Nudge Generation
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Generate personalized nudges for {totalCount} selected learners
            </p>
          </div>
          
          {isGenerating && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-xs text-gray-600">Errors</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{cancelledCount}</div>
            <div className="text-xs text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Progress bar */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Processing learner {currentIndex + 1} of {totalCount}
              </span>
              <span className="text-gray-600">
                {Math.round(((completedCount + errorCount) / totalCount) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((completedCount + errorCount) / totalCount) * 100}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Progress list */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {progress.map((item) => (
            <div
              key={item.learnerId}
              className={clsx(
                'flex items-center justify-between p-3 rounded-lg border',
                item.status === 'completed' && 'bg-green-50 border-green-200',
                item.status === 'error' && 'bg-red-50 border-red-200',
                item.status === 'generating' && 'bg-blue-50 border-blue-200',
                item.status === 'cancelled' && 'bg-yellow-50 border-yellow-200',
                item.status === 'pending' && 'bg-gray-50 border-gray-200'
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {item.status === 'generating' && (
                    <Spinner size="sm" color="primary" />
                  )}
                  {item.status === 'completed' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {item.status === 'error' && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  {item.status === 'cancelled' && (
                    <StopCircle className="w-4 h-4 text-yellow-500" />
                  )}
                  {item.status === 'pending' && (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.learnerName}
                  </p>
                  {item.error && (
                    <p className="text-xs text-red-600 mt-1">{item.error}</p>
                  )}
                </div>
              </div>

              <Badge
                variant={
                  item.status === 'completed' ? 'success' :
                  item.status === 'error' ? 'danger' :
                  item.status === 'generating' ? 'info' :
                  item.status === 'cancelled' ? 'warning' : 'default'
                }
                size="sm"
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Badge>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {isGenerating && (
              <span>Generating nudges... This may take a few minutes.</span>
            )}
            {isComplete && (
              <span>
                Generation complete: {completedCount} successful, {errorCount} failed
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isGenerating ? (
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="text-red-600 hover:text-red-700"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={handleClose}>
                  {isComplete ? 'Close' : 'Cancel'}
                </Button>
                
                {canStart && (
                  <Button onClick={generateNudgesSequentially}>
                    <Send className="w-4 h-4 mr-2" />
                    Start Generation
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BulkNudgeModal;