"use client";

import React, { useState } from 'react';
import Header from '@/app/components/Header';
import { Sidebar } from './Sidebar';
import { TradingView } from './TradingView';
import { TradeHistory } from './TradeHistory';
import { MarketInfo } from './MarketInfo';
import { TradePanel } from './TradePanel';


export default function TradingChart() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-[#0d0600]">
      {/* Header */}
      <Header />
      
      {/* Main Trading Interface */}
      <div className="flex text-white font-sans h-[calc(100vh-80px)]">
        <Sidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
        
        <main className="flex flex-1 flex-col lg:flex-row">
          {/* Center content - will take up remaining space */}
          <div className="flex-1 flex flex-col min-w-0">
            <TradingView />
            <TradeHistory />
          </div>

          {/* Right sidebar - fixed width on large screens, full width on small */}
          <aside className="w-full lg:w-[390px] lg:flex-shrink-0 flex flex-col space-y-2 p-2">
            {/* MarketInfo will fill the remaining space above the TradePanel */}
            <div className="flex-1 min-h-0">
              <MarketInfo />
            </div>
            {/* Container with fixed height for the TradePanel */}
            <div className="h-[370px]">
              <TradePanel />
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}