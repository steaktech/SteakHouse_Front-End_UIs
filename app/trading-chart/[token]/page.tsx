"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import TradingChart from '@/app/components/TradingChart/TradingChart';
import { useTokenWebSocket } from '@/app/hooks/useTokenWebSocket';
import { normalizeEthereumAddress } from '@/app/lib/utils/addressValidation';
import type { WebSocketTrade, ChartUpdateEvent } from '@/app/types/token';

interface TradingChartPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function TradingChartPage({ params }: TradingChartPageProps) {
  const router = useRouter();
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Unwrap the params promise
  const resolvedParams = use(params);

  // Extract and validate token address from URL params
  useEffect(() => {
    const rawToken = resolvedParams.token;
    
    if (!rawToken) {
      setValidationError('Token address is required');
      return;
    }

    // Validate and normalize the token address
    const normalizedAddress = normalizeEthereumAddress(rawToken);
    
    if (!normalizedAddress) {
      setValidationError(`Invalid token address format. Expected format: 0x followed by 40 hexadecimal characters. Received: ${rawToken}`);
      return;
    }

    // Clear any previous validation errors
    setValidationError(null);
    setTokenAddress(normalizedAddress);
    
    console.log('✅ Valid token address extracted from URL:', normalizedAddress);
  }, [resolvedParams.token]);

  // Initialize WebSocket connection with console logging
  const { isConnected, connectionError, lastTrade, lastChartUpdate } = useTokenWebSocket({
    tokenAddress,
    onTrade: (trade: WebSocketTrade) => {
      console.log('NEW TRADE:', {
        type: trade.type,
        token: trade.token,
        symbol: trade.symbol,
        trader: trade.trader,
        amountEth: trade.amountEth,
        amountTokens: trade.amountTokens,
        price: trade.price,
        usdValue: trade.usdValue,
        marketCap: trade.marketCap,
        timestamp: new Date(trade.timestamp).toISOString(),
        txHash: trade.txHash
      });
    },
    onChartUpdate: (update: ChartUpdateEvent) => {
      console.log('CHART UPDATE:', {
        timeframe: update.timeframe,
        candle: {
          token: update.candle.token,
          timestamp: new Date(update.candle.timestamp).toISOString(),
          open: update.candle.open,
          high: update.candle.high,
          low: update.candle.low,
          close: update.candle.close,
          volume: update.candle.volume
        }
      });
    }
  });

  // Log connection status changes
  useEffect(() => {
    if (isConnected) {
      console.log('✅ WebSocket connected successfully');
    } else {
      console.log('❌ WebSocket disconnected');
    }
  }, [isConnected]);

  // Log connection errors
  useEffect(() => {
    if (connectionError) {
      console.error('🚨 WebSocket connection error:', connectionError);
    }
  }, [connectionError]);

  // Log when we receive new data
  useEffect(() => {
    if (lastTrade) {
      console.log('📈 Last trade updated:', lastTrade.type, 'for', lastTrade.symbol);
    }
  }, [lastTrade]);

  useEffect(() => {
    if (lastChartUpdate) {
      console.log('📊 Last chart update:', lastChartUpdate.timeframe, 'timeframe');
    }
  }, [lastChartUpdate]);

  // Redirect to home page if there's a validation error
  useEffect(() => {
    if (validationError) {
      router.replace('/');
    }
  }, [validationError, router]);

  // Don't render anything if token is invalid or still validating
  if (validationError || !tokenAddress) {
    return null;
  }

  return <TradingChart tokenAddress={tokenAddress} />;
}
