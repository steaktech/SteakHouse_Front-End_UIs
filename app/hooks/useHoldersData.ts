// hooks/useHoldersData.ts
import { useState, useEffect, useCallback } from 'react';
import { getProcessedHoldersData, DEFAULT_HOLDERS_PARAMS } from '@/app/lib/api/services/holdersService';
import type { HoldersWidgetDataset, HoldersApiParams } from '@/app/types/holders';

export interface UseHoldersDataOptions {
  tokenAddress?: string;
  params?: HoldersApiParams;
  enabled?: boolean;
}

export interface UseHoldersDataReturn {
  data: HoldersWidgetDataset | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing holders data
 * Follows the patterns used in other hooks in the codebase
 */
export function useHoldersData({
  tokenAddress,
  params = DEFAULT_HOLDERS_PARAMS,
  enabled = true
}: UseHoldersDataOptions): UseHoldersDataReturn {
  const [data, setData] = useState<HoldersWidgetDataset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHoldersData = useCallback(async () => {
    if (!tokenAddress || !enabled) {
      return;
    }

    console.log('🔄 Fetching holders data for:', tokenAddress);
    setLoading(true);
    setError(null);

    try {
      const holdersData = await getProcessedHoldersData(tokenAddress, params);
      setData(holdersData);
      console.log('✅ Successfully fetched holders data for:', tokenAddress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch holders data';
      console.error('❌ Error fetching holders data:', errorMessage);
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tokenAddress, params, enabled]);

  // Initial fetch when dependencies change
  useEffect(() => {
    fetchHoldersData();
  }, [fetchHoldersData]);

  const refetch = useCallback(async () => {
    await fetchHoldersData();
  }, [fetchHoldersData]);

  return {
    data,
    loading,
    error,
    refetch
  };
}

