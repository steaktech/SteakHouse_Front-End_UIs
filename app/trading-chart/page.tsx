"use client";

import { useEffect } from 'react';
import TradingChart from '@/app/components/TradingChart/TradingChart';
import { useTokenWebSocket } from '@/app/hooks/useTokenWebSocket';
import type { WebSocketTrade, ChartUpdateEvent } from '@/app/types/token';

export default function TradingChartPage() {
  // For now using the example token address - this should be made dynamic via URL params
  const tokenAddress = "0xaf10ec07659cf669c4223c4a9eff8fddc22ad2d6";

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

  return (
    <div>
      <TradingChart />
    </div>
  );
}
