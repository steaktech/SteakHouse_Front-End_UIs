// lib/api/services/blockchainService.ts
import { blockchainApiClient } from '../blockchainClient';
import type { MaxTxResponse, MaxWalletResponse, BlockchainApiError } from '@/app/types/blockchain';

/**
 * Service for blockchain-related API calls
 * Following the existing codebase patterns for API services
 */

/**
 * Fetches maximum transaction information for a given token
 * @param tokenAddress - The token contract address (e.g., '0x123...')
 * @returns Promise<MaxTxResponse> - The max transaction data with quotes
 * @throws Error if the API call fails or returns an error
 */
export async function getMaxTxInfo(tokenAddress: string): Promise<MaxTxResponse> {
  console.log('getMaxTxInfo API call for:', tokenAddress);
  
  if (!tokenAddress) {
    throw new Error('Token address is required');
  }

  // Validate token address format (basic check for 0x prefix and length)
  if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
    throw new Error(`Invalid token address format: ${tokenAddress}`);
  }

  try {
    const result = await blockchainApiClient<MaxTxResponse>(`/maxTx/${tokenAddress}`);
    console.log('getMaxTxInfo success for:', tokenAddress);
    return result;
  } catch (error) {
    console.error('getMaxTxInfo error for:', tokenAddress, error);
    throw error;
  }
}

/**
 * Fetches maximum wallet information for a given token
 * @param tokenAddress - The token contract address (e.g., '0x123...')
 * @returns Promise<MaxWalletResponse> - The max wallet data with quotes
 * @throws Error if the API call fails or returns an error
 */
export async function getMaxWalletInfo(tokenAddress: string): Promise<MaxWalletResponse> {
  console.log('getMaxWalletInfo API call for:', tokenAddress);

  if (!tokenAddress) {
    throw new Error('Token address is required');
  }

  if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
    throw new Error(`Invalid token address format: ${tokenAddress}`);
  }

  try {
    const result = await blockchainApiClient<MaxWalletResponse>(`/maxWallet/${tokenAddress}`);
    console.log('getMaxWalletInfo success for:', tokenAddress);
    return result;
  } catch (error) {
    console.error('getMaxWalletInfo error for:', tokenAddress, error);
    throw error;
  }
}

/**
 * Extracts the ETH amount to curve from maxWallet response
 * @param maxWalletResponse - The response from getMaxWalletInfo
 * @returns string - The ethToCurve value with max 4 decimals, or null if not available
 */
export function extractMaxWalletEthToCurve(maxWalletResponse: MaxWalletResponse): string | null {
  try {
    const ethToCurve = maxWalletResponse?.quotes?.maxWallet?.human?.ethToCurve;

    if (!ethToCurve || ethToCurve === '0' || ethToCurve === '') {
      return null;
    }

    const parsed = parseFloat(ethToCurve);
    if (isNaN(parsed)) {
      return null;
    }

    return parsed.toFixed(4).replace(/\.?0+$/, '');
  } catch (error) {
    console.error('Error extracting ethToCurve for max wallet:', error);
    return null;
  }
}

/**
 * Extracts the ETH amount to curve from maxTx response
 * @param maxTxResponse - The response from getMaxTxInfo
 * @returns string - The ethToCurve value with max 4 decimals, or null if not available
 */
export function extractEthToCurve(maxTxResponse: MaxTxResponse): string | null {
  try {
    const ethToCurve = maxTxResponse?.quotes?.maxTx?.human?.ethToCurve;
    
    if (!ethToCurve || ethToCurve === '0' || ethToCurve === '') {
      return null;
    }

    // Parse and format to max 4 decimals
    const parsed = parseFloat(ethToCurve);
    if (isNaN(parsed)) {
      return null;
    }

    // Format to max 4 decimals, removing trailing zeros
    return parsed.toFixed(4).replace(/\.?0+$/, '');
  } catch (error) {
    console.error('Error extracting ethToCurve:', error);
    return null;
  }
}
