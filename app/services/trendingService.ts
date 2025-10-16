import { apiClient } from '@/app/lib/api/client';
import type { TrendingToken } from '@/app/types/token';

/**
 * API response interface for the trending endpoint
 */
export interface TrendingApiResponse {
  items: TrendingToken[];
}

/**
 * Service for fetching trending tokens data from the API
 */
export class TrendingService {
  /**
   * Fetches trending tokens from the API endpoint
   * @returns Promise with array of trending tokens
   * @throws Error if the API call fails
   */
  static async fetchTrendingTokens(): Promise<TrendingToken[]> {
    try {
      console.log('[TrendingService] Fetching trending tokens from API...');
      
      const response = await apiClient<TrendingApiResponse>('/trending');
      
      if (!response.items || !Array.isArray(response.items)) {
        console.error('[TrendingService] Invalid response format:', response);
        throw new Error('Invalid trending data format received from API');
      }

      console.log(`[TrendingService] Successfully fetched ${response.items.length} trending tokens`);
      
      // Ensure all items have the required structure
      const validatedTokens = response.items.map(token => ({
        token_address: token.token_address || '',
        trending_score: token.trending_score || 0,
        symbol: token.symbol || '',
        image_url: token.image_url || null,
        price_change_24h: token.price_change_24h !== undefined ? token.price_change_24h : null
      }));

      return validatedTokens;
    } catch (error) {
      console.error('[TrendingService] Failed to fetch trending tokens:', error);
      throw error;
    }
  }

  /**
   * Fetches trending tokens with retry logic
   * @param retries Number of retry attempts
   * @param delay Delay between retries in milliseconds
   * @returns Promise with array of trending tokens or empty array on failure
   */
  static async fetchWithRetry(retries = 3, delay = 1000): Promise<TrendingToken[]> {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.fetchTrendingTokens();
      } catch (error) {
        console.warn(`[TrendingService] Retry attempt ${i + 1} failed:`, error);
        
        if (i === retries - 1) {
          console.error('[TrendingService] All retry attempts exhausted');
          return []; // Return empty array instead of throwing
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
    
    return [];
  }
}