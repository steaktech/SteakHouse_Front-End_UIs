"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useWallet } from '@/app/hooks/useWallet';
import { useTrading } from '@/app/hooks/useTrading';
import { getMaxTxInfo, extractEthToCurve } from '@/app/lib/api/services/blockchainService';
import { useToastHelpers } from '@/app/hooks/useToast';
import WalletTopUpModal from '@/app/components/Modals/WalletTopUpModal/WalletTopUpModal';
import { useBalance } from 'wagmi';
import { useUserTokenPosition } from '@/app/hooks/useUserTokenPosition';

const WalletModal = dynamic(
  () => import('../Modals/WalletModal/WalletModal'),
  { ssr: false }
);

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
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
  </svg>
);

interface TradePanelProps {
  initialTab?: 'buy' | 'sell' | 'limit';
  onTabChange?: (tab: 'buy' | 'sell' | 'limit') => void;
  isMobile?: boolean;
  tokenAddress?: string;
}

export const TradePanel: React.FC<TradePanelProps> = ({ initialTab = 'buy', onTabChange, isMobile = false, tokenAddress }) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'limit'>(initialTab as any);
  const [amount, setAmount] = useState('0');
  const [limitPrice, setLimitPrice] = useState('');
  const [limitSide, setLimitSide] = useState<'buy' | 'sell'>('buy');

  // Wallet + trading integration
  const { isConnected, isConnecting } = useWallet();
  const { tradingState, buyToken, sellToken, clearStatus, isReady, topUpTradingWallet } = useTrading();
  const { showError, showSuccess } = useToastHelpers();

  // Position state from API via shared client
  // Loaded using a dedicated hook for structure and reuse

  // Wallet & top-up modals
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isLoadingMaxTx, setIsLoadingMaxTx] = useState(false);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const hasShownTopUpRef = React.useRef(false);

  // Resolve trading wallet and ETH balance for that wallet
  const tradingWalletAddress = tradingState?.tradingWallet || null;
  const { data: tradingEthBalance } = useBalance({
    address: (tradingWalletAddress || undefined) as `0x${string}` | undefined,
  });

  // Load token position using shared api client and structured hook
  const { data: position, isLoading: loadingPosition, error: positionError } = useUserTokenPosition(tradingWalletAddress, tokenAddress);

  // Update activeTab when initialTab prop changes
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Handle tab change with callback
  const handleTabChange = (tab: 'buy' | 'sell' | 'limit') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Show top-up suggestion when trading wallet has insufficient funds
  React.useEffect(() => {
    if (tradingState?.canTopUp && !hasShownTopUpRef.current) {
      if (tradingState.topUpSuggestionEth) setTopUpAmount(tradingState.topUpSuggestionEth);
      showError('Trading wallet has insufficient funds. Please top up to continue.', 'Insufficient funds');
      setIsTopUpModalOpen(true);
      hasShownTopUpRef.current = true;
    } else if (!tradingState?.canTopUp) {
      hasShownTopUpRef.current = false;
    }
  }, [tradingState?.canTopUp, tradingState?.topUpSuggestionEth, showError]);

  // Buy max TX handler
  const handleBuyMaxTx = async () => {
    if (!tokenAddress) {
      showError('No token selected for trading', 'Buy Max TX');
      return;
    }
    setIsLoadingMaxTx(true);
    try {
      const maxTxData = await getMaxTxInfo(tokenAddress);
      const ethToCurve = extractEthToCurve(maxTxData);
      if (ethToCurve) {
        setAmount(ethToCurve);
        showSuccess(`Max TX amount set: ${ethToCurve} ETH`, 'Buy Max TX');
      } else {
        showError('Max TX data not available for this token', 'Buy Max TX Failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch max TX data';
      showError(errorMessage, 'Buy Max TX Failed');
    } finally {
      setIsLoadingMaxTx(false);
    }
  };

  // Confirm trade handler (market buy/sell)
  const handleConfirmTrade = async () => {
    if (!tokenAddress) {
      showError('No token selected for trading', 'Trade');
      return;
    }
    if (!isConnected) {
      setIsWalletModalOpen(true);
      return;
    }
    if (tradingState?.isTrading) return;
    if (!amount || parseFloat(amount) <= 0) return;

    clearStatus?.();
    const action = activeTab === 'buy' ? 'Buy' : 'Sell';
    try {
      let hash: string | null = null;
      if (activeTab === 'buy') {
        hash = await buyToken(tokenAddress, amount);
      } else {
        hash = await sellToken(tokenAddress, amount);
      }
      if (hash) {
        const short = `${hash.slice(0, 10)}...${hash.slice(-6)}`;
        showSuccess(`${action} submitted. Tx: ${short}`, `${action} success`, 10000);
      } else if (tradingState?.error) {
        showError(tradingState.error, `${action} failed`, 10000);
      }
    } catch (error) {
      const e = error as any;
      const reason = e?.raw?.error?.reason || e?.raw?.error?.shortMessage || e?.raw?.error?.info?.error?.message || e?.message || 'Trade failed';
      showError(reason, `${action} failed`, 12000);
    }
  };

  // Top up trading wallet
  const handleTopUp = async () => {
    if (!isConnected) {
      setIsWalletModalOpen(true);
      return;
    }
    if (!tradingState?.tradingWallet) {
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
        showSuccess(`Top up sent: ${String(txHash).slice(0, 10)}...`, 'Top Up');
      }
    } catch (e) {
      const msg = (e as any)?.message || 'Failed to top up';
      showError(msg, 'Top Up Failed');
    } finally {
      setIsToppingUp(false);
    }
  };

  // Dynamic quick amounts - buy shows ETH amounts, sell shows percentages
  const quickAmounts = activeTab === 'buy' ? ['0.1 ETH', '0.5 ETH', '1 ETH', 'Max'] : ['25%', '50%', '75%', '100%'];

  const handleQuickAmount = (value: string) => {
    if (value === 'Max') {
      handleBuyMaxTx(); // Use the API to get actual max amount
    } else if (activeTab === 'buy') {
      setAmount(value.split(' ')[0]);
    } else {
      // For sell mode, handle percentage values (placeholder logic)
      if (value === '25%') setAmount('25');
      else if (value === '50%') setAmount('50');
      else if (value === '75%') setAmount('75');
      else if (value === '100%') setAmount('100');
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
        .amount-button {
          text-overflow: none !important;
          overflow: visible !important;
          white-space: nowrap !important;
        }
      `}</style>
      <div className="custom-scrollbar" style={{
        width: '100%',
        height: activeTab === 'limit' ? 'fit-content' : '100%',
        maxHeight: activeTab === 'limit' ? 'none' : 'none',
        minHeight: activeTab === 'limit' ? 'auto' : '100%',
        position: 'relative',
        borderRadius: 'clamp(14px, 2vw, 20px)',
        background: 'linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)',
        padding: isMobile ? '10px' : (activeTab === 'limit' ? 'clamp(9px, 1.8vh, 13px)' : 'clamp(12px, 2.5vh, 16px)'),
        border: '1px solid rgba(255, 215, 165, 0.4)',
        overflowY: 'auto',
        overflowX: 'hidden',
        color: '#fff7ea',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}>
        {/* Buy/Sell/Limit Tabs - Premium Style */}
        <div style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '40px',
          borderRadius: '16px',
          background: 'linear-gradient(180deg, #7f4108, #6f3906)',
          border: '1px solid rgba(255, 215, 165, 0.4)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          marginBottom: activeTab === 'limit' ? '9px' : '12px',
          padding: '4px',
          flexShrink: 0
        }}>
          {/* Sliding Background */}
          <div style={{
            position: 'absolute',
            top: '4px',
            left: activeTab === 'buy' 
              ? '4px' 
              : activeTab === 'sell' 
                ? 'calc(33.333% + 2px)' 
                : 'calc(66.666% - 2px)',
            height: 'calc(100% - 8px)',
            width: 'calc(33.333% - 2.67px)',
            borderRadius: '12px',
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
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
              color: activeTab === 'buy' ? '#1f2937' : '#feea88',
              background: 'transparent',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              letterSpacing: '0.4px'
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
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
              color: activeTab === 'sell' ? '#1f2937' : '#feea88',
              background: 'transparent',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              letterSpacing: '0.4px'
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
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
              color: activeTab === 'limit' ? '#1f2937' : '#feea88',
              background: 'transparent',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              letterSpacing: '0.4px'
            }}
          >
            LIMIT
          </button>
        </div>

        {/* Action Links - All on same line */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: activeTab === 'limit' ? 'clamp(4px, 0.8vh, 6px)' : 'clamp(6px, 1vh, 8px)',
          gap: 'clamp(4px, 1vw, 8px)',
          flexWrap: 'wrap',
          flexShrink: 0
        }}>
          <button 
            onClick={handleBuyMaxTx}
            disabled={isLoadingMaxTx}
            style={{
              background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
              border: '1px solid rgba(255, 210, 160, 0.4)',
              borderRadius: 'clamp(8px, 1.8vw, 12px)',
              padding: 'clamp(4px, 1vh, 6px) clamp(8px, 2vw, 12px)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              color: '#feea88',
              fontSize: 'clamp(8px, 1.4vw, 11px)',
              fontWeight: 800,
              cursor: isLoadingMaxTx ? 'not-allowed' : 'pointer',
              transition: 'all 200ms ease',
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              opacity: isLoadingMaxTx ? 0.5 : 1
            }}>{isLoadingMaxTx ? 'Loading...' : 'Buy max TX'}</button>

          <button style={{
            background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
            border: '1px solid rgba(255, 210, 160, 0.4)',
            borderRadius: 'clamp(8px, 1.8vw, 12px)',
            padding: 'clamp(4px, 1vh, 6px) clamp(8px, 2vw, 12px)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            color: '#feea88',
            fontSize: 'clamp(8px, 1.4vw, 11px)',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 200ms ease',
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>Set max wallet</button>
        </div>

        {/* Amount Input */}
        <div style={{
          position: 'relative',
          marginTop: '0',
          marginBottom: 'clamp(6px, 1vh, 10px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <label style={{
            display: 'block',
            fontSize: 'clamp(11px, 1.8vw, 13px)',
            fontWeight: 700,
            color: '#feea88',
            marginBottom: '6px',
            textShadow: '0 1px 0 rgba(0, 0, 0, 0.3)'
          }}>
            Amount {(activeTab === 'buy' || (activeTab === 'limit' && limitSide === 'buy')) ? '(ETH)' : activeTab === 'sell' ? '(%)' : ''}
          </label>
          <div style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #7f4108, #6f3906)',
            border: '1px solid rgba(255, 215, 165, 0.4)',
            borderRadius: 'clamp(12px, 2.5vw, 16px)',
            padding: '3px',
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
                fontSize: 'clamp(14px, 3vw, 18px)',
                fontWeight: 800,
                padding: 'clamp(8px, 1.5vh, 10px) clamp(40px, 8vw, 48px) clamp(8px, 1.5vh, 10px) clamp(12px, 2.5vh, 16px)',
                borderRadius: 'clamp(8px, 2vw, 12px)',
                border: `2px solid ${(activeTab === 'buy' || (activeTab === 'limit' && limitSide === 'buy')) ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                outline: 'none',
                textAlign: 'left',
                fontFamily: '"Sora", "Inter", sans-serif',
                transition: 'all 200ms ease',
                boxSizing: 'border-box'
              }}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="0.00"
              onFocus={(e) => {
                e.target.style.border = `2px solid ${(activeTab === 'buy' || (activeTab === 'limit' && limitSide === 'buy')) ? '#4ade80' : '#f87171'}`;
                e.target.style.boxShadow = `0 0 0 2px ${(activeTab === 'buy' || (activeTab === 'limit' && limitSide === 'buy')) ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`;
              }}
              onBlur={(e) => {
                e.target.style.border = `2px solid ${(activeTab === 'buy' || (activeTab === 'limit' && limitSide === 'buy')) ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`;
                e.target.style.boxShadow = 'none';
              }}
            />
            <button style={{
              position: 'absolute',
              right: 'clamp(6px, 1.2vw, 8px)',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(180deg, #ffe49c, #ffc96a)',
              borderRadius: '50%',
              padding: 'clamp(6px, 1.2vw, 8px)',
              color: '#3a200f',
              border: '1px solid rgba(140, 85, 35, 0.28)',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              {(activeTab === 'buy' || (activeTab === 'limit' && limitSide === 'buy')) ? <EthereumIcon /> : <QuestionMarkIcon />}
            </button>
          </div>
        </div>

        {/* Preset Amounts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'clamp(4px, 0.8vw, 6px)',
          marginTop: 'clamp(4px, 0.8vh, 8px)',
          marginBottom: 'clamp(6px, 1vh, 10px)',
          flexShrink: 0
        }}>
          {quickAmounts.map((preset) => (
            <button
              key={preset}
              onClick={() => handleQuickAmount(preset)}
              className="amount-button"
              style={{
                background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
                border: '1px solid rgba(255, 210, 160, 0.4)',
                borderRadius: 'clamp(8px, 1.6vw, 12px)',
                padding: 'clamp(8px, 1.8vh, 12px) clamp(3px, 0.6vw, 4px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                color: '#feea88',
                fontSize: 'clamp(8px, 1.3vw, 10px)',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                flex: 1,
                whiteSpace: 'nowrap',
                overflow: 'visible',
                textAlign: 'center',
                minHeight: 'clamp(32px, 6vh, 36px)'
              }}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Market Order Interface */}
        {activeTab !== 'limit' && (
          <>
            {/* Account Stats (live from /api/user/position) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(4px, 0.8vh, 8px)',
              marginTop: 'clamp(6px, 1vh, 10px)',
              marginBottom: 'clamp(6px, 1vh, 10px)'
            }}>
              {/* Token Balance (qtyTokens) */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'clamp(6px, 1.2vh, 8px) clamp(8px, 1.6vw, 12px)',
                background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.08), rgba(60, 32, 18, 0.15))',
                border: '1px solid rgba(255, 210, 160, 0.25)',
                borderRadius: 'clamp(8px, 1.6vw, 12px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)'
              }}>
                <span style={{
                  fontSize: 'clamp(10px, 1.6vw, 12px)',
                  fontWeight: 700,
                  color: 'rgba(254, 234, 136, 0.75)'
                }}>Token Balance</span>
                <span style={{
                  fontSize: 'clamp(11px, 1.8vw, 13px)',
                  fontWeight: 800,
                  color: '#feea88',
                  letterSpacing: '0.2px'
                }}>{loadingPosition ? 'Loading…' : (position ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(position.qtyTokens) : (positionError ? '—' : '0'))}</span>
              </div>

              {/* Token Balance Worth (marketValueUsd) */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'clamp(6px, 1.2vh, 8px) clamp(8px, 1.6vw, 12px)',
                background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.08), rgba(60, 32, 18, 0.15))',
                border: '1px solid rgba(255, 210, 160, 0.25)',
                borderRadius: 'clamp(8px, 1.6vw, 12px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)'
              }}>
                <span style={{
                  fontSize: 'clamp(10px, 1.6vw, 12px)',
                  fontWeight: 700,
                  color: 'rgba(254, 234, 136, 0.75)'
                }}>Token Worth</span>
                <span style={{
                  fontSize: 'clamp(11px, 1.8vw, 13px)',
                  fontWeight: 800,
                  color: '#feea88',
                  letterSpacing: '0.2px'
                }}>{loadingPosition ? 'Loading…' : (position ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(position.marketValueUsd || 0) : (positionError ? '—' : '$0.00'))}</span>
              </div>

              {/* ETH Balance (trading wallet) */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'clamp(6px, 1.2vh, 8px) clamp(8px, 1.6vw, 12px)',
                background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.08), rgba(60, 32, 18, 0.15))',
                border: '1px solid rgba(255, 210, 160, 0.25)',
                borderRadius: 'clamp(8px, 1.6vw, 12px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)'
              }}>
                <span style={{
                  fontSize: 'clamp(10px, 1.6vw, 12px)',
                  fontWeight: 700,
                  color: 'rgba(254, 234, 136, 0.75)'
                }}>ETH Balance</span>
                <span style={{
                  fontSize: 'clamp(11px, 1.8vw, 13px)',
                  fontWeight: 800,
                  color: '#feea88',
                  letterSpacing: '0.2px'
                }}>{tradingWalletAddress ? ((tradingEthBalance?.formatted ? `${Number(tradingEthBalance.formatted).toFixed(4)} ETH` : 'Loading…')) : '—'}</span>
              </div>

              {/* Total PnL (open + realized) */}
              {/* <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'clamp(6px, 1.2vh, 8px) clamp(8px, 1.6vw, 12px)',
                background: 'linear-gradient(180deg, rgba(74, 222, 128, 0.10), rgba(34, 197, 94, 0.16))',
                border: '1px solid rgba(74, 222, 128, 0.25)',
                borderRadius: 'clamp(8px, 1.6vw, 12px)',
                boxShadow: 'inset 0 1px 0 rgba(74, 222, 128, 0.1)'
              }}>
                <span style={{
                  fontSize: 'clamp(10px, 1.6vw, 12px)',
                  fontWeight: 700,
                  color: 'rgba(254, 234, 136, 0.75)'
                }}>PnL</span>
                <span style={{
                  fontSize: 'clamp(11px, 1.8vw, 13px)',
                  fontWeight: 800,
                  color: (position && (position.openPnlUsd + position.realizedPnlUsd) < 0) ? '#f87171' : '#4ade80',
                  letterSpacing: '0.2px'
                }}>{loadingPosition ? 'Loading…' : (position ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((position.openPnlUsd || 0) + (position.realizedPnlUsd || 0)) : (positionError ? '—' : '$0.00'))}</span>
              </div> */}

              {/* Average Buy Price (avgCostUsd) */}
              {/* <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'clamp(6px, 1.2vh, 8px) clamp(8px, 1.6vw, 12px)',
                background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.08), rgba(60, 32, 18, 0.15))',
                border: '1px solid rgba(255, 210, 160, 0.25)',
                borderRadius: 'clamp(8px, 1.6vw, 12px)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)'
              }}>
                <span style={{
                  fontSize: 'clamp(10px, 1.6vw, 12px)',
                  fontWeight: 700,
                  color: 'rgba(254, 234, 136, 0.75)'
                }}>Average Buy Price</span>
                <span style={{
                  fontSize: 'clamp(11px, 1.8vw, 13px)',
                  fontWeight: 800,
                  color: '#feea88',
                  letterSpacing: '0.2px'
                }}>{loadingPosition ? 'Loading…' : (position ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 8 }).format(position.avgCostUsd || 0) : (positionError ? '—' : '$0.00'))}</span>
              </div> */}
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmTrade}
              disabled={isConnecting || tradingState?.isTrading || (!isConnected ? false : !isReady)}
              style={{
                width: '100%',
                background: !isConnected 
                  ? 'linear-gradient(180deg, #d4af37, #b8941f 60%, #a0821a)'
                  : activeTab === 'buy'
                    ? 'linear-gradient(180deg, #4ade80, #22c55e)'
                    : 'linear-gradient(180deg, #f87171, #ef4444)',
                color: '#1f2937',
                fontWeight: 800,
                fontSize: 'clamp(10px, 2vw, 13px)',
                padding: 'clamp(8px, 1.5vh, 10px)',
                borderRadius: 'clamp(12px, 2.5vw, 16px)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 3px 6px rgba(0, 0, 0, 0.1)',
                textShadow: '0 1px 0 rgba(255, 255, 255, 0.3)',
                marginTop: 'auto',
                flexShrink: 0,
                letterSpacing: '0.4px',
                minHeight: 'clamp(32px, 5vh, 36px)',
                opacity: (isConnecting || tradingState?.isTrading || (!isConnected ? false : !isReady)) ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                if (!isConnecting && !tradingState?.isTrading && (isConnected ? isReady : true)) {
                  target.style.transform = 'translateY(-1px)';
                  target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 6px 12px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.transform = 'translateY(0)';
                target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              {!isConnected 
                ? (isConnecting ? 'CONNECTING...' : 'LOG IN')
                : tradingState?.isTrading
                  ? `${activeTab.toUpperCase()}ING...`
                  : 'CONFIRM TRADE'
              }
            </button>
          </>
        )}

        {/* Limit Order Interface */}
        {activeTab === 'limit' && (
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
                    e.target.style.border = `2px solid ${limitSide === 'buy' ? '#4ade80' : '#f87171'}`;
                    e.target.style.boxShadow = `0 0 0 2px ${limitSide === 'buy' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.border = `2px solid ${limitSide === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`;
                    e.target.style.boxShadow = 'none';
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
                    const currentPrice = 21.50; // Mock current price
                    const multiplier = 1 + parseFloat(preset.replace('%', '')) / 100;
                    setLimitPrice((currentPrice * multiplier).toFixed(2));
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
                  // This would typically call an onOrderSubmit prop
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
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'translateY(-1px)';
                  target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 6px 12px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (limitPrice) {
                  const target = e.target as HTMLButtonElement;
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              PLACE {limitSide.toUpperCase()} LIMIT ORDER
            </button>
          </>
        )}
      {/* Wallet & Top-Up Modals (do not change visible UI unless opened) */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        isConnected={isConnected}
      />
      <WalletTopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        tradingWallet={tradingState?.tradingWallet}
        defaultAmountEth={topUpAmount || tradingState?.topUpSuggestionEth || ''}
        onConfirmTopUp={async (amt) => topUpTradingWallet(amt)}
      />
      </div>
    </>
  );
};
