"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, User, TrendingUp, TrendingDown, Activity, Clock, DollarSign, Award, Target, BarChart3, ArrowUpRight, ArrowDownRight, Copy, ExternalLink } from 'lucide-react';
import styles from './UserProfileWidget.module.css';
import { PriceService } from '@/app/lib/api/services/priceService';
import {
  UserProfileWidgetProps,
  UserProfileWidgetState,
  TabType,
  TimeframeType,
  TokenPosition,
  TokenTransaction,
  WalletStats,
  UserProfileData
} from './types';

// Demo data for user profile
const demoUserData: UserProfileData = {
  walletStats: {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    totalBalanceUSD: 45678.90,
    ethBalance: 12.5,
    ethBalanceUSD: 28750.00,
    totalPnL: 8934.50,
    totalPnLPercent: 24.3,
    dailyPnL: 342.75,
    dailyPnLPercent: 0.75,
    weeklyPnL: 1235.40,
    weeklyPnLPercent: 2.78,
    totalTrades: 127,
    winRate: 68.5,
    bestTrade: 2345.67,
    worstTrade: -1234.89,
    avgTradeSize: 850.45,
  },
  positions: [
    {
      tokenAddress: '0x0000000000000000000000000000000000000000',
      tokenName: 'NUTTERBUTTER',
      tokenSymbol: 'NUTBUT',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmq6wLPreTp0RPdc75gSA85CvopA9sZtWhkA&s',
      amount: 50000,
      avgBuyPrice: 0.0567,
      currentPrice: 0.0782,
      valueUSD: 3910.00,
      pnlUSD: 1075.00,
      pnlPercent: 37.92,
    },
    {
      tokenAddress: '0x0000000000000000000000000000000000000001',
      tokenName: 'BURN',
      tokenSymbol: 'BURN',
      imageUrl: 'https://pbs.twimg.com/media/G3Fi03YXsAA66pj?format=jpg&name=medium',
      amount: 125000,
      avgBuyPrice: 0.0634,
      currentPrice: 0.0567,
      valueUSD: 7087.50,
      pnlUSD: -837.50,
      pnlPercent: -10.57,
    },
    {
      tokenAddress: '0x0000000000000000000000000000000000000002',
      tokenName: 'GROYPER',
      tokenSymbol: 'GROYPER',
      imageUrl: 'https://pbs.twimg.com/profile_images/1851836711245930496/Rd9y0Kmj_400x400.png',
      amount: 100000,
      avgBuyPrice: 0.0689,
      currentPrice: 0.0823,
      valueUSD: 8230.00,
      pnlUSD: 1340.00,
      pnlPercent: 19.45,
    },
  ],
  recentTransactions: (() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

    return [
      {
        id: '1',
        tokenName: 'GROYPER',
        tokenSymbol: 'GROYPER',
        tokenAddress: '0x0000000000000000000000000000000000000002',
        imageUrl: 'https://pbs.twimg.com/profile_images/1851836711245930496/Rd9y0Kmj_400x400.png',
        type: 'buy' as const,
        amount: 50000,
        priceUSD: 0.0823,
        totalValueUSD: 4115.00,
        timestamp: oneDayAgo,
        txHash: '0xabc123...',
      },
      {
        id: '2',
        tokenName: 'Ethereum',
        tokenSymbol: 'ETH',
        tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        imageUrl: '/images/ethereum-logo.png',
        type: 'deposit' as const,
        amount: 2.5,
        priceUSD: 2645.00,
        totalValueUSD: 6612.50,
        timestamp: twoDaysAgo,
        txHash: '0xdep789...',
      },
      {
        id: '3',
        tokenName: 'BURN',
        tokenSymbol: 'BURN',
        tokenAddress: '0x0000000000000000000000000000000000000001',
        imageUrl: 'https://pbs.twimg.com/media/G3Fi03YXsAA66pj?format=jpg&name=medium',
        type: 'sell' as const,
        amount: 25000,
        priceUSD: 0.0589,
        totalValueUSD: 1472.50,
        timestamp: threeDaysAgo,
        txHash: '0xdef456...',
      },
      {
        id: '4',
        tokenName: 'NUTTERBUTTER',
        tokenSymbol: 'NUTBUT',
        tokenAddress: '0x0000000000000000000000000000000000000000',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmq6wLPreTp0RPdc75gSA85CvopA9sZtWhkA&s',
        type: 'buy' as const,
        amount: 50000,
        priceUSD: 0.0567,
        totalValueUSD: 2835.00,
        timestamp: fourDaysAgo,
        txHash: '0x789ghi...',
      },
      {
        id: '5',
        tokenName: 'Ethereum',
        tokenSymbol: 'ETH',
        tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        imageUrl: '/images/ethereum-logo.png',
        type: 'withdraw' as const,
        amount: 1.5,
        priceUSD: 2598.00,
        totalValueUSD: 3897.00,
        timestamp: fiveDaysAgo,
        txHash: '0xwit345...',
      },
      {
        id: '6',
        tokenName: 'BURN',
        tokenSymbol: 'BURN',
        tokenAddress: '0x0000000000000000000000000000000000000001',
        imageUrl: 'https://pbs.twimg.com/media/G3Fi03YXsAA66pj?format=jpg&name=medium',
        type: 'buy' as const,
        amount: 100000,
        priceUSD: 0.0634,
        totalValueUSD: 6340.00,
        timestamp: sixDaysAgo,
        txHash: '0xjkl012...',
      },
      {
        id: '7',
        tokenName: 'GROYPER',
        tokenSymbol: 'GROYPER',
        tokenAddress: '0x0000000000000000000000000000000000000002',
        imageUrl: 'https://pbs.twimg.com/profile_images/1851836711245930496/Rd9y0Kmj_400x400.png',
        type: 'buy' as const,
        amount: 50000,
        priceUSD: 0.0689,
        totalValueUSD: 3445.00,
        timestamp: sevenDaysAgo,
        txHash: '0xmno345...',
      },
      {
        id: '8',
        tokenName: 'Ethereum',
        tokenSymbol: 'ETH',
        tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        imageUrl: '/images/ethereum-logo.png',
        type: 'deposit' as const,
        amount: 5.0,
        priceUSD: 2543.00,
        totalValueUSD: 12715.00,
        timestamp: eightDaysAgo,
        txHash: '0xpqr678...',
      },
    ];
  })(),
  joinedDate: new Date('2024-06-15T08:00:00Z'),
  username: 'CryptoTrader',
};

