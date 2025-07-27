import React from 'react';
import { Globe, Send } from 'lucide-react';

const TwitterIcon = () => (
  <svg className="w-5 h-5 cursor-pointer hover:text-yellow-400" viewBox="0 0 1200 1227" fill="currentColor">
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6902H306.615L611.412 515.685L658.88 583.579L1055.08 1150.31H892.476L569.165 687.854V687.828Z"/>
  </svg>
);

export const MarketInfo: React.FC = () => {
  return (
    // --- CHANGES START HERE ---
    <div className="mt-2 bg-gradient-to-b from-[#532301] to-[#863c04] rounded-3xl p-4 text-white shadow-lg relative overflow-hidden h-full flex flex-col 
                 border border-2 border-t-white/10 border-l-white/10 border-b-black/30 border-r-black/30">
      {/* Top rounded image */}
      <div className="absolute top-0 left-0 right-0 mb-4">
        <img 
          src="/images/card_img.jpg" 
          alt="Token Header" 
          className="w-full h-32 object-cover rounded-t-3xl" // Increased rounding
        />
      </div>
     {/* --- CHANGES END HERE --- */}
      <div className="mt-32 mb-4"></div>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <img src="/images/bull.png" alt="Market Token" className="w-16 h-16 rounded-full border-2 border-amber-300" />
          <div>
            <h3 className="font-bold text-lg text-[#fade79]">BTC Market</h3>
            <p className="font-bold text-sm text-[#f8ead3]">BTCUSDT</p>
          </div>
        </div>
        <div className="px-3 py-1 text-xs font-semibold rounded-full bg-[#fade79] text-black">
          Meme
        </div>
      </div>
      
      <div className="mt-4 text-amber-200 space-y-2 flex-grow">
        <div className="flex items-center space-x-2 text-xs">
          <p>TAX: 3/3</p>
          <div className="bg-amber-900/50 border border-amber-600/30 rounded-full px-2 py-1">
            <p className="text-white">
              Current TAX: <span className="text-yellow-400 font-semibold">16/16</span> MaxTX: <span className="text-yellow-400 font-semibold">2.1%</span>
            </p>
          </div>
        </div>
        <p className="text-[#f8ead3]">Real-time Bitcoin market data with live price tracking, volume analysis, and trading opportunities.</p>
      </div>

      <div className="flex items-center space-x-3 mt-4 text-yellow-200">
        <div className="bg-[#f8ead3] rounded-full p-2 flex items-center justify-center">
          <Send className="h-5 w-5 cursor-pointer hover:text-yellow-400 text-amber-800" />
        </div>
        <div className="bg-[#f8ead3] rounded-full p-2 flex items-center justify-center text-amber-800">
          <TwitterIcon />
        </div>
        <div className="bg-[#f8ead3] rounded-full p-2 flex items-center justify-center">
          <Globe className="h-5 w-5 cursor-pointer hover:text-yellow-400 text-amber-800" />
        </div>
      </div>

      <div className="mt-4 relative">
        {/* Outer 3D container */}
        <div className="bg-[#b15821] rounded-3xl">
          {/* Inner glass container */}
          <div className="bg-[#b15821] rounded-3xl p-3 
                          relative overflow-hidden
                          shadow-[inset_2px_2px_3px_rgba(255,255,255,0),inset_-4px_0px_4px_rgba(255,255,255,0.15),inset_0_3px_15px_rgba(96,41,7,0.7),inset_0_-5px_6px_rgba(35,20,0,0.8),inset_3px_0_5px_rgba(52,24,2,1),inset_-3px_0_5px_rgba(0,0,0,0.15)]">
            
            {/* Glass highlight overlay */}
            <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent 
                            bg-[radial-gradient(circle_at_100%_-40%,rgba(255,255,255,0.2),rgba(255,255,255,0)_22%)] 
                            rounded-xl pointer-events-none"></div>
            
            <div className="flex justify-around text-center relative z-10">
              <div>
                <p className="text-xs text-amber-300/90">PRICE</p>
                <p className="font-bold text-sm text-white/95">$68.1K</p>
              </div>
              <div>
                <p className="text-xs text-amber-300/90">24H HIGH</p>
                <p className="font-bold text-sm text-white-400/95">$69.1K</p>
              </div>
              <div>
                <p className="text-xs text-amber-300/90">VOL</p>
                <p className="font-bold text-sm text-white/95">2.3K</p>
              </div>
            </div>
            
            {/* Progress bar with 3D glass effect */}
            <div className="mt-3 relative">
              {/* Outer progress container */}
              <div className="bg-[#a07b24] rounded-full p-[2px] shadow-sm">
                <div className="bg-[#a07b24] rounded-full h-6 relative overflow-hidden
                               shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-2px_0_3px_rgba(0,0,0,0.3),inset_0_-2px_3px_rgba(0,0,0,0.4)]">
                  
                  {/* Progress fill with glass effect */}
                  <div className="bg-[#a07b24] rounded-full p-[1px] h-full">
                    <div 
                      className="bg-gradient-to-r from-[#fbc710] via-[#f8d96e] to-[#f8d96e] h-full rounded-full 
                                 flex items-center justify-center relative overflow-hidden
                                 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3),inset_-1px_0_2px_rgba(0,0,0,0.1)]" 
                      style={{ width: `82%` }}
                    >
                      {/* Glass highlight on progress bar */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent rounded-full"></div>
                      <span className="text-black font-bold text-sm relative z-10">82%</span>
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