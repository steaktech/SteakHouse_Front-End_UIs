"use client";

import React, { useState } from 'react';
import Header from '@/app/components/Header';
import TrendingBar from "@/app/components/TrendingBar";
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomBar } from './MobileSidebar';
import { TradingView } from './TradingView';
import { TradeHistory } from '../Widgets/TradingHistoryWidget';
import { TradingTokenCard } from '../Widgets/TokenCardInfoWidget';
import { TradePanel } from './TradePanel';
import { FullscreenChart } from './FullscreenChart';
import { OrientationPrompt } from './OrientationPrompt';
import { useDeviceOrientation } from '@/app/hooks/useDeviceOrientation';
// MODIFIED: Added ChevronUp for the new button icon
import { ChevronUp } from 'lucide-react';

interface TradingChartProps {
  tokenAddress?: string;
}

export default function TradingChart({ tokenAddress = "0xc139475820067e2A9a09aABf03F58506B538e6Db" }: TradingChartProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarExpanded, setMobileSidebarExpanded] = useState(false);
  const [isFullscreenChart, setIsFullscreenChart] = useState(false);
  const [showOrientationPrompt, setShowOrientationPrompt] = useState(false);
  
  const { isMobile, isLandscape } = useDeviceOrientation();

  // Handle fullscreen chart activation
  const handleChartFullscreen = () => {
    if (!isMobile) return; // Only for mobile devices
    
    // If device is already in landscape, go directly to fullscreen
    if (isLandscape) {
      setIsFullscreenChart(true);
    } else {
      // Show orientation prompt for portrait mode
      setShowOrientationPrompt(true);
    }
  };

  // Handle orientation prompt responses
  const handleOrientationPromptClose = () => {
    setShowOrientationPrompt(false);
  };

  const handleContinueInPortrait = () => {
    setShowOrientationPrompt(false);
    setIsFullscreenChart(true);
  };

  // Handle fullscreen chart exit
  const handleFullscreenExit = () => {
    setIsFullscreenChart(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#07040b]">
      {/* Header */}
      <Header />

      {/* --- REPLACEMENT START --- */}
      {/* New Mobile Widgets Bar */}
      <button
        onClick={() => setMobileSidebarExpanded(true)}
        className={`
          fixed bottom-0 left-0 right-0 z-40
          flex items-center justify-center gap-2
          h-12 px-4
          bg-gradient-to-t from-[#472303] to-[#5a2d04]
          border-t border-[#daa20b]/30
          text-[#daa20b]
          shadow-[0_-5px_20px_rgba(0,0,0,0.5)]
          lg:hidden group
          transition-opacity duration-300 ease-in-out
          hover:bg-[#1a1710]
          ${mobileSidebarExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
        type="button"
      >
        <ChevronUp size={20} className="transition-transform duration-200 group-hover:-translate-y-1" />
        <span className="font-semibold tracking-wider text-sm">WIDGETS</span>
      </button>
      {/* --- REPLACEMENT END --- */}

      <div className="flex flex-1 text-white font-sans overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DesktopSidebar 
            expanded={sidebarExpanded} 
            setExpanded={setSidebarExpanded} 
            tokenAddress={tokenAddress}
          />
        </div>
        
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] lg:grid-rows-[1fr_350px] gap-2 p-2 pb-16 lg:pb-2 overflow-y-auto custom-scrollbar scrollbar scrollbar-w-2 scrollbar-track-gray-100 scrollbar-thumb-gray-700 scrollbar-thumb-rounded">
          
          {/* Trading Chart */}
          <div className="order-1 lg:col-start-1 lg:row-start-1">
            <TradingView />
          </div>

          {/* Token Card - Desktop only, mobile uses popup from sidebar */}
          <div className="order-4 lg:col-start-2 lg:row-start-1 hidden lg:block">
            <TradingTokenCard 
              imageUrl="/images/info_icon.jpg"
              name="SPACE Token"
              symbol="SPACE"
              tag="MEME"
              tagColor="#ffe49c"
              description="A revolutionary space-themed meme token designed to take your portfolio to the moon and beyond!"
              mcap="$2.5M"
              liquidity="$450K"
              volume="$1.2M"
              progress={75}
            />
          </div>

          {/* Trade Panel */}
          <div className="order-2 lg:col-start-2 lg:row-start-2">
            <TradePanel tokenAddress={tokenAddress} />
          </div>

          {/* Trade History - Desktop only, mobile uses popup from sidebar */}
          <div className="order-3 lg:col-start-1 lg:row-start-2 hidden lg:block">
            <TradeHistory tokenAddress={tokenAddress} />
          </div>

        </main>
      </div>
      
      {/* Mobile Bottom Sidebar */}
      <MobileBottomBar 
        expanded={mobileSidebarExpanded} 
        setExpanded={setMobileSidebarExpanded}
        tokenAddress={tokenAddress}
        onChartFullscreen={handleChartFullscreen}
      />

      {/* Fullscreen Chart Modal */}
      <FullscreenChart
        isOpen={isFullscreenChart}
        onClose={handleFullscreenExit}
        tokenAddress={tokenAddress}
        mobileSidebarExpanded={mobileSidebarExpanded}
        setMobileSidebarExpanded={setMobileSidebarExpanded}
      />

      {/* Orientation Prompt Modal */}
      <OrientationPrompt
        isOpen={showOrientationPrompt}
        onClose={handleOrientationPromptClose}
        onContinuePortrait={handleContinueInPortrait}
      />
    </div>
  );
}