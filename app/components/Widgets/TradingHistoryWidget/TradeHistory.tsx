import React from 'react';
import type { Trade, FullTokenDataResponse } from '@/app/types/token';

interface TradeHistoryProps {
  tokenAddress: string;
  tokenData: FullTokenDataResponse | null;
  isLoading: boolean;
  error: string | null;
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({ tokenAddress, tokenData, isLoading, error }) => {

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
        fontSize: 'clamp(18px, 3vw, 22px)',
        lineHeight: 1,
        margin: '0 0 clamp(12px, 2vh, 16px) 0',
        textShadow: '0 1px 0 rgba(0, 0, 0, 0.18)'
      }}>
        Trade History
      </h3>
      
      {/* Table Container with Premium Styling */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(180deg, #3a1c08, #2d1506)',
        border: '1px solid rgba(255, 215, 165, 0.4)',
        borderRadius: 'clamp(14px, 3vw, 20px)',
        padding: 'clamp(12px, 2.5vh, 16px)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        overflow: 'hidden'
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
          <div className="trade-history-scrollbar" style={{ overflowX: 'auto', overflowY: 'auto', height: '100%' }}>
            <table style={{ width: '100%', textAlign: 'left', fontSize: 'clamp(12px, 2.2vw, 14px)' }}>
              <thead>
                <tr>
                  <th style={{ padding: 'clamp(8px, 1.5vh, 12px)', fontWeight: 800, fontSize: 'clamp(11px, 1.8vw, 13px)', color: '#ffe0b6', borderBottom: '1px solid rgba(255, 215, 165, 0.2)' }}>Date</th>
                  <th style={{ padding: 'clamp(8px, 1.5vh, 12px)', fontWeight: 800, fontSize: 'clamp(11px, 1.8vw, 13px)', color: '#ffe0b6', borderBottom: '1px solid rgba(255, 215, 165, 0.2)' }}>Type</th>
                  <th style={{ padding: 'clamp(8px, 1.5vh, 12px)', fontWeight: 800, fontSize: 'clamp(11px, 1.8vw, 13px)', color: '#ffe0b6', borderBottom: '1px solid rgba(255, 215, 165, 0.2)' }}>Amount ETH</th>
                  <th style={{ padding: 'clamp(8px, 1.5vh, 12px)', fontWeight: 800, fontSize: 'clamp(11px, 1.8vw, 13px)', color: '#ffe0b6', borderBottom: '1px solid rgba(255, 215, 165, 0.2)' }}>Amount Tokens</th>
                  <th style={{ padding: 'clamp(8px, 1.5vh, 12px)', fontWeight: 800, fontSize: 'clamp(11px, 1.8vw, 13px)', color: '#ffe0b6', borderBottom: '1px solid rgba(255, 215, 165, 0.2)' }}>USD Value</th>
                  <th style={{ padding: 'clamp(8px, 1.5vh, 12px)', fontWeight: 800, fontSize: 'clamp(11px, 1.8vw, 13px)', color: '#ffe0b6', borderBottom: '1px solid rgba(255, 215, 165, 0.2)' }}>TX</th>
                </tr>
              </thead>
              <tbody>
                {tokenData?.recentTrades?.length ? (
                  tokenData.recentTrades.map((trade: Trade, index: number) => (
                    <tr key={`${trade.txHash}-${index}`} style={{ borderBottom: index < tokenData.recentTrades.length - 1 ? '1px solid rgba(255, 215, 165, 0.1)' : 'none' }}>
                      <td style={{ padding: 'clamp(8px, 1.5vh, 12px)', color: '#feea88', fontWeight: 600, fontSize: 'clamp(11px, 1.8vw, 13px)' }}>{formatDate(trade.timestamp)}</td>
                      <td style={{ padding: 'clamp(8px, 1.5vh, 12px)', fontWeight: 800, fontSize: 'clamp(11px, 1.8vw, 13px)', color: trade.type === 'BUY' ? '#4ade80' : '#f87171', textTransform: 'uppercase' }}>
                        {trade.type}
                      </td>
                      <td style={{ padding: 'clamp(8px, 1.5vh, 12px)', fontWeight: 700, fontSize: 'clamp(11px, 1.8vw, 13px)', color: trade.type === 'BUY' ? '#4ade80' : '#f87171' }}>{formatNumber(trade.amountEth)}</td>
                      <td style={{ padding: 'clamp(8px, 1.5vh, 12px)', fontWeight: 700, fontSize: 'clamp(11px, 1.8vw, 13px)', color: trade.type === 'BUY' ? '#4ade80' : '#f87171' }}>{formatNumber(trade.amountTokens)}</td>
                      <td style={{ padding: 'clamp(8px, 1.5vh, 12px)', fontWeight: 700, fontSize: 'clamp(11px, 1.8vw, 13px)', color: trade.type === 'BUY' ? '#4ade80' : '#f87171' }}>{formatUSD(trade.usdValue)}</td>
                      <td style={{ padding: 'clamp(8px, 1.5vh, 12px)', color: '#feea88', fontWeight: 600, fontSize: 'clamp(10px, 1.6vw, 12px)', fontFamily: 'monospace' }}>
                        <a 
                          href={`https://etherscan.io/tx/${trade.txHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            color: '#feea88',
                            textDecoration: 'none',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#fff1dc'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#feea88'}
                        >
                          {formatTxHash(trade.txHash)}
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: 'clamp(24px, 4vh, 32px)', textAlign: 'center', color: '#ffe0b6', fontSize: 'clamp(14px, 2.5vw, 16px)', fontWeight: 600, opacity: 0.8 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(8px, 1.5vh, 12px)' }}>
                        <div style={{ fontSize: 'clamp(32px, 5vw, 48px)', opacity: 0.5 }}>📊</div>
                        <div>No trade history available</div>
                        <div style={{ fontSize: 'clamp(12px, 2vw, 14px)', opacity: 0.6, fontWeight: 400 }}>Trade history will appear here once transactions are made</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
