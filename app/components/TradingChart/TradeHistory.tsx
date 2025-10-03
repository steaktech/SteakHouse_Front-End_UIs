import React, { useState } from 'react';

// Mock data matching the mobile transaction format for consistency
const tradeHistoryData = [
  { 
    type: 'Buy', 
    amount: '1.25K ASTER', 
    ethAmount: '0.0032 ETH',
    price: '$1.43', 
    time: '2m ago',
    fullDate: '2024-01-15 14:23:45 UTC',
    address: '0x742d35Cc6C4b73C2C4c02B8b8f42e62e2E5F6f12',
    txHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    positive: true 
  },
  { 
    type: 'Sell', 
    amount: '850 ASTER', 
    ethAmount: '0.0025 ETH',
    price: '$1.44', 
    time: '5m ago',
    fullDate: '2024-01-15 14:18:12 UTC',
    address: '0x8f9e2a1b3c4d5e6f7890123456789012345678ab',
    txHash: '0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
    positive: false 
  },
  { 
    type: 'Buy', 
    amount: '2.1K ASTER', 
    ethAmount: '0.0055 ETH',
    price: '$1.42', 
    time: '8m ago',
    fullDate: '2024-01-15 14:15:33 UTC',
    address: '0x123456789012345678901234567890123456789a',
    txHash: '0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef123456789a',
    positive: true 
  },
  { 
    type: 'Sell', 
    amount: '750 ASTER', 
    ethAmount: '0.0021 ETH',
    price: '$1.45', 
    time: '12m ago',
    fullDate: '2024-01-15 14:11:07 UTC',
    address: '0xabcdef1234567890123456789012345678901234',
    txHash: '0xd4e5f6789012345678901234567890abcdef1234567890abcdef123456789abc',
    positive: false 
  },
  { 
    type: 'Buy', 
    amount: '3.2K ASTER', 
    ethAmount: '0.0089 ETH',
    price: '$1.41', 
    time: '15m ago',
    fullDate: '2024-01-15 14:08:19 UTC',
    address: '0x567890123456789012345678901234567890abcd',
    txHash: '0xe5f6789012345678901234567890abcdef1234567890abcdef123456789abcde',
    positive: true 
  },
  { 
    type: 'Sell', 
    amount: '1.8K ASTER', 
    ethAmount: '0.0048 ETH',
    price: '$1.46', 
    time: '18m ago',
    fullDate: '2024-01-15 14:05:42 UTC',
    address: '0x9012345678901234567890123456789012345678',
    txHash: '0xf6789012345678901234567890abcdef1234567890abcdef123456789abcdef1',
    positive: false 
  },
];

