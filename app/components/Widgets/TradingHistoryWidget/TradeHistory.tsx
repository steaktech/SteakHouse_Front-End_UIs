import React, { useMemo, useState } from 'react';
import type { Trade, FullTokenDataResponse } from '@/app/types/token';

// Custom SVG Arrow Icons (from backup design)
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

interface TradeHistoryProps {
  tokenAddress: string;
  tokenData: FullTokenDataResponse | null;
  isLoading: boolean;
  error: string | null;
  // New design optional props (non-breaking)
  showToggle?: boolean;
  showLimitOrders?: boolean;
  onToggleChange?: (showLimitOrders: boolean) => void;
  isMobile?: boolean;
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({ 
  tokenAddress, 
  tokenData, 
  isLoading, 
  error,
  showToggle = false,
  showLimitOrders = false,
  onToggleChange,
  isMobile = false
}) => {
  // Helper functions
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatNumber = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
    return value.toFixed(6);
  };

  const formatTxHash = (hash: string): string => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const formatUSD = (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value.replace('$', '')) : value;
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

  // Local UI state from new design
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'size-desc' | 'size-asc' | 'address'>('time');
  const [addressFilter, setAddressFilter] = useState<string>('');

  const trades = tokenData?.recentTrades ?? [];
  const symbol = tokenData?.tokenInfo?.symbol ?? '';

