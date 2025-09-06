'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyFilters, buildQueryString, parseQueryParams } from '@/lib/utils';
import type { FilterState, Learner } from '@/lib/types';

const DEFAULT_FILTERS: FilterState = {
  search: '',
  riskFilter: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
};

export function useFilterState(initialFilters?: Partial<FilterState>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState<FilterState>(() => {
    // Handle case where searchParams might not be available during build
    let urlParams;
    try {
      urlParams = parseQueryParams(searchParams?.toString() || '');
    } catch (error) {
      urlParams = {};
    }
    
    return {
      search: urlParams.search || initialFilters?.search || DEFAULT_FILTERS.search,
      riskFilter: (urlParams.riskFilter as FilterState['riskFilter']) || 
                  initialFilters?.riskFilter || DEFAULT_FILTERS.riskFilter,
      sortBy: (urlParams.sortBy as FilterState['sortBy']) || 
              initialFilters?.sortBy || DEFAULT_FILTERS.sortBy,
      sortOrder: (urlParams.sortOrder as FilterState['sortOrder']) || 
                 initialFilters?.sortOrder || DEFAULT_FILTERS.sortOrder,
    };
  });

  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    
    // Update URL with new filters
    const queryString = buildQueryString({
      search: newFilters.search || undefined,
      riskFilter: newFilters.riskFilter !== 'all' ? newFilters.riskFilter : undefined,
      sortBy: newFilters.sortBy !== 'name' ? newFilters.sortBy : undefined,
      sortOrder: newFilters.sortOrder !== 'asc' ? newFilters.sortOrder : undefined,
    });
    
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [router]);

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K, 
    value: FilterState[K]
  ) => {
    updateFilters({ ...filters, [key]: value });
  }, [filters, updateFilters]);

  const resetFilters = useCallback(() => {
    updateFilters(DEFAULT_FILTERS);
  }, [updateFilters]);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some(key => {
      const filterKey = key as keyof FilterState;
      return filters[filterKey] !== DEFAULT_FILTERS[filterKey];
    });
  }, [filters]);

  // Apply filters to learner data
  const applyFiltersToLearners = useCallback((learners: Learner[]) => {
    return applyFilters(learners, filters);
  }, [filters]);

  // Get filter summary for display
  const getFilterSummary = useCallback(() => {
    const activeFilters: string[] = [];
    
    if (filters.search) {
      activeFilters.push(`Search: "${filters.search}"`);
    }
    
    if (filters.riskFilter !== 'all') {
      activeFilters.push(`Risk: ${filters.riskFilter}`);
    }
    
    if (filters.sortBy !== 'name' || filters.sortOrder !== 'asc') {
      activeFilters.push(`Sort: ${filters.sortBy} (${filters.sortOrder})`);
    }
    
    return activeFilters;
  }, [filters]);

  return {
    filters,
    updateFilters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    applyFiltersToLearners,
    getFilterSummary,
  };
}