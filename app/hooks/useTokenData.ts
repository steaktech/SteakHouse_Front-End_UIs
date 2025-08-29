import { useState, useEffect, useCallback } from 'react';
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

export function useTokenData(tokenAddress: string | null): UseTokenDataReturn {
  const [state, setState] = useState<UseTokenDataState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchTokenData = useCallback(async () => {
    if (!tokenAddress) {
      setState(prev => ({ ...prev, data: null, isLoading: false, error: null }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await getFullTokenData(tokenAddress);
      setState(prev => ({ ...prev, data: response, isLoading: false, error: null }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch token data';
      setState(prev => ({ ...prev, data: null, isLoading: false, error: errorMessage }));
      console.error('Error fetching token data:', err);
    }
  }, [tokenAddress]);

  useEffect(() => {
    fetchTokenData();
  }, [fetchTokenData]);

  const refetch = useCallback(async () => {
    await fetchTokenData();
  }, [fetchTokenData]);

  return {
    ...state,
    refetch,
  };
}
