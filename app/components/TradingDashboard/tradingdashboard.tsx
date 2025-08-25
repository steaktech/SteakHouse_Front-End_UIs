import React, { useState } from "react";
import {
  Flame,
  BarChart,
  DollarSign,
  Search,
  Star,
  Wrench,
  Smile,
} from "lucide-react";
import DashboardStatCard from "./DashboardStatCard";
import { FilterButton } from "./FilterButton";
import { TokenCard } from "./TokenCard";
import { StatCardProps, TokenCardProps } from "./types";
import TrendingSearchModal from "../Modals/TrendingSearchModal";
import SmartVideo from "../UI/SmartVideo";
import styles from "../UI/Botton.module.css";

export default function TradingDashboard() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Style object for the main heading with gradient, stroke, and font
  const headingStyle: React.CSSProperties = {
    // Using the "Inter" font stack for a bold, sans-serif look
    fontFamily: '"Inter", Arial, sans-serif',
    fontWeight: 800, // Extra bold weight to match the effect

    // The gradient fill
    backgroundImage: "linear-gradient(180deg, #c87414, #c46e12)",

    // Clip the background gradient to the shape of the text
    WebkitBackgroundClip: "text",
    backgroundClip: "text",

    // Make the text color transparent to reveal the gradient
    WebkitTextFillColor: "transparent",

    // Create the stroke/outline around the text
    WebkitTextStroke: "2px #c19a3e",
  };

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  const handleSearchModalClose = () => {
    setIsSearchModalOpen(false);
  };

  const handleApplyFilters = (filters: Record<string, string>) => {
    console.log("Applied Filters:", filters);
    // Logic to apply filters would go here
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
      description:
        "Spaceman is a meme deflationary token with a finite supply and buyback and burn.",
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
      description:
        "Spaceman is a meme deflationary token with a finite supply and buyback and burn.",
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
      description:
        "Spaceman is a meme deflationary token with a finite supply and buyback and burn.",
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
      description:
        "Spaceman is a meme deflationary token with a finite supply and buyback and burn.",
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
      description:
        "Spaceman is a meme deflationary token with a finite supply and buyback and burn.",
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
      description:
        "Spaceman is a meme deflationary token with a finite supply and buyback and burn.",
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
      description:
        "Spaceman is a meme deflationary token with a finite supply and buyback and burn.",
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
      description:
        "Spaceman is a meme deflationary token with a finite supply and buyback and burn.",
      mcap: "$21.5k",
      liquidity: "$100.3k",
      volume: "$6.2k",
      progress: 91.5,
    },
  ];

  return (
    <>
      <style jsx>{`
        /* Custom responsive grid for token cards with container-based breakpoints */
        .token-grid {
          /* Default: 1 column on mobile, 2 on small screens */
          grid-template-columns: repeat(1, 1fr);
        }
        
        @media (min-width: 640px) {
          .token-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        /* 3 cards when container can fit 3 × 367px + gaps + padding */
        @media (min-width: 1250px) {
          .token-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        
        /* 4 cards when container can fit 4 × 357px + gaps + padding */
        @media (min-width: 1650px) {
          .token-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
        
        /* Ensure container doesn't overflow */
        .token-container {
          max-width: 100%;
          overflow: visible;
          container-type: inline-size;
        }
        
                /* Use CSS auto-fit for more responsive behavior */
        @supports (grid-template-columns: repeat(auto-fit, minmax(357px, 1fr))) {
          .token-grid {
            grid-template-columns: repeat(auto-fit, minmax(357px, 1fr)) !important;
            justify-content: center;
            place-items: center;
          }
        }
        
        /* Ensure cards don't get too wide when centered */
        .token-grid > div {
          max-width: 420px;
          width: 100%;
        }
        
        /* Override centering on mobile for left alignment */
        @media (max-width: 639px) {
          .token-grid {
            place-items: start !important;
          }
        }
      `}</style>
      <div className="bg-transparent min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-full xl:max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <header className="relative flex flex-col md:flex-row items-center mb-5 mt-[5px] md:mt-20 mb-8">
          <div className="md:w-2/3 text-center md:text-left z-10">
            <h1
              style={headingStyle}
              // The `font-bold` class is removed as `fontWeight` is now set in the style object
              className="text-7xl md:text-[6rem] lg:text-[7rem] xl:text-[9rem] 2xl:text-[9rem]"
            >
              The <span className="2xl:text-[10rem]">Dev's</span>{" "}
              <span className="2xl:text-[7rem]">Kitchen</span>
            </h1>

            <p className="mt-6 text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-semibold text-[#e4bb0f]">
              Launch A Token For $3
              {/* <span className="font-bold">
                <img
                  src="/images/3d.png"
                  alt="$3"
                  className="h-15 md:h-12 lg:h-14 xl:h-28 inline-block"
                />
              </span> */}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-11 mb-8">
          {statsData.map((stat, index) => (
            <DashboardStatCard
              key={index}
              title={stat.title}
              value={stat.value}
            />
          ))}
        </div>

        <div>
          <div className="bg-gradient-to-b from-[#532301] to-transparent p-2 sm:p-4 rounded-t-xl mb-0 shadow-[0_10px_20px_rgba(43,18,1,0.5),_inset_0_2px_3px_rgba(255,235,205,0.2),_inset_0_-4px_5px_rgba(0,0,0,0.4)]">
            {/* Mobile Layout */}
            <div className="sm:hidden">
              {/* Search bar at top for mobile */}
              <div className="mb-2">
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className={`${styles["btn-5"]} flex items-center gap-1 w-full justify-center text-xs py-1.5`}
                >
                  <Search size={14} />
                  <span>Search...</span>
                </button>
              </div>
              
              {/* Filter buttons in 2 rows of 3 for mobile */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 justify-between">
                  <FilterButton icon={<BarChart size={12} />} label="Volume" />
                  <FilterButton icon={<DollarSign size={12} />} label="MCAP" />
                  <FilterButton icon={<Flame size={12} />} label="Trending" />
                </div>
                <div className="flex items-center gap-1 justify-between">
                  <FilterButton icon={<Star size={12} />} label="New" />
                  <FilterButton icon={<Wrench size={12} />} label="Utility" />
                  <FilterButton icon={<Smile size={12} />} label="Meme" />
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <FilterButton icon={<BarChart size={16} />} label="Volume" />
                <FilterButton icon={<DollarSign size={16} />} label="MCAP" />
                <FilterButton icon={<Flame size={16} />} label="Trending" />
              </div>

              <div className="sm:w-auto">
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className={`${styles["btn-5"]} flex items-center gap-2`}
                >
                  <Search size={18} />
                  <span>Search...</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <FilterButton icon={<Star size={16} />} label="New" />
                <FilterButton icon={<Wrench size={16} />} label="Utility" />
                <FilterButton icon={<Smile size={16} />} label="Meme" />
              </div>
            </div>
          </div>

          <div className="token-container bg-[#1b0a03]/40 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-4 sm:p-6">
            <div className="token-grid grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {tokenData.map((token, index) => (
                <div key={index} className="h-full">
                  <TokenCard {...token} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TrendingSearchModal
        isOpen={isSearchModalOpen}
        onClose={handleSearchModalClose}
        onApply={handleApplyFilters}
      />
      </div>
    </>
  );
}