import React from 'react';

// SVG Icon component for the arrows
// This makes it easy to manage the different arrow styles
const ArrowIcon = ({ type }: { type: 'left' | 'right' | 'up' | 'down' }) => {
  const iconStyles = "w-8 h-8 text-[#E5D9D0]"; // Base style for icons

  switch (type) {
    case 'left':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      );
    case 'right':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      );
    case 'up':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={iconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
        );
    case 'down':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={iconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        );
    default:
      return null;
  }
};

// The main button component
const ControlButton = ({ type }: { type: 'left' | 'right' | 'up' | 'down' }) => {
    // Base classes for all buttons
    const baseClasses = "rounded-full flex items-center justify-center transition-all duration-200 ease-in-out transform focus:outline-none";
    
    // Specific styles for each button type
    const buttonStyles = {
        'left': 'w-12 h-12 bg-[#3A2D24] shadow-lg hover:bg-[#4a3a2f] active:scale-95',
        'right': 'w-12 h-12 bg-[#3A2D24] shadow-lg hover:bg-[#4a3a2f] active:scale-95',
        'up': 'w-12 h-12 bg-[#3A2D24] shadow-lg hover:bg-[#4a3a2f] active:scale-95',
        'down': 'w-12 h-12 bg-[#3A2D24] shadow-lg hover:bg-[#4a3a2f] active:scale-95',
    };

    return (
        <button className={`${baseClasses} ${buttonStyles[type]}`}>
            <ArrowIcon type={type} />
        </button>
    );
};

// The Bottom Control Bar component
export default function BottomControlBar() {
  return (
    <div className="w-full">
      <div className="bg-gradient-to-b from-[#532301] to-[#863c04] p-4 rounded-xl flex items-center justify-between">
        {/* Left section - can be used for other controls */}
        <div className="flex-1"></div>
        
        {/* Center section - Arrow controls */}
        <div className="flex justify-center items-center space-x-4">
          {/* Left Button */}
          <ControlButton type="left" />

          {/* Vertical column for Up and Down buttons */}
          <div className="flex flex-col items-center space-y-4">
            <ControlButton type="up" />
            <ControlButton type="down" />
          </div>

          {/* Right Button */}
          <ControlButton type="right" />
        </div>
        
        {/* Right section - can be used for other controls */}
        <div className="flex-1"></div>
      </div>
    </div>
  );
}
