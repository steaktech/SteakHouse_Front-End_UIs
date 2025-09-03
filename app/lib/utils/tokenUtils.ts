// lib/utils/tokenUtils.ts
import { Token } from '@/app/types/token';
import { TokenCardProps } from '@/app/components/TradingDashboard/types';
import { DEFAULT_TOKEN_IMAGE, TOKEN_LAUNCH_TYPES, TOKEN_TAG_COLORS, TOKEN_TYPE_LABELS } from '../config/constants';

/**
 * Formats a number to a human-readable string with appropriate suffixes
 */
export function formatNumber(value: number | string, options: { 
  prefix?: string; 
  decimals?: number; 
  compact?: boolean 
} = {}): string {
  const { prefix = '', decimals = 2, compact = true } = options;
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || numValue === 0) {
    return `${prefix}0`;
  }

  if (!compact) {
    return `${prefix}${numValue.toLocaleString(undefined, { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: decimals 
    })}`;
  }

  // Compact formatting
  if (numValue >= 1e9) {
    return `${prefix}${(numValue / 1e9).toFixed(decimals)}B`;
  }
  if (numValue >= 1e6) {
    return `${prefix}${(numValue / 1e6).toFixed(decimals)}M`;
  }
  if (numValue >= 1e3) {
    return `${prefix}${(numValue / 1e3).toFixed(decimals)}K`;
  }
  
  return `${prefix}${numValue.toFixed(decimals)}`;
}

/**
 * Gets market cap from API response (already calculated)
 */
export function getMarketCap(token: Token): number {
  const marketCap = parseFloat(token.market_cap);
  return isNaN(marketCap) ? 0 : marketCap;
}

/**
 * Calculates progress towards graduation cap
 */
export function calculateGraduationProgress(ethPool: string, graduationCap: string): number {
  const currentPool = parseFloat(ethPool);
  const graduationCapValue = parseFloat(graduationCap);
  
  if (isNaN(currentPool) || isNaN(graduationCapValue) || graduationCapValue === 0) {
    return 0;
  }
  
  // Convert from wei to ETH (assuming values are in wei)
  const currentPoolETH = currentPool / 1e18;
  const graduationCapETH = graduationCapValue / 1e18;
  
  const progress = (currentPoolETH / graduationCapETH) * 100;
  return Math.min(progress, 100);
}

/**
 * Gets token tag based on token properties
 */
export function getTokenTag(token: Token): string {
  // Priority 1: Use token_type for content categories (Meme, Utility, AI, X-post)
  if (token.token_type !== null && token.token_type !== undefined) {
    const contentTypeLabel = TOKEN_TYPE_LABELS[token.token_type as keyof typeof TOKEN_TYPE_LABELS];
    if (contentTypeLabel) return contentTypeLabel;
  }
  
  // Priority 2: Use boolean flags for launch types (fallback only)
  if (token.is_zero_simple) return 'Zero';
  if (token.is_super_simple) return 'Simple';
  if (token.is_advanced) return 'Advanced';
  
  // Priority 3: Use token_type for launch types (if token_type doesn't match content categories)
  if (token.token_type !== null && token.token_type !== undefined) {
    const launchType = TOKEN_LAUNCH_TYPES[token.token_type as keyof typeof TOKEN_LAUNCH_TYPES];
    if (launchType) return launchType;
  }
  
  // Default fallback - assume Meme if no clear indicators
  return 'Meme';
}

/**
 * Gets token tag color based on tag
 */
export function getTokenTagColor(tag: string): string {
  return TOKEN_TAG_COLORS[tag as keyof typeof TOKEN_TAG_COLORS] || TOKEN_TAG_COLORS.Basic;
}

/**
 * Generates a simple description for tokens without one
 */
export function generateTokenDescription(token: Token): string {
  const tag = getTokenTag(token);
  const graduated = token.graduated ? 'graduated' : 'pre-graduation';
  
  return `${token.name} (${token.symbol}) is a ${tag.toLowerCase()} token currently in ${graduated} phase. Join the community and trade with confidence.`;
}

/**
 * Gets token age from API response (already calculated)
 */
export function getTokenAge(token: Token): number {
  const ageHours = parseFloat(token.age_hours);
  return isNaN(ageHours) ? 0 : ageHours;
}

/**
 * Gets tax rate information for display
 */
export function getTaxInfo(token: Token): { current: string; final: string } {
  const currentTax = token.tax_rate || '0';
  const finalTax = token.final_tax_rate || '0';
  
  return {
    current: currentTax,
    final: finalTax
  };
}

/**
 * Gets volume from API response
 */
export function getVolume24h(token: Token): number {
  return token.volume_24h || 0;
}

/**
 * Transforms Token API data to TokenCardProps
 */
export function transformTokenToCardProps(token: Token): TokenCardProps {
  const marketCap = getMarketCap(token);
  const progress = calculateGraduationProgress(token.eth_pool, token.graduation_cap);
  const tag = getTokenTag(token);
  const tagColor = getTokenTagColor(tag);
  const volume24h = getVolume24h(token);
  
  // Calculate liquidity from ETH pool (assuming ETH = $2000)
  const ethPoolValueWei = parseFloat(token.eth_pool);
  const ethPriceUSD = 2000;
  // Convert from wei to ETH (divide by 1e18), then multiply by USD price
  const ethPoolValueETH = ethPoolValueWei / 1e18;
  const liquidityValue = isNaN(ethPoolValueWei) ? 0 : ethPoolValueETH * ethPriceUSD;
  
  return {
    isOneStop: token.graduated, // Graduated tokens get special treatment
    imageUrl: token.image_url || DEFAULT_TOKEN_IMAGE,
    name: token.name,
    symbol: token.symbol,
    tag,
    tagColor,
    description: generateTokenDescription(token),
    mcap: formatNumber(marketCap, { prefix: '$', compact: true }),
    liquidity: formatNumber(liquidityValue, { prefix: '$', compact: true }),
    volume: formatNumber(volume24h, { prefix: '$', compact: true }),
    progress: Math.round(progress * 10) / 10 // Round to 1 decimal place
  };
}

/**
 * Transforms array of Token API data to TokenCardProps array
 */
export function transformTokensToCardProps(tokens: Token[]): TokenCardProps[] {
  return tokens.map(transformTokenToCardProps);
}
