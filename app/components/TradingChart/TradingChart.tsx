"use client";

import React, { useState } from 'react';
import Header from '@/app/components/Header';
import { Sidebar } from './Sidebar';
import { TradingView } from './TradingView';
import { TradeHistory } from './TradeHistory';
import { MarketInfo } from './MarketInfo';
import { TradePanel } from './TradePanel';
// Add import for arrow icon
import { ChevronRight } from 'lucide-react';

export default function TradingChart() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-[#07040b]">
      {/* Header */}
      <Header />
      
      {/* Mobile Expand Button - Attached to left side */}
      <button
        onClick={() => setSidebarExpanded(true)}
        className={`
          fixed top-[80px] left-0 z-40
          w-8 h-16 rounded-r-xl
          bg-gradient-to-r from-[#472303] to-[#5a2d04]
          border-r border-t border-b border-[#daa20b]/40
          shadow-[2px_0_10px_rgba(0,0,0,0.3),_inset_0_1px_0_rgba(255,221,0,0.1)]
          hover:shadow-[2px_0_15px_rgba(0,0,0,0.4),_inset_0_1px_0_rgba(255,221,0,0.2)]
          hover:from-[#5a2d04] hover:to-[#6b3405]
          transform hover:translate-x-1
          transition-all duration-300 ease-out
          lg:hidden group
          ${sidebarExpanded ? 'opacity-0 pointer-events-none -translate-x-full' : 'opacity-100 translate-x-0'}
        `}
        type="button"
      >
        <div className="flex items-center justify-center w-full h-full">
          <ChevronRight 
            size={16} 
            className="text-[#daa20b] group-hover:text-[#ffdd00] 
                       transition-colors duration-200
                       drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" 
          />
        </div>
        
        {/* Animated glow effect */}
        <div className="absolute inset-0 rounded-r-xl bg-gradient-to-r from-transparent to-[#daa20b]/10 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
      
      {/* Main Trading Interface */}
      <div className="flex text-white font-sans h-[calc(100vh-80px)]">
        <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
        
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-2 p-2">
          {/* Trading Chart - Position 1 on mobile, Left column top on desktop */}
          <div className="h-[calc(100vh-450px)] order-1 lg:order-none lg:row-span-1">
            <TradingView />
          </div>

          {/* Market Info - Position 2 on mobile, Right column top on desktop */}
          <div className="h-[calc(100vh-450px)] min-h-583px order-2 lg:order-none lg:row-start-1 lg:col-start-2">
            <MarketInfo />
          </div>

          {/* Trade Panel - Position 3 on mobile, Right column bottom on desktop */}
          <div className="h-[350px] order-3 lg:order-none lg:row-start-2 lg:col-start-2">
            <TradePanel />
          </div>

          {/* Trade History - Position 4 on mobile, Left column bottom on desktop */}
          <div className="h-[calc(450px-80px-16px)] order-4 lg:order-none lg:row-start-2 lg:col-start-1">
            <TradeHistory />
          </div>
        </main>
      </div>
    </div>
  );
}