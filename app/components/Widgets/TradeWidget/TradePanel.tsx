"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useWallet } from '@/app/hooks/useWallet';
import { useTrading } from '@/app/hooks/useTrading';
import { getMaxTxInfo, extractEthToCurve } from '@/app/lib/api/services/blockchainService';
import { useToastHelpers } from '@/app/hooks/useToast';
import WalletTopUpModal from '@/app/components/Modals/WalletTopUpModal/WalletTopUpModal';

const WalletModal = dynamic(
  () => import("../../Modals/WalletModal/WalletModal"),
  { ssr: false }
);

// EthereumIcon component remains the same
const EthereumIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 256 417" fill="currentColor">
    <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" fill="#343434"/>
    <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" fill="#8C8C8C"/>
    <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" fill="#3C3C3B"/>
    <path d="M127.962 416.905v-104.72L0 236.585z" fill="#8C8C8C"/>
    <path d="M127.961 287.958l127.96-75.637-127.96-58.162z" fill="#141414"/>
    <path d="M0 212.32l127.96 75.638v-133.8z" fill="#393939"/>
  </svg>
);

const QuestionMarkIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
  </svg>
);

interface TradePanelProps {
  tokenAddress?: string;
  defaultTab?: 'buy' | 'sell' | 'limit';
  isMobile?: boolean;
  onTabChange?: (tab: 'buy' | 'sell' | 'limit') => void;
}

