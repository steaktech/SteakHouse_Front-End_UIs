"use client";

import React, { useState } from 'react';
// Icons from lucide-react
import { Plus, BarChart3, Coins, ArrowLeftRight, Users, MessageCircle, Bookmark, Lock, ExternalLink, User, Bot, Link, ChevronLeft, ChevronRight } from 'lucide-react';
import { SidebarProps } from './types';
import { SteakHoldersWidget } from '../Widgets/SteakHoldersWidget';
import { ChatWidget } from '../Widgets/ChatWidget';
import { SavedTokenWidget } from '../Widgets/SavedToken';
import { ExplorerWidget } from '../Widgets/ExplorerWidget';
import { LockerWidget } from '../Widgets/LockerWidget';
import { ChartUserProfileWidget } from '../Widgets/ChartUserProfile';
import { useStablePriceData } from '@/app/hooks/useStablePriceData';
import { useTrading } from '@/app/hooks/useTrading';
import AirDropModal from '../Modals/AirDropModal';
import { useTheme } from '@/app/contexts/ThemeContext';

// Props for each widget item
interface WidgetItemProps {
  icon: React.ReactNode;
  text: string;
  expanded: boolean;
  active?: boolean;
  greyedOut?: boolean;
  onClick?: () => void;
}

const WidgetItem: React.FC<WidgetItemProps> = ({ icon, text, expanded, active, greyedOut, onClick }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Base classes for all items
  const baseClasses = "flex items-center h-[30px] py-1.5 px-2.5 mx-1.5 mb-[4px] rounded-[8px] transition-all duration-200 ease-in-out relative";

  // Conditional classes based on the state
  const activeClasses = isLight 
    ? "bg-[#e8dcc8] shadow-inner cursor-pointer text-[#2b1608]"
    : "bg-[#a3580f] shadow-[inset_0_0_4px_3px_rgba(255,255,255,0.1)] cursor-pointer";
    
  const greyedOutClasses = "opacity-45 cursor-not-allowed bg-[rgba(0,0,0,0.2)] saturate-0";
  
  const inactiveClasses = isLight
    ? "hover:bg-black/5 cursor-pointer text-[#5c4033]"
    : "hover:bg-[rgba(0,0,0,0.178)] cursor-pointer";

  // Determine which classes to apply
  const getStateClasses = () => {
    if (greyedOut) return greyedOutClasses;
    if (active) return activeClasses;
    return inactiveClasses;
  };

  return (
    <div
      className={`${baseClasses} ${getStateClasses()}`}
      onClick={greyedOut ? undefined : onClick}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 transition-all duration-200 ${greyedOut
        ? 'opacity-55 grayscale saturate-0'
        : active
          ? '[filter:brightness(1.2)_drop-shadow(0_1px_2px_rgba(0,0,0,0.3))]'
          : 'opacity-80'
        } ${isLight ? 'text-[#b45309]' : ''}`}>
        {icon}
      </div>

      {/* Widget Text: transitions in and out */}
      <span className={`
        flex-1 text-[11px] font-medium tracking-[0.08px]
        transition-all duration-200
        ${greyedOut ? 'text-[#777] opacity-55' : (isLight ? (active ? 'text-[#2b1608]' : 'text-[#5c4033]') : 'text-[#e6d4a3]')}
        ${active ? '[text-shadow:0_1px_2px_rgba(0,0,0,0.4)]' : ''}
        ${expanded ? 'ml-1.5 opacity-100' : 'ml-0 opacity-0 w-0 overflow-hidden'}
      `}>
        {text}
      </span>

      {/* Plus Icon: transitions in and out */}
      <div className={`
        flex flex-shrink-0 items-center justify-center w-3.5 h-3.5 text-sm
        transition-all duration-200
        ${greyedOut ? 'text-[#777] opacity-35 grayscale' : (isLight ? 'text-[#d97706] opacity-90' : 'text-[#e0940a] opacity-90')}
        ${active ? 'font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]' : 'font-normal'}
        ${expanded ? 'opacity-inherit' : 'opacity-0'}
      `}>
        <Plus size={14} />
      </div>
    </div>
  );
};

export const DesktopSidebar: React.FC<SidebarProps> = ({ 
  expanded, 
  setExpanded, 
  tokenAddress, 
  tokenLogoUrl,
  apiTokenData = null,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isHoldersWidgetOpen, setIsHoldersWidgetOpen] = useState(false);
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const [isSavedTokenWidgetOpen, setIsSavedTokenWidgetOpen] = useState(false);
  const [isLockerWidgetOpen, setIsLockerWidgetOpen] = useState(false);
  const [isUserProfileWidgetOpen, setIsUserProfileWidgetOpen] = useState(false);
  const [isExplorerWidgetOpen, setIsExplorerWidgetOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(170);
  const [isResizing, setIsResizing] = useState(false);
  const [isCertikHovered, setIsCertikHovered] = useState(false);
  const [airdropOpen, setAirdropOpen] = useState(false);

  // Use the same price data hook as the token creation wizard
  const { ethPrice, formattedGasPrice, loading: priceLoading } = useStablePriceData(true);
  
  // Get trading state for airdrop modal
  const { tradingState } = useTrading();

  // Determine if any secondary widgets are open (making Chart, Token, Trade active)
  const hasActiveWidget = isHoldersWidgetOpen || isChatWidgetOpen || isSavedTokenWidgetOpen || isLockerWidgetOpen || isUserProfileWidgetOpen || isExplorerWidgetOpen;

  const handleHoldersClick = () => {
    setIsHoldersWidgetOpen(true);
  };

  const handleChatClick = () => {
    setIsChatWidgetOpen(true);
  };

  const handleSavedTokenClick = () => {
    setIsSavedTokenWidgetOpen(true);
  };

  // Handlers for new widgets
  const handleLockerClick = () => {
    setIsLockerWidgetOpen(true);
  };

  const handleExplorerClick = () => {
    setIsExplorerWidgetOpen(true);
  };

  const handleUserClick = () => {
    setIsUserProfileWidgetOpen(true);
  };

  // Handlers for bottom section
  const handleSteakTechBotClick = () => {
    console.log('SteakTech Bot clicked');
  };

  const handleLinksClick = () => {
    console.log('Links clicked');
  };

  const handleCertikClick = () => {
    console.log('Certik clicked');
    window.open('#certik', '_blank');
  };

  // Close handlers that update the active state
  const handleHoldersClose = () => {
    setIsHoldersWidgetOpen(false);
  };

  const handleChatClose = () => {
    setIsChatWidgetOpen(false);
  };

  const handleSavedTokenClose = () => {
    setIsSavedTokenWidgetOpen(false);
  };

const handleExplorerClose = () => {
  setIsExplorerWidgetOpen(false);
};

const handleLockerClose = () => {
  setIsLockerWidgetOpen(false);
};

const handleUserProfileClose = () => {
  setIsUserProfileWidgetOpen(false);
};

  // Handlers for Chart, Token, Trade (only functional when hasActiveWidget is true)
  const handleChartClick = () => {
    if (hasActiveWidget) {
      console.log('Chart clicked - widget is active');
    } else {
      console.log('Chart clicked but no active widgets - greyed out');
    }
  };

  const handleTokenClick = () => {
    if (hasActiveWidget) {
      console.log('Token clicked - widget is active');
    } else {
      console.log('Token clicked but no active widgets - greyed out');
    }
  };

  const handleTradeClick = () => {
    if (hasActiveWidget) {
      console.log('Trade clicked - widget is active');
    } else {
      console.log('Trade clicked but no active widgets - greyed out');
    }
  };

  // Parse GWEI from formatted gas price (e.g., "25 gwei" -> 25)
  const gwei = formattedGasPrice ? parseFloat(formattedGasPrice.replace(/[^0-9.]/g, '')) : null;

  // Resize handlers
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!expanded) return;
    setIsResizing(true);
    e.preventDefault();
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      // Constrain width between 140px and 400px
      setSidebarWidth(Math.max(140, Math.min(400, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const widgets = [
    // Chart, Token, Trade: greyed out by default, colorful when other widgets are open
    // {
    //   icon: <BarChart3 size={16} className={hasActiveWidget ? "text-[#ffdd00]" : "text-[#666666]"} />,
    //   text: 'Chart',
    //   active: false,
    //   greyedOut: !hasActiveWidget,
    //   onClick: handleChartClick
    // },
    // {
    //   icon: <Coins size={16} className={hasActiveWidget ? "text-[#d29900]" : "text-[#666666]"} />,
    //   text: 'Token',
    //   active: false,
    //   greyedOut: !hasActiveWidget,
    //   onClick: handleTokenClick
    // },
    // {
    //   icon: <ArrowLeftRight size={16} className={hasActiveWidget ? "text-[#d29900]" : "text-[#666666]"} />,
    //   text: 'Trade',
    //   active: false,
    //   greyedOut: !hasActiveWidget,
    //   onClick: handleTradeClick
    // },
    // Holders, Chat, Saved: normal behavior
    {
      icon: <Users size={16} className={isLight ? "text-[#d97706]" : "text-[#d29900]"} />,
      text: 'Holders',
      active: isHoldersWidgetOpen,
      greyedOut: false,
      onClick: handleHoldersClick
    },
    {
      icon: <MessageCircle size={16} className={isLight ? "text-[#d97706]" : "text-[#d29900]"} />,
      text: 'Chat',
      active: isChatWidgetOpen,
      greyedOut: false,
      onClick: handleChatClick
    },
    {
      icon: <Bookmark size={16} className={isLight ? "text-[#d97706]" : "text-[#d29900]"} />,
      text: 'Saved',
      active: isSavedTokenWidgetOpen,
      greyedOut: false,
      onClick: handleSavedTokenClick
    },
    // New widgets (UI only; underlying components may be added later)
    {
      icon: <Lock size={16} className={isLight ? "text-[#d97706]" : "text-[#d29900]"} />,
      text: 'Locker',
      active: isLockerWidgetOpen,
      greyedOut: false,
      onClick: handleLockerClick
    },
    {
      icon: <ExternalLink size={16} className={isLight ? "text-[#d97706]" : "text-[#d29900]"} />,
      text: 'Explorer',
      active: isExplorerWidgetOpen,
      greyedOut: false,
      onClick: handleExplorerClick
    },
    {
      icon: <User size={16} className={isLight ? "text-[#d97706]" : "text-[#d29900]"} />,
      text: 'User',
      active: isUserProfileWidgetOpen,
      greyedOut: false,
      onClick: handleUserClick
    },
  ];

  return (
    <>
      {/* BACKDROP for mobile overlay */}
      <div
        onClick={() => setExpanded(false)}
        className={`fixed inset-0 bg-black/60 z-20 transition-opacity lg:hidden ${expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* RESPONSIVE SIDEBAR CONTAINER */}
      <aside
        className={`
          h-full flex flex-col
          relative
          
          /* Mobile Overlay Styles */
          fixed inset-y-0 left-0 z-30
          ${expanded ? 'translate-x-0 w-[160px]' : '-translate-x-full w-[140px]'}

          /* Desktop Static Styles */
          lg:relative lg:translate-x-0
          ${expanded ? '' : 'lg:w-[70px]'}
        `}
        style={{
          background: isLight ? '#EEE5D2' : 'linear-gradient(180deg, #1A0F08 0%, #241207 100%)',
          boxShadow: isLight ? '0 4px 12px rgba(62, 39, 35, 0.08), inset -1px 0 0 rgba(255,255,255,0.5)' : '0 3px 8px rgba(0, 0, 0, 0.2)',
          borderRight: isLight ? '1px solid var(--theme-border)' : 'none',
          width: expanded ? `${sidebarWidth}px` : undefined,
          transition: isResizing ? 'none' : 'all 300ms ease-in-out'
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 relative flex items-center justify-center px-[10px] pt-[12px] pb-[16px]">
          <div className={`transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <h2 className={`text-base font-semibold tracking-[0.15px] [text-shadow:0_2px_4px_rgba(0,0,0,0.6)] ${isLight ? 'text-[#2b1608]' : 'text-[#daa20b]'}`}>
              Widgets
            </h2>
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-1 rounded-full absolute -right-3 top-[26px] hidden lg:block z-10 ${isLight ? 'bg-white border border-[#e8dcc8] shadow-sm hover:bg-[#fff8f1]' : 'bg-black/30 hover:bg-black/50'}`}
            type="button"
          >
            {expanded ? <ChevronLeft size={16} className={isLight ? "text-[#b45309]" : "text-amber-200"} /> : <ChevronRight size={16} className={isLight ? "text-[#b45309]" : "text-amber-200"} />}
          </button>
        </div>

        {/* Widget List */}
        <nav className="flex-1 overflow-y-auto">
          {widgets.map((widget, index) => (
            <WidgetItem
              key={index}
              icon={widget.icon}
              text={widget.text}
              expanded={expanded}
              active={widget.active}
              greyedOut={widget.greyedOut}
              onClick={widget.onClick}
            />
          ))}
        </nav>

        {/* Bottom Section - Fixed at bottom, outside scrollable area */}
        <div className={`flex-shrink-0 border-t pt-3 pb-3 ${isLight ? 'border-[#e8dcc8]' : 'border-[rgba(255,215,165,0.3)]'}`}>
          {/* SteakTech Bot */}
          <WidgetItem
            icon={<Bot size={16} className={isLight ? "text-[#d97706]" : "text-[#d29900]"} />}
            text="SteakTech Bot"
            expanded={expanded}
            active={false}
            greyedOut={false}
            onClick={handleSteakTechBotClick}
          />

          {/* Links */}
          <WidgetItem
            icon={<Link size={16} className={isLight ? "text-[#d97706]" : "text-[#d29900]"} />}
            text="Links"
            expanded={expanded}
            active={false}
            greyedOut={false}
            onClick={handleLinksClick}
          />

          {/* Airdrop Button */}
          <div className="mx-1.5 mb-2">
            <style jsx>{`
              @keyframes bounce-gift {
                0%, 100% {
                  transform: translateY(0);
                  animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
                }
                50% {
                  transform: translateY(-25%);
                  animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
                }
              }
              .gift-bounce {
                display: inline-block;
                animation: bounce-gift 1s infinite;
              }
            `}</style>
            <button
              onClick={() => setAirdropOpen(true)}
              className="w-full px-2.5 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-all duration-200 bg-[#F1B702] text-[#1a0f08] hover:brightness-110 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
              title="View your airdrop points"
            >
              {expanded ? (
                <>
                  <span className="gift-bounce">🎁</span> Airdrop Points
                </>
              ) : (
                <span className="gift-bounce">🎁</span>
              )}
            </button>
          </div>

          {/* ETH Price and GWEI Display */}
          <div className="mx-2.5 mt-2 mb-1.5">
            {/* ETH Price */}
            <div 
              className="mb-1.5 px-2 py-1.5"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '6px',
                background: isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)',
                border: isLight ? '1px solid #e8dcc8' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                <svg width="12" height="12" viewBox="0 0 256 417" fill="currentColor" className={`${isLight ? 'text-[#d97706]' : 'text-[#d29900]'} flex-shrink-0`}>
                  <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" fill="#8C8C8C" />
                  <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" fill="#6C6C6C" />
                  <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" fill="#8C8C8C" />
                  <path d="M127.962 416.905v-104.72L0 236.585z" fill="#6C6C6C" />
                </svg>
                {expanded && (
                  <span className={`text-[10px] font-semibold text-[#e6d4a3] tracking-wide ${isLight ? 'text-[#5c4033]' : 'text-[#e6d4a3]'}`}>ETH</span>
                )}
              </div>
              <span className={`text-[11px] font-bold text-[#feea88] tabular-nums ${isLight ? 'text-[#b45309]' : 'text-[#feea88]'}`}>
                {priceLoading ? '...' : ethPrice ? `$${ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '---'}
              </span>
            </div>

            {/* GWEI */}
            <div 
              className="px-2 py-1.5"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '6px',
                background: isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.08)',
                border: isLight ? '1px solid #e8dcc8' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                <span className="flex-shrink-0" style={{ fontSize: '12px', lineHeight: 1 }}>⛽️</span>
                {expanded && (
                  <span className={`text-[10px] font-semibold text-[#e6d4a3] tracking-wide ${isLight ? 'text-[#5c4033]' : 'text-[#e6d4a3]'}`}>GWEI</span>
                )}
              </div>
              <span className={`text-[11px] font-bold text-[#feea88] tabular-nums ${isLight ? 'text-[#b45309]' : 'text-[#feea88]'}`}>
                {priceLoading ? '...' : gwei ? gwei.toFixed(1) : '---'}
              </span>
            </div>
          </div>

          {/* Certik Badge - Full width, styled like main page Footer */}
          <div className="mx-1.5 mt-1.5 flex justify-center">
            <style
              dangerouslySetInnerHTML={{
                __html: `
                  @keyframes fireShine {
                    0%, 100% {
                      filter: drop-shadow(0 0 8px rgba(255, 140, 0, 0.8)) drop-shadow(0 0 16px rgba(255, 69, 0, 0.6)) brightness(1);
                    }
                    50% {
                      filter: drop-shadow(0 0 20px rgba(255, 140, 0, 1)) drop-shadow(0 0 32px rgba(255, 69, 0, 0.9)) brightness(1.2);
                    }
                  }
                  @keyframes fireParticle {
                    0% {
                      transform: translateY(0) scale(1);
                      opacity: 1;
                    }
                    100% {
                      transform: translateY(-40px) scale(0);
                      opacity: 0;
                    }
                  }
                  @keyframes fireFlicker {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                  }
                  .certik-wrapper-animated-desktop {
                    animation: fireShine 1.5s ease-in-out infinite;
                  }
                  .fire-particle-desktop {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: radial-gradient(circle, #ff8c00, #ff4500);
                    box-shadow: 0 0 10px #ff4500;
                    animation: fireParticle 1.5s ease-out infinite, fireFlicker 0.3s ease-in-out infinite;
                    pointer-events: none;
                  }
                  .fire-particle-desktop:nth-child(1) { left: 10%; bottom: 0; animation-delay: 0s; }
                  .fire-particle-desktop:nth-child(2) { left: 30%; bottom: 0; animation-delay: 0.3s; }
                  .fire-particle-desktop:nth-child(3) { left: 50%; bottom: 0; animation-delay: 0.6s; }
                  .fire-particle-desktop:nth-child(4) { left: 70%; bottom: 0; animation-delay: 0.9s; }
                  .fire-particle-desktop:nth-child(5) { left: 90%; bottom: 0; animation-delay: 1.2s; }
                `
              }}
            />
            <button
              onClick={handleCertikClick}
              onMouseEnter={() => setIsCertikHovered(true)}
              onMouseLeave={() => setIsCertikHovered(false)}
              className={`p-1.5 border rounded-[8px] transition-all duration-200 flex items-center justify-center relative ${
                isCertikHovered ? 'certik-wrapper-animated-desktop' : ''
              } ${isLight ? 'bg-white/50 hover:bg-white/70 border-[#e8dcc8] backdrop-blur' : 'bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.5)] border-[rgba(255,215,165,0.4)]'}`}
              title="View CertiK Certificate"
              style={{
                width: expanded ? 'auto' : '100%',
                transform: isCertikHovered ? 'scale(1.1)' : 'scale(1)', 
                transition: 'transform 0.3s ease, filter 0.3s ease'
              }}
            >
              {isCertikHovered && (
                <>
                  <div className="fire-particle-desktop"></div>
                  <div className="fire-particle-desktop"></div>
                  <div className="fire-particle-desktop"></div>
                  <div className="fire-particle-desktop"></div>
                  <div className="fire-particle-desktop"></div>
                </>
              )}
              <img
                src="/images/certik-logo-v2.png"
                alt="CertiK logo"
                className={`h-[14px] w-auto opacity-90 ${isLight ? 'invert' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Resize Handle - Desktop Only */}
        {expanded && (
          <div
            onMouseDown={handleResizeMouseDown}
            className={`hidden lg:block absolute top-0 right-0 bottom-0 w-1 cursor-col-resize transition-colors z-50 ${isLight ? 'hover:bg-[#e8dcc8]' : 'hover:bg-[rgba(255,215,165,0.3)]'}`}
            style={{
              background: isResizing ? (isLight ? '#c9a875' : 'rgba(255, 215, 165, 0.5)') : 'transparent'
            }}
          />
        )}
      </aside>

      {/* SteakHolders Widget - mount only when open to avoid early API calls */}
      {isHoldersWidgetOpen && (
        <SteakHoldersWidget
          isOpen={isHoldersWidgetOpen}
          onClose={handleHoldersClose}
          tokenAddress={tokenAddress}
          tokenLogoUrl={tokenLogoUrl}
        />
      )}

      {/* Chat Widget - mount only when open to avoid early API calls */}
      {isChatWidgetOpen && (
        <ChatWidget
          isOpen={isChatWidgetOpen}
          onClose={handleChatClose}
          tokenAddress={tokenAddress}
          apiTokenData={apiTokenData}
        />
      )}

      {/* Saved Token Widget - mount only when open */}
      {isSavedTokenWidgetOpen && (
        <SavedTokenWidget
          isOpen={isSavedTokenWidgetOpen}
          onClose={handleSavedTokenClose}
        />
      )}

      {/* Explorer Widget - mount only when open */}
      {isExplorerWidgetOpen && (
        <ExplorerWidget
          isOpen={isExplorerWidgetOpen}
          onClose={handleExplorerClose}
        />
      )}

      {/* Locker Widget - mount only when open */}
      {isLockerWidgetOpen && (
        <LockerWidget
          isOpen={isLockerWidgetOpen}
          onClose={handleLockerClose}
        />
      )}

      {/* Chart User Profile Widget - mount only when open */}
      {isUserProfileWidgetOpen && (
        <ChartUserProfileWidget
          isOpen={isUserProfileWidgetOpen}
          onClose={handleUserProfileClose}
        />
      )}

      {/* AirDrop Modal */}
      {airdropOpen && (
        <AirDropModal
          isOpen={airdropOpen}
          onClose={() => setAirdropOpen(false)}
          tradingWallet={tradingState?.tradingWallet || null}
        />
      )}
    </>
  );
};
