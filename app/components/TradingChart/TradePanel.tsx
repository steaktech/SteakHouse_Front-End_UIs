"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useWallet } from '@/app/hooks/useWallet';
import { useTrading } from '@/app/hooks/useTrading';
import { getMaxTxInfo, extractEthToCurve } from '@/app/lib/api/services/blockchainService';
import { useToastHelpers } from '@/app/lib/providers/ToastProvider';

const WalletModal = dynamic(
  () => import("../Modals/WalletModal/WalletModal"),
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

interface TradePanelProps {
  tokenAddress?: string;
}

export const TradePanel: React.FC<TradePanelProps> = ({ 
  tokenAddress = "0x9b7E4E284487952c14891865A11C063886e2c6Ce" 
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('0');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isLoadingMaxTx, setIsLoadingMaxTx] = useState(false);
  
  const { isConnected, isConnecting } = useWallet();
  const { tradingState, buyToken, sellToken, clearStatus, isReady } = useTrading();
  const { showError, showSuccess } = useToastHelpers();

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
    // console.log('🎯 Trade button clicked', {
    //   activeTab,
    //   amount,
    //   tokenAddress,
    //   isConnected,
    //   isReady,
    //   tradingState: tradingState.isTrading
    // });

    // If wallet not connected, open wallet modal
    if (!isConnected) {
      //console.log('👛 Wallet not connected, opening modal');
      setIsWalletModalOpen(true);
      return;
    }

    // If already trading, ignore click
    if (tradingState.isTrading) {
      //console.log('⏳ Already trading, ignoring click');
      return;
    }

    // If no amount entered, ignore
    if (!amount || parseFloat(amount) <= 0) {
      //console.log('❌ No valid amount entered:', amount);
      return;
    }

    // Clear any previous status
    clearStatus();

    try {
      if (activeTab === 'buy') {
        //console.log('🟢 Executing BUY transaction...');
        
        // 🔍 DEBUG: Test basic conversions before calling buyToken
        // console.log('🧪 Pre-transaction Debug:', {
        //   inputAmount: amount,
        //   inputType: typeof amount,
        //   parsedAmount: parseFloat(amount),
        //   isValidNumber: !isNaN(parseFloat(amount)),
        //   tokenAddress: tokenAddress,
        //   addressLength: tokenAddress?.length
        // });
        
        await buyToken(tokenAddress, amount);
      } else {
        //console.log('🔴 Executing SELL transaction...');
        
        // 🔍 DEBUG: Test ETH amount conversion for sell
        // console.log('🧪 Pre-sell Debug:', {
        //   inputAmount: amount,
        //   inputType: typeof amount,
        //   parsedAmount: parseFloat(amount),
        //   isValidNumber: !isNaN(parseFloat(amount)),
        //   tokenAddress: tokenAddress,
        //   note: 'Selling with ETH amount - will be converted to token amount in service'
        // });
        
        // For sell, we pass the ETH amount and let the service handle the conversion
        await sellToken(tokenAddress, amount);
      }
    } catch (error) {
      console.error('❌ Trade execution failed:', error);
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
      padding: 'clamp(16px, 3vh, 22px)',
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
        marginBottom: 'clamp(12px, 2vh, 16px)',
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
        marginBottom: 'clamp(12px, 2vh, 16px)',
        gap: 'clamp(4px, 1vw, 8px)',
        flexWrap: 'wrap'
      }}>
        <button style={{
          background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
          border: '1px solid rgba(255, 210, 160, 0.4)',
          borderRadius: 'clamp(8px, 1.8vw, 12px)',
          padding: 'clamp(4px, 0.8vh, 6px) clamp(6px, 1.2vw, 8px)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          color: '#feea88',
          fontSize: 'clamp(8px, 1.4vw, 10px)',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 200ms ease',
          flex: 1
        }}>
          Switch to REAL
        </button>

        <button 
          onClick={handleBuyMaxTx}
          disabled={isLoadingMaxTx}
          style={{
          background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
          border: '1px solid rgba(255, 210, 160, 0.4)',
          borderRadius: 'clamp(8px, 1.8vw, 12px)',
          padding: 'clamp(4px, 0.8vh, 6px) clamp(6px, 1.2vw, 8px)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          color: '#feea88',
          fontSize: 'clamp(8px, 1.4vw, 10px)',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 200ms ease',
          flex: 1,
          opacity: isLoadingMaxTx ? 0.5 : 1
        }}>{isLoadingMaxTx ? 'Loading...' : 'Buy max TX'}</button>

        <button style={{
          background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
          border: '1px solid rgba(255, 210, 160, 0.4)',
          borderRadius: 'clamp(8px, 1.8vw, 12px)',
          padding: 'clamp(4px, 0.8vh, 6px) clamp(6px, 1.2vw, 8px)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          color: '#feea88',
          fontSize: 'clamp(8px, 1.4vw, 10px)',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 200ms ease',
          flex: 1
        }}>Set max slippage</button>
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
            <EthereumIcon />
          </button>
        </div>
      </div>

      {/* Preset Amounts - All on same line */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'clamp(6px, 1.5vh, 14px)',
        gap: 'clamp(3px, 0.8vw, 6px)'
      }}>
        <button
          onClick={() => handleQuickAmount('Reset')}
          style={{
            background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
            border: '1px solid rgba(255, 210, 160, 0.4)',
            borderRadius: 'clamp(8px, 1.8vw, 12px)',
            padding: 'clamp(4px, 0.8vh, 6px) clamp(6px, 1.2vw, 8px)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            color: '#feea88',
            fontSize: 'clamp(8px, 1.4vw, 10px)',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 200ms ease',
            flex: 1
          }}
        >
          Reset
        </button>
        {quickAmounts.map((preset) => (
          <button
            key={preset}
            onClick={() => handleQuickAmount(preset)}
            style={{
              background: 'linear-gradient(180deg, rgba(255, 224, 185, 0.2), rgba(60, 32, 18, 0.32))',
              border: '1px solid rgba(255, 210, 160, 0.4)',
              borderRadius: 'clamp(8px, 1.8vw, 12px)',
              padding: 'clamp(4px, 0.8vh, 6px) clamp(6px, 1.2vw, 8px)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              color: '#feea88',
              fontSize: 'clamp(8px, 1.4vw, 10px)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 200ms ease',
              flex: 1
            }}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirmTrade}
        disabled={isConnecting || tradingState.isTrading || (!isConnected ? false : !isReady)}
        style={{
          width: '100%',
          background: !isConnected 
            ? 'linear-gradient(180deg, #d4af37, #b8941f)'
            : activeTab === 'buy'
              ? 'linear-gradient(180deg, #4ade80, #22c55e)'
              : 'linear-gradient(180deg, #f87171, #ef4444)',
          color: '#1f2937',
          fontWeight: 800,
          fontSize: 'clamp(16px, 3.2vw, 20px)',
          padding: 'clamp(14px, 3vh, 18px)',
          borderRadius: 'clamp(14px, 3vw, 20px)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 200ms ease',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)',
          textShadow: '0 1px 0 rgba(255, 255, 255, 0.3)',
          marginTop: 'auto',
          flexShrink: 0,
          letterSpacing: '0.5px',
          opacity: (isConnecting || tradingState.isTrading || (!isConnected ? false : !isReady)) ? 0.5 : 1
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 6px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)';
        }}
      >
        {!isConnected 
          ? (isConnecting ? 'CONNECTING...' : 'LOG IN')
          : tradingState.isTrading
            ? `${activeTab.toUpperCase()}ING...`
            : 'CONFIRM TRADE'
        }
      </button>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        isConnected={isConnected}
      />
      </div>
    </>
  );
};