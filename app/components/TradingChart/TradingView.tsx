import React from 'react';
import { TradingViewWidget } from './TradingViewWidget';

export const TradingView: React.FC = () => {
  return (
    <div className="w-full h-full overflow-hidden">
      <TradingViewWidget 
        symbol="BINANCE:SOLUSD"
      />
    </div>
  );
};
