import React from 'react';
import { useSearchParams } from 'next/navigation';
import { TradingViewWidget } from './TradingViewWidget';
import Image from 'next/image';

export const TradingView: React.FC = () => {
  const searchParams = useSearchParams();
  const tokenSymbol = searchParams.get('symbol');
  
  // For BURN token, show fake chart image
  if (tokenSymbol === 'BURN') {
    return (
      <div className="w-full h-full overflow-hidden relative rounded-lg">
        <Image 
          src="/images/fake-burn.webp"
          alt="BURN Chart"
          fill
          className="object-contain"
          priority
        />
      </div>
    );
  }
  
  return (
    <div className="w-full h-full overflow-hidden">
      <TradingViewWidget 
        symbol="BINANCE:SOLUSD"
      />
    </div>
  );
};
