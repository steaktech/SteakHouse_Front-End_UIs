/**
 * Utility functions for trading chart components
 */

/**
 * Formats an amount consistently across all trading components
 * @param amount - The numeric amount to format
 * @param symbol - The token symbol (default: 'ASTER')
 * @param decimals - Number of decimal places for K formatting (default: 1)
 * @returns Formatted string like "1.2K ASTER" or "850 ASTER"
 */
export function formatAmount(amount: number, symbol: string = 'ASTER', decimals: number = 1): string {
  if (amount >= 1000) {
    const kAmount = amount / 1000;
    return `${kAmount.toFixed(decimals)}K ${symbol}`;
  }
  return `${amount} ${symbol}`;
}

/**
 * Parses a formatted amount string back to a numeric value
 * @param amountString - The formatted amount string (e.g., "1.25K ASTER" or "850 ASTER")
 * @returns The numeric value
 */
export function parseFormattedAmount(amountString: string): number {
  const match = amountString.match(/^([\d.]+)(K)?\s/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const hasK = match[2] === 'K';
  
  return hasK ? value * 1000 : value;
}

/**
 * Formats a price consistently
 * @param price - The numeric price
 * @param currency - The currency symbol (default: '$')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted price string like "$1.43"
 */
export function formatPrice(price: number, currency: string = '$', decimals: number = 2): string {
  return `${currency}${price.toFixed(decimals)}`;
}