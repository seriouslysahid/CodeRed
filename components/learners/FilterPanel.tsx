'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Input, Select, Button, Badge } from '@/components/ui';
import { debounce } from '@/lib/utils';
import type { FilterState, SelectOption } from '@/lib/types';

export interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalCount?: number;
  filteredCount?: number;
  className?: string;
  showMobileToggle?: boolean;
}

const riskFilterOptions: SelectOption[] = [
  { value: 'all', label: 'All Risk Levels' },
  { value: 'high', label: 'High Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'low', label: 'Low Risk' },
];

const sortByOptions: SelectOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'risk', label: 'Risk Score' },
  { value: 'lastLogin', label: 'Last Login' },
];

const sortOrderOptions: SelectOption[] = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
];

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  className,
  showMobileToggle = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onFiltersChange({ ...filters, search: value });
    }, 300),
    [filters, onFiltersChange]
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  // Sync search value with filters prop
  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  const handleRiskFilterChange = (value: string) => {
    onFiltersChange({
      ...filters,
      riskFilter: value as FilterState['riskFilter'],
    });
  };

  const handleSortByChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as FilterState['sortBy'],
    });
  };

  const handleSortOrderChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortOrder: value as FilterState['sortOrder'],
    });
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      riskFilter: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    };
    setSearchValue('');
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.riskFilter !== 'all' || 
    filters.sortBy !== 'name' || 
    filters.sortOrder !== 'asc';

  const activeFilterCount = [
    filters.search !== '',
    filters.riskFilter !== 'all',
    filters.sortBy !== 'name' || filters.sortOrder !== 'asc',
  ].filter(Boolean).length;

  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
      {/* Header with search and mobile toggle */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Search input */}
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Search learners..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={
                searchValue && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="text-gray-400 hover:text-gray-600 touch-manipulation p-1"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )
              }
              className="text-sm sm:text-base"
            />
          </div>

          {/* Mobile filter toggle */}
          {showMobileToggle && (
            <div className="md:hidden flex-shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative"
                touchOptimized={true}
              >
                <SlidersHorizontal className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <Badge
                    variant="danger"
                    size="sm"
                    className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          )}

          {/* Desktop clear filters */}
          {hasActiveFilters && (
            <div className="hidden md:block flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-600"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Results summary */}
        {(totalCount !== undefined || filteredCount !== undefined) && (
          <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
            {filteredCount !== undefined && totalCount !== undefined ? (
              <>
                <span className="hidden sm:inline">Showing </span>
                {filteredCount} <span className="hidden sm:inline">of {totalCount}</span> learners
                {hasActiveFilters && (
                  <span className="text-blue-600 ml-1">(filtered)</span>
                )}
              </>
            ) : (
              `${totalCount || filteredCount || 0} learners`
            )}
          </div>
        )}
      </div>

      {/* Filter controls */}
      <div className={clsx(
        'transition-all duration-200 overflow-hidden',
        isExpanded || !showMobileToggle ? 'block' : 'hidden md:block'
      )}>
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
          {/* Risk filter */}
          <div className="md:w-48">
            <Select
              label="Risk Level"
              options={riskFilterOptions}
              value={filters.riskFilter}
              onValueChange={handleRiskFilterChange}
            />
          </div>

          {/* Sort by */}
          <div className="md:w-40">
            <Select
              label="Sort By"
              options={sortByOptions}
              value={filters.sortBy}
              onValueChange={handleSortByChange}
            />
          </div>

          {/* Sort order */}
          <div className="md:w-36">
            <Select
              label="Order"
              options={sortOrderOptions}
              value={filters.sortOrder}
              onValueChange={handleSortOrderChange}
            />
          </div>

          {/* Mobile clear filters */}
          {hasActiveFilters && (
            <div className="md:hidden">
              <Button
                variant="secondary"
                size="sm"
                onClick={clearFilters}
                className="w-full"
                touchOptimized={true}
              >
                <X className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="info" size="sm">
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleSearchChange('')}
                    className="ml-1 text-blue-700 hover:text-blue-900"
                    aria-label="Remove search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {filters.riskFilter !== 'all' && (
                <Badge variant="warning" size="sm">
                  Risk: {filters.riskFilter}
                  <button
                    onClick={() => handleRiskFilterChange('all')}
                    className="ml-1 text-yellow-700 hover:text-yellow-900"
                    aria-label="Remove risk filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              
              {(filters.sortBy !== 'name' || filters.sortOrder !== 'asc') && (
                <Badge variant="default" size="sm">
                  Sort: {filters.sortBy} ({filters.sortOrder})
                  <button
                    onClick={() => {
                      onFiltersChange({
                        ...filters,
                        sortBy: 'name',
                        sortOrder: 'asc',
                      });
                    }}
                    className="ml-1 text-gray-700 hover:text-gray-900"
                    aria-label="Remove sort filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;