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

export function useTokenData(tokenAddress: string | null): UseTokenDataReturn {
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

    //console.log('fetchTokenData called for token:', tokenAddress);

    // Check cache first
    const cached = tokenDataCache.get(tokenAddress);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      //console.log('Using cached data for token:', tokenAddress);
      setState(prev => ({ ...prev, data: cached.data, isLoading: false, error: null }));
      return;
    }

    // Check if there's already a pending call for this token
    const existingCall = pendingCalls.get(tokenAddress);
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
    const apiCall = getFullTokenData(tokenAddress);
    pendingCalls.set(tokenAddress, apiCall);

    try {
      const response = await apiCall;
      
      // Cache the response
      tokenDataCache.set(tokenAddress, {
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
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch token data';
        setState(prev => ({ ...prev, data: null, isLoading: false, error: errorMessage }));
        console.error('Error fetching token data:', err);
      }
    } finally {
      // Clean up pending call
      pendingCalls.delete(tokenAddress);
    }
  }, [tokenAddress]);

  useEffect(() => {
    fetchTokenData();
  }, [fetchTokenData]);

  // Cleanup effect to update current token ref
  useEffect(() => {
    currentTokenRef.current = tokenAddress;
  }, [tokenAddress]);

  const refetch = useCallback(async () => {
    if (tokenAddress) {
      // Clear cache for this token when manually refetching
      tokenDataCache.delete(tokenAddress);
      //console.log('Manual refetch: cleared cache for token:', tokenAddress);
    }
    await fetchTokenData();
  }, [fetchTokenData, tokenAddress]);

  return {
    ...state,
    refetch,
  };
}
