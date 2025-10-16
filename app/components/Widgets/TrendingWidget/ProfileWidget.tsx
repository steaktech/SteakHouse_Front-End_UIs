import React, { memo, useCallback, useMemo } from "react";
import { useRouter } from 'next/navigation';
import SmartVideo from "../../UI/SmartVideo";
import type { TrendingToken } from "@/app/types/token";

// Define the types for the component props for type safety
export interface ProfileWidgetProps {
  imageUrl: string;
  name: string;
  percentage: number;
  showArrow?: boolean;
  arrowDirection?: "up" | "down";
}

// Extended props for trending tokens from WebSocket
export interface TrendingProfileWidgetProps {
  token: TrendingToken;
  showArrow?: boolean;
}

// Up arrow indicator is now a short looping video rendered via SmartVideo

const ProfileWidget: React.FC<ProfileWidgetProps> = memo(
  ({ imageUrl, name, percentage, showArrow = true, arrowDirection = "up" }) => {
    // Memoize the error handler to prevent recreation on each render
    const handleImageError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null; // prevent infinite loop
        target.src = `https://placehold.co/48x48/2d3748/ffffff?text=${name.charAt(
          0
        )}`;
      },
      [name]
    );

    // Memoize the alt text to prevent recreation
    const altText = useMemo(() => `${name}'s profile`, [name]);

    // Memoize the uppercase name to prevent recreation
    const uppercaseName = useMemo(() => name.toUpperCase(), [name]);

    // Memoize inline styles to prevent recreation
    const textShadowStyle = useMemo(
      () => ({
        textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
      }),
      []
    );

    const isUp = arrowDirection === "up";
    const arrowWebmSrc = isUp
      ? "/videos/up/sh-arrows-up.webm"
      : "/videos/down/sh-arrows-down.webm";
    const arrowMp4Src = isUp
      ? "/videos/up/sh-arrows-up.mp4"
      : "/videos/down/sh-arrows-down.mp4";

    return (
      /* 'flex-shrink-0' is important to prevent items from shrinking in the marquee */
      <div className="flex flex-shrink-0 items-center justify-center p-4 space-x-2 font-sans">
        <span className="-mt-3">
          {showArrow && (
            <SmartVideo
              webmSrc={arrowWebmSrc}
              mp4Src={arrowMp4Src}
              className="w-6 h-6 drop-shadow-md object-contain"
              aria-hidden
              lazyLoad={true}
            />
          )}
        </span>
        <div className="profile-widget-fire-border">
          <img
            src={imageUrl}
            alt={altText}
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-800"
            onError={handleImageError}
            loading="lazy" // Add lazy loading for better performance
          />
        </div>

        <div className="flex items-center space-x-1">
          <span
            className="text-lg font-extrabold text-yellow-500"
            style={textShadowStyle}
          >
            {uppercaseName}
          </span>
          <span
            className="text-lg font-bold text-green-500"
            style={textShadowStyle}
          >
            {percentage}%
          </span>
        </div>
      </div>
    );
  }
);

ProfileWidget.displayName = "ProfileWidget";

// TrendingProfileWidget component for WebSocket trending tokens
const TrendingProfileWidget: React.FC<TrendingProfileWidgetProps> = memo(
  ({ token, showArrow = true }) => {
    const router = useRouter();
    
    // Determine arrow direction based on price change (treat null as 0)
    const arrowDirection = (token.price_change_24h ?? 0) >= 0 ? "up" : "down";
    
    // Format the trending score as percentage
    const percentage = Math.round(token.trending_score);
    
    // Use fallback image if image_url is null
    const imageUrl = token.image_url || `https://placehold.co/48x48/2d3748/ffffff?text=${token.symbol.charAt(0)}`;
    
    // Handle click to navigate to trading chart page
    const handleClick = useCallback(() => {
      router.push(`/trading-chart/${token.token_address}`);
    }, [router, token.token_address]);
    
    // Memoize the error handler to prevent recreation on each render
    const handleImageError = useCallback(
      (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null; // prevent infinite loop
        target.src = `https://placehold.co/48x48/2d3748/ffffff?text=${token.symbol.charAt(0)}`;
      },
      [token.symbol]
    );

    // Memoize the alt text to prevent recreation
    const altText = useMemo(() => `${token.symbol}'s profile`, [token.symbol]);

    // Memoize the uppercase symbol to prevent recreation
    const uppercaseSymbol = useMemo(() => token.symbol.toUpperCase(), [token.symbol]);

    // Memoize inline styles to prevent recreation
    const textShadowStyle = useMemo(
      () => ({
        textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
      }),
      []
    );

    const isUp = arrowDirection === "up";
    const arrowWebmSrc = isUp
      ? "/videos/up/sh-arrows-up.webm"
      : "/videos/down/sh-arrows-down.webm";
    const arrowMp4Src = isUp
      ? "/videos/up/sh-arrows-up.mp4"
      : "/videos/down/sh-arrows-down.mp4";

    // Color for price change percentage (treat null as 0)
    const priceChangeColor = (token.price_change_24h ?? 0) >= 0 ? "text-green-500" : "text-red-500";

    return (
      /* 'flex-shrink-0' is important to prevent items from shrinking in the marquee */
      <div 
        className="flex flex-shrink-0 items-center justify-center p-4 space-x-2 font-sans cursor-pointer hover:scale-105 transition-transform duration-200 ease-out"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`View ${token.symbol} trading chart`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <span className="-mt-3">
          {showArrow && (
            <SmartVideo
              webmSrc={arrowWebmSrc}
              mp4Src={arrowMp4Src}
              className="w-6 h-6 drop-shadow-md object-contain"
              aria-hidden
              lazyLoad={true}
            />
          )}
        </span>
        <div className="profile-widget-fire-border">
          <img
            src={imageUrl}
            alt={altText}
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-800"
            onError={handleImageError}
            loading="lazy" // Add lazy loading for better performance
          />
        </div>

        <div className="flex items-center space-x-1">
          <span
            className="text-lg font-extrabold text-yellow-500"
            style={textShadowStyle}
          >
            {uppercaseSymbol}
          </span>
          <span
            className={`text-lg font-bold ${priceChangeColor}`}
            style={textShadowStyle}
          >
            {percentage}%
          </span>
        </div>
      </div>
    );
  }
);

TrendingProfileWidget.displayName = "TrendingProfileWidget";

export default ProfileWidget;
export { TrendingProfileWidget };
