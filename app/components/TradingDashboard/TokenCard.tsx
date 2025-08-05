import React from 'react';
import { Globe, Send } from 'lucide-react';
import { TokenCardProps } from './types';
import { TwitterIcon } from './TwitterIcon';

export const TokenCard: React.FC<TokenCardProps> = ({ 
  isOneStop, 
  imageUrl, 
  name, 
  symbol, 
  tag, 
  tagColor, // Note: This prop is now overridden by the new design's static style
  description, 
  mcap, 
  liquidity, 
  volume, 
  progress 
}) => (
  <div className="box-shadow-1 bg-gradient-to-b from-[#532301] to-[#863c04] rounded-3xl p-4 text-white shadow-lg relative overflow-hidden h-full flex flex-col 
                 border border-2 border-t-white/10 border-l-white/10 border-b-black/30 border-r-black/30">
    
    {/* Top rounded image */}
    <div className="absolute top-0 left-0 right-0 mb-4">
      <img 
        src="/images/info_banner.jpg" 
        alt="Token Header" 
        className="w-full h-32 object-cover rounded-t-3xl"
      />
    </div>
    <div className="mt-32 mb-4"></div>

    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        <img src={imageUrl} alt={name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-amber-300" />
        <div>
          <h3 className="font-bold text-base sm:text-lg text-[#fade79]">{name}</h3>
          <p className="font-bold text-xs sm:text-sm text-[#f8ead3]">{symbol}</p>
        </div>
      </div>
      <div className="px-3 py-1 text-xl font-semibold rounded-md bg-[#fade79] text-black box-shadow-3">
        {tag}
      </div>
    </div>
    
    <div className="mt-4 text-amber-200 text-xs sm:text-sm space-y-2">
      <p>TAX: 3/3</p>
      <p className="text-[#f8ead3] font-bold font-1.2rem">{description}</p>
    </div>

    <div className="flex items-center space-x-2 sm:space-x-3 mt-4 text-yellow-200">
      <div className="bg-[#f8ead3]/80 rounded-full p-1.5 sm:p-2 flex items-center justify-center border border-white/20 shadow-[inset_1px_1px_1px_white,inset_-1px_-1px_2px_rgba(134,60,4,0.7)]">
        <Send className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-yellow-400 text-amber-800" />
      </div>
      <div className="bg-[#f8ead3]/80 rounded-full p-1.5 sm:p-2 flex items-center justify-center text-amber-800 border border-white/20 shadow-[inset_1px_1px_1px_white,inset_-1px_-1px_2px_rgba(134,60,4,0.7)]">
        <TwitterIcon />
      </div>
      <div className="bg-[#f8ead3]/80 rounded-full p-1.5 sm:p-2 flex items-center justify-center border border-white/20 shadow-[inset_1px_1px_1px_white,inset_-1px_-1px_2px_rgba(134,60,4,0.7)]">
        <Globe className="h-4 w-4 sm:h-5 sm:w-5 cursor-pointer hover:text-yellow-400 text-amber-800" />
      </div>
    </div>

    <div className="mt-4 relative">
      <div className="bg-[#b15821] rounded-3xl">
        <div className="rounded-3xl p-3 relative overflow-hidden box-shadow-3 bg-amber-950/50">
          <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent 
                        bg-[radial-gradient(circle_at_100%_-40%,rgba(255,255,255,0.2),rgba(255,255,255,0)_22%)] 
                        rounded-xl pointer-events-none"></div>
          
          <div className="flex justify-around text-center relative z-10">
            <div>
              <p className="text-xs text-amber-300/90 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)]">MCAP</p>
              <p className="font-bold text-xs sm:text-sm text-white/95 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)]">{mcap}</p>
            </div>
            <div>
              <p className="text-xs text-amber-300/90 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)]">LIQ</p>
              <p className="font-bold text-xs sm:text-sm text-white/95 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)]">{liquidity}</p>
            </div>
            <div>
              <p className="text-xs text-amber-300/90 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)]">VOL</p>
              <p className="font-bold text-xs sm:text-sm text-white/95 [text-shadow:-1px_-1px_1px_rgba(255,255,255,0.2),_1px_1px_2px_rgba(0,0,0,0.5)]">{volume}</p>
            </div>
          </div>
          
          <div className="mt-3 relative">
            <div className="bg-[#a07b24] rounded-full p-[2px] shadow-sm box-shadow-3">
              <div className="bg-[#a07b24] rounded-full h-6 sm:h-8 relative overflow-hidden
                                shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-2px_0_3px_rgba(0,0,0,0.3),inset_0_-2px_3px_rgba(0,0,0,0.4)]">
                <div className="bg-[#a07b24] rounded-full p-[1px] h-full">
                  <div 
                    className="bg-gradient-to-r from-[#fbc710] via-[#f8d96e] to-[#f8d96e] h-full rounded-full 
                                flex items-center justify-center relative overflow-hidden
                                shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3),inset_-1px_0_2px_rgba(0,0,0,0.1)] box-shadow-3" 
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent rounded-full"></div>
                    <span className="text-black font-bold text-xs sm:text-sm relative z-10">{progress}%</span>
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