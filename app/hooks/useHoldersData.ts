// hooks/useHoldersData.ts
import { useState, useEffect, useCallback } from 'react';
import { getProcessedHoldersData, DEFAULT_HOLDERS_PARAMS } from '@/app/lib/api/services/holdersService';
import type { HoldersWidgetDataset, HoldersApiParams } from '@/app/types/holders';

function extractErrorMessage(err: unknown): string {
  try {
    if (err == null) return 'Failed to fetch holders data';

    const extractFromString = (text: string): string | null => {
      const trimmed = (text || '').trim();
      if (!trimmed) return null;
      // Try JSON parse first
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed.error === 'string' && parsed.error.trim()) {
          return parsed.error.trim();
        }
      } catch {}
      // Fallback: regex search for "error":"..."
      const m = trimmed.match(/"error"\s*:\s*"([^"]+)"/);
      if (m && m[1]) return m[1].trim();
      return null;
    };

    // Native Error instance
    if (err instanceof Error) {
      const msg = (err.message || '').trim();
      if (msg) {
        const extracted = extractFromString(msg);
        if (extracted) return extracted;
        return 'Failed to fetch holders data';
      }
    }

    // Plain object with possible nested error fields
    if (typeof err === 'object') {
      const anyErr = err as any;
      if (typeof anyErr?.error === 'string' && anyErr.error.trim()) return anyErr.error.trim();
      if (typeof anyErr?.error?.message === 'string' && anyErr.error.message.trim()) return anyErr.error.message.trim();

      // Axios-style error payloads
      const respData = anyErr?.response?.data;
      if (typeof respData === 'string') {
        const extracted = extractFromString(respData);
        if (extracted) return extracted;
      } else if (respData && typeof respData?.error === 'string' && respData.error.trim()) {
        return respData.error.trim();
      }

      const data = anyErr?.data;
      if (typeof data === 'string') {
        const extracted = extractFromString(data);
        if (extracted) return extracted;
      } else if (data && typeof data?.error === 'string' && data.error.trim()) {
        return data.error.trim();
      }

      // Some fetch clients attach body/errorText
      if (typeof anyErr?.errorText === 'string') {
        const extracted = extractFromString(anyErr.errorText);
        if (extracted) return extracted;
      }
    }

    // String error
    if (typeof err === 'string') {
      const s = err.trim();
      const extracted = extractFromString(s);
      if (extracted) return extracted;
      return 'Failed to fetch holders data';
    }
  } catch {}

  return 'Failed to fetch holders data';
}

export interface UseHoldersDataOptions {
  tokenAddress?: string;
  params?: HoldersApiParams;
  enabled?: boolean;
  /**
   * If true (default), the hook will automatically fetch on mount/changes when enabled.
   * If false, fetching is manual via refetch().
   */
  autoFetch?: boolean;
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
  enabled = true,
  autoFetch = true,
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
      const errorMessage = extractErrorMessage(err);
      console.warn('⚠️ Holders data unavailable:', errorMessage);
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tokenAddress, params, enabled]);

  // Optional initial fetch when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchHoldersData();
    }
  }, [fetchHoldersData, autoFetch]);

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

