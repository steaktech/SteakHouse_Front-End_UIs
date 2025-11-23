"use client";

import React from 'react';
import MobileStats from './MobileStats';
import MobileBanner from './MobileBanner';
import MobileTokenInfo from './MobileTokenInfo';

export interface TokenData {
  // Core identity
  name: string;
  symbol: string;
  logo?: string;
  bannerUrl?: string;

  // Tax & limits (from card + MobileTokenInfo)
  currentTax: {
    buy: number;
    sell: number;
  };
  maxTax?: {
    buy: number;
    sell: number;
  };
  maxTransaction: number; // % of supply

  // High‑level description
  description?: string;

  // Summary stats (string formatted, like MobileStats / MobileTokenInfo header)
  marketCap?: string;
  volume?: string;
  liquidityPool?: string;

  // Bonding curve progress (0–100 or 0–1)
  bondingProgress: number;

  // Tag / category
  tag?: string;
  tagColor?: string;

  // Addresses
  address?: string;
  contractAddress?: string;
  tokenAddress?: string;

  // Optional extra fields to mirror MobileStats / MobileTokenInfo
  price?: number; // current token price in USD
  priceChange24h?: number; // 24h change in %
  telegramUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;

  // More detailed numeric stats (optional – used for a compact "More Info" area)
  rawMarketCap?: number;
  rawLiquidityEth?: number;
  rawVolume24h?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  graduationCap?: number;
  graduated?: boolean;
  createdAt?: string;
  tokenType?: number;
  currentMaxTxPct?: number;
  finalMaxTxPct?: number;
  currentMaxWalletPct?: number;
  finalMaxWalletPct?: number;
  currentTaxPct?: number;
  finalTaxPct?: number;
}

interface MobileStyleTokenCardProps {
  tokenData: TokenData;
  isLimitMode?: boolean;
  isLoading?: boolean;
  // Audio controls
  isAudioPlaying?: boolean;
  isAudioAvailable?: boolean;
  onToggleAudio?: () => void;
}

export const MobileStyleTokenCard: React.FC<MobileStyleTokenCardProps> = ({
  tokenData,
  isLimitMode = false,
  isLoading = false,
  isAudioPlaying,
  isAudioAvailable,
  onToggleAudio
}) => {

  // Map TokenData to MobileStatsProps
  const statsProps = {
    tokenAddress: tokenData.tokenAddress || tokenData.address || '',
    tokenName: tokenData.name,
    tokenSymbol: tokenData.symbol,
    marketCap: tokenData.marketCap,
    priceChange24h: tokenData.priceChange24h,
    currentPrice: tokenData.price,
    tokenIconUrl: tokenData.logo,
    telegramUrl: tokenData.telegramUrl,
    twitterUrl: tokenData.twitterUrl,
    websiteUrl: tokenData.websiteUrl,
    isAudioPlaying,
    isAudioAvailable,
    onToggleAudio
  };

  // Map TokenData to MobileBannerProps
  const bannerProps = {
    bannerUrl: tokenData.bannerUrl,
    tokenName: tokenData.name
  };

  // Map TokenData to MobileTokenInfoProps
  const infoData = {
    tokenAddress: tokenData.tokenAddress || tokenData.address,
    tokenSymbol: tokenData.symbol,
    marketCap: tokenData.rawMarketCap,
    liquidity: tokenData.rawLiquidityEth,
    circulatingSupply: tokenData.circulatingSupply,
    volume24h: tokenData.rawVolume24h,
    totalSupply: tokenData.totalSupply,
    graduationCap: tokenData.graduationCap,
    graduated: tokenData.graduated,
    createdAt: tokenData.createdAt,
    tokenType: tokenData.tokenType,
    bondingProgress: tokenData.bondingProgress,
    description: tokenData.description,
    currentMaxTx: tokenData.currentMaxTxPct,
    finalMaxTx: tokenData.finalMaxTxPct,
    currentMaxWallet: tokenData.currentMaxWalletPct,
    finalMaxWallet: tokenData.finalMaxWalletPct,
    currentTax: tokenData.currentTaxPct,
    finalTax: tokenData.finalTaxPct
  };

  if (isLoading) {
    return (
      <div className="w-full bg-[#0a0612] rounded-xl overflow-hidden border border-[#1f1a24] animate-pulse h-[400px]">
        <div className="h-full w-full bg-[#13101a]/50" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full rounded-xl overflow-hidden" style={{
      background: 'linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      border: '1px solid rgba(255, 215, 165, 0.4)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
    }}>
      <MobileStats {...statsProps} />
      <MobileBanner {...bannerProps} />
      <MobileTokenInfo data={infoData} />
    </div>
  );
};
