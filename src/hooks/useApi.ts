'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiError } from '@/types/api';

interface UseApiOptions {
  skip?: boolean;
  /** Values the call depends on; the request is re-run whenever one changes. */
  deps?: unknown[];
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<ApiError | null>(null);
  const isMounted = useRef(true);
  // Callers pass fresh closures every render; keep the latest in refs so they
  // don't retrigger the fetch effect (which caused an endless loading loop).
  const apiCallRef = useRef(apiCall);
  const optionsRef = useRef(options);
  apiCallRef.current = apiCall;
  optionsRef.current = options;

  const fetchData = useCallback(async () => {
    if (optionsRef.current.skip) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiCallRef.current();
      if (isMounted.current) {
        setData(response);
        optionsRef.current.onSuccess?.(response);
      }
    } catch (err) {
      if (isMounted.current) {
        const apiError = err as ApiError;
        setError(apiError);
        optionsRef.current.onError?.(apiError);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchData();
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, options.skip, ...(options.deps ?? [])]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

interface UseMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

interface UseMutationResult<T> {
  mutate: (payload?: any) => Promise<T>;
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  reset: () => void;
}

export function useMutation<T>(
  apiCall: (payload?: any) => Promise<T>,
  options: UseMutationOptions = {}
): UseMutationResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const isMounted = useRef(true);

  const mutate = useCallback(
    async (payload?: any) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall(payload);
        if (isMounted.current) {
          setData(response);
          options.onSuccess?.(response);
        }
        return response;
      } catch (err) {
        const apiError = err as ApiError;
        if (isMounted.current) {
          setError(apiError);
          options.onError?.(apiError);
        }
        throw apiError;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [apiCall, options.onSuccess, options.onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return { mutate, data, loading, error, reset };
}
