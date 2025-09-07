'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Users, Search, AlertCircle } from 'lucide-react';
import { Button, SkeletonCard } from '@/components/ui';
import LearnerCard from './LearnerCard';
import type { Learner } from '@/lib/types';

export interface CardGridProps {
  learners: Learner[];
  selectedLearners?: Set<number>;
  onSelectionChange?: (learnerId: number, selected: boolean) => void;
  onLearnerClick?: (learner: Learner) => void;
  showSelection?: boolean;
  loading?: boolean;
  error?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  className?: string;
}

const CardGrid: React.FC<CardGridProps> = ({
  learners,
  selectedLearners = new Set(),
  onSelectionChange,
  onLearnerClick,
  showSelection = false,
  loading = false,
  error,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  emptyMessage = 'No learners found',
  emptyDescription = 'Try adjusting your search or filter criteria.',
  className,
}) => {
  // Loading state
  if (loading && learners.length === 0) {
    return (
      <div className={clsx('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6', className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={clsx('text-center py-12', className)}>
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error Loading Learners
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (learners.length === 0) {
    return (
      <div className={clsx('text-center py-12', className)}>
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Grid of learner cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {learners.map((learner) => (
          <LearnerCard
            key={learner.id}
            learner={learner}
            selected={selectedLearners.has(learner.id)}
            onSelectionChange={(selected) => 
              onSelectionChange?.(learner.id, selected)
            }
            onClick={() => onLearnerClick?.(learner)}
            showSelection={showSelection}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={onLoadMore}
            loading={loadingMore}
            disabled={loadingMore}
            variant="secondary"
          >
            {loadingMore ? 'Loading...' : 'Load More Learners'}
          </Button>
        </div>
      )}

      {/* Loading more skeleton cards */}
      {loadingMore && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={`loading-${index}`} />
          ))}
        </div>
      )}

      {/* Results summary */}
      {learners.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-600">
          Showing {learners.length} learner{learners.length !== 1 ? 's' : ''}
          {showSelection && selectedLearners.size > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              ({selectedLearners.size} selected)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CardGrid;