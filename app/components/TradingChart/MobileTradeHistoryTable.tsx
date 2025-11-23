"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Trade, FullTokenDataResponse } from '@/app/types/token';
import { useLimitOrders } from '@/app/hooks/useLimitOrders';
import { useWallet } from '@/app/hooks/useWallet';

// Custom SVG Arrow Icons
const BuyArrow = ({ size = 12 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 17L17 7M17 7H9M17 7V15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const SellArrow = ({ size = 12 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 7L7 17M7 17H15M7 17V9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

interface MobileTradeHistoryTableProps {
  tokenAddress?: string;
  tokenData?: FullTokenDataResponse | null;
  trades?: Trade[];
  isLoading?: boolean;
  error?: string | null;
  transparent?: boolean;
  hideTabs?: boolean;
  disableScroll?: boolean;
}

type TabType = 'history' | 'positions' | 'topTraders' | 'pricemc';

const ITEMS_PER_PAGE = 10;

export const MobileTradeHistoryTable: React.FC<MobileTradeHistoryTableProps> = ({
  tokenAddress,
  tokenData,
  trades: liveTrades,
  isLoading = false,
  error = null,
  transparent = false,
  hideTabs = false,
  disableScroll = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const { address: walletAddress, isConnected } = useWallet();

  // Pagination state for each tab
  const [currentPage, setCurrentPage] = useState<Record<TabType, number>>({
    history: 1,
    positions: 1,
    topTraders: 1,
    pricemc: 1,
  });

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(prev => ({
      ...prev,
      [activeTab]: 1
    }));
  }, [activeTab]);

  // Fetch limit orders (positions)
  const {
    data: limitOrders,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useLimitOrders({
    wallet: walletAddress,
    tokenAddress: tokenAddress,
    pollIntervalMs: 10000 // Poll every 10 seconds
  });

  // Helper formatters
  const formatNumber = (value: number): string => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
    return value.toFixed(6);
  };

  const formatUSD = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value.toString().replace('$', '')) : value;
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  const getRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = Math.max(0, now - timestamp);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatDate = (timestamp: number | string): string => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  };

  const shortenAddress = (addr: string): string => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Handle both 'recentTrades' and 'trades' field names
  const apiTrades = (tokenData as any)?.recentTrades || (tokenData as any)?.trades || [];
  const trades: Trade[] = (liveTrades && liveTrades.length ? liveTrades : apiTrades);
  const symbol = tokenData?.tokenInfo?.symbol ?? '';

  // Calculate top traders from trades
  const topTraders = useMemo(() => {
    const traderStats = new Map<string, {
      address: string;
      totalVolume: number;
      trades: number;
      buys: number;
      sells: number;
      profit: number;
    }>();

    trades.forEach(trade => {
      const addr = trade.trader;
      if (!addr) return;

      const existing = traderStats.get(addr) || {
        address: addr,
        totalVolume: 0,
        trades: 0,
        buys: 0,
        sells: 0,
        profit: 0
      };

      const volume = typeof trade.usdValue === 'number' ? trade.usdValue : parseFloat(String(trade.usdValue).replace('$', ''));

      existing.totalVolume += volume;
      existing.trades += 1;

      if (trade.type === 'BUY') {
        existing.buys += 1;
        existing.profit -= volume; // Cost
      } else {
        existing.sells += 1;
        existing.profit += volume; // Revenue
      }

      traderStats.set(addr, existing);
    });

    return Array.from(traderStats.values())
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 50);
  }, [trades]);

  // Calculate price and market cap stats
  const priceStats = useMemo(() => {
    const currentPrice = tokenData?.price || 0;
    const currentMC = tokenData?.marketCap || 0;

    // Calculate 24h change from trades
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const tradesLast24h = trades.filter(t => t.timestamp >= oneDayAgo);

    let priceChange24h = 0;
    if (tradesLast24h.length > 0) {
      const oldestTrade = tradesLast24h[tradesLast24h.length - 1];
      const oldPrice = oldestTrade.price;
      if (oldPrice > 0) {
        priceChange24h = ((currentPrice - oldPrice) / oldPrice) * 100;
      }
    }

    return {
      currentPrice,
      currentMC,
      priceChange24h,
      volume24h: tokenData?.volume24h || 0,
      trades24h: tradesLast24h.length
    };
  }, [trades, tokenData]);

  // Tab buttons configuration
  const tabs: { id: TabType; label: string; badge?: string }[] = [
    { id: 'history', label: 'Trade History', badge: trades.length > 0 ? `${trades.length}` : undefined },
    { id: 'positions', label: 'My positions', badge: isConnected && limitOrders.length > 0 ? `${limitOrders.length}` : undefined },
    { id: 'topTraders', label: 'Top Traders', badge: topTraders.length > 0 ? `${topTraders.length}` : undefined },
    { id: 'pricemc', label: 'Price / MC' },
  ];

  // Pagination helper component
  const Pagination = ({
    currentPage,
    totalItems,
    onPageChange
  }: {
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  }) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    if (totalPages <= 1) return null;

    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(6px, 2vw, 8px)',
        padding: 'clamp(10px, 3vw, 12px)',
        borderTop: '1px solid rgba(255, 215, 165, 0.2)'
      }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: 'clamp(5px, 1.5vw, 6px) clamp(10px, 3vw, 12px)',
            fontSize: 'clamp(9px, 2.8vw, 11px)',
            fontWeight: 700,
            color: currentPage === 1 ? '#666' : '#feea88',
            background: currentPage === 1
              ? 'rgba(87, 37, 1, 0.1)'
              : 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))',
            border: '1px solid rgba(255, 215, 165, 0.3)',
            borderRadius: '6px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1
          }}
        >
          {'<'}
        </button>

        <div style={{
          fontSize: 'clamp(9px, 2.8vw, 11px)',
          fontWeight: 700,
          color: '#feea88',
          padding: '0 clamp(6px, 2vw, 8px)'
        }}>
          Page {currentPage} of {totalPages}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: 'clamp(5px, 1.5vw, 6px) clamp(10px, 3vw, 12px)',
            fontSize: 'clamp(9px, 2.8vw, 11px)',
            fontWeight: 700,
            color: currentPage === totalPages ? '#666' : '#feea88',
            background: currentPage === totalPages
              ? 'rgba(87, 37, 1, 0.1)'
              : 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))',
            border: '1px solid rgba(255, 215, 165, 0.3)',
            borderRadius: '6px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1
          }}
        >
          {'>'}
        </button>
      </div>
    );
  };

  return (
    <div style={{
      width: '100%',
      height: disableScroll ? 'auto' : '100%',
      display: 'flex',
      flexDirection: 'column',
      background: transparent ? 'transparent' : '#07040b',
      borderRadius: transparent ? '0' : '12px',
      overflow: disableScroll ? 'visible' : 'hidden'
    }}>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(87, 37, 1, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #feea88, #feea88);
          border-radius: 4px;
          border: 1px solid rgba(255, 215, 165, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #f2c071, #f2c071);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #feea88 rgba(87, 37, 1, 0.2);
        }
        .table-container {
          overflow-x: auto;
          overflow-y: visible;
        }
      `}</style>
      {/* Tab Navigation */}
      {!hideTabs && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
          gap: 'clamp(3px, 1vw, 4px)',
          padding: 'clamp(6px, 2vw, 8px)',
          background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.4), rgba(87, 37, 1, 0.3))',
          borderBottom: '1px solid rgba(255, 215, 165, 0.25)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                position: 'relative',
                padding: 'clamp(4px, 1.5vw, 6px) clamp(4px, 2vw, 8px)',
                fontSize: 'clamp(8px, 2.2vw, 10px)',
                fontWeight: 800,
                color: activeTab === tab.id ? '#1f2937' : '#feea88',
                background: activeTab === tab.id
                  ? 'linear-gradient(180deg, #feea88, #feea88)'
                  : 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))',
                border: '1px solid',
                borderColor: activeTab === tab.id ? '#feea88' : 'rgba(255, 215, 165, 0.3)',
                borderRadius: 'clamp(6px, 2vw, 8px)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                boxShadow: activeTab === tab.id
                  ? 'inset 0 2px 0 rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)'
                  : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'clamp(2px, 1vw, 4px)',
                minWidth: 0,
                textAlign: 'center'
              }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  padding: 'clamp(1px, 0.5vw, 2px) clamp(4px, 1.5vw, 6px)',
                  fontSize: 'clamp(7px, 2vw, 9px)',
                  fontWeight: 700,
                  borderRadius: 'clamp(8px, 2.5vw, 10px)',
                  background: activeTab === tab.id ? '#1f2937' : '#feea88',
                  color: activeTab === tab.id ? '#feea88' : '#1f2937',
                  flexShrink: 0
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <div style={{
        flex: disableScroll ? 'none' : 1,
        overflow: disableScroll ? 'visible' : 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Trade History Tab */}
        {activeTab === 'history' && (
          <div style={{ flex: disableScroll ? 'none' : 1, overflow: disableScroll ? 'visible' : 'hidden', display: 'flex', flexDirection: 'column' }}>
            {isLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#feea88' }}>
                Loading trades...
              </div>
            ) : error ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#ff5b58' }}>
                {error}
              </div>
            ) : trades.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#feea88' }}>
                No trades yet
              </div>
            ) : (
              <>
                <div className={disableScroll ? "" : "custom-scrollbar"} style={{
                  flex: disableScroll ? 'none' : 1,
                  overflowY: disableScroll ? 'visible' : 'auto',
                  overflowX: 'hidden',
                  padding: 'clamp(6px, 2vw, 8px)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Table Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1.2fr 1fr 1.2fr',
                      gap: 'clamp(4px, 1.5vw, 6px)',
                      padding: 'clamp(6px, 2vw, 8px)',
                      background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.3), rgba(87, 37, 1, 0.2))',
                      border: '2px solid rgba(255, 215, 165, 0.4)',
                      borderRadius: 'clamp(6px, 2vw, 8px)',
                      marginBottom: 'clamp(6px, 2vw, 8px)',
                      fontSize: 'clamp(8px, 2.2vw, 10px)',
                      fontWeight: 800,
                      color: '#feea88',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      width: '100%'
                    }}>
                      <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>Date</div>
                      <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>Type</div>
                      <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>Price</div>
                      <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>Total</div>
                      <div style={{ wordBreak: 'break-word', overflowWrap: 'break-word', fontSize: 'clamp(7px, 2vw, 9px)' }}>Price ${tokenData?.tokenInfo?.symbol || 'Token'}</div>
                    </div>

                    {/* Trade Rows - Paginated */}
                    {trades
                      .slice(
                        (currentPage.history - 1) * ITEMS_PER_PAGE,
                        currentPage.history * ITEMS_PER_PAGE
                      )
                      .map((trade, idx) => {
                        const isBuy = trade.type === 'BUY';
                        const tradeId = `trade-${(currentPage.history - 1) * ITEMS_PER_PAGE + idx}`;

                        return (
                          <div
                            key={tradeId}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr 1.2fr 1fr 1.2fr',
                              gap: 'clamp(4px, 1.5vw, 6px)',
                              padding: 'clamp(8px, 2.5vw, 10px) clamp(6px, 2vw, 8px)',
                              background: 'rgba(87, 37, 1, 0.6)',
                              border: '2px solid rgba(255, 215, 165, 0.4)',
                              borderRadius: 'clamp(6px, 2vw, 8px)',
                              marginBottom: 'clamp(5px, 1.5vw, 6px)',
                              fontSize: 'clamp(9px, 2.8vw, 11px)',
                              alignItems: 'center',
                              width: '100%'
                            }}>
                            {/* Date */}
                            <div style={{
                              color: '#fff7ea',
                              fontSize: 'clamp(8px, 2.2vw, 10px)',
                              fontWeight: 600,
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                              lineHeight: '1.2'
                            }}>
                              {formatDate(trade.timestamp)}
                            </div>

                            {/* Type */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'clamp(2px, 1vw, 3px)',
                              flexWrap: 'nowrap'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 'clamp(16px, 4.5vw, 20px)',
                                height: 'clamp(16px, 4.5vw, 20px)',
                                borderRadius: 'clamp(4px, 1.5vw, 6px)',
                                background: isBuy
                                  ? 'linear-gradient(180deg, #4ade80, #22c55e)'
                                  : 'linear-gradient(180deg, #ff7a6f, #ff5b58)',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                flexShrink: 0
                              }}>
                                {isBuy ? <BuyArrow size={8} /> : <SellArrow size={8} />}
                              </div>
                              <span style={{
                                fontWeight: 800,
                                color: isBuy ? '#4ade80' : '#ff7a6f',
                                fontSize: 'clamp(8px, 2.2vw, 10px)',
                                whiteSpace: 'nowrap'
                              }}>
                                {isBuy ? 'buy' : 'sell'}
                              </span>
                            </div>

                            {/* Price (ETH amount) */}
                            <div style={{
                              color: '#fff7ea',
                              fontWeight: 700,
                              fontSize: 'clamp(8px, 2.5vw, 10px)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'clamp(2px, 1vw, 3px)',
                              flexWrap: 'nowrap',
                              wordBreak: 'break-all',
                              lineHeight: '1.2'
                            }}>
                              <img
                                src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
                                alt="ETH"
                                style={{ width: 'clamp(10px, 2.8vw, 12px)', height: 'clamp(10px, 2.8vw, 12px)', flexShrink: 0 }}
                              />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatNumber(trade.amountEth)}</span>
                            </div>

                            {/* Total (USD) */}
                            <div style={{
                              color: '#feea88',
                              fontWeight: 800,
                              fontSize: 'clamp(8px, 2.5vw, 10px)',
                              wordBreak: 'break-all',
                              overflowWrap: 'break-word',
                              lineHeight: '1.2'
                            }}>
                              {formatUSD(trade.usdValue)}
                            </div>

                            {/* Token Price */}
                            <div style={{
                              color: '#fff7ea',
                              fontWeight: 700,
                              fontSize: 'clamp(7px, 2.2vw, 9px)',
                              wordBreak: 'break-all',
                              overflowWrap: 'break-word',
                              lineHeight: '1.2'
                            }}>
                              {formatNumber(trade.price)}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <Pagination
                  currentPage={currentPage.history}
                  totalItems={trades.length}
                  onPageChange={(page) => setCurrentPage(prev => ({ ...prev, history: page }))}
                />
              </>
            )}
          </div>
        )}

        {/* My Positions Tab */}
        {activeTab === 'positions' && (
          <div style={{ flex: disableScroll ? 'none' : 1, overflow: disableScroll ? 'visible' : 'hidden', display: 'flex', flexDirection: 'column' }}>
            {!isConnected ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#feea88',
                fontSize: '12px'
              }}>
                Connect your wallet to view your positions
              </div>
            ) : ordersLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#feea88' }}>
                Loading positions...
              </div>
            ) : ordersError ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#ff5b58', fontSize: '11px' }}>
                {ordersError}
              </div>
            ) : limitOrders.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#feea88', fontSize: '12px' }}>
                No open positions
              </div>
            ) : (
              <>
                <div className={disableScroll ? "" : "custom-scrollbar"} style={{
                  flex: disableScroll ? 'none' : 1,
                  overflowY: disableScroll ? 'visible' : 'auto',
                  overflowX: 'hidden',
                  padding: 'clamp(6px, 2vw, 8px)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Orders Table Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(55px, 1fr) minmax(70px, 1.2fr) minmax(80px, 1.2fr) minmax(80px, 1.2fr) minmax(65px, 1fr)',
                      gap: 'clamp(4px, 2vw, 8px)',
                      padding: 'clamp(6px, 2vw, 8px)',
                      background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.3), rgba(87, 37, 1, 0.2))',
                      border: '2px solid rgba(255, 215, 165, 0.4)',
                      borderRadius: 'clamp(6px, 2vw, 8px)',
                      marginBottom: 'clamp(6px, 2vw, 8px)',
                      fontSize: 'clamp(8px, 2.5vw, 10px)',
                      fontWeight: 800,
                      color: '#feea88',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}>
                      <div>Side</div>
                      <div>Price</div>
                      <div>Amount</div>
                      <div>Remaining</div>
                      <div>Status</div>
                    </div>

                    {/* Order Rows - Paginated */}
                    {limitOrders
                      .slice(
                        (currentPage.positions - 1) * ITEMS_PER_PAGE,
                        currentPage.positions * ITEMS_PER_PAGE
                      )
                      .map((order) => {
                        const isBuy = order.side === 'buy';
                        const statusColor =
                          order.status === 'filled' ? '#4ade80' :
                            order.status === 'cancelled' ? '#ff5b58' :
                              order.status === 'failed' ? '#ef4444' :
                                '#feea88';

                        return (
                          <div
                            key={order.id}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '60px 80px 90px 90px 70px',
                              minWidth: '390px',
                              gap: '8px',
                              padding: '10px 8px',
                              background: 'rgba(87, 37, 1, 0.6)',
                              border: '2px solid rgba(255, 215, 165, 0.4)',
                              borderRadius: '8px',
                              marginBottom: '6px',
                              fontSize: '11px',
                              alignItems: 'center'
                            }}
                          >
                            {/* Side */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '18px',
                                height: '18px',
                                borderRadius: '6px',
                                background: isBuy
                                  ? 'linear-gradient(180deg, #4ade80, #22c55e)'
                                  : 'linear-gradient(180deg, #ff7a6f, #ff5b58)',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                              }}>
                                {isBuy ? <BuyArrow size={9} /> : <SellArrow size={9} />}
                              </div>
                              <span style={{
                                fontWeight: 800,
                                color: isBuy ? '#4ade80' : '#ff7a6f',
                                fontSize: '9px',
                                textTransform: 'uppercase'
                              }}>
                                {order.side}
                              </span>
                            </div>

                            {/* Price */}
                            <div style={{ color: '#feea88', fontWeight: 700, fontSize: '10px' }}>
                              ${order.price.toFixed(4)}
                            </div>

                            {/* Amount */}
                            <div style={{ color: '#fff7ea', fontWeight: 600, fontSize: '10px' }}>
                              {formatNumber(order.amount)}
                            </div>

                            {/* Remaining */}
                            <div style={{ color: '#fff7ea', fontWeight: 600, fontSize: '10px' }}>
                              {formatNumber(order.remaining)}
                            </div>

                            {/* Status */}
                            <div style={{
                              color: statusColor,
                              fontWeight: 800,
                              fontSize: '9px',
                              textTransform: 'uppercase'
                            }}>
                              {order.status}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <Pagination
                  currentPage={currentPage.positions}
                  totalItems={limitOrders.length}
                  onPageChange={(page) => setCurrentPage(prev => ({ ...prev, positions: page }))}
                />
              </>
            )}
          </div>
        )}

        {/* Top Traders Tab */}
        {activeTab === 'topTraders' && (
          <div style={{ flex: disableScroll ? 'none' : 1, overflow: disableScroll ? 'visible' : 'hidden', display: 'flex', flexDirection: 'column' }}>
            {topTraders.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#feea88', fontSize: '12px' }}>
                No trader data available
              </div>
            ) : (
              <>
                <div className={disableScroll ? "" : "custom-scrollbar"} style={{
                  flex: disableScroll ? 'none' : 1,
                  overflowY: disableScroll ? 'visible' : 'auto',
                  overflowX: 'hidden',
                  padding: 'clamp(6px, 2vw, 8px)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Traders Table Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '0.6fr 2fr 1.2fr 1fr 1.2fr',
                      gap: 'clamp(4px, 1.5vw, 6px)',
                      padding: 'clamp(6px, 2vw, 8px)',
                      background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.3), rgba(87, 37, 1, 0.2))',
                      border: '2px solid rgba(255, 215, 165, 0.4)',
                      borderRadius: 'clamp(6px, 2vw, 8px)',
                      marginBottom: 'clamp(6px, 2vw, 8px)',
                      fontSize: 'clamp(8px, 2.2vw, 10px)',
                      fontWeight: 800,
                      color: '#feea88',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      width: '100%'
                    }}>
                      <div style={{ wordBreak: 'break-word' }}>#</div>
                      <div style={{ wordBreak: 'break-word' }}>Address</div>
                      <div style={{ wordBreak: 'break-word' }}>Volume</div>
                      <div style={{ wordBreak: 'break-word' }}>Trades</div>
                      <div style={{ wordBreak: 'break-word' }}>Profit</div>
                    </div>

                    {/* Trader Rows - Paginated */}
                    {topTraders
                      .slice(
                        (currentPage.topTraders - 1) * ITEMS_PER_PAGE,
                        currentPage.topTraders * ITEMS_PER_PAGE
                      )
                      .map((trader, idx) => {
                        const actualRank = (currentPage.topTraders - 1) * ITEMS_PER_PAGE + idx + 1;

                        return (
                          <div
                            key={trader.address}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '0.6fr 2fr 1.2fr 1fr 1.2fr',
                              gap: 'clamp(4px, 1.5vw, 6px)',
                              padding: 'clamp(8px, 2.5vw, 10px) clamp(6px, 2vw, 8px)',
                              background: 'rgba(87, 37, 1, 0.6)',
                              border: '2px solid rgba(255, 215, 165, 0.4)',
                              borderRadius: 'clamp(6px, 2vw, 8px)',
                              marginBottom: 'clamp(5px, 1.5vw, 6px)',
                              fontSize: 'clamp(9px, 2.8vw, 11px)',
                              alignItems: 'center',
                              width: '100%'
                            }}
                          >
                            {/* Rank */}
                            <div style={{
                              color: actualRank <= 3 ? '#feea88' : '#feea88',
                              fontWeight: 800,
                              fontSize: 'clamp(9px, 2.8vw, 11px)'
                            }}>
                              {actualRank}
                            </div>

                            {/* Address */}
                            <div
                              style={{
                                color: '#fff7ea',
                                fontWeight: 600,
                                fontSize: 'clamp(9px, 2.5vw, 11px)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'clamp(2px, 1vw, 4px)',
                                wordBreak: 'break-all',
                                lineHeight: '1.2'
                              }}
                              onClick={() => copyToClipboard(trader.address, `trader-${actualRank}`)}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{shortenAddress(trader.address)}</span>
                              {copiedItem === `trader-${actualRank}` ? (
                                <span style={{ color: '#4ade80', fontSize: 'clamp(7px, 2vw, 9px)', flexShrink: 0 }}>✓</span>
                              ) : (
                                <span style={{ color: '#feea88', fontSize: 'clamp(7px, 2vw, 9px)', flexShrink: 0 }}>📋</span>
                              )}
                            </div>

                            {/* Volume */}
                            <div style={{ color: '#feea88', fontWeight: 700, fontSize: 'clamp(8px, 2.5vw, 10px)', wordBreak: 'break-all', lineHeight: '1.2' }}>
                              {formatUSD(trader.totalVolume)}
                            </div>

                            {/* Trades */}
                            <div style={{ color: '#fff7ea', fontWeight: 600, fontSize: 'clamp(8px, 2.5vw, 10px)' }}>
                              {trader.trades}
                            </div>

                            {/* Profit */}
                            <div style={{
                              color: trader.profit >= 0 ? '#4ade80' : '#ff7a6f',
                              fontWeight: 800,
                              fontSize: 'clamp(8px, 2.5vw, 10px)',
                              wordBreak: 'break-all',
                              lineHeight: '1.2'
                            }}>
                              {trader.profit >= 0 ? '+' : ''}{formatUSD(trader.profit)}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                <Pagination
                  currentPage={currentPage.topTraders}
                  totalItems={topTraders.length}
                  onPageChange={(page) => setCurrentPage(prev => ({ ...prev, topTraders: page }))}
                />
              </>
            )}
          </div>
        )}

        {/* Price / MC Tab */}
        {activeTab === 'pricemc' && (
          <div style={{
            flex: disableScroll ? 'none' : 1,
            overflow: disableScroll ? 'visible' : 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: '12px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Current Price */}
              <div style={{
                padding: '16px',
                background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.3), rgba(87, 37, 1, 0.2))',
                border: '1px solid rgba(255, 215, 165, 0.25)',
                borderRadius: '12px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#feea88',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Current Price
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#fff7ea'
                }}>
                  ${priceStats.currentPrice.toFixed(8)}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: priceStats.priceChange24h >= 0 ? '#4ade80' : '#ff7a6f',
                  marginTop: '4px'
                }}>
                  {priceStats.priceChange24h >= 0 ? '+' : ''}{priceStats.priceChange24h.toFixed(2)}% (24h)
                </div>
              </div>

              {/* Market Cap */}
              <div style={{
                padding: '16px',
                background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.3), rgba(87, 37, 1, 0.2))',
                border: '1px solid rgba(255, 215, 165, 0.25)',
                borderRadius: '12px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#feea88',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Market Cap
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#fff7ea'
                }}>
                  {formatUSD(priceStats.currentMC)}
                </div>
              </div>

              {/* Volume 24h */}
              <div style={{
                padding: '16px',
                background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.3), rgba(87, 37, 1, 0.2))',
                border: '1px solid rgba(255, 215, 165, 0.25)',
                borderRadius: '12px'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#feea88',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  24h Volume
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#fff7ea'
                }}>
                  {formatUSD(priceStats.volume24h)}
                </div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#feea88',
                  marginTop: '4px'
                }}>
                  {priceStats.trades24h} trades
                </div>
              </div>

              {/* Additional Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '12px'
              }}>
                <div style={{
                  padding: '12px',
                  background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.25), rgba(87, 37, 1, 0.15))',
                  border: '1px solid rgba(255, 215, 165, 0.2)',
                  borderRadius: '10px'
                }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#feea88',
                    marginBottom: '6px'
                  }}>
                    TOTAL TRADES
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#fff7ea'
                  }}>
                    {trades.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
