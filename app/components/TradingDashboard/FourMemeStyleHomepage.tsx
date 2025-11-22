'use client';
import React, { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Flame,
  BarChart,
  DollarSign,
  Clock,
  Percent,
  Star,
  Wrench,
  Smile,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { TokenCard } from "./TokenCard";
import { useTokens } from "@/app/hooks/useTokens";
import TrendingSearchModal from "../Modals/TrendingSearchModal";
import SteakHouseInfoModal from "../Modals/SteakHouseInfoModal";
import CreateTokenModal from "../Modals/CreateTokenModal/CreateTokenModal";
import styles from "../UI/Botton.module.css";
import { useNameSearch } from "@/app/hooks/useNameSearch";
import { getFullTokenData } from "@/app/lib/api/services/tokenService";
import { normalizeEthereumAddress } from "@/app/lib/utils/addressValidation";
import { transformTokensToCardProps, formatNumber, calculateGraduationProgress, getTokenTag, getTokenTagColor, generateTokenDescription, getTaxInfo } from "@/app/lib/utils/tokenUtils";
import { TokenCardProps } from "./types";
import { FullTokenDataResponse } from "@/app/types/token";

interface FilterButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${active
      ? 'bg-[#c87414] text-white shadow-lg'
      : 'bg-[#2b1200]/60 text-[#f6e7b5]/80 hover:bg-[#2b1200]/80 border border-[#c87414]/20'
      }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Typewriter effect component
const TypewriterText: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, 50); // Speed of typing

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span className="bg-gradient-to-r from-[#f3cc76] via-[#e8b35c] to-[#c87414] bg-clip-text text-transparent">
      <span>{displayedText}</span>
      {!isComplete && <span className="animate-pulse bg-gradient-to-r from-[#f3cc76] via-[#e8b35c] to-[#c87414] bg-clip-text text-transparent">|</span>}
    </span>
  );
};

