"use client";

import React, { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import TrendingBar from "@/app/components/TrendingBar";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomBar } from "./MobileSidebar";
import { TradingView } from "./TradingView";
import { TradeHistory } from "../Widgets/TradingHistoryWidget";
import { TradingTokenCard } from "../Widgets/TokenCardInfoWidget";
import { TradePanel } from "../Widgets/TradeWidget";
import { MobileTradeInterface } from "./MobileTradeInterface";
import { FullscreenChart } from "./FullscreenChart";
import { OrientationPrompt } from "./OrientationPrompt";
import { useDeviceOrientation } from "@/app/hooks/useDeviceOrientation";

interface TradingChartProps {
  tokenAddress?: string;
}

export default function TradingChart({
  tokenAddress = "0xc139475820067e2A9a09aABf03F58506B538e6Db",
}: TradingChartProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarExpanded, setMobileSidebarExpanded] = useState(false);
  const [isFullscreenChart, setIsFullscreenChart] = useState(false);
  const [showOrientationPrompt, setShowOrientationPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { isMobile: deviceIsMobile, isLandscape } = useDeviceOrientation();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle fullscreen chart activation
  const handleChartFullscreen = () => {
    if (!deviceIsMobile) return; // Only for mobile devices

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

      {/* Progress Bar - Mobile Only */}
      <div className="lg:hidden bg-[#07040b] px-4 py-2 border-b border-[#daa20b]/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#daa20b] text-xs font-semibold tracking-wide">
            BONDING CURVE
          </span>
          <span className="text-[#feea88] text-xs font-bold">
            {10}%
          </span>
        </div>
        <div className="relative h-1.5 rounded-full bg-gradient-to-r from-[#472303] to-[#5a2d04] border border-[#daa20b]/30 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#ffd700] to-[#daa20b] shadow-lg transition-all duration-700 ease-out"
            style={{
              width: `${10}%`,
              boxShadow:
                "0 0 8px rgba(255, 215, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 text-white font-sans overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DesktopSidebar
            expanded={sidebarExpanded}
            setExpanded={setSidebarExpanded}
            tokenAddress={tokenAddress}
          />
        </div>

        <main
          className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] lg:grid-rows-[1fr_350px] gap-2 p-2 overflow-y-auto custom-scrollbar scrollbar scrollbar-w-2 scrollbar-track-gray-100 scrollbar-thumb-gray-700 scrollbar-thumb-rounded"
          style={{
            paddingBottom: isMobile ? "300px" : "8px", // Account for mobile trade interface + buy/sell buttons + widgets button
          }}
        >
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

          {/* Trade Panel - Desktop only, mobile uses popup from buttons */}
          <div className="order-2 lg:col-start-2 lg:row-start-2 hidden lg:block">
            <TradePanel tokenAddress={tokenAddress} />
          </div>

          {/* Trade History - Desktop only, mobile uses popup from sidebar */}
          <div className="order-3 lg:col-start-1 lg:row-start-2 hidden lg:block">
            <TradeHistory tokenAddress={tokenAddress} />
          </div>
        </main>
      </div>

      {/* Mobile Trade Interface - Mobile only, positioned below chart above mobile sidebar */}
      <MobileTradeInterface
        tokenAddress={tokenAddress}
        onChartFullscreen={handleChartFullscreen}
        mobileSidebarExpanded={mobileSidebarExpanded}
        setMobileSidebarExpanded={setMobileSidebarExpanded}
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

      {/* Mobile Bottom Sidebar - Footer Position */}
      <MobileBottomBar
        expanded={mobileSidebarExpanded}
        setExpanded={setMobileSidebarExpanded}
        tokenAddress={tokenAddress}
        onChartFullscreen={handleChartFullscreen}
      />
    </div>
  );
}
