import React from 'react';

// Define the types for the component props for type safety with TypeScript
interface ProfileWidgetProps {
  imageUrl: string;
  name: string;
  percentage: number;
  showArrow?: boolean;
}

// SVG component for the green up-arrow icon
const UpArrowIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6 text-green-500  drop-shadow-md"
  >
    <path
      d="M12 19V5M12 5L5 12M12 5L19 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14V5M12 5L5 12M12 5L19 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      transform="translate(0, -5)"
    />
  </svg>
);

// The main ProfileWidget component
const ProfileWidget: React.FC<ProfileWidgetProps> = ({
  imageUrl,
  name,
  percentage,
  showArrow = true,
}) => {
  return (
    <>
      {/* Inject custom styles for fire gif border */}
      <style jsx>{`
        .fire-border {
          position: relative;
          display: inline-block;
          border-radius: 40%;
          padding: 5px;
          background-image: url('/images/fire.gif');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .fire-border::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 50%;
          background-image: url('/images/fire.gif');
          background-size: 120% 120%;
          background-position: center;
          background-repeat: no-repeat;
          z-index: -1;
        }
      `}</style>
      
      <div className="flex items-center justify-center p-4 space-x-3 font-sans">
        {/* Conditionally render the arrow icon */}
        {showArrow && <UpArrowIcon />}

        {/* Container for the avatar with the fire animation */}
        <div className="fire-border">
          <img
            src={imageUrl}
            alt={`${name}'s profile`}
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-800"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // prevent infinite loop
              target.src = `https://placehold.co/48x48/2d3748/ffffff?text=${name.charAt(0)}`;
            }}
          />
        </div>

        {/* Text elements */}
        <div className="flex items-center space-x-1">
          <span className="text-lg font-extrabold text-yellow-500" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}>
            {name.toUpperCase()}
          </span>
          <span className="text-lg font-bold text-green-500" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}>
            {percentage}%
          </span>
        </div>
      </div>
    </>
  );
};

export default ProfileWidget;