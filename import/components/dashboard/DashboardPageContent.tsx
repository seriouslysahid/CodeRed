'use client';

import React, { useState } from 'react';
import { BarChart3, Users, Send, Settings, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, EngagementMeter, PulseIndicator } from '@/components/ui';
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
      title="Engagement & Retention Dashboard"
      description="Real-time learner engagement monitoring with predictive analytics and automated interventions"
    >
      <div className="space-y-8">
        {/* Overview Stats */}
        <DashboardStats />

        {/* Engagement Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <EngagementMeter value={87} size="sm" label="Overall Engagement" />
          </Card>
          <Card className="p-6 text-center">
            <EngagementMeter value={92} size="sm" label="Retention Rate" />
          </Card>
          <Card className="p-6 text-center">
            <EngagementMeter value={78} size="sm" label="Nudge Success" />
          </Card>
          <Card className="p-6 text-center">
            <EngagementMeter value={85} size="sm" label="Risk Prevention" />
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Charts and Risk Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <RiskChart showDetails={true} />
            <TopRiskLearners
              maxItems={5}
              onNudgeLearner={handleNudgeLearner}
              onViewLearner={handleLearnerClick}
              showActions={true}
            />
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => setShowBulkNudgeModal(true)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Bulk Nudges
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={handleViewAllLearners}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View All Learners
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </Card>

            {/* Risk Alerts */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Risk Alerts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <PulseIndicator status="at-risk" size="sm" />
                    <span className="text-sm font-medium">3 learners at high risk</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-600">
                    View
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <PulseIndicator status="inactive" size="sm" />
                    <span className="text-sm font-medium">7 learners inactive</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-yellow-600">
                    View
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          onFiltersChange={updateFilters}
          totalCount={learners.length}
          filteredCount={filteredLearners.length}
        />

        {/* Learners Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <h2 className="text-xl font-semibold text-foreground">Recent Learners</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
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
            learners={filteredLearners.slice(0, 6)} // Show first 6 on dashboard
            selectedLearners={selectedLearners}
            onSelectionChange={toggleLearnerSelection}
            onLearnerClick={handleLearnerClick}
            showSelection={false} // Remove selection for cleaner look
            loading={isLoading}
            {...(error?.message && { error: error.message })}
            emptyMessage="No learners match your filters"
            emptyDescription="Try adjusting your search or filter criteria to see more learners."
          />

          {filteredLearners.length > 6 && (
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