export const TradePanel: React.FC<TradePanelProps> = ({ 
  tokenAddress = "0x9b7E4E284487952c14891865A11C063886e2c6Ce",
  defaultTab = 'buy',
  isMobile = false,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'limit'>(defaultTab);
  const [amount, setAmount] = useState('0');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isLoadingMaxTx, setIsLoadingMaxTx] = useState(false);
  
  const { isConnected, isConnecting } = useWallet();
  const { tradingState, buyToken, sellToken, clearStatus, isReady, topUpTradingWallet } = useTrading();
  const { showError, showSuccess } = useToastHelpers();

  // Limit order UI state (non-breaking addition)
  const [limitPrice, setLimitPrice] = useState('');
  const [limitSide, setLimitSide] = useState<'buy' | 'sell'>('buy');

  // Top-up Modal state
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  // Gate to avoid repeated toasts/modals
  const hasShownTopUpRef = React.useRef(false);
  React.useEffect(() => {
    if (tradingState.canTopUp && !hasShownTopUpRef.current) {
      if (tradingState.topUpSuggestionEth) setTopUpAmount(tradingState.topUpSuggestionEth);
      showError('Trading wallet has insufficient funds. Please top up to continue.', 'Insufficient funds');
      setIsTopUpModalOpen(true);
      hasShownTopUpRef.current = true;
    } else if (!tradingState.canTopUp) {
      hasShownTopUpRef.current = false;
    }
  }, [tradingState.canTopUp, tradingState.topUpSuggestionEth]);

  // Keep active tab in sync with defaultTab prop (supports 'limit' too)
  React.useEffect(() => {
    setActiveTab(defaultTab as 'buy' | 'sell' | 'limit');
  }, [defaultTab]);

  const handleTabChange = (tab: 'buy' | 'sell' | 'limit') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const quickAmounts = ['0.1 ETH', '0.5 ETH', '1 ETH', 'Max'];

  const handleQuickAmount = (value: string) => {
    if (value === 'Reset') {
      setAmount('0');
    } else if (value === 'Max') {
      setAmount('10.0'); // Example max amount
    } else {
      setAmount(value.split(' ')[0]);
    }
  };

  // Handle Buy max TX functionality
  const handleBuyMaxTx = async () => {
    setIsLoadingMaxTx(true);

    try {
      console.log('🔍 Fetching max TX info for token:', tokenAddress);
      const maxTxData = await getMaxTxInfo(tokenAddress);
      
      const ethToCurve = extractEthToCurve(maxTxData);
      
      if (ethToCurve) {
        setAmount(ethToCurve);
        console.log('✅ Set amount to max TX ethToCurve:', ethToCurve);
        showSuccess(`Max TX amount set: ${ethToCurve} ETH`, 'Buy Max TX');
      } else {
        console.warn('⚠️ No ethToCurve value available in max TX response');
        showError('Max TX data not available for this token', 'Buy Max TX Failed');
      }
    } catch (error) {
      console.error('❌ Error fetching max TX info:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch max TX data';
      showError(errorMessage, 'Buy Max TX Failed');
    } finally {
      setIsLoadingMaxTx(false);
    }
  };

  // Handle the actual trading when user confirms
  const handleConfirmTrade = async () => {
    if (!isConnected) {
      setIsWalletModalOpen(true);
      return;
    }

    if (tradingState.isTrading) {
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      return;
    }

    clearStatus();

    try {
      if (activeTab === 'buy') {
        await buyToken(tokenAddress, amount);
      } else {
        await sellToken(tokenAddress, amount);
      }
    } catch (error) {
      console.error('❌ Trade execution failed:', error);
      const msg = (error as any)?.message || 'Trade failed';
      showError(msg, 'Trade Failed');
    }
  };

  const handleTopUp = async () => {
    if (!isConnected) {
      setIsWalletModalOpen(true);
      return;
    }
    if (!tradingState.tradingWallet) {
      showError('Trading wallet not set up yet. Please contact support.', 'Top Up Failed');
      return;
    }
    if (!topUpAmount || isNaN(Number(topUpAmount)) || Number(topUpAmount) <= 0) {
      showError('Enter a valid amount in ETH', 'Top Up');
      return;
    }
    try {
      setIsToppingUp(true);
      const txHash = await topUpTradingWallet(topUpAmount);
      if (txHash) {
        showSuccess(`Top up sent: ${txHash.slice(0, 10)}...`, 'Top Up');
      }
    } catch (e) {
      const msg = (e as any)?.message || 'Failed to top up';
      showError(msg, 'Top Up Failed');
    } finally {
      setIsToppingUp(false);
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
      height: activeTab === 'limit' ? 'fit-content' : '100%',
      minHeight: activeTab === 'limit' ? 'auto' : undefined,
      position: 'relative',
      borderRadius: 'clamp(18px, 2.5vw, 26px)',
      background: 'linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      padding: 'clamp(16px, 3vh, 22px)',
      border: '1px solid rgba(255, 215, 165, 0.4)',
      overflow: activeTab === 'limit' ? 'visible' : 'hidden',
      color: '#fff7ea',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      transition: 'height 300ms ease, padding 300ms ease'
    }}>
      {/* Buy/Sell/Limit Tabs - Premium Style (from backup) */}
      <div style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: isMobile ? '40px' : 'clamp(48px, 8vh, 54px)',
        borderRadius: isMobile ? '16px' : 'clamp(14px, 3vw, 20px)',
        background: 'linear-gradient(180deg, #7f4108, #6f3906)',
        border: '1px solid rgba(255, 215, 165, 0.4)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        marginBottom: isMobile ? '10px' : 'clamp(12px, 2vh, 16px)',
        padding: '4px'
      }}>
        {/* Sliding Background */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '4px' : '4px',
          left: activeTab === 'buy' 
            ? '4px' 
            : activeTab === 'sell' 
              ? 'calc(33.333% + 2px)' 
              : 'calc(66.666% - 2px)',
          height: 'calc(100% - 8px)',
          width: 'calc(33.333% - 2.67px)',
          borderRadius: isMobile ? '12px' : 'clamp(10px, 2.5vw, 16px)',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          background: activeTab === 'buy'
            ? 'linear-gradient(180deg, #4ade80, #22c55e)'
            : activeTab === 'sell'
              ? 'linear-gradient(180deg, #f87171, #ef4444)'
              : 'linear-gradient(180deg, #ffd700, #daa20b)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        }} />
        <button
          onClick={() => handleTabChange('buy')}
          style={{
            position: 'relative',
            zIndex: 10,
            flex: 1,
            padding: isMobile ? '8px' : 'clamp(8px, 1.5vh, 12px)',
            textAlign: 'center',
            fontSize: isMobile ? '12px' : 'clamp(14px, 2.5vw, 16px)',
            fontWeight: 800,
            color: activeTab === 'buy' ? '#1f2937' : '#feea88',
            background: 'transparent',
            border: 'none',
            borderRadius: isMobile ? '12px' : 'clamp(10px, 2.5vw, 16px)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            marginRight: '2px'
          }}
        >
          BUY
        </button>
        <button
          onClick={() => handleTabChange('sell')}
          style={{
            position: 'relative',
            zIndex: 10,
            flex: 1,
            padding: isMobile ? '8px' : 'clamp(8px, 1.5vh, 12px)',
            textAlign: 'center',
            fontSize: isMobile ? '12px' : 'clamp(14px, 2.5vw, 16px)',
            fontWeight: 800,
            color: activeTab === 'sell' ? '#1f2937' : '#feea88',
            background: 'transparent',
            border: 'none',
            borderRadius: isMobile ? '12px' : 'clamp(10px, 2.5vw, 16px)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            marginLeft: '2px'
          }}
        >
          SELL
        </button>
        <button
          onClick={() => handleTabChange('limit')}
          style={{
            position: 'relative',
            zIndex: 10,
            flex: 1,
            padding: isMobile ? '8px' : 'clamp(8px, 1.5vh, 12px)',
            textAlign: 'center',
            fontSize: isMobile ? '12px' : 'clamp(14px, 2.5vw, 16px)',
            fontWeight: 800,
            color: activeTab === 'limit' ? '#1f2937' : '#feea88',
            background: 'transparent',
            border: 'none',
            borderRadius: isMobile ? '12px' : 'clamp(10px, 2.5vw, 16px)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            marginLeft: '2px'
          }}
        >
          LIMIT
        </button>
      </div>

      {/* Action Links - All on same line with glossy styling */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'clamp(12px, 2vh, 16px)',
        gap: 'clamp(4px, 1vw, 8px)',
        flexWrap: 'wrap'
      }}>

        <button 
          onClick={handleBuyMaxTx}
          disabled={isLoadingMaxTx}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            flex: 1,
            opacity: isLoadingMaxTx ? 0.5 : 1
          }}
        >
          <div style={{
            background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.3), rgba(255, 196, 120, 0.2) 60%, rgba(60, 32, 18, 0.32))',
            border: '1px solid rgba(255, 210, 160, 0.4)',
            borderRadius: 'clamp(8px, 1.8vw, 12px)',
            padding: 'clamp(4px, 0.8vh, 6px) clamp(6px, 1.2vw, 8px)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
            color: '#feea88',
            fontSize: 'clamp(8px, 1.4vw, 10px)',
            fontWeight: 700,
            transition: 'all 200ms ease',
            textAlign: 'center',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            if (!isLoadingMaxTx) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.1)';
          }}
          >
            {isLoadingMaxTx ? 'Loading...' : 'Buy max TX'}
          </div>
        </button>

        <button style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          flex: 1
        }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.3), rgba(255, 196, 120, 0.2) 60%, rgba(60, 32, 18, 0.32))',
            border: '1px solid rgba(255, 210, 160, 0.4)',
            borderRadius: 'clamp(8px, 1.8vw, 12px)',
            padding: 'clamp(4px, 0.8vh, 6px) clamp(6px, 1.2vw, 8px)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
            color: '#feea88',
            fontSize: 'clamp(8px, 1.4vw, 10px)',
            fontWeight: 700,
            transition: 'all 200ms ease',
            textAlign: 'center',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.1)';
          }}
          >
            Set max slippage
          </div>
        </button>
      </div>

      {/* Amount Input */}
      <div style={{
        position: 'relative',
        marginBottom: 'clamp(12px, 2vh, 16px)',
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
              border: `2px solid ${(activeTab === 'buy' || (activeTab === 'limit' && limitSide === 'buy')) ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
              outline: 'none',
              textAlign: 'left',
              fontFamily: '"Sora", "Inter", sans-serif',
              transition: 'all 200ms ease',
              boxSizing: 'border-box'
            }}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="0"
            onFocus={(e) => {
              const isBuy = (activeTab === 'buy' || (activeTab === 'limit' && limitSide === 'buy'));
              e.currentTarget.style.border = `2px solid ${isBuy ? '#4ade80' : '#f87171'}`;
              e.currentTarget.style.boxShadow = `0 0 0 2px ${isBuy ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`;
            }}
            onBlur={(e) => {
              const isBuy = (activeTab === 'buy' || (activeTab === 'limit' && limitSide === 'buy'));
              e.currentTarget.style.border = `2px solid ${isBuy ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`;
              e.currentTarget.style.boxShadow = 'none';
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
            {(activeTab === 'buy' || (activeTab === 'limit' && limitSide === 'buy')) ? <EthereumIcon /> : <QuestionMarkIcon />}
          </button>
        </div>
      </div>

      {/* Preset Amounts - All on same line with glossy styling */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'clamp(6px, 1.5vh, 14px)',
        gap: 'clamp(3px, 0.8vw, 6px)'
      }}>
        {quickAmounts.map((preset) => (
          <button
            key={preset}
            onClick={() => handleQuickAmount(preset)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              flex: 1
            }}
          >
            <div style={{
              background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.3), rgba(255, 196, 120, 0.2) 60%, rgba(60, 32, 18, 0.32))',
              border: '1px solid rgba(255, 210, 160, 0.4)',
              borderRadius: 'clamp(8px, 1.8vw, 12px)',
              padding: 'clamp(4px, 0.8vh, 6px) clamp(6px, 1.2vw, 8px)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
              color: '#feea88',
              fontSize: 'clamp(8px, 1.4vw, 10px)',
              fontWeight: 700,
              transition: 'all 200ms ease',
              textAlign: 'center',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.1)';
            }}
            >
              {preset}
            </div>
          </button>
        ))}
      </div>

      {/* Market Confirm or Limit UI (from backup design) */}
      {activeTab !== 'limit' ? (
        <>
          {/* Insufficient funds: open modal, no inline error UI */}

          <button
            onClick={handleConfirmTrade}
            disabled={isConnecting || tradingState.isTrading || (!isConnected ? false : !isReady)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginTop: 'auto',
              flexShrink: 0,
              opacity: (isConnecting || tradingState.isTrading || (!isConnected ? false : !isReady)) ? 0.5 : 1
            }}
          >
            <div style={{
              background: !isConnected 
                ? 'linear-gradient(180deg, #d4af37, #b8941f 60%, #a0821a)'
                : activeTab === 'buy'
                  ? 'linear-gradient(180deg, #6ef0a1, #34d37a 60%, #23bd6a)'
                  : 'linear-gradient(180deg, #ffb1a6, #ff7a6f 60%, #ff5b58)',
              borderRadius: 'clamp(14px, 3vw, 20px)',
              padding: 'clamp(14px, 3vh, 18px)',
              textAlign: 'center',
              fontWeight: 800,
              color: !isConnected ? '#1f2937' : '#1f2937',
              letterSpacing: '0.5px',
              width: '100%',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -6px 12px rgba(0,0,0,0.18)',
              fontSize: 'clamp(16px, 3.2vw, 20px)',
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.3)',
              transition: 'all 200ms ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'inset 0 2px 0 rgba(255,255,255,0.65), inset 0 -6px 12px rgba(0,0,0,0.22), 0 4px 8px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -6px 12px rgba(0,0,0,0.18)';
            }}
            >
              {!isConnected 
                ? (isConnecting ? 'CONNECTING...' : 'LOG IN')
                : tradingState.isTrading
                  ? `${activeTab.toUpperCase()}ING...`
                  : 'CONFIRM TRADE'
              }
            </div>
          </button>
        </>
      ) : (
        <>
          {/* Buy/Sell Toggle for Limit Orders */}
          <div style={{
            position: 'relative',
            display: 'flex',
            width: '100%',
            height: 'clamp(32px, 5vh, 36px)',
            borderRadius: 'clamp(12px, 2.5vw, 16px)',
            background: 'linear-gradient(180deg, #7f4108, #6f3906)',
            border: '1px solid rgba(255, 215, 165, 0.4)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            marginBottom: 'clamp(5px, 1vh, 7px)',
            padding: '3px',
            flexShrink: 0
          }}>
            <div style={{
              position: 'absolute',
              top: '3px',
              left: '3px',
              height: 'calc(100% - 6px)',
              width: 'calc(50% - 3px)',
              borderRadius: 'clamp(9px, 2vw, 13px)',
              transition: 'all 300ms ease-in-out',
              transform: limitSide === 'buy' ? 'translateX(0)' : 'translateX(calc(100% + 3px))',
              background: limitSide === 'buy'
                ? 'linear-gradient(180deg, #4ade80, #22c55e)'
                : 'linear-gradient(180deg, #f87171, #ef4444)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 2px 4px rgba(0, 0, 0, 0.15)'
            }} />
            <button
              onClick={() => setLimitSide('buy')}
              style={{
                position: 'relative',
                zIndex: 10,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                fontSize: 'clamp(10px, 1.8vw, 12px)',
                fontWeight: 800,
                color: limitSide === 'buy' ? '#1f2937' : '#feea88',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                letterSpacing: '0.2px'
              }}
            >
              BUY LIMIT
            </button>
            <button
              onClick={() => setLimitSide('sell')}
              style={{
                position: 'relative',
                zIndex: 10,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                fontSize: 'clamp(10px, 1.8vw, 12px)',
                fontWeight: 800,
                color: limitSide === 'sell' ? '#1f2937' : '#feea88',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                letterSpacing: '0.2px'
              }}
            >
              SELL LIMIT
            </button>
          </div>

          {/* Limit Price Input */}
          <div style={{ marginBottom: 'clamp(8px, 1.6vh, 12px)' }}>
            <label style={{
              display: 'block',
              fontSize: 'clamp(11px, 1.8vw, 13px)',
              fontWeight: 700,
              color: '#feea88',
              marginBottom: '6px',
              textShadow: '0 1px 0 rgba(0, 0, 0, 0.3)'
            }}>
              Limit Price ($)
            </label>
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
                value={limitPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setLimitPrice(value);
                  }
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2))',
                  color: '#feea88',
                  fontSize: 'clamp(14px, 3vw, 18px)',
                  fontWeight: 800,
                  padding: 'clamp(8px, 1.5vh, 10px) clamp(12px, 2.5vh, 16px)',
                  borderRadius: 'clamp(10px, 2.5vw, 16px)',
                  border: `2px solid ${limitSide === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                  outline: 'none',
                  textAlign: 'left',
                  fontFamily: '"Sora", "Inter", sans-serif',
                  transition: 'all 200ms ease',
                  boxSizing: 'border-box'
                }}
                placeholder="0.00"
                onFocus={(e) => {
                  e.currentTarget.style.border = `2px solid ${limitSide === 'buy' ? '#4ade80' : '#f87171'}`;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${limitSide === 'buy' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = `2px solid ${limitSide === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Quick Price Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'clamp(4px, 0.8vw, 6px)',
            marginBottom: 'clamp(8px, 1.6vh, 12px)',
            flexShrink: 0
          }}>
            {['-5%', '-2%', '+2%', '+5%'].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  const currentPrice = 21.5; // Placeholder current price
                  const sign = preset.startsWith('-') ? -1 : 1;
                  const pct = parseFloat(preset.replace('%', '')) / 100 * sign;
                  const newPrice = currentPrice * (1 + pct);
                  setLimitPrice(newPrice.toFixed(2));
                }}
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
                  border: '1px solid rgba(255, 210, 160, 0.4)',
                  borderRadius: 'clamp(8px, 1.8vw, 12px)',
                  padding: 'clamp(8px, 1.5vh, 10px) clamp(6px, 1.2vw, 8px)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  color: '#feea88',
                  fontSize: 'clamp(10px, 1.8vw, 12px)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  textAlign: 'center'
                }}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Place Limit Order Button */}
          <button
            onClick={() => {
              if (limitPrice) {
                console.log(`${limitSide.toUpperCase()} Limit Order placed at $${limitPrice}`);
                setLimitPrice('');
              }
            }}
            disabled={!limitPrice}
            style={{
              width: '100%',
              background: limitPrice
                ? (limitSide === 'buy'
                  ? 'linear-gradient(180deg, #4ade80, #22c55e)'
                  : 'linear-gradient(180deg, #f87171, #ef4444)')
                : 'linear-gradient(180deg, #6b7280, #4b5563)',
              color: limitPrice ? '#1f2937' : '#9ca3af',
              fontWeight: 800,
              fontSize: 'clamp(13px, 2.4vw, 16px)',
              padding: 'clamp(10px, 2vh, 14px)',
              borderRadius: 'clamp(14px, 3vw, 20px)',
              border: 'none',
              cursor: limitPrice ? 'pointer' : 'not-allowed',
              transition: 'all 200ms ease',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)',
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.3)',
              marginTop: 'auto',
              flexShrink: 0,
              letterSpacing: '0.5px',
              minHeight: 'clamp(40px, 6vh, 46px)',
              opacity: limitPrice ? 1 : 0.6
            }}
            onMouseEnter={(e) => {
              if (limitPrice) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 6px 12px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (limitPrice) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            PLACE {limitSide.toUpperCase()} LIMIT ORDER
          </button>
        </>
      )}

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        isConnected={isConnected}
      />

      <WalletTopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        tradingWallet={tradingState.tradingWallet}
        defaultAmountEth={topUpAmount || tradingState.topUpSuggestionEth || ''}
        onConfirmTopUp={async (amt) => {
          const tx = await topUpTradingWallet(amt);
          return tx;
        }}
      />
      </div>
    </>
  );
};
