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
  /** Seconds per item for scroll duration */
  speedPerItemSec?: number;
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
  speedPerItemSec = 1.4,
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

  const duplicated = useMemo(() => [...visible, ...visible], [visible]);

  const durationSec = Math.max(visible.length, 1) * speedPerItemSec;

  const scrollerStyle: CSSProperties = useMemo(() => ({
    ['--vticker-duration' as any]: `${durationSec}s`,
  }), [durationSec]);

  const animateClass = direction === "up" ? "animate-vticker-up" : "animate-vticker-down";

  const hasData = duplicated.length > 0;

  return (
    <div className={`relative h-full overflow-hidden pointer-events-none ${className ?? ""}`}>
      {/* Gradient fade masks */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 z-10" style={{
        background: "linear-gradient(to bottom, rgba(7,4,11,1), rgba(7,4,11,0))",
      }} />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 z-10" style={{
        background: "linear-gradient(to top, rgba(7,4,11,1), rgba(7,4,11,0))",
      }} />

      {/* Scroller */}
      <div className={`absolute inset-0 vticker-paused ${animateClass}`} style={scrollerStyle}>
        <div className="flex flex-col gap-2 py-2 pr-1">
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
