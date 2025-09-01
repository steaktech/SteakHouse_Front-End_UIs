import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  size?: number;
  className?: string;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  content, 
  size = 16, 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <HelpCircle
        size={size}
        className="text-gray-400 hover:text-[#e8b35c] cursor-help transition-colors duration-200"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-[#2a1f0a] border border-[#e8b35c]/30 rounded-lg px-3 py-2 text-sm text-[#e8b35c] shadow-lg max-w-xs whitespace-normal">
            {content}
            {/* Arrow pointing down */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#2a1f0a]"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;
