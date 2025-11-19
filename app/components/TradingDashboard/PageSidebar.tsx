"use client";

import React, { useEffect, useState } from "react";
import {
  Bookmark,
  ExternalLink,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  Bot,
  Link,
  Lock,
} from "lucide-react";
import { SavedTokenWidget } from "../Widgets/SavedToken";
import { ExplorerWidget } from "../Widgets/ExplorerWidget";
import { ChartUserProfileWidget } from "../Widgets/ChartUserProfile";
import { LockerWidget } from "../Widgets/LockerWidget";
import AirDropModal from "../Modals/AirDropModal";
import { useStablePriceData } from '@/app/hooks/useStablePriceData';
import { useTrading } from '@/app/hooks/useTrading';

interface PageSidebarProps {
  className?: string;
}

interface ItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  expanded: boolean;
  greyedOut?: boolean;
  onClick?: () => void;
}

const Item: React.FC<ItemProps> = ({ icon, label, active, expanded, greyedOut, onClick }) => {
  const base =
    "flex items-center h-[34px] py-1.5 px-2.5 mx-1.5 mb-[6px] rounded-[10px] transition-all duration-300 ease-in-out border";
  const state = greyedOut
    ? "opacity-45 saturate-0 cursor-not-allowed bg-transparent border-white/5"
    : active
    ? "bg-white/15 border-white/25 shadow-[inset_0_0_6px_2px_rgba(255,255,255,0.08)] cursor-pointer"
    : "hover:bg-white/10 border-white/10 cursor-pointer";

  return (
    <div className={`${base} ${state}`} onClick={greyedOut ? undefined : onClick}>
      <div className={`flex-shrink-0 ${active ? "[filter:brightness(1.15)]" : "opacity-85"}`}>
        {icon}
      </div>
      <span
        className={`
          flex-1 text-[12px] font-medium tracking-[0.1px]
          transition-all duration-300 ml-2
          ${expanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden ml-0"}
        `}
        style={{ color: active ? "#ffe6a8" : "#e6d4a3" }}
      >
        {label}
      </span>
      <div
        className={`flex items-center justify-center w-4 h-4 transition-opacity duration-300 ${
          expanded && !greyedOut ? "opacity-100" : "opacity-0"
        }`}
      >
        <Plus size={12} className="text-[#e0940a]" />
      </div>
    </div>
  );
};

