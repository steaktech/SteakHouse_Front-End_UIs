// lib/api/services/holdersService.ts
import { blockchainApiClient } from '../blockchainClient';
import type { 
  HoldersApiResponse, 
  HoldersApiParams,
  HoldersWidgetDataset,
  ProcessedHolderForWidget,
  TokenDataForWidget
} from '@/app/types/holders';

/**
 * Service for holders-related API calls
 * Following the existing codebase patterns for API services
 */

/**
 * Fetches holder information for a given token
 * @param tokenAddress - The token contract address (e.g., '0x123...')
 * @param params - Optional query parameters for pagination and batching
 * @returns Promise<HoldersApiResponse> - The holders data from the API
 * @throws Error if the API call fails or returns an error
 */
export async function getTokenHolders(
  tokenAddress: string, 
  params?: HoldersApiParams
): Promise<HoldersApiResponse> {
  console.log('getTokenHolders API call for:', tokenAddress, { params });
  
  if (!tokenAddress) {
    throw new Error('Token address is required');
  }

  // Validate token address format (basic check for 0x prefix and length)
  if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
    throw new Error(`Invalid token address format: ${tokenAddress}`);
  }

  // Build query string if params are provided
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());
  if (params?.batch) queryParams.append('batch', params.batch.toString());
  
  const queryString = queryParams.toString();
  const endpoint = `/holders/${tokenAddress}${queryString ? `?${queryString}` : ''}`;

  try {
    const result = await blockchainApiClient<HoldersApiResponse>(endpoint);
    console.log('getTokenHolders success for:', tokenAddress);
    return result;
  } catch (error) {
    console.error('getTokenHolders error for:', tokenAddress, error);
    throw error;
  }
}

/**
 * Transforms the API response into the format expected by the SteakHoldersWidget
 * @param apiResponse - The raw API response
 * @returns HoldersWidgetDataset - Processed data for the widget
 */
export function transformHoldersDataForWidget(apiResponse: HoldersApiResponse): HoldersWidgetDataset {
  console.log('Transforming holders data for widget:', apiResponse.token);

  // Prefer tokenName/tokenSymbol if provided by API; fall back to N/A
  const tokenData: TokenDataForWidget = {
    name: apiResponse.tokenName ?? "N/A",
    symbol: apiResponse.tokenSymbol ?? "N/A",
    chain: "N/A", // Not provided by API
    address: apiResponse.token,
    priceUSD: 0, // Not provided by API (UI will show N/A)
    totalSupply: parseFloat(apiResponse.supply.circulatingTokens)
  };

  // Transform holders data
  const processedHolders: ProcessedHolderForWidget[] = apiResponse.holders.map((holder) => ({
    address: holder.address,
    label: 'normal' as const, // Default to normal; API does not provide labels
    tx: 0, // Not provided by API (UI will show N/A)
    balance: parseFloat(holder.balanceTokens),
    percent: holder.pctOfCirculating,
    valueUSD: 0 // Not provided by API (UI will show N/A)
  }));

  return {
    token: tokenData,
    holders: processedHolders
  };
}

/**
 * Convenience function that fetches and transforms holders data in one call
 * @param tokenAddress - The token contract address
 * @param params - Optional query parameters
 * @returns Promise<HoldersWidgetDataset> - Ready-to-use data for the widget
 */
export async function getProcessedHoldersData(
  tokenAddress: string,
  params?: HoldersApiParams
): Promise<HoldersWidgetDataset> {
  console.log('getProcessedHoldersData called for:', tokenAddress);
  
  try {
    const apiResponse = await getTokenHolders(tokenAddress, params);
    const processedData = transformHoldersDataForWidget(apiResponse);
    
    console.log('getProcessedHoldersData success for:', tokenAddress, {
      holdersCount: processedData.holders.length,
      tokenAddress: processedData.token.address,
      totalSupply: processedData.token.totalSupply
    });
    
    return processedData;
  } catch (error) {
    console.error('getProcessedHoldersData error for:', tokenAddress, error);
    throw error;
  }
}

/**
 * Default parameters for the holders API call
 */
export const DEFAULT_HOLDERS_PARAMS: HoldersApiParams = {
  limit: 1000,
  offset: 0,
  batch: 20
};

