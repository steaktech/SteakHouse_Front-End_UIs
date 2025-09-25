"use client";

import React, { useState } from 'react';
import { Plus, BarChart3, Coins, ArrowLeftRight, Users, MessageCircle, Bookmark, X } from 'lucide-react';
import { SidebarProps } from './types';
import { SteakHoldersWidget } from '../Widgets/SteakHoldersWidget';
import { ChatWidget } from '../Widgets/ChatWidget';
import { SavedTokenWidget } from '../Widgets/SavedToken';
import { TokenWidget } from '../Widgets/TokenWidget';

// Props for each widget card
interface WidgetCardProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ icon, text, active, onClick }) => {
  const baseClasses = "flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-200 ease-in-out";
  const activeClasses = "bg-[#a3580f] shadow-[inset_0_0_4px_3px_rgba(255,255,255,0.1)] border border-[#daa20b]/40";
  const inactiveClasses = "bg-[#472303]/80 hover:bg-[#472303] border border-[#472303]/60 hover:border-[#daa20b]/30";

  return (
    <div 
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
      onClick={onClick}
    >
      {/* Icon */}
      <div className={`mb-2 ${active ? '[filter:brightness(1.2)_drop-shadow(0_1px_2px_rgba(0,0,0,0.3))]' : 'opacity-80'}`}>
        {icon}
      </div>

      {/* Widget Text */}
      <span className={`
        text-xs font-medium text-center tracking-[0.1px]
        ${active ? 'text-[#e6d4a3] [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]' : 'text-[#e6d4a3]/80'}
      `}>
        {text}
      </span>
    </div>
  );
};

export const MobileBottomBar: React.FC<SidebarProps> = ({ expanded, setExpanded }) => {
  const [isHoldersWidgetOpen, setIsHoldersWidgetOpen] = useState(false);
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const [isSavedTokenWidgetOpen, setIsSavedTokenWidgetOpen] = useState(false);
  const [isTokenWidgetOpen, setIsTokenWidgetOpen] = useState(false);

  const handleHoldersClick = () => {
    setIsHoldersWidgetOpen(true);
    setExpanded(false); // Close the mobile sidebar when opening the widget
  };

  const handleChatClick = () => {
    setIsChatWidgetOpen(true);
    setExpanded(false); // Close the mobile sidebar when opening the widget
  };

  const handleSavedTokenClick = () => {
    setIsSavedTokenWidgetOpen(true);
    setExpanded(false); // Close the mobile sidebar when opening the widget
  };

  const handleTokenClick = () => {
    setIsTokenWidgetOpen(true);
    setExpanded(false); // Close the mobile sidebar when opening the widget
  };

  const widgets = [
    { icon: <BarChart3 size={24} className="text-[#ffdd00]" />, text: 'Chart', active: true },
    { icon: <Coins size={24} className="text-[#d29900]" />, text: 'Token', onClick: handleTokenClick },
    { icon: <Users size={24} className="text-[#d29900]" />, text: 'Holders', onClick: handleHoldersClick },
    { icon: <MessageCircle size={24} className="text-[#d29900]" />, text: 'Chat', onClick: handleChatClick },
    { icon: <Bookmark size={24} className="text-[#d29900]" />, text: 'Saved', onClick: handleSavedTokenClick },
  ];

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={() => setExpanded(false)}
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity lg:hidden ${
          expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* MOBILE BOTTOM SIDEBAR */}
      <div 
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-gradient-to-t from-[#472303] to-[#5a2d04]
          border-t border-[#daa20b]/40
          shadow-[0_-4px_20px_rgba(0,0,0,0.4)]
          transition-transform duration-300 ease-out
          lg:hidden
          ${expanded ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#daa20b]/20">
          <h2 className="text-[#daa20b] text-lg font-semibold tracking-[0.2px] [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
            Widgets
          </h2>
          <button 
            onClick={() => setExpanded(false)}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            type="button"
          >
            <X size={18} className="text-[#daa20b]" />
          </button>
        </div>

        {/* Widget Grid */}
        <div className="p-6 pb-8">
          <div className="space-y-4">
            {/* First Row: Chart and Token */}
            <div className="grid grid-cols-2 gap-4">
              {widgets.slice(0, 2).map((widget, index) => (
                <WidgetCard
                  key={index}
                  icon={widget.icon}
                  text={widget.text}
                  active={widget.active}
                  onClick={widget.onClick || (() => {
                    // Handle widget selection here
                    console.log(`Selected widget: ${widget.text}`);
                  })}
                />
              ))}
            </div>
            {/* Second Row: Holders, Chat, Saved */}
            <div className="grid grid-cols-3 gap-4">
              {widgets.slice(2).map((widget, index) => (
                <WidgetCard
                  key={index + 2}
                  icon={widget.icon}
                  text={widget.text}
                  active={widget.active}
                  onClick={widget.onClick || (() => {
                    // Handle widget selection here
                    console.log(`Selected widget: ${widget.text}`);
                  })}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SteakHolders Widget */}
      <SteakHoldersWidget 
        isOpen={isHoldersWidgetOpen}
        onClose={() => setIsHoldersWidgetOpen(false)}
      />

      {/* Chat Widget */}
      <ChatWidget 
        isOpen={isChatWidgetOpen}
        onClose={() => setIsChatWidgetOpen(false)}
      />

      {/* Saved Token Widget */}
      <SavedTokenWidget 
        isOpen={isSavedTokenWidgetOpen}
        onClose={() => setIsSavedTokenWidgetOpen(false)}
      />

      {/* Token Widget */}
      <TokenWidget 
        isOpen={isTokenWidgetOpen}
        onClose={() => setIsTokenWidgetOpen(false)}
      />
    </>
  );
};
