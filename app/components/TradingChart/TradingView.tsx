import React from 'react';
import { TradingViewWidget } from './TradingViewWidget';

export const TradingView: React.FC = () => {
  return (

    
    <div className="flex-grow flex flex-col">
        <TradingViewWidget 
          symbol="TRADENATION:SOLANA"
          theme="dark"
        />
    </div>

    
  );
}; 