export const PageSidebar: React.FC<PageSidebarProps> = ({ className }) => {
  const [expanded, setExpanded] = useState(false);
  const DEFAULT_TOP_OFFSET = "calc(4rem + 4rem + 1.5rem)";
  const [desktopTopOffset, setDesktopTopOffset] = useState<string>(DEFAULT_TOP_OFFSET);
  const [isCertikHovered, setIsCertikHovered] = useState(false);

  // Widget open states
  const [savedOpen, setSavedOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [lockerOpen, setLockerOpen] = useState(false);
  const [airdropOpen, setAirdropOpen] = useState(false);

  // Use the same price data hook as the token creation wizard
  const { ethPrice, formattedGasPrice, loading: priceLoading } = useStablePriceData(true);
  
  // Get trading state for airdrop modal
  const { tradingState } = useTrading();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const EXTRA_SPACING_TOP = 24; // keep a small gap below the top bars
    let animationFrame = 0;

    const measureOffsets = () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }

      animationFrame = window.requestAnimationFrame(() => {
        const headerEl = document.querySelector<HTMLElement>("[data-app-header]");
        const trendingEl = document.querySelector<HTMLElement>("[data-trending-bar]");

        const headerHeight = headerEl?.getBoundingClientRect().height ?? 0;
        const trendingHeight = trendingEl?.getBoundingClientRect().height ?? 0;

        if (headerHeight || trendingHeight) {
          const total = headerHeight + trendingHeight + EXTRA_SPACING_TOP;
          setDesktopTopOffset((prev) => {
            const next = `${total}px`;
            return prev === next ? prev : next;
          });
        } else {
          setDesktopTopOffset((prev) => (prev === DEFAULT_TOP_OFFSET ? prev : DEFAULT_TOP_OFFSET));
        }
      });
    };

    measureOffsets();

    window.addEventListener("resize", measureOffsets);
    window.addEventListener("orientationchange", measureOffsets);

    return () => {
      window.removeEventListener("resize", measureOffsets);
      window.removeEventListener("orientationchange", measureOffsets);
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  const sidebarStyle: (React.CSSProperties & {
    "--sidebar-top-offset"?: string;
    "--sidebar-max-height"?: string;
  }) = {
    "--sidebar-top-offset": desktopTopOffset,
    "--sidebar-max-height": "calc(100vh - var(--sidebar-top-offset) - 1.5rem)",
  };

  // Parse GWEI from formatted gas price (e.g., "25 gwei" -> 25)
  const gwei = formattedGasPrice ? parseFloat(formattedGasPrice.replace(/[^0-9.]/g, '')) : null;

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

  // Sidebar items — Saved, Explorer, User, Locker are active
  // Commented out items (kept for reference):
  // Chart, Token, Trade, Holders, Chat
  const items: ItemProps[] = [
    {
      icon: <Bookmark size={16} className="text-[#d29900]" />,
      label: "Saved",
      active: savedOpen,
      expanded,
      onClick: () => setSavedOpen((v) => !v),
    },
    {
      icon: <ExternalLink size={16} className="text-[#d29900]" />,
      label: "Explorer",
      active: explorerOpen,
      expanded,
      onClick: () => setExplorerOpen((v) => !v),
    },
    {
      icon: <Lock size={16} className="text-[#d29900]" />,
      label: "Locker",
      active: lockerOpen,
      expanded,
      onClick: () => setLockerOpen((v) => !v),
    },
    {
      icon: <UserIcon size={16} className="text-[#d29900]" />,
      label: "User",
      active: userOpen,
      expanded,
      onClick: () => setUserOpen((v) => !v),
    },
  ];

  return (
    <>
      {/* Mobile scrim */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      <aside
    style={sidebarStyle}
    className={`fixed inset-x-0 bottom-0 md:fixed md:[top:var(--sidebar-top-offset)] md:left-0 md:right-auto md:max-h-[var(--sidebar-max-height)] z-40 flex flex-col overflow-hidden select-none h-[55vh] md:h-auto w-full rounded-t-2xl md:rounded-xl border border-white/15 bg-[#1b0a03]/35 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] transform transition-transform duration-300 ${expanded ? 'translate-y-0 md:translate-x-0 md:translate-y-0 md:w-[160px] pointer-events-auto' : 'translate-y-full md:translate-y-0 md:-translate-x-full md:w-0 pointer-events-none'} ${className || ''}`}
      >
        {/* Header */}
        <div className="flex items-center justify-center px-[10px] pt-[12px] pb-[14px] relative">
          <div className={`transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0"}`}>
            <h2 className="text-[#daa20b] text-[15px] font-semibold tracking-[0.15px] [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
              Widgets
            </h2>
          </div>

          {/* Collapse button at top-right when expanded */}
          {expanded && (
            <button
              type="button"
              aria-label="Collapse sidebar"
              onClick={() => setExpanded(false)}
              className="absolute right-2 top-2 p-1.5 rounded-full border border-white/20 bg-[#1b0a03]/50 hover:bg-[#1b0a03]/65 backdrop-blur-xl shadow-sm transition-colors"
            >
              {/* Mobile: down arrow, Desktop: left arrow */}
              <ChevronDown size={16} className="text-amber-200 md:hidden" />
              <ChevronLeft size={16} className="text-amber-200 hidden md:block" />
            </button>
          )}
        </div>

        {/* Items */}
        <nav className="flex-1 overflow-y-auto pt-1 pb-2">
          {items.map((it) => (
            <Item
              key={it.label}
              icon={it.icon}
              label={it.label}
              active={it.active}
              expanded={expanded}
              greyedOut={(it as any).greyedOut}
              onClick={it.onClick}
            />
          ))}
        </nav>

        {/* Bottom Section - Fixed at bottom */}
        <div className="flex-shrink-0 border-t border-white/20 pt-3 pb-3">
          {/* SteakTech Bot */}
          <Item
            icon={<Bot size={16} className="text-[#d29900]" />}
            label="SteakTech Bot"
            expanded={expanded}
            greyedOut={false}
            onClick={handleSteakTechBotClick}
          />

          {/* Links */}
          <Item
            icon={<Link size={16} className="text-[#d29900]" />}
            label="Links"
            expanded={expanded}
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
              className="w-full px-2.5 py-2 rounded-lg text-[11px] font-semibold tracking-wide transition-all duration-200 bg-gradient-to-r from-[#d29900] to-[#f5b800] text-[#1a0f08] hover:from-[#e0a600] hover:to-[#ffc600] shadow-md hover:shadow-lg"
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
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                <svg width="12" height="12" viewBox="0 0 256 417" fill="currentColor" className="text-[#d29900] flex-shrink-0">
                  <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" fill="#8C8C8C" />
                  <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" fill="#6C6C6C" />
                  <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" fill="#8C8C8C" />
                  <path d="M127.962 416.905v-104.72L0 236.585z" fill="#6C6C6C" />
                </svg>
                {expanded && (
                  <span className="text-[10px] font-semibold text-[#e6d4a3] tracking-wide">ETH</span>
                )}
              </div>
              <span className="text-[11px] font-bold text-[#feea88] tabular-nums">
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
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                <span className="flex-shrink-0" style={{ fontSize: '12px', lineHeight: 1 }}>⛽️</span>
                {expanded && (
                  <span className="text-[10px] font-semibold text-[#e6d4a3] tracking-wide">GWEI</span>
                )}
              </div>
              <span className="text-[11px] font-bold text-[#feea88] tabular-nums">
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
                  .certik-wrapper-animated-sidebar {
                    animation: fireShine 1.5s ease-in-out infinite;
                  }
                  .fire-particle-sidebar {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: radial-gradient(circle, #ff8c00, #ff4500);
                    box-shadow: 0 0 10px #ff4500;
                    animation: fireParticle 1.5s ease-out infinite, fireFlicker 0.3s ease-in-out infinite;
                    pointer-events: none;
                  }
                  .fire-particle-sidebar:nth-child(1) { left: 10%; bottom: 0; animation-delay: 0s; }
                  .fire-particle-sidebar:nth-child(2) { left: 30%; bottom: 0; animation-delay: 0.3s; }
                  .fire-particle-sidebar:nth-child(3) { left: 50%; bottom: 0; animation-delay: 0.6s; }
                  .fire-particle-sidebar:nth-child(4) { left: 70%; bottom: 0; animation-delay: 0.9s; }
                  .fire-particle-sidebar:nth-child(5) { left: 90%; bottom: 0; animation-delay: 1.2s; }
                `
              }}
            />
            <button
              onClick={handleCertikClick}
              onMouseEnter={() => setIsCertikHovered(true)}
              onMouseLeave={() => setIsCertikHovered(false)}
              className={`p-1.5 bg-black/30 hover:bg-black/50 border border-white/40 rounded-md transition-all duration-200 flex items-center justify-center w-full relative ${
                isCertikHovered ? 'certik-wrapper-animated-sidebar' : ''
              }`}
              title="View CertiK Certificate"
              style={{
                transform: isCertikHovered ? 'scale(1.1)' : 'scale(1)', 
                transition: 'transform 0.3s ease, filter 0.3s ease'
              }}
            >
              {isCertikHovered && (
                <>
                  <div className="fire-particle-sidebar"></div>
                  <div className="fire-particle-sidebar"></div>
                  <div className="fire-particle-sidebar"></div>
                  <div className="fire-particle-sidebar"></div>
                  <div className="fire-particle-sidebar"></div>
                </>
              )}
              <img
                src="/images/certik-logo-v2.png"
                alt="CertiK logo"
                className="h-[14px] w-auto opacity-90"
              />
            </button>
          </div>
        </div>

      </aside>

      {/* Widgets - mount only when open */}
      {savedOpen && (
        <SavedTokenWidget isOpen={savedOpen} onClose={() => setSavedOpen(false)} />
      )}
      {explorerOpen && (
        <ExplorerWidget isOpen={explorerOpen} onClose={() => setExplorerOpen(false)} />
      )}
      {lockerOpen && (
        <LockerWidget isOpen={lockerOpen} onClose={() => setLockerOpen(false)} />
      )}
      {userOpen && (
        <ChartUserProfileWidget isOpen={userOpen} onClose={() => setUserOpen(false)} />
      )}

      {/* AirDrop Modal */}
      {airdropOpen && (
        <AirDropModal
          isOpen={airdropOpen}
          onClose={() => setAirdropOpen(false)}
          tradingWallet={tradingState?.tradingWallet || null}
        />
      )}

      {/* Floating expand toggle (visible only when collapsed) */}
      {!expanded && (
        <>
          <style jsx>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translate(-50%, 20px);
              }
              to {
                opacity: 1;
                transform: translate(-50%, 0);
              }
            }
            @keyframes fadeInRight {
              from {
                opacity: 0;
                transform: translate(-20px, -50%);
              }
              to {
                opacity: 1;
                transform: translate(0, -50%);
              }
            }
            .expand-btn-mobile {
              animation: fadeInUp 0.4s ease-out 0.3s both;
            }
            .expand-btn-desktop {
              animation: fadeInRight 0.4s ease-out 0.3s both;
            }
          `}</style>
          {/* Mobile: bottom-center */}
          <button
            onClick={() => setExpanded(true)}
            type="button"
            aria-label="Expand sidebar"
            className="expand-btn-mobile fixed bottom-4 left-1/2 -translate-x-1/2 z-40 p-3 rounded-full transition-all duration-200 shadow-lg bg-[#1b0a03]/60 hover:bg-[#1b0a03]/70 hover:scale-110 backdrop-blur-xl border border-white/20 md:hidden"
          >
            <ChevronUp size={20} className="text-amber-200" />
          </button>
          {/* Desktop: middle-left with vertical text */}
          <button
            onClick={() => setExpanded(true)}
            type="button"
            aria-label="Expand sidebar"
            className="expand-btn-desktop hidden md:flex fixed left-2 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2 px-2 py-3 rounded-xl transition-all duration-200 shadow-lg bg-[#1b0a03]/50 hover:bg-[#1b0a03]/65 hover:scale-105 backdrop-blur-xl border border-white/20"
          >
            <ChevronRight size={16} className="text-amber-200" />
            <div className="w-[2px] h-4 bg-gradient-to-b from-transparent via-[#daa20b]/40 to-transparent rounded-full shadow-[0_0_6px_rgba(218,162,11,0.25)]" />
            <h2 
              className="text-[#daa20b] text-[11px] font-semibold tracking-[1px] [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              WIDGETS
            </h2>
            <div className="w-[2px] h-4 bg-gradient-to-b from-transparent via-[#daa20b]/40 to-transparent rounded-full shadow-[0_0_6px_rgba(218,162,11,0.25)]" />
          </button>
        </>
      )}
    </>
  );
};

export default PageSidebar;
