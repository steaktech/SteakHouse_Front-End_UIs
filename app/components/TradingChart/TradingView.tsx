import React from 'react';
import { TradingViewWidget } from './TradingViewWidget';

export const TradingView: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-[#3d1e01] to-[#2a1500] rounded-lg p-4 flex-grow flex flex-col border border-amber-600/30 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-amber-100">REAL/SOL Market Cap (USD)</h3>
          <div className="flex items-center space-x-4 text-sm mt-1">
            <p className="text-amber-300">Market Cap <span className="text-amber-400 font-semibold">$6.26K</span></p>
            <p className="text-amber-300">Virtual Liquidity <span className="text-amber-100 font-semibold">$12.36K</span></p>
            <p className="text-amber-300">Volume <span className="text-amber-100 font-semibold">220.55</span></p>
          </div>
        </div>
      </div>
      <div className="flex-grow min-h-[500px]">
        <TradingViewWidget 
          symbol="BINANCE:BTCUSDT"
          theme="dark"
        />
      </div>
    </div>
  );
}; 