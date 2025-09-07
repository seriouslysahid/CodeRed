'use client';

import React, { useState } from 'react';
import { BarChart3, Users, Send, Settings, Activity, TrendingUp, AlertTriangle, CheckCircle, Zap, Brain, Database, Cpu } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { 
  Button, 
  Card, 
  EngagementMeter, 
  PulseIndicator,
  GradientCard,
  AnimatedCounter,
  PulseGlow,
  DataVisualization,
  StatusIndicator
} from '@/components/ui';
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

  // Calculate enhanced metrics
  const totalLearners = learners.length;
  const highRiskCount = learners.filter(l => l.riskLabel === 'high').length;
  const mediumRiskCount = learners.filter(l => l.riskLabel === 'medium').length;
  const lowRiskCount = learners.filter(l => l.riskLabel === 'low').length;
  
  const avgCompletion = totalLearners > 0 
    ? Math.round(learners.reduce((sum, l) => sum + l.completionPct, 0) / totalLearners)
    : 0;
  
  const avgQuizScore = totalLearners > 0
    ? Math.round(learners.reduce((sum, l) => sum + l.quizAvg, 0) / totalLearners)
    : 0;

  const riskDistributionData = [
    { label: 'High Risk', value: highRiskCount, color: '#EF4444' },
    { label: 'Medium Risk', value: mediumRiskCount, color: '#F59E0B' },
    { label: 'Low Risk', value: lowRiskCount, color: '#10B981' },
  ];

  const performanceData = [
    { label: 'Completion', value: avgCompletion, color: '#3B82F6' },
    { label: 'Quiz Score', value: avgQuizScore, color: '#10B981' },
    { label: 'Engagement', value: Math.round((lowRiskCount / totalLearners) * 100), color: '#8B5CF6' },
  ];

  return (
    <DashboardLayout
      title="Engagement & Retention Dashboard"
      description="Real-time learner engagement monitoring with predictive analytics and automated interventions"
    >
      <div className="space-y-8">
        {/* Enhanced Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GradientCard gradient="primary" glow={true} className="text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Learners</p>
                <AnimatedCounter
                  value={totalLearners}
                  className="text-2xl font-bold"
                  color="primary"
                />
                <p className="text-blue-200 text-xs mt-1">Active Users</p>
              </div>
              <PulseGlow intensity="medium" color="blue">
                <Users className="w-8 h-8 text-blue-200" />
              </PulseGlow>
            </div>
          </GradientCard>

          <GradientCard gradient="danger" glow={highRiskCount > 0} className="text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">High Risk</p>
                <AnimatedCounter
                  value={highRiskCount}
                  className="text-2xl font-bold"
                  color="danger"
                />
                <p className="text-red-200 text-xs mt-1">Need Attention</p>
              </div>
              <PulseGlow intensity="high" color="red">
                <AlertTriangle className="w-8 h-8 text-red-200" />
              </PulseGlow>
            </div>
          </GradientCard>

          <GradientCard gradient="warning" className="text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Medium Risk</p>
                <AnimatedCounter
                  value={mediumRiskCount}
                  className="text-2xl font-bold"
                  color="warning"
                />
                <p className="text-yellow-200 text-xs mt-1">Monitor Closely</p>
              </div>
              <PulseGlow intensity="medium" color="yellow">
                <TrendingUp className="w-8 h-8 text-yellow-200" />
              </PulseGlow>
            </div>
          </GradientCard>

          <GradientCard gradient="success" className="text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Low Risk</p>
                <AnimatedCounter
                  value={lowRiskCount}
                  className="text-2xl font-bold"
                  color="success"
                />
                <p className="text-green-200 text-xs mt-1">On Track</p>
              </div>
              <PulseGlow intensity="low" color="green">
                <CheckCircle className="w-8 h-8 text-green-200" />
              </PulseGlow>
            </div>
          </GradientCard>
        </div>

        {/* Enhanced Engagement Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GradientCard gradient="info" className="text-white text-center">
            <EngagementMeter value={87} size="sm" label="Overall Engagement" />
            <div className="mt-2">
              <StatusIndicator status="online" size="sm" animated={true} />
            </div>
          </GradientCard>
          
          <GradientCard gradient="success" className="text-white text-center">
            <EngagementMeter value={92} size="sm" label="Retention Rate" />
            <div className="mt-2">
              <StatusIndicator status="online" size="sm" animated={true} />
            </div>
          </GradientCard>
          
          <GradientCard gradient="warning" className="text-white text-center">
            <EngagementMeter value={78} size="sm" label="Nudge Success" />
            <div className="mt-2">
              <StatusIndicator status="online" size="sm" animated={true} />
            </div>
          </GradientCard>
          
          <GradientCard gradient="primary" className="text-white text-center">
            <EngagementMeter value={85} size="sm" label="Risk Prevention" />
            <div className="mt-2">
              <StatusIndicator status="online" size="sm" animated={true} />
            </div>
          </GradientCard>
        </div>

        {/* Enhanced Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GradientCard gradient="secondary" className="text-white">
            <h3 className="text-lg font-bold text-white mb-4">Risk Distribution</h3>
            <DataVisualization
              data={riskDistributionData}
              type="pie"
              animated={true}
              height={250}
              showLabels={true}
              showValues={true}
            />
          </GradientCard>

          <GradientCard gradient="secondary" className="text-white">
            <h3 className="text-lg font-bold text-white mb-4">Performance Metrics</h3>
            <DataVisualization
              data={performanceData}
              type="bar"
              animated={true}
              height={250}
              showLabels={true}
              showValues={true}
              showPercentages={true}
            />
          </GradientCard>
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

          {/* Right Column - Enhanced Quick Actions */}
          <div className="space-y-6">
            {/* System Status */}
            <GradientCard gradient="primary" className="text-white">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100 text-sm">AI Service</span>
                  <StatusIndicator status="online" label="Active" size="sm" animated={true} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100 text-sm">Database</span>
                  <StatusIndicator status="online" label="Connected" size="sm" animated={true} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100 text-sm">API</span>
                  <StatusIndicator status="online" label="Healthy" size="sm" animated={true} />
                </div>
              </div>
            </GradientCard>

            {/* Quick Actions */}
            <GradientCard gradient="secondary" className="text-white">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button 
                  variant="secondary" 
                  className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={() => setShowBulkNudgeModal(true)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Bulk Nudges
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-white/20"
                  onClick={handleViewAllLearners}
                >
                  <Users className="w-4 h-4 mr-2" />
                  View All Learners
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-white/20"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </GradientCard>

            {/* AI Insights */}
            <GradientCard gradient="info" className="text-white">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Insights
              </h3>
              <div className="space-y-3 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white font-medium">Risk Prediction</p>
                  <p className="text-blue-100 text-xs mt-1">
                    AI has identified {highRiskCount} learners at high risk of dropping out
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white font-medium">Engagement Trend</p>
                  <p className="text-blue-100 text-xs mt-1">
                    Overall engagement is trending upward by 12% this month
                  </p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white font-medium">Nudge Effectiveness</p>
                  <p className="text-blue-100 text-xs mt-1">
                    Personalized nudges show 78% success rate
                  </p>
                </div>
              </div>
            </GradientCard>
          </div>
        </div>

        {/* Enhanced Learner Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Learner Overview</h2>
            <div className="flex items-center space-x-2">
              <StatusIndicator status="online" label={`${filteredLearners.length} learners`} size="sm" />
            </div>
          </div>
          
          <FilterPanel 
            filters={filters}
            onFiltersChange={updateFilters}
            learnerCount={filteredLearners.length}
          />
          
          <CardGrid
            learners={filteredLearners}
            selectedLearners={selectedLearners}
            onLearnerClick={handleLearnerClick}
            onNudgeLearner={handleNudgeLearner}
            onSelectionChange={toggleLearnerSelection}
            onSelectAll={toggleAllSelection}
            isAllSelected={isAllSelected}
            isPartiallySelected={isPartiallySelected}
            showSelection={true}
          />
          
          {hasNextPage && (
            <div className="text-center">
              <Button
                onClick={fetchNextPage}
                loading={isFetchingNextPage}
                variant="secondary"
                className="min-w-[200px]"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More Learners'}
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
        onSuccess={() => {
          setShowBulkNudgeModal(false);
          clearSelection();
        }}
      />
    </DashboardLayout>
  );
};

export default DashboardPageContent;