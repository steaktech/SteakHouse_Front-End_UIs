"use client";

import React, { memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { TrendingToken } from "@/app/types/token";
import SmartVideo from "../UI/SmartVideo";

interface VerticalTokenItemProps {
  token: TrendingToken;
  compact?: boolean;
}

const VerticalTokenItem: React.FC<VerticalTokenItemProps> = memo(({ token, compact = true }) => {
  const router = useRouter();

  const handleClick = useCallback(() => {
    router.push(`/trading-chart/${token.token_address}`);
  }, [router, token.token_address]);

  const isUp = (token.price_change_24h ?? 0) >= 0;
  const arrowWebmSrc = isUp ? "/videos/up/sh-arrows-up.webm" : "/videos/down/sh-arrows-down.webm";
  const arrowMp4Src = isUp ? "/videos/up/sh-arrows-up.mp4" : "/videos/down/sh-arrows-down.mp4";

  const percentage = Math.round(token.trending_score);
  const priceChangeColor = isUp ? "text-green-500" : "text-red-500";

  const imageUrl = token.image_url || `https://placehold.co/48x48/2d3748/ffffff?text=${token.symbol.charAt(0)}`;
  const altText = useMemo(() => `${token.symbol} logo`, [token.symbol]);

  return (
    <div
      className="pointer-events-auto w-fit"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
    >
      <div className="flex items-center gap-2 rounded-xl border border-[#daa20b]/30 bg-black/20 px-2 py-2 hover:bg-black/30 transition-colors">
        <SmartVideo
          webmSrc={arrowWebmSrc}
          mp4Src={arrowMp4Src}
          className="w-4 h-4 shrink-0"
          aria-hidden
          lazyLoad
        />
        <img
          src={imageUrl}
          alt={altText}
          className="w-7 h-7 rounded-full object-cover border border-slate-700"
          loading="lazy"
        />
        <span className={`text-[11px] font-extrabold ${priceChangeColor}`}>{percentage}%</span>
      </div>
    </div>
  );
});

VerticalTokenItem.displayName = "VerticalTokenItem";

export default VerticalTokenItem;
