// lib/user/tradingWalletCache.ts
'use client';

import { fetchUserProfile } from '@/app/lib/api/services/userService';

export type TradingWalletCacheValue = {
  address: string;
  version: number;
  savedAt: number; // Date.now()
};

const VERSION = 1;
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes
const ENV = process.env.NEXT_PUBLIC_ENV || 'dev';

function hasStorage() {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function keyOf(eoa: string, chainId: number) {
  return `trading_wallet:${ENV}:${chainId}:${eoa.toLowerCase()}`;
}

export function setTradingWallet(eoa: string, chainId: number, address: string) {
  if (!hasStorage()) return;
  try {
    const val: TradingWalletCacheValue = { address, version: VERSION, savedAt: Date.now() };
    localStorage.setItem(keyOf(eoa, chainId), JSON.stringify(val));
    // Optional: broadcast to other tabs
    localStorage.setItem(`${keyOf(eoa, chainId)}:touch`, String(Date.now()));
  } catch {}
}

export function getCachedTradingWallet(
  eoa: string,
  chainId: number,
  ttlMs: number = DEFAULT_TTL_MS
): string | null {
  if (!hasStorage()) return null;
  try {
    const raw = localStorage.getItem(keyOf(eoa, chainId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TradingWalletCacheValue;
    if (parsed.version !== VERSION) return null;
    if (Date.now() - parsed.savedAt > ttlMs) return null;
    return parsed.address;
  } catch {
    return null;
  }
}

export function clearTradingWallet(eoa: string, chainId: number) {
  if (!hasStorage()) return;
  try {
    localStorage.removeItem(keyOf(eoa, chainId));
    localStorage.removeItem(`${keyOf(eoa, chainId)}:touch`);
  } catch {}
}

/**
 * Resolve trading wallet using cache-first strategy.
 * Falls back to reading profile.trading_wallet from backend, then caches.
 */
export async function resolveTradingWallet(
  eoa: string,
  chainId: number,
  opts?: { ttlMs?: number; forceRefresh?: boolean }
): Promise<string> {
  if (!eoa) throw new Error('EOA is required to resolve trading wallet');
  const ttl = opts?.ttlMs ?? DEFAULT_TTL_MS;

  if (!opts?.forceRefresh) {
    const cached = getCachedTradingWallet(eoa, chainId, ttl);
    if (cached) return cached;
  }

  const profile = await fetchUserProfile(eoa);
  // Prefer explicit trading wallet from backend if present
  const tradingWallet = (profile as any)?.trading_wallet || (profile as any)?.wallet || (profile as any)?.wallet_address || eoa;
  if (!tradingWallet) {
    throw new Error('Trading wallet not found on profile');
  }

  setTradingWallet(eoa, chainId, tradingWallet);
  return tradingWallet;
}
