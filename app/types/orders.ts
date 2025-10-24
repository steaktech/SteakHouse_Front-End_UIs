// types/orders.ts

export type RawOrderStatus = 'active' | 'pending' | 'filled' | 'canceled' | 'cancelled' | 'failed';
export type RawOrderSide = 'buy' | 'sell';

export interface LimitOrderApiOrder {
  id: string;
  token_address: string;
  wallet_address: string;
  side: RawOrderSide;
  limit_price_usd: string; // decimal string
  amount_tokens: string; // decimal string
  status: RawOrderStatus;
  tx_hash: string | null;
  last_error: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface GetLimitOrdersResponse {
  wallet: string;
  total: number;
  limit: number;
  offset: number;
  sort: 'asc' | 'desc';
  orders: LimitOrderApiOrder[];
}

export interface GetLimitOrdersRequest {
  wallet: string;
  // Optional filters
  status?: RawOrderStatus;
  side?: RawOrderSide;
  token_address?: string;
  // Pagination/sorting (if supported by API now or in future)
  offset?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
}

// Create limit order types (blockchain API)
export interface CreateLimitOrderRequest {
  tokenAddress: string;
  walletAddress: string; // main wallet address
  side: 'buy' | 'sell';
  limitPriceUsd: string | number;
  amountTokens: string | number; // tokens for sell; ETH amount for buy per API contract
}

export interface CreateLimitOrderResponse {
  id?: string;
  status?: string;
  message?: string;
  txHash?: string | null;
  order?: any;
  [key: string]: any;
}
