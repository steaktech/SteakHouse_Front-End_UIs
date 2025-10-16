"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { TrendingToken, TrendingSnapshot } from '@/app/types/token';

interface UseTrendingWebSocketProps {
  onTrendingUpdate?: (tokens: TrendingToken[]) => void;
  autoConnect?: boolean;
}

interface UseTrendingWebSocketReturn {
  isConnected: boolean;
  connectionError: string | null;
  trendingTokens: TrendingToken[];
  lastUpdate: TrendingSnapshot | null;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Custom hook for managing trending tokens WebSocket connection
 * 
 * This hook connects to the WebSocket endpoint and listens for 'trendingSnapshot' events
 * which provide real-time trending token data. It follows the same pattern as useTokenWebSocket
 * but is specifically designed for trending data.
 * 
 * Expected WebSocket event format:
 * socket.on('trendingSnapshot', (data: TrendingToken[]) => { ... })
 * 
 * Where TrendingToken contains:
 * - token_address: string
 * - trending_score: number
 * - symbol: string  
 * - image_url: string | null
 * - price_change_24h: number
 * 
 * Features:
 * - Auto-connect on mount (configurable)
 * - Automatic reconnection with exponential backoff
 * - Proper cleanup on unmount
 * - Error handling and fallback states
 * - Real-time state updates
 */
export function useTrendingWebSocket({
  onTrendingUpdate,
  autoConnect = true,
}: UseTrendingWebSocketProps): UseTrendingWebSocketReturn {
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [lastUpdate, setLastUpdate] = useState<TrendingSnapshot | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false);

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    // Prevent multiple connections
    if (socketRef.current || isConnectingRef.current) {
      console.log('Trending WebSocket already exists or connecting, skipping initialization');
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_BASE_URL;
    
    if (!wsUrl) {
      const error = 'NEXT_PUBLIC_WEBSOCKET_BASE_URL environment variable is not set';
      console.error('[TrendingWS]', error);
      setConnectionError(error);
      return;
    }

    try {
      console.log('[TrendingWS] Initializing WebSocket connection to:', wsUrl);
      isConnectingRef.current = true;
      
      // Create socket connection
      socketRef.current = io(wsUrl, {
        transports: ["websocket"],
        secure: true,
        reconnection: true,
        rejectUnauthorized: false,
        timeout: 10000,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      } as any);

      const socket = socketRef.current;

      // Connection event handlers
      socket.on('connect', () => {
        console.log('[TrendingWS] WebSocket connected successfully');
        setIsConnected(true);
        setConnectionError(null);
        isConnectingRef.current = false;
      });

      socket.on('disconnect', (reason: string) => {
        console.log('[TrendingWS] WebSocket disconnected:', reason);
        setIsConnected(false);
        isConnectingRef.current = false;
      });

      socket.on('connect_error', (error: Error) => {
        console.error('[TrendingWS] WebSocket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        isConnectingRef.current = false;
      });

      // Trending snapshot event handler
      socket.on('trendingSnapshot', (data: TrendingToken[]) => {
        console.log('[TrendingWS] Trending snapshot received:', data?.length, 'tokens');
        
        if (Array.isArray(data)) {
          const snapshot: TrendingSnapshot = {
            tokens: data,
            timestamp: Date.now()
          };
          
          setTrendingTokens(data);
          setLastUpdate(snapshot);
          onTrendingUpdate?.(data);
        } else {
          console.warn('[TrendingWS] Invalid trending data received:', data);
        }
      });

      // Error event handler
      socket.on('error', (error: any) => {
        console.error('[TrendingWS] Socket error:', error);
        setConnectionError(error?.message || 'Unknown socket error');
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize trending WebSocket connection';
      console.error('[TrendingWS] WebSocket initialization error:', error);
      setConnectionError(errorMessage);
      isConnectingRef.current = false;
    }
  }, [onTrendingUpdate]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[TrendingWS] Disconnecting WebSocket');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setConnectionError(null);
      isConnectingRef.current = false;
    }
  }, []);

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    connectionError,
    trendingTokens,
    lastUpdate,
    connect,
    disconnect,
  };
}
