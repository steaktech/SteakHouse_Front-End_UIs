"use client";

import React from 'react';
import { X, Minimize2 } from 'lucide-react';
import { TradingView } from './TradingView';
import { MobileBottomBar } from './MobileSidebar';
import { useDeviceOrientation } from '@/app/hooks/useDeviceOrientation';

interface FullscreenChartProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress: string;
  mobileSidebarExpanded: boolean;
  setMobileSidebarExpanded: (expanded: boolean) => void;
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
}) => {
  const { isLandscape, isMobile } = useDeviceOrientation();

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
    <div className="fullscreen-chart-container lg:hidden">
      {/* Fullscreen Chart Layout */}
      <div className="flex flex-col h-full">
        
        {/* Header Bar with Exit Controls */}
        <div className="fullscreen-header flex items-center justify-between bg-gradient-to-r from-[#472303] to-[#5a2d04] border-b border-[#daa20b]/40 shadow-lg">
          
          {/* Left Side - Token Info */}
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[#e6d4a3] text-sm font-medium tracking-[0.1px]">
              Live Chart
            </span>
          </div>

          {/* Center - Orientation Indicator */}
          {isMobile && (
            <div className="flex items-center gap-2 text-xs text-[#e6d4a3]/70">
              {isLandscape ? (
                <>
                  <div className="w-4 h-3 bg-[#daa20b]/30 rounded border border-[#daa20b]/50 flex items-center justify-center">
                    <div className="w-2 h-1 bg-[#daa20b] rounded-sm"></div>
                  </div>
                  <span>Landscape</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-4 bg-[#daa20b]/30 rounded border border-[#daa20b]/50 flex items-center justify-center">
                    <div className="w-1 h-2 bg-[#daa20b] rounded-sm"></div>
                  </div>
                  <span>Portrait</span>
                </>
              )}
            </div>
          )}

          {/* Right Side - Exit Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/30 hover:bg-black/50 rounded-lg transition-colors"
            type="button"
          >
            <Minimize2 size={16} className="text-[#daa20b]" />
            <span className="text-[#daa20b] text-sm font-medium">Exit</span>
          </button>
        </div>

        {/* Chart Container */}
        <div className="fullscreen-chart-area flex-1 relative overflow-hidden">
          
          {/* Main Chart Area */}
          <div className="absolute inset-0 p-2">
            <div className="fullscreen-trading-view w-full h-full rounded-lg overflow-hidden border border-[#daa20b]/20 shadow-2xl">
              <TradingView />
            </div>
          </div>

          {/* Landscape Optimization Overlay */}
          {isMobile && !isLandscape && (
            <div className="portrait-orientation-hint absolute inset-0 bg-black/60 flex items-center justify-center z-10">
              <div className="text-center p-6">
                <div className="mb-4 text-[#daa20b] text-4xl">📱➡️📱</div>
                <h3 className="text-[#daa20b] text-lg font-semibold mb-2">
                  Rotate for Better View
                </h3>
                <p className="text-[#e6d4a3]/80 text-sm">
                  Turn your device horizontally for the optimal chart experience
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Controls - Always show in fullscreen */}
        <div className="relative">
          {/* Quick Access Button */}
          {!mobileSidebarExpanded && (
            <button
              onClick={() => setMobileSidebarExpanded(true)}
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-30 px-4 py-2 bg-gradient-to-r from-[#472303] to-[#5a2d04] border border-[#daa20b]/40 rounded-full text-[#daa20b] text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              type="button"
            >
              Widget Controls
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
  );
};
