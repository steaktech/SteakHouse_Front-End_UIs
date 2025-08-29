// hooks/useTokens.ts
import { useState, useEffect, useCallback } from 'react';
import { getFilteredTokens, getTokensByVolume } from '@/app/lib/api/services/tokenService';
import { transformTokensToCardProps } from '@/app/lib/utils/tokenUtils';
import type { Token, PaginatedTokenResponse } from '@/app/types/token';
import type { TokenCardProps } from '@/app/components/TradingDashboard/types';

export interface TokenFilters {
  sortBy?: 'volume' | 'mcap' | 'age' | 'name';
  sortOrder?: 'asc' | 'desc';
  tokenType?: string;
  graduated?: boolean;
  
  // Age filters (in hours)
  min_age_hours?: number;
  max_age_hours?: number;
  
  // Liquidity filters
  min_liquidity?: number;
  max_liquidity?: number;
  
  // Volume filters
  min_volume?: number;
  max_volume?: number;
  
  // Market cap filters
  min_marketcap?: number;
  max_marketcap?: number;
  minMarketCap?: number; // Keep for backward compatibility
  maxMarketCap?: number; // Keep for backward compatibility
  
  // Tax filters (in percentage)
  min_tax?: number;
  max_tax?: number;
  
  // Price change filters (in percentage)
  min_price_change?: number;
  max_price_change?: number;
  
  // Pagination
  limit?: number;
  page?: number;
  
