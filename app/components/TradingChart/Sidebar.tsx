"use client";

import React from 'react';
// Added X icon for the mobile close button
import { Plus, BarChart3, Coins, ArrowLeftRight, Users, MessageCircle, Bookmark, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { SidebarProps } from './types';

// WidgetItem does not need changes, it will adapt to the parent's state
interface WidgetItemProps {
  icon: React.ReactNode;
  text: string;
  expanded: boolean;
  active?: boolean;
}

const WidgetItem: React.FC<WidgetItemProps> = ({ icon, text, expanded, active }) => {
  return (
    <div className={`
      flex items-center justify-between p-3 my-1 rounded-lg transition-colors duration-300 cursor-pointer group
      ${active ? 'bg-amber-700/30' : 'hover:bg-amber-800/20'}
    `}>
      <div className="flex items-center">
        <div className="text-amber-400 group-hover:text-amber-300 transition-colors duration-200">
          {icon}
        </div>
        <span className={`
          text-[#f8ead3] group-hover:text-amber-200 transition-all duration-300 font-medium
          ${expanded ? 'ml-3 opacity-100 w-auto' : 'ml-0 opacity-0 w-0 overflow-hidden'}
        `}>
          {text}
        </span>
      </div>
      <div className={`
        text-amber-400 group-hover:text-amber-300 transition-opacity duration-300
        ${expanded ? 'opacity-100' : 'opacity-0'}
      `}>
        <Plus size={16} />
      </div>
    </div>
  );
};


export const Sidebar: React.FC<SidebarProps> = ({ expanded, setExpanded }) => {
  const widgets = [
    { icon: <BarChart3 size={20} />, text: 'Chart', active: true },
    { icon: <Coins size={20} />, text: 'Token' },
    { icon: <ArrowLeftRight size={20} />, text: 'Trade' },
    { icon: <Users size={20} />, text: 'Holders' },
    { icon: <MessageCircle size={20} />, text: 'Chat' },
    { icon: <Bookmark size={20} />, text: 'Saved' },
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

      {/* RESPONSIVE SIDEBAR */}
      <aside 
        className={`
          h-full bg-gradient-to-b from-[#472303] to-[#2d1a05] text-amber-300 
          flex flex-col border-r border-amber-600/30
          transition-all duration-300 ease-in-out
          
          /* Mobile Overlay Styles */
          fixed inset-y-0 left-0 z-30 w-[200px]
          ${expanded ? 'translate-x-0' : '-translate-x-full'}

          /* Desktop Static Styles */
          lg:relative lg:translate-x-0
          ${expanded ? 'lg:w-[200px]' : 'lg:w-16'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-amber-600/30 flex items-center justify-center relative h-[68px] flex-shrink-0">
          <div className={`transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0"}`}>
            <h2 className="text-amber-400 font-bold text-lg tracking-wider">WIDGETS</h2>
          </div>
          
          {/* Desktop Toggle Button */}
          <button 
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-full bg-amber-900/80 hover:bg-amber-800/90 
                       absolute -right-4 top-1/2 -translate-y-1/2 border border-amber-600/40
                       hidden lg:block" /* Show only on desktop */
            type="button"
          >
            {expanded ? <ChevronLeft size={16} className="text-amber-200" /> : <ChevronRight size={16} className="text-amber-200" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setExpanded(false)}
            className="p-2 absolute right-4 top-1/2 -translate-y-1/2 lg:hidden" /* Show only on mobile */
            type="button"
          >
            <X size={20} className="text-amber-300" />
          </button>
        </div>

        {/* Widget List */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
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