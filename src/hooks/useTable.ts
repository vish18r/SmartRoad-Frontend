'use client';

import { useState, useCallback } from 'react';
import type { SortParams, FilterParams } from '@/types/common';

interface UseTableOptions<T> {
  initialSort?: { sortBy: keyof T; sortOrder: 'asc' | 'desc' };
  initialFilters?: Partial<Record<keyof T, any>>;
  onSortChange?: (sort: SortParams) => void;
  onFilterChange?: (filters: FilterParams) => void;
  onSelectionChange?: (selected: string[]) => void;
}

export function useTable<T extends { id: string }>(
  options: UseTableOptions<T> = {}
) {
  const {
    initialSort,
    initialFilters,
    onSortChange,
    onFilterChange,
    onSelectionChange,
  } = options;

  const [sortBy, setSortBy] = useState<keyof T | null>(
    initialSort?.sortBy ?? null
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    initialSort?.sortOrder ?? 'asc'
  );
  const [filters, setFilters] = useState<Partial<Record<keyof T, any>>>(
    initialFilters ?? {}
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const handleSort = useCallback(
    (field: keyof T) => {
      let newOrder: 'asc' | 'desc' = 'asc';
      if (sortBy === field && sortOrder === 'asc') {
        newOrder = 'desc';
      }
      setSortBy(field);
      setSortOrder(newOrder);
      onSortChange?.({
        sortBy: String(field),
        sortOrder: newOrder,
      });
    },
    [sortBy, sortOrder, onSortChange]
  );

  const handleFilter = useCallback(
    (filterKey: keyof T, filterValue: any) => {
      const newFilters = { ...filters, [filterKey]: filterValue };
      if (filterValue === null || filterValue === undefined || filterValue === '') {
        delete newFilters[filterKey];
      }
      setFilters(newFilters);
      onFilterChange?.(newFilters as FilterParams);
    },
    [filters, onFilterChange]
  );

  const handleMultipleFilters = useCallback(
    (newFilters: Partial<Record<keyof T, any>>) => {
      setFilters(newFilters);
      onFilterChange?.(newFilters as FilterParams);
    },
    [onFilterChange]
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    onFilterChange?.({});
  }, [onFilterChange]);

  const handleRowSelect = useCallback(
    (rowId: string) => {
      const newSelection = new Set(selectedRows);
      if (newSelection.has(rowId)) {
        newSelection.delete(rowId);
      } else {
        newSelection.add(rowId);
      }
      setSelectedRows(newSelection);
      onSelectionChange?.(Array.from(newSelection));
    },
    [selectedRows, onSelectionChange]
  );

  const handleSelectAll = useCallback(
    (rowIds: string[], selected: boolean) => {
      const newSelection = new Set(selectedRows);
      if (selected) {
        rowIds.forEach((id) => newSelection.add(id));
      } else {
        rowIds.forEach((id) => newSelection.delete(id));
      }
      setSelectedRows(newSelection);
      onSelectionChange?.(Array.from(newSelection));
    },
    [selectedRows, onSelectionChange]
  );

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const resetSort = useCallback(() => {
    setSortBy(null);
    setSortOrder('asc');
    onSortChange?.({ sortBy: undefined, sortOrder: 'asc' });
  }, [onSortChange]);

  return {
    sortBy: sortBy ? String(sortBy) : null,
    sortOrder,
    sort: handleSort,
    resetSort,
    filters,
    setFilter: handleFilter,
    setFilters: handleMultipleFilters,
    clearFilters,
    selectedRows: Array.from(selectedRows),
    isRowSelected: (rowId: string) => selectedRows.has(rowId),
    selectRow: handleRowSelect,
    selectAll: handleSelectAll,
    clearSelection,
    isAllSelected: (rowIds: string[]) =>
      rowIds.length > 0 && rowIds.every((id) => selectedRows.has(id)),
    isSomeSelected: (rowIds: string[]) =>
      rowIds.some((id) => selectedRows.has(id)),
  };
}