// Features list with rotating typewriter effect (one line at a time)
const TypewriterFeatures: React.FC = () => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [key, setKey] = useState(0);

  const features = [
    "Ready to cook? Steakhouse lets you",
    "Launch for $3",
    "Launch on ETH, ARB, BSC, BASE",
    "Launch with tax, no tax, wallet limits, etc"
  ];

  useEffect(() => {
    // Calculate typing duration based on text length
    const currentText = features[currentLineIndex];
    const typingDuration = currentText.length * 50; // 50ms per character
    const displayDuration = 2000; // Show complete text for 2 seconds
    const totalDuration = typingDuration + displayDuration;

    const timer = setTimeout(() => {
      setCurrentLineIndex((prev) => (prev + 1) % features.length);
      setKey((prev) => prev + 1); // Force re-render of TypewriterText
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [currentLineIndex]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50px] sm:min-h-[55px] lg:min-h-[65px]">
      <div className="text-center text-lg sm:text-xl lg:text-2xl font-bold px-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
        <TypewriterText key={key} text={features[currentLineIndex]} />
      </div>
    </div>
  );
};

// Helper to map FullTokenDataResponse to TokenCardProps
const mapFullTokenDataToCardProps = (data: FullTokenDataResponse): TokenCardProps => {
  const { tokenInfo, marketCap, volume24h } = data;

  // Calculate progress
  const progress = calculateGraduationProgress(tokenInfo.eth_pool.toString(), tokenInfo.graduation_cap.toString());

  // Determine tag
  // We need to construct a partial Token object to use getTokenTag
  const partialToken: any = {
    is_super_simple: tokenInfo.is_super_simple,
    is_zero_simple: tokenInfo.is_zero_simple,
    is_advanced: tokenInfo.is_advanced,
    is_stealth: tokenInfo.is_stealth,
    token_type: tokenInfo.token_type,
    graduated: tokenInfo.graduated,
    name: tokenInfo.name,
    symbol: tokenInfo.symbol
  };

  const tag = getTokenTag(partialToken);
  const tagColor = getTokenTagColor(tag);

  // Calculate liquidity
  const ethPoolValue = tokenInfo.eth_pool;
  const ethPriceUSD = 2000; // Consistent with utils
  const liquidityValue = ethPoolValue * ethPriceUSD;

  // Description
  const description = tokenInfo.bio || generateTokenDescription(partialToken);

  // Tax info
  const currentTax = (tokenInfo as any).tax_rate || '0'; // tax_rate might be missing in TokenInfo type but present in response
  const finalTax = tokenInfo.final_tax_rate?.toString() || '0';

  const maxTxPercent = (tokenInfo.curve_max_tx && tokenInfo.total_supply)
    ? `${((tokenInfo.curve_max_tx / tokenInfo.total_supply) * 100).toFixed(1)}%`
    : undefined;

  return {
    isOneStop: tokenInfo.graduated,
    imageUrl: tokenInfo.image_url || undefined,
    bannerUrl: tokenInfo.banner_url || undefined,
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    tag,
    tagColor,
    description,
    mcap: formatNumber(marketCap, { prefix: '$', compact: true }),
    liquidity: formatNumber(liquidityValue, { prefix: '$', compact: true }),
    volume: formatNumber(volume24h || 0, { prefix: '$', compact: true }),
    currentTax,
    finalTax,
    maxTxPercent,
    progress: Math.round(progress * 10) / 10,
    circulating_supply: tokenInfo.circulating_supply.toString(),
    graduation_cap: tokenInfo.graduation_cap.toString(),
    category: tokenInfo.catagory,
    token_address: tokenInfo.token_address,
    telegram: tokenInfo.telegram,
    twitter: tokenInfo.twitter,
    website: tokenInfo.website,
  };
};

export default function FourMemeStyleHomepage() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isCreateTokenModalOpen, setIsCreateTokenModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Search state
  const [searchResults, setSearchResults] = useState<TokenCardProps[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const normalizedAddr = normalizeEthereumAddress(searchQuery);
  const isAddress = !!normalizedAddr;

  const nameSearch = useNameSearch(searchQuery, {
    enabled: searchQuery.trim().length >= 2 && !isAddress,
    pageSize: 10,
    debounceMs: 300,
  });

  useEffect(() => {
    const fetchAddress = async () => {
      if (!normalizedAddr) return;
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await getFullTokenData(normalizedAddr);
        if ((res as any)?.error) {
          setSearchError((res as any).error);
          setSearchResults([]);
        } else {
          const props = mapFullTokenDataToCardProps(res);
          setSearchResults([props]);
        }
      } catch (e) {
        setSearchError("Failed to fetch token");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    if (isAddress) {
      fetchAddress();
    } else {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setSearchError(null);
        setIsSearching(false);
        return;
      }

      if (nameSearch.isLoading) {
        setIsSearching(true);
      } else {
        setIsSearching(false);
        if (nameSearch.error) {
          setSearchError(nameSearch.error.message);
          setSearchResults([]);
        } else if (nameSearch.data) {
          setSearchResults(transformTokensToCardProps(nameSearch.data));
          setSearchError(null);
        } else {
          setSearchResults([]);
        }
      }
    }
  }, [normalizedAddr, isAddress, nameSearch.data, nameSearch.isLoading, nameSearch.error, searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
  };

  const {
    tokenCards,
    isLoading,
    error,
    refetch,
    filterByCategory,
    applySearchFilters,
    clearAllFilters,
    filters,
    sortByVolume,
    sortByMarketCap,
    sortByAge,
    sortByTax,
  } = useTokens();

  const handleApplyFilters = (filters: Record<string, string>) => {
    const numericFilters: Record<string, any> = {};
    Object.entries(filters).forEach(([key, value]) => {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        numericFilters[key] = numericValue;
      } else {
        numericFilters[key] = value;
      }
    });
    applySearchFilters(numericFilters);
  };

  return (
    <>
      <div className="min-h-screen bg-[#1a0f08]">
        {/* Hero Banner Section */}
        <section className="relative w-full px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-4 sm:pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Create Token Banner */}
            <div className="relative bg-gradient-to-r from-[#2b1200]/80 via-[#3d1e01]/80 to-[#2b1200]/80 backdrop-blur-sm rounded-xl overflow-hidden border border-[#c87414]/50 shadow-xl">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#c87414]/0 via-[#c87414]/10 to-[#c87414]/0"></div>

              <div className="relative z-10 px-4 py-2.5 sm:px-6 sm:py-3.5 lg:px-8 lg:py-4.5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 lg:gap-5.5 items-center">
                  {/* Left side - Main heading (50% width) */}
                  <div className="flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-[#c87414]/30 pb-2.5 lg:pb-0 lg:pr-5.5">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1.5 flex items-center justify-center gap-2">
                      <span className="text-lg sm:text-xl lg:text-2xl">🔥</span>
                      <span className="text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-r from-[#f3cc76] via-[#e8b35c] to-[#c87414] bg-clip-text text-transparent pb-2 leading-tight">
                        Let's cook something
                      </span>
                      <span className="text-lg sm:text-xl lg:text-2xl">🔥</span>
                    </h1>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        className="relative px-6 py-2 bg-transparent border-2 border-[#c87414] rounded-full text-[#c87414] text-sm font-bold transition-all hover:bg-[#c87414]/10"
                        onClick={() => setIsInfoModalOpen(true)}
                      >
                        <span className="absolute inset-0 border-2 border-[#c87414] rounded-full animate-pulse"></span>
                        <span className="relative">How it works?</span>
                      </button>
                      <button
                        className="px-6 py-2 bg-gradient-to-r from-[#efb95e] to-[#c87414] hover:from-[#f3cc76] hover:to-[#e8b35c] border-2 border-[#c87414] rounded-full text-[#1a0f08] text-sm font-bold transition-all shadow-lg"
                        onClick={() => setIsCreateTokenModalOpen(true)}
                      >
                        Create a token
                      </button>
                    </div>
                  </div>

                  {/* Right side - Features (50% width) */}
                  <div className="lg:pl-5.5">
                    <TypewriterFeatures />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filters Section */}
        <section className="px-4 sm:px-6 lg:px-8 pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Filter Bar with Search in Middle */}
            <div className="bg-gradient-to-b from-[#532301]/80 to-[#1a0f08] p-3 sm:p-4 rounded-xl mb-6 shadow-[0_10px_20px_rgba(43,18,1,0.5)]">
              {/* Mobile Layout */}
              <div className="block xl:hidden">
                {/* Search bar at top for mobile/tablet */}
                <div className="mb-3 flex gap-2">
                  <div className={`${styles["btn-5"]} ${styles.searchLike} relative flex-1 flex items-center gap-2 rounded-full border border-white/20 bg-[#1a0f08]/40 text-white/90 px-4 py-2.5`}>
                    <span className={styles.leftSteak}>🥩</span>
                    <span className={styles.rightSteak}>🥩</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tokens..."
                      className="flex-1 bg-transparent text-white/90 text-sm placeholder:text-white/70 focus:outline-none"
                    />
                    {searchQuery && (
                      <button onClick={clearSearch} className="text-white/50 hover:text-white">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSearchModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-medium transition-all whitespace-nowrap bg-[#2b1200]/60 text-[#f6e7b5]/80 hover:bg-[#2b1200]/80 border border-[#c87414]/20"
                  >
                    <SlidersHorizontal size={14} />
                    <span>Filter</span>
                  </button>
                </div>

                {/* Filter buttons with flex-wrap - Always visible */}
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
                    onClick={refetch}
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
                </div>
              </div>

              {/* D              {/* Desktop Layout (1200px+) */}
              <div className="hidden xl:block">
                {/* Row 1: Search (full width) with Filter button */}
                <div className="mb-3 flex gap-2">
                  <div className={`${styles["btn-5"]} ${styles.searchLike} relative flex-1 flex items-center gap-3 rounded-full border border-white/20 bg-[#1a0f08]/40 text-white/90 px-5 py-3`}>
                    <span className={styles.leftSteak}>🥩</span>
                    <span className={styles.rightSteak}>🥩</span>
                    <Search size={18} className="text-white/70" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tokens..."
                      className="flex-1 bg-transparent text-white/90 placeholder:text-white/70 focus:outline-none"
                    />
                    {searchQuery && (
                      <button onClick={clearSearch} className="text-white/50 hover:text-white">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSearchModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap bg-[#2b1200]/60 text-[#f6e7b5]/80 hover:bg-[#2b1200]/80 border border-[#c87414]/20"
                  >
                    <SlidersHorizontal size={16} />
                    <span>Filter</span>
                  </button>
                </div>

                {/* Row 2: Filter buttons (left and right groups) - Always visible */}
                <div className="flex items-center justify-between gap-2">
                  {/* Left group */}
                  <div className="flex items-center gap-2">
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
                      onClick={refetch}
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
                  <div className="flex items-center gap-2">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Results Section */}


        {/* Token Grid Section */}
        <section className="px-4 sm:px-6 lg:px-8 pb-12">
          <div className="max-w-7xl mx-auto">
            {(searchQuery.trim().length >= 2 || isSearching) ? (
              // Search Results State
              isSearching ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c87414] mb-4"></div>
                  <p className="text-[#f6e7b5]/70">Searching tokens...</p>
                </div>
              ) : searchError ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-red-400 mb-4">{searchError}</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchResults.map((token, index) => (
                    <TokenCard key={`${token.symbol}-${index}-search`} {...token} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-[#f6e7b5]/70">No tokens found matching "{searchQuery}"</p>
                </div>
              )
            ) : (
              // Default Feed State
              isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c87414] mb-4"></div>
                  <p className="text-[#f6e7b5]/70">Loading tokens...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-red-400 mb-4">Failed to load tokens</p>
                  <button
                    onClick={refetch}
                    className={`${styles.headerBtn} px-6 py-3`}
                  >
                    <div className={styles.headerBtnInner}>Try Again</div>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tokenCards.map((token, index) => (
                    <TokenCard key={`${token.symbol}-${index}`} {...token} />
                  ))}
                </div>
              )
            )}
          </div>
        </section>
      </div>

      <TrendingSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onApply={handleApplyFilters}
        onClearAll={clearAllFilters}
      />

      <SteakHouseInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      <CreateTokenModal
        isOpen={isCreateTokenModalOpen}
        onClose={() => setIsCreateTokenModalOpen(false)}
      />
    </>
  );
}
