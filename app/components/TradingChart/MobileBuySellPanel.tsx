"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import { useWallet } from '@/app/hooks/useWallet';
import { useTrading } from '@/app/hooks/useTrading';
import { getMaxTxInfo, extractEthToCurve, getMaxWalletInfo, extractMaxWalletEthToCurve } from '@/app/lib/api/services/blockchainService';
import { createLimitOrder } from '@/app/lib/api/services/ordersService';
import { useUserTokenPosition } from '@/app/hooks/useUserTokenPosition';
import type { FullTokenDataResponse } from '@/app/types/token';
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
  apiTokenData?: FullTokenDataResponse | null;
  onClose?: () => void;
}

export const MobileBuySellPanel: React.FC<MobileBuySellPanelProps> = ({ 
  orderType, 
  tokenAddress,
  apiTokenData = null,
  onClose
}) => {
  const [tradeType, setTradeType] = useState<'market' | 'limit'>('market');
  const [amount, setAmount] = useState('0');
  const [limitPrice, setLimitPrice] = useState('');
  const [isPlacingLimit, setIsPlacingLimit] = useState(false);
  // Slippage tolerance (%)
  const [slippagePct, setSlippagePct] = useState<string>(() => {
    if (typeof window === 'undefined') return '1';
    try {
      const saved = window.localStorage.getItem('trade.slippagePct');
      return saved ? saved : '1';
    } catch { return '1'; }
  });

  const { isConnected, isConnecting } = useWallet();
  const { tradingState, buyToken, sellToken, clearStatus, isReady, topUpTradingWallet } = useTrading();
  const { showError, showSuccess } = useToastHelpers();

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isLoadingMaxTx, setIsLoadingMaxTx] = useState(false);
  const [isLoadingMaxWallet, setIsLoadingMaxWallet] = useState(false);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const hasShownTopUpRef = React.useRef(false);

  React.useEffect(() => {
    try { if (typeof window !== 'undefined') window.localStorage.setItem('trade.slippagePct', slippagePct || ''); } catch {}
  }, [slippagePct]);

  const tradingWalletAddress = tradingState?.tradingWallet || null;
  const { data: position } = useUserTokenPosition(tradingWalletAddress, tokenAddress);
  const currentPriceUsd = position?.lastPriceUsd ?? apiTokenData?.price ?? null;

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

  const quickAmounts = orderType === 'buy'
    ? ['0.1 ETH', '0.5 ETH', '1 ETH', '2 ETH', 'Max']
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
      return;
    }
    if (tradeType === 'market') {
      const pct = value.replace('%', '');
      setAmount(pct);
      return;
    }
    const pctNum = parseFloat(value.replace('%', ''));
    if (isNaN(pctNum) || pctNum <= 0) return;
    const balance = position?.qtyTokens ?? 0;
    if (!balance || balance <= 0) {
      showError('Token balance unavailable for this wallet', 'Preset amount');
      return;
    }
    const tokens = (balance * pctNum) / 100;
    const formatted = Number(tokens.toFixed(6)).toString();
    setAmount(formatted);
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
      const reason =
        e?.raw?.error?.info?.error?.message ||
        e?.info?.error?.message ||
        e?.info?.message ||
        e?.raw?.error?.shortMessage ||
        e?.raw?.error?.revert?.args?.[0] ||
        e?.raw?.error?.reason ||
        e?.message ||
        'Trade failed';
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

  const handleSetMaxWallet = async () => {
    if (!tokenAddress) {
      showError('No token selected for trading', 'Set Max Wallet');
      return;
    }
    setIsLoadingMaxWallet(true);
    try {
      const maxWalletData = await getMaxWalletInfo(tokenAddress);
      const ethToCurve = extractMaxWalletEthToCurve(maxWalletData);
      if (ethToCurve) {
        setAmount(ethToCurve);
        showSuccess(`Max wallet amount set: ${ethToCurve} ETH`, 'Set Max Wallet');
      } else {
        showError('Max wallet data not available for this token', 'Set Max Wallet Failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch max wallet data';
      showError(errorMessage, 'Set Max Wallet Failed');
    } finally {
      setIsLoadingMaxWallet(false);
    }
  };

  const handleSubmit = async () => {
    if (tradeType === 'market') {
      await handleConfirmTrade();
      return;
    }
    const price = parseFloat(limitPrice || '0');
    const amt = parseFloat(amount || '0');
    if (!tokenAddress) { showError('No token selected for trading', 'Limit Order'); return; }
    if (!isConnected) { setIsWalletModalOpen(true); return; }
    if (!price || price <= 0) { showError('Enter a valid limit price', 'Limit Order'); return; }
    if (!amt || amt <= 0) { showError('Enter a valid amount', 'Limit Order'); return; }
    if (!tradingWalletAddress) { showError('Trading wallet not set up', 'Limit Order'); return; }
    try {
      setIsPlacingLimit(true);
      const resp = await createLimitOrder({
        tokenAddress: tokenAddress,
        walletAddress: tradingWalletAddress,
        side: orderType,
        limitPriceUsd: price,
        amountTokens: amt,
      });
      const msg = resp?.message || 'Limit order placed';
      showSuccess(msg, 'Limit Order');
      setLimitPrice('');
    } catch (e: any) {
      const errMsg = e?.message || 'Failed to place limit order';
      showError(errMsg, 'Limit Order');
    } finally {
      setIsPlacingLimit(false);
    }
  };

  // Colors based on Buy/Sell for active states in the new theme
  const activeGradient = orderType === 'buy'
    ? 'linear-gradient(180deg, #4ade80, #22c55e)'
    : 'linear-gradient(180deg, #f87171, #ef4444)';

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

        .mobile-buy-sell-panel {
          max-width: 360px;
          width: 100%;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .mobile-buy-sell-panel {
            max-width: 360px !important;
            width: 95% !important;
            max-height: 85vh;
            height: auto !important;
            padding: 12px 10px 16px !important;
            overflow-y: auto !important;
            overflow-x: hidden;
          }

          .mobile-buy-sell-panel::-webkit-scrollbar {
            width: 6px;
          }

          .mobile-buy-sell-panel::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 999px;
            margin: 4px;
          }

          .mobile-buy-sell-panel::-webkit-scrollbar-thumb {
            background: #8c5523;
            border: 1px solid #3e250c;
            border-radius: 999px;
          }

          .mobile-buy-sell-panel::-webkit-scrollbar-thumb:hover {
            background: #fbbf24;
          }
          
           /* Quick amount buttons */
          .mobile-quick-amounts-row {
            flex-wrap: wrap;
            row-gap: 6px;
          }

          .mobile-quick-amounts-row .amount-button {
            flex: 1 0 calc(33% - 4px) !important; 
            min-width: calc(33% - 4px);
            font-size: 13px !important;
            min-height: 32px !important;
            padding: 8px !important;
          }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}>
        <div
          className="mobile-buy-sell-panel"
          style={{
            width: '100%',
            height: 'fit-content',
            position: 'relative',
            borderRadius: '20px',
            background: 'linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 215, 165, 0.1)',
            padding: '10px',
            border: '1px solid rgba(255, 215, 165, 0.4)',
            color: '#fff7ea',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 4px 10px 4px',
            marginBottom: '6px',
            borderBottom: '1px solid rgba(255, 215, 165, 0.1)'
          }}>
            <h2 style={{
              color: '#feea88',
              fontSize: '18px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0
            }}>
              {orderType} Order
            </h2>
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#feea88',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={24} />
            </button>
          </div>

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
            <div style={{
              position: 'absolute',
              top: '4px',
              left: tradeType === 'market' ? '4px' : 'calc(50% + 2px)',
              height: 'calc(100% - 8px)',
              width: 'calc(50% - 3px)',
              borderRadius: '12px',
              transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              background: activeGradient,
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

          {/* Helper Chips */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <button 
              onClick={handleBuyMaxTx}
              disabled={isLoadingMaxTx}
              style={{
                flex: 1,
                background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
                border: '1px solid rgba(255, 210, 160, 0.4)',
                borderRadius: '8px',
                padding: '6px 4px',
                color: '#feea88',
                fontSize: '10px',
                fontWeight: 800,
                cursor: isLoadingMaxTx ? 'not-allowed' : 'pointer',
                transition: 'all 200ms ease',
                textTransform: 'uppercase',
                opacity: isLoadingMaxTx ? 0.5 : 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {isLoadingMaxTx ? 'Loading...' : 'Buy Max TX'}
            </button>
            <button 
              onClick={handleSetMaxWallet}
              disabled={isLoadingMaxWallet}
              style={{
                flex: 1,
                background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
                border: '1px solid rgba(255, 210, 160, 0.4)',
                borderRadius: '8px',
                padding: '6px 4px',
                color: '#feea88',
                fontSize: '10px',
                fontWeight: 800,
                cursor: isLoadingMaxWallet ? 'not-allowed' : 'pointer',
                transition: 'all 200ms ease',
                textTransform: 'uppercase',
                opacity: isLoadingMaxWallet ? 0.5 : 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {isLoadingMaxWallet ? 'Loading...' : 'Buy Max Wallet'}
            </button>
          </div>

          {/* Limit Price Input */}
          {tradeType === 'limit' && (
            <>
              <label style={{ 
                fontSize: '12px', 
                fontWeight: 'bold', 
                color: '#feea88', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                marginBottom: '6px',
                marginLeft: '4px',
                display: 'block'
              }}>
                Limit Price
              </label>
              <div style={{ marginBottom: '12px', position: 'relative' }}>
                 <div style={{ 
                   position: 'absolute', 
                   left: '16px', 
                   top: '50%', 
                   transform: 'translateY(-50%)',
                   pointerEvents: 'none',
                   zIndex: 10
                 }}>
                  <span style={{ color: '#feea88', fontSize: '14px', fontWeight: 'bold' }}>Price $</span>
                </div>
                <div style={{
                  position: 'relative',
                  background: 'linear-gradient(180deg, #7f4108, #6f3906)',
                  border: '1px solid rgba(255, 215, 165, 0.4)',
                  borderRadius: '14px',
                  padding: '3px',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                }}>
                  <input
                    type="number"
                    className="no-spinner"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2))',
                      color: '#feea88',
                      fontSize: '20px',
                      fontWeight: 800,
                      padding: '8px 16px 8px 80px',
                      borderRadius: '10px',
                      border: `2px solid ${orderType === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                      outline: 'none',
                      textAlign: 'right',
                      fontFamily: '"Sora", "Inter", sans-serif',
                      transition: 'all 200ms ease',
                      boxSizing: 'border-box'
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </>
          )}

          {/* Amount Input */}
          <label style={{ 
            fontSize: '12px', 
            fontWeight: 'bold', 
            color: '#feea88', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            marginBottom: '6px',
            marginLeft: '4px',
            display: 'block'
          }}>
            Amount
          </label>
          <div style={{
            position: 'relative',
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
          }}>
             <div style={{ 
               position: 'absolute', 
               left: '16px', 
               top: '50%', 
               transform: 'translateY(-50%)',
               pointerEvents: 'none',
               zIndex: 10
             }}>
              <span style={{ color: '#feea88', fontSize: '24px', fontWeight: 'bold' }}>$</span>
            </div>
            <div style={{
              position: 'relative',
              background: 'linear-gradient(180deg, #7f4108, #6f3906)',
              border: '1px solid rgba(255, 215, 165, 0.4)',
              borderRadius: '14px',
              padding: '3px',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08)'
            }}>
              <input
                type="number"
                className="no-spinner"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2))',
                    color: '#feea88',
                    fontSize: '28px',
                    fontWeight: 800,
                    padding: '8px 60px 8px 40px',
                    borderRadius: '10px',
                    border: `2px solid ${orderType === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                    outline: 'none',
                  textAlign: 'right',
                  fontFamily: '"Sora", "Inter", sans-serif',
                  transition: 'all 200ms ease',
                  boxSizing: 'border-box'
                }}
                placeholder="0.0"
                onFocus={(e) => {
                  e.target.style.border = `2px solid ${orderType === 'buy' ? '#4ade80' : '#f87171'}`;
                  e.target.style.boxShadow = `0 0 0 2px ${orderType === 'buy' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`;
                }}
                onBlur={(e) => {
                  e.target.style.border = `2px solid ${orderType === 'buy' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`;
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#fbbf24',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
                border: 'none',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}>
                {orderType === 'buy' ? <EthereumIcon /> : <QuestionMarkIcon />}
              </div>
            </div>
          </div>

          {/* Slippage Section */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px',
              alignItems: 'center'
            }}>
              <label style={{ 
                fontSize: '12px', 
                fontWeight: 'bold', 
                color: '#feea88', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em' 
              }}>
                Slippage %
              </label>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '80px', flexShrink: 0 }}>
                <input
                  type="number"
                  value={slippagePct}
                  onChange={(e) => setSlippagePct(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    background: 'linear-gradient(180deg, #7f4108, #6f3906)',
                    border: '1px solid rgba(255, 215, 165, 0.4)',
                    borderRadius: '8px',
                    color: '#feea88',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                {['0.1', '0.5', '1', '2'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSlippagePct(val)}
                    style={{
                      flex: 1,
                      height: '40px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: slippagePct === val ? '1px solid #fbbf24' : '1px solid rgba(255, 210, 160, 0.4)',
                      background: slippagePct === val ? 'rgba(251, 191, 36, 0.2)' : 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
                      color: '#feea88',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Amounts Grid */}
          <div
            className="mobile-quick-amounts-row"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
          {quickAmounts.map((label, idx) => {
               const isMax = label === 'Max';
               return (
                <button
                  key={idx}
                  onClick={() => handleQuickAmount(label)}
                  className="amount-button"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
                    border: '1px solid rgba(255, 210, 160, 0.4)',
                    borderRadius: '12px',
                    padding: '8px',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    color: '#feea88',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    textAlign: 'center',
                    gridColumn: isMax ? '1 / -1' : undefined,
                  }}
                >
                  {label}
                </button>
               );
            })}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={
              tradeType === 'market'
                ? (isConnecting || tradingState?.isTrading || (!isConnected ? false : !isReady))
                : (isPlacingLimit || !limitPrice)
            }
            style={{
              width: '100%',
              background: (tradeType === 'market'
                ? (!isConnected 
                    ? 'linear-gradient(180deg, #d4af37, #b8941f 60%, #a0821a)'
                    : activeGradient)
                : (limitPrice
                    ? activeGradient
                    : 'linear-gradient(180deg, #6b7280, #4b5563)')),
              color: (tradeType === 'market' && !isConnected) || limitPrice ? '#1f2937' : (tradeType === 'market' ? '#1f2937' : '#9ca3af'),
              fontWeight: 900,
              fontSize: '14px',
              padding: '12px',
              borderRadius: '16px',
              border: 'none',
              cursor: (
                tradeType === 'market'
                  ? (isConnecting || tradingState?.isTrading || (!isConnected ? false : !isReady)) ? 'not-allowed' : 'pointer'
                  : ((isPlacingLimit || !limitPrice) ? 'not-allowed' : 'pointer')
              ),
              transition: 'all 200ms ease',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)',
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginTop: 'auto'
            }}
          >
            {tradeType === 'market'
              ? (!isConnected 
                  ? (isConnecting ? 'CONNECTING...' : 'LOG IN')
                  : (tradingState?.isTrading ? `${orderType.toUpperCase()}ING...` : `CONFIRM ${orderType.toUpperCase()} TRADE`))
              : (isPlacingLimit ? `PLACING ${orderType.toUpperCase()}...` : `PLACE ${orderType.toUpperCase()} LIMIT ORDER`)}
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
      </div>
    </>
  );
};
