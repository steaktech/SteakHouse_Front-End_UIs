"use client";

import React, { useState } from 'react';
import Header from '@/app/components/Header';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomBar } from './MobileSidebar';
import { TradingView } from './TradingView';
import { TradeHistory } from './TradeHistory';
import { MarketInfo } from './MarketInfo';
import { TradePanel } from './TradePanel';
import { BarChart3 } from 'lucide-react';

export default function TradingChart() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarExpanded, setMobileSidebarExpanded] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#07040b]">
      {/* Header */}
      <Header />

      <button
        onClick={() => setMobileSidebarExpanded(true)}
        className={`
          fixed bottom-4 right-4 z-40
          w-14 h-14 rounded-full
          bg-gradient-to-r from-[#472303] to-[#5a2d04]
          border border-[#daa20b]/40
          shadow-[0_4px_20px_rgba(0,0,0,0.3),_inset_0_1px_0_rgba(255,221,0,0.1)]
          hover:shadow-[0_6px_25px_rgba(0,0,0,0.4),_inset_0_1px_0_rgba(255,221,0,0.2)]
          hover:from-[#5a2d04] hover:to-[#6b3405]
          transform hover:scale-105
          transition-all duration-300 ease-out
          lg:hidden group
          ${mobileSidebarExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
        type="button"
      >
        <div className="flex items-center justify-center w-full h-full">
          <BarChart3 
            size={20} 
            className="text-[#daa20b] group-hover:text-[#ffdd00] 
                       transition-colors duration-200
                       drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" 
          />
        </div>
        
        {/* Animated glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-[#daa20b]/10 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
      
      {/* Mobile Bottom Bar Toggle Button (no change needed here) */}
      <button
        onClick={() => setMobileSidebarExpanded(true)}
        className={`fixed bottom-4 right-4 z-40 lg:hidden ...`}
        type="button"
      >
        {/* ... button content */}
      </button>
      
      <div className="flex flex-1 text-white font-sans overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DesktopSidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
        </div>
        
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] lg:grid-rows-[1fr_350px] gap-2 p-2 overflow-y-auto custom-scrollbar scrollbar scrollbar-w-2 scrollbar-track-gray-100 scrollbar-thumb-gray-700 scrollbar-thumb-rounded">
          
          {/* Trading Chart */}
          <div className="order-1 lg:col-start-1 lg:row-start-1">
            <TradingView />
          </div>

          {/* Market Info */}
          {/* MODIFIED: Added overflow and scrollbar classes */}
          <div className="order-2 lg:col-start-2 lg:row-start-1">
            <MarketInfo />
          </div>

          {/* Trade Panel */}
          {/* MODIFIED: Added overflow and scrollbar classes */}
          <div className="order-3 lg:col-start-2 lg:row-start-2">
            <TradePanel />
          </div>

          {/* Trade History */}
          {/* MODIFIED: Added overflow and scrollbar classes */}
          <div className="order-4 lg:col-start-1 lg:row-start-2">
            <TradeHistory />
          </div>

        </main>
      </div>
      
      {/* Mobile Bottom Sidebar */}
      <MobileBottomBar expanded={mobileSidebarExpanded} setExpanded={setMobileSidebarExpanded} />
    </div>
  );
}