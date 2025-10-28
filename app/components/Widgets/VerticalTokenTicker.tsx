"use client";

import React, { useMemo, useCallback } from "react";
import type { CSSProperties } from "react";
import { useTrendingApi } from "@/app/hooks/useTrendingApi";
import { useTrendingWebSocket } from "@/app/hooks/useTrendingWebSocket";
import type { TrendingToken } from "@/app/types/token";
import VerticalTokenItem from "./VerticalTokenItem";
import "./VerticalTicker.css";

export interface VerticalTokenTickerProps {
  direction?: "up" | "down";
  className?: string;
  /** Total animation duration in seconds (matches horizontal marquee) */
  speedSec?: number;
  /** Max tokens to show (before duplication for seamless scroll) */
  maxItems?: number;
}

function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const EmptyState = ({ heightClass = "h-full" }: { heightClass?: string }) => (
  <div className={`flex items-center justify-center ${heightClass}`}>
    <span className="text-xs text-gray-500">No trending data</span>
  </div>
);

const VerticalTokenTicker: React.FC<VerticalTokenTickerProps> = ({
  direction = "up",
  className,
  speedSec = 35,
  maxItems = 10,
}) => {
  const { data: apiTrendingTokens, isInitialLoading } = useTrendingApi({ fetchOnMount: true });
  const { isConnected, trendingTokens: wsTrendingTokens, lastUpdate } = useTrendingWebSocket({ autoConnect: true });

  const baseTokens: TrendingToken[] = useMemo(() => {
    if (isConnected && wsTrendingTokens.length > 0) return wsTrendingTokens;
    return apiTrendingTokens;
  }, [isConnected, wsTrendingTokens, apiTrendingTokens]);

  // Re-shuffle whenever the list changes or a new WS snapshot arrives
  const randomized = useMemo(() => {
    return shuffle(baseTokens);
  }, [baseTokens, lastUpdate?.timestamp]);

  const visible = useMemo(() => randomized.slice(0, Math.max(1, Math.min(maxItems, randomized.length))), [randomized, maxItems]);

  const duplicated = useMemo(() => {
    const copies = 4; // increase copies for seamless coverage
    const out: TrendingToken[] = [] as any;
    for (let i = 0; i < copies; i++) out.push(...visible);
    return out;
  }, [visible]);

  const scrollerStyle: CSSProperties = useMemo(() => ({
    ['--vticker-duration' as any]: `${speedSec}s`,
  }), [speedSec]);

  const animateClass = direction === "up" ? "animate-vticker-up" : "animate-vticker-down";

  const hasData = duplicated.length > 0;

  return (
    <div className={`relative h-full overflow-hidden pointer-events-none inline-flex ${className ?? ""}`}>
      {/* Gradient fade masks */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 z-10" style={{
        background: "linear-gradient(to bottom, rgba(7,4,11,1), rgba(7,4,11,0))",
      }} />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 z-10" style={{
        background: "linear-gradient(to top, rgba(7,4,11,1), rgba(7,4,11,0))",
      }} />

      {/* Scroller (not absolute so container sizes to content width) */}
      <div className={`relative w-max vticker-paused ${animateClass}`} style={scrollerStyle}>
        <div className="flex flex-col gap-2 py-2 pr-0">
          {hasData ? (
            duplicated.map((t, idx) => (
              <VerticalTokenItem key={`${t.token_address}-${idx}`} token={t} />
            ))
          ) : (
            isInitialLoading ? (
              // Simple skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="pointer-events-none">
                  <div className="h-10 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
                </div>
              ))
            ) : (
              <EmptyState heightClass="h-[120px]" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default VerticalTokenTicker;
