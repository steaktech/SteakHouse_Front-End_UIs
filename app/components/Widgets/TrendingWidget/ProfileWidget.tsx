import React, { memo, useCallback, useMemo } from "react";
import SmartVideo from "../../UI/SmartVideo";

// Define the types for the component props for type safety
export interface ProfileWidgetProps {
  imageUrl: string;
  name: string;
  percentage: number;
  showArrow?: boolean;
  arrowDirection?: "up" | "down";
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
        <div className="flex items-center justify-center">
          {showArrow && (
            <SmartVideo
              webmSrc={arrowWebmSrc}
              mp4Src={arrowMp4Src}
              className="w-6 h-6 drop-shadow-md object-contain"
              aria-hidden
              lazyLoad={true}
            />
          )}
        </div>
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
            className={`text-lg font-bold ${arrowDirection === 'down' ? 'text-red-500' : 'text-green-500'}`}
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

export default ProfileWidget;
