// lib/api/services/ordersService.ts
import { apiClient } from '../client';
import { blockchainApiClient } from '../blockchainClient';
import type { GetLimitOrdersRequest, GetLimitOrdersResponse, CreateLimitOrderRequest, CreateLimitOrderResponse, CancelLimitOrderResponse } from '@/app/types/orders';

/**
 * Fetch user limit orders from backend using apiClient base URL
 * Note: Base already includes /api, so endpoint should be '/getLimitOrders'
 */
export async function getUserLimitOrders(payload: GetLimitOrdersRequest): Promise<GetLimitOrdersResponse> {
  if (!payload?.wallet) {
    throw new Error('wallet is required to fetch limit orders');
  }

  // Only include defined properties in body
  const body: Record<string, unknown> = { wallet: payload.wallet };
  if (payload.status) body.status = payload.status;
  if (payload.side) body.side = payload.side;
  if (payload.token_address) body.token_address = payload.token_address;
  if (typeof payload.offset === 'number') body.offset = payload.offset;
  if (typeof payload.limit === 'number') body.limit = payload.limit;
  if (payload.sort) body.sort = payload.sort;

  const res = await apiClient<GetLimitOrdersResponse>(`/getLimitOrders`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
  return res;
}

/**
 * Cancel an existing limit order
 * Endpoint: POST /limitOrders/{id}/cancel (blockchain base)
 */
export async function cancelLimitOrder(id: string, body?: { walletAddress?: string }): Promise<CancelLimitOrderResponse> {
  if (!id) throw new Error('order id is required');
  const payload = body && Object.keys(body).length > 0 ? body : { id };
  const res = await blockchainApiClient<CancelLimitOrderResponse>(`/limitOrders/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res;
}

/**
 * Create a new limit order using the blockchain API base client
 * Endpoint: POST /limitOrders/new
 */
export async function createLimitOrder(payload: CreateLimitOrderRequest): Promise<CreateLimitOrderResponse> {
  // Basic validation
  if (!payload?.tokenAddress) throw new Error('tokenAddress is required');
  if (!payload?.walletAddress) throw new Error('walletAddress is required');
  if (!payload?.side || (payload.side !== 'buy' && payload.side !== 'sell')) throw new Error('side must be "buy" or "sell"');
  const priceNum = typeof payload.limitPriceUsd === 'string' ? parseFloat(payload.limitPriceUsd) : payload.limitPriceUsd;
  const amtNum = typeof payload.amountTokens === 'string' ? parseFloat(payload.amountTokens) : payload.amountTokens;
  if (!priceNum || priceNum <= 0) throw new Error('limitPriceUsd must be > 0');
  if (!amtNum || amtNum <= 0) throw new Error('amountTokens must be > 0');

  const body = {
    tokenAddress: payload.tokenAddress,
    walletAddress: payload.walletAddress,
    side: payload.side,
    limitPriceUsd: String(priceNum),
    amountTokens: String(amtNum),
  };

  const res = await blockchainApiClient<CreateLimitOrderResponse>(`/limitOrders/new`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res;
}
