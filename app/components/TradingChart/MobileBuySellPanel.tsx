"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useWallet } from '@/app/hooks/useWallet';
import { useTrading } from '@/app/hooks/useTrading';
import { getMaxTxInfo, extractEthToCurve } from '@/app/lib/api/services/blockchainService';
import { useToastHelpers } from '@/app/hooks/useToast';
import WalletTopUpModal from '@/app/components/Modals/WalletTopUpModal/WalletTopUpModal';

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

const WalletModal = dynamic(
  () => import('../Modals/WalletModal/WalletModal'),
  { ssr: false }
);

interface MobileBuySellPanelProps {
  orderType: 'buy' | 'sell';
  tokenAddress?: string;
}

export const MobileBuySellPanel: React.FC<MobileBuySellPanelProps> = ({ orderType, tokenAddress }) => {
  const [tradeType, setTradeType] = useState<'market' | 'limit'>('market');
  const [amount, setAmount] = useState('0');
  const [limitPrice, setLimitPrice] = useState('');
  // Slippage tolerance (%)
  const [slippagePct, setSlippagePct] = useState<string>(() => {
    if (typeof window === 'undefined') return '1';
    try {
      const saved = window.localStorage.getItem('trade.slippagePct');
      return saved ? saved : '1';
    } catch { return '1'; }
  });

  // Wallet + trading integration (same as desktop TradePanel)
  const { isConnected, isConnecting } = useWallet();
  const { tradingState, buyToken, sellToken, clearStatus, isReady, topUpTradingWallet } = useTrading();
  const { showError, showSuccess } = useToastHelpers();

  // Wallet & top-up modals
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isLoadingMaxTx, setIsLoadingMaxTx] = useState(false);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const hasShownTopUpRef = React.useRef(false);

  // Persist slippage to localStorage
  React.useEffect(() => {
    try { if (typeof window !== 'undefined') window.localStorage.setItem('trade.slippagePct', slippagePct || ''); } catch {}
  }, [slippagePct]);

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

  // Dynamic quick amounts based on buy/sell mode
  const quickAmounts = orderType === 'buy'
    ? ['0.1 ETH', '0.5 ETH', '1 ETH', 'Max']
    : ['25%', '50%', '75%', '100%'];

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

  const handleQuickAmount = (value: string) => {
    if (orderType === 'buy') {
      if (value === 'Max') {
        handleBuyMaxTx();
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
    const action = orderType === 'buy' ? 'Buy' : 'Sell';
    try {
      let hash: string | null = null;
      const pct = parseFloat(slippagePct || '0');
      const slippageBps = isNaN(pct) ? undefined : Math.max(0, Math.min(5000, Math.round(pct * 100)));
      if (orderType === 'buy') {
        hash = await buyToken(tokenAddress, amount, { slippageBps });
      } else {
        hash = await sellToken(tokenAddress, amount, { slippageBps });
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

  const handleSubmit = () => {
    if (tradeType === 'market') {
      // Use the same trade execution as desktop
      void handleConfirmTrade();
    } else {
      // Placeholder for limit orders
      if (limitPrice) {
        console.log(`${orderType.toUpperCase()} Limit Order: ${amount} tokens at $${limitPrice}`);
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
        .amount-button {
          text-overflow: none !important;
          overflow: visible !important;
          white-space: nowrap !important;
        }
      `}</style>
      <div style={{
        width: '100%',
        height: 'fit-content',
        position: 'relative',
        borderRadius: 'clamp(14px, 2vw, 20px)',
        background: 'linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)',
        padding: '10px',
        border: '1px solid rgba(255, 215, 165, 0.4)',
        overflow: 'visible',
        color: '#fff7ea',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}>
        {/* Market/Limit Tabs */}
        <div style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '40px',
          borderRadius: '16px',
          background: 'linear-gradient(180deg, #7f4108, #6f3906)',
          border: '1px solid rgba(255, 215, 165, 0.4)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          marginBottom: '12px',
          padding: '4px',
          flexShrink: 0
        }}>
          {/* Sliding Background */}
          <div style={{
            position: 'absolute',
            top: '4px',
            left: tradeType === 'market' ? '4px' : 'calc(50% + 2px)',
            height: 'calc(100% - 8px)',
            width: 'calc(50% - 3px)',
            borderRadius: '12px',
            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            background: orderType === 'buy'
              ? 'linear-gradient(180deg, #4ade80, #22c55e)'
              : 'linear-gradient(180deg, #f87171, #ef4444)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }} />
          <button
            onClick={() => setTradeType('market')}
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
              color: tradeType === 'market' ? '#1f2937' : '#feea88',
              background: 'transparent',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              letterSpacing: '0.4px'
            }}
          >
            MARKET
          </button>
          <button
            onClick={() => setTradeType('limit')}
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
              color: tradeType === 'limit' ? '#1f2937' : '#feea88',
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

        {/* Action Links */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          gap: '4px',
          flexWrap: 'wrap',
          flexShrink: 0
        }}>
          <button 
            onClick={handleBuyMaxTx}
            disabled={isLoadingMaxTx}
            style={{
            background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
            border: '1px solid rgba(255, 210, 160, 0.4)',
            borderRadius: '8px',
            padding: '4px 8px',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            color: '#feea88',
            fontSize: '8px',
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
            borderRadius: '8px',
            padding: '4px 8px',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            color: '#feea88',
            fontSize: '8px',
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
          marginBottom: '6px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'relative',
            background: 'linear-gradient(180deg, #7f4108, #6f3906)',
            border: '1px solid rgba(255, 215, 165, 0.4)',
            borderRadius: '12px',
            padding: '3px',
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
                fontSize: '16px',
                fontWeight: 800,
                padding: '8px 40px 8px 12px',
                borderRadius: '8px',
                border: `2px solid ${orderType === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                outline: 'none',
                textAlign: 'left',
                fontFamily: '"Sora", "Inter", sans-serif',
                transition: 'all 200ms ease',
                boxSizing: 'border-box'
              }}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="0"
              onFocus={(e) => {
                e.target.style.border = `2px solid ${orderType === 'buy' ? '#4ade80' : '#f87171'}`;
                e.target.style.boxShadow = `0 0 0 2px ${orderType === 'buy' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`;
              }}
              onBlur={(e) => {
                e.target.style.border = `2px solid ${orderType === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`;
                e.target.style.boxShadow = 'none';
              }}
            />
            <button style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(180deg, #ffe49c, #ffc96a)',
              borderRadius: '50%',
              padding: '6px',
              color: '#3a200f',
              border: '1px solid rgba(140, 85, 35, 0.28)',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              {orderType === 'buy' ? <EthereumIcon /> : <QuestionMarkIcon />}
            </button>
          </div>
        </div>

        {/* Slippage Tolerance */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '10px', color: '#feea88', fontWeight: 700 }}>Slippage</span>
          <input
            type="text"
            value={slippagePct}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || /^\d*(?:\.\d{0,2})?$/.test(v)) setSlippagePct(v);
            }}
            placeholder="1"
            style={{
              width: '60px',
              background: 'linear-gradient(180deg, #7f4108, #6f3906)',
              border: '1px solid rgba(255, 215, 165, 0.4)',
              borderRadius: '8px',
              color: '#feea88',
              padding: '4px 6px',
              fontWeight: 700,
              fontSize: '10px'
            }}
          />
          {['0.1','0.5','1','2'].map(p => (
            <button key={p} onClick={() => setSlippagePct(p)} style={{
              background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
              border: '1px solid rgba(255, 210, 160, 0.4)',
              borderRadius: '8px',
              padding: '6px 6px',
              color: '#feea88',
              fontSize: '9px',
              fontWeight: 800,
              cursor: 'pointer',
            }}>{p}%</button>
          ))}
        </div>

        {/* Preset Amounts */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          gap: '2px',
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
                borderRadius: '8px',
                padding: '8px 4px',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                color: '#feea88',
                fontSize: '8px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                flex: 1,
                whiteSpace: 'nowrap',
                overflow: 'visible',
                textAlign: 'center',
                minHeight: '32px'
              }}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Limit Price Input (only shown for limit orders) */}
        {tradeType === 'limit' && (
          <>
            <div style={{ marginBottom: '8px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
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
                borderRadius: '14px',
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
                    fontSize: '16px',
                    fontWeight: 800,
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: `2px solid ${orderType === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                    outline: 'none',
                    textAlign: 'left',
                    fontFamily: '"Sora", "Inter", sans-serif',
                    transition: 'all 200ms ease',
                    boxSizing: 'border-box'
                  }}
                  placeholder="0.00"
                  onFocus={(e) => {
                    e.target.style.border = `2px solid ${orderType === 'buy' ? '#4ade80' : '#f87171'}`;
                    e.target.style.boxShadow = `0 0 0 2px ${orderType === 'buy' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.border = `2px solid ${orderType === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Quick Price Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4px',
              marginBottom: '8px',
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
                    borderRadius: '8px',
                    padding: '8px 6px',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    color: '#feea88',
                    fontSize: '10px',
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
          </>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={
            tradeType === 'market'
              ? (isConnecting || tradingState?.isTrading || (!isConnected ? false : !isReady))
              : !limitPrice
          }
          style={{
            width: '100%',
            background: (tradeType === 'market'
              ? (!isConnected 
                  ? 'linear-gradient(180deg, #d4af37, #b8941f 60%, #a0821a)'
                  : (orderType === 'buy'
                      ? 'linear-gradient(180deg, #4ade80, #22c55e)'
                      : 'linear-gradient(180deg, #f87171, #ef4444)'))
              : (limitPrice
                  ? (orderType === 'buy'
                      ? 'linear-gradient(180deg, #4ade80, #22c55e)'
                      : 'linear-gradient(180deg, #f87171, #ef4444)')
                  : 'linear-gradient(180deg, #6b7280, #4b5563)')),
            color: (tradeType === 'market' && !isConnected) || limitPrice ? '#1f2937' : (tradeType === 'market' ? '#1f2937' : '#9ca3af'),
            fontWeight: 800,
            fontSize: '13px',
            padding: '12px',
            borderRadius: '16px',
            border: 'none',
            cursor: (
              tradeType === 'market'
                ? (isConnecting || tradingState?.isTrading || (!isConnected ? false : !isReady)) ? 'not-allowed' : 'pointer'
                : (limitPrice ? 'pointer' : 'not-allowed')
            ),
            transition: 'all 200ms ease',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.3)',
            marginTop: 'auto',
            flexShrink: 0,
            letterSpacing: '0.5px',
            minHeight: '40px',
            opacity: (
              tradeType === 'market'
                ? ((isConnecting || tradingState?.isTrading || (!isConnected ? false : !isReady)) ? 0.5 : 1)
                : (limitPrice ? 1 : 0.6)
            )
          }}
          onMouseEnter={(e) => {
            const target = e.target as HTMLButtonElement;
            const disabled = tradeType === 'market'
              ? (isConnecting || tradingState?.isTrading || (!isConnected ? false : !isReady))
              : !limitPrice;
            if (!disabled) {
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
          {tradeType === 'market'
            ? (!isConnected 
                ? (isConnecting ? 'CONNECTING...' : 'LOG IN')
                : (tradingState?.isTrading ? `${orderType.toUpperCase()}ING...` : `CONFIRM ${orderType.toUpperCase()} TRADE`))
            : `PLACE ${orderType.toUpperCase()} LIMIT ORDER`}
        </button>
        {/* Wallet & Top-Up Modals */}
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
