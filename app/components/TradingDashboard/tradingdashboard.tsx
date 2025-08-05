import React, { useState } from 'react';
import { Flame, BarChart, DollarSign, Search, Star, Wrench, Smile } from 'lucide-react';
import { StatCard } from './StatCard';
import { FilterButton } from './FilterButton';
import { TokenCard } from './TokenCard';
import { StatCardProps, TokenCardProps } from './types';
import TrendingSearchModal from '../Modals/TrendingSearchModal';

export default function TradingDashboard() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  const handleSearchModalClose = () => {
    setIsSearchModalOpen(false);
  };

  const handleApplyFilters = (filters: Record<string, string>) => {
    console.log("Applied Filters:", filters);
    // Here you would typically apply the filters to your data.
  };

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
      imageUrl: "/images/info_icon.jpg",
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
      imageUrl: "/images/info_icon.jpg",
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
      imageUrl: "/images/info_icon.jpg",
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
      imageUrl: "/images/info_icon.jpg",
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
      imageUrl: "/images/info_icon.jpg",
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
      imageUrl: "/images/info_icon.jpg",
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
      {/* This is the new single container for all content. 
        It uses the desired max-width and padding to align everything within it.
      */}
      <div className="max-w-full xl:max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section (now inside the unified container) */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
          {/* Left Side - Text Content */}
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-6xl font-bold text-[#fdfdfb]" style={{ textShadow: '-2px 5px 5px rgba(116,109,93,0.5 )' }}>
              The Dev's Kitchen
            </h1>
            <p className="mt-4 text-4xl font-semibold text-[#3c1c03]">
              Launch A Token For{' '}
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#fea634] to-[#9f3c00]" style={{ textShadow: '1px 1px px rgba(0,0,0,0.3)' }}>
                $3
              </span>
            </p>
          </div>

          {/* Right Side - Video */}
          <div className="md:w-1/2 w-full">
            <div className="aspect-video overflow-hidden">
              <video 
                className="w-full h-full object-cover"
                autoPlay 
                muted 
                loop 
                playsInline
              >
                <source src="/videos/pan-animation.webm" type="video/webm" />
                <source src="/videos/pan-animation.mp4" type="video/mp4" />
                <p className="text-gray-200 font-semibold text-xl flex items-center justify-center h-full">
                  Your browser does not support the video tag.
                </p>
              </video>
            </div>
          </div>
        </header>

        {/* Stats Grid (now inside the unified container) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12 mb-8">
          {statsData.map((stat, index) => (
            <StatCard key={index} title={stat.title} value={stat.value} />
          ))}
        </div>
        
        {/* Filter and Token Cards Section.
          The original wrapper div around this section was removed,
          and its contents are now direct children of the unified container.
        */}
        <div>
          {/* Filter and Search Bar */}
          <div className="bg-gradient-to-b from-[#532301] to-[#863c04] p-4 rounded-t-xl mb-0 flex flex-wrap items-center gap-2 justify-between shadow-[0_10px_20px_rgba(43,18,1,0.5),_inset_0_2px_3px_rgba(255,235,205,0.2),_inset_0_-4px_5px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-2 flex-wrap">
              <FilterButton icon={<BarChart size={16} />} label="Volume" />
              <FilterButton icon={<DollarSign size={16} />} label="MCAP" />
              <FilterButton icon={<Flame size={16} />} label="Trending" />
            </div>
            
            <div className="relative flex-grow sm:flex-grow-0 sm:w-auto ">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none " size={20} />
              <input 
                type="text" 
                placeholder="Search..."
                onClick={handleSearchClick}
                readOnly
                className="bg-[#d69f18] border border-gray-500 text-white placeholder-white rounded-xl pl-10 pr-4 py-2 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer bg-gradient-to-b from-[#a47105] to-[#bb892a] text-[#f6f86c] border-[#925929] shadow-[inset_0_2px_4px_rgba(253,224,71,0.5),_inset_0_-2px_4px_rgba(118,69,10,0.4)] hover:from-yellow-500 hover:to-yellow-600 active:shadow-[inset_0_3px_5px_rgba(118,69,10,0.5)] active:from-yellow-600 active:to-yellow-700"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <FilterButton icon={<Star size={16} />} label="New" />
              <FilterButton icon={<Wrench size={16} />} label="Utility" />
              <FilterButton icon={<Smile size={16} />} label="Meme" />
            </div>
          </div>

          {/* Token Cards Container */}
          <div className="bg-[#d6bb97] rounded-b-xl rounded-t-none p-4 sm:p-6">
            {/* Token Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {tokenData.map((token, index) => (
                <div key={index} className="h-full">
                  <TokenCard {...token} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TrendingSearchModal remains outside the main layout for proper modal layering */}
      <TrendingSearchModal
        isOpen={isSearchModalOpen}
        onClose={handleSearchModalClose}
        onApply={handleApplyFilters}
      />
    </div>
  );
}