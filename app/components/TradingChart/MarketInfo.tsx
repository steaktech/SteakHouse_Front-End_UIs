import React from 'react';
import { Globe, Send } from 'lucide-react';

const TwitterIcon = () => (
  <svg className="w-5 h-5 cursor-pointer hover:text-yellow-400" viewBox="0 0 1200 1227" fill="currentColor">
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6902H306.615L611.412 515.685L658.88 583.579L1055.08 1150.31H892.476L569.165 687.854V687.828Z"/>
  </svg>
);

export const MarketInfo: React.FC = () => {
  return (
    <div className="box-shadow-1 bg-gradient-to-b from-[#532301] to-[#863c04] rounded-3xl p-4 text-white shadow-lg relative overflow-hidden h-full flex flex-col 
                   border border-2 border-t-white/10 border-l-white/10 border-b-black/30 border-r-black/30">
      
      {/* --- CHANGES START HERE --- */}

      {/* Market Info Title for Mobile */}
      <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2">
        <h2 className="text-2xl font-bold text-[#fade79] [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)]">
            Market Info
        </h2>
      </div>

      {/* Top rounded image - Hidden on mobile (screens smaller than 'md') */}
      <div className="hidden md:block absolute top-0 left-0 right-0 mb-4">
        <img 
          src="/images/info_banner.jpg" 
          alt="Token Header" 
          className="w-full h-32 object-cover rounded-t-3xl"
        />
      </div>
      
      {/* Spacer div with responsive margin */}
      <div className="mt-16 md:mt-32 mb-4"></div>

      {/* --- CHANGES END HERE --- */}

      <div className="flex items-center gap-8">
        <div className="flex items-center space-x-3">
          <img src="/images/info_icon.jpg" alt="Market Token" className="w-16 h-16 rounded-full border-2 border-amber-300" />
          <div>
            <h3 className="font-bold text-xl text-[#fade79] font-1.4rem">SpaceMan</h3>
            <p className="font-bold text-xl text-[#f8ead3] font-1.4rem">SPACE</p>
          </div>
        </div>
        <div className="px-3 py-1 text-xl font-semibold rounded-md bg-[#fade79] text-black box-shadow-3">
          MEME
        </div>
      </div>
      
      <div className="mt-4 text-amber-200 space-y-2">
        <div className="flex items-center space-x-2 text-xs">
          <p className='font-1.2rem font-bold'>TAX: 3/3</p>
          <div className="bg-[#2d1300] border border-amber-600/30 rounded-full px-2 py-1">
            <p className="text-white">
              Current TAX: <span className="text-yellow-400 font-semibold">16/16</span> MaxTX: <span className="text-yellow-400 font-semibold">2.1%</span>
            </p>
          </div>
        </div>
        <p className="text-[#f8ead3] font-1.2rem">Spaceman is a meme deflationary token with a finite supply and buyback and burn.</p>
      </div>

      <div className="flex items-center space-x-3 mt-4 text-yellow-200">
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

      <div className="mt-4 relative">
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
                <p className="font-bold text-sm text-white/95 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)] font-1rem">$21.5K</p>
              </div>
              <div>
                <p className="text-xs text-amber-300/90 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)] font-1rem">VOLUME</p>
                <p className="font-bold text-sm text-white/95 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)] font-1rem">$6.2K</p>
              </div>
              <div>
                <p className="text-xs text-amber-300/90 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)] font-1rem">LP</p>
                <p className="font-bold text-sm text-white/95 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)] font-1rem">2.3K</p>
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
                      style={{ width: `82%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent rounded-full"></div>
                      <span className="text-black font-bold text-lg relative z-10">82%</span>
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