import { useCallback, useEffect, useState } from 'react';
import { fetchUserTokenPosition, type UserPositionApiItem } from '@/app/lib/api/services/userService';

export interface UseUserTokenPositionResult {
  data: UserPositionApiItem | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Loads a user's position for a specific token using the shared api client.
 * Provide the trading wallet address (not the EOA) when available.
 */
export function useUserTokenPosition(wallet: string | null, tokenAddress?: string): UseUserTokenPositionResult {
  const [data, setData] = useState<UserPositionApiItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!wallet || !tokenAddress) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchUserTokenPosition(wallet, tokenAddress);
      setData(result ?? null);
    } catch (e: any) {
      setData(null);
      setError(e?.message || 'Failed to load position');
    } finally {
      setIsLoading(false);
    }
  }, [wallet, tokenAddress]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
