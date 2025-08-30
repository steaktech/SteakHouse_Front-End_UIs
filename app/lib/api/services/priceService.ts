// lib/api/services/priceService.ts

import { EXTERNAL_APIS } from '@/app/lib/config/constants';

/**
 * Interface for price data
 */
export interface PriceData {
  gasPrice: string | null;
  ethPrice: number | null;
  lastUpdated: Date;
}

/**
 * Interface for gas price response
 */
export interface GasPriceResponse {
  gasPrice: string;
  error?: string;
}

/**
 * Interface for ETH price response
 */
export interface EthPriceResponse {
  ethPrice: number;
  error?: string;
}

/**
 * Service class for handling price-related API calls
 */
export class PriceService {
  /**
   * Fetches current gas price using wagmi public client
   * @param publicClient - Wagmi public client instance
   * @returns Promise with gas price in Gwei or error
   */
  static async fetchGasPrice(publicClient: any): Promise<GasPriceResponse> {
    try {
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const gasPrice = await publicClient.getGasPrice();
      const gweiPrice = Number(gasPrice) / 1e9; // Convert wei to gwei
      const formattedPrice = gweiPrice.toFixed(1);
      
      return {
        gasPrice: formattedPrice,
      };
    } catch (error) {
      console.error('Error fetching gas price:', error);
      return {
        gasPrice: '0',
        error: error instanceof Error ? error.message : 'Failed to fetch gas price',
      };
    }
  }

  /**
   * Fetches current ETH price from CoinGecko API
   * @returns Promise with ETH price in USD or error
   */
  static async fetchEthPrice(): Promise<EthPriceResponse> {
    try {
      const url = `${EXTERNAL_APIS.COINGECKO.BASE_URL}${EXTERNAL_APIS.COINGECKO.ENDPOINTS.SIMPLE_PRICE}?ids=ethereum&vs_currencies=usd`;
      
      // Create timeout signal with fallback for older browsers
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.ethereum?.usd) {
        throw new Error('Invalid response format from CoinGecko API');
      }

      return {
        ethPrice: data.ethereum.usd,
      };
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      return {
        ethPrice: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch ETH price',
      };
    }
  }

  /**
   * Fetches both gas price and ETH price concurrently
   * @param publicClient - Wagmi public client instance
   * @returns Promise with both prices or errors
   */
  static async fetchAllPrices(publicClient: any): Promise<PriceData> {
    try {
      const [gasResult, ethResult] = await Promise.all([
        this.fetchGasPrice(publicClient),
        this.fetchEthPrice(),
      ]);

      return {
        gasPrice: gasResult.error ? null : gasResult.gasPrice,
        ethPrice: ethResult.error ? null : ethResult.ethPrice,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error fetching prices:', error);
      return {
        gasPrice: null,
        ethPrice: null,
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Formats gas price for display
   * @param gasPrice - Gas price in Gwei
   * @returns Formatted string
   */
  static formatGasPrice(gasPrice: string | null): string {
    if (!gasPrice || gasPrice === '0' || gasPrice === 'null' || gasPrice === 'undefined') {
      return 'N/A';
    }
    return `${gasPrice} Gwei`;
  }

  /**
   * Formats ETH price for display
   * @param ethPrice - ETH price in USD
   * @returns Formatted string
   */
  static formatEthPrice(ethPrice: number | null): string {
    if (!ethPrice || ethPrice === 0 || isNaN(ethPrice)) {
      return 'N/A';
    }
    return `$${ethPrice.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
}
