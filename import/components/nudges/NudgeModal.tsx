'use client';

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { X, Send, StopCircle, RefreshCw, AlertTriangle, CheckCircle, Copy } from 'lucide-react';
import { Modal, Button, Badge, Spinner } from '@/components/ui';
import { useNudgeGeneration } from '@/hooks';
import { formatDateTime } from '@/lib/utils';
import type { Learner } from '@/lib/types';

export interface NudgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  learner: Learner | null;
}

const NudgeModal: React.FC<NudgeModalProps> = ({
  open,
  onOpenChange,
  learner,
}) => {
  const {
    streamState,
    generateStreamingNudge,
    cancelStream,
    resetStream,
    isStreaming,
    isCompleted,
    isError,
    isCancelled,
    canGenerateNudge,
    getCooldownRemaining,
  } = useNudgeGeneration();

  const [copied, setCopied] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Update cooldown timer
  useEffect(() => {
    if (!learner) return;

    const updateCooldown = () => {
      const remaining = getCooldownRemaining(learner.id);
      setCooldownSeconds(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);

    return () => clearInterval(interval);
  }, [learner, getCooldownRemaining]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      resetStream();
      setCopied(false);
    }
  }, [open, resetStream]);

  const handleGenerateNudge = async () => {
    if (!learner || !canGenerateNudge(learner.id)) return;

    try {
      await generateStreamingNudge(learner.id);
    } catch (error) {
      console.error('Failed to generate nudge:', error);
    }
  };

  const handleCancelStream = () => {
    cancelStream();
  };

  const handleCopyText = async () => {
    if (!streamState.text) return;

    try {
      await navigator.clipboard.writeText(streamState.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleClose = () => {
    if (isStreaming) {
      cancelStream();
    }
    onOpenChange(false);
  };

  if (!learner) return null;

  const canGenerate = canGenerateNudge(learner.id);
  const hasText = streamState.text.length > 0;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      closeOnOverlayClick={!isStreaming}
      showCloseButton={!isStreaming}
      mobileFullScreen={true}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Generate AI Nudge
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Create a personalized message for {learner.name}
            </p>
          </div>
          
          {isStreaming && (
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

        {/* Learner info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">{learner.name}</h3>
            <Badge
              variant={
                learner.riskLabel === 'high' ? 'danger' :
                learner.riskLabel === 'medium' ? 'warning' : 'success'
              }
              size="sm"
            >
              {learner.riskLabel.toUpperCase()} RISK
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Completion:</span>
              <span className="ml-2 font-medium">{learner.completionPct.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-600">Quiz Average:</span>
              <span className="ml-2 font-medium">{learner.quizAvg.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-600">Missed Sessions:</span>
              <span className="ml-2 font-medium">{learner.missedSessions}</span>
            </div>
            <div>
              <span className="text-gray-600">Risk Score:</span>
              <span className="ml-2 font-medium">{learner.riskScore.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Streaming content area */}
        <div className="min-h-[200px] max-h-[400px] overflow-y-auto">
          {!hasText && !isStreaming && !isError && (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <div className="text-center">
                <Send className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Click "Generate Nudge" to create a personalized message</p>
              </div>
            </div>
          )}

          {isStreaming && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <Spinner size="sm" color="primary" />
                <span className="text-sm font-medium">Generating personalized nudge...</span>
              </div>
              
              {streamState.text && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {streamState.text}
                      <span className="inline-block w-2 h-5 bg-blue-600 animate-pulse ml-1" />
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {isCompleted && streamState.text && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Nudge generated successfully
                  {streamState.isFallback && (
                    <span className="text-yellow-600 ml-2">(Fallback used)</span>
                  )}
                </span>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {streamState.text}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isError && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {streamState.isFallback ? 'Using fallback message' : 'Error generating nudge'}
                </span>
              </div>
              
              {streamState.text ? (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {streamState.text}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-red-800 text-sm">
                    {streamState.error || 'Failed to generate nudge. Please try again.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {isCancelled && (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <div className="text-center">
                <StopCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Nudge generation was cancelled</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {!canGenerate && cooldownSeconds > 0 && (
              <div className="flex items-center space-x-2 text-yellow-600">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">
                  Wait {cooldownSeconds}s before generating another nudge
                </span>
              </div>
            )}
            
            {hasText && (isCompleted || isError) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyText}
                className="text-gray-600"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? 'Copied!' : 'Copy Text'}
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isStreaming ? (
              <Button
                variant="secondary"
                onClick={handleCancelStream}
                className="text-red-600 hover:text-red-700"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={handleClose}
                >
                  Close
                </Button>
                
                <Button
                  onClick={handleGenerateNudge}
                  disabled={!canGenerate}
                  loading={isStreaming}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {hasText ? 'Generate New Nudge' : 'Generate Nudge'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Timestamp */}
        {(isCompleted || isError) && (
          <div className="text-xs text-gray-500 text-center">
            Generated at {formatDateTime(new Date().toISOString())}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NudgeModal;