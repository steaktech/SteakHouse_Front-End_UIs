"use client";

import { useState, useEffect, useCallback } from 'react';
import { TrendingService } from '@/app/services/trendingService';
import type { TrendingToken } from '@/app/types/token';

export interface UseTrendingApiOptions {
  /**
   * Whether to fetch data on mount
   */
  fetchOnMount?: boolean;
  /**
   * Callback when data is successfully fetched
   */
  onSuccess?: (tokens: TrendingToken[]) => void;
  /**
   * Callback when fetch fails
   */
  onError?: (error: Error) => void;
  /**
   * Number of retry attempts
   */
  retries?: number;
  /**
   * Initial delay between retries in milliseconds
   */
  retryDelay?: number;
}

export interface UseTrendingApiReturn {
  /**
   * The fetched trending tokens
   */
  data: TrendingToken[];
  /**
   * Whether data is being fetched
   */
  isLoading: boolean;
  /**
   * Error if fetch failed
   */
  error: Error | null;
  /**
   * Function to manually trigger a fetch
   */
  refetch: () => Promise<void>;
  /**
   * Whether initial data has been loaded
   */
  isInitialLoading: boolean;
}

/**
 * Custom hook for fetching trending tokens from the API
 * This is designed to work alongside the WebSocket connection,
 * providing initial data while WebSocket connects
 */
export function useTrendingApi(options: UseTrendingApiOptions = {}): UseTrendingApiReturn {
  const {
    fetchOnMount = true,
    onSuccess,
    onError,
    retries = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<TrendingToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(fetchOnMount);

  /**
   * Fetches trending data from the API
   */
  const fetchTrending = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[useTrendingApi] Fetching trending data...');
      
      const tokens = await TrendingService.fetchWithRetry(retries, retryDelay);
      
      if (tokens.length === 0) {
        console.warn('[useTrendingApi] No trending tokens received from API');
      }
      
      setData(tokens);
      onSuccess?.(tokens);
      
      console.log(`[useTrendingApi] Successfully loaded ${tokens.length} trending tokens`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch trending data');
      console.error('[useTrendingApi] Failed to fetch trending data:', error);
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [onSuccess, onError, retries, retryDelay]);

  /**
   * Effect to fetch data on mount if enabled
   */
  useEffect(() => {
    if (fetchOnMount) {
      fetchTrending();
    }
  }, [fetchOnMount]); // Only run on mount, not on fetchTrending changes

  return {
    data,
    isLoading,
    error,
    refetch: fetchTrending,
    isInitialLoading
  };
}