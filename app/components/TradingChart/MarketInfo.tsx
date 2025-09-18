import React from 'react';
import { Globe, Send } from 'lucide-react';
import { useTokenData } from '@/app/hooks/useTokenData';

const TwitterIcon = () => (
  <svg className="w-5 h-5 cursor-pointer hover:text-yellow-400" viewBox="0 0 1200 1227" fill="currentColor">
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6902H306.615L611.412 515.685L658.88 583.579L1055.08 1150.31H892.476L569.165 687.854V687.828Z"/>
  </svg>
);

interface MarketInfoProps {
  tokenAddress: string;
}

export const MarketInfo: React.FC<MarketInfoProps> = ({ tokenAddress }) => {
  const { data: tokenData, isLoading, error } = useTokenData(tokenAddress);

  // Helper function to format numbers
  const formatNumber = (value: number | string | undefined): string => {
    if (!value) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  // Helper function to format price
  const formatPrice = (price: number | undefined): string => {
    if (!price) return '$0.00';
    if (price < 0.001) return `$${price.toExponential(2)}`;
    return `$${price.toFixed(6)}`;
  };

  // Helper function to format USD value
  const formatUSD = (value: string | number | undefined): string => {
    if (!value) return '$0';
    const num = typeof value === 'string' ? parseFloat(value.replace('$', '')) : value;
    if (isNaN(num)) return '$0';
    return `$${num.toFixed(2)}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="box-shadow-1 bg-gradient-to-b from-[#532301] to-[#863c04] rounded-3xl p-4 text-white shadow-lg relative overflow-hidden h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fade79]"></div>
        <p className="mt-4 text-[#fade79]">Loading token data...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="box-shadow-1 bg-gradient-to-b from-[#532301] to-[#863c04] rounded-3xl p-4 text-white shadow-lg relative overflow-hidden h-full flex flex-col items-center justify-center">
        <div className="text-red-400 text-center">
          <p className="font-bold">Error loading token data</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="box-shadow-1 bg-gradient-to-b from-[#532301] to-[#863c04] rounded-3xl p-4 text-white shadow-lg relative overflow-hidden h-full flex flex-col 
                   border border-2 border-t-white/10 border-l-white/10 border-b-black/30 border-r-black/30">
      
      {/* Top rounded image - Hidden on mobile (screens smaller than 'md') */}
      <div className="hidden md:block absolute top-0 left-0 right-0 z-0">
        <img 
          src="/images/info_banner.jpg" 
          alt="Token Header" 
          className="w-full h-24 object-cover rounded-t-3xl"
        />
      </div>
      
      {/* Market Info Title for Mobile - positioned at very top */}
      <div className="md:hidden mb-3">
        <h2 className="text-xl font-bold text-[#fade79] text-center [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)]">
            Market Info
        </h2>
      </div>

      {/* Content container with proper spacing from banner */}
      <div className="relative z-10 md:mt-20 flex flex-col gap-2 flex-1">

        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-3">
            <img src="/images/info_icon.jpg" alt="Market Token" className="w-14 h-14 rounded-full border-2 border-amber-300" />
            <div>
              <h3 className="font-bold text-lg text-[#fade79] font-1.4rem">
                {tokenData?.lastTrade?.name || 'Unknown Token'}
              </h3>
              <p className="font-bold text-lg text-[#f8ead3] font-1.4rem">
                {tokenData?.lastTrade?.symbol || 'UNKNOWN'}
              </p>
            </div>
          </div>
          <div className="px-3 py-1 text-lg font-semibold rounded-md bg-[#fade79] text-black box-shadow-3">
            MEME
          </div>
        </div>
        
        <div className="text-amber-200 space-y-1">
          <div className="flex items-center space-x-2 text-xs">
            <p className='font-1.2rem font-bold'>Price: {formatPrice(tokenData?.price)}</p>
            <div className="bg-[#2d1300] border border-amber-600/30 rounded-full px-2 py-1">
              <p className="text-white">
                Market Cap: <span className="text-yellow-400 font-semibold">{formatUSD(tokenData?.marketCap)}</span>
              </p>
            </div>
          </div>
          <p className="text-[#f8ead3] font-1.2rem">Token Address: {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}</p>
        </div>

        <div className="flex items-center space-x-3 text-yellow-200">
          <div className="bg-[#f8ead3]/80 rounded-full p-2 flex items-center justify-center border border-white/20 shadow-[inset_1px_1px_1px_white,inset_-1px_-1px_2px_rgba(134,60,4,0.7)]">
            <Send className="h-5 w-5 cursor-pointer hover:text-yellow-400 text-amber-800" />
          </div>
          <div className="bg-[#f8ead3]/80 rounded-full p-2 flex items-center justify-center text-amber-800 border border-white/20 shadow-[inset_1px_1px_1px_white,inset_-1px_-1px_2px_rgba(134,60,4,0.7)]">
            <TwitterIcon />
          </div>
          <div className="bg-[#f8ead3]/80 rounded-full p-2 flex items-center justify-center border border-white/20 shadow-[inset_1px_1px_1px_white,inset_-1px_-1px_2px_rgba(134,60,4,0.7)]">
            <Globe className="h-5 w-5 cursor-pointer hover:text-yellow-400 text-amber-800" />
          </div>
        </div>

        <div className="mt-auto relative">
        <div className="bg-[#b15821] rounded-3xl">
          <div className=" rounded-3xl p-3 
                         relative overflow-hidden box-shadow-3
                         bg-amber-950/50"
          >
            <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent 
                          bg-[radial-gradient(circle_at_100%_-40%,rgba(255,255,255,0.2),rgba(255,255,255,0)_22%)] 
                          rounded-xl pointer-events-none"></div>
            
            <div className="flex justify-around text-center relative z-10">
              <div>
                <p className="text-xs text-amber-300/90 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)] font-1rem">MCAP</p>
                <p className="font-bold text-sm text-white/95 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)] font-1rem">
                  {formatUSD(tokenData?.marketCap)}
                </p>
              </div>
              <div>
                <p className="text-xs text-amber-300/90 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)] font-1rem">PRICE</p>
                <p className="font-bold text-sm text-white/95 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)] font-1rem">
                  {formatPrice(tokenData?.price)}
                </p>
              </div>
              <div>
                <p className="text-xs text-amber-300/90 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)] font-1rem">SUPPLY</p>
                <p className="font-bold text-sm text-white/95 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)] font-1rem">
                  {formatNumber(tokenData?.lastTrade?.circulatingSupply)}
                </p>
              </div>
            </div>
            
            <div className="mt-3 relative">
              <div className="bg-[#a07b24] rounded-full p-[2px] shadow-sm box-shadow-3 height-45">
                <div className="bg-[#a07b24] rounded-full h-6 relative overflow-hidden
                                shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-2px_0_3px_rgba(0,0,0,0.3),inset_0_-2px_3px_rgba(0,0,0,0.4)] height-45">
                  
                  <div className="bg-[#a07b24] rounded-full p-[1px] h-full">
                    <div 
                      className="bg-gradient-to-r from-[#fbc710] via-[#f8d96e] to-[#f8d96e] h-full rounded-full 
                                 flex items-center justify-center relative overflow-hidden
                                 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3),inset_-1px_0_2px_rgba(0,0,0,0.1)] box-shadow-3" 
                      style={{ width: `${Math.min(100, Math.max(0, (tokenData?.lastTrade?.virtualEth || 0) * 100))}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent rounded-full"></div>
                      <span className="text-black font-bold text-lg relative z-10">
                        {Math.round(Math.min(100, Math.max(0, (tokenData?.lastTrade?.virtualEth || 0) * 100)))}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};