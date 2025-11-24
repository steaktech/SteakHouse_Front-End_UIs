"use client";

import React, { useState } from 'react';
import { useStablePriceData } from '@/app/hooks/useStablePriceData';
import { useTheme } from '@/app/contexts/ThemeContext';

interface TokenInfoData {
  tokenAddress?: string;
  tokenSymbol?: string;
  marketCap?: number;
  liquidity?: number;
  circulatingSupply?: number;
  volume24h?: number;
  totalSupply?: number;
  graduationCap?: number;
  graduated?: boolean;
  createdAt?: string;
  tokenType?: number;
  bondingProgress?: number;
  // Extra descriptive and limit/tax fields for "More Info" section
  description?: string;
  currentMaxTx?: number;      // percent of total supply
  finalMaxTx?: number;        // percent of total supply
  currentMaxWallet?: number;  // percent of total supply
  finalMaxWallet?: number;    // percent of total supply
  currentTax?: number;        // percent
  finalTax?: number;          // percent
}

interface MobileTokenInfoProps {
  data: TokenInfoData;
}

// Bonding-curve helpers for formatting graduation cap MCAP
const WEI_1E18 = BigInt(10) ** BigInt(18);

function priceWeiPer1e18AtSupply(totalSupplyRaw: bigint, supplyRaw: bigint): bigint {
  const A = totalSupplyRaw;
  const s = supplyRaw;
  if (s <= BigInt(0) || s >= A) return BigInt(0);
  const denom = (A - s) * (A - s);
  return (A * WEI_1E18 * WEI_1E18) / denom;
}

function computeMcapUsdFromSupplySync(params: {
  totalSupply?: number;
  supplyToCirculate?: number;
  ethPriceUsd: number | null;
}): number | null {
  const { totalSupply, supplyToCirculate, ethPriceUsd } = params;
  if (!totalSupply || !supplyToCirculate || !ethPriceUsd) return null;

  try {
    const A = BigInt(Math.floor(totalSupply));
    const s = BigInt(Math.floor(supplyToCirculate));
    if (A <= BigInt(0) || s <= BigInt(0) || s > A) return null;

    const priceWeiPer1e18 = priceWeiPer1e18AtSupply(A, s);
    const mcapWei = (priceWeiPer1e18 * s) / WEI_1E18;

    // Convert wei market cap to USD using ETH price, keeping 2 decimal places (cents)
    const centsPerEth = BigInt(Math.round(ethPriceUsd * 100));
    const usdCents = (mcapWei * centsPerEth) / WEI_1E18;

    return Number(usdCents) / 100;
  } catch {
    return null;
  }
}