  // Filter and sort trades according to new design controls
  const filteredAndSortedTrades = useMemo(() => {
    let result = trades;

    if (filterType !== 'all') {
      const wantBuy = filterType === 'buy';
      result = result.filter(t => (t.type === 'BUY') === wantBuy);
    }

    if (addressFilter.trim()) {
      const q = addressFilter.trim().toLowerCase();
      result = result.filter(t => t.trader?.toLowerCase().includes(q));
    }

    const sorted = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return b.timestamp - a.timestamp; // newest first
        case 'size-desc':
          return (b.amountTokens ?? 0) - (a.amountTokens ?? 0);
        case 'size-asc':
          return (a.amountTokens ?? 0) - (b.amountTokens ?? 0);
        case 'address':
          return (a.trader ?? '').localeCompare(b.trader ?? '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [trades, filterType, addressFilter, sortBy]);

  // Copy to clipboard (from new design)
  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        setCopiedItem(itemId);
        setTimeout(() => setCopiedItem(null), 2000);
        document.body.removeChild(textArea);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      borderRadius: 'clamp(18px, 2.5vw, 26px)',
      background: 'linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      padding: 'clamp(16px, 3vh, 22px)',
      border: '1px solid rgba(255, 215, 165, 0.4)',
      overflow: 'hidden',
      color: '#fff7ea',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }}>
      {/* Header with optional toggle (from new design) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'clamp(10px, 1.6vh, 14px)'
      }}>
        <h3 style={{
          color: '#feea88',
          fontFamily: '"Sora", "Inter", sans-serif',
          fontWeight: 800,
          fontSize: isMobile ? '12px' : 'clamp(16px, 2.6vw, 18px)',
          lineHeight: 1,
          margin: 0,
          textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
        }}>
          Recent Transactions
        </h3>

        {showToggle && onToggleChange && (
          <div style={{
            position: 'relative',
            display: 'flex',
            background: 'linear-gradient(180deg, #7f4108, #6f3906)',
            border: '1px solid rgba(255, 215, 165, 0.4)',
            borderRadius: '16px',
            padding: '2px',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            flexShrink: 0,
            width: '120px',
            height: '26px'
          }}>
            <div style={{
              position: 'absolute',
              top: '2px',
              left: showLimitOrders ? 'calc(50% + 1px)' : '2px',
              height: 'calc(100% - 4px)',
              width: 'calc(50% - 3px)',
              borderRadius: '13px',
              transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              background: showLimitOrders 
                ? 'linear-gradient(180deg, #ffd700, #daa20b)'
                : 'linear-gradient(180deg, #4ade80, #22c55e)',
              boxShadow: '0 2px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }} />
            <button
              onClick={() => onToggleChange(false)}
              style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                fontWeight: 700,
                color: !showLimitOrders ? '#1f2937' : '#feea88',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                whiteSpace: 'nowrap',
                width: '50%',
                height: '100%',
                letterSpacing: '0.4px'
              }}
            >
              TXN
            </button>
            <button
              onClick={() => onToggleChange(true)}
              style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                fontWeight: 700,
                color: showLimitOrders ? '#1f2937' : '#feea88',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                whiteSpace: 'nowrap',
                width: '50%',
                height: '100%',
                letterSpacing: '0.4px'
              }}
            >
              ORDERS
            </button>
          </div>
        )}
      </div>

      {/* Filter and Sort Controls - Hidden on mobile when no toggle */}
      {!(isMobile && !showToggle) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: 'clamp(8px, 1.5vh, 12px)',
          flexWrap: 'wrap',
          padding: 'clamp(8px, 1.5vh, 10px) clamp(10px, 2.5vh, 14px)',
          background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.4), rgba(87, 37, 1, 0.3) 50%, rgba(87, 37, 1, 0.35) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))',
          border: '1px solid rgba(255, 215, 165, 0.25)',
          borderRadius: 'clamp(8px, 1.6vw, 12px)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
        }}>
          {/* Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ 
              fontSize: 'clamp(9px, 1.6vw, 11px)', 
              color: '#feea88', 
              fontWeight: 800,
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.4)',
              letterSpacing: '0.2px'
            }}>TYPE</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'buy' | 'sell')}
              style={{
                background: 'linear-gradient(180deg, #3a1c08, #2d1506)',
                border: '1px solid rgba(255, 215, 165, 0.4)',
                borderRadius: 'clamp(5px, 1.2vw, 6px)',
                padding: 'clamp(3px, 1vh, 5px) clamp(6px, 1.6vw, 8px)',
                fontSize: 'clamp(8px, 1.4vw, 10px)',
                fontWeight: 700,
                color: '#feea88',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '50px',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 1px 3px rgba(0, 0, 0, 0.2)',
                textShadow: '0 1px 0 rgba(0, 0, 0, 0.3)'
              }}
            >
              <option value="all" style={{ background: '#2d1506', color: '#feea88' }}>All</option>
              <option value="buy" style={{ background: '#2d1506', color: '#feea88' }}>Buy</option>
              <option value="sell" style={{ background: '#2d1506', color: '#feea88' }}>Sell</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ 
              fontSize: 'clamp(9px, 1.6vw, 11px)', 
              color: '#feea88', 
              fontWeight: 800,
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.4)',
              letterSpacing: '0.2px'
            }}>SORT</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'time' | 'size-desc' | 'size-asc' | 'address')}
              style={{
                background: 'linear-gradient(180deg, #3a1c08, #2d1506)',
                border: '1px solid rgba(255, 215, 165, 0.4)',
                borderRadius: 'clamp(6px, 1.5vw, 8px)',
                padding: 'clamp(5px, 1.2vh, 7px) clamp(8px, 2vw, 12px)',
                fontSize: 'clamp(10px, 1.8vw, 12px)',
                fontWeight: 700,
                color: '#feea88',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '85px',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 4px rgba(0, 0, 0, 0.2)',
                textShadow: '0 1px 0 rgba(0, 0, 0, 0.3)'
              }}
            >
              <option value="time" style={{ background: '#2d1506', color: '#feea88' }}>Time</option>
              <option value="size-desc" style={{ background: '#2d1506', color: '#feea88' }}>Size ↓</option>
              <option value="size-asc" style={{ background: '#2d1506', color: '#feea88' }}>Size ↑</option>
              <option value="address" style={{ background: '#2d1506', color: '#feea88' }}>Address</option>
            </select>
          </div>

          {/* Address Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ 
              fontSize: 'clamp(9px, 1.6vw, 11px)', 
              color: '#feea88', 
              fontWeight: 800,
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.4)',
              letterSpacing: '0.2px'
            }}>ADDRESS</span>
            <input
              type="text"
              placeholder="Search address..."
              value={addressFilter}
              onChange={(e) => setAddressFilter(e.target.value)}
              style={{
                background: 'linear-gradient(180deg, #3a1c08, #2d1506)',
                border: '1px solid rgba(255, 215, 165, 0.4)',
                borderRadius: 'clamp(6px, 1.5vw, 8px)',
                padding: 'clamp(5px, 1.2vh, 7px) clamp(8px, 2vw, 12px)',
                fontSize: 'clamp(10px, 1.8vw, 12px)',
                fontWeight: 600,
                color: '#feea88',
                outline: 'none',
                width: 'clamp(120px, 15vw, 160px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 4px rgba(0, 0, 0, 0.2)',
                textShadow: '0 1px 0 rgba(0, 0, 0, 0.3)'
              }}
            />
          </div>

          {/* Clear Filters */}
          {(filterType !== 'all' || sortBy !== 'time' || addressFilter.trim()) && (
            <button
              onClick={() => {
                setFilterType('all');
                setSortBy('time');
                setAddressFilter('');
              }}
              style={{
                background: 'linear-gradient(180deg, #ffb1a6, #ff7a6f 60%, #ff5b58)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'clamp(6px, 1.5vw, 8px)',
                padding: 'clamp(5px, 1.2vh, 7px) clamp(10px, 2.5vw, 14px)',
                fontSize: 'clamp(10px, 1.8vw, 12px)',
                fontWeight: 800,
                color: '#2b1b14',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: 'inset 0 2px 0 rgba(255, 255, 255, 0.35), inset 0 -4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.2)',
                textShadow: '0 1px 0 rgba(255, 255, 255, 0.2)',
                letterSpacing: '0.4px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'linear-gradient(180deg, #ffc4bb, #ff8a80 60%, #ff6b68)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'inset 0 2px 0 rgba(255, 255, 255, 0.4), inset 0 -4px 8px rgba(0, 0, 0, 0.18), 0 3px 6px rgba(0, 0, 0, 0.25)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'linear-gradient(180deg, #ffb1a6, #ff7a6f 60%, #ff5b58)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'inset 0 2px 0 rgba(255, 255, 255, 0.35), inset 0 -4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.2)';
              }}
            >
              CLEAR
            </button>
          )}

          {/* Transaction Count */}
          <span style={{ 
            marginLeft: 'auto',
            fontSize: 'clamp(11px, 2vw, 13px)', 
            color: '#feea88', 
            fontWeight: 800,
            textShadow: '0 1px 0 rgba(0, 0, 0, 0.4)',
            letterSpacing: '0.3px'
          }}>
            {filteredAndSortedTrades.length} TRANSACTIONS
          </span>
        </div>
      )}

      {/* Transactions List (new design) */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid rgba(254, 234, 136, 0.3)',
              borderTop: '3px solid #feea88',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ marginLeft: '12px', color: '#feea88' }}>Loading trades...</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#f87171', padding: '16px' }}>
            <p>Error loading trades: {error}</p>
          </div>
        ) : (
          <div className="trade-history-scrollbar" style={{ 
            overflowY: 'auto', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: isMobile ? '8px' : '6px',
            padding: isMobile ? '0 3px' : '0 1px',
            paddingRight: isMobile ? '3px' : '4px'
          }}>
            {filteredAndSortedTrades.map((tx: Trade, index: number) => {
              const positive = tx.type === 'BUY';
              const typeLabel = positive ? 'Buy' : 'Sell';
              const amountTokensStr = `${formatNumber(tx.amountTokens)}${symbol ? ` ${symbol}` : ''}`;
              const ethAmountStr = `${formatNumber(tx.amountEth)} ETH`;
              const priceStr = formatUSD(tx.usdValue);
              const timeStr = getRelativeTime(tx.timestamp);
              const address = tx.trader ?? '';

              return (
                <div key={`${tx.txHash}-${index}`} style={{
                  background: isMobile 
                    ? 'rgba(87, 37, 1, 0.6)' 
                    : 'linear-gradient(180deg, rgba(87, 37, 1, 0.4), rgba(87, 37, 1, 0.3) 50%, rgba(87, 37, 1, 0.35) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))',
                  border: isMobile 
                    ? '2px solid rgba(255, 215, 165, 0.4)' 
                    : '1px solid rgba(255, 215, 165, 0.25)',
                  borderRadius: isMobile ? '14px' : 'clamp(8px, 1.6vw, 12px)',
                  padding: isMobile ? '10px 12px' : 'clamp(8px, 1.5vh, 10px) clamp(10px, 2.5vh, 14px)',
                  boxShadow: isMobile 
                    ? '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 2px 6px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: 'center',
                  gap: isMobile ? '3px' : '8px',
                  width: '100%'
                }}>
                  {isMobile ? (
                    <>
                      {/* Mobile: Two-line layout */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        width: '100%',
                        minWidth: 0
                      }}>
                        {/* Buy/Sell Icon */}
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: positive ? '#22c55e' : '#ef4444',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}>
                          {positive ? <BuyArrow size={10} /> : <SellArrow size={10} />}
                        </div>

                        <span style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: positive ? '#22c55e' : '#ef4444',
                          textTransform: 'uppercase',
                          minWidth: '30px',
                          flexShrink: 0
                        }}>
                          {typeLabel}
                        </span>

                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#feea88',
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {amountTokensStr}
                        </span>

                        <span style={{
                          fontSize: '9px',
                          color: '#feea88',
                          opacity: 0.8,
                          flexShrink: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          ({ethAmountStr})
                        </span>

                        <span style={{
                          fontSize: '9px',
                          color: '#feea88',
                          opacity: 0.7,
                          flexShrink: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {timeStr}
                        </span>

                        <span style={{
                          fontSize: '12px',
                          fontWeight: 800,
                          color: '#feea88',
                          marginLeft: 'auto',
                          flexShrink: 0,
                          minWidth: '40px',
                          textAlign: 'right'
                        }}>
                          {priceStr}
                        </span>
                      </div>

                      {/* Second Line - From Address and Etherscan */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%'
                      }}>
                        <span style={{
                          fontSize: '10px',
                          color: '#ffe0b6',
                          fontWeight: 600,
                          flexShrink: 0
                        }}>
                          From:
                        </span>

                        <button
                          onClick={() => copyToClipboard(address, `address-${index}`)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: copiedItem === `address-${index}` ? '#86efac' : '#feea88',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            padding: '0',
                            flexShrink: 0
                          }}
                          title="Click to copy address"
                        >
                          {copiedItem === `address-${index}` ? '✓ Copied!' : `${address.slice(0, 6)}...${address.slice(-4)}`}
                        </button>

                        <button 
                          onClick={() => window.open(`https://etherscan.io/tx/${tx.txHash}`, '_blank')}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            opacity: 1,
                            transition: 'opacity 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px',
                            marginLeft: 'auto',
                            flexShrink: 0
                          }}
                          onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                          title="View on Etherscan"
                        >
                          <img 
                            src="/images/etherscan_logo.webp" 
                            alt="Etherscan" 
                            style={{ width: '16px', height: '16px' }}
                          />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Desktop: Single-line layout */}
                      {/* Buy/Sell Icon */}
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: positive ? '#22c55e' : '#ef4444',
                        color: 'white',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {positive ? <BuyArrow size={10} /> : <SellArrow size={10} />}
                      </div>

                      <span style={{
                        fontSize: 'clamp(11px, 2vw, 13px)',
                        fontWeight: 800,
                        color: positive ? '#22c55e' : '#ef4444',
                        textTransform: 'uppercase',
                        minWidth: '28px',
                        flexShrink: 0
                      }}>
                        {typeLabel}
                      </span>

                      <span style={{
                        fontSize: 'clamp(11px, 2vw, 13px)',
                        fontWeight: 700,
                        color: '#feea88',
                        flexShrink: 0
                      }}>
                        {amountTokensStr}
                      </span>

                      <span style={{
                        fontSize: 'clamp(9px, 1.8vw, 11px)',
                        color: '#feea88',
                        opacity: 0.8,
                        flexShrink: 0
                      }}>
                        ({ethAmountStr})
                      </span>

                      <span style={{
                        fontSize: 'clamp(9px, 1.8vw, 11px)',
                        color: '#feea88',
                        opacity: 0.7,
                        flexShrink: 0
                      }}>
                        {timeStr}
                      </span>

                      <span style={{
                        fontSize: 'clamp(9px, 1.8vw, 11px)',
                        color: '#ffe0b6',
                        fontWeight: 600,
                        flexShrink: 0
                      }}>
                        From:
                      </span>

                      <button
                        onClick={() => copyToClipboard(address, `address-${index}`)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedItem === `address-${index}` ? '#86efac' : '#feea88',
                          fontSize: 'clamp(9px, 1.8vw, 11px)',
                          fontFamily: 'monospace',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          padding: '0',
                          flexShrink: 0
                        }}
                        title="Click to copy address"
                      >
                        {copiedItem === `address-${index}` ? '✓' : `${address.slice(0, 6)}...${address.slice(-4)}`}
                      </button>

                      <span style={{
                        fontSize: 'clamp(12px, 2.2vw, 14px)',
                        fontWeight: 800,
                        color: '#feea88',
                        marginLeft: 'auto',
                        flexShrink: 0
                      }}>
                        {priceStr}
                      </span>

                      <button 
                        onClick={() => window.open(`https://etherscan.io/tx/${tx.txHash}`, '_blank')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          opacity: 1,
                          transition: 'opacity 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px',
                          flexShrink: 0
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        title="View on Etherscan"
                      >
                        <img 
                          src="/images/etherscan_logo.webp" 
                          alt="Etherscan" 
                          style={{ width: '12px', height: '12px' }}
                        />
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
