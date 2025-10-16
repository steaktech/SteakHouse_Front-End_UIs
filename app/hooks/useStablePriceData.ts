// hooks/useStablePriceData.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { PriceService } from '@/app/lib/api/services/priceService';
import { PRICE_REFRESH_INTERVALS } from '@/app/lib/config/constants';

/**
 * Stable price data hook that prevents excessive re-renders and API calls
 */
export const useStablePriceData = (enabled: boolean = false) => {
  const [gasPrice, setGasPrice] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const isInitializedRef = useRef(false);

  // Initialize mounted ref properly
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Stable fetch function that doesn't change unless publicClient changes
  const fetchPrices = useCallback(async () => {
    if (!enabled || !mountedRef.current) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await PriceService.fetchAllPrices(publicClient);
      
      if (mountedRef.current) {
        setGasPrice(data.gasPrice);
        setEthPrice(data.ethPrice);
        
        if (!data.gasPrice && !data.ethPrice) {
          setError('Failed to fetch price data');
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Price fetch error:', err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, publicClient]);

  // Initialize and setup interval only once when enabled becomes true
  useEffect(() => {
    if (!enabled) {
      // Clear interval when disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isInitializedRef.current = false;
      return;
    }

    // Only initialize once when first enabled
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      
      // Initial fetch
      fetchPrices();
      
      // Setup interval
      intervalRef.current = setInterval(() => {
        fetchPrices();
      }, PRICE_REFRESH_INTERVALS.GAS_PRICE);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, fetchPrices]);

  // Additional cleanup for intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Format the prices
  const formattedGasPrice = PriceService.formatGasPrice(gasPrice);
  const formattedEthPrice = PriceService.formatEthPrice(ethPrice);

  return {
    gasPrice,
    ethPrice,
    loading,
    error,
    formattedGasPrice,
    formattedEthPrice,
  };
};