export default function MobileTokenInfo({ data }: MobileTokenInfoProps) {
  const { ethPriceUsd } = useStablePriceData(true);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Calculate bonding progress if not provided
  const calculatedBondingProgress = (() => {
    // Use provided value if available
    if (data.bondingProgress != null) {
      return Math.min(data.bondingProgress, 100);
    }
    // Calculate from market cap and graduation cap (both in same units)
    const marketCap = data.marketCap;
    const graduationCap = data.graduationCap;
    if (marketCap != null && graduationCap != null && !isNaN(marketCap) && !isNaN(graduationCap) && graduationCap > 0) {
      return Math.min((marketCap / graduationCap) * 100, 100);
    }
    return 0;
  })();

  // Format numbers with appropriate suffixes
  const formatNumber = (num?: number): string => {
    if (num === undefined || num === null) return '-';

    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  // Format currency values
  const formatCurrency = (num?: number): string => {
    if (num === undefined || num === null) return '-';
    return `$${formatNumber(num)}`;
  };

  // Liquidity and 24h volume: treat incoming values as ETH and convert to USD using current ETH price.
  const liquidityUsd: number | undefined = (() => {
    if (data.liquidity == null || typeof data.liquidity !== 'number') return undefined;
    if (!ethPriceUsd || isNaN(ethPriceUsd)) return data.liquidity;
    return data.liquidity * ethPriceUsd;
  })();

  const volume24hUsd: number | undefined = (() => {
    if (data.volume24h == null || typeof data.volume24h !== 'number') return undefined;
    if (!ethPriceUsd || isNaN(ethPriceUsd)) return data.volume24h;
    return data.volume24h * ethPriceUsd;
  })();

  // Graduation cap: normalize units (handle on-chain 1e18 scaling) and compute target MCAP.
  // If MCAP can't be computed, fall back to a human-scale token amount.
  const graduationCapMcapUsd: number | undefined = (() => {
    const totalSupply = data.totalSupply;
    let supplyToCirculate: number | undefined = data.graduationCap;

    // Heuristic: if the value is extremely large, assume it's 1e18-scaled and normalize.
    if (typeof supplyToCirculate === 'number' && supplyToCirculate > 1e15) {
      supplyToCirculate = supplyToCirculate / 1e18;
    }

    const mcap = computeMcapUsdFromSupplySync({
      totalSupply,
      supplyToCirculate,
      ethPriceUsd,
    });

    if (mcap != null && !isNaN(mcap) && mcap > 0) return mcap;
    if (supplyToCirculate != null && !isNaN(supplyToCirculate) && supplyToCirculate > 0) {
      return supplyToCirculate;
    }
    return undefined;
  })();

  // Format percentage
  const formatPercent = (num?: number): string => {
    if (num === undefined || num === null) return '-';
    return `${num.toFixed(0)}%`;
  };

  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const gridItemClass = "flex flex-col items-center justify-center py-3 px-2 rounded-lg border";
  const labelClass = "text-[10px] sm:text-xs uppercase tracking-wider mb-1 flex items-center gap-1";
  const valueClass = "text-sm sm:text-base font-bold";

  return (
    <div className="w-full" style={{
      background: isLight
        ? 'var(--theme-grad-card)'
        : 'linear-gradient(180deg, #572501, #572501 50%, #4a2001 100%)',
      padding: '16px 0',
      color: isLight ? 'var(--theme-text-primary)' : '#fff7ea'
    }}>
      <div className="px-4 py-3">
        {/* Token Address Row */}
        <div className="flex items-center justify-between mb-4 rounded-lg px-3 py-2" style={{
          background: isLight
            ? 'var(--theme-grad-card)'
            : 'linear-gradient(180deg, #7f4108, #6f3906)',
          border: isLight
            ? '1px solid var(--theme-border)'
            : '1px solid rgba(255, 215, 165, 0.25)',
          boxShadow: isLight
            ? '0 2px 4px rgba(62, 39, 35, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            : '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
        }}>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider" style={{ color: isLight ? 'var(--theme-text-highlight)' : '#d29900' }}>
              {data.tokenSymbol || 'TOKEN'}:
            </span>
            <span className="text-xs font-mono" style={{ color: isLight ? 'var(--theme-text-secondary)' : '#e6d4a3' }}>
              {data.tokenAddress ? `${data.tokenAddress.slice(0, 6)}...${data.tokenAddress.slice(-4)}` : '-'}
            </span>
          </div>
          <button
            className="transition-colors"
            style={{ color: isLight ? 'var(--theme-accent)' : '#d29900' }}
            onMouseEnter={(e) => e.currentTarget.style.color = isLight ? '#b45309' : '#e6d4a3'}
            onMouseLeave={(e) => e.currentTarget.style.color = isLight ? 'var(--theme-accent)' : '#d29900'}
            onClick={() => {
              if (data.tokenAddress) {
                navigator.clipboard.writeText(data.tokenAddress);
              }
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        {/* Stats Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Market Cap */}
          <div className={gridItemClass} style={{
            background: isLight ? 'var(--theme-grad-card)' : 'linear-gradient(180deg, #7f4108, #6f3906)',
            borderColor: isLight ? 'var(--theme-border)' : 'rgba(255, 215, 165, 0.25)',
            boxShadow: isLight ? '0 2px 4px rgba(62,39,35,0.05)' : '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
          }}>
            <span className={labelClass} style={{ color: isLight ? 'var(--theme-text-muted)' : '#feea88' }}>MARKET CAP</span>
            <span className={valueClass} style={{ color: isLight ? 'var(--theme-text-primary)' : '#fff7ea' }}>{formatCurrency(data.marketCap)}</span>
          </div>

          {/* Liquidity (ETH → USD) */}
          <div className={gridItemClass} style={{
            background: isLight ? 'var(--theme-grad-card)' : 'linear-gradient(180deg, #7f4108, #6f3906)',
            borderColor: isLight ? 'var(--theme-border)' : 'rgba(255, 215, 165, 0.25)',
            boxShadow: isLight ? '0 2px 4px rgba(62,39,35,0.05)' : '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
          }}>
            <span className={labelClass} style={{ color: isLight ? 'var(--theme-text-muted)' : '#feea88' }}>LIQUIDITY</span>
            <span className={valueClass} style={{ color: isLight ? 'var(--theme-text-primary)' : '#fff7ea' }}>{formatCurrency(liquidityUsd)}</span>
          </div>

          {/* Circulating Supply */}
          <div className={gridItemClass} style={{
            background: isLight ? 'var(--theme-grad-card)' : 'linear-gradient(180deg, #7f4108, #6f3906)',
            borderColor: isLight ? 'var(--theme-border)' : 'rgba(255, 215, 165, 0.25)',
            boxShadow: isLight ? '0 2px 4px rgba(62,39,35,0.05)' : '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
          }}>
            <span className={labelClass} style={{ color: isLight ? 'var(--theme-text-muted)' : '#feea88' }}>CIRC. SUPPLY</span>
            <span className={valueClass} style={{ color: isLight ? 'var(--theme-text-primary)' : '#fff7ea' }}>{formatNumber(data.circulatingSupply)}</span>
          </div>

          {/* Total Supply */}
          <div className={gridItemClass} style={{
            background: isLight ? 'var(--theme-grad-card)' : 'linear-gradient(180deg, #7f4108, #6f3906)',
            borderColor: isLight ? 'var(--theme-border)' : 'rgba(255, 215, 165, 0.25)',
            boxShadow: isLight ? '0 2px 4px rgba(62,39,35,0.05)' : '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
          }}>
            <span className={labelClass} style={{ color: isLight ? 'var(--theme-text-muted)' : '#feea88' }}>TOTAL SUPPLY</span>
            <span className={valueClass} style={{ color: isLight ? 'var(--theme-text-primary)' : '#fff7ea' }}>{formatNumber(data.totalSupply)}</span>
          </div>

          {/* 24H Volume (ETH → USD) */}
          <div className={gridItemClass} style={{
            background: isLight ? 'var(--theme-grad-card)' : 'linear-gradient(180deg, #7f4108, #6f3906)',
            borderColor: isLight ? 'var(--theme-border)' : 'rgba(255, 215, 165, 0.25)',
            boxShadow: isLight ? '0 2px 4px rgba(62,39,35,0.05)' : '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
          }}>
            <span className={labelClass} style={{ color: isLight ? 'var(--theme-text-muted)' : '#feea88' }}>24H VOLUME</span>
            <span className={valueClass} style={{ color: isLight ? 'var(--theme-text-primary)' : '#fff7ea' }}>{formatCurrency(volume24hUsd)}</span>
          </div>

          {/* Graduation Cap (formatted via bonding-curve MCAP when possible) */}
          <div className={gridItemClass} style={{
            background: isLight ? 'var(--theme-grad-card)' : 'linear-gradient(180deg, #7f4108, #6f3906)',
            borderColor: isLight ? 'var(--theme-border)' : 'rgba(255, 215, 165, 0.25)',
            boxShadow: isLight ? '0 2px 4px rgba(62,39,35,0.05)' : '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
          }}>
            <span className={labelClass} style={{ color: isLight ? 'var(--theme-text-muted)' : '#feea88' }}>GRAD. CAP</span>
            <span className={valueClass} style={{ color: isLight ? 'var(--theme-text-primary)' : '#fff7ea' }}>{formatCurrency(graduationCapMcapUsd)}</span>
          </div>
        </div>

        {/* More Info Button */}
        <button
          onClick={() => setShowMoreInfo(!showMoreInfo)}
          className="w-full py-2 text-xs transition-colors flex items-center justify-center gap-1 mt-1 rounded-lg border"
          style={{
            background: isLight ? 'var(--theme-grad-card)' : 'linear-gradient(180deg, #7f4108, #6f3906)',
            borderColor: isLight ? 'var(--theme-border)' : 'rgba(255, 215, 165, 0.4)',
            color: isLight ? 'var(--theme-text-highlight)' : '#feea88',
            boxShadow: isLight ? '0 2px 4px rgba(62,39,35,0.05)' : '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = isLight ? '#b45309' : '#ffd493'}
          onMouseLeave={(e) => e.currentTarget.style.color = isLight ? 'var(--theme-text-highlight)' : '#feea88'}
        >
          {showMoreInfo ? 'Less Info' : 'More Info'}
          <svg
            className={`w-4 h-4 transition-transform ${showMoreInfo ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expandable More Info Section */}
        {showMoreInfo && (
          <div className="mt-3 space-y-2 rounded-lg border p-3" style={{
            background: isLight ? 'var(--theme-grad-card)' : 'linear-gradient(180deg, #7f4108, #6f3906)',
            borderColor: isLight ? '#c9a875' : 'rgba(255, 215, 165, 0.25)',
            boxShadow: isLight ? '0 1px 2px rgba(0,0,0,0.05)' : '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
          }}>
            {/* Status */}
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.15)' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: isLight ? '#b45309' : '#feea88' }}>Status</span>
              <span className="text-xs font-semibold" style={{ color: isLight ? 'var(--theme-text-primary)' : '#e6d4a3' }}>
                {data.graduated ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Graduated
                  </span>
                ) : (
                  <div className="flex flex-col items-end gap-1 min-w-[120px]">
                    <span className="text-yellow-600 text-[10px]">
                      Bonding {calculatedBondingProgress ? `${calculatedBondingProgress.toFixed(0)}%` : ''}
                    </span>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: isLight ? 'rgba(93, 58, 26, 0.1)' : 'rgba(60, 32, 18, 0.5)' }}>
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(calculatedBondingProgress || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </span>
            </div>

            {/* Description */}
            <div className="flex justify-between items-start py-2 border-b" style={{ borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.15)' }}>
              <span className="text-xs uppercase tracking-wider mr-4" style={{ color: isLight ? '#b45309' : '#feea88' }}>Description</span>
              <span className="text-xs font-semibold text-right max-w-[60%] break-words" style={{ color: isLight ? 'var(--theme-text-primary)' : '#e6d4a3' }}>
                {data.description && data.description.trim().length > 0 ? data.description : '-'}
              </span>
            </div>

            {/* Token Type */}
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.15)' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: isLight ? '#b45309' : '#feea88' }}>Token Type</span>
              <span className="text-xs font-semibold" style={{ color: isLight ? 'var(--theme-text-primary)' : '#e6d4a3' }}>
                {data.tokenType === 0 ? 'ZERO' :
                  data.tokenType === 1 ? 'SUPER SIMPLE' :
                    data.tokenType === 2 ? 'BASIC' :
                      data.tokenType === 3 ? 'ADVANCED' :
                        data.tokenType === 4 ? 'CUSTOM' :
                          '-'}
              </span>
            </div>

            {/* Supply percentage */}
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.15)' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: isLight ? '#b45309' : '#feea88' }}>Supply %</span>
              <span className="text-xs font-semibold" style={{ color: isLight ? 'var(--theme-text-primary)' : '#e6d4a3' }}>
                {data.circulatingSupply && data.totalSupply
                  ? `${((data.circulatingSupply / data.totalSupply) * 100).toFixed(2)}%`
                  : '-'
                }
              </span>
            </div>

            {/* Current / Final Max Tx */}
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.15)' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: isLight ? '#b45309' : '#feea88' }}>Current MaxTx</span>
              <span className="text-xs font-semibold" style={{ color: isLight ? 'var(--theme-text-primary)' : '#e6d4a3' }}>
                {data.currentMaxTx != null ? formatPercent(data.currentMaxTx) : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.15)' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: isLight ? '#b45309' : '#feea88' }}>Final MaxTx</span>
              <span className="text-xs font-semibold" style={{ color: isLight ? 'var(--theme-text-primary)' : '#e6d4a3' }}>
                {data.finalMaxTx != null ? formatPercent(data.finalMaxTx) : '-'}
              </span>
            </div>

            {/* Current / Final Max Wallet */}
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.15)' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: isLight ? '#b45309' : '#feea88' }}>Current MaxWallet</span>
              <span className="text-xs font-semibold" style={{ color: isLight ? 'var(--theme-text-primary)' : '#e6d4a3' }}>
                {data.currentMaxWallet != null ? formatPercent(data.currentMaxWallet) : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.15)' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: isLight ? '#b45309' : '#feea88' }}>Final MaxWallet</span>
              <span className="text-xs font-semibold" style={{ color: isLight ? 'var(--theme-text-primary)' : '#e6d4a3' }}>
                {data.finalMaxWallet != null ? formatPercent(data.finalMaxWallet) : '-'}
              </span>
            </div>

            {/* Current / Final Tax */}
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.15)' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: isLight ? '#b45309' : '#feea88' }}>Current Tax</span>
              <span className="text-xs font-semibold" style={{ color: isLight ? 'var(--theme-text-primary)' : '#e6d4a3' }}>
                {data.currentTax != null ? `${data.currentTax.toFixed(2)}%` : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.15)' }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: isLight ? '#b45309' : '#feea88' }}>Final Tax</span>
              <span className="text-xs font-semibold" style={{ color: isLight ? 'var(--theme-text-primary)' : '#e6d4a3' }}>
                {data.finalTax != null ? `${data.finalTax.toFixed(2)}%` : '-'}
              </span>
            </div>

            {/* Created at */}
            <div className="flex justify-between items-center py-2">
              <span className="text-xs uppercase tracking-wider" style={{ color: isLight ? '#b45309' : '#feea88' }}>Created At</span>
              <span className="text-xs font-semibold" style={{ color: isLight ? 'var(--theme-text-primary)' : '#e6d4a3' }}>
                {data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : '-'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
