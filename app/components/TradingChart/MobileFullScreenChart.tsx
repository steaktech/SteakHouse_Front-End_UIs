"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, TrendingUp, TrendingDown, BarChart3, DollarSign, Clock, Target, Wallet, PieChart } from 'lucide-react';
import { TradingViewWidget } from './TradingViewWidget';
import { formatAmount } from './utils';

interface MobileFullScreenChartProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderType {
  id: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  filled: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: string;
}

interface Position {
  symbol: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export const MobileFullScreenChart: React.FC<MobileFullScreenChartProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'orders' | 'positions'>('chart');
  const [limitPrice, setLimitPrice] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  
  // Mock data for demonstration
  const [orders] = useState<OrderType[]>([
    {
      id: '1',
      type: 'buy',
      price: 21.45,
      amount: 1500,
      filled: 600,
      status: 'pending',
      timestamp: '10:45:32'
    },
    {
      id: '2',
      type: 'sell',
      price: 22.80,
      amount: 2200,
      filled: 2200,
      status: 'filled',
      timestamp: '10:42:15'
    },
    {
      id: '3',
      type: 'buy',
      price: 20.90,
      amount: 750,
      filled: 0,
      status: 'cancelled',
      timestamp: '10:38:20'
    }
  ]);

  const [position] = useState<Position>({
    symbol: 'SPACE',
    amount: 1250,
    avgPrice: 21.20,
    currentPrice: 21.50,
    pnl: 375.00,
    pnlPercent: 1.77
  });

