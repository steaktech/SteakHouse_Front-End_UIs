// hooks/useTokens.ts
import { useState, useEffect, useCallback } from 'react';
import { getFilteredTokens } from '@/app/lib/api/services/tokenService';
import { transformTokensToCardProps } from '@/app/lib/utils/tokenUtils';
import type { Token } from '@/app/types/token';
import type { TokenCardProps } from '@/app/components/TradingDashboard/types';

export interface TokenFilters {
  sortBy?: 'volume' | 'mcap' | 'age' | 'name';
  sortOrder?: 'asc' | 'desc';
  tokenType?: string;
  graduated?: boolean;
  minMarketCap?: number;
  maxMarketCap?: number;
  limit?: number;
}

export function useTokens(initialFilters: TokenFilters = {}) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokenCards, setTokenCards] = useState<TokenCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<TokenFilters>({
    sortBy: 'mcap',
    sortOrder: 'desc',
    limit: 20,
    ...initialFilters
  });

  const fetchTokens = useCallback(async (currentFilters: TokenFilters = filters) => {
    try {
      // Reset states on new fetch
      setIsLoading(true);
      setError(null);
      
      // Build URLSearchParams from filters
      const params = new URLSearchParams();
      
      if (currentFilters.sortBy) params.append('sortBy', currentFilters.sortBy);
      if (currentFilters.sortOrder) params.append('sortOrder', currentFilters.sortOrder);
      if (currentFilters.tokenType) params.append('tokenType', currentFilters.tokenType);
      if (currentFilters.graduated !== undefined) params.append('graduated', currentFilters.graduated.toString());
      if (currentFilters.minMarketCap) params.append('minMarketCap', currentFilters.minMarketCap.toString());
      if (currentFilters.maxMarketCap) params.append('maxMarketCap', currentFilters.maxMarketCap.toString());
      if (currentFilters.limit) params.append('limit', currentFilters.limit.toString());
      
      console.log('Fetching filtered tokens from API with params:', params.toString());
      const data = await getFilteredTokens(params);
      console.log('Received tokens:', data.length);
      
      setTokens(data);
      // Transform API data to card props
      const cardProps = transformTokensToCardProps(data);
      setTokenCards(cardProps);
    } catch (err) {
      console.error("Failed to fetch tokens:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // Update filters and refetch
  const updateFilters = useCallback((newFilters: Partial<TokenFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchTokens(updatedFilters);
  }, [filters, fetchTokens]);

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    fetchTokens();
  }, [fetchTokens]);

  // Quick filter functions
  const sortByVolume = useCallback(() => {
    updateFilters({ sortBy: 'volume', sortOrder: 'desc' });
  }, [updateFilters]);

  const sortByMarketCap = useCallback(() => {
    updateFilters({ sortBy: 'mcap', sortOrder: 'desc' });
  }, [updateFilters]);

  const sortByAge = useCallback(() => {
    updateFilters({ sortBy: 'age', sortOrder: 'asc' });
  }, [updateFilters]);

  const filterByType = useCallback((tokenType: string) => {
    updateFilters({ tokenType });
  }, [updateFilters]);

  const showOnlyGraduated = useCallback(() => {
    updateFilters({ graduated: true });
  }, [updateFilters]);

  const showAll = useCallback(() => {
    updateFilters({ graduated: undefined, tokenType: undefined });
  }, [updateFilters]);

  return { 
    tokens, 
    tokenCards, 
    isLoading, 
    error, 
    filters,
    refetch,
    updateFilters,
    sortByVolume,
    sortByMarketCap,
    sortByAge,
    filterByType,
    showOnlyGraduated,
    showAll
  };
}