import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  size?: number;
  className?: string;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  content, 
  size = 16, 
  className = 'ml-1' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: true, left: true });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Check if tooltip goes off-screen horizontally
      const tooltipLeft = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      const tooltipRight = tooltipLeft + tooltipRect.width;
      
      // Check if tooltip goes off-screen vertically
      const tooltipTop = triggerRect.top - tooltipRect.height - 8;
      const tooltipBottom = triggerRect.bottom + tooltipRect.height + 8;

      setPosition({
        top: tooltipTop > 0, // Show above if there's space, otherwise below
        left: tooltipLeft > 10 && tooltipRight < viewportWidth - 10 // Center if fits, otherwise adjust
      });
    }
  }, [isVisible]);

  const getTooltipClasses = () => {
    const baseClasses = "absolute z-[9999] transform transition-all duration-200";
    const verticalClasses = position.top 
      ? "bottom-full mb-2" 
      : "top-full mt-2";
    const horizontalClasses = position.left 
      ? "left-1/2 -translate-x-1/2" 
      : "right-0";
    
    return `${baseClasses} ${verticalClasses} ${horizontalClasses}`;
  };

  const getArrowClasses = () => {
    if (position.top) {
      return "absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent";
    } else {
      return "absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent";
    }
  };

  const getArrowBorderColor = () => {
    return position.top 
      ? "border-t-[#2d1e17]" 
      : "border-b-[#2d1e17]";
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <HelpCircle
        ref={triggerRef}
        size={size}
        className="text-[#9b8976] hover:text-[#f28c28] cursor-help transition-all duration-300 hover:scale-110 drop-shadow-sm"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      
      {isVisible && (
        <div className={getTooltipClasses()}>
          <div 
            ref={tooltipRef}
            className="bg-[#2d1e17]/95 backdrop-blur-md border border-[#3a2418] rounded-xl px-4 py-3 text-sm text-[#f5e6d3] shadow-2xl max-w-xs whitespace-normal"
            style={{
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              boxShadow: `
                0 20px 25px -5px rgba(0, 0, 0, 0.4),
                0 10px 10px -5px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                0 0 0 1px rgba(58, 36, 24, 0.5)
              `
            }}
          >
            {content}
            {/* Enhanced Arrow */}
            <div className={`${getArrowClasses()} ${getArrowBorderColor()}`}></div>
            {/* Arrow border/shadow */}
            <div className={`${getArrowClasses()} ${position.top ? 'border-t-[#3a2418] translate-y-[-1px]' : 'border-b-[#3a2418] translate-y-[1px]'} -z-10`}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;
