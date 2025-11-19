// lib/api/services/tokenService.ts
import { apiClient } from '../client';
import type { Token, Candle, Trade, PaginatedTokenResponse, FullTokenDataResponse } from '@/app/types/token';
import { getTokensByCategory, type CategoryType, type CategoryParams } from './categoryService';

type ApiResponse<T> = T | { error: string };

/**
 * Fetches tokens with filters applied - now returns paginated response.
 * [cite_start]GET /filteredTokens [cite: 182-192]
 */
export async function getFilteredTokens(params: URLSearchParams): Promise<PaginatedTokenResponse> {
  return apiClient<PaginatedTokenResponse>(`/filteredTokens?${params.toString()}`);
}

/**
 * Preset: tokens sorted by newest age (created_at_timestamp desc).
 * GET /filtered/age?page=&page_size=
 */
export async function getTokensByAge(params?: URLSearchParams): Promise<PaginatedTokenResponse> {
  const queryString = params ? `?${params.toString()}` : '';
  return apiClient<PaginatedTokenResponse>(`/filtered/age${queryString}`);
}

/**
 * Preset: tokens sorted by lowest tax rate (asc).
 * GET /filtered/tax?page=&page_size=
 */
export async function getTokensByTax(params?: URLSearchParams): Promise<PaginatedTokenResponse> {
  const queryString = params ? `?${params.toString()}` : '';
  return apiClient<PaginatedTokenResponse>(`/filtered/tax${queryString}`);
}

/**
 * Fetches all tokens (base fields only).
 * [cite_start]GET /all-tokens [cite: 247-249]
 */
export async function getAllTokens(): Promise<Token[]> {
  return apiClient<Token[]>('/all-tokens');
}

/**
 * Fetches all tokens ranked by 24h volume - now returns paginated response.
 * [cite_start]GET /all-tokens-by-volume [cite: 299-301]
 */
export async function getTokensByVolume(params?: URLSearchParams): Promise<PaginatedTokenResponse> {
  const queryString = params ? `?${params.toString()}` : '';
  return apiClient<PaginatedTokenResponse>(`/all-tokens-by-volume${queryString}`);
}

/**
 * Fetches all tokens ranked by market cap - now returns paginated response.
 * [cite_start]GET /filtered/mcap [cite: 302-304]
 */
export async function getTokensByMarketCap(params?: URLSearchParams): Promise<PaginatedTokenResponse> {
  const queryString = params ? `?${params.toString()}` : '';
  return apiClient<PaginatedTokenResponse>(`/filtered/mcap${queryString}`);
}

/**
 * Fetches the complete data set for a single token page.
 * Now uses /info endpoint for token data and /chart endpoint for candles.
 */
export async function getFullTokenData(address: string, interval = '1m', limit = 100): Promise<FullTokenDataResponse> {
  console.log('getFullTokenData API call for:', address, { interval, limit });
  try {
    // Fetch token info and chart data in parallel
    const [infoData, chartData] = await Promise.all([
      apiClient<{
        token: string;
        tokenInfo: FullTokenDataResponse['tokenInfo'];
        price: number;
        marketCap: number;
        volume24h?: number;
        priceChange24h?: number;
        lastTrade: FullTokenDataResponse['lastTrade'];
        recentTrades: FullTokenDataResponse['recentTrades'];
      }>(`/token/${address}/info`),
      apiClient<{ token: string; candles: FullTokenDataResponse['candles'] }>(`/token/${address}/chart?timeframe=${interval}&limit=${limit}`)
    ]);

    // Derive 24h stats from infoData when available
    const volume24h =
      typeof infoData.volume24h === 'number'
        ? infoData.volume24h
        : undefined;

    const priceChange24h =
      typeof infoData.priceChange24h === 'number'
        ? infoData.priceChange24h
        : typeof infoData.tokenInfo?.price_change_24h === 'number'
        ? infoData.tokenInfo.price_change_24h
        : undefined;

    // Merge the results to maintain backward compatibility
    const result: FullTokenDataResponse = {
      token: infoData.token,
      tokenInfo: infoData.tokenInfo,
      price: infoData.price,
      marketCap: infoData.marketCap,
      volume24h,
      priceChange24h,
      lastTrade: infoData.lastTrade,
      recentTrades: infoData.recentTrades,
      candles: chartData.candles,
      interval,
    };

    console.log('getFullTokenData success for:', address, result);
    return result;
  } catch (error) {
    console.error('getFullTokenData error for:', address, error);
    throw error;
  }
}

/**
 * Fetches only the chart data for a token.
 * [cite_start]GET /api/token/:address/chart [cite: 462]
 */
export async function getChartData(address: string, timeframe = '1m', limit = 100): Promise<{ token: string; candles: Candle[] }> {
  return apiClient<{ token: string; candles: Candle[] }>(`/token/${address}/chart?timeframe=${timeframe}&limit=${limit}`);
}

// Re-export category service functions for easier imports
export { getTokensByCategory, type CategoryType, type CategoryParams } from './categoryService';

/**
 * Searches tokens by name. Returns a paginated response.
 * GET /api/filtered/:name
 */
export async function searchTokensByName(name: string, page = 1, pageSize = 10): Promise<PaginatedTokenResponse> {
  const endpoint = `/filtered/${encodeURIComponent(name)}?page=${page}&page_size=${pageSize}`;
  const res = await apiClient<any>(endpoint);

  // Adapt backend pagination to our standard shape
  const totalPages = Number(res?.total_pages ?? 0);
  const currentPage = Number(res?.page ?? page);
  const size = Number(res?.page_size ?? pageSize);

  return {
    page: currentPage,
    page_size: size,
    has_more: totalPages ? currentPage < totalPages : false,
    next_page: totalPages && currentPage < totalPages ? currentPage + 1 : null,
    prev_page: currentPage > 1 ? currentPage - 1 : null,
    items: (res?.items ?? []) as Token[],
  };
}
