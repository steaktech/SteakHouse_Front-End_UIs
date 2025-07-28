import React from 'react';
import { TradingViewWidget } from './TradingViewWidget';

export const TradingView: React.FC = () => {
  return (

    
    <div className="flex-grow flex flex-col h-full">
        <TradingViewWidget 
          symbol="BINANCE:SOLUSD"
        />
    </div>

    
  );
}; 