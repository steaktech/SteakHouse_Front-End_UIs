import React, { memo, useCallback, useMemo } from 'react';

// Define the types for the component props for type safety
export interface ProfileWidgetProps {
  imageUrl: string;
  name: string;
  percentage: number;
  showArrow?: boolean;
}

// SVG component for the green up-arrow icon - memoized for performance
const UpArrowIcon: React.FC = memo(() => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6 text-green-500 drop-shadow-md"
  >
    <path
      d="M12 19V5M12 5L5 12M12 5L19 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
));

UpArrowIcon.displayName = 'UpArrowIcon';

const ProfileWidget: React.FC<ProfileWidgetProps> = memo(({
  imageUrl,
  name,
  percentage,
  showArrow = true,
}) => {
  // Memoize the error handler to prevent recreation on each render
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; // prevent infinite loop
    target.src = `https://placehold.co/48x48/2d3748/ffffff?text=${name.charAt(0)}`;
  }, [name]);

  // Memoize the alt text to prevent recreation
  const altText = useMemo(() => `${name}'s profile`, [name]);
  
  // Memoize the uppercase name to prevent recreation
  const uppercaseName = useMemo(() => name.toUpperCase(), [name]);

  // Memoize inline styles to prevent recreation
  const textShadowStyle = useMemo(() => ({ 
    textShadow: '1px 1px 2px rgba(0,0,0,0.4)' 
  }), []);

  return (
    /* 'flex-shrink-0' is important to prevent items from shrinking in the marquee */
    <div className="flex flex-shrink-0 items-center justify-center p-4 space-x-2 font-sans">
      {showArrow && <UpArrowIcon />}

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
});

ProfileWidget.displayName = 'ProfileWidget';

export default ProfileWidget;