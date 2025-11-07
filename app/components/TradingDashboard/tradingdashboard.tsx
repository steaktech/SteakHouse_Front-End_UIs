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
  Clock,
  Percent,
} from "lucide-react";
import DashboardStatCard from "./DashboardStatCard";
import { FilterButton } from "./FilterButton";
import { TokenCard } from "./TokenCard";
import { StatCardProps } from "./types";
import TrendingSearchModal from "../Modals/TrendingSearchModal";
import SmartVideo from "../UI/SmartVideo";
import BottomControlBar from "../BottomControlBar";
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
    sortByTax,
    filterByType,
    filterByCategory,
    showAll,
    applySearchFilters,
    clearAllFilters,
    filters,
    pagination,
    goToPage,
    nextPage,
    previousPage
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
    
    // Convert string values to numbers for numeric filters
    const numericFilters: Record<string, any> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        numericFilters[key] = numericValue;
      } else {
        numericFilters[key] = value;
      }
    });
    
    // Apply the search filters using the hook
    applySearchFilters(numericFilters);
  };

  const statsData: StatCardProps[] = [
    { title: "TOKEN'S LAUNCHED", value: "2678" },
    { title: "TVL", value: "$5.7m" },
    { title: "24H VOLUME", value: "$726k" },
    { title: "GRADUATION RATE", value: "3.69%" },
    { title: "CREATOR REVENUE", value: "$388k" },
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
        
        /* 3 cards when container can fit 3 × min card width */
        @media (min-width: 1250px) {
          .token-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        
        /* 5 cards on wide screens */
        @media (min-width: 1650px) {
          .token-grid {
            grid-template-columns: repeat(5, 1fr) !important;
          }
        }
        
        /* Ensure container doesn't overflow */
        .token-container {
          max-width: 100%;
          overflow: visible;
          container-type: inline-size;
        }
        
        /* Use CSS auto-fit for more responsive behavior with smaller min card width */
        @supports (grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))) {
          .token-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
            place-items: stretch;
          }
        }
        
        /* Ensure cards don't get too wide */
        .token-grid > div {
          max-width: 320px;
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
        <header className="relative flex flex-col md:flex-row items-center mb-6 mt-0 md:mt-4 lg:mt-6">
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
            {/* Mobile Layout (0px - 639px) */}
            <div className="block sm:hidden">
              {/* Search bar at top for mobile */}
              <div className="mb-2">
                <button
                  type="button"
                  onClick={handleSearchClick}
                  aria-label="Open search"
                  className={`${styles["btn-5"]} ${styles.searchLike} relative w-full flex items-center gap-2 rounded-full border border-white/20 bg-transparent hover:bg-white/5 text-white/90 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c87414]/40 transition`}
                >
                  <span className={styles.leftSteak}>🥩</span>
                  <span className={styles.rightSteak}>🥩</span>
                  <Search size={14} className="text-white/70" />
                  <span className="text-white/70">Search tokens...</span>
                </button>
              </div>

              {/* Filter buttons in 3 rows for mobile to accommodate all buttons */}
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
                    icon={<Clock size={12} />} 
                    label="Age" 
                    active={filters.sortBy === 'age'}
                    onClick={sortByAge}
                  />
                  <FilterButton 
                    icon={<Percent size={12} />} 
                    label="Low Tax" 
                    active={filters.sortBy === 'tax'}
                    onClick={sortByTax}
                  />
                  <FilterButton 
                    icon={<Star size={12} />} 
                    label="Meme" 
                    active={filters.category === 'meme'}
                    onClick={() => filterByCategory('meme')}
                  />
                </div>
                <div className="flex items-center gap-1 justify-between">
                  <FilterButton 
                    icon={<Wrench size={12} />} 
                    label="Utility" 
                    active={filters.category === 'utility'}
                    onClick={() => filterByCategory('utility')}
                  />
                  <FilterButton 
                    icon={<Smile size={12} />} 
                    label="AI" 
                    active={filters.category === 'ai'}
                    onClick={() => filterByCategory('ai')}
                  />
                  <FilterButton 
                    icon={<Smile size={12} />} 
                    label="X-post" 
                    active={filters.category === 'x-post'}
                    onClick={() => filterByCategory('x-post')}
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
                  aria-label="Open search"
                  className={`${styles["btn-5"]} ${styles.searchLike} relative w-full flex items-center gap-2 rounded-full border border-white/20 bg-transparent hover:bg-white/5 text-white/90 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#c87414]/40 transition`}
                >
                  <span className={styles.leftSteak}>🥩</span>
                  <span className={styles.rightSteak}>🥩</span>
                  <Search size={16} className="text-white/70" />
                  <span className="text-white/70">Search tokens...</span>
                </button>
              </div>

              {/* All filter buttons with flex-wrap for tablet */}
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
                  icon={<Clock size={14} />} 
                  label="Age" 
                  active={filters.sortBy === 'age'}
                  onClick={sortByAge}
                />
                <FilterButton 
                  icon={<Percent size={14} />} 
                  label="Low Tax" 
                  active={filters.sortBy === 'tax'}
                  onClick={sortByTax}
                />
                <FilterButton 
                  icon={<Star size={14} />} 
                  label="Meme" 
                  active={filters.category === 'meme'}
                  onClick={() => filterByCategory('meme')}
                />
                <FilterButton 
                  icon={<Wrench size={14} />} 
                  label="Utility" 
                  active={filters.category === 'utility'}
                  onClick={() => filterByCategory('utility')}
                />
                <FilterButton 
                  icon={<Smile size={14} />} 
                  label="AI" 
                  active={filters.category === 'ai'}
                  onClick={() => filterByCategory('ai')}
                />
                <FilterButton 
                  icon={<Smile size={14} />} 
                  label="X-post" 
                  active={filters.category === 'x-post'}
                  onClick={() => filterByCategory('x-post')}
                />
              </div>
            </div>

            {/* Desktop Layout (1200px+) */}
            <div className="hidden xl:block">
              {/* Row 1: Search (full width) */}
              <div className="mb-3">
                <button
                  type="button"
                  onClick={handleSearchClick}
                  aria-label="Open search"
                  className={`${styles["btn-5"]} ${styles.searchLike} relative w-full flex items-center gap-3 rounded-full border border-white/20 bg-transparent hover:bg-white/5 text-white/90 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#c87414]/40 transition`}
                >
                  <span className={styles.leftSteak}>🥩</span>
                  <span className={styles.rightSteak}>🥩</span>
                  <Search size={18} className="text-white/70" />
                  <span className="text-white/70">Search tokens...</span>
                </button>
              </div>

              {/* Row 2: Filter buttons (wrap as needed) */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Left group */}
                <div className="flex items-center gap-2 flex-wrap">
                  <FilterButton 
                    icon={<BarChart size={16} />} 
                    label="Volume" 
                    active={filters.sortBy === 'volume'}
                    onClick={sortByVolume}
                  />
                  <FilterButton 
                    icon={<DollarSign size={16} />} 
                    label="MCAP" 
                    active={filters.sortBy === 'mcap'}
                    onClick={sortByMarketCap}
                  />
                  <FilterButton 
                    icon={<Flame size={16} />} 
                    label="Trending" 
                    onClick={showAll}
                  />
                  <FilterButton 
                    icon={<Clock size={16} />} 
                    label="Age" 
                    active={filters.sortBy === 'age'}
                    onClick={sortByAge}
                  />
                  <FilterButton 
                    icon={<Percent size={16} />} 
                    label="Low Tax" 
                    active={filters.sortBy === 'tax'}
                    onClick={sortByTax}
                  />
                </div>
                {/* Right group */}
                <div className="flex items-center gap-2 flex-wrap">
                  <FilterButton 
                    icon={<Star size={16} />} 
                    label="Meme" 
                    active={filters.category === 'meme'}
                    onClick={() => filterByCategory('meme')}
                  />
                  <FilterButton 
                    icon={<Wrench size={16} />} 
                    label="Utility" 
                    active={filters.category === 'utility'}
                    onClick={() => filterByCategory('utility')}
                  />
                  <FilterButton 
                    icon={<Smile size={16} />} 
                    label="AI" 
                    active={filters.category === 'ai'}
                    onClick={() => filterByCategory('ai')}
                  />
                  <FilterButton 
                    icon={<Smile size={16} />} 
                    label="X-post" 
                    active={filters.category === 'x-post'}
                    onClick={() => filterByCategory('x-post')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="token-container bg-[#1b0a03]/40 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-4 sm:p-6">
            {isLoading ? (
              renderLoadingState()
            ) : error ? (
              renderErrorState()
            ) : tokenCards.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="token-grid grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                {tokenCards.map((token, index) => (
                  <div key={`${token.symbol}-${index}`} className="h-full">
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
        onClearAll={clearAllFilters}
      />
      </div>

      <BottomControlBar
        currentPage={pagination.currentPage}
        hasMore={pagination.hasMore}
        nextPage={pagination.nextPage}
        prevPage={pagination.prevPage}
        onPageChange={goToPage}
        onNextPage={nextPage}
        onPreviousPage={previousPage}
      />
    </>
  );
}