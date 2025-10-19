import { useState, useEffect, useCallback, useRef } from 'react';
import { getFullTokenData } from '@/app/lib/api/services/tokenService';
import type { FullTokenDataResponse } from '@/app/types/token';

interface UseTokenDataState {
  data: FullTokenDataResponse | null;
  isLoading: boolean;
  error: string | null;
}

interface UseTokenDataReturn extends UseTokenDataState {
  refetch: () => Promise<void>;
}

// Global cache to prevent duplicate API calls for the same token
const tokenDataCache = new Map<string, {
  data: FullTokenDataResponse;
  timestamp: number;
}>();

// Global promise cache to prevent concurrent duplicate calls
const pendingCalls = new Map<string, Promise<FullTokenDataResponse>>();

// Cache duration: 30 seconds (as mentioned in tokenwebsocket.txt)
const CACHE_DURATION = 30 * 1000;

type UseTokenDataOptions = { interval?: string; limit?: number };

export function useTokenData(tokenAddress: string | null, options: UseTokenDataOptions = {}): UseTokenDataReturn {
  const [state, setState] = useState<UseTokenDataState>({
    data: null,
    isLoading: false,
    error: null,
  });

  // Use ref to track current token address for cleanup
  const currentTokenRef = useRef<string | null>(tokenAddress);

  const fetchTokenData = useCallback(async () => {
    if (!tokenAddress) {
      setState(prev => ({ ...prev, data: null, isLoading: false, error: null }));
      return;
    }

    // Update current token ref
    currentTokenRef.current = tokenAddress;

    const interval = options.interval ?? '1m';
    const limit = options.limit ?? 100;

    // Compose cache key with token+interval+limit to avoid collisions
    const cacheKey = tokenAddress ? `${tokenAddress}|${interval}|${limit}` : 'null';

    // Check cache first
    const cached = tokenDataCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setState(prev => ({ ...prev, data: cached.data, isLoading: false, error: null }));
      return;
    }

    // Check if there's already a pending call for this key
    const existingCall = pendingCalls.get(cacheKey);
    if (existingCall) {
      //console.log('Using existing pending call for token:', tokenAddress);
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const response = await existingCall;
        // Only update state if this is still the current token
        if (currentTokenRef.current === tokenAddress) {
          setState(prev => ({ ...prev, data: response, isLoading: false, error: null }));
        }
      } catch (err) {
        if (currentTokenRef.current === tokenAddress) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch token data';
          setState(prev => ({ ...prev, data: null, isLoading: false, error: errorMessage }));
        }
      }
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    // Create new API call
    const apiCall = getFullTokenData(tokenAddress, interval, limit);
    pendingCalls.set(cacheKey, apiCall);

    try {
      const response = await apiCall;
      
      // Cache the response
      tokenDataCache.set(cacheKey, {
        data: response,
        timestamp: now
      });

      // Only update state if this is still the current token
      if (currentTokenRef.current === tokenAddress) {
        setState(prev => ({ ...prev, data: response, isLoading: false, error: null }));
      }
      
      //console.log('Successfully fetched and cached token data for:', tokenAddress);
    } catch (err) {
      if (currentTokenRef.current === tokenAddress) {
        let errorMessage = err instanceof Error ? err.message : 'Failed to fetch token data';
        const lower = (errorMessage || '').toLowerCase();
        if (lower.includes('not found') || lower.includes('404')) {
          errorMessage = 'Token not found';
        }
        setState(prev => ({ ...prev, data: null, isLoading: false, error: errorMessage }));
        console.error('Error fetching token data:', err);
      }
    } finally {
      // Clean up pending call
      pendingCalls.delete(cacheKey);
    }
  }, [tokenAddress, options.interval, options.limit]);

  useEffect(() => {
    fetchTokenData();
  }, [fetchTokenData]);

  // Cleanup effect to update current token ref
  useEffect(() => {
    currentTokenRef.current = tokenAddress;
  }, [tokenAddress]);

  const refetch = useCallback(async () => {
    if (tokenAddress) {
      const interval = options.interval ?? '1m';
      const limit = options.limit ?? 100;
      const cacheKey = `${tokenAddress}|${interval}|${limit}`;
      tokenDataCache.delete(cacheKey);
    }
    await fetchTokenData();
  }, [fetchTokenData, tokenAddress, options.interval, options.limit]);

  return {
    ...state,
    refetch,
  };
}
