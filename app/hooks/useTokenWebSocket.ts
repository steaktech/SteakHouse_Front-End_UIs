"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { WebSocketTrade, ChartUpdateEvent } from '@/app/types/token';

interface UseTokenWebSocketProps {
  tokenAddress: string | null;
  resolution?: string;
  onTrade?: (trade: WebSocketTrade) => void;
  onChartUpdate?: (update: ChartUpdateEvent) => void;
}

interface UseTokenWebSocketReturn {
  isConnected: boolean;
  connectionError: string | null;
  lastTrade: WebSocketTrade | null;
  lastChartUpdate: ChartUpdateEvent | null;
}

export function useTokenWebSocket({
  tokenAddress,
  resolution = '1m',
  onTrade,
  onChartUpdate,
}: UseTokenWebSocketProps): UseTokenWebSocketReturn {
  const socketRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastTrade, setLastTrade] = useState<WebSocketTrade | null>(null);
  const [lastChartUpdate, setLastChartUpdate] = useState<ChartUpdateEvent | null>(null);
  const subscribedTokenRef = useRef<string | null>(null);
  const subscribedResolutionRef = useRef<string | null>(null);

  // Initialize WebSocket connection
  const initializeConnection = useCallback(() => {
    // Prevent multiple connections
    if (socketRef.current) {
      console.log('WebSocket already exists, skipping initialization');
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_BASE_URL;
    
    if (!wsUrl) {
      const error = 'NEXT_PUBLIC_WEBSOCKET_BASE_URL environment variable is not set';
      console.error(error);
      setConnectionError(error);
      return;
    }

    try {
      console.log('Initializing WebSocket connection to:', wsUrl);
      
      // Create socket connection (simplified to match working example)
      socketRef.current = io(wsUrl, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      const socket = socketRef.current;

      // Connection event handlers
      socket.on('connect', () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionError(null);
      });

      socket.on('disconnect', (reason: string) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
        subscribedTokenRef.current = null;
      });

      socket.on('connect_error', (error: Error) => {
        console.error('WebSocket connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      // Trade event handler
      const emitTrade = (trade: any) => {
        try {
          console.log('New trade received:', trade);
          setLastTrade(trade as WebSocketTrade);
          onTrade?.(trade as WebSocketTrade);
        } catch (e) {
          console.error('Trade handler error:', e);
        }
      };
      socket.on('trade', emitTrade);

      // Chart update event handler
      socket.on('chartUpdate', (update: ChartUpdateEvent) => {
        console.log('Chart update received:', update);
        setLastChartUpdate(update);
        onChartUpdate?.(update);
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize WebSocket connection';
      console.error('WebSocket initialization error:', error);
      setConnectionError(errorMessage);
    }
  }, []); // Remove dependencies to prevent recreation

  // Subscribe to token updates
  const subscribeToToken = useCallback((address: string, res: string) => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return;
    }

    const normalizedAddress = address.toLowerCase();
    
    // Unsubscribe from previous token if different
    if (subscribedTokenRef.current && (subscribedTokenRef.current !== normalizedAddress || subscribedResolutionRef.current !== res)) {
      console.log('Unsubscribing from previous token:', subscribedTokenRef.current, 'resolution:', subscribedResolutionRef.current);
      try {
        socket.emit('unsubscribe', { tokenAddress: subscribedTokenRef.current, resolution: subscribedResolutionRef.current });
      } catch (err) {
        console.error('Unsubscribe error:', err);
      }
    }

    // Subscribe to new token with resolution
    console.log('Subscribing to token:', normalizedAddress, 'with resolution:', res);
    try {
      socket.emit('subscribe', { tokenAddress: normalizedAddress, resolution: String(res) });
    } catch (err) {
      console.error('Subscribe error:', err);
    }
    subscribedTokenRef.current = normalizedAddress;
    subscribedResolutionRef.current = res;
  }, []);

  // Unsubscribe from token updates
  const unsubscribeFromToken = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !subscribedTokenRef.current) {
      return;
    }

    console.log('Unsubscribing from token:', subscribedTokenRef.current, 'resolution:', subscribedResolutionRef.current);
    try {
      socket.emit('unsubscribe', { tokenAddress: subscribedTokenRef.current, resolution: subscribedResolutionRef.current });
    } catch (err) {
      console.error('Unsubscribe error:', err);
    }
    subscribedTokenRef.current = null;
    subscribedResolutionRef.current = null;
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    initializeConnection();

    return () => {
      // Cleanup on unmount
      if (socketRef.current) {
        console.log('Cleaning up WebSocket connection on unmount');
        if (subscribedTokenRef.current) {
          console.log('Unsubscribing from token:', subscribedTokenRef.current, 'resolution:', subscribedResolutionRef.current);
          try {
            socketRef.current.emit('unsubscribe', { tokenAddress: subscribedTokenRef.current, resolution: subscribedResolutionRef.current });
          } catch (err) {
            console.error('Unsubscribe error:', err);
          }
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      subscribedTokenRef.current = null;
      subscribedResolutionRef.current = null;
    };
  }, []); // Remove dependencies to prevent re-initialization

  // Handle token address changes
  useEffect(() => {
    if (!tokenAddress) {
      if (subscribedTokenRef.current) {
        console.log('No token address, unsubscribing from:', subscribedTokenRef.current);
        try {
          socketRef.current?.emit('unsubscribe', { tokenAddress: subscribedTokenRef.current, resolution: subscribedResolutionRef.current });
        } catch (err) {
          console.error('Unsubscribe error:', err);
        }
        subscribedTokenRef.current = null;
        subscribedResolutionRef.current = null;
      }
      return;
    }

    if (isConnected && socketRef.current) {
      const normalizedAddress = tokenAddress.toLowerCase();
      
      // Subscribe if we're not already subscribed to this token with this resolution
      if (subscribedTokenRef.current !== normalizedAddress || subscribedResolutionRef.current !== resolution) {
        // Unsubscribe from previous token if different
        if (subscribedTokenRef.current) {
          console.log('Unsubscribing from previous token:', subscribedTokenRef.current, 'resolution:', subscribedResolutionRef.current);
          try {
            socketRef.current.emit('unsubscribe', { tokenAddress: subscribedTokenRef.current, resolution: subscribedResolutionRef.current });
          } catch (err) {
            console.error('Unsubscribe error:', err);
          }
        }

        // Subscribe to new token with resolution
        console.log('Subscribing to token:', normalizedAddress, 'with resolution:', resolution);
        try {
          socketRef.current.emit('subscribe', { tokenAddress: normalizedAddress, resolution: String(resolution) });
        } catch (err) {
          console.error('Subscribe error:', err);
        }
        subscribedTokenRef.current = normalizedAddress;
        subscribedResolutionRef.current = resolution;
      }
    }
  }, [tokenAddress, resolution, isConnected]);

  // Handle page visibility changes (subscribe/unsubscribe on tab focus/blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is now hidden - keep subscription active as per requirements
        console.log('Page hidden - keeping WebSocket subscription active');
      } else {
        // Page is now visible - ensure we're still subscribed
        console.log('Page visible - ensuring WebSocket subscription is active');
        if (tokenAddress && isConnected && socketRef.current && !subscribedTokenRef.current) {
          const normalizedAddress = tokenAddress.toLowerCase();
          console.log('Re-subscribing to token after page became visible:', normalizedAddress, 'with resolution:', resolution);
          try {
            socketRef.current.emit('subscribe', { tokenAddress: normalizedAddress, resolution: String(resolution) });
          } catch (err) {
            console.error('Subscribe error:', err);
          }
          subscribedTokenRef.current = normalizedAddress;
          subscribedResolutionRef.current = resolution;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [tokenAddress, resolution, isConnected]);

  return {
    isConnected,
    connectionError,
    lastTrade,
    lastChartUpdate,
  };
}
