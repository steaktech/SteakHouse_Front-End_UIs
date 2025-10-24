'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getUserLimitOrders } from '@/app/lib/api/services/ordersService';
import type { GetLimitOrdersResponse, LimitOrderApiOrder, RawOrderStatus, RawOrderSide } from '@/app/types/orders';
import type { LimitOrder, OrderStatus } from '@/app/components/TradingChart/types';
import { useWallet } from './useWallet';

export type UseLimitOrdersOptions = {
  wallet?: string | null;
  status?: 'all' | RawOrderStatus;
  side?: 'all' | RawOrderSide;
  tokenAddress?: string;
  offset?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  pollIntervalMs?: number; // optional polling
};

export interface UseLimitOrdersState {
  data: LimitOrder[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

export interface UseLimitOrdersReturn extends UseLimitOrdersState {
  refetch: () => Promise<void>;
}

function mapStatusToUi(status: RawOrderStatus): OrderStatus {
  switch (status) {
    case 'active':
    case 'pending':
      return 'pending';
    case 'filled':
      return 'filled';
    case 'canceled':
    case 'cancelled':
      return 'cancelled';
    case 'failed':
      return 'failed';
    default:
      return 'pending';
  }
}

function mapApiOrderToUi(order: LimitOrderApiOrder): LimitOrder {
  const price = parseFloat(order.limit_price_usd || '0');
  const amount = parseFloat(order.amount_tokens || '0');
  const statusUi = mapStatusToUi(order.status);
  const filled = statusUi === 'filled' ? amount : 0;
  const remaining = Math.max(0, amount - filled);

  return {
    id: order.id,
    type: 'limit',
    side: order.side,
    price,
    amount,
    filled,
    remaining,
    status: statusUi,
    timeInForce: 'GTC',
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    estimatedTotal: price * amount,
    symbol: '', // not provided by API; left empty
  };
}


export function useLimitOrders(options: UseLimitOrdersOptions = {}): UseLimitOrdersReturn {
  const { address: mainWallet } = useWallet();
  const [state, setState] = useState<UseLimitOrdersState>({ data: [], total: 0, isLoading: false, error: null });
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refetch = useCallback(async () => {
    const wallet = options.wallet ?? mainWallet ?? null;
    if (!wallet) {
      setState({ data: [], total: 0, isLoading: false, error: null });
      return;
    }

    // Build request payload
    const payload: any = { wallet };
    if (options.status && options.status !== 'all') payload.status = options.status;
    if (options.side && options.side !== 'all') payload.side = options.side;
    if (options.tokenAddress) payload.token_address = options.tokenAddress;
    if (typeof options.offset === 'number') payload.offset = options.offset;
    if (typeof options.limit === 'number') payload.limit = options.limit;
    if (options.sort) payload.sort = options.sort;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await getUserLimitOrders(payload);
      const mapped = (res.orders || []).map(mapApiOrderToUi);
      setState({ data: mapped, total: res.total ?? mapped.length, isLoading: false, error: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch limit orders';
      setState({ data: [], total: 0, isLoading: false, error: msg });
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, [mainWallet, options.wallet, options.status, options.side, options.tokenAddress, options.offset, options.limit, options.sort]);

  useEffect(() => {
    refetch();
    return () => abortRef.current?.abort();
  // Trigger on concrete option values to avoid function identity churn
  }, [refetch]);

  // Optional polling
  useEffect(() => {
    if (!options.pollIntervalMs) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { refetch(); }, options.pollIntervalMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [options.pollIntervalMs, refetch]);

  return useMemo(() => ({ ...state, refetch }), [state, refetch]);
}