"use client";

import React from 'react';
// Icons from lucide-react, including X for the mobile close button
import { Plus, BarChart3, Coins, ArrowLeftRight, Users, MessageCircle, Bookmark, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { SidebarProps } from './types'; // Assuming this type is defined elsewhere

// Props for each widget item
interface WidgetItemProps {
  icon: React.ReactNode;
  text: string;
  expanded: boolean;
  active?: boolean;
}

const WidgetItem: React.FC<WidgetItemProps> = ({ icon, text, expanded, active }) => {
  // Base classes for all items
  const baseClasses = "flex items-center h-[36px] py-2 px-3 mx-2 mb-[6px] rounded-[10px] cursor-pointer transition-all duration-200 ease-in-out relative";
  
  // Conditional classes based on the 'active' state
  const activeClasses = "bg-[#a3580f] shadow-[inset_0_0_4px_3px_rgba(255,255,255,0.1)]";
  const inactiveClasses = "hover:bg-[rgba(0,0,0,0.178)]";

  return (
    <div className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}>
      {/* Icon */}
      <div className={`flex-shrink-0 ${active ? '[filter:brightness(1.2)_drop-shadow(0_1px_2px_rgba(0,0,0,0.3))]' : 'opacity-80'}`}>
        {icon}
      </div>

      {/* Widget Text: transitions in and out */}
      <span className={`
        flex-1 text-[13px] font-medium text-[#e6d4a3] tracking-[0.1px]
        transition-all duration-200
        ${active ? '[text-shadow:0_1px_2px_rgba(0,0,0,0.4)]' : ''}
        ${expanded ? 'ml-2 opacity-100' : 'ml-0 opacity-0 w-0 overflow-hidden'}
      `}>
        {text}
      </span>

      {/* Plus Icon: transitions in and out */}
      <div className={`
        flex flex-shrink-0 items-center justify-center w-4 h-4 text-[#e0940a] text-base opacity-90
        transition-all duration-200
        ${active ? 'font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]' : 'font-normal'}
        ${expanded ? 'opacity-90' : 'opacity-0'}
      `}>
        <Plus size={16} />
      </div>
    </div>
  );
};


export const DesktopSidebar: React.FC<SidebarProps> = ({ expanded, setExpanded }) => {
  const widgets = [
    // Updated icon size to 18px to match the CSS
    { icon: <BarChart3 size={18} className="text-[#ffdd00]" />, text: 'Chart', active: true },
    { icon: <Coins size={18} className="text-[#d29900]" />, text: 'Token' },
    { icon: <ArrowLeftRight size={18} className="text-[#d29900]" />, text: 'Trade' },
    { icon: <Users size={18} className="text-[#d29900]" />, text: 'Holders' },
    { icon: <MessageCircle size={18} className="text-[#d29900]" />, text: 'Chat' },
    { icon: <Bookmark size={18} className="text-[#d29900]" />, text: 'Saved' },
  ];

  return (
    <>
      {/* BACKDROP for mobile overlay */}
      <div
        onClick={() => setExpanded(false)}
        className={`fixed inset-0 bg-black/60 z-20 transition-opacity lg:hidden ${
          expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* RESPONSIVE SIDEBAR CONTAINER */}
      <aside 
        className={`
          h-full bg-[#472303] flex flex-col
          transition-all duration-300 ease-in-out
          
          /* Mobile Overlay Styles */
          fixed inset-y-0 left-0 z-30
          ${expanded ? 'translate-x-0 w-[170px]' : '-translate-x-full w-[150px]'}

          /* Desktop Static Styles */
          lg:relative lg:translate-x-0
          ${expanded ? 'lg:w-[170px]' : 'lg:w-[72px]'} 
        `}
      >
        {/* Header */}
        <div className="flex-shrink-0 relative flex items-center justify-center px-[12px] pt-[16px] pb-[20px]">
          <div className={`transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {/* Title styled to match the CSS */}
            <h2 className="text-[#daa20b] text-lg font-semibold tracking-[0.2px] [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
              Widgets
            </h2>
          </div>
          
          {/* Desktop Toggle Button */}
          <button 
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-full bg-black/30 hover:bg-black/50 
                       absolute -right-3 top-[26px]
                       hidden lg:block z-10"
            type="button"
          >
            {expanded ? <ChevronLeft size={16} className="text-amber-200" /> : <ChevronRight size={16} className="text-amber-200" />}
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
            />
          ))}
        </nav>
      </aside>
    </>
  );
};