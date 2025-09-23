"use client";

import React, { useState } from 'react';
import Header from '@/app/components/Header';
import TrendingBar from "@/app/components/TrendingBar";
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomBar } from './MobileSidebar';
import { TradingView } from './TradingView';
import { TradeHistory } from './TradeHistory';
import { MarketInfo } from './MarketInfo';
import { TradePanel } from './TradePanel';
import { TokenCard } from '@/app/components/TradingDashboard/TokenCard';
import { TokenCardProps } from '@/app/components/TradingDashboard/types';
import { TradingTokenCard } from './TradingTokenCard';
// MODIFIED: Added ChevronUp for the new button icon
import { X } from 'lucide-react';

export default function TradingChart() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarExpanded, setMobileSidebarExpanded] = useState(false);
  const [isMobileTradeOpen, setIsMobileTradeOpen] = useState(false);
  const [selectedTradeTab, setSelectedTradeTab] = useState<'buy' | 'sell'>('buy');
  const [transactionsHeight, setTransactionsHeight] = useState(160); // Default height
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(0);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Sample token data for the TokenCard
  const sampleTokenData: TokenCardProps = {
    isOneStop: false,
    imageUrl: '/images/info_icon.jpg',
    name: 'SpaceMan',
    symbol: 'SPACE',
    tag: 'Meme',
    tagColor: '#fade79',
    description: 'Spaceman is a meme deflationary token with a finite supply and buyback and burn mechanism.',
    mcap: '$21.5K',
    liquidity: '$2.3K',
    volume: '$6.2K',
    progress: 82
  };


  // BUY inner style (green glossy pill)
  const buyInnerStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #6ef0a1, #34d37a 60%, #23bd6a)',
    borderRadius: '16px',
    padding: '14px 16px',
    textAlign: 'center',
    fontWeight: 800,
    color: '#1f2937',
    letterSpacing: '0.5px',
    width: '100%',
    boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -6px 12px rgba(0,0,0,0.18)'
  };

  // SELL inner style (red glossy pill)
  const sellInnerStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #ffb1a6, #ff7a6f 60%, #ff5b58)',
    borderRadius: '16px',
    padding: '14px 16px',
    textAlign: 'center',
    fontWeight: 800,
    color: '#2b1b14',
    letterSpacing: '0.5px',
    width: '100%',
    boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -6px 12px rgba(0,0,0,0.18)'
  };

  // Drag handlers for resizing transactions
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartHeight(transactionsHeight);
    e.preventDefault();
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = dragStartY - e.clientY; // Inverted: drag up = positive = increase height
    const newHeight = dragStartHeight + deltaY;
    
    const minHeight = 80;
    const maxHeight = Math.min(400, window.innerHeight * 0.6);
    
    setTransactionsHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
  }, [isDragging, dragStartY, dragStartHeight]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Copy to clipboard function
  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedItem(itemId);
        setTimeout(() => setCopiedItem(null), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // Handlers for Buy/Sell buttons
  const handleBuyClick = () => {
    setSelectedTradeTab('buy');
    setIsMobileTradeOpen(true);
  };

  const handleSellClick = () => {
    setSelectedTradeTab('sell');
    setIsMobileTradeOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-[#07040b]">
      {/* Header */}
      <Header />


      <div className="flex flex-1 text-white font-sans overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DesktopSidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
        </div>
        
        <main 
          className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] lg:grid-rows-[1fr_350px] gap-2 p-2 lg:pb-2 overflow-y-auto custom-scrollbar scrollbar scrollbar-w-2 scrollbar-track-gray-100 scrollbar-thumb-gray-700 scrollbar-thumb-rounded"
          style={{
            paddingBottom: isMobile ? `${transactionsHeight + 80}px` : '8px'
          }}
        >
          
          {/* Trading Chart */}
          <div className="order-1 lg:col-start-1 lg:row-start-1">
            <TradingView />
          </div>

          {/* Token Card (desktop only) */}
          <div className="hidden lg:flex lg:col-start-2 lg:row-start-1 justify-center items-stretch p-0 m-0">
            <TradingTokenCard {...sampleTokenData} />
          </div>

          {/* Trade Panel (desktop only) */}
          <div className="hidden lg:block lg:col-start-2 lg:row-start-2">
            <TradePanel />
          </div>

          {/* Trade History (desktop only) */}
          <div className="hidden lg:block lg:col-start-1 lg:row-start-2">
            <TradeHistory />
          </div>

        </main>
      </div>
      
      {/* Recent Transactions Widget (Mobile) */}
      <div 
        className="lg:hidden bg-gradient-to-t from-[#472303] to-[#5a2d04] border-t border-[#daa20b]/30 relative"
        style={{ height: `${transactionsHeight}px` }}
      >
        {/* Drag Handle */}
        <div 
          className={`absolute top-0 left-0 right-0 h-3 cursor-row-resize flex items-center justify-center hover:bg-[#daa20b]/10 transition-colors group ${isDragging ? 'bg-[#daa20b]/20' : ''}`}
          onMouseDown={handleMouseDown}
          style={{ zIndex: 10 }}
        >
          <div className={`w-12 h-1 bg-[#daa20b]/40 rounded-full group-hover:bg-[#daa20b]/60 transition-colors ${isDragging ? 'bg-[#daa20b]/80' : ''}`}></div>
        </div>
        
        <div className="px-4 py-3 pt-6 h-full flex flex-col">
          <h3 className="text-[#daa20b] font-bold text-sm mb-3 tracking-wide">RECENT TRANSACTIONS</h3>
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {/* Mock transaction data */}
            {[
              { 
                type: 'Buy', 
                amount: '1.25K ASTER', 
                ethAmount: '0.0032 ETH',
                price: '$1.43', 
                time: '2m ago',
                fullDate: '2024-01-15 14:23:45 UTC',
                address: '0x742d35Cc6C4b73C2C4c02B8b8f42e62e2E5F6f12',
                txHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
                positive: true 
              },
              { 
                type: 'Sell', 
                amount: '850 ASTER', 
                ethAmount: '0.0025 ETH',
                price: '$1.44', 
                time: '5m ago',
                fullDate: '2024-01-15 14:18:12 UTC',
                address: '0x8f9e2a1b3c4d5e6f7890123456789012345678ab',
                txHash: '0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
                positive: false 
              },
              { 
                type: 'Buy', 
                amount: '2.1K ASTER', 
                ethAmount: '0.0055 ETH',
                price: '$1.42', 
                time: '8m ago',
                fullDate: '2024-01-15 14:15:33 UTC',
                address: '0x123456789012345678901234567890123456789a',
                txHash: '0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef123456789a',
                positive: true 
              },
              { 
                type: 'Sell', 
                amount: '750 ASTER', 
                ethAmount: '0.0021 ETH',
                price: '$1.45', 
                time: '12m ago',
                fullDate: '2024-01-15 14:11:07 UTC',
                address: '0xabcdef1234567890123456789012345678901234',
                txHash: '0xd4e5f6789012345678901234567890abcdef1234567890abcdef123456789abc',
                positive: false 
              },
              { 
                type: 'Buy', 
                amount: '3.2K ASTER', 
                ethAmount: '0.0089 ETH',
                price: '$1.41', 
                time: '15m ago',
                fullDate: '2024-01-15 14:08:19 UTC',
                address: '0x567890123456789012345678901234567890abcd',
                txHash: '0xe5f6789012345678901234567890abcdef1234567890abcdef123456789abcde',
                positive: true 
              },
              { 
                type: 'Sell', 
                amount: '1.8K ASTER', 
                ethAmount: '0.0048 ETH',
                price: '$1.46', 
                time: '18m ago',
                fullDate: '2024-01-15 14:05:42 UTC',
                address: '0x9012345678901234567890123456789012345678',
                txHash: '0xf6789012345678901234567890abcdef1234567890abcdef123456789abcdef1',
                positive: false 
              },
            ].map((tx, index) => (
              <div key={index} className="py-2 px-3 bg-gradient-to-r from-[#7f4108] to-[#6f3906] border border-[#daa20b]/30 rounded-lg space-y-1.5">
                {/* Main Transaction Row - Now on top */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Compact Buy/Sell Icon */}
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${
                      tx.positive 
                        ? 'bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-black border-green-300' 
                        : 'bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white border-red-300'
                    }`}>
                      {tx.positive ? '↗' : '↘'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${
                          tx.positive ? 'text-[#4ade80]' : 'text-[#ef4444]'
                        }`}>
                          {tx.type.toUpperCase()}
                        </span>
                        <span className="text-[#feea88] text-xs">{tx.amount}</span>
                        <span className="text-[#daa20b] text-xs">({tx.ethAmount})</span>
                      </div>
                      <div className="text-[#daa20b] text-xs font-medium">{tx.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#feea88] text-sm font-bold">{tx.price}</div>
                  </div>
                </div>
                
                {/* TX Hash Row - Moved below */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#daa20b]/60 font-medium">TX:</span>
                  <button
                    onClick={() => copyToClipboard(tx.txHash, `txhash-${index}`)}
                    className={`text-[#feea88] font-mono bg-black/20 px-1.5 py-0.5 rounded flex-1 break-all hover:bg-black/40 transition-all cursor-pointer text-left text-xs ${
                      copiedItem === `txhash-${index}` ? 'bg-green-900/40 text-green-300' : ''
                    }`}
                    title="Click to copy transaction hash"
                  >
                    {copiedItem === `txhash-${index}` ? '✓ Copied!' : tx.txHash}
                  </button>
                  <button 
                    onClick={() => window.open(`https://etherscan.io/tx/${tx.txHash}`, '_blank')}
                    className="hover:opacity-80 transition-opacity flex-shrink-0" 
                    title="View on Etherscan"
                  >
                    <img 
                      src="/images/etherscan_logo.webp" 
                      alt="Etherscan" 
                      className="w-4 h-4" 
                    />
                  </button>
                </div>
                
                {/* Address and Date Row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#daa20b]/60">From:</span>
                    <button
                      onClick={() => copyToClipboard(tx.address, `address-${index}`)}
                      className={`text-[#feea88] font-mono bg-black/20 px-1.5 py-0.5 rounded hover:bg-black/40 transition-all cursor-pointer text-xs ${
                        copiedItem === `address-${index}` ? 'bg-green-900/40 text-green-300' : ''
                      }`}
                      title="Click to copy address"
                    >
                      {copiedItem === `address-${index}` ? '✓' : `${tx.address.slice(0, 6)}...${tx.address.slice(-4)}`}
                    </button>
                  </div>
                  <div className="text-[#daa20b]/70 text-xs">{tx.fullDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Fixed Buy/Sell bar for mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#472303] to-[#5a2d04] border-t border-[#daa20b]/30">
        <div className="px-4 py-3 grid grid-cols-2 gap-3 max-w-screen-md mx-auto">
          <button onClick={handleBuyClick} type="button" className="w-full p-0 bg-transparent">
            <div style={buyInnerStyle}>BUY</div>
          </button>
          <button onClick={handleSellClick} type="button" className="w-full p-0 bg-transparent">
            <div style={sellInnerStyle}>SELL</div>
          </button>
        </div>
      </div>

      {/* Mobile trade modal */}
      {isMobileTradeOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsMobileTradeOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-[92vw] max-w-[480px] max-h-[85vh] rounded-2xl border border-[#daa20b]/30 bg-[#07040b] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#472303] to-[#5a2d04] border-b border-[#daa20b]/30">
                <h2 className="text-[#daa20b] font-semibold">Trade</h2>
                <button onClick={() => setIsMobileTradeOpen(false)} className="p-2" type="button">
                  <X className="text-[#daa20b]" size={20} />
                </button>
              </div>
              <div className="p-3 overflow-y-auto">
                <TradePanel initialTab={selectedTradeTab} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}