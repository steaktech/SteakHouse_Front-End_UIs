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
        
        <main className="flex flex-1 flex-col lg:flex-row">
          {/* Center content - will take up remaining space */}
          <div className="flex-1 flex flex-col min-w-0 p-2 space-y-2">
            {/* This container will have the same height as MarketInfo */}
            <div className="h-[calc(100vh-450px)]">
              <TradingView />
            </div>
            {/* This container will fill the remaining vertical space */}
            <div className="h-[calc(450px-80px-16px)]"> 
              <TradeHistory />
            </div>
          </div>

          {/* Right sidebar - fixed width on large screens */}
          <aside className="w-full lg:w-[380px] lg:flex-shrink-0 flex flex-col space-y-2 p-2">
            {/* MarketInfo will have the same height as TradingView */}
            <div className="h-[calc(100vh-450px)] min-h-583px mt-1">
              <MarketInfo />
            </div>
            {/* Container with a fixed height for the TradePanel */}
            <div className="h-[370px]">
              <TradePanel />
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}