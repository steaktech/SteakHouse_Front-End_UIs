// types/holders.ts
/**
 * TypeScript types for the Holders API response
 * Based on the API specification provided
 */

export interface HolderApiData {
  address: string;
  balanceRaw: string;
  balanceTokens: string;
  pctOfCirculating: number;
}

export interface HoldersApiCounts {
  buyers: number;
  uniqueAddresses: number;
  holders: number;
}

export interface HoldersApiSupply {
  circulatingRaw: string;
  circulatingTokens: string;
}

export interface HoldersApiTotals {
  totalHeldRaw: string;
  totalHeldTokens: string;
  pctOfCirculating: number;
}

export interface HoldersApiTop10 {
  addresses: HolderApiData[];
  totalRaw: string;
  totalTokens: string;
  pctOfCirculating: number;
}

export interface HoldersApiPage {
  offset: number;
  limit: number;
  returned: number;
}

/**
 * Complete API response structure for GET /holders/:token
 */
export interface HoldersApiResponse {
  token: string;
  counts: HoldersApiCounts;
  supply: HoldersApiSupply;
  totals: HoldersApiTotals;
  top10: HoldersApiTop10;
  page: HoldersApiPage;
  holders: HolderApiData[];
}

/**
 * Query parameters for the holders API endpoint
 */
export interface HoldersApiParams {
  limit?: number;
  offset?: number;
  batch?: number;
}

/**
 * Processed holder data for the widget (transformed from API response)
 */
export interface ProcessedHolderForWidget {
  address: string;
  label: 'burn' | 'contract' | 'exchange' | 'team' | 'normal';
  tx: number; // Will be N/A for now
  balance: number;
  percent: number;
  valueUSD: number; // Will be N/A for now
}

/**
 * Token data for the widget (with missing data marked as N/A)
 */
export interface TokenDataForWidget {
  name: string; // Will be "N/A" for now
  symbol: string; // Will be "N/A" for now
  chain: string; // Will be "N/A" for now
  address: string;
  priceUSD: number; // Will be 0 for now (N/A)
  totalSupply: number;
}

/**
 * Complete dataset for the widget after processing API response
 */
export interface HoldersWidgetDataset {
  token: TokenDataForWidget;
  holders: ProcessedHolderForWidget[];
}

