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