export const TradeHistory: React.FC = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'size-desc' | 'size-asc' | 'address'>('time');
  const [addressFilter, setAddressFilter] = useState<string>('');

  // Filter and sort transactions
  const getFilteredAndSortedTransactions = () => {
    let filtered = tradeHistoryData;
    
    // Filter by type (buy/sell)
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type.toLowerCase() === filterType);
    }
    
    // Filter by address if specified
    if (addressFilter.trim()) {
      filtered = filtered.filter(tx => 
        tx.address.toLowerCase().includes(addressFilter.toLowerCase().trim())
      );
    }
    
    // Sort transactions
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'time':
          // Assuming more recent transactions have higher time values, reverse for newest first
          return tradeHistoryData.indexOf(a) - tradeHistoryData.indexOf(b);
        case 'size-desc':
          // Extract numeric value from amount string (e.g., "1.25K" -> 1250)
          const aValue = parseFloat(a.amount.replace(/[^0-9.]/g, '')) * (a.amount.includes('K') ? 1000 : 1);
          const bValue = parseFloat(b.amount.replace(/[^0-9.]/g, '')) * (b.amount.includes('K') ? 1000 : 1);
          return bValue - aValue;
        case 'size-asc':
          const aValueAsc = parseFloat(a.amount.replace(/[^0-9.]/g, '')) * (a.amount.includes('K') ? 1000 : 1);
          const bValueAsc = parseFloat(b.amount.replace(/[^0-9.]/g, '')) * (b.amount.includes('K') ? 1000 : 1);
          return aValueAsc - bValueAsc;
        case 'address':
          return a.address.localeCompare(b.address);
        default:
          return 0;
      }
    });
    
    return sorted;
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
      {/* Header */}
      <h3 style={{
        color: '#feea88',
        fontFamily: '"Sora", "Inter", sans-serif',
        fontWeight: 800,
        fontSize: 'clamp(14px, 2.5vw, 16px)',
        lineHeight: 1,
        margin: '0 0 clamp(8px, 1.5vh, 12px) 0',
        textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
      }}>
        Recent Transactions
      </h3>
      
      {/* Filter and Sort Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: 'clamp(12px, 2vh, 16px)',
        flexWrap: 'wrap',
        padding: 'clamp(10px, 2vh, 14px) clamp(14px, 3vh, 18px)',
        background: 'linear-gradient(180deg, rgba(87, 37, 1, 0.4), rgba(87, 37, 1, 0.3) 50%, rgba(87, 37, 1, 0.35) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))',
        border: '1px solid rgba(255, 215, 165, 0.25)',
        borderRadius: 'clamp(10px, 2vw, 14px)',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
      }}>
        {/* Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ 
            fontSize: 'clamp(11px, 2vw, 13px)', 
            color: '#feea88', 
            fontWeight: 800,
            textShadow: '0 1px 0 rgba(0, 0, 0, 0.4)',
            letterSpacing: '0.3px'
          }}>TYPE</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'buy' | 'sell')}
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
              minWidth: '65px',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 4px rgba(0, 0, 0, 0.2)',
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.3)'
            }}
          >
            <option value="all" style={{ background: '#2d1506', color: '#feea88' }}>All</option>
            <option value="buy" style={{ background: '#2d1506', color: '#feea88' }}>Buy</option>
            <option value="sell" style={{ background: '#2d1506', color: '#feea88' }}>Sell</option>
          </select>
        </div>
        
        {/* Sort By */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ 
            fontSize: 'clamp(11px, 2vw, 13px)', 
            color: '#feea88', 
            fontWeight: 800,
            textShadow: '0 1px 0 rgba(0, 0, 0, 0.4)',
            letterSpacing: '0.3px'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ 
            fontSize: 'clamp(11px, 2vw, 13px)', 
            color: '#feea88', 
            fontWeight: 800,
            textShadow: '0 1px 0 rgba(0, 0, 0, 0.4)',
            letterSpacing: '0.3px'
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
          {getFilteredAndSortedTransactions().length} TRANSACTIONS
        </span>
      </div>
      
      {/* Card Container with Premium Styling matching mobile */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(180deg, #3a1c08, #2d1506)',
        border: '1px solid rgba(255, 215, 165, 0.4)',
        borderRadius: 'clamp(14px, 3vw, 20px)',
        padding: 'clamp(12px, 2.5vh, 16px)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {getFilteredAndSortedTransactions().map((tx, index) => (
            <div key={index} style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'rgba(87, 37, 1, 0.3)',
              border: '1px solid rgba(255, 215, 165, 0.2)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '32px'
            }}>
              {/* Left side - Transaction info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                {/* Compact Buy/Sell Icon */}
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  border: '1px solid',
                  background: tx.positive 
                    ? 'linear-gradient(to right, #4ade80, #22c55e)' 
                    : 'linear-gradient(to right, #ef4444, #dc2626)',
                  color: tx.positive ? 'black' : 'white',
                  borderColor: tx.positive ? '#86efac' : '#fca5a5',
                  flexShrink: 0
                }}>
                  {tx.positive ? '\u2197' : '\u2198'}
                </div>
                
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: tx.positive ? '#4ade80' : '#f87171',
                  textTransform: 'uppercase',
                  minWidth: '30px',
                  flexShrink: 0
                }}>
                  {tx.type.toUpperCase()}
                </span>
                
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#feea88', flexShrink: 0 }}>{tx.amount}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#feea88', flexShrink: 0 }}>({tx.ethAmount})</span>
                
                <span style={{ color: '#ffe0b6', opacity: 0.9, fontSize: '11px', marginLeft: '8px' }}>From:</span>
                <button
                  onClick={() => copyToClipboard(tx.address, `address-${index}`)}
                  style={{
                    fontFamily: 'monospace',
                    padding: '1px 4px',
                    borderRadius: '3px',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    fontSize: '10px',
                    border: 'none',
                    background: copiedItem === `address-${index}` ? 'rgba(34, 197, 94, 0.4)' : 'rgba(0, 0, 0, 0.2)',
                    color: copiedItem === `address-${index}` ? '#86efac' : '#feea88',
                    flexShrink: 0
                  }}
                  title="Click to copy address"
                >
                  {copiedItem === `address-${index}` ? '\u2713' : `${tx.address.slice(0, 4)}...${tx.address.slice(-3)}`}
                </button>
              </div>
              
              {/* Right side - Price, time, and Etherscan */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#feea88' }}>{tx.time}</span>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#feea88' }}>{tx.price}</div>
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
                    padding: 0
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  title="View on Etherscan"
                >
                  <img 
                    src="/images/etherscan_logo.webp" 
                    alt="Etherscan" 
                    style={{ width: '14px', height: '14px' }}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
