'use client';

import React from 'react';
import { clsx } from 'clsx';
import { MessageSquare, Clock, Bot, User, Copy, ExternalLink } from 'lucide-react';
import { Card, Badge, Button, SkeletonList } from '@/components/ui';
import { useNudges } from '@/hooks';
import { formatDateTime } from '@/lib/utils';
import type { Nudge } from '@/lib/types';

export interface NudgeHistoryProps {
  learnerId: number;
  className?: string;
  maxItems?: number;
  showActions?: boolean;
}

const NudgeHistory: React.FC<NudgeHistoryProps> = ({
  learnerId,
  className,
  maxItems,
  showActions = true,
}) => {
  const { data: nudges, isLoading, error } = useNudges(learnerId);

  const handleCopyNudge = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy nudge text:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className={className} padding="md">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Nudge History</h3>
        </div>
        <SkeletonList items={3} showAvatar={false} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className} padding="md">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Nudge History</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 text-sm">Failed to load nudge history</p>
        </div>
      </Card>
    );
  }

  const displayNudges = maxItems ? nudges?.slice(0, maxItems) : nudges;

  return (
    <Card className={className} padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Nudge History</h3>
          {nudges && nudges.length > 0 && (
            <Badge variant="default" size="sm">
              {nudges.length}
            </Badge>
          )}
        </div>
        
        {maxItems && nudges && nudges.length > maxItems && (
          <Button variant="ghost" size="sm">
            <ExternalLink className="w-4 h-4 mr-1" />
            View All
          </Button>
        )}
      </div>

      {!displayNudges || displayNudges.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No nudges sent yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Generate a personalized nudge to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayNudges.map((nudge) => (
            <NudgeItem
              key={nudge.id}
              nudge={nudge}
              showActions={showActions}
              onCopy={handleCopyNudge}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

interface NudgeItemProps {
  nudge: Nudge;
  showActions: boolean;
  onCopy: (text: string) => void;
}

const NudgeItem: React.FC<NudgeItemProps> = ({ nudge, showActions, onCopy }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await onCopy(nudge.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSourceIcon = (source: Nudge['source']) => {
    switch (source) {
      case 'gemini':
        return <Bot className="w-4 h-4 text-blue-500" />;
      case 'template':
        return <User className="w-4 h-4 text-gray-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: Nudge['status']) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="success" size="sm">
            Sent
          </Badge>
        );
      case 'fallback':
        return (
          <Badge variant="warning" size="sm">
            Fallback
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="sm">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getSourceIcon(nudge.source)}
          <span className="text-sm font-medium text-gray-700">
            {nudge.source === 'gemini' ? 'AI Generated' : 'Template'}
          </span>
          {getStatusBadge(nudge.status)}
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{formatDateTime(nudge.createdAt)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
          {nudge.text}
        </p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-gray-500 hover:text-gray-700"
          >
            <Copy className="w-3 h-3 mr-1" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NudgeHistory;