  const handleLimitOrder = () => {
    if (!limitPrice || !limitAmount) return;
    
    // Here you would typically submit the order to your backend
    console.log(`${orderType.toUpperCase()} limit order: ${limitAmount} tokens at $${limitPrice}`);
    
    // Clear form
    setLimitPrice('');
    setLimitAmount('');
    
    // Show success message (you could implement a toast here)
    alert(`${orderType.toUpperCase()} limit order placed successfully!`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />
      
      {/* Main Container */}
      <div className="relative h-full w-full bg-[#07040b] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#472303] to-[#5a2d04] border-b border-[#daa20b]/30">
          <h1 className="text-[#daa20b] text-xl font-bold flex items-center gap-2">
            <BarChart3 size={24} />
            Trading Chart
          </h1>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          >
            <X size={20} className="text-[#daa20b]" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#1a0f05] border-b border-[#daa20b]/20">
          {[
            { key: 'chart', label: 'Chart', icon: <BarChart3 size={16} /> },
            { key: 'orders', label: 'Orders', icon: <Target size={16} /> },
            { key: 'positions', label: 'P&L', icon: <TrendingUp size={16} /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[#daa20b]/20 text-[#daa20b] border-b-2 border-[#daa20b]'
                  : 'text-[#daa20b]/60 hover:text-[#daa20b]/80'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Chart Tab */}
          {activeTab === 'chart' && (
            <div className="flex-1 flex flex-col">
              {/* Chart Container */}
              <div className="flex-1 bg-[#0a0508]">
                <TradingViewWidget symbol="BINANCE:SOLUSD" />
              </div>
              
              {/* Quick Limit Order Panel */}
              <div className="p-4 bg-gradient-to-t from-[#2d1300] to-[#1a0f05] border-t border-[#daa20b]/20">
                <h3 className="text-[#daa20b] text-sm font-semibold mb-3 flex items-center gap-2">
                  <Target size={16} />
                  Quick Limit Order
                </h3>
                
                {/* Order Type Toggle */}
                <div className="flex mb-3 bg-[#0a0508] rounded-lg p-1">
                  <button
                    onClick={() => setOrderType('buy')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      orderType === 'buy'
                        ? 'bg-green-600 text-white'
                        : 'text-[#daa20b]/60 hover:text-[#daa20b]'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setOrderType('sell')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      orderType === 'sell'
                        ? 'bg-red-600 text-white'
                        : 'text-[#daa20b]/60 hover:text-[#daa20b]'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[#daa20b]/70 text-xs mb-1">Price ($)</label>
                    <input
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#0a0508] border border-[#daa20b]/30 rounded-md px-3 py-2 text-[#daa20b] text-sm focus:outline-none focus:border-[#daa20b] focus:ring-1 focus:ring-[#daa20b]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[#daa20b]/70 text-xs mb-1">Amount</label>
                    <input
                      type="number"
                      value={limitAmount}
                      onChange={(e) => setLimitAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-[#0a0508] border border-[#daa20b]/30 rounded-md px-3 py-2 text-[#daa20b] text-sm focus:outline-none focus:border-[#daa20b] focus:ring-1 focus:ring-[#daa20b]/50"
                    />
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handleLimitOrder}
                  disabled={!limitPrice || !limitAmount}
                  className={`w-full py-3 rounded-lg font-medium transition-all ${
                    orderType === 'buy'
                      ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-600/50'
                      : 'bg-red-600 hover:bg-red-700 disabled:bg-red-600/50'
                  } text-white disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  Place {orderType.toUpperCase()} Limit Order
                </button>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="flex-1 p-4 bg-[#0a0508]">
              <h3 className="text-[#daa20b] text-lg font-semibold mb-4 flex items-center gap-2">
                <Target size={20} />
                Limit Orders
              </h3>
              
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-[#1a0f05] border border-[#daa20b]/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {order.type === 'buy' ? (
                          <TrendingUp className="text-green-500" size={16} />
                        ) : (
                          <TrendingDown className="text-red-500" size={16} />
                        )}
                        <span className={`font-medium ${
                          order.type === 'buy' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {order.type.toUpperCase()}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'filled' ? 'bg-green-600/20 text-green-400' :
                        order.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[#daa20b]/60">Price:</span>
                        <span className="text-[#daa20b] ml-1">${order.price}</span>
                      </div>
                      <div>
                        <span className="text-[#daa20b]/60">Amount:</span>
                        <span className="text-[#daa20b] ml-1">{formatAmount(order.amount)}</span>
                      </div>
                      <div>
                        <span className="text-[#daa20b]/60">Filled:</span>
                        <span className="text-[#daa20b] ml-1">{formatAmount(order.filled)}/{formatAmount(order.amount)}</span>
                      </div>
                      <div>
                        <span className="text-[#daa20b]/60">Time:</span>
                        <span className="text-[#daa20b] ml-1">{order.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Positions/P&L Tab */}
          {activeTab === 'positions' && (
            <div className="flex-1 p-4 bg-[#0a0508]">
              <h3 className="text-[#daa20b] text-lg font-semibold mb-4 flex items-center gap-2">
                <Wallet size={20} />
                Your Position
              </h3>
              
              <div className="bg-[#1a0f05] border border-[#daa20b]/20 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[#daa20b] font-semibold text-lg">{position.symbol}</h4>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${position.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.pnl > 0 ? '+' : ''}${position.pnl.toFixed(2)}
                    </div>
                    <div className={`text-sm ${position.pnlPercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.pnlPercent > 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#daa20b]/60">Amount:</span>
                      <span className="text-[#daa20b]">{formatAmount(position.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#daa20b]/60">Avg Price:</span>
                      <span className="text-[#daa20b]">${position.avgPrice}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#daa20b]/60">Current Price:</span>
                      <span className="text-[#daa20b]">${position.currentPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#daa20b]/60">Total Value:</span>
                      <span className="text-[#daa20b]">${(position.amount * position.currentPrice).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-[#daa20b] font-medium">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <TrendingDown size={16} />
                    Sell 25%
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <TrendingDown size={16} />
                    Sell 50%
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <TrendingDown size={16} />
                    Sell 75%
                  </button>
                  <button className="bg-red-700 hover:bg-red-800 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                    <X size={16} />
                    Sell All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
