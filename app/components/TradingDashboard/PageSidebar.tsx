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
} from "lucide-react";
import { SavedTokenWidget } from "../Widgets/SavedToken";
import { ExplorerWidget } from "../Widgets/ExplorerWidget";
import { ChartUserProfileWidget } from "../Widgets/ChartUserProfile";
import { useStablePriceData } from '@/app/hooks/useStablePriceData';

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

  // Widget open states (only Saved, Explorer, User)
  const [savedOpen, setSavedOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  // Use the same price data hook as the token creation wizard
  const { ethPrice, formattedGasPrice, loading: priceLoading } = useStablePriceData(true);

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

  // Sidebar items — only Saved, Explorer, User are active
  // Commented out items (kept for reference):
  // Chart, Token, Trade, Holders, Chat, Locker
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
    className={`fixed inset-x-0 bottom-0 md:sticky md:[top:var(--sidebar-top-offset)] md:left-0 md:right-auto md:max-h-[var(--sidebar-max-height)] z-40 flex flex-col overflow-hidden select-none h-[55vh] md:h-auto w-full md:w-[160px] rounded-t-2xl md:rounded-xl border border-white/15 bg-[#1b0a03]/35 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] transform transition-transform duration-300 ${expanded ? 'translate-y-0 md:translate-x-0 md:translate-y-0 pointer-events-auto' : 'translate-y-full md:translate-y-0 md:-translate-x-full pointer-events-none'} ${className || ''}`}
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
            <button
              onClick={handleCertikClick}
              className="p-1.5 bg-black/30 hover:bg-black/50 border border-white/40 rounded-md transition-all duration-200 flex items-center justify-center w-full"
              title="View CertiK Certificate"
            >
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
      {userOpen && (
        <ChartUserProfileWidget isOpen={userOpen} onClose={() => setUserOpen(false)} />
      )}

      {/* Floating expand toggle (visible only when collapsed) */}
      {!expanded && (
        <>
          {/* Mobile: bottom-center */}
          <button
            onClick={() => setExpanded(true)}
            type="button"
            aria-label="Expand sidebar"
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 p-3 rounded-full transition-all shadow-lg bg-[#1b0a03]/60 hover:bg-[#1b0a03]/70 backdrop-blur-xl border border-white/20 md:hidden"
          >
            <ChevronUp size={20} className="text-amber-200" />
          </button>
          {/* Desktop: middle-left with vertical text */}
          <button
            onClick={() => setExpanded(true)}
            type="button"
            aria-label="Expand sidebar"
            className="hidden md:flex fixed left-2 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-2 px-2 py-3 rounded-xl transition-all shadow-lg bg-[#1b0a03]/50 hover:bg-[#1b0a03]/65 backdrop-blur-xl border border-white/20"
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
