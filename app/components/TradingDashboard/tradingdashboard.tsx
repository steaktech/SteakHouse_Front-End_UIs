import React, { useState } from "react";
import {
  Flame,
  BarChart,
  DollarSign,
  Search,
  Star,
  Wrench,
  Smile,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import DashboardStatCard from "./DashboardStatCard";
import { FilterButton } from "./FilterButton";
import { TokenCard } from "./TokenCard";
import FeaturedTokenCard from "./FeaturedTokenCard";
import FeaturedTokenCard2 from "./FeaturedTokenCard2";
import FeaturedTokenCard3 from "./FeaturedTokenCard3";
import { StatCardProps } from "./types";
import TrendingSearchModal from "../Modals/TrendingSearchModal";
import SmartVideo from "../UI/SmartVideo";
import { useTokens } from "@/app/hooks/useTokens";
import styles from "../UI/Botton.module.css";

export default function TradingDashboard() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { 
    tokenCards, 
    isLoading, 
    error, 
    refetch,
    sortByVolume,
    sortByMarketCap,
    sortByAge,
    filterByType,
    showAll,
    filters
  } = useTokens();

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

  // Handle refresh button click
  const handleRefresh = () => {
    refetch();
  };

  // Render loading state
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c87414] mb-4"></div>
      <p className="text-[#c87414] text-lg font-medium">Loading tokens...</p>
      <p className="text-gray-400 text-sm mt-2">Fetching the latest token data</p>
    </div>
  );

  // Render error state
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
      <p className="text-red-400 text-lg font-medium mb-2">Failed to load tokens</p>
      <p className="text-gray-400 text-sm text-center mb-4">
        {error?.message || 'An error occurred while fetching token data'}
      </p>
      <button
        onClick={handleRefresh}
        className={`${styles["btn-5"]} flex items-center gap-2`}
      >
        <RefreshCw size={16} />
        <span>Try Again</span>
      </button>
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Star className="h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-400 text-lg font-medium mb-2">No tokens found</p>
      <p className="text-gray-500 text-sm text-center mb-4">
        No tokens are available at the moment. Try refreshing the page.
      </p>
      <button
        onClick={handleRefresh}
        className={`${styles["btn-5"]} flex items-center gap-2`}
      >
        <RefreshCw size={16} />
        <span>Refresh</span>
      </button>
    </div>
  );

  return (
    <>
      <style jsx>{`
        /* Prevent overscroll behavior */
        :global(html) {
          overscroll-behavior: none;
          overflow-x: hidden;
        }
        
        :global(body) {
          overscroll-behavior: none;
          overflow-x: hidden;
          position: relative;
        }
        
        /* Custom responsive grid for token cards with fixed columns */
        .token-grid {
          display: grid;
          gap: 1rem;
          justify-items: start;
          align-items: start;
          grid-template-columns: 1fr;
        }
        
        /* Tablet: 2 columns */
        @media (min-width: 640px) {
          .token-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }
        
        /* Desktop: 3 columns */
        @media (min-width: 1250px) {
          .token-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.2rem; /* 80% of 1.5rem */
          }
        }
        
        /* Large desktop: 4 columns */
        @media (min-width: 1650px) {
          .token-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1.2rem; /* 80% of 1.5rem */
          }
        }
        
        /* Container styling with consistent minimum height */
        .token-container {
          min-height: 800px;
          max-width: 100%;
          overflow: hidden;
          padding-left: 0;
          padding-right: 0;
        }
        
        @media (min-width: 1024px) {
          .token-container {
            min-height: 640px; /* 80% of 800px */
          }
        }
        
        /* Ensure cards maintain consistent sizing */
        .token-grid > div {
          width: 100%;
          max-width: 420px;
          justify-self: start;
        }
        
        /* Center cards when there are fewer than grid columns */
        .token-grid.few-items {
          justify-content: start;
          justify-items: start;
        }
        
        /* On mobile, perfectly center token cards */
        @media (max-width: 639px) {
          .token-container {
            padding: 16px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .token-grid {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            padding: 0;
            margin: 0 auto;
            width: 100%;
          }
          
          .token-grid > div {
            display: flex;
            justify-content: center;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
        }
      `}</style>
      <div className="bg-transparent font-sans">
      <div className="max-w-full xl:max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-6 pt-4 sm:pt-6 lg:pt-6">
        <header className="relative flex flex-col md:flex-row items-center mb-5 mt-[-20px] md:mt-3 lg:mt-2 mb-8 lg:mb-6">
          <div className="md:w-2/3 text-center md:text-left z-10">
            <h1
              style={headingStyle}
              // The `font-bold` class is removed as `fontWeight` is now set in the style object
              className="text-7xl md:text-[6rem] lg:text-[5.6rem] xl:text-[7.2rem] 2xl:text-[7.2rem]"
            >
              The <span className="lg:text-[6.4rem] xl:text-[8rem] 2xl:text-[8rem]">Dev's</span>{" "}
              <span className="lg:text-[4.8rem] xl:text-[5.6rem] 2xl:text-[5.6rem]">Kitchen</span>
            </h1>

            <p className="mt-6 lg:mt-4 text-3xl md:text-4xl lg:text-4xl xl:text-4xl font-semibold text-[#e4bb0f]">
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-11 lg:gap-8 mb-8 lg:mb-6">
          {statsData.map((stat, index) => (
            <DashboardStatCard
              key={index}
              title={stat.title}
              value={stat.value}
            />
          ))}
        </div>

        <div>
          <div className="bg-gradient-to-b from-[#532301] to-transparent p-2 sm:p-4 lg:p-3 rounded-t-xl lg:rounded-t-lg mb-0 shadow-[0_10px_20px_rgba(43,18,1,0.5),_inset_0_2px_3px_rgba(255,235,205,0.2),_inset_0_-4px_5px_rgba(0,0,0,0.4)]">
            {/* Mobile Layout (0px - 639px) */}
            <div className="block sm:hidden">
              {/* Search bar at top for mobile */}
              <div className="mb-2">
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className={`${styles["btn-5"]} flex items-center gap-1 w-full justify-center text-xs py-1.5`}
                >
                  <span className={styles.rightSteak}>🥩</span>
                  <Search size={14} />
                  <span>Search...</span>
                </button>
              </div>
              
              {/* Filter buttons in 2 rows of 3 for mobile */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 justify-between">
                  <FilterButton 
                    icon={<BarChart size={12} />} 
                    label="Volume" 
                    active={filters.sortBy === 'volume'}
                    onClick={sortByVolume}
                  />
                  <FilterButton 
                    icon={<DollarSign size={12} />} 
                    label="MCAP" 
                    active={filters.sortBy === 'mcap'}
                    onClick={sortByMarketCap}
                  />
                  <FilterButton 
                    icon={<Flame size={12} />} 
                    label="Trending" 
                    onClick={showAll}
                  />
                </div>
                <div className="flex items-center gap-1 justify-between">
                  <FilterButton 
                    icon={<Star size={12} />} 
                    label="New" 
                    active={filters.sortBy === 'age'}
                    onClick={sortByAge}
                  />
                  <FilterButton 
                    icon={<Wrench size={12} />} 
                    label="Utility" 
                    active={filters.tokenType === 'Utility'}
                    onClick={() => filterByType('Utility')}
                  />
                  <FilterButton 
                    icon={<Smile size={12} />} 
                    label="Meme" 
                    active={filters.tokenType === 'Meme'}
                    onClick={() => filterByType('Meme')}
                  />
                </div>
              </div>
            </div>

            {/* Tablet/Medium Layout (640px - 1199px) */}
            <div className="hidden sm:block xl:hidden">
              {/* Search bar at top for tablet */}
              <div className="mb-3">
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className={`${styles["btn-5"]} flex items-center gap-2 w-full justify-center`}
                >
                  <span className={styles.rightSteak}>🥩</span>
                  <Search size={16} />
                  <span>Search...</span>
                </button>
              </div>
              
              {/* All filter buttons in one row for tablet */}
              <div className="flex items-center gap-2 justify-center flex-wrap">
                <FilterButton 
                  icon={<BarChart size={14} />} 
                  label="Volume" 
                  active={filters.sortBy === 'volume'}
                  onClick={sortByVolume}
                />
                <FilterButton 
                  icon={<DollarSign size={14} />} 
                  label="MCAP" 
                  active={filters.sortBy === 'mcap'}
                  onClick={sortByMarketCap}
                />
                <FilterButton 
                  icon={<Flame size={14} />} 
                  label="Trending" 
                  onClick={showAll}
                />
                <FilterButton 
                  icon={<Star size={14} />} 
                  label="New" 
                  active={filters.sortBy === 'age'}
                  onClick={sortByAge}
                />
                <FilterButton 
                  icon={<Wrench size={14} />} 
                  label="Utility" 
                  active={filters.tokenType === 'Utility'}
                  onClick={() => filterByType('Utility')}
                />
                <FilterButton 
                  icon={<Smile size={14} />} 
                  label="Meme" 
                  active={filters.tokenType === 'Meme'}
                  onClick={() => filterByType('Meme')}
                />
              </div>
            </div>

            {/* Desktop Layout (1200px+) */}
            <div className="hidden xl:flex flex-wrap items-center gap-2 lg:gap-1.5 justify-between">
              <div className="flex items-center gap-2 lg:gap-1.5 flex-wrap">
                <FilterButton 
                  icon={<BarChart size={16} className="lg:w-3.5 lg:h-3.5" />} 
                  label="Volume" 
                  active={filters.sortBy === 'volume'}
                  onClick={sortByVolume}
                />
                <FilterButton 
                  icon={<DollarSign size={16} className="lg:w-3.5 lg:h-3.5" />} 
                  label="MCAP" 
                  active={filters.sortBy === 'mcap'}
                  onClick={sortByMarketCap}
                />
                <FilterButton 
                  icon={<Flame size={16} className="lg:w-3.5 lg:h-3.5" />} 
                  label="Trending" 
                  onClick={showAll}
                />
              </div>

              <div className="flex items-center gap-2 lg:gap-1.5">
                <button
                  type="button"
                  onClick={handleSearchClick}
                  className={`${styles["btn-5"]} flex items-center gap-2 lg:gap-1.5`}
                >
                  <span className={styles.rightSteak}>🥩</span>
                  <Search size={18} className="lg:w-4 lg:h-4" />
                  <span>Search...</span>
                </button>
                {/* <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className={`${styles["btn-5"]} flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Refresh tokens"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button> */}
              </div>

              <div className="flex items-center gap-2 lg:gap-1.5 flex-wrap">
                <FilterButton 
                  icon={<Star size={16} className="lg:w-3.5 lg:h-3.5" />} 
                  label="New" 
                  active={filters.sortBy === 'age'}
                  onClick={sortByAge}
                />
                <FilterButton 
                  icon={<Wrench size={16} className="lg:w-3.5 lg:h-3.5" />} 
                  label="Utility" 
                  active={filters.tokenType === 'Utility'}
                  onClick={() => filterByType('Utility')}
                />
                <FilterButton 
                  icon={<Smile size={16} className="lg:w-3.5 lg:h-3.5" />} 
                  label="Meme" 
                  active={filters.tokenType === 'Meme'}
                  onClick={() => filterByType('Meme')}
                />
              </div>
            </div>
          </div>

          <div className="token-container bg-[#1b0a03]/40 backdrop-blur-lg rounded-t-xl lg:rounded-t-lg border-t border-l border-r border-white/20 shadow-lg p-4 sm:p-6 lg:p-4 pb-0">
            {isLoading ? (
              renderLoadingState()
            ) : error ? (
              renderErrorState()
            ) : tokenCards.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="token-grid pb-4 sm:pb-6 lg:pb-4">
                {/* Featured NUTTERBUTTER Token */}
                <div>
                  <FeaturedTokenCard />
                </div>
                {/* Featured BURN Token */}
                <div>
                  <FeaturedTokenCard2 />
                </div>
                {/* Featured GROYPER Token */}
                <div>
                  <FeaturedTokenCard3 />
                </div>
                {tokenCards.map((token, index) => (
                  <div key={`${token.symbol}-${index}`}>
                    <TokenCard {...token} />
                  </div>
                ))}
              </div>
            )}
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