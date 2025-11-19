// hooks/useRecentTrades.ts

import { useMemo } from 'react';
import { useTokenData } from './useTokenData';
import { formatTradesForUI, type FormattedTrade } from '@/app/lib/utils/tradeUtils';

interface UseRecentTradesProps {
  tokenAddress: string | null;
  maxTrades?: number;
}

interface UseRecentTradesReturn {
  trades: FormattedTrade[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing recent trades data with formatting
 * Leverages the existing useTokenData hook and formats trades for UI display
 */
export function useRecentTrades({ 
  tokenAddress, 
  maxTrades = 10 
}: UseRecentTradesProps): UseRecentTradesReturn {
  const { data, isLoading, error, refetch } = useTokenData(tokenAddress);

  // Format trades for UI consumption
  const formattedTrades = useMemo(() => {
    // Handle both 'recentTrades' and 'trades' field names for backward compatibility
    const tradesArray = (data as any)?.recentTrades || (data as any)?.trades;
    if (!tradesArray) {
      return [];
    }

    // Take only the requested number of trades and format them
    const limitedTrades = tradesArray.slice(0, maxTrades);
    return formatTradesForUI(limitedTrades);
  }, [data, maxTrades]);

  return {
    trades: formattedTrades,
    isLoading,
    error,
    refetch
  };
}