// Utility functions
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCompactCurrency = (num: number): string => {
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return "$" + (num / 1e3).toFixed(2) + "K";
  return USD.format(num);
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(num);
};

const formatPercent = (num: number): string => {
  return (num >= 0 ? '+' : '') + num.toFixed(2) + '%';
};

const shortAddress = (address: string): string => {
  return address.slice(0, 6) + '...' + address.slice(-4);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(date);
};

const getTokenInitials = (symbol: string): string => {
  return symbol.slice(0, 2).toUpperCase();
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

export const UserProfileWidget: React.FC<UserProfileWidgetProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [state, setState] = useState<UserProfileWidgetState>({
    activeTab: 'overview',
    searchQuery: '',
    timeframe: '7d',
    sortBy: 'value',
    sortOrder: 'desc',
  });

  const userData = data || demoUserData;
  const [filteredPositions, setFilteredPositions] = useState<TokenPosition[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TokenTransaction[]>([]);
  const [currentEthPrice, setCurrentEthPrice] = useState<number | null>(null);
  const [transactionsWithHistoricalPrices, setTransactionsWithHistoricalPrices] = useState<TokenTransaction[]>([]);

  // Fetch real-time ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      const result = await PriceService.fetchEthPrice();
      if (result.ethPrice && !result.error) {
        setCurrentEthPrice(result.ethPrice);
      }
    };

    fetchEthPrice();
    // Refresh ETH price every 30 seconds
    const interval = setInterval(fetchEthPrice, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch historical ETH prices for ETH transactions
  useEffect(() => {
    const fetchHistoricalPrices = async () => {
      console.log('[UserProfile] Fetching historical ETH prices...');
      const transactionsClone = [...userData.recentTransactions];
      const updatedTransactions = [...transactionsClone];
      
      // Fetch prices sequentially with delay to avoid rate limiting
      for (let i = 0; i < updatedTransactions.length; i++) {
        const tx = updatedTransactions[i];
        
        // Only fetch historical price for ETH transactions
        if (tx.tokenSymbol === 'ETH') {
          console.log(`[UserProfile] Fetching price for ${tx.timestamp.toISOString()}`);
          
          // Add delay between requests (1 second) to avoid rate limiting
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 1200));
          }
          
          const historicalPrice = await PriceService.fetchHistoricalEthPrice(tx.timestamp);
          console.log(`[UserProfile] Historical price for ${tx.timestamp.toDateString()}: $${historicalPrice}`);
          
          if (historicalPrice) {
            updatedTransactions[i] = {
              ...tx,
              priceUSD: historicalPrice,
              totalValueUSD: tx.amount * historicalPrice,
            };
            // Update state after each successful fetch so user sees progressive updates
            setTransactionsWithHistoricalPrices([...updatedTransactions]);
          }
        }
      }
      
      console.log('[UserProfile] All historical prices fetched');
    };

    if (isOpen) {
      fetchHistoricalPrices();
    }
  }, [isOpen, userData.recentTransactions]);

  // Calculate total balance using real-time ETH price
  const calculateTotalBalance = (): number => {
    const ethPrice = currentEthPrice || userData.walletStats.ethBalanceUSD / userData.walletStats.ethBalance;
    return userData.walletStats.ethBalance * ethPrice;
  };

  // Calculate ETH balance in USD using real-time price
  const calculateEthBalanceUSD = (): number => {
    const ethPrice = currentEthPrice || userData.walletStats.ethBalanceUSD / userData.walletStats.ethBalance;
    return userData.walletStats.ethBalance * ethPrice;
  };

  // Apply filters and sorting
  const applyFiltersAndSort = useCallback(() => {
    // Filter positions
    let positions = [...userData.positions];
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      positions = positions.filter(
        (pos) =>
          pos.tokenName.toLowerCase().includes(query) ||
          pos.tokenSymbol.toLowerCase().includes(query) ||
          pos.tokenAddress.toLowerCase().includes(query)
      );
    }

    // Sort positions
    positions.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (state.sortBy) {
        case 'value':
          aValue = a.valueUSD;
          bValue = b.valueUSD;
          break;
        case 'pnl':
          aValue = a.pnlUSD;
          bValue = b.pnlUSD;
          break;
        default:
          aValue = a.valueUSD;
          bValue = b.valueUSD;
      }

      if (state.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredPositions(positions);

    // Filter transactions - use historical prices if available
    const transactionsToFilter = transactionsWithHistoricalPrices.length > 0 
      ? transactionsWithHistoricalPrices 
      : userData.recentTransactions;
      
    let transactions = [...transactionsToFilter];
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      transactions = transactions.filter(
        (tx) =>
          tx.tokenName.toLowerCase().includes(query) ||
          tx.tokenSymbol.toLowerCase().includes(query) ||
          tx.tokenAddress.toLowerCase().includes(query)
      );
    }

    // Sort by most recent
    transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredTransactions(transactions);
  }, [userData, state.searchQuery, state.sortBy, state.sortOrder, transactionsWithHistoricalPrices]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Event handlers
  const handleTabChange = (tab: TabType) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  const handleTimeframeChange = (timeframe: TimeframeType) => {
    setState((prev) => ({ ...prev, timeframe }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleOverlayClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Render functions
  const renderOverviewTab = () => {
    const stats = userData.walletStats;

    return (
      <div className={styles.overviewContent}>
        {/* Wallet Header */}
        <div className={styles.walletHeader}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              <User size={28} />
            </div>
          </div>
          <div className={styles.walletInfo}>
            <div className={styles.walletName}>
              {userData.username || 'Wallet User'}
            </div>
            <div className={styles.walletAddress}>
              {shortAddress(stats.address)}
              <button
                className={styles.copyBtn}
                onClick={() => copyToClipboard(stats.address)}
                title="Copy address"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className={styles.balanceSection}>
          <div className={styles.balanceCard}>
            <div className={styles.balanceLabel}>Total Balance</div>
            <div className={styles.balanceValue}>
              {formatCompactCurrency(calculateTotalBalance())}
            </div>
          </div>
          <div className={styles.balanceCard}>
            <div className={styles.balanceLabel}>ETH Balance</div>
            <div className={styles.balanceValue}>
              {formatNumber(stats.ethBalance)} ETH
            </div>
            <div className={styles.balanceSubValue}>
              {formatCompactCurrency(calculateEthBalanceUSD())}
            </div>
          </div>
        </div>

        {/* PnL Section */}
        <div className={styles.pnlSection}>
          <div className={styles.sectionTitle}>
            <TrendingUp size={16} />
            Performance
          </div>

          <div className={styles.pnlCards}>
            <div className={styles.pnlCard}>
              <div className={styles.pnlLabel}>Total P&L</div>
              <div className={`${styles.pnlValue} ${stats.totalPnL >= 0 ? styles.positive : styles.negative}`}>
                {formatCompactCurrency(stats.totalPnL)}
              </div>
              <div className={`${styles.pnlPercent} ${stats.totalPnLPercent >= 0 ? styles.positive : styles.negative}`}>
                {formatPercent(stats.totalPnLPercent)}
              </div>
            </div>

            <div className={styles.pnlCard}>
              <div className={styles.pnlLabel}>24h P&L</div>
              <div className={`${styles.pnlValue} ${stats.dailyPnL >= 0 ? styles.positive : styles.negative}`}>
                {formatCompactCurrency(stats.dailyPnL)}
              </div>
              <div className={`${styles.pnlPercent} ${stats.dailyPnLPercent >= 0 ? styles.positive : styles.negative}`}>
                {formatPercent(stats.dailyPnLPercent)}
              </div>
            </div>

            <div className={styles.pnlCard}>
              <div className={styles.pnlLabel}>7d P&L</div>
              <div className={`${styles.pnlValue} ${stats.weeklyPnL >= 0 ? styles.positive : styles.negative}`}>
                {formatCompactCurrency(stats.weeklyPnL)}
              </div>
              <div className={`${styles.pnlPercent} ${stats.weeklyPnLPercent >= 0 ? styles.positive : styles.negative}`}>
                {formatPercent(stats.weeklyPnLPercent)}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsSection}>
          <div className={styles.sectionTitle}>
            <BarChart3 size={16} />
            Trading Stats
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <Activity size={18} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Total Trades</div>
                <div className={styles.statValue}>{stats.totalTrades}</div>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <Target size={18} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Win Rate</div>
                <div className={styles.statValue}>{stats.winRate.toFixed(1)}%</div>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <ArrowUpRight size={18} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Best Trade</div>
                <div className={`${styles.statValue} ${styles.positive}`}>
                  +{USD.format(stats.bestTrade)}
                </div>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <ArrowDownRight size={18} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Worst Trade</div>
                <div className={`${styles.statValue} ${styles.negative}`}>
                  {formatCompactCurrency(stats.worstTrade)}
                </div>
              </div>
            </div>

            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <DollarSign size={18} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Avg Trade Size</div>
                <div className={styles.statValue}>
                  {formatCompactCurrency(stats.avgTradeSize)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPositionsTab = () => {
    if (filteredPositions.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Award size={28} />
          </div>
          <div className={styles.emptyTitle}>No Positions Found</div>
          <div className={styles.emptyMessage}>
            {state.searchQuery
              ? 'No positions match your search criteria.'
              : 'You have no active token positions.'}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.positionsContent}>
        <div className={styles.searchBar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search positions..."
            value={state.searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className={styles.positionsList}>
          {filteredPositions.map((position) => (
            <div key={position.tokenAddress} className={styles.positionCard}>
              <div className={styles.positionHeader}>
                <div className={styles.positionToken}>
                  <div className={styles.tokenAvatar}>
                    {position.imageUrl ? (
                      <img 
                        src={position.imageUrl} 
                        alt={position.tokenName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 'inherit'
                        }}
                      />
                    ) : (
                      getTokenInitials(position.tokenSymbol)
                    )}
                  </div>
                  <div className={styles.tokenInfo}>
                    <div className={styles.tokenName}>{position.tokenName}</div>
                    <div className={styles.tokenSymbol}>{position.tokenSymbol}</div>
                  </div>
                </div>
                <div className={styles.positionValue}>
                  <div className={styles.valueAmount}>
                    {formatCompactCurrency(position.valueUSD)}
                  </div>
                  <div
                    className={`${styles.pnlBadge} ${
                      position.pnlUSD >= 0 ? styles.positive : styles.negative
                    }`}
                  >
                    {position.pnlUSD >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {formatPercent(position.pnlPercent)}
                  </div>
                </div>
              </div>

              <div className={styles.positionDetails}>
                <div className={styles.positionDetail}>
                  <div className={styles.detailLabel}>Amount</div>
                  <div className={styles.detailValue}>{formatNumber(position.amount)}</div>
                </div>
                <div className={styles.positionDetail}>
                  <div className={styles.detailLabel}>Avg Buy</div>
                  <div className={styles.detailValue}>${position.avgBuyPrice.toFixed(4)}</div>
                </div>
                <div className={styles.positionDetail}>
                  <div className={styles.detailLabel}>Current</div>
                  <div className={styles.detailValue}>${position.currentPrice.toFixed(4)}</div>
                </div>
                <div className={styles.positionDetail}>
                  <div className={styles.detailLabel}>P&L</div>
                  <div
                    className={`${styles.detailValue} ${
                      position.pnlUSD >= 0 ? styles.positive : styles.negative
                    }`}
                  >
                    {formatCompactCurrency(position.pnlUSD)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHistoryTab = () => {
    if (filteredTransactions.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Clock size={28} />
          </div>
          <div className={styles.emptyTitle}>No Transactions Found</div>
          <div className={styles.emptyMessage}>
            {state.searchQuery
              ? 'No transactions match your search criteria.'
              : 'You have no transaction history.'}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.historyContent}>
        <div className={styles.searchBar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search transactions..."
            value={state.searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className={styles.transactionsList}>
          {filteredTransactions.map((tx) => (
            <div key={tx.id} className={styles.transactionCard}>
              <div className={styles.transactionHeader}>
                <div className={styles.transactionToken}>
                  <div className={styles.tokenAvatar}>
                    {tx.imageUrl ? (
                      <img 
                        src={tx.imageUrl} 
                        alt={tx.tokenName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: tx.tokenSymbol === 'ETH' ? 'contain' : 'cover',
                          borderRadius: 'inherit',
                          filter: tx.tokenSymbol === 'ETH' ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))' : 'none'
                        }}
                      />
                    ) : (
                      getTokenInitials(tx.tokenSymbol)
                    )}
                  </div>
                  <div className={styles.tokenInfo}>
                    <div className={styles.tokenName}>{tx.tokenName}</div>
                    <div className={styles.tokenSymbol}>{tx.tokenSymbol}</div>
                  </div>
                </div>
                <div
                  className={`${styles.transactionType} ${
                    tx.type === 'buy' ? styles.buy : 
                    tx.type === 'sell' ? styles.sell :
                    tx.type === 'deposit' ? styles.deposit :
                    styles.withdraw
                  }`}
                >
                  {tx.type === 'buy' ? '↓ BUY' : 
                   tx.type === 'sell' ? '↑ SELL' :
                   tx.type === 'deposit' ? '→ DEPOSIT' :
                   '← WITHDRAW'}
                </div>
              </div>

              <div className={styles.transactionDetails}>
                <div className={styles.transactionDetail}>
                  <div className={styles.detailLabel}>Amount</div>
                  <div className={styles.detailValue}>{formatNumber(tx.amount)}</div>
                </div>
                <div className={styles.transactionDetail}>
                  <div className={styles.detailLabel}>Price</div>
                  <div className={styles.detailValue}>${tx.priceUSD.toFixed(tx.tokenSymbol === 'ETH' ? 2 : 4)}</div>
                </div>
                <div className={styles.transactionDetail}>
                  <div className={styles.detailLabel}>Total</div>
                  <div className={styles.detailValue}>
                    {formatCompactCurrency(tx.totalValueUSD)}
                  </div>
                </div>
                <div className={styles.transactionDetail}>
                  <div className={styles.detailLabel}>Time</div>
                  <div className={styles.detailValue}>{formatRelativeTime(tx.timestamp)}</div>
                </div>
              </div>

              <div className={styles.transactionFooter}>
                <button
                  className={styles.txLink}
                  onClick={() => copyToClipboard(tx.txHash)}
                  title="Copy transaction hash"
                >
                  <Copy size={12} />
                  {shortAddress(tx.txHash)}
                </button>
                <button className={styles.explorerBtn} title="View on explorer">
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.root} ${isOpen ? styles.open : ''}`}>
      <div 
        className={styles.overlay} 
        onClick={handleOverlayClick}
      />

      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.icon}>
              <User size={18} />
            </div>
            <div className={styles.titleBlock}>
              <h2 className={styles.title}>User Profile</h2>
              <div className={styles.sub}>Your wallet stats & performance</div>
            </div>
          </div>

          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close user profile widget"
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${state.activeTab === 'overview' ? styles.active : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <Activity size={16} /> Overview
            </button>
            <button
              className={`${styles.tab} ${state.activeTab === 'positions' ? styles.active : ''}`}
              onClick={() => handleTabChange('positions')}
            >
              <Award size={16} /> Positions
            </button>
            <button
              className={`${styles.tab} ${state.activeTab === 'history' ? styles.active : ''}`}
              onClick={() => handleTabChange('history')}
            >
              <Clock size={16} /> History
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {state.activeTab === 'overview' && renderOverviewTab()}
          {state.activeTab === 'positions' && renderPositionsTab()}
          {state.activeTab === 'history' && renderHistoryTab()}
        </div>
      </div>
    </div>
  );
};
