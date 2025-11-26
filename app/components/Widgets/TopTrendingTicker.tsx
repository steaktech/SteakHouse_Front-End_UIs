"use client";

import React, { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useTrendingApi } from "@/app/hooks/useTrendingApi";
import { useTrendingWebSocket } from "@/app/hooks/useTrendingWebSocket";
import type { TrendingToken } from "@/app/types/token";
import SmartVideo from "../UI/SmartVideo";
import "../Widgets/TrendingWidget/ProfileMarquee.css";

interface TopTrendingTickerProps {
  maxItems?: number; // number of tokens to show before duplication
  speedSec?: number; // total animation duration
}

const Chip: React.FC<{ token: TrendingToken }> = ({ token }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const router = useRouter();
  const isUp = (token.price_change_24h ?? 0) >= 0;
  const arrowWebmSrc = isUp ? "/videos/up/sh-arrows-up.webm" : "/videos/down/sh-arrows-down.webm";
  const arrowMp4Src = isUp ? "/videos/up/sh-arrows-up.mp4" : "/videos/down/sh-arrows-down.mp4";
  const img = token.image_url || `https://placehold.co/32x32/2d3748/ffffff?text=${token.symbol.charAt(0)}`;
  const pct = Math.round(token.trending_score);

  const go = useCallback(() => {
    router.push(`/trading-chart/${token.token_address}`);
  }, [router, token.token_address]);

  return (
    <div
      onClick={go}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }}
      className={`flex items-center gap-2 px-2 py-1 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${isLight ? 'bg-white/60 border-[#e6ccb2] hover:bg-white/80' : 'bg-black/20 border-[#daa20b]/30 hover:bg-black/30'}`}
      style={{ height: 32 }}
    >
      <SmartVideo webmSrc={arrowWebmSrc} mp4Src={arrowMp4Src} className="w-4 h-4" aria-hidden lazyLoad />
      <img src={img} alt={`${token.symbol} logo`} className="w-6 h-6 rounded-full object-cover border border-slate-700" loading="lazy" />
      <span className={`text-[11px] font-bold tracking-wide ${isLight ? 'text-[#2b1200]' : 'text-[#F7F0D4]'}`}>{token.symbol.toUpperCase()}</span>
      <span className={`text-[11px] font-extrabold ${isUp ? 'text-green-500' : 'text-red-500'}`}>{pct}%</span>
    </div>
  );
};

export const TopTrendingTicker: React.FC<TopTrendingTickerProps> = ({ maxItems = 8, speedSec = 35 }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { data: apiTrendingTokens, isInitialLoading } = useTrendingApi({ fetchOnMount: true });
  const { isConnected, trendingTokens: wsTrendingTokens } = useTrendingWebSocket({ autoConnect: true });

  const tokens: TrendingToken[] = useMemo(() => {
    if (isConnected && wsTrendingTokens.length) return wsTrendingTokens;
    return apiTrendingTokens;
  }, [isConnected, wsTrendingTokens, apiTrendingTokens]);

  const show = useMemo(() => tokens.slice(0, maxItems), [tokens, maxItems]);
  const dup = useMemo(() => {
    const copies = 4; // extra copies for seamless continuous scroll
    const out: TrendingToken[] = [] as any;
    for (let i = 0; i < copies; i++) out.push(...show);
    return out;
  }, [show]);

  return (
    <div className="relative w-full" style={{ height: 44 }}>
      {/* Track container */}
      <div className={`h-full backdrop-blur-lg rounded-full overflow-hidden ${isLight ? 'bg-white/40 border border-[#F9F0E6]' : 'bg-black/20'}`}>
        <div className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r pointer-events-none z-10 ${isLight ? 'from-[#F9F0E6] to-transparent' : 'from-[#07040b] to-transparent'}`} />
        <div className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l pointer-events-none z-10 ${isLight ? 'from-[#F9F0E6] to-transparent' : 'from-[#07040b] to-transparent'}`} />

        {isInitialLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : dup.length ? (
          <div className="h-full flex items-center">
            <div className="inline-flex items-center gap-3 animate-marquee whitespace-nowrap w-max" style={{ ['--marquee-duration' as any]: `${speedSec}s` }}>
              {dup.map((t, i) => (
                <div key={`${t.token_address}-${i}`} className="flex-shrink-0">
                  <Chip token={t} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-xs text-gray-500">No trending data</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopTrendingTicker;
