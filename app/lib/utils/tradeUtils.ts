// lib/utils/tradeUtils.ts

import type { Trade } from '@/app/types/token';

export interface FormattedTrade {
  type: 'Buy' | 'Sell';
  amount: string;
  ethAmount: string;
  price: string;
  time: string;
  fullDate: string;
  address: string;
  txHash: string;
  positive: boolean;
}

/**
 * Formats a timestamp to relative time (e.g., "2m ago")
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return `${Math.max(1, seconds)}s ago`;
  }
}

/**
 * Formats a timestamp to full date string
 */
export function formatFullDate(timestamp: number): string {
  return new Date(timestamp).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

/**
 * Formats token amounts with appropriate units (K for thousands, M for millions)
 */
export function formatTokenAmount(amount: number, symbol: string = ''): string {
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1000000) {
    const millions = (amount / 1000000).toFixed(1);
    return `${millions}M ${symbol}`.trim();
  } else if (absAmount >= 1000) {
    const thousands = (amount / 1000).toFixed(1);
    return `${thousands}K ${symbol}`.trim();
  } else {
    return `${amount.toLocaleString()} ${symbol}`.trim();
  }
}

/**
 * Formats ETH amounts with appropriate precision
 */
export function formatEthAmount(amount: number): string {
  if (amount >= 1) {
    return `${amount.toFixed(4)} ETH`;
  } else {
    return `${amount.toFixed(6)} ETH`;
  }
}

/**
 * Formats USD price values
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (numPrice >= 1) {
    return `$${numPrice.toFixed(2)}`;
  } else if (numPrice >= 0.01) {
    return `$${numPrice.toFixed(4)}`;
  } else {
    return `$${numPrice.toFixed(6)}`;
  }
}

/**
 * Converts API Trade objects to the format expected by the UI
 */
export function formatTradesForUI(trades: Trade[]): FormattedTrade[] {
  return trades.map(trade => ({
    type: trade.type === 'BUY' ? 'Buy' : 'Sell',
    amount: formatTokenAmount(trade.amountTokens, trade.symbol?.replace('$', '') || ''),
    ethAmount: formatEthAmount(trade.amountEth),
    price: formatPrice(trade.price),
    time: formatTimeAgo(trade.timestamp),
    fullDate: formatFullDate(trade.timestamp),
    address: trade.trader,
    txHash: trade.txHash,
    positive: trade.type === 'BUY'
  }));
}

/**
 * Truncates an address to show first 6 and last 4 characters
 */
export function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}