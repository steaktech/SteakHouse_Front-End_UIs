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
    <div className="min-h-screen bg-[#07040b]">
      {/* Header */}
      <Header />
      
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