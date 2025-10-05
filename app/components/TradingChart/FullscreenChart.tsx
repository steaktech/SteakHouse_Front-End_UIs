"use client";

import React from 'react';
import { X, Minimize2 } from 'lucide-react';
import { TradingView } from './TradingView';
import { MobileBottomBar } from './MobileSidebar';
import { useDeviceOrientation } from '@/app/hooks/useDeviceOrientation';
import type { Candle } from '@/app/types/token';

interface FullscreenChartProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress: string;
  mobileSidebarExpanded: boolean;
  setMobileSidebarExpanded: (expanded: boolean) => void;
  candles?: Candle[];
  title?: string;
  symbol?: string;
  timeframe?: string;
  onChangeTimeframe?: (tf: string) => void;
}

/**
 * Fullscreen chart component optimized for mobile landscape viewing
 * Shows only the trading chart with mobile sidebar controls
 */
export const FullscreenChart: React.FC<FullscreenChartProps> = ({
  isOpen,
  onClose,
  tokenAddress,
  mobileSidebarExpanded,
  setMobileSidebarExpanded,
  candles,
  title,
  symbol,
  timeframe,
  onChangeTimeframe,
}) => {
  const { isLandscape, isMobile, screenWidth, screenHeight, orientation } = useDeviceOrientation();

  // Debug logging for orientation changes
  React.useEffect(() => {
    if (isOpen) {
      console.log('🔄 Orientation Update:', {
        isLandscape,
        isMobile,
        screenWidth,
        screenHeight,
        orientation,
        windowSize: `${window.innerWidth}x${window.innerHeight}`
      });
    }
  }, [isOpen, isLandscape, isMobile, screenWidth, screenHeight, orientation]);

  // Add body class for scroll prevention - must be before early return
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('fullscreen-chart-active');
    } else {
      document.body.classList.remove('fullscreen-chart-active');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('fullscreen-chart-active');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />
      
      {/* Main Container */}
      <div className="relative h-full w-full bg-[#07040b] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#472303] to-[#5a2d04] border-b border-[#daa20b]/30">
          <h1 className="text-[#daa20b] text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 11H7v8h2v-8zm4-4h-2v12h2V7zm4-4h-2v16h2V3z"/>
            </svg>
            Trading Chart
          </h1>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          >
            <X size={20} className="text-[#daa20b]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Chart Container */}
          <div className="flex-1 bg-[#0a0508]">
            <TradingView candles={candles} title={title} symbol={symbol} timeframe={timeframe} onChangeTimeframe={onChangeTimeframe} />
          </div>
          
          {/* Mobile Bottom Controls */}
          <div className="relative flex-shrink-0">
            {/* Quick Access Button */}
            {!mobileSidebarExpanded && (
              <button
                onClick={() => setMobileSidebarExpanded(true)}
                className={`absolute z-30 px-3 py-1.5 bg-gradient-to-r from-[#472303] to-[#5a2d04] border border-[#daa20b]/40 rounded-full text-[#daa20b] font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${
                  isLandscape 
                    ? 'bottom-1 left-1/2 transform -translate-x-1/2 text-xs' 
                    : 'bottom-2 left-1/2 transform -translate-x-1/2 text-sm'
                }`}
                type="button"
              >
                {isLandscape ? 'Controls' : 'Widget Controls'}
              </button>
            )}

            {/* Mobile Sidebar */}
            <div className="fullscreen-mobile-sidebar">
              <MobileBottomBar 
                expanded={mobileSidebarExpanded} 
                setExpanded={setMobileSidebarExpanded} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
