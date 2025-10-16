"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, User, TrendingUp, TrendingDown, Activity, Clock, DollarSign, Award, Target, BarChart3, ArrowUpRight, ArrowDownRight, Copy, ExternalLink } from 'lucide-react';
import styles from './ChartUserProfileWidget.module.css';
import {
  ChartUserProfileWidgetProps,
  ChartUserProfileWidgetState,
  TabType,
  TimeframeType,
  TokenPosition,
  TokenTransaction,
  WalletStats,
  UserProfileData
} from './types';
import { fetchUserPositions, type UserPositionApiItem, fetchUserSummary, type UserSummaryApiResponse } from '@/app/lib/api/services/userService';
import { useWallet } from '@/app/hooks/useWallet';
import { useTrading } from '@/app/hooks/useTrading';
import WalletTopUpModal from '@/app/components/Modals/WalletTopUpModal/WalletTopUpModal';
import WalletWithdrawModal from '@/app/components/Modals/WalletWithdrawModal/WalletWithdrawModal';
import { resolveTradingWallet } from '@/app/lib/user/tradingWalletCache';
import { getCurrentChainId } from '@/app/lib/config/constants';

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
      tokenAddress: '0xA3bC4D5E6f78901234567890aBCDeF1234567890',
      tokenName: 'Amber Launch',
      tokenSymbol: 'AMBR',
      amount: 50000,
      avgBuyPrice: 0.0567,
      currentPrice: 0.0789,
      valueUSD: 3945.00,
      pnlUSD: 1110.00,
      pnlPercent: 39.15,
    },
    {
      tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
      tokenName: 'SteakCoin',
      tokenSymbol: 'STEAK',
      amount: 125000,
      avgBuyPrice: 0.0234,
      currentPrice: 0.0189,
      valueUSD: 2362.50,
      pnlUSD: -562.50,
      pnlPercent: -19.23,
    },
    {
      tokenAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      tokenName: 'MoonShot',
      tokenSymbol: 'MOON',
      amount: 100000,
      avgBuyPrice: 0.0089,
      currentPrice: 0.0156,
      valueUSD: 1560.00,
      pnlUSD: 670.00,
      pnlPercent: 75.28,
    },
  ],
  recentTransactions: [
    {
      id: '1',
      tokenName: 'Amber Launch',
      tokenSymbol: 'AMBR',
      tokenAddress: '0xA3bC4D5E6f78901234567890aBCDeF1234567890',
      type: 'buy',
      amount: 25000,
      priceUSD: 0.0567,
      totalValueUSD: 1417.50,
      timestamp: new Date('2025-10-05T14:30:00Z'),
      txHash: '0xabc123...',
    },
    {
      id: '2',
      tokenName: 'Ethereum',
      tokenSymbol: 'ETH',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      type: 'deposit',
      amount: 2.5,
      priceUSD: 2300.00,
      totalValueUSD: 5750.00,
      timestamp: new Date('2025-10-04T16:20:00Z'),
      txHash: '0xdep789...',
    },
    {
      id: '3',
      tokenName: 'SteakCoin',
      tokenSymbol: 'STEAK',
      tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
      type: 'sell',
      amount: 50000,
      priceUSD: 0.0245,
      totalValueUSD: 1225.00,
      timestamp: new Date('2025-10-04T09:15:00Z'),
      txHash: '0xdef456...',
    },
    {
      id: '4',
      tokenName: 'MoonShot',
      tokenSymbol: 'MOON',
      tokenAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      type: 'buy',
      amount: 100000,
      priceUSD: 0.0089,
      totalValueUSD: 890.00,
      timestamp: new Date('2025-10-03T16:45:00Z'),
      txHash: '0x789ghi...',
    },
    {
      id: '5',
      tokenName: 'USDC',
      tokenSymbol: 'USDC',
      tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      type: 'withdraw',
      amount: 1500,
      priceUSD: 1.00,
      totalValueUSD: 1500.00,
      timestamp: new Date('2025-10-02T13:30:00Z'),
      txHash: '0xwit345...',
    },
    {
      id: '6',
      tokenName: 'Amber Launch',
      tokenSymbol: 'AMBR',
      tokenAddress: '0xA3bC4D5E6f78901234567890aBCDeF1234567890',
      type: 'buy',
      amount: 25000,
      priceUSD: 0.0567,
      totalValueUSD: 1417.50,
      timestamp: new Date('2025-10-02T11:20:00Z'),
      txHash: '0xjkl012...',
    },
  ],
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

