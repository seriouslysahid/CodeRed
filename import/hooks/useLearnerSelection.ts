'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Learner } from '@/lib/types';

export interface LearnerSelectionState {
  selectedLearners: Set<number>;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  selectedCount: number;
}

export function useLearnerSelection(learners: Learner[] = []) {
  const [selectedLearners, setSelectedLearners] = useState<Set<number>>(new Set());

  const learnerIds = useMemo(() => 
    new Set(learners.map(learner => learner.id)), 
    [learners]
  );

  const selectedCount = selectedLearners.size;
  const totalCount = learners.length;
  
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  const toggleLearnerSelection = useCallback((learnerId: number, selected: boolean) => {
    setSelectedLearners(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(learnerId);
      } else {
        newSet.delete(learnerId);
      }
      return newSet;
    });
  }, []);

  const toggleAllSelection = useCallback(() => {
    if (isAllSelected) {
      // Deselect all
      setSelectedLearners(new Set());
    } else {
      // Select all visible learners
      setSelectedLearners(new Set(learnerIds));
    }
  }, [isAllSelected, learnerIds]);

  const selectLearners = useCallback((learnerIds: number[]) => {
    setSelectedLearners(prev => {
      const newSet = new Set(prev);
      learnerIds.forEach(id => newSet.add(id));
      return newSet;
    });
  }, []);

  const deselectLearners = useCallback((learnerIds: number[]) => {
    setSelectedLearners(prev => {
      const newSet = new Set(prev);
      learnerIds.forEach(id => newSet.delete(id));
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLearners(new Set());
  }, []);

  const getSelectedLearners = useCallback(() => {
    return learners.filter(learner => selectedLearners.has(learner.id));
  }, [learners, selectedLearners]);

  const isLearnerSelected = useCallback((learnerId: number) => {
    return selectedLearners.has(learnerId);
  }, [selectedLearners]);

  // Filter selected learners by risk level
  const getSelectedLearnersByRisk = useCallback((riskLevel: Learner['riskLabel']) => {
    return getSelectedLearners().filter(learner => learner.riskLabel === riskLevel);
  }, [getSelectedLearners]);

  // Get selection statistics
  const getSelectionStats = useCallback(() => {
    const selected = getSelectedLearners();
    const stats = {
      total: selected.length,
      high: selected.filter(l => l.riskLabel === 'high').length,
      medium: selected.filter(l => l.riskLabel === 'medium').length,
      low: selected.filter(l => l.riskLabel === 'low').length,
    };
    return stats;
  }, [getSelectedLearners]);

  const selectionState: LearnerSelectionState = {
    selectedLearners,
    isAllSelected,
    isPartiallySelected,
    selectedCount,
  };

  return {
    ...selectionState,
    toggleLearnerSelection,
    toggleAllSelection,
    selectLearners,
    deselectLearners,
    clearSelection,
    getSelectedLearners,
    isLearnerSelected,
    getSelectedLearnersByRisk,
    getSelectionStats,
    totalCount,
  };
}