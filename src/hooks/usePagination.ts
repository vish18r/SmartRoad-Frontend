'use client';

import { useState, useCallback } from 'react';
import type { PaginationParams, PaginationMeta } from '@/types/common';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const {
    initialPage = 1,
    initialLimit = 20,
    onPageChange,
    onLimitChange,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      onPageChange?.(newPage);
    },
    [onPageChange]
  );

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      setLimit(newLimit);
      setPage(1); // Reset to first page when limit changes
      onLimitChange?.(newLimit);
    },
    [onLimitChange]
  );

  const handleNextPage = useCallback(() => {
    if (meta?.hasNextPage) {
      handlePageChange(page + 1);
    }
  }, [page, meta?.hasNextPage, handlePageChange]);

  const handlePreviousPage = useCallback(() => {
    if (meta?.hasPreviousPage) {
      handlePageChange(page - 1);
    }
  }, [page, meta?.hasPreviousPage, handlePageChange]);

  const goToFirstPage = useCallback(() => {
    handlePageChange(1);
  }, [handlePageChange]);

  const goToLastPage = useCallback(() => {
    if (meta?.totalPages) {
      handlePageChange(meta.totalPages);
    }
  }, [meta?.totalPages, handlePageChange]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  return {
    page,
    limit,
    setPage: handlePageChange,
    setLimit: handleLimitChange,
    nextPage: handleNextPage,
    previousPage: handlePreviousPage,
    goToFirstPage,
    goToLastPage,
    setMeta,
    meta,
    offset: (page - 1) * limit,
    params: { page, limit } as PaginationParams,
    hasNextPage: meta?.hasNextPage ?? false,
    hasPreviousPage: meta?.hasPreviousPage ?? false,
    totalPages: meta?.totalPages ?? 0,
    totalRecords: meta?.totalRecords ?? 0,
    reset,
  };
}
