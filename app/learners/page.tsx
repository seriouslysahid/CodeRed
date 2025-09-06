'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Users, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { FilterPanel, CardGrid } from '@/components/learners';
import { NudgeModal, BulkNudgeModal } from '@/components/nudges';
import { useAllLearners, useFilterState, useLearnerSelection } from '@/hooks';
import type { Learner } from '@/lib/types';

const LearnersPage: React.FC = () => {
  const router = useRouter();
  const [selectedNudgeLearner, setSelectedNudgeLearner] = useState<Learner | null>(null);
  const [showBulkNudgeModal, setShowBulkNudgeModal] = useState(false);
  
  const { filters, updateFilters, applyFiltersToLearners } = useFilterState();
  const { 
    learners, 
    isLoading, 
    error, 
    hasNextPage, 
    fetchNextPage, 
    isFetchingNextPage 
  } = useAllLearners(filters);
  
  const filteredLearners = applyFiltersToLearners(learners);
  
  const {
    selectedLearners,
    selectedCount,
    toggleLearnerSelection,
    toggleAllSelection,
    clearSelection,
    getSelectedLearners,
    isAllSelected,
    isPartiallySelected,
    getSelectionStats,
  } = useLearnerSelection(filteredLearners);

  const handleLearnerClick = (learner: Learner) => {
    router.push(`/learners/${learner.id}`);
  };

  const handleNudgeLearner = (learner: Learner) => {
    setSelectedNudgeLearner(learner);
  };

  const handleBulkNudge = () => {
    if (selectedCount > 0) {
      setShowBulkNudgeModal(true);
    }
  };

  const handleExportData = () => {
    // In a real app, this would trigger a CSV/Excel export
    console.log('Exporting learner data...');
  };

  const selectionStats = getSelectionStats();

  return (
    <DashboardLayout
      title="Learners"
      description="Manage and monitor all learners in your program"
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card padding="md" className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Learners</p>
                <p className="text-2xl font-bold text-blue-700">{learners.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card padding="md" className="bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">High Risk</p>
                <p className="text-2xl font-bold text-red-700">
                  {learners.filter(l => l.riskLabel === 'high').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
              </div>
            </div>
          </Card>

          <Card padding="md" className="bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {learners.filter(l => l.riskLabel === 'medium').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full" />
              </div>
            </div>
          </Card>

          <Card padding="md" className="bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Low Risk</p>
                <p className="text-2xl font-bold text-green-700">
                  {learners.filter(l => l.riskLabel === 'low').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          onFiltersChange={updateFilters}
          totalCount={learners.length}
          filteredCount={filteredLearners.length}
        />

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <Card padding="md" className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm font-medium text-blue-900">
                  {selectedCount} learner{selectedCount !== 1 ? 's' : ''} selected
                </p>
                
                {selectionStats.total > 0 && (
                  <div className="flex items-center space-x-2 text-xs text-blue-700">
                    <span>High: {selectionStats.high}</span>
                    <span>Medium: {selectionStats.medium}</span>
                    <span>Low: {selectionStats.low}</span>
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-blue-700 hover:text-blue-900"
                >
                  Clear Selection
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportData}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleBulkNudge}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Bulk Nudges
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredLearners.length === learners.length 
                ? 'All Learners' 
                : `Filtered Learners (${filteredLearners.length})`
              }
            </h2>
            
            {filteredLearners.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllSelection}
                className="text-gray-600"
              >
                {isAllSelected ? 'Deselect All' : 
                 isPartiallySelected ? 'Select All' : 'Select All'}
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportData}
              className="text-gray-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Learners Grid */}
        <CardGrid
          learners={filteredLearners}
          selectedLearners={selectedLearners}
          onSelectionChange={toggleLearnerSelection}
          onLearnerClick={handleLearnerClick}
          showSelection={true}
          loading={isLoading}
          error={error?.message}
          hasMore={hasNextPage}
          onLoadMore={fetchNextPage}
          loadingMore={isFetchingNextPage}
          emptyMessage="No learners found"
          emptyDescription="Try adjusting your search or filter criteria to see learners."
        />
      </div>

      {/* Modals */}
      <NudgeModal
        open={!!selectedNudgeLearner}
        onOpenChange={(open) => !open && setSelectedNudgeLearner(null)}
        learner={selectedNudgeLearner}
      />

      <BulkNudgeModal
        open={showBulkNudgeModal}
        onOpenChange={setShowBulkNudgeModal}
        selectedLearners={getSelectedLearners()}
      />
    </DashboardLayout>
  );
};

export default LearnersPage;