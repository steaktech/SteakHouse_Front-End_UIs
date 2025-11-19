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
}

type TabType = 'history' | 'positions' | 'topTraders' | 'pricemc';

const ITEMS_PER_PAGE = 10;

export const MobileTradeHistoryTable: React.FC<MobileTradeHistoryTableProps> = ({
  tokenAddress,
  tokenData,
  trades: liveTrades,
  isLoading = false,
  error = null,
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
        gap: '8px',
        padding: '12px',
        borderTop: '1px solid rgba(255, 215, 165, 0.2)'
      }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 700,
            color: currentPage === 1 ? '#666' : '#e9af5a',
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
          fontSize: '11px',
          fontWeight: 700,
          color: '#e9af5a',
          padding: '0 8px'
        }}>
          Page {currentPage} of {totalPages}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 700,
            color: currentPage === totalPages ? '#666' : '#e9af5a',
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
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#07040b',
      borderRadius: '12px',
      overflow: 'hidden'
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
          background: linear-gradient(180deg, #e9af5a, #e9af5a);
          border-radius: 4px;
          border: 1px solid rgba(255, 215, 165, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #f2c071, #f2c071);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #e9af5a rgba(87, 37, 1, 0.2);
        }
        .table-container {
          overflow-x: auto;
          overflow-y: visible;
        }
      `}</style>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '8px',
        background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.4), rgba(87, 37, 1, 0.3))',
        borderBottom: '1px solid rgba(255, 215, 165, 0.2)',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              position: 'relative',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 800,
              color: activeTab === tab.id ? '#2b1b14' : '#e9af5a',
              background: activeTab === tab.id 
                ? 'linear-gradient(180deg, #e9af5a, #e9af5a)'
                : 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))',
              border: '1px solid',
              borderColor: activeTab === tab.id ? '#e9af5a' : 'rgba(255, 215, 165, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              boxShadow: activeTab === tab.id 
                ? 'inset 0 2px 0 rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)'
                : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {tab.label}
            {tab.badge && (
              <span style={{
                padding: '2px 6px',
                fontSize: '9px',
                fontWeight: 700,
                borderRadius: '10px',
                background: activeTab === tab.id ? '#2b1b14' : '#e9af5a',
                color: activeTab === tab.id ? '#e9af5a' : '#2b1b14'
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Trade History Tab */}
        {activeTab === 'history' && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {isLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#e9af5a' }}>
                Loading trades...
              </div>
            ) : error ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#ff5b58' }}>
                {error}
              </div>
            ) : trades.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#e9af5a' }}>
                No trades yet
              </div>
            ) : (
              <>
                <div className="custom-scrollbar" style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  padding: '8px'
                }}>
                  <div className="table-container custom-scrollbar">
                    {/* Table Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '70px 80px 120px 100px 110px',
                      minWidth: '490px',
                      gap: '8px',
                      padding: '8px',
                      background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.3), rgba(87, 37, 1, 0.2))',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#e9af5a',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}>
                      <div>Date</div>
                      <div>Type</div>
                      <div>Price</div>
                      <div>Total</div>
                      <div>Price ${symbol}</div>
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
                            gridTemplateColumns: '70px 80px 120px 100px 110px',
                            minWidth: '490px',
                            gap: '8px',
                            padding: '10px 8px',
                            background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.15), rgba(87, 37, 1, 0.08))',
                            border: '1px solid rgba(255, 215, 165, 0.15)',
                            borderRadius: '8px',
                            marginBottom: '6px',
                            fontSize: '11px',
                            alignItems: 'center'
                          }}
                        >
                          {/* Date */}
                          <div style={{ 
                            color: '#fff7ea', 
                            fontSize: '10px',
                            fontWeight: 600 
                          }}>
                            {formatDate(trade.timestamp)}
                          </div>

                          {/* Type */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '20px',
                              height: '20px',
                              borderRadius: '6px',
                              background: isBuy 
                                ? 'linear-gradient(180deg, #4ade80, #22c55e)'
                                : 'linear-gradient(180deg, #ff7a6f, #ff5b58)',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                            }}>
                              {isBuy ? <BuyArrow size={10} /> : <SellArrow size={10} />}
                            </div>
                            <span style={{
                              fontWeight: 800,
                              color: isBuy ? '#4ade80' : '#ff7a6f',
                              fontSize: '10px'
                            }}>
                              {isBuy ? 'buy' : 'sell'}
                            </span>
                          </div>

                          {/* Price (ETH amount) */}
                          <div style={{
                            color: '#fff7ea',
                            fontWeight: 700,
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <img 
                              src="https://cryptologos.cc/logos/ethereum-eth-logo.png" 
                              alt="ETH" 
                              style={{ width: '12px', height: '12px' }}
                            />
                            {formatNumber(trade.amountEth)}
                          </div>

                          {/* Total (USD) */}
                          <div style={{
                            color: '#e9af5a',
                            fontWeight: 800,
                            fontSize: '11px'
                          }}>
                            {formatUSD(trade.usdValue)}
                          </div>

                          {/* Token Price */}
                          <div style={{
                            color: '#fff7ea',
                            fontWeight: 700,
                            fontSize: '10px'
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
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {!isConnected ? (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#e9af5a',
                fontSize: '12px'
              }}>
                Connect your wallet to view your positions
              </div>
            ) : ordersLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#e9af5a' }}>
                Loading positions...
              </div>
            ) : ordersError ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#ff5b58', fontSize: '11px' }}>
                {ordersError}
              </div>
            ) : limitOrders.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#e9af5a', fontSize: '12px' }}>
                No open positions
              </div>
            ) : (
              <>
                <div className="custom-scrollbar" style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  padding: '8px'
                }}>
                  <div className="table-container custom-scrollbar">
                    {/* Orders Table Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 80px 90px 90px 70px',
                      minWidth: '390px',
                      gap: '8px',
                      padding: '8px',
                      background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.3), rgba(87, 37, 1, 0.2))',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#e9af5a',
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
                        '#e9af5a';

                      return (
                        <div
                          key={order.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '60px 80px 90px 90px 70px',
                            minWidth: '390px',
                            gap: '8px',
                            padding: '10px 8px',
                            background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.15), rgba(87, 37, 1, 0.08))',
                            border: '1px solid rgba(255, 215, 165, 0.15)',
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
                          <div style={{ color: '#e9af5a', fontWeight: 700, fontSize: '10px' }}>
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
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {topTraders.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#e9af5a', fontSize: '12px' }}>
                No trader data available
              </div>
            ) : (
              <>
                <div className="custom-scrollbar" style={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  padding: '8px'
                }}>
                  <div className="table-container custom-scrollbar">
                    {/* Traders Table Header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '30px 120px 80px 60px 80px',
                      minWidth: '370px',
                      gap: '8px',
                      padding: '8px',
                      background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.3), rgba(87, 37, 1, 0.2))',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#e9af5a',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  }}>
                    <div>#</div>
                    <div>Address</div>
                    <div>Volume</div>
                    <div>Trades</div>
                    <div>Profit</div>
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
                            gridTemplateColumns: '30px 120px 80px 60px 80px',
                            minWidth: '370px',
                            gap: '8px',
                            padding: '10px 8px',
                            background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.15), rgba(87, 37, 1, 0.08))',
                            border: '1px solid rgba(255, 215, 165, 0.15)',
                            borderRadius: '8px',
                            marginBottom: '6px',
                            fontSize: '11px',
                            alignItems: 'center'
                          }}
                        >
                          {/* Rank */}
                          <div style={{
                            color: actualRank <= 3 ? '#e9af5a' : '#e9af5a',
                            fontWeight: 800,
                            fontSize: '11px'
                          }}>
                            {actualRank}
                          </div>

                          {/* Address */}
                          <div 
                            style={{ 
                              color: '#fff7ea', 
                              fontWeight: 600, 
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={() => copyToClipboard(trader.address, `trader-${actualRank}`)}
                          >
                            {shortenAddress(trader.address)}
                            {copiedItem === `trader-${actualRank}` ? (
                              <span style={{ color: '#4ade80', fontSize: '9px' }}>✓</span>
                            ) : (
                              <span style={{ color: '#e9af5a', fontSize: '9px' }}>📋</span>
                            )}
                          </div>

                          {/* Volume */}
                          <div style={{ color: '#e9af5a', fontWeight: 700, fontSize: '11px' }}>
                            {formatUSD(trader.totalVolume)}
                          </div>

                          {/* Trades */}
                          <div style={{ color: '#fff7ea', fontWeight: 600, fontSize: '11px' }}>
                            {trader.trades}
                          </div>

                          {/* Profit */}
                          <div style={{
                            color: trader.profit >= 0 ? '#4ade80' : '#ff7a6f',
                            fontWeight: 800,
                            fontSize: '11px'
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
            flex: 1, 
            overflow: 'hidden', 
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
                  color: '#e9af5a',
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
                  color: '#e9af5a',
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
                  color: '#e9af5a',
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
                  color: '#e9af5a',
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
                    color: '#e9af5a',
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
