"use client";

import React, { useState } from 'react';
import { TradeWidget } from '../Widgets/TradeWidget';

interface TradeButtonsProps {
  tokenAddress?: string;
}

export const TradeButtons: React.FC<TradeButtonsProps> = ({ tokenAddress }) => {
  const [isTradeWidgetOpen, setIsTradeWidgetOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');

  const handleBuyClick = () => {
    setSelectedTab('buy');
    setIsTradeWidgetOpen(true);
  };

  const handleSellClick = () => {
    setSelectedTab('sell');
    setIsTradeWidgetOpen(true);
  };

  return (
    <>
      {/* Buttons container with a gap */}
      <div className="fixed bottom-14 left-0 right-0 flex items-center justify-center space-x-4 px-4 py-3 lg:hidden z-30 bg-gradient-to-t from-[#07040b] via-[#07040b]/90 to-transparent pt-8">
        
        {/* Buy Button */}
        <button 
          onClick={handleBuyClick}
          className="flex items-center justify-center px-12 py-[1.1rem] rounded-full text-black font-bold text-lg uppercase tracking-wider
                     bg-gradient-to-b from-[#10D275] to-[#0C9C58] 
                     border-b-4 border-green-800 
                     shadow-lg transform transition-all 
                     hover:-translate-y-0.5 hover:border-b-2
                     active:translate-y-0 active:border-b-0 active:shadow-none
                     [text-shadow:1px_1px_2px_rgba(0,0,0,0.3)]"
        >
          Buy
        </button>

        {/* Sell Button */}
        <button 
          onClick={handleSellClick}
          className="flex items-center justify-center px-12 py-[1.1rem] rounded-full text-black font-bold text-lg uppercase tracking-wider
                     bg-gradient-to-b from-[#F75252] to-[#D92A2A]
                     border-b-4 border-red-800 
                     shadow-lg transform transition-all
                     hover:-translate-y-0.5 hover:border-b-2
                     active:translate-y-0 active:border-b-0 active:shadow-none
                     [text-shadow:1px_1px_2px_rgba(0,0,0,0.3)]"
        >
          Sell
        </button>
      </div>

      {/* Trade Widget Popup */}
      <TradeWidget
        isOpen={isTradeWidgetOpen}
        onClose={() => setIsTradeWidgetOpen(false)}
        tokenAddress={tokenAddress}
        defaultTab={selectedTab}
      />
    </>
  );
};
