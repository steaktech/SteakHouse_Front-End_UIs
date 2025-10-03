'use client';

import { useCallback, useEffect, useMemo } from 'react';
import TrendingProfileMarquee from './Widgets/TrendingWidget/TrendingProfileMarquee';
import { useTrendingWebSocket } from '@/app/hooks/useTrendingWebSocket';
import { useTrendingApi } from '@/app/hooks/useTrendingApi';
import type { TrendingToken } from '@/app/types/token';

export default function TrendingBar() {
  // API hook for initial trending data
  const {
    data: apiTrendingTokens,
    isLoading: isApiLoading,
    error: apiError,
    isInitialLoading
  } = useTrendingApi({
    fetchOnMount: true,
    onSuccess: useCallback((tokens: TrendingToken[]) => {
      console.log('[TrendingBar] API data loaded:', tokens.length, 'tokens');
    }, []),
    onError: useCallback((error: Error) => {
      console.error('[TrendingBar] API error:', error);
    }, [])
  });

  // WebSocket hook for real trending data
  const { 
    isConnected, 
    connectionError, 
    trendingTokens: wsTrendingTokens, 
    lastUpdate 
  } = useTrendingWebSocket({
    onTrendingUpdate: useCallback((tokens: TrendingToken[]) => {
      console.log('[TrendingBar] Received WebSocket update:', tokens.length, 'tokens');
    }, []),
    autoConnect: true
  });

  // Determine which data source to use
  // Priority: WebSocket data (if connected and has data) > API data > empty
  const trendingTokens = useMemo(() => {
    if (isConnected && wsTrendingTokens.length > 0) {
      console.log('[TrendingBar] Using WebSocket data:', wsTrendingTokens.length, 'tokens');
      return wsTrendingTokens;
    }
    if (apiTrendingTokens.length > 0) {
      console.log('[TrendingBar] Using API data:', apiTrendingTokens.length, 'tokens');
      return apiTrendingTokens;
    }
    console.log('[TrendingBar] No data available');
    return [];
  }, [isConnected, wsTrendingTokens, apiTrendingTokens]);

  // Determine if we have data to display
  const hasData = trendingTokens.length > 0;
  
  // Show loading state only during initial API load
  const isLoading = isInitialLoading && !hasData;

  // Log connection status for debugging
  useEffect(() => {
    if (isConnected) {
      console.log('[TrendingBar] ✅ WebSocket connected successfully');
    } else {
      console.log('[TrendingBar] ⏳ WebSocket not connected - using API data if available');
    }
  }, [isConnected]);

  // Log when we receive new trending data
  useEffect(() => {
    if (lastUpdate) {
      console.log('[TrendingBar] 📈 WebSocket data updated:', lastUpdate.tokens.length, 'tokens at', new Date(lastUpdate.timestamp).toISOString());
    }
  }, [lastUpdate]);

  // Log trending data availability
  useEffect(() => {
    const dataSource = isConnected && wsTrendingTokens.length > 0 ? 'WebSocket' : 
                      apiTrendingTokens.length > 0 ? 'API' : 'None';
    console.log('[TrendingBar] 📊 Data source:', dataSource, '| Tokens:', trendingTokens.length);
  }, [isConnected, wsTrendingTokens, apiTrendingTokens, trendingTokens]);

  return (
    <div>
      {/* --- Desktop Layout (Hidden on Mobile) --- */}
      <div className="hidden md:flex h-16 relative">
        {/* "TRENDING" title section */}
        <div className="flex-none w-50 h-17 -mt-1 flex items-center z-15 justify-start pl-4 relative" style={{backgroundImage: 'url(/images/bull-bar.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
          <h2 className="text-[#F7F0D4] font-bold text-lg">
            TRENDING
          </h2>
        </div>

        {/* Main bar with bull image and scrolling profiles */}
        <div className="flex-grow bg-black/20 backdrop-blur-lg rounded-l-full -ml-15 z-10 h-18 -mt-1 flex items-center">
          {/* <Image
            src="/images/bull.png"
            alt="Bull"
            width={120}
            height={110}
            className="-ml-6 -mt-3 h-full w-auto object-contain flex-shrink-0"
          /> */}

          {/* This container will take up the rest of the available space. */}
          <div className="flex-1 relative flex items-center overflow-hidden w-2 h-full">
            {isLoading ? (
              /* Loading state */
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-500 text-sm font-medium">
                    Loading trending data...
                  </span>
                </div>
              </div>
            ) : hasData ? (
              <>
                {/* Left fade overlay */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-24 h-14 bg-gradient-to-r from-[#1c0a00] to-transparent pointer-events-none" />
                
                {/* Show trending data */}
                <TrendingProfileMarquee tokens={trendingTokens} />
                
                {/* Right fade overlay */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-24 h-14 bg-gradient-to-l from-[#120a01] to-transparent pointer-events-none" />
              </>
            ) : (
              /* Empty state - no tokens to display */
              <div className="flex-1 flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">
                  {apiError ? 'Failed to load trending data' : 'No trending data available'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Mobile Layout (Visible ONLY on Mobile) --- */}
      <div className="md:hidden">
        {/* "TRENDING" title section (full width) */}
        <div className="h-16 bg-[#3d1e01] flex items-center justify-center">
          <h2 className="text-[#F7F0D4] font-bold text-lg">
            TRENDING
          </h2>
        </div>

        {/* Marquee section (full width, below title) */}
        <div className="h-16 bg-black/20 backdrop-blur-lg relative flex items-center overflow-hidden">
          {isLoading ? (
            /* Loading state */
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-500 text-sm font-medium">
                  Loading trending data...
                </span>
              </div>
            </div>
          ) : hasData ? (
            <>
              {/* Left fade overlay (full height) */}
              <div className="absolute left-0 top-0 z-10 w-24 h-full bg-gradient-to-r from-[#1c0a00] to-transparent pointer-events-none" />

              {/* Show trending data */}
              <TrendingProfileMarquee tokens={trendingTokens} />

              {/* Right fade overlay (full height) */}
              <div className="absolute right-0 top-0 z-10 w-24 h-full bg-gradient-to-l from-[#120a01] to-transparent pointer-events-none" />
            </>
          ) : (
            /* Empty state - no tokens to display */
            <div className="flex-1 flex items-center justify-center">
              <span className="text-gray-500 text-sm font-medium">
                {apiError ? 'Failed to load trending data' : 'No trending data available'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}