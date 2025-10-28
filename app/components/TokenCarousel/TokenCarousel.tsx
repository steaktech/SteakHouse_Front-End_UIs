import { useEffect, useState, useCallback, useRef } from 'react';
import { TokenCard } from '@/app/components/TokenCarousel/CarouselTokenCard';
import styles from './TokenCarousel.module.css';
import { useTokens } from '@/app/hooks/useTokens';
import { TokenCardProps } from '../TradingDashboard/types';

// Types for the carousel props
interface TokenCarouselProps {
  direction: 'up' | 'down';
  className?: string;
}

export const TokenCarousel: React.FC<TokenCarouselProps> = ({
  direction,
  className = ''
}) => {
  const [displayTokens, setDisplayTokens] = useState<TokenCardProps[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasInitialFetchRef = useRef(false);
  
  // Get random page between 1 and 15
  const getRandomPage = useCallback(() => {
    return Math.floor(Math.random() * 15) + 1;
  }, []);

  const {
    tokenCards,
    isLoading,
    refetch,
    updateFilters
  } = useTokens({
    limit: 12, // Set page size to 24
    page: getRandomPage(), // Start from random page
    sortBy: 'mcap',
    sortOrder: 'desc'
  });

  // Shuffle array function
  const shuffleArray = (array: TokenCardProps[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Function to update tokens without fetching
  const updateDisplayTokens = useCallback(() => {
    if (tokenCards.length > 0) {
      const shuffled = shuffleArray(tokenCards);
      setDisplayTokens(shuffled.slice(0, 24)); // Take all 24 tokens
    }
  }, [tokenCards]);

  // Function to fetch and update tokens
  const fetchAndUpdateTokens = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      // Update to a new random page before fetching
      await updateFilters({ page: getRandomPage() });
      await refetch();
      updateDisplayTokens();
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, isRefreshing, updateDisplayTokens, updateFilters, getRandomPage]);

  // Update display when tokenCards change
  useEffect(() => {
    if (tokenCards.length > 0) {
      updateDisplayTokens();
    }
  }, [tokenCards, updateDisplayTokens]);

  // Initial fetch of tokens with cleanup
  useEffect(() => {
    if (hasInitialFetchRef.current) return;

    const abortController = new AbortController();
    hasInitialFetchRef.current = true;
    
    const initialFetch = async () => {
      try {
        await fetchAndUpdateTokens();
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error in initial fetch:', error);
          hasInitialFetchRef.current = false; // Reset on error to allow retry
        }
      }
    };

    initialFetch();

    return () => {
      abortController.abort();
    };
  }, [fetchAndUpdateTokens]);

  // Set up periodic refresh every 120 seconds
  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        await fetchAndUpdateTokens();
      } catch (error) {
        console.error('Error in periodic refresh:', error);
      }
    }, 120 * 1000); // 120 seconds

    return () => clearInterval(intervalId);
  }, [fetchAndUpdateTokens]);

  // Create seamless loop by duplicating tokens
  const items = [...displayTokens, ...displayTokens];

  // Don't render until we have tokens
  if (displayTokens.length === 0) {
    return null;
  }

  return (
    <div
      className={`${styles.carouselContainer} ${className}`}
      aria-hidden="true" // Hide from screen readers as this is decorative
    >
      <div className={styles.viewport}>
        <div className={`${styles.track} ${styles[direction]}`}>
          {items.map((token, idx) => (
            <div
              key={`${token.token_address}-${idx}`}
              className={styles.card}
            >
              <TokenCard {...token} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};