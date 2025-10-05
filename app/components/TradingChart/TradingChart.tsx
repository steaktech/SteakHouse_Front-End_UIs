"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';
import TrendingBar from "@/app/components/TrendingBar";
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomBar } from './MobileSidebar';
import { TradingView } from './TradingView';
import { TradeHistory } from './TradeHistory';
import { MarketInfo } from './MarketInfo';
import { TradePanel } from './TradePanel';
import { LimitOrderPanel } from './LimitOrderPanel';
import { LimitOrderBook } from './LimitOrderBook';
import { CompactLimitOrderBook } from './CompactLimitOrderBook';
import { TokenCard } from '@/app/components/TradingDashboard/TokenCard';
import { TokenCardProps } from '@/app/components/TradingDashboard/types';
import { TradingTokenCard } from './TradingTokenCard';
import { useOrderManagement } from './useOrderManagement';
import { useNotifications } from './useNotifications';
import { OrderNotification } from './OrderNotification';
// MODIFIED: Added ChevronUp for the new button icon
import { X } from 'lucide-react';

export default function TradingChart() {
  const searchParams = useSearchParams();
  const tokenSymbol = searchParams.get('symbol');
  
  // Order management and notifications
  const notifications = useNotifications();
  const orderManagement = useOrderManagement();
  
  // Enhanced order handlers with notifications
  const handleOrderSubmit = async (orderData: any) => {
    const result = await orderManagement.createOrder(orderData);
    
    if (result.success) {
      notifications.notifySuccess(
        'Order Placed', 
        result.message, 
        result.orderId
      );
    } else {
      notifications.notifyError(
        'Order Failed', 
        result.message
      );
    }
    
    return result;
  };
  
  const handleOrderCancel = async (orderId: string) => {
    const success = await orderManagement.cancelOrder(orderId);
    
    if (success) {
      notifications.notifySuccess('Order Cancelled', 'Order has been successfully cancelled', orderId);
    } else {
      notifications.notifyError('Cancellation Failed', 'Failed to cancel order');
    }
    
    return success;
  };
  
  const handleOrderModify = async (orderId: string, newPrice: number, newAmount: number) => {
    const success = await orderManagement.modifyOrder(orderId, newPrice, newAmount);
    
    if (success) {
      notifications.notifySuccess('Order Modified', 'Order has been successfully updated', orderId);
    } else {
      notifications.notifyError('Modification Failed', 'Failed to modify order');
    }
    
    return success;
  };
  
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarExpanded, setMobileSidebarExpanded] = useState(false);
  const [isMobileTradeOpen, setIsMobileTradeOpen] = useState(false);
  const [selectedTradeTab, setSelectedTradeTab] = useState<'buy' | 'sell' | 'limit'>('buy');
  const [desktopTradeTab, setDesktopTradeTab] = useState<'buy' | 'sell' | 'limit'>('buy');
  const [transactionsHeight, setTransactionsHeight] = useState(160); // Default height
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(0);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showLimitOrders, setShowLimitOrders] = useState(false);
  const [tokenData, setTokenData] = useState<TokenCardProps>({
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
  });

  // Load token data based on URL parameter
  useEffect(() => {
    if (tokenSymbol) {
      // TODO: Fetch token data from API based on symbol
      // For now, we'll update the symbol in the existing data
      setTokenData(prev => ({
        ...prev,
        symbol: tokenSymbol,
        name: tokenSymbol // You can update this when you fetch from API
      }));
    }
  }, [tokenSymbol]);


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

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
    setDragStartHeight(transactionsHeight);
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10); // Short vibration
    }
    e.preventDefault();
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = dragStartY - e.clientY; // Inverted: drag up = positive = increase height
    const newHeight = dragStartHeight + deltaY;
    
    const minHeight = 56; // Keep button visible (expand button height + padding)
    const maxHeight = Math.min(400, window.innerHeight * 0.6);
    
    setTransactionsHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
  }, [isDragging, dragStartY, dragStartHeight]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    
    const deltaY = dragStartY - e.touches[0].clientY; // Inverted: drag up = positive = increase height
    const newHeight = dragStartHeight + deltaY;
    
    const minHeight = 56; // Keep button visible (expand button height + padding)
    const maxHeight = Math.min(400, window.innerHeight * 0.6);
    
    setTransactionsHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
    e.preventDefault(); // Prevent scrolling
  }, [isDragging, dragStartY, dragStartHeight]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Event listeners
  React.useEffect(() => {
    if (isDragging) {
      // Mouse events
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Touch events
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      // Prevent selection and set cursor
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      document.body.style.touchAction = 'none'; // Prevent scrolling during touch
    } else {
      // Remove mouse events
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Remove touch events
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      // Reset styles
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      // Cleanup all events
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      // Reset styles
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.touchAction = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set initial transactions height to 30% of screen height
  React.useEffect(() => {
    const initialHeight = window.innerHeight * 0.3;
    setTransactionsHeight(initialHeight);
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

  // Handlers for Buy/Sell/Limit buttons
  const handleBuyClick = () => {
    setSelectedTradeTab('buy');
    setIsMobileTradeOpen(true);
  };

  const handleSellClick = () => {
    setSelectedTradeTab('sell');
    setIsMobileTradeOpen(true);
  };

  const handleLimitClick = () => {
    setSelectedTradeTab('limit');
    setIsMobileTradeOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-[#07040b]">
      {/* Header */}
      <Header />


      {/* Progress Bar - Mobile Only */}
      <div className="lg:hidden bg-[#07040b] px-4 py-2 border-b border-[#daa20b]/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#daa20b] text-xs font-semibold tracking-wide">BONDING CURVE</span>
          <span className="text-[#feea88] text-xs font-bold">{tokenData.progress}%</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-gradient-to-r from-[#472303] to-[#5a2d04] border border-[#daa20b]/30 overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#ffd700] to-[#daa20b] shadow-lg transition-all duration-700 ease-out"
            style={{
              width: `${tokenData.progress}%`,
              boxShadow: '0 0 8px rgba(255, 215, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 text-white font-sans overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DesktopSidebar expanded={sidebarExpanded} setExpanded={setSidebarExpanded} />
        </div>
        
        <main 
          className={`flex-1 grid grid-cols-1 ${desktopTradeTab === 'limit' 
            ? 'lg:grid-cols-[1fr_420px] lg:grid-rows-[minmax(200px,1fr)_auto]' 
            : 'lg:grid-cols-[1fr_380px] lg:grid-rows-[1fr_350px]'} gap-2 p-2 lg:pb-2 ${
            isMobile ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar scrollbar scrollbar-w-2 scrollbar-track-gray-100 scrollbar-thumb-gray-700 scrollbar-thumb-rounded'
          }`}
          style={{
            paddingBottom: isMobile ? `${transactionsHeight + 68}px` : '8px', // Add space for transactions panel + buy/sell bar on mobile, normal padding on desktop
            height: isMobile ? 'calc(100vh - 60px)' : 'auto', // Only subtract header height
            transition: 'grid-template-columns 400ms cubic-bezier(0.4, 0, 0.2, 1), grid-template-rows 400ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          
          {/* Trading Chart */}
          <div className="order-1 lg:col-start-1 lg:row-start-1">
            <TradingView />
          </div>

          {/* Token Card (desktop only) */}
          <div className={`hidden lg:flex lg:col-start-2 lg:row-start-1 justify-center p-0 m-0 ${
            desktopTradeTab === 'limit' ? 'items-center' : 'items-start'
          }`}>
            <div style={{
              width: '100%',
              height: desktopTradeTab === 'limit' ? 'fit-content' : '100%',
              maxHeight: desktopTradeTab === 'limit' ? '300px' : 'none',
              display: 'flex',
              alignItems: desktopTradeTab === 'limit' ? 'center' : 'flex-start',
              justifyContent: 'center',
              transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <TradingTokenCard {...tokenData} compact={desktopTradeTab === 'limit'} />
            </div>
          </div>

          {/* Trade Panel with Integrated Limit Orders (desktop only) */}
          <div className="hidden lg:block lg:col-start-2 lg:row-start-2">
            <TradePanel 
              onTabChange={(tab) => setDesktopTradeTab(tab)}
            />
          </div>

          {/* Recent Transactions Panel (desktop only) */}
          <div className="hidden lg:block lg:col-start-1 lg:row-start-2">
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
              {/* Content Area */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                {showLimitOrders ? (
                  <CompactLimitOrderBook 
                    orders={orderManagement.getActiveOrders()}
                    onCancelOrder={handleOrderCancel}
                    onModifyOrder={handleOrderModify}
                    loading={orderManagement.loading}
                    error={orderManagement.error ?? undefined}
                    showToggle={true}
                    showLimitOrders={showLimitOrders}
                    onToggleChange={setShowLimitOrders}
                    isMobile={false}
                  />
                ) : (
                  <TradeHistory 
                    showToggle={true}
                    showLimitOrders={showLimitOrders}
                    onToggleChange={setShowLimitOrders}
                  />
                )}
              </div>
            </div>
          </div>

        </main>
      </div>
      
      {/* Recent Transactions Widget (Mobile Only) - Bottom slide-up panel */}
      <div 
        className="lg:hidden fixed left-0 right-0 z-30"
        style={{ 
          bottom: '68px', // Position above buy/sell bar on mobile
          height: `${transactionsHeight}px`,
          background: 'linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
          borderTop: '1px solid rgba(255, 215, 165, 0.4)',
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Drag Handle / Expand Button (Mobile Only) */}
        <div 
          className={`absolute top-0 left-0 right-0 h-10 cursor-row-resize flex items-center justify-center transition-colors group ${isDragging ? 'bg-[rgba(255,215,165,0.1)]' : 'hover:bg-[rgba(255,215,165,0.06)]'}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={() => {
            if (transactionsHeight < 100) {
              setTransactionsHeight(window.innerHeight * 0.3);
            }
          }}
          style={{ zIndex: 10, touchAction: 'none' }}
        >
          {transactionsHeight < 100 ? (
            // Collapsed state - show expand button
            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
              background: 'linear-gradient(180deg, rgba(255, 231, 190, 0.35), rgba(255, 196, 120, 0.22))',
              border: '1px solid rgba(255, 210, 160, 0.65)',
              color: '#feea88'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
              <span className="text-xs font-bold">RECENT TRANSACTIONS</span>
            </div>
          ) : (
            // Expanded state - show drag handle
            <div className={`w-16 h-1.5 rounded-full transition-colors ${isDragging ? 'bg-[#feea88]' : 'bg-[rgba(255,215,165,0.5)] group-hover:bg-[rgba(255,215,165,0.7)]'}`}></div>
          )}
        </div>
        
        <div 
          className="h-full flex flex-col" 
          style={{ 
            display: transactionsHeight < 100 ? 'none' : 'flex',
            padding: '12px 16px 12px 16px',
            paddingTop: '48px' // Extra top padding for mobile drag handle
          }}
        >
          {/* Content Area - Recent Transactions Only */}
          <div className="flex-1 overflow-hidden">
            <TradeHistory 
              showToggle={false}
              showLimitOrders={false}
              onToggleChange={undefined}
              isMobile={true}
            />
          </div>
        </div>
      </div>
      
      {/* Fixed Buy/Sell/Limit bar for mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#472303] to-[#5a2d04] border-t border-[#daa20b]/30">
        <div className="px-3 py-3 flex items-center gap-2 max-w-screen-md mx-auto" style={{ height: '68px' }}>
          <button onClick={handleBuyClick} type="button" className="flex-1" style={{ padding: '4px' }}>
            <div style={{
              background: 'linear-gradient(180deg, #6ef0a1, #34d37a 60%, #23bd6a)',
              borderRadius: '12px',
              textAlign: 'center',
              fontWeight: 800,
              color: '#1f2937',
              letterSpacing: '0.5px',
              fontSize: '13px',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -6px 12px rgba(0,0,0,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '36px'
            }}>BUY</div>
          </button>
          <button onClick={handleSellClick} type="button" className="flex-1" style={{ padding: '4px' }}>
            <div style={{
              background: 'linear-gradient(180deg, #ffb1a6, #ff7a6f 60%, #ff5b58)',
              borderRadius: '12px',
              textAlign: 'center',
              fontWeight: 800,
              color: '#2b1b14',
              letterSpacing: '0.5px',
              fontSize: '13px',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -6px 12px rgba(0,0,0,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '36px'
            }}>SELL</div>
          </button>
          <button onClick={handleLimitClick} type="button" className="flex-1" style={{ padding: '4px' }}>
            <div style={{
              background: 'linear-gradient(180deg, #ffd700, #daa20b 60%, #b8860b)',
              borderRadius: '12px',
              textAlign: 'center',
              fontWeight: 800,
              color: '#1f2937',
              letterSpacing: '0.5px',
              fontSize: '13px',
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -6px 12px rgba(0,0,0,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '36px'
            }}>LIMIT</div>
          </button>
          <button 
            onClick={() => setMobileSidebarExpanded(true)} 
            type="button" 
            className="flex-shrink-0"
            title="Open Widgets"
            style={{ padding: '4px', width: '48px' }}
          >
            <div 
              className="flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #ffd700, #daa20b 60%, #b8860b)',
                borderRadius: '12px',
                boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -6px 12px rgba(0,0,0,0.18)',
                width: '100%',
                height: '36px'
              }}
            >
              <div className="flex flex-col items-center justify-center gap-0.5">
                <div className="w-1 h-1 bg-black rounded-full"></div>
                <div className="w-1 h-1 bg-black rounded-full"></div>
                <div className="w-1 h-1 bg-black rounded-full"></div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile trade modal */}
      {isMobileTradeOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsMobileTradeOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className={`w-[92vw] max-w-[480px] ${selectedTradeTab === 'limit' ? 'h-fit max-h-[90vh]' : 'max-h-[80vh]'} rounded-2xl border border-[#daa20b]/30 bg-[#07040b] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]`}>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#472303] to-[#5a2d04] border-b border-[#daa20b]/30">
                <h2 className="text-[#daa20b] font-semibold">Trade</h2>
                <button onClick={() => setIsMobileTradeOpen(false)} className="p-2" type="button">
                  <X className="text-[#daa20b]" size={20} />
                </button>
              </div>
              <div className={`p-2 ${selectedTradeTab === 'limit' ? 'overflow-visible' : 'overflow-y-auto'}`}>
                <TradePanel initialTab={selectedTradeTab} isMobile={true} />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Widgets Panel */}
      <MobileBottomBar 
        expanded={mobileSidebarExpanded} 
        setExpanded={setMobileSidebarExpanded} 
      />

      {/* Order Notifications */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
        {notifications.notifications.map((notification, index) => (
          <div key={notification.id} style={{ marginBottom: index < notifications.notifications.length - 1 ? '12px' : '0' }}>
            <OrderNotification
              notification={notification}
              onClose={() => notifications.removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
