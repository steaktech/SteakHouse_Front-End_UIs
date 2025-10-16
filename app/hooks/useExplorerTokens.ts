"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Token, PaginatedTokenResponse } from '@/app/types/token';
import { ExplorerService, type GraduatedParams, type RecentParams } from '@/app/services/explorerService';

export interface UsePaginatedTokensResult {
  data: Token[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  nextPage: () => void;
  prevPage: () => void;
  setPage: (p: number) => void;
  refetch: () => Promise<void>;
}

function usePaginatedTokens(
  fetcher: (params: any) => Promise<PaginatedTokenResponse>,
  initialParams: Record<string, any>,
  defaults: { page?: number; pageSize?: number }
): UsePaginatedTokensResult {
  const [page, setPage] = useState<number>(defaults.page ?? 1);
  const [pageSize] = useState<number>(defaults.pageSize ?? 20);
  const [data, setData] = useState<Token[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const params = useMemo(() => ({ ...initialParams, page, pageSize }), [initialParams, page, pageSize]);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetcher(params);
      setData(res.items || []);
      setHasMore(Boolean(res.has_more));
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch tokens'));
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, params]);

  useEffect(() => {
    void load();
  }, [load]);

  const nextPage = useCallback(() => {
    if (hasMore) setPage((p) => p + 1);
  }, [hasMore]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  return { data, page, pageSize, hasMore, isLoading, error, nextPage, prevPage, setPage, refetch: load };
}

export function useExplorerRecent(options: RecentParams = {}): UsePaginatedTokensResult {
  const fetcher = useCallback((params: RecentParams) => ExplorerService.getRecentTokens(params), []);
  // Important: stabilize initial params so dependency arrays do not change every render
  const initial = useMemo<RecentParams>(() => ({}), []);
  return usePaginatedTokens(fetcher, initial, { page: options.page ?? 1, pageSize: options.pageSize ?? 20 });
}

export function useExplorerGraduated(options: GraduatedParams = {}): UsePaginatedTokensResult {
  const { threshold, page, pageSize } = options;
  const fetcher = useCallback((params: GraduatedParams) => ExplorerService.getGraduatedTokens(params), []);
  const initial = useMemo(() => ({ threshold }), [threshold]);
  return usePaginatedTokens(fetcher, initial, { page: page ?? 1, pageSize: pageSize ?? 25 });
}

export function useExplorerNearlyGraduated(options: GraduatedParams & { threshold: number }): UsePaginatedTokensResult {
  const { threshold, page, pageSize } = options;
  const fetcher = useCallback((params: GraduatedParams) => ExplorerService.getGraduatedTokens(params), []);
  const initial = useMemo(() => ({ threshold }), [threshold]);
  return usePaginatedTokens(fetcher, initial, { page: page ?? 1, pageSize: pageSize ?? 25 });
}
