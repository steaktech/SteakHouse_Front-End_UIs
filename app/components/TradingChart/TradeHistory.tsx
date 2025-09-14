import React from 'react';

// Mock data for the new trade history format
const tradeHistoryData = [
  { id: 1, date: 'Jul 31 07:20:59', type: 'buy', amountETH: '0.034', amountPECA: '20,219,045.00', tx: '0x68a3...7404' },
  { id: 2, date: 'Jul 31 07:20:59', type: 'buy', amountETH: '0.034', amountPECA: '20,219,045.00', tx: '0x68a3...7404' },
  { id: 3, date: 'Jul 31 07:20:59', type: 'sell', amountETH: '0.567', amountPECA: '57,219,045.00', tx: '0x68a3...7404' },
  { id: 4, date: 'Jul 31 07:20:59', type: 'buy', amountETH: '0.078', amountPECA: '65,200,005.00', tx: '0x68a3...7404' },
];

export const TradeHistory: React.FC = () => {
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
        <div style={{ overflowX: 'auto', overflowY: 'auto', height: '100%' }}>
          <table style={{ width: '100%', textAlign: 'left', fontSize: 'clamp(12px, 2.2vw, 14px)' }}>
            <thead>
              <tr>
                <th style={{
                  padding: 'clamp(8px, 1.5vh, 12px)',
                  fontWeight: 800,
                  fontSize: 'clamp(11px, 1.8vw, 13px)',
                  color: '#ffe0b6',
                  borderBottom: '1px solid rgba(255, 215, 165, 0.2)'
                }}>Date</th>
                <th style={{
                  padding: 'clamp(8px, 1.5vh, 12px)',
                  fontWeight: 800,
                  fontSize: 'clamp(11px, 1.8vw, 13px)',
                  color: '#ffe0b6',
                  borderBottom: '1px solid rgba(255, 215, 165, 0.2)'
                }}>Type</th>
                <th style={{
                  padding: 'clamp(8px, 1.5vh, 12px)',
                  fontWeight: 800,
                  fontSize: 'clamp(11px, 1.8vw, 13px)',
                  color: '#ffe0b6',
                  borderBottom: '1px solid rgba(255, 215, 165, 0.2)'
                }}>Amount ETH</th>
                <th style={{
                  padding: 'clamp(8px, 1.5vh, 12px)',
                  fontWeight: 800,
                  fontSize: 'clamp(11px, 1.8vw, 13px)',
                  color: '#ffe0b6',
                  borderBottom: '1px solid rgba(255, 215, 165, 0.2)'
                }}>Amount PECA</th>
                <th style={{
                  padding: 'clamp(8px, 1.5vh, 12px)',
                  fontWeight: 800,
                  fontSize: 'clamp(11px, 1.8vw, 13px)',
                  color: '#ffe0b6',
                  borderBottom: '1px solid rgba(255, 215, 165, 0.2)'
                }}>TX</th>
              </tr>
            </thead>
            <tbody>
              {tradeHistoryData.map((trade, index) => (
                <tr key={trade.id} style={{
                  borderBottom: index < tradeHistoryData.length - 1 ? '1px solid rgba(255, 215, 165, 0.1)' : 'none'
                }}>
                  <td style={{
                    padding: 'clamp(8px, 1.5vh, 12px)',
                    color: '#feea88',
                    fontWeight: 600,
                    fontSize: 'clamp(11px, 1.8vw, 13px)'
                  }}>{trade.date}</td>
                  <td style={{
                    padding: 'clamp(8px, 1.5vh, 12px)',
                    fontWeight: 800,
                    fontSize: 'clamp(11px, 1.8vw, 13px)',
                    color: trade.type === 'buy' ? '#4ade80' : '#f87171',
                    textTransform: 'uppercase'
                  }}>
                    {trade.type}
                  </td>
                  <td style={{
                    padding: 'clamp(8px, 1.5vh, 12px)',
                    fontWeight: 700,
                    fontSize: 'clamp(11px, 1.8vw, 13px)',
                    color: trade.type === 'buy' ? '#4ade80' : '#f87171'
                  }}>{trade.amountETH}</td>
                  <td style={{
                    padding: 'clamp(8px, 1.5vh, 12px)',
                    fontWeight: 700,
                    fontSize: 'clamp(11px, 1.8vw, 13px)',
                    color: trade.type === 'buy' ? '#4ade80' : '#f87171'
                  }}>{trade.amountPECA}</td>
                  <td style={{
                    padding: 'clamp(8px, 1.5vh, 12px)',
                    color: '#feea88',
                    fontWeight: 600,
                    fontSize: 'clamp(10px, 1.6vw, 12px)',
                    fontFamily: 'monospace'
                  }}>{trade.tx}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
