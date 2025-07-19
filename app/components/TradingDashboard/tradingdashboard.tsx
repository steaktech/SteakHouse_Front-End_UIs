import React from 'react';
import { Flame, BarChart, DollarSign, Search, Star, Wrench, Smile } from 'lucide-react';
import { StatCard } from './StatCard';
import { FilterButton } from './FilterButton';
import { TokenCard } from './TokenCard';
import { StatCardProps, TokenCardProps } from './types';

export default function TradingDashboard() {
  const statsData: StatCardProps[] = [
    { title: "TOKEN'S LAUNCHED", value: "2678" },
    { title: "TVL", value: "$5.7m" },
    { title: "24H VOLUME", value: "$726k" },
    { title: "GRADUATION RATE", value: "3.69%" },
    { title: "DEV TAX'S", value: "$388k" },
    { title: "AVERAGE X'S", value: "15.8 X" },
  ];

  const tokenData: TokenCardProps[] = [
    {
      isOneStop: true,
      imageUrl: "https://placehold.co/64x64/7E57C2/FFFFFF?text=S",
      name: "SpaceMan",
      symbol: "SPACE",
      tag: "Meme",
      tagColor: "bg-[#fade79] text-black",
      description: "Spaceman is a meme deflationary token with a finite supply and buyback and burn.",
      mcap: "$21.5k",
      liquidity: "$100.3k",
      volume: "$6.2k",
      progress: 91.5,
    },
    {
      imageUrl: "https://placehold.co/64x64/7E57C2/FFFFFF?text=S",
      name: "SpaceMan",
      symbol: "SPACE",
      tag: "Meme",
      tagColor: "bg-[#fade79] text-black",
      description: "Spaceman is a meme deflationary token with a finite supply and buyback and burn.",
      mcap: "$21.5k",
      liquidity: "$100.3k",
      volume: "$6.2k",
      progress: 91.5,
    },
    {
      imageUrl: "https://placehold.co/64x64/7E57C2/FFFFFF?text=S",
      name: "SpaceMan",
      symbol: "SPACE",
      tag: "Meme",
      tagColor: "bg-[#fade79] text-black",
      description: "Spaceman is a meme deflationary token with a finite supply and buyback and burn.",
      mcap: "$21.5k",
      liquidity: "$100.3k",
      volume: "$6.2k",
      progress: 91.5,
    },
    {
      isOneStop: true,
      imageUrl: "https://placehold.co/64x64/7E57C2/FFFFFF?text=S",
      name: "SpaceMan",
      symbol: "SPACE",
      tag: "Meme",
      tagColor: "bg-[#fade79] text-black",
      description: "Spaceman is a meme deflationary token with a finite supply and buyback and burn.",
      mcap: "$21.5k",
      liquidity: "$100.3k",
      volume: "$6.2k",
      progress: 91.5,
    },
    {
      imageUrl: "https://placehold.co/64x64/7E57C2/FFFFFF?text=S",
      name: "SpaceMan",
      symbol: "SPACE",
      tag: "Meme",
      tagColor: "bg-[#fade79] text-black",
      description: "Spaceman is a meme deflationary token with a finite supply and buyback and burn.",
      mcap: "$21.5k",
      liquidity: "$100.3k",
      volume: "$6.2k",
      progress: 91.5,
    },
    {
      imageUrl: "https://placehold.co/64x64/7E57C2/FFFFFF?text=S",
      name: "SpaceMan",
      symbol: "SPACE",
      tag: "Meme",
      tagColor: "bg-[#fade79] text-black",
      description: "Spaceman is a meme deflationary token with a finite supply and buyback and burn.",
      mcap: "$21.5k",
      liquidity: "$100.3k",
      volume: "$6.2k",
      progress: 91.5,
    },
  ];

  return (
    <div className="bg-[#ebd6b4] min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-[#4A3F35] font-serif">Where Real Devs Cook.</h1>
          <p className="text-gray-500 mt-2">
            Stealth kitchen with fully customizable $2 contract deployments with virtual liquidity baked in before hitting the V2 grill.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statsData.map((stat, index) => (
            <StatCard key={index} title={stat.title} value={stat.value} />
          ))}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-gradient-to-b from-[#532301] to-[#863c04] p-4 rounded-t-xl mb-0 flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <FilterButton icon={<BarChart size={16} />} label="Volume" />
            <FilterButton icon={<DollarSign size={16} />} label="MCAP" />
            <FilterButton icon={<Flame size={16} />} label="Trending" />
          </div>
          
          <div className="relative flex-grow sm:flex-grow-0 sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={20} />
            <input 
              type="text" 
              placeholder="Search..."
              className="bg-[#d69f18] border border-gray-500 text-white placeholder-white rounded-xl pl-10 pr-4 py-2 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <FilterButton icon={<Star size={16} />} label="New" />
            <FilterButton icon={<Wrench size={16} />} label="Utility" />
            <FilterButton icon={<Smile size={16} />} label="Meme" />
          </div>
        </div>

        {/* Token Cards Container */}
        <div className="bg-[#d6bb97] rounded-b-xl rounded-t-none p-6">
          {/* Token Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokenData.map((token, index) => (
              <TokenCard key={index} {...token} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
