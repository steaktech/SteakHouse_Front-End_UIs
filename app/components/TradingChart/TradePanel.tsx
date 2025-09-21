"use client";

import React, { useState } from 'react';

// EthereumIcon component
const EthereumIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 256 417" fill="currentColor">
    <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" fill="#343434" />
    <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" fill="#8C8C8C" />
    <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" fill="#3C3C3B" />
    <path d="M127.962 416.905v-104.72L0 236.585z" fill="#8C8C8C" />
    <path d="M127.961 287.958l127.96-75.637-127.96-58.162z" fill="#141414" />
    <path d="M0 212.32l127.96 75.638v-133.8z" fill="#393939" />
  </svg>
);

// QuestionMarkIcon component
const QuestionMarkIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
  </svg>
);

export const TradePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('0');

  // Dynamic quick amounts based on buy/sell mode
  const quickAmounts = activeTab === 'buy' 
    ? ['0.1 ETH', '0.5 ETH', '1 ETH', 'Max']
    : ['25%', '50%', '75%', '100%'];

  const handleQuickAmount = (value: string) => {
    if (activeTab === 'buy') {
      if (value === 'Max') {
        setAmount('10.0'); // Example max amount
      } else {
        setAmount(value.split(' ')[0]);
      }
    } else {
      // For sell mode, handle percentage values
      if (value === '25%') {
        setAmount('25');
      } else if (value === '50%') {
        setAmount('50');
      } else if (value === '75%') {
        setAmount('75');
      } else if (value === '100%') {
        setAmount('100');
      }
    }
  };

  return (
    <>
      <style>{`
        .no-spinner::-webkit-outer-spin-button,
        .no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
          display: none;
        }
        .no-spinner {
          -moz-appearance: textfield;
          -webkit-appearance: none;
          appearance: none;
        }
        .no-spinner::-ms-clear {
          display: none;
        }
      `}</style>
      <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      borderRadius: 'clamp(18px, 2.5vw, 26px)',
      background: 'linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      padding: 'clamp(12px, 2vh, 16px)',
      border: '1px solid rgba(255, 215, 165, 0.4)',
      overflow: 'hidden',
      color: '#fff7ea',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }}>
      {/* Buy/Sell Tabs - Premium Style */}
      <div style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: 'clamp(48px, 8vh, 54px)',
        borderRadius: 'clamp(14px, 3vw, 20px)',
        background: 'linear-gradient(180deg, #7f4108, #6f3906)',
        border: '1px solid rgba(255, 215, 165, 0.4)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        marginBottom: 'clamp(8px, 1.5vh, 12px)',
        padding: '4px'
      }}>
        {/* Sliding Background */}
        <div style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          height: 'calc(100% - 4px)',
          width: 'calc(50% - 2px)',
          borderRadius: 'clamp(10px, 2.5vw, 16px)',
          transition: 'all 300ms ease-in-out',
          transform: activeTab === 'buy' ? 'translateX(0)' : 'translateX(calc(100% + 2px))',
          background: activeTab === 'buy'
            ? 'linear-gradient(180deg, #4ade80, #22c55e)'
            : 'linear-gradient(180deg, #f87171, #ef4444)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)'
        }} />
        <button
          onClick={() => setActiveTab('buy')}
          style={{
            position: 'relative',
            zIndex: 10,
            flex: 1,
            padding: 'clamp(8px, 1.5vh, 12px)',
            textAlign: 'center',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            fontWeight: 800,
            color: activeTab === 'buy' ? '#1f2937' : '#feea88',
            background: 'transparent',
            border: 'none',
            borderRadius: 'clamp(10px, 2.5vw, 16px)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            marginRight: '2px'
          }}
        >
          BUY
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          style={{
            position: 'relative',
            zIndex: 10,
            flex: 1,
            padding: 'clamp(8px, 1.5vh, 12px)',
            textAlign: 'center',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            fontWeight: 800,
            color: activeTab === 'sell' ? '#1f2937' : '#feea88',
            background: 'transparent',
            border: 'none',
            borderRadius: 'clamp(10px, 2.5vw, 16px)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            marginLeft: '2px'
          }}
        >
          SELL
        </button>
      </div>

      {/* Action Links - All on same line */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'clamp(8px, 1.5vh, 12px)',
        gap: 'clamp(6px, 1.5vw, 12px)',
        flexWrap: 'wrap'
      }}>
        <button style={{
          background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
          border: '1px solid rgba(255, 210, 160, 0.4)',
          borderRadius: 'clamp(10px, 2.2vw, 14px)',
          padding: 'clamp(6px, 1.2vh, 8px) clamp(12px, 2.4vw, 16px)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          color: '#feea88',
          fontSize: 'clamp(10px, 1.8vw, 13px)',
          fontWeight: 800,
          cursor: 'pointer',
          transition: 'all 200ms ease',
          flex: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>Buy max TX</button>

        <button style={{
          background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
          border: '1px solid rgba(255, 210, 160, 0.4)',
          borderRadius: 'clamp(10px, 2.2vw, 14px)',
          padding: 'clamp(6px, 1.2vh, 8px) clamp(12px, 2.4vw, 16px)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          color: '#feea88',
          fontSize: 'clamp(10px, 1.8vw, 13px)',
          fontWeight: 800,
          cursor: 'pointer',
          transition: 'all 200ms ease',
          flex: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>Set max slippage</button>
      </div>

      {/* Amount Input */}
      <div style={{
        position: 'relative',
        marginBottom: 'clamp(8px, 1.5vh, 12px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'relative',
          background: 'linear-gradient(180deg, #7f4108, #6f3906)',
          border: '1px solid rgba(255, 215, 165, 0.4)',
          borderRadius: 'clamp(14px, 3vw, 20px)',
          padding: '4px',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)'
        }}>
          <input
            type="text"
            className="no-spinner"
            value={amount}
            onChange={(e) => {
              // Only allow numbers and decimal point
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setAmount(value);
              }
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2))',
              color: '#feea88',
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: 800,
              padding: 'clamp(10px, 2vh, 14px) clamp(50px, 10vw, 60px) clamp(10px, 2vh, 14px) clamp(16px, 3vh, 20px)',
              borderRadius: 'clamp(10px, 2.5vw, 16px)',
              border: `2px solid ${activeTab === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
              outline: 'none',
              textAlign: 'left',
              fontFamily: '"Sora", "Inter", sans-serif',
              transition: 'all 200ms ease',
              boxSizing: 'border-box'
            }}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="0"
            onFocus={(e) => {
              e.target.style.border = `2px solid ${activeTab === 'buy' ? '#4ade80' : '#f87171'}`;
              e.target.style.boxShadow = `0 0 0 2px ${activeTab === 'buy' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`;
            }}
            onBlur={(e) => {
              e.target.style.border = `2px solid ${activeTab === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`;
              e.target.style.boxShadow = 'none';
            }}
          />
          <button style={{
            position: 'absolute',
            right: 'clamp(8px, 1.5vw, 12px)',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(180deg, #ffe49c, #ffc96a)',
            borderRadius: '50%',
            padding: 'clamp(8px, 1.5vw, 10px)',
            color: '#3a200f',
            border: '1px solid rgba(140, 85, 35, 0.28)',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            {activeTab === 'buy' ? <EthereumIcon /> : <QuestionMarkIcon />}
          </button>
        </div>
      </div>

      {/* Preset Amounts - All on same line */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'clamp(6px, 1vh, 10px)',
        gap: 'clamp(4px, 1vw, 8px)'
      }}>
        {quickAmounts.map((preset) => (
          <button
            key={preset}
            onClick={() => handleQuickAmount(preset)}
            style={{
              background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
              border: '1px solid rgba(255, 210, 160, 0.4)',
              borderRadius: 'clamp(10px, 2vw, 14px)',
              padding: 'clamp(12px, 2.2vh, 16px) clamp(8px, 1.6vw, 12px)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              color: '#feea88',
              fontSize: 'clamp(11px, 1.9vw, 14px)',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 200ms ease',
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minHeight: 'clamp(42px, 8vh, 48px)'
            }}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Confirm Button */}
      <button
        style={{
          width: '100%',
          background: activeTab === 'buy'
            ? 'linear-gradient(180deg, #4ade80, #22c55e)'
            : 'linear-gradient(180deg, #f87171, #ef4444)',
          color: '#1f2937',
          fontWeight: 800,
          fontSize: 'clamp(13px, 2.4vw, 16px)',
          padding: 'clamp(10px, 2vh, 14px)',
          borderRadius: 'clamp(14px, 3vw, 20px)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 200ms ease',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)',
          textShadow: '0 1px 0 rgba(255, 255, 255, 0.3)',
          marginTop: 'auto',
          flexShrink: 0,
          letterSpacing: '0.5px',
          minHeight: 'clamp(40px, 6vh, 46px)'
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
        CONFIRM TRADE
      </button>
      </div>
    </>
  );
};
