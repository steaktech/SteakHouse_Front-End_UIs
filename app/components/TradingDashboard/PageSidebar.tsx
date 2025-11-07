"use client";

import React, { useState } from "react";
import {
  Bookmark,
  ExternalLink,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
} from "lucide-react";
import { SavedTokenWidget } from "../Widgets/SavedToken";
import { ExplorerWidget } from "../Widgets/ExplorerWidget";
import { ChartUserProfileWidget } from "../Widgets/ChartUserProfile";

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

  // Widget open states (only Saved, Explorer, User)
  const [savedOpen, setSavedOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

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
        className={`fixed inset-x-0 bottom-0 md:absolute md:top-0 md:bottom-0 md:left-0 z-40 flex flex-col overflow-hidden select-none h-[55vh] md:h-full w-full md:w-[160px] rounded-t-2xl md:rounded-xl border border-white/15 bg-[#1b0a03]/35 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] transform transition-transform duration-300 ${expanded ? 'translate-y-0 md:translate-x-0 md:translate-y-0 pointer-events-auto' : 'translate-y-full md:translate-y-0 md:-translate-x-full pointer-events-none'} ${className || ''}`}
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
          {/* Desktop: middle-left */}
          <button
            onClick={() => setExpanded(true)}
            type="button"
            aria-label="Expand sidebar"
            className="hidden md:flex fixed left-2 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full transition-all shadow-lg bg-[#1b0a03]/50 hover:bg-[#1b0a03]/65 backdrop-blur-xl border border-white/20"
          >
            <ChevronRight size={18} className="text-amber-200" />
          </button>
        </>
      )}
    </>
  );
};

export default PageSidebar;