  // Search term
  search?: string;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function useTokens(initialFilters: TokenFilters = {}) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tokenCards, setTokenCards] = useState<TokenCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<TokenFilters>({
    sortBy: 'mcap',
    sortOrder: 'desc',
    limit: 20,
    page: 1,
    ...initialFilters
  });

  const fetchTokens = useCallback(async (currentFilters: TokenFilters = filters) => {
    try {
      // Reset states on new fetch
      setIsLoading(true);
      setError(null);
      
      // Check if this is a search filter operation (has search-specific filters but no sortBy/sortOrder)
      const isSearchFilter = !currentFilters.sortBy && !currentFilters.sortOrder && (
        currentFilters.min_age_hours !== undefined ||
        currentFilters.max_age_hours !== undefined ||
        currentFilters.min_liquidity !== undefined ||
        currentFilters.max_liquidity !== undefined ||
        currentFilters.min_volume !== undefined ||
        currentFilters.max_volume !== undefined ||
        currentFilters.min_marketcap !== undefined ||
        currentFilters.max_marketcap !== undefined ||
        currentFilters.min_tax !== undefined ||
        currentFilters.max_tax !== undefined ||
        currentFilters.min_price_change !== undefined ||
        currentFilters.max_price_change !== undefined
      );
      
      // Build URLSearchParams from filters
      const params = new URLSearchParams();
      
      // Only add sortBy and sortOrder for non-search operations
      if (!isSearchFilter) {
        if (currentFilters.sortBy) params.append('sortBy', currentFilters.sortBy);
        if (currentFilters.sortOrder) params.append('sortOrder', currentFilters.sortOrder);
      }
      
      // Basic filters
      if (currentFilters.tokenType) params.append('tokenType', currentFilters.tokenType);
      if (currentFilters.graduated !== undefined) params.append('graduated', currentFilters.graduated.toString());
      if (currentFilters.search) params.append('search', currentFilters.search);
      
      // Age filters
      if (currentFilters.min_age_hours !== undefined) params.append('min_age_hours', currentFilters.min_age_hours.toString());
      if (currentFilters.max_age_hours !== undefined) params.append('max_age_hours', currentFilters.max_age_hours.toString());
      
      // Liquidity filters
      if (currentFilters.min_liquidity !== undefined) params.append('min_liquidity', currentFilters.min_liquidity.toString());
      if (currentFilters.max_liquidity !== undefined) params.append('max_liquidity', currentFilters.max_liquidity.toString());
      
      // Volume filters
      if (currentFilters.min_volume !== undefined) params.append('min_volume', currentFilters.min_volume.toString());
      if (currentFilters.max_volume !== undefined) params.append('max_volume', currentFilters.max_volume.toString());
      
      // Market cap filters (support both new and legacy formats)
      if (currentFilters.min_marketcap !== undefined) params.append('min_marketcap', currentFilters.min_marketcap.toString());
      if (currentFilters.max_marketcap !== undefined) params.append('max_marketcap', currentFilters.max_marketcap.toString());
      if (currentFilters.minMarketCap !== undefined) params.append('min_marketcap', currentFilters.minMarketCap.toString());
      if (currentFilters.maxMarketCap !== undefined) params.append('max_marketcap', currentFilters.maxMarketCap.toString());
      
      // Tax filters
      if (currentFilters.min_tax !== undefined) params.append('min_tax', currentFilters.min_tax.toString());
      if (currentFilters.max_tax !== undefined) params.append('max_tax', currentFilters.max_tax.toString());
      
      // Price change filters
      if (currentFilters.min_price_change !== undefined) params.append('min_price_change', currentFilters.min_price_change.toString());
      if (currentFilters.max_price_change !== undefined) params.append('max_price_change', currentFilters.max_price_change.toString());
      
      // Pagination
      if (currentFilters.limit) params.append('page_size', currentFilters.limit.toString());
      if (currentFilters.page) params.append('page', currentFilters.page.toString());
      
      let response: PaginatedTokenResponse;
      
      // For search filters, always use getFilteredTokens
      // For regular filters, use volume endpoint if sorting by volume
      if (isSearchFilter || currentFilters.sortBy !== 'volume') {
        console.log('Fetching filtered tokens from API with params:', params.toString());
        response = await getFilteredTokens(params);
      } else {
        console.log('Fetching tokens by volume from API with params:', params.toString());
        response = await getTokensByVolume(params);
      }
      
      console.log('Received paginated response:', response);
      
      // Update pagination info
      setPagination({
        currentPage: response.page,
        pageSize: response.page_size,
        totalCount: response.total_count,
        totalPages: response.total_pages
      });
      
      setTokens(response.items);
      // Transform API data to card props
      const cardProps = transformTokensToCardProps(response.items);
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
    updateFilters({ sortBy: 'volume', sortOrder: 'desc', page: 1 });
  }, [updateFilters]);

  const sortByMarketCap = useCallback(() => {
    updateFilters({ sortBy: 'mcap', sortOrder: 'desc', page: 1 });
  }, [updateFilters]);

  const sortByAge = useCallback(() => {
    updateFilters({ sortBy: 'age', sortOrder: 'asc', page: 1 });
  }, [updateFilters]);

  const filterByType = useCallback((tokenType: string) => {
    updateFilters({ tokenType, page: 1 });
  }, [updateFilters]);

  const showOnlyGraduated = useCallback(() => {
    updateFilters({ graduated: true, page: 1 });
  }, [updateFilters]);

  const showAll = useCallback(() => {
    updateFilters({ graduated: undefined, tokenType: undefined, page: 1 });
  }, [updateFilters]);

  // Search function - replaces existing filters with search filters only
  const applySearchFilters = useCallback((searchFilters: Partial<TokenFilters>) => {
    // Create a clean filter object with only search-related filters and pagination
    const cleanSearchFilters: TokenFilters = {
      limit: 20,
      page: 1,
      ...searchFilters
    };
    
    setFilters(cleanSearchFilters);
    fetchTokens(cleanSearchFilters);
  }, [fetchTokens]);

  // Clear all filters function - resets to default dashboard state
  const clearAllFilters = useCallback(() => {
    const defaultFilters = {
      sortBy: 'mcap' as const,
      sortOrder: 'desc' as const,
      limit: 20,
      page: 1,
    };
    setFilters(defaultFilters);
    fetchTokens(defaultFilters);
  }, [fetchTokens]);

  // Pagination functions
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      updateFilters({ page });
    }
  }, [updateFilters, pagination.totalPages]);

  const nextPage = useCallback(() => {
    if (pagination.currentPage < pagination.totalPages) {
      goToPage(pagination.currentPage + 1);
    }
  }, [goToPage, pagination.currentPage, pagination.totalPages]);

  const previousPage = useCallback(() => {
    if (pagination.currentPage > 1) {
      goToPage(pagination.currentPage - 1);
    }
  }, [goToPage, pagination.currentPage]);

  return { 
    tokens, 
    tokenCards, 
    isLoading, 
    error, 
    filters,
    pagination,
    refetch,
    updateFilters,
    sortByVolume,
    sortByMarketCap,
    sortByAge,
    filterByType,
    showOnlyGraduated,
    showAll,
    applySearchFilters,
    clearAllFilters,
    goToPage,
    nextPage,
    previousPage
  };
}