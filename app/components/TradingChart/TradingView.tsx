import React from 'react';
import { TradingViewWidget } from './TradingViewWidget';

export const TradingView: React.FC = () => {
  return (
    <div className="p-1 flex-grow flex flex-col shadow-lg z-50">
        <TradingViewWidget 
          symbol="TRADENATION:SOLANA"
          theme="dark"
        />
    </div>
  );
}; 