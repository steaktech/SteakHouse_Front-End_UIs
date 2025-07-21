"use client";

import React, { useState } from 'react';
import Header from '../Header';
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
        
        <main className="flex flex-1">
          {/* Center content - increased width for trading chart */}
          <div className="flex-[0.75] flex flex-col h-full">
            <TradingView />
            <TradeHistory />
          </div>

          {/* Right sidebar - proper size with full height and increased component heights */}
          <aside className="flex-[0.25] flex-shrink-0 flex flex-col h-full space-y-2 p-2">
            <div className="flex-[0.55] min-h-0">
              <MarketInfo />
            </div>
            <div className="flex-[0.45] min-h-0">
              <TradePanel />
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
