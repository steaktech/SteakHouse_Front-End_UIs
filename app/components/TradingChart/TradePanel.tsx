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
    <div className="box-shadow-1 bg-[#2d1300] rounded-2xl p-5 border-2 border-amber-600/30 shadow-lg h-full flex flex-col">
      {/* Buy/Sell Tabs - Sliding Switch Style */}
      <div className="relative flex w-full h-[calc(54px)] rounded-xl bg-[#07040b] mb-4 border border-gray-700/50">
        {/* Sliding Background */}
        <div
          className={`absolute top-0.5 left-0 h-[calc(100%-4px)] w-1/2 rounded-xl transition-all duration-300 ease-in-out
            ${activeTab === 'buy' 
              ? 'translate-x-0 bg-[#2a882f]' // Changed background color
              : 'translate-x-full bg-red-600'
            }`}
        />
        <button
          onClick={() => setActiveTab('buy')}
          className={`relative z-10 flex-1 py-1.5 text-center text-lg font-bold
            ${activeTab === 'buy' 
              ? 'text-[#93eca8] border buy-btn-active rounded-xl mr-0.5  transition-all duration-100 delay-300 ' // Changed text color
              : 'text-[#fff4da] border border-transparent rounded-xl mr-0.5 transition-all duration-100 delay-0 hover:opacity-80'
            }`}
        >
          BUY
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`relative z-10 flex-1 py-1.5 text-center text-lg font-bold
            ${activeTab === 'sell'
              ? 'text-[#ff3b3b] border sell-btn-active rounded-xl ml-0.5  transition-all duration-100 delay-300'
              : 'text-[#fff4da] border border-transparent rounded-xl ml-0.5 transition-all duration-100 delay-0 hover:opacity-80'
            }`}
        >
          SELL
        </button>
      </div>

      {/* Action Links */}
      <div className="flex justify-between items-center mb-4 text-xs">
        <div className="
          bg-[#2c1402] rounded-full px-3 py-1 
          transition-all duration-150
          shadow-[inset_1px_1px_2px_#4e2a07,inset_-1px_-1px_2px_#1e0e01]
          active:shadow-[inset_1px_1px_3px_#1e0e01]">

          <button className="preset-btn transition-colors duration-200 active:translate-y-px">
            Switch to REAL
          </button>
        </div>

        <div className="flex space-x-2">
          <div className="bg-[#2c1402] rounded-full px-3 py-1 
          transition-all duration-150
          shadow-[inset_1px_1px_2px_#4e2a07,inset_-1px_-1px_2px_#1e0e01]
          active:shadow-[inset_1px_1px_3px_#1e0e01]">
            <button 
              onClick={handleBuyMaxTx}
              disabled={isLoadingMaxTx}
              className="preset-btn transition-colors duration-200 active:translate-y-px disabled:opacity-50"
            >
              {isLoadingMaxTx ? 'Loading...' : 'Buy max TX'}
            </button>
          </div>
          <div className="bg-[#2c1402] rounded-full px-3 py-1 
          transition-all duration-150
          shadow-[inset_1px_1px_2px_#4e2a07,inset_-1px_-1px_2px_#1e0e01]
          active:shadow-[inset_1px_1px_3px_#1e0e01]">
            <button className="preset-btn transition-colors duration-200 active:translate-y-px">Set max slippage</button>
          </div>
        </div>
      </div>
      
      {/* Amount Input */}
      <div className="relative mb-4 flex-grow flex flex-col justify-center">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`w-full bg-[#07040b] text-[#f8ead3] text-3xl p-6 rounded-xl border border-[#321806] focus:outline-none focus:ring-2 text-left h-[65px] overflow-hidden [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-scrollbar]:hidden [-moz-appearance:textfield] ${
            activeTab === 'buy' 
              ? 'focus:ring-[#2a882f]' 
              : 'focus:ring-[#95231e]'
          }`}
          placeholder="0"
        />
        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#f8ead3] rounded-full p-2 text-gray-700">
          <EthereumIcon />
        </button>
      </div>

      {/* Preset Amounts */}
      <div className="flex justify-between items-center mb-6 text-xs">
        <div className="bg-[#2c1402] rounded-full px-3 py-1 
          transition-all duration-150
          shadow-[inset_1px_1px_2px_#4e2a07,inset_-1px_-1px_2px_#1e0e01]
          active:shadow-[inset_1px_1px_3px_#1e0e01]">
          <button onClick={() => handleQuickAmount('Reset')} className=" transition-colors duration-200 preset-btn">Reset</button>
        </div>
        {quickAmounts.map((preset) => (
          <div key={preset} className="bg-[#2c1402] rounded-full px-3 py-1 
          transition-all duration-150
          shadow-[inset_1px_1px_2px_#4e2a07,inset_-1px_-1px_2px_#1e0e01]
          active:shadow-[inset_1px_1px_3px_#1e0e01]">
            <button 
              onClick={() => handleQuickAmount(preset)}
              className="preset-btn transition-colors duration-200"
            >
              {preset}
            </button>
          </div>
        ))}
      </div>
              
      {/* Confirm Button */}
      <button 
        onClick={handleConfirmTrade}
        disabled={isConnecting || tradingState.isTrading || (!isConnected ? false : !isReady)}
        className={`w-full font-bold py-4 rounded-lg text-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
          !isConnected 
            ? 'bg-[#d4af37] hover:bg-[#b8941f] text-[#2f1805]'
            : activeTab === 'buy'
              ? 'bg-[#0a8834] hover:bg-green-700 text-[#2f1805]' // Changed background and text color
              : 'bg-[#a71c1c] hover:bg-red-700 text-[#2f1805]'
        }`}
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
  );
};