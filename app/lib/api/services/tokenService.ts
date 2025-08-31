// lib/api/services/tokenService.ts
import { apiClient } from '../client';
import type { Token, Candle, Trade, PaginatedTokenResponse, FullTokenDataResponse } from '@/app/types/token';

type ApiResponse<T> = T | { error: string };

/**
 * Fetches tokens with filters applied - now returns paginated response.
 * [cite_start]GET /filteredTokens [cite: 182-192]
 */
export async function getFilteredTokens(params: URLSearchParams): Promise<PaginatedTokenResponse> {
  return apiClient<PaginatedTokenResponse>(`/filteredTokens?${params.toString()}`);
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
 * [cite_start]GET /api/token/:address/full [cite: 436]
 */
export async function getFullTokenData(address: string, interval = '1m', limit = 100): Promise<FullTokenDataResponse> {
  return apiClient<FullTokenDataResponse>(`/token/${address}/full?interval=${interval}&limit=${limit}`);
}

/**
 * Fetches only the chart data for a token.
 * [cite_start]GET /api/token/:address/chart [cite: 462]
 */
export async function getChartData(address: string, timeframe = '1m', limit = 100): Promise<{ token: string; candles: Candle[] }> {
  return apiClient<{ token: string; candles: Candle[] }>(`/token/${address}/chart?timeframe=${timeframe}&limit=${limit}`);
}