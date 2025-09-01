import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const trigger = triggerRef.current;
      const triggerRect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Always position above the trigger with some padding
      const top = triggerRect.top - 16; // 16px above the help icon
      let left = triggerRect.left + triggerRect.width / 2;
      
      // Ensure tooltip doesn't go off-screen horizontally
      // Assume tooltip width of ~512px (max-w-lg)
      const tooltipWidth = 512;
      if (left - tooltipWidth / 2 < 20) {
        left = 20 + tooltipWidth / 2;
      } else if (left + tooltipWidth / 2 > viewportWidth - 20) {
        left = viewportWidth - 20 - tooltipWidth / 2;
      }
      
      setPosition({ top, left });
    }
  }, [isVisible]);

  const tooltipContent = isVisible && (
    <div 
      ref={tooltipRef}
      className="fixed z-[999999] bg-[#2d1e17]/95 backdrop-blur-md border border-[#3a2418] rounded-xl px-4 py-3 text-sm text-[#f5e6d3] shadow-2xl max-w-lg whitespace-normal"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%) translateY(-100%)', // Always position above
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        boxShadow: `
          0 20px 25px -5px rgba(0, 0, 0, 0.4),
          0 10px 10px -5px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 0 0 1px rgba(58, 36, 24, 0.5)
        `
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {content}
      {/* Arrow pointing down (since tooltip is above) */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-[#2d1e17]"></div>
      {/* Arrow border/shadow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-[-1px] w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-[#3a2418] -z-10"></div>
    </div>
  );

  return (
    <>
      <div className={`relative inline-block ${className}`}>
        <HelpCircle
          ref={triggerRef}
          size={size}
          className="text-[#9b8976] hover:text-[#f28c28] cursor-help"
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        />
      </div>
      
      {/* Portal the tooltip to document.body for highest z-index */}
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
};

export default HelpTooltip;
