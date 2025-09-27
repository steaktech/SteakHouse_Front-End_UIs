"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { TradeWidget } from '../Widgets/TradeWidget';
import { MobileBottomBar } from './MobileSidebar';
import { ChevronUp, Loader2 } from 'lucide-react';
import { useRecentTrades } from '@/app/hooks/useRecentTrades';
import { truncateAddress } from '@/app/lib/utils/tradeUtils';

interface MobileTradeInterfaceProps {
  tokenAddress: string;
  onChartFullscreen?: () => void;
  mobileSidebarExpanded: boolean;
  setMobileSidebarExpanded: (expanded: boolean) => void;
}

export const MobileTradeInterface: React.FC<MobileTradeInterfaceProps> = ({ 
  tokenAddress, 
  onChartFullscreen, 
  mobileSidebarExpanded, 
  setMobileSidebarExpanded 
}) => {
  const [isMobileTradeOpen, setIsMobileTradeOpen] = useState(false);
  const [selectedTradeTab, setSelectedTradeTab] = useState<'buy' | 'sell'>('buy');
  const [transactionsHeight, setTransactionsHeight] = useState(160);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(0);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  
  // Fetch recent trades data
  const { trades: recentTrades, isLoading: tradesLoading, error: tradesError } = useRecentTrades({ 
    tokenAddress, 
    maxTrades: 20 
  });

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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = dragStartY - e.clientY;
    const newHeight = dragStartHeight + deltaY;
    
    const minHeight = 80;
    const maxHeight = Math.min(400, window.innerHeight * 0.6);
    
    setTransactionsHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
  }, [isDragging, dragStartY, dragStartHeight]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Event listeners
  useEffect(() => {
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
  useEffect(() => {
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
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
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


  if (!isMobile) return null;

  return (
    <>
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
            {tradesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="text-[#daa20b] animate-spin" />
                <span className="ml-2 text-[#daa20b] text-sm">Loading transactions...</span>
              </div>
            ) : tradesError ? (
              <div className="text-center py-8">
                <p className="text-red-400 text-sm mb-2">Failed to load transactions</p>
                <p className="text-[#daa20b]/60 text-xs">{tradesError}</p>
              </div>
            ) : recentTrades.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#daa20b]/60 text-sm">No recent transactions</p>
              </div>
            ) : (
              recentTrades.map((tx, index) => (
              <div key={index} className="py-2 px-3 bg-gradient-to-r from-[#7f4108] to-[#6f3906] border border-[#daa20b]/30 rounded-lg space-y-1.5">
                {/* Main Transaction Row */}
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
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${
                        tx.positive ? 'text-[#4ade80]' : 'text-[#ef4444]'
                      }`}>
                        {tx.type.toUpperCase()}
                      </span>
                      <span className="text-[#feea88] text-xs">{tx.amount}</span>
                      <span className="text-[#daa20b] text-xs">({tx.ethAmount})</span>
                      <span className="text-[#daa20b] text-xs font-medium">{tx.time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#feea88] text-sm font-bold">{tx.price}</div>
                  </div>
                </div>
                
                {/* From Address and Date Row */}
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
                      {copiedItem === `address-${index}` ? '✓' : truncateAddress(tx.address)}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[#daa20b]/70 text-xs">{tx.fullDate}</div>
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
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Fixed Buy/Sell bar for mobile */}
      <div className="lg:hidden fixed bottom-12 left-0 right-0 z-40 bg-gradient-to-t from-[#472303] to-[#5a2d04] border-t border-[#daa20b]/30">
        <div className="px-4 py-3 grid grid-cols-2 gap-3 max-w-screen-md mx-auto">
          <button onClick={handleBuyClick} type="button" className="w-full p-0 bg-transparent">
            <div style={buyInnerStyle}>BUY</div>
          </button>
          <button onClick={handleSellClick} type="button" className="w-full p-0 bg-transparent">
            <div style={sellInnerStyle}>SELL</div>
          </button>
        </div>
      </div>

      {/* Widgets Button */}
      <button
        onClick={() => setMobileSidebarExpanded(true)}
        className={`
          lg:hidden fixed bottom-0 left-0 right-0 z-30
          flex items-center justify-center gap-2
          h-12 px-4
          bg-gradient-to-t from-[#472303] to-[#5a2d04]
          border-t border-[#daa20b]/30
          text-[#daa20b]
          shadow-[0_-5px_20px_rgba(0,0,0,0.5)]
          group
          transition-opacity duration-300 ease-in-out
          hover:bg-[#1a1710]
          ${mobileSidebarExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
        type="button"
      >
        <ChevronUp size={20} className="transition-transform duration-200 group-hover:-translate-y-1" />
        <span className="font-semibold tracking-wider text-sm">WIDGETS</span>
      </button>

      {/* Mobile trade modal using TradeWidget */}
      <TradeWidget
        isOpen={isMobileTradeOpen}
        onClose={() => setIsMobileTradeOpen(false)}
        tokenAddress={tokenAddress}
        defaultTab={selectedTradeTab}
      />
    </>
  );
};
