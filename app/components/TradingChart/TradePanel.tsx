"use client";

import React, { useState } from 'react';

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

export const TradePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('0');

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
            <button className="preset-btn transition-colors duration-200 active:translate-y-px">Buy max TX</button>
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
      <button className={`w-full font-bold py-4 rounded-lg text-lg transition-colors duration-300 ${
        activeTab === 'buy'
          ? 'bg-[#0a8834] hover:bg-green-700 text-[#2f1805]' // Changed background and text color
          : 'bg-[#a71c1c] hover:bg-red-700 text-[#2f1805]'
      }`}>
        CONFIRM TRADE
      </button>
    </div>
  );
};