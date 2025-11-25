import React, { useState } from 'react';
import type { FullTokenDataResponse, Trade } from '@/app/types/token';
import { useTheme } from '@/app/contexts/ThemeContext';

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


interface TradeHistoryProps {
  tokenAddress?: string;
  tokenData?: FullTokenDataResponse | null;
  trades?: Trade[];
  isLoading?: boolean;
  error?: string | null;
  showToggle?: boolean;
  showLimitOrders?: boolean;
  onToggleChange?: (showLimitOrders: boolean) => void;
  isMobile?: boolean;
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({
  tokenAddress,
  tokenData,
  trades: liveTrades,
  isLoading = false,
  error = null,
  showToggle = false,
  showLimitOrders = false,
  onToggleChange,
  isMobile = false
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'size-desc' | 'size-asc' | 'address'>('time');
  const [addressFilter, setAddressFilter] = useState<string>('');

  // Helper formatters and data mapping
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

  const trades: Trade[] = (liveTrades && liveTrades.length ? liveTrades : (tokenData?.recentTrades ?? []));
  const symbol = tokenData?.tokenInfo?.symbol ?? '';

  // Filter and sort API trades, then map to display objects used by this panel
  const getFilteredAndSortedTransactions = () => {
    let filtered = trades;

    if (filterType !== 'all') {
      const wantBuy = filterType === 'buy';
      filtered = filtered.filter(t => (t.type === 'BUY') === wantBuy);
    }

    if (addressFilter.trim()) {
      const q = addressFilter.trim().toLowerCase();
      filtered = filtered.filter(t => (t.trader ?? '').toLowerCase().includes(q));
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return (b.timestamp ?? 0) - (a.timestamp ?? 0); // newest first
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

    // Map to the UI shape used by this component
    const mapped = sorted.map((t) => ({
      type: t.type === 'BUY' ? 'Buy' : 'Sell',
      positive: t.type === 'BUY',
      amount: `${formatNumber(t.amountTokens ?? 0)}${symbol ? ` ${symbol}` : ''}`,
      ethAmount: `${formatNumber(t.amountEth ?? 0)} ETH`,
      price: formatUSD(t.usdValue ?? 0),
      time: getRelativeTime(t.timestamp ?? Date.now()),
      fullDate: new Date(t.timestamp ?? Date.now()).toISOString(),
      address: t.trader ?? '',
      txHash: t.txHash ?? ''
    }));

    return mapped;
  };

  // Copy to clipboard function matching mobile version
  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedItem(itemId);
        setTimeout(() => setCopiedItem(null), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <>
      <style>{`
        /* TradeHistory specific scrollbar styles */
        .trade-history-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .trade-history-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .trade-history-scrollbar::-webkit-scrollbar-thumb {
          background: #C97413 !important;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .trade-history-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D97706 !important;
        }
        /* Firefox scrollbar support */
        .trade-history-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #C97413 rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: isLight ? 'var(--theme-text-primary)' : '#fff7ea'
      }}>
      {/* Header with optional toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'clamp(6px, 1vh, 8px)'
      }}>
        <h3 style={{
          color: isLight ? '#b45309' : '#C97413',
          fontFamily: '"Sora", "Inter", sans-serif',
          fontWeight: 800,
          fontSize: isMobile ? '12px' : 'clamp(12px, 2vw, 14px)',
          lineHeight: 1,
          margin: 0,
          textShadow: isLight ? 'none' : '0 1px 0 rgba(0, 0, 0, 0.18)'
        }}>
          Recent Transactions
        </h3>
        
        {/* Toggle Switch */}
        {showToggle && onToggleChange && (
          <div style={{
            position: 'relative',
            display: 'flex',
            background: isLight ? 'var(--theme-grad-card)' : 'linear-gradient(180deg, #1A0F08, #241207)',
            border: isLight ? '1px solid #e8dcc8' : '1px solid #4F2D0C',
            borderRadius: '16px',
            padding: '2px',
            boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.05)' : 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
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
                ? (isLight ? 'linear-gradient(180deg, #d97706, #b45309)' : 'linear-gradient(180deg, #ffd700, #daa20b)')
                : (isLight ? 'linear-gradient(180deg, #22c55e, #15803d)' : 'linear-gradient(180deg, #4ade80, #22c55e)'),
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
                color: !showLimitOrders ? (isLight ? 'var(--theme-grad-card)' : '#1f2937') : (isLight ? '#5c4033' : '#C97413'),
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
                color: showLimitOrders ? (isLight ? 'var(--theme-grad-card)' : '#1f2937') : (isLight ? '#5c4033' : '#C97413'),
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
          background: isLight 
            ? '#ffffff' 
            : 'linear-gradient(180deg, rgba(87, 37, 1, 0.4), rgba(87, 37, 1, 0.3) 50%, rgba(87, 37, 1, 0.35) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))',
          border: isLight ? '1px solid #e8dcc8' : '1px solid #4F2D0C',
          borderRadius: 'clamp(8px, 1.6vw, 12px)',
          boxShadow: isLight ? '0 2px 6px rgba(0,0,0,0.05)' : '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
        }}>
        {/* Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ 
            fontSize: 'clamp(9px, 1.6vw, 11px)', 
            color: isLight ? '#856d57' : '#C97413',
            fontWeight: 800,
            textShadow: isLight ? 'none' : '0 1px 0 rgba(0, 0, 0, 0.4)',
            letterSpacing: '0.2px'
          }}>TYPE</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'buy' | 'sell')}
            style={{
              background: isLight ? 'var(--theme-grad-card)' : 'linear-gradient(180deg, #3a1c08, #2d1506)',
              border: isLight ? '1px solid #e8dcc8' : '1px solid #4F2D0C',
              borderRadius: 'clamp(5px, 1.2vw, 6px)',
              padding: 'clamp(3px, 1vh, 5px) clamp(6px, 1.6vw, 8px)',
              fontSize: 'clamp(8px, 1.4vw, 10px)',
              fontWeight: 700,
              color: isLight ? 'var(--theme-text-primary)' : '#C97413',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '50px',
              boxShadow: isLight ? 'none' : 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 1px 3px rgba(0, 0, 0, 0.2)',
              textShadow: isLight ? 'none' : '0 1px 0 rgba(0, 0, 0, 0.3)'
            }}
          >
            <option value="all" style={{ background: isLight ? 'var(--theme-grad-card)' : '#2d1506', color: isLight ? 'var(--theme-text-primary)' : '#C97413' }}>All</option>
            <option value="buy" style={{ background: isLight ? 'var(--theme-grad-card)' : '#2d1506', color: isLight ? 'var(--theme-text-primary)' : '#C97413' }}>Buy</option>
            <option value="sell" style={{ background: isLight ? 'var(--theme-grad-card)' : '#2d1506', color: isLight ? 'var(--theme-text-primary)' : '#C97413' }}>Sell</option>
          </select>
        </div>
        
        {/* Sort By */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ 
            fontSize: 'clamp(9px, 1.6vw, 11px)', 
            color: isLight ? '#856d57' : '#C97413',
            fontWeight: 800,
            textShadow: isLight ? 'none' : '0 1px 0 rgba(0, 0, 0, 0.4)',
            letterSpacing: '0.2px'
          }}>SORT</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'time' | 'size-desc' | 'size-asc' | 'address')}
            style={{
              background: isLight ? 'var(--theme-grad-card)' : 'linear-gradient(180deg, #3a1c08, #2d1506)',
              border: isLight ? '1px solid #e8dcc8' : '1px solid #4F2D0C',
              borderRadius: 'clamp(6px, 1.5vw, 8px)',
              padding: 'clamp(5px, 1.2vh, 7px) clamp(8px, 2vw, 12px)',
              fontSize: 'clamp(10px, 1.8vw, 12px)',
              fontWeight: 700,
              color: isLight ? 'var(--theme-text-primary)' : '#C97413',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '85px',
              boxShadow: isLight ? 'none' : 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 4px rgba(0, 0, 0, 0.2)',
              textShadow: isLight ? 'none' : '0 1px 0 rgba(0, 0, 0, 0.3)'
            }}
          >
            <option value="time" style={{ background: isLight ? 'var(--theme-grad-card)' : '#2d1506', color: isLight ? 'var(--theme-text-primary)' : '#C97413' }}>Time</option>
            <option value="size-desc" style={{ background: isLight ? 'var(--theme-grad-card)' : '#2d1506', color: isLight ? 'var(--theme-text-primary)' : '#C97413' }}>Size ↓</option>
            <option value="size-asc" style={{ background: isLight ? 'var(--theme-grad-card)' : '#2d1506', color: isLight ? 'var(--theme-text-primary)' : '#C97413' }}>Size ↑</option>
            <option value="address" style={{ background: isLight ? 'var(--theme-grad-card)' : '#2d1506', color: isLight ? 'var(--theme-text-primary)' : '#C97413' }}>Address</option>
          </select>
        </div>
        
        {/* Address Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ 
            fontSize: 'clamp(9px, 1.6vw, 11px)', 
            color: isLight ? '#856d57' : '#C97413',
            fontWeight: 800,
            textShadow: isLight ? 'none' : '0 1px 0 rgba(0, 0, 0, 0.4)',
            letterSpacing: '0.2px'
          }}>ADDRESS</span>
          <input
            type="text"
            placeholder="Search address..."
            value={addressFilter}
            onChange={(e) => setAddressFilter(e.target.value)}
            style={{
              background: isLight ? 'var(--theme-grad-card)' : 'linear-gradient(180deg, #3a1c08, #2d1506)',
              border: isLight ? '1px solid #e8dcc8' : '1px solid rgba(255, 215, 165, 0.4)',
              borderRadius: 'clamp(6px, 1.5vw, 8px)',
              padding: 'clamp(5px, 1.2vh, 7px) clamp(8px, 2vw, 12px)',
              fontSize: 'clamp(10px, 1.8vw, 12px)',
              fontWeight: 600,
              color: isLight ? 'var(--theme-text-primary)' : '#C97413',
              outline: 'none',
              width: 'clamp(120px, 15vw, 160px)',
              boxShadow: isLight ? 'none' : 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 4px rgba(0, 0, 0, 0.2)',
              textShadow: isLight ? 'none' : '0 1px 0 rgba(0, 0, 0, 0.3)'
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
              background: 'linear-gradient(180deg, #f87171, #ef4444)',
              border: 'none',
              borderRadius: 'clamp(6px, 1.5vw, 8px)',
              padding: 'clamp(5px, 1.2vh, 7px) clamp(10px, 2.5vw, 14px)',
              fontSize: 'clamp(10px, 1.8vw, 12px)',
              fontWeight: 800,
              color: '#1f2937',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 3px 6px rgba(0, 0, 0, 0.1)',
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.3)',
              letterSpacing: '0.4px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 6px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 3px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            CLEAR
          </button>
        )}
        
        {/* Transaction Count */}
        <span style={{ 
          marginLeft: 'auto',
          fontSize: 'clamp(11px, 2vw, 13px)', 
          color: isLight ? '#856d57' : '#C97413',
          fontWeight: 800,
          textShadow: isLight ? 'none' : '0 1px 0 rgba(0, 0, 0, 0.4)',
          letterSpacing: '0.3px'
        }}>
          {getFilteredAndSortedTransactions().length} TRANSACTIONS
        </span>
        </div>
      )}
      
      {/* Transaction List - Original Mobile Style */}
      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="trade-history-scrollbar" style={{ 
          overflowY: 'auto', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: isMobile ? '8px' : '6px',
          padding: isMobile ? '0 3px' : '0 1px',
          paddingRight: isMobile ? '3px' : '4px', // Extra space for scrollbar on desktop
          paddingBottom: isMobile ? '8px' : '12px' // Extra space at bottom to see last transactions
        }}>
          {getFilteredAndSortedTransactions().map((tx, index) => (
            <div key={index} style={{
              background: isMobile 
                ? (isLight ? 'var(--theme-grad-card)' : 'rgba(87, 37, 1, 0.6)')
                : (isLight ? 'var(--theme-grad-card)' : 'linear-gradient(180deg, rgba(87, 37, 1, 0.4), rgba(87, 37, 1, 0.3) 50%, rgba(87, 37, 1, 0.35) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))'),
              border: isMobile 
                ? (isLight ? '1px solid #e8dcc8' : '2px solid #4F2D0C')
                : (isLight ? '1px solid #e8dcc8' : '1px solid #4F2D0C'),
              borderRadius: isMobile ? '14px' : 'clamp(8px, 1.6vw, 12px)',
              padding: isMobile ? '10px 12px' : 'clamp(8px, 1.5vh, 10px) clamp(10px, 2.5vh, 14px)',
              boxShadow: isMobile 
                ? (isLight ? '0 2px 6px rgba(0,0,0,0.05)' : '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)')
                : (isLight ? '0 1px 3px rgba(0,0,0,0.05)' : '0 2px 6px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'),
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
                    minWidth: 0 // Allow flex items to shrink
                  }}>
                    {/* Buy/Sell Icon */}
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: tx.positive ? '#22c55e' : '#ef4444',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {tx.positive ? <BuyArrow size={10} /> : <SellArrow size={10} />}
                    </div>
                    
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: tx.positive ? '#22c55e' : '#ef4444',
                      textTransform: 'uppercase',
                      minWidth: '30px',
                      flexShrink: 0
                    }}>
                      {tx.type}
                    </span>
                    
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: isLight ? 'var(--theme-text-primary)' : '#C97413',
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {tx.amount}
                    </span>
                    
                    <span style={{
                      fontSize: '9px',
                      color: isLight ? '#5c4033' : '#C97413',
                      opacity: 0.8,
                      flexShrink: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      ({tx.ethAmount})
                    </span>
                    
                    <span style={{
                      fontSize: '9px',
                      color: isLight ? '#5c4033' : '#C97413',
                      opacity: 0.7,
                      flexShrink: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {tx.time}
                    </span>
                    
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 400,
                      color: isLight ? 'var(--theme-text-primary)' : '#C97413',
                      marginLeft: 'auto',
                      flexShrink: 0,
                      minWidth: '40px',
                      textAlign: 'right'
                    }}>
                      {tx.price}
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
                      color: isLight ? '#856d57' : '#ffe0b6',
                      fontWeight: 600,
                      flexShrink: 0
                    }}>
                      From:
                    </span>
                    
                    <button
                      onClick={() => copyToClipboard(tx.address, `address-${index}`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedItem === `address-${index}` ? (isLight ? '#16a34a' : '#86efac') : (isLight ? '#5c4033' : '#C97413'),
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        padding: '0',
                        flexShrink: 0
                      }}
                      title="Click to copy address"
                    >
                      {copiedItem === `address-${index}` ? '✓ Copied!' : `${tx.address.slice(0, 6)}...${tx.address.slice(-4)}`}
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
                        gap: '4px',
                        padding: '2px',
                        marginLeft: 'auto',
                        flexShrink: 0
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                      title="View on Etherscan"
                    >
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: isLight ? 'var(--theme-text-primary)' : '#C97413',
                        opacity: 0.8
                      }}>
                        TX
                      </span>
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
                    background: tx.positive ? '#22c55e' : '#ef4444',
                    color: 'white',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {tx.positive ? <BuyArrow size={10} /> : <SellArrow size={10} />}
                  </div>
                  
                  <span style={{
                    fontSize: 'clamp(11px, 2vw, 13px)',
                    fontWeight: 800,
                    color: tx.positive ? '#22c55e' : '#ef4444',
                    textTransform: 'uppercase',
                    minWidth: '28px',
                    flexShrink: 0
                  }}>
                    {tx.type}
                  </span>
                  
                  <span style={{
                    fontSize: 'clamp(11px, 2vw, 13px)',
                    fontWeight: 700,
                    color: isLight ? 'var(--theme-text-primary)' : '#C97413',
                    flexShrink: 0
                  }}>
                    {tx.amount}
                  </span>
                  
                  <span style={{
                    fontSize: 'clamp(9px, 1.8vw, 11px)',
                    color: isLight ? '#5c4033' : '#C97413',
                    opacity: 0.8,
                    flexShrink: 0
                  }}>
                    ({tx.ethAmount})
                  </span>
                  
                  <span style={{
                    fontSize: 'clamp(9px, 1.8vw, 11px)',
                    color: isLight ? '#5c4033' : '#C97413',
                    opacity: 0.7,
                    flexShrink: 0
                  }}>
                    {tx.time}
                  </span>
                  
                  <span style={{
                    fontSize: 'clamp(9px, 1.8vw, 11px)',
                    color: isLight ? '#856d57' : '#ffe0b6',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    From:
                  </span>
                  
                  <button
                    onClick={() => copyToClipboard(tx.address, `address-${index}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedItem === `address-${index}` ? (isLight ? '#16a34a' : '#86efac') : (isLight ? '#5c4033' : '#C97413'),
                      fontSize: 'clamp(9px, 1.8vw, 11px)',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      padding: '0',
                      flexShrink: 0
                    }}
                    title="Click to copy address"
                  >
                    {copiedItem === `address-${index}` ? '✓' : `${tx.address.slice(0, 6)}...${tx.address.slice(-4)}`}
                  </button>
                  
                  <span style={{
                    fontSize: 'clamp(12px, 2.2vw, 14px)',
                    fontWeight: 400,
                    color: isLight ? 'var(--theme-text-primary)' : '#C97413',
                    marginLeft: 'auto',
                    flexShrink: 0
                  }}>
                    {tx.price}
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
          ))}
        </div>
      </div>
      </div>
    </>
  );
};
