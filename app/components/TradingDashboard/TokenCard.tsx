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
  tagColor, 
  description, 
  mcap, 
  liquidity, 
  volume, 
  progress 
}) => (
  <div className="bg-gradient-to-b from-[#532301] to-[#863c04] rounded-2xl p-4 text-white border-2 border-amber-600/30 shadow-lg relative overflow-hidden" style={{ width: '410px', height: '500px' }}>
    {/* Top rounded image */}
    <div className="absolute top-0 left-0 right-0 mb-4">
      <img 
        src="/images/card_img.jpg" 
        alt="Token Header" 
        className="w-full h-32 object-cover rounded-t-2xl"
      />
    </div>
    <div className="mt-32 mb-4"></div>
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        <img src={imageUrl} alt={name} className="w-16 h-16 rounded-full border-2 border-amber-300" />
        <div>
          <h3 className="font-bold text-lg text-[#fade79]">{name}</h3>
          <p className="font-bold text-sm text-[#f8ead3]">{symbol}</p>
        </div>
      </div>
      <div className={`px-3 py-1 text-xs font-semibold rounded-full ${tagColor}`}>
        {tag}
      </div>
    </div>
    
    <div className="mt-4 text-amber-200 text-sm space-y-2">
      <p>TAX: 3/3</p>
      <p className="text-[#f8ead3]">{description}</p>
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

    <div className="mt-4 bg-amber-950/50 p-2 rounded-lg">
      <div className="flex justify-around text-center">
        <div>
          <p className="text-xs text-amber-300">MCAP</p>
          <p className="font-bold text-sm">{mcap}</p>
        </div>
        <div>
          <p className="text-xs text-amber-300">LIQ</p>
          <p className="font-bold text-sm text-green-400">{liquidity}</p>
        </div>
        <div>
          <p className="text-xs text-amber-300">VOL</p>
          <p className="font-bold text-sm">{volume}</p>
        </div>
      </div>
      
      <div className="mt-3 w-full bg-amber-950/50 rounded-full h-8 relative">
        <div 
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-8 rounded-full flex items-center justify-center" 
          style={{ width: `${progress}%` }}
        >
          <span className="text-black font-bold text-sm">{progress}%</span>
        </div>
      </div>
    </div>
  </div>
); 