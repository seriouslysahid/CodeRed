'use client';

import React, { useState } from 'react';
import { BarChart3, Users, Send, Settings } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card } from '@/components/ui';
import { FilterPanel, CardGrid } from '@/components/learners';
import { NudgeModal, BulkNudgeModal } from '@/components/nudges';
import { RiskChart, TopRiskLearners, DashboardStats } from '@/components/dashboard';
import { useAllLearners, useFilterState, useLearnerSelection } from '@/hooks';
import type { Learner } from '@/lib/types';

const DashboardPageContent: React.FC = () => {
  const [selectedNudgeLearner, setSelectedNudgeLearner] = useState<Learner | null>(null);
  const [showBulkNudgeModal, setShowBulkNudgeModal] = useState(false);
  
  const { filters, updateFilters, applyFiltersToLearners } = useFilterState();
  const { learners, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } = useAllLearners(filters);
  
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
  } = useLearnerSelection(filteredLearners);

  const handleLearnerClick = (learner: Learner) => {
    // Navigate to learner detail page
    window.location.href = `/learners/${learner.id}`;
  };

  const handleNudgeLearner = (learner: Learner) => {
    setSelectedNudgeLearner(learner);
  };

  const handleBulkNudge = () => {
    if (selectedCount > 0) {
      setShowBulkNudgeModal(true);
    }
  };

  const handleViewAllLearners = () => {
    window.location.href = '/learners';
  };

  return (
    <DashboardLayout
      title="Dashboard"
      description="Monitor learner progress and identify at-risk students"
    >
      <div className="space-y-8">
        {/* Overview Stats */}
        <DashboardStats />

        {/* Charts and Top Risk Learners */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <RiskChart showDetails={true} />
          <TopRiskLearners
            maxItems={5}
            onNudgeLearner={handleNudgeLearner}
            onViewLearner={handleLearnerClick}
            showActions={true}
          />
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <p className="text-sm font-medium text-blue-900">
                  {selectedCount} learner{selectedCount !== 1 ? 's' : ''} selected
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-blue-700 hover:text-blue-900 self-start sm:self-auto"
                >
                  Clear Selection
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBulkNudge}
                  className="bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto"
                  touchOptimized={true}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Bulk Nudges
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Learners Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <h2 className="text-xl font-semibold text-gray-900">All Learners</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              {filteredLearners.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllSelection}
                  className="text-gray-600 w-full sm:w-auto"
                >
                  {isAllSelected ? 'Deselect All' : 'Select All'}
                </Button>
              )}
              
              <Button
                variant="secondary"
                onClick={handleViewAllLearners}
                className="w-full sm:w-auto"
                touchOptimized={true}
              >
                <Users className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">View All Learners</span>
                <span className="sm:hidden">View All</span>
              </Button>
            </div>
          </div>

          <CardGrid
            learners={filteredLearners.slice(0, 12)} // Show first 12 on dashboard
            selectedLearners={selectedLearners}
            onSelectionChange={toggleLearnerSelection}
            onLearnerClick={handleLearnerClick}
            showSelection={true}
            loading={isLoading}
            {...(error?.message && { error: error.message })}
            emptyMessage="No learners match your filters"
            emptyDescription="Try adjusting your search or filter criteria to see more learners."
          />

          {filteredLearners.length > 12 && (
            <div className="text-center pt-4">
              <Button
                variant="secondary"
                onClick={handleViewAllLearners}
              >
                View All {filteredLearners.length} Learners
              </Button>
            </div>
          )}
        </div>
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

export default DashboardPageContent;
