'use client';

import { useCallback, useEffect } from 'react';
import TrendingProfileMarquee from './Widgets/TrendingWidget/TrendingProfileMarquee';
import { useTrendingWebSocket } from '@/app/hooks/useTrendingWebSocket';
import type { TrendingToken } from '@/app/types/token';

export default function TrendingBar() {
  // WebSocket hook for real trending data
  const { 
    isConnected, 
    connectionError, 
    trendingTokens, 
    lastUpdate 
  } = useTrendingWebSocket({
    onTrendingUpdate: useCallback((tokens: TrendingToken[]) => {
      console.log('[TrendingBar] Received trending update:', tokens.length, 'tokens');
    }, []),
    autoConnect: true
  });

  // Only show trending tokens when we have real WebSocket data
  const hasRealData = isConnected && trendingTokens.length > 0;

  // Log connection status for debugging
  useEffect(() => {
    if (isConnected) {
      console.log('[TrendingBar] ✅ WebSocket connected successfully');
    } else {
      console.log('[TrendingBar] ❌ WebSocket disconnected - showing empty trending bar');
    }
  }, [isConnected]);

  // Log when we receive new trending data
  useEffect(() => {
    if (lastUpdate) {
      console.log('[TrendingBar] 📈 Trending data updated:', lastUpdate.tokens.length, 'tokens at', new Date(lastUpdate.timestamp).toISOString());
    }
  }, [lastUpdate]);

  // Log trending data availability
  useEffect(() => {
    console.log('[TrendingBar] 📊 Trending data status:', hasRealData ? 'DATA AVAILABLE' : 'NO DATA - EMPTY BAR');
  }, [hasRealData]);

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
            {hasRealData ? (
              <>
                {/* Left fade overlay */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-24 h-14 bg-gradient-to-r from-[#1c0a00] to-transparent pointer-events-none" />
                
                {/* Show real trending data */}
                <TrendingProfileMarquee tokens={trendingTokens} />
                
                {/* Right fade overlay */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-24 h-14 bg-gradient-to-l from-[#120a01] to-transparent pointer-events-none" />
              </>
            ) : (
              /* Empty state - no tokens to display */
              <div className="flex-1 flex items-center justify-center">
                <span className="text-gray-500 text-sm font-medium">
                  Waiting for trending data...
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
          {hasRealData ? (
            <>
              {/* Left fade overlay (full height) */}
              <div className="absolute left-0 top-0 z-10 w-24 h-full bg-gradient-to-r from-[#1c0a00] to-transparent pointer-events-none" />

              {/* Show real trending data */}
              <TrendingProfileMarquee tokens={trendingTokens} />

              {/* Right fade overlay (full height) */}
              <div className="absolute right-0 top-0 z-10 w-24 h-full bg-gradient-to-l from-[#120a01] to-transparent pointer-events-none" />
            </>
          ) : (
            /* Empty state - no tokens to display */
            <div className="flex-1 flex items-center justify-center">
              <span className="text-gray-500 text-sm font-medium">
                Waiting for trending data...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}