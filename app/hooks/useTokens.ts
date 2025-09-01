// hooks/useTokens.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { getFilteredTokens, getTokensByVolume, getTokensByMarketCap, getTokensByCategory, type CategoryType } from '@/app/lib/api/services/tokenService';
import { transformTokensToCardProps } from '@/app/lib/utils/tokenUtils';
import type { Token, PaginatedTokenResponse } from '@/app/types/token';
import type { TokenCardProps } from '@/app/components/TradingDashboard/types';

export interface TokenFilters {
  sortBy?: 'volume' | 'mcap' | 'age' | 'name';
  sortOrder?: 'asc' | 'desc';
  tokenType?: string;
  category?: CategoryType;
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

  // Use ref to track current filters to avoid dependency issues
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Track last API call to prevent rapid duplicate calls
  const lastCallRef = useRef<{
    timestamp: number;
    filters: string;
  } | null>(null);

  const fetchTokens = useCallback(async (currentFilters?: TokenFilters) => {
    try {
      // Use current filters state if no filters provided
      const filtersToUse = currentFilters || filtersRef.current;
      
      // Create a string representation of filters for duplicate detection
      const filtersString = JSON.stringify(filtersToUse);
      const now = Date.now();
      
      // Check if this is a duplicate call within 100ms
      if (lastCallRef.current && 
          now - lastCallRef.current.timestamp < 100 && 
          lastCallRef.current.filters === filtersString) {
        console.log('Skipping duplicate API call within 100ms:', filtersToUse);
        return;
      }
      
      // Update last call tracking
      lastCallRef.current = {
        timestamp: now,
        filters: filtersString
      };
      
      // Reset states on new fetch
      setIsLoading(true);
      setError(null);
      
      console.log('fetchTokens called with filters:', filtersToUse);
      
      // Check if this is a search filter operation (has search-specific filters but no sortBy/sortOrder)
      const isSearchFilter = !filtersToUse.sortBy && !filtersToUse.sortOrder && (
        filtersToUse.min_age_hours !== undefined ||
        filtersToUse.max_age_hours !== undefined ||
        filtersToUse.min_liquidity !== undefined ||
        filtersToUse.max_liquidity !== undefined ||
        filtersToUse.min_volume !== undefined ||
        filtersToUse.max_volume !== undefined ||
        filtersToUse.min_marketcap !== undefined ||
        filtersToUse.max_marketcap !== undefined ||
        filtersToUse.min_tax !== undefined ||
        filtersToUse.max_tax !== undefined ||
        filtersToUse.min_price_change !== undefined ||
        filtersToUse.max_price_change !== undefined
      );
      
      // Build URLSearchParams from filters
      const params = new URLSearchParams();
      
      // Only add sortBy and sortOrder for non-search operations and non-mcap/non-volume operations
      if (!isSearchFilter && filtersToUse.sortBy !== 'mcap' && filtersToUse.sortBy !== 'volume') {
        if (filtersToUse.sortBy) params.append('sortBy', filtersToUse.sortBy);
        if (filtersToUse.sortOrder) params.append('sortOrder', filtersToUse.sortOrder);
      }
      
      // Basic filters
      if (filtersToUse.tokenType) params.append('tokenType', filtersToUse.tokenType);
      if (filtersToUse.graduated !== undefined) params.append('graduated', filtersToUse.graduated.toString());
      if (filtersToUse.search) params.append('search', filtersToUse.search);
      
      // Age filters
      if (filtersToUse.min_age_hours !== undefined) params.append('min_age_hours', filtersToUse.min_age_hours.toString());
      if (filtersToUse.max_age_hours !== undefined) params.append('max_age_hours', filtersToUse.max_age_hours.toString());
      
      // Liquidity filters
      if (filtersToUse.min_liquidity !== undefined) params.append('min_liquidity', filtersToUse.min_liquidity.toString());
      if (filtersToUse.max_liquidity !== undefined) params.append('max_liquidity', filtersToUse.max_liquidity.toString());
      
      // Volume filters
      if (filtersToUse.min_volume !== undefined) params.append('min_volume', filtersToUse.min_volume.toString());
      if (filtersToUse.max_volume !== undefined) params.append('max_volume', filtersToUse.max_volume.toString());
      
      // Market cap filters (support both new and legacy formats)
      if (filtersToUse.min_marketcap !== undefined) params.append('min_marketcap', filtersToUse.min_marketcap.toString());
      if (filtersToUse.max_marketcap !== undefined) params.append('max_marketcap', filtersToUse.max_marketcap.toString());
      if (filtersToUse.minMarketCap !== undefined) params.append('min_marketcap', filtersToUse.minMarketCap.toString());
      if (filtersToUse.maxMarketCap !== undefined) params.append('max_marketcap', filtersToUse.maxMarketCap.toString());
      
      // Tax filters
      if (filtersToUse.min_tax !== undefined) params.append('min_tax', filtersToUse.min_tax.toString());
      if (filtersToUse.max_tax !== undefined) params.append('max_tax', filtersToUse.max_tax.toString());
      
      // Price change filters
      if (filtersToUse.min_price_change !== undefined) params.append('min_price_change', filtersToUse.min_price_change.toString());
      if (filtersToUse.max_price_change !== undefined) params.append('max_price_change', filtersToUse.max_price_change.toString());
      
      // Pagination
      if (filtersToUse.limit) params.append('page_size', filtersToUse.limit.toString());
      if (filtersToUse.page) params.append('page', filtersToUse.page.toString());
      
      let response: PaginatedTokenResponse;
      
      // For category filters, use the category API endpoint
      if (filtersToUse.category) {
        console.log('Fetching tokens by category from API:', filtersToUse.category, 'with params:', params.toString());
        
        // Convert URLSearchParams to CategoryParams for the category API
        const categoryParams = {
          page: filtersToUse.page,
          pageSize: filtersToUse.limit,
          sortBy: filtersToUse.sortBy === 'age' ? 'created_at_timestamp' as const :
                  filtersToUse.sortBy === 'mcap' ? 'circulating_supply' as const :
                  filtersToUse.sortBy === 'volume' ? 'eth_pool' as const :
                  'inserted_at' as const
        };
        
        response = await getTokensByCategory(filtersToUse.category, categoryParams);
      }
      // For search filters, always use getFilteredTokens
      // For regular filters, use specific endpoints based on sortBy
      else if (isSearchFilter) {
        console.log('Fetching filtered tokens from API with params:', params.toString());
        response = await getFilteredTokens(params);
      } else if (filtersToUse.sortBy === 'volume') {
        console.log('Fetching tokens by volume from API with params:', params.toString());
        response = await getTokensByVolume(params);
      } else if (filtersToUse.sortBy === 'mcap') {
        console.log('Fetching tokens by market cap from API with params:', params.toString());
        response = await getTokensByMarketCap(params);
      } else {
        console.log('Fetching filtered tokens from API with params:', params.toString());
        response = await getFilteredTokens(params);
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
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [filters, fetchTokens]);

  // Update filters and refetch
  const updateFilters = useCallback((newFilters: Partial<TokenFilters>) => {
    const updatedFilters = { ...filtersRef.current, ...newFilters };
    setFilters(updatedFilters);
    // Don't call fetchTokens here - let the useEffect handle it when filters change
  }, []);

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

  const filterByCategory = useCallback((category: CategoryType) => {
    updateFilters({ category, page: 1 });
  }, [updateFilters]);

  const showOnlyGraduated = useCallback(() => {
    updateFilters({ graduated: true, page: 1 });
  }, [updateFilters]);

  const showAll = useCallback(() => {
    updateFilters({ graduated: undefined, tokenType: undefined, category: undefined, page: 1 });
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
    // Don't call fetchTokens here - let the useEffect handle it when filters change
  }, []);

  // Clear all filters function - resets to default dashboard state
  const clearAllFilters = useCallback(() => {
    const defaultFilters = {
      sortBy: 'mcap' as const,
      sortOrder: 'desc' as const,
      limit: 20,
      page: 1,
    };
    setFilters(defaultFilters);
    // Don't call fetchTokens here - let the useEffect handle it when filters change
  }, []);

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
    filterByCategory,
    showOnlyGraduated,
    showAll,
    applySearchFilters,
    clearAllFilters,
    goToPage,
    nextPage,
    previousPage
  };
}