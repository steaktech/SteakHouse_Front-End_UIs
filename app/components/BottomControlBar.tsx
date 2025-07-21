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

// Define the type for our SVG icon props
type IconProps = {
  className?: string;
};

// --- SVG Icon Components for Footer ---
const DiscordIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.54 0c-.88 0-1.72.33-2.37.94l-1.58 1.48-1.1 1.03c-3.18 2.97-6.36 5.94-9.54 8.91-.45.42-.87.87-1.28 1.34-.41.47-.8 1-.8 1.58v.02c0 .58.39 1.11.8 1.58.41.47.83.92 1.28 1.34 3.18 2.97 6.36 5.94 9.54 8.91l1.1 1.03 1.58 1.48c.65.61 1.49.94 2.37.94s1.72-.33 2.37-.94c.65-.61.98-1.4.98-2.24V2.24c0-.84-.33-1.63-.98-2.24-.65-.61-1.49-.94-2.37-.94zM8.32 12c.79 0 1.44.64 1.44 1.44s-.65 1.44-1.44 1.44-1.44-.64-1.44-1.44.65-1.44 1.44-1.44zm7.36 0c.79 0 1.44.64 1.44 1.44s-.65 1.44-1.44 1.44-1.44-.64-1.44-1.44.65-1.44 1.44-1.44z"/>
  </svg>
);

const TelegramIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 11.9c-.88-.28-.88-1.39.2-1.65l15.96-5.99c.73-.27 1.36.17 1.15.99l-2.78 13.1c-.27 1.25-1.04 1.55-2.04 1.01l-4.99-3.68-2.4 2.3c-.27.27-.5.53-.98.53z"/>
  </svg>
);

const XIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.479l8.6-9.83L0 1.154h7.594l5.243 7.184L18.901 1.153zm-1.61 19.7h2.54l-14.49-16.885H3.207l14.084 16.885z"/>
  </svg>
);

const InfoIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

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
  const socialIcons = [
    { href: "#", Icon: DiscordIcon, ariaLabel: "Discord" },
    { href: "#", Icon: TelegramIcon, ariaLabel: "Telegram" },
    { href: "#", Icon: XIcon, ariaLabel: "X social network" },
    { href: "#", Icon: InfoIcon, ariaLabel: "More information" },
  ];

  const footerLinks = [
    { href: "#", text: "Documentation" },
    { href: "#", text: "Create Token" },
    { href: "#", text: "Contact" },
  ];

  return (
    <div className="w-full relative">
      {/* The fade effect, positioned absolutely above the main content block */}
      <div 
        aria-hidden="true"
        className="absolute bottom-full inset-x-0 h-32 bg-gradient-to-t from-[#ebd6b4] to-transparent pointer-events-none"
      />

      {/* Control buttons section with gradient background */}
      <div className="bg-gradient-to-b from-[#843b04] to-[#572401] p-4 flex items-center justify-between border-b border-white/20">
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