export const ChartUserProfileWidget: React.FC<ChartUserProfileWidgetProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [state, setState] = useState<ChartUserProfileWidgetState>({
    activeTab: 'overview',
    searchQuery: '',
    timeframe: '7d',
    sortBy: 'value',
    sortOrder: 'desc',
  });

  const userData = data;
  const { address: eoa, chainId: walletChainId } = useWallet();
  const { tradingState, topUpTradingWallet } = useTrading();
  const [positions, setPositions] = useState<TokenPosition[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<TokenPosition[]>([]);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TokenTransaction[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState<boolean>(false);
  const [positionsError, setPositionsError] = useState<string | null>(null);

  // Overview stats (loaded from summary API)
  const initialStats: WalletStats = {
    address: eoa || '',
    totalBalanceUSD: 0,
    ethBalance: 0,
    ethBalanceUSD: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    dailyPnL: 0,
    dailyPnLPercent: 0,
    weeklyPnL: 0,
    weeklyPnLPercent: 0,
    totalTrades: 0,
    winRate: 0,
    bestTrade: 0,
    worstTrade: 0,
    avgTradeSize: 0,
  };
  const [stats, setStats] = useState<WalletStats>(initialStats);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoaded, setSummaryLoaded] = useState<boolean>(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState<boolean>(false);
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');

  // Apply filters and sorting
  const applyFiltersAndSort = useCallback(() => {
    // Filter positions
    let posList = [...positions];
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      posList = posList.filter(
        (pos) =>
          pos.tokenName.toLowerCase().includes(query) ||
          pos.tokenSymbol.toLowerCase().includes(query) ||
          pos.tokenAddress.toLowerCase().includes(query)
      );
    }

    // Sort positions
    posList.sort((a, b) => {
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

    setFilteredPositions(posList);

    // Filter transactions (from state; no demo fallback)
    let txs = [...transactions];
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      txs = txs.filter(
        (tx) =>
          tx.tokenName.toLowerCase().includes(query) ||
          tx.tokenSymbol.toLowerCase().includes(query) ||
          tx.tokenAddress.toLowerCase().includes(query)
      );
    }

    // Sort by most recent
    txs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredTransactions(txs);
  }, [positions, transactions, state.searchQuery, state.sortBy, state.sortOrder]);

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

  // Fetch overview stats when the Overview tab is active
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    async function loadSummary() {
      try {
        if (!isOpen || state.activeTab !== 'overview') return;
        const baseEoa = eoa || userData?.walletStats?.address;
        if (!baseEoa) return;
        const chainId = walletChainId || getCurrentChainId();
        setIsLoadingSummary(true);
        setSummaryError(null);
        const tradingWallet = await resolveTradingWallet(baseEoa, chainId);
        if (cancelled) return;
        const summary: UserSummaryApiResponse = await fetchUserSummary(tradingWallet);
        if (cancelled) return;
        setStats(prev => ({
          ...prev,
          address: tradingWallet,
          totalPnL: summary?.performance?.totalPnlUsd ?? prev.totalPnL,
          // Percentages not provided by API; set to 0 to avoid misleading values
          totalPnLPercent: 0,
          dailyPnL: summary?.performance?.pnl24hUsd ?? prev.dailyPnL,
          dailyPnLPercent: 0,
          weeklyPnL: summary?.performance?.pnl7dUsd ?? prev.weeklyPnL,
          weeklyPnLPercent: 0,
          totalTrades: summary?.tradingStats?.totalTrades ?? prev.totalTrades,
          winRate: summary?.tradingStats?.winRate !== undefined ? summary.tradingStats.winRate * 100 : prev.winRate,
          bestTrade: summary?.tradingStats?.bestTradeUsd ?? prev.bestTrade,
          worstTrade: summary?.tradingStats?.worstTradeUsd ?? prev.worstTrade,
          avgTradeSize: summary?.tradingStats?.avgTradeSizeUsd ?? prev.avgTradeSize,
        }));
        setSummaryLoaded(true);
      } catch (err: any) {
        setSummaryError(err?.message || 'Failed to load user summary');
      } finally {
        if (!cancelled) setIsLoadingSummary(false);
      }
    }
    loadSummary();
    return () => { cancelled = true; controller.abort(); };
  }, [isOpen, state.activeTab, eoa, walletChainId, userData?.walletStats?.address]);

  // Fetch positions when the Positions tab is active
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    async function loadPositions() {
      try {
        // Only fetch when the widget is open and Positions tab is active
        if (!isOpen || state.activeTab !== 'positions') return;
        // Prefer connected EOA; fallback to provided data's wallet address if needed
        const baseEoa = eoa || userData?.walletStats?.address;
        if (!baseEoa) return;
        const chainId = walletChainId || getCurrentChainId();
        setIsLoadingPositions(true);
        setPositionsError(null);
        // Resolve trading wallet with cache (cache-first)
        const tradingWallet = await resolveTradingWallet(baseEoa, chainId);
        if (cancelled) return;
        const apiItems = await fetchUserPositions(tradingWallet);
        if (cancelled) return;
        // Map API response to UI TokenPosition structure
        const mapped: TokenPosition[] = (apiItems || []).map((it: UserPositionApiItem) => {
          const addr = it.token;
          const safeCostBasis = typeof it.costBasisUsd === 'number' ? it.costBasisUsd : 0;
          const safeMarketValue = typeof it.marketValueUsd === 'number' ? it.marketValueUsd : 0;
          const pnlUsd = (it.openPnlUsd || 0) + (it.realizedPnlUsd || 0);
          const pnlPercent = safeCostBasis > 0 ? ((safeMarketValue - safeCostBasis) / safeCostBasis) * 100 : 0;
          const symbol = addr?.startsWith('0x') && addr.length >= 6 ? addr.slice(2, 6).toUpperCase() : 'TOKEN';
          const name = `Token ${shortAddress(addr)}`;
          return {
            tokenAddress: addr,
            tokenName: name,
            tokenSymbol: symbol,
            amount: it.qtyTokens || 0,
            avgBuyPrice: it.avgCostUsd || 0,
            currentPrice: it.lastPriceUsd || 0,
            valueUSD: it.marketValueUsd || 0,
            pnlUSD: pnlUsd,
            pnlPercent,
          } as TokenPosition;
        });
        setPositions(mapped);
      } catch (err: any) {
        setPositionsError(err?.message || 'Failed to load positions');
      } finally {
        if (!cancelled) setIsLoadingPositions(false);
      }
    }

    loadPositions();
    return () => { cancelled = true; controller.abort(); };
  }, [isOpen, state.activeTab, eoa, walletChainId, userData?.walletStats?.address]);

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
    const currentStats = stats;

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
              {userData?.username || (stats.address ? shortAddress(stats.address) : 'Wallet User')}
            </div>
            <div className={styles.walletAddress}>
              {shortAddress(currentStats.address)}
              <button
                className={styles.copyBtn}
                onClick={() => copyToClipboard(currentStats.address)}
                title="Copy address"
              >
                <Copy size={12} />
              </button>
            </div>
            {/* Action Buttons: Deposit & Withdraw */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={() => setIsTopUpModalOpen(true)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(180deg, #d4af37, #b8941f 60%, #a0821a)',
                  color: '#1f2937',
                  fontWeight: 800,
                  fontSize: 'clamp(10px, 2vw, 13px)',
                  padding: 'clamp(8px, 1.5vh, 10px)',
                  borderRadius: 'clamp(10px, 2vw, 14px)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 3px 6px rgba(0, 0, 0, 0.1)',
                  textShadow: '0 1px 0 rgba(255, 255, 255, 0.3)',
                  letterSpacing: '0.4px',
                  minHeight: 'clamp(28px, 4.5vh, 34px)'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'translateY(-1px)';
                  target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 6px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                DEPOSIT
              </button>
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                style={{
                  flex: 1,
                  background: 'linear-gradient(180deg, #f87171, #ef4444)',
                  color: '#1f2937',
                  fontWeight: 800,
                  fontSize: 'clamp(10px, 2vw, 13px)',
                  padding: 'clamp(8px, 1.5vh, 10px)',
                  borderRadius: 'clamp(10px, 2vw, 14px)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 3px 6px rgba(0, 0, 0, 0.1)',
                  textShadow: '0 1px 0 rgba(255, 255, 255, 0.3)',
                  letterSpacing: '0.4px',
                  minHeight: 'clamp(28px, 4.5vh, 34px)'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'translateY(-1px)';
                  target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 6px 12px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)';
                }}
              >
                WITHDRAW
              </button>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className={styles.balanceSection}>
          <div className={styles.balanceCard}>
            <div className={styles.balanceLabel}>Total Balance</div>
            <div className={styles.balanceValue}>
              {formatCompactCurrency(currentStats.totalBalanceUSD)}
            </div>
          </div>
          <div className={styles.balanceCard}>
            <div className={styles.balanceLabel}>ETH Balance</div>
            <div className={styles.balanceValue}>
              {formatNumber(currentStats.ethBalance)} ETH
            </div>
            <div className={styles.balanceSubValue}>
              {formatCompactCurrency(currentStats.ethBalanceUSD)}
            </div>
          </div>
        </div>

        {/* PnL Section */}
        <div className={styles.pnlSection}>
          <div className={styles.sectionTitle}>
            <TrendingUp size={16} />
            Performance
          </div>

          {isLoadingSummary ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><Activity size={28} /></div>
              <div className={styles.emptyTitle}>Loading Performance…</div>
            </div>
          ) : summaryError ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><TrendingDown size={28} /></div>
              <div className={styles.emptyTitle}>Failed to Load Performance</div>
              <div className={styles.emptyMessage}>{summaryError}</div>
            </div>
          ) : !summaryLoaded ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><Clock size={28} /></div>
              <div className={styles.emptyTitle}>No Performance Data</div>
              <div className={styles.emptyMessage}>Connect and trade to see your stats.</div>
            </div>
          ) : (
            <div className={styles.pnlCards}>
              <div className={styles.pnlCard}>
                <div className={styles.pnlLabel}>Total P&L</div>
                <div className={`${styles.pnlValue} ${currentStats.totalPnL >= 0 ? styles.positive : styles.negative}`}>
                  {formatCompactCurrency(currentStats.totalPnL)}
                </div>
                <div className={`${styles.pnlPercent} ${currentStats.totalPnLPercent >= 0 ? styles.positive : styles.negative}`}>
                  {formatPercent(currentStats.totalPnLPercent)}
                </div>
              </div>

              <div className={styles.pnlCard}>
                <div className={styles.pnlLabel}>24h P&L</div>
                <div className={`${styles.pnlValue} ${currentStats.dailyPnL >= 0 ? styles.positive : styles.negative}`}>
                  {formatCompactCurrency(currentStats.dailyPnL)}
                </div>
                <div className={`${styles.pnlPercent} ${currentStats.dailyPnLPercent >= 0 ? styles.positive : styles.negative}`}>
                  {formatPercent(currentStats.dailyPnLPercent)}
                </div>
              </div>

              <div className={styles.pnlCard}>
                <div className={styles.pnlLabel}>7d P&L</div>
                <div className={`${styles.pnlValue} ${currentStats.weeklyPnL >= 0 ? styles.positive : styles.negative}`}>
                  {formatCompactCurrency(currentStats.weeklyPnL)}
                </div>
                <div className={`${styles.pnlPercent} ${currentStats.weeklyPnLPercent >= 0 ? styles.positive : styles.negative}`}>
                  {formatPercent(currentStats.weeklyPnLPercent)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className={styles.statsSection}>
          <div className={styles.sectionTitle}>
            <BarChart3 size={16} />
            Trading Stats
          </div>

          {isLoadingSummary ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><Activity size={28} /></div>
              <div className={styles.emptyTitle}>Loading Trading Stats…</div>
            </div>
          ) : summaryError ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><TrendingDown size={28} /></div>
              <div className={styles.emptyTitle}>Failed to Load Stats</div>
              <div className={styles.emptyMessage}>{summaryError}</div>
            </div>
          ) : !summaryLoaded ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><Clock size={28} /></div>
              <div className={styles.emptyTitle}>No Trading Stats</div>
            </div>
          ) : (
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statIcon}>
                  <Activity size={18} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Total Trades</div>
                  <div className={styles.statValue}>{currentStats.totalTrades}</div>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIcon}>
                  <Target size={18} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Win Rate</div>
                  <div className={styles.statValue}>{currentStats.winRate.toFixed(1)}%</div>
                </div>
              </div>

              <div className={styles.statItem}>
                <div className={styles.statIcon}>
                  <ArrowUpRight size={18} />
                </div>
                <div className={styles.statContent}>
                  <div className={styles.statLabel}>Best Trade</div>
                  <div className={`${styles.statValue} ${styles.positive}`}>
                    +{USD.format(currentStats.bestTrade)}
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
                    {formatCompactCurrency(currentStats.worstTrade)}
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
                    {formatCompactCurrency(currentStats.avgTradeSize)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPositionsTab = () => {
    if (isLoadingPositions) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Activity size={28} />
          </div>
          <div className={styles.emptyTitle}>Loading Positions…</div>
          <div className={styles.emptyMessage}>Fetching your latest positions.</div>
        </div>
      );
    }

    if (positionsError) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <TrendingDown size={28} />
          </div>
          <div className={styles.emptyTitle}>Failed to Load Positions</div>
          <div className={styles.emptyMessage}>{positionsError}</div>
        </div>
      );
    }

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
                    {getTokenInitials(position.tokenSymbol)}
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
                    {getTokenInitials(tx.tokenSymbol)}
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
                  <div className={styles.detailValue}>${tx.priceUSD.toFixed(4)}</div>
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

        {/* Wallet & Top-Up Modal */}
        <WalletTopUpModal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          tradingWallet={tradingState?.tradingWallet || (stats.address || null)}
          defaultAmountEth={topUpAmount}
          onConfirmTopUp={async (amt) => topUpTradingWallet(amt)}
        />
        <WalletWithdrawModal
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          defaultAmountEth={withdrawAmount}
        />
      </div>
    </div>
  );
};
