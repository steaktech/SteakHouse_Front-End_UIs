"use client";

import React, { useState } from "react";
import { Home, BarChart3, Star, Briefcase, LineChart, ChevronLeft, ChevronRight, Settings } from "lucide-react";

interface PageSidebarProps {
  className?: string;
}

interface ItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  expanded: boolean;
  onClick?: () => void;
}

const Item: React.FC<ItemProps> = ({ icon, label, active, expanded, onClick }) => {
  const base = "flex items-center h-[34px] py-1.5 px-2.5 mx-1.5 mb-[6px] rounded-[8px] transition-all duration-300 ease-in-out cursor-pointer";
  const state = active
    ? "bg-[#a3580f]/90 shadow-[inset_0_0_4px_3px_rgba(255,255,255,0.08)]"
    : "hover:bg-[rgba(0,0,0,0.20)]";

  return (
    <div className={`${base} ${state}`} onClick={onClick}>
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
    </div>
  );
};

export const PageSidebar: React.FC<PageSidebarProps> = ({ className }) => {
  const [expanded, setExpanded] = useState(true);

  const items = [
    { icon: <Home size={16} className="text-[#ffdd00]" />, label: "Overview", active: true },
    { icon: <BarChart3 size={16} className="text-[#d29900]" />, label: "Markets" },
    { icon: <Star size={16} className="text-[#d29900]" />, label: "Watchlist" },
    { icon: <Briefcase size={16} className="text-[#d29900]" />, label: "Portfolio" },
    { icon: <LineChart size={16} className="text-[#d29900]" />, label: "Insights" },
    { icon: <Settings size={16} className="text-[#d29900]" />, label: "Settings" },
  ];

  return (
    <>
    <aside
      className={`relative flex flex-col overflow-hidden select-none shrink-0 flex-none self-stretch min-w-0 ${className || ""}`}
      style={{
        background: "linear-gradient(180deg, #572501 0%, #572501 65%, #7d3802 100%)",
        boxShadow: "0 3px 8px rgba(0, 0, 0, 0.2)",
        width: expanded ? 220 : 0,
        transition: "width 320ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-center px-[10px] pt-[12px] pb-[14px] relative">
        <div className={`transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0"}`}>
          <h2 className="text-[#daa20b] text-[15px] font-semibold tracking-[0.15px] [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
            Menu
          </h2>
        </div>
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
            onClick={() => {}}
          />)
        )}
      </nav>

      {/* Bottom accent strip to visually snap to footer top edge */}
      <div className="h-[1px] w-full" style={{ background: "rgba(255,215,165,0.35)" }} />
    </aside>

      {/* Floating middle-left toggle */}
      <button
        onClick={() => setExpanded((e) => !e)}
        type="button"
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        className="fixed left-2 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full shadow-lg transition-all"
        style={{
          background: 'linear-gradient(180deg, rgba(255,178,32,0.18), rgba(255,178,32,0.08))',
          border: '1px solid #8b5a2b'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,178,32,0.28), rgba(255,178,32,0.18))';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,178,32,0.18), rgba(255,178,32,0.08))';
        }}
      >
        {expanded ? (
          <ChevronLeft size={18} className="text-amber-200" />
        ) : (
          <ChevronRight size={18} className="text-amber-200" />
        )}
      </button>
    </>
  );
};

export default PageSidebar;