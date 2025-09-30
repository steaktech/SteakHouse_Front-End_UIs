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
  
  // Chat widget colors
  const activeStyle = {
    background: 'linear-gradient(180deg, #ffc24b, #ffb020)',
    border: '1px solid #8b5a2b',
    color: '#1c0f07'
  };
  
  const inactiveStyle = {
    background: 'linear-gradient(180deg, rgba(74, 38, 16, 0.75), rgba(58, 30, 14, 0.85))',
    border: '1px solid #8b5a2b'
  };

  return (
    <div 
      className={baseClasses}
      style={active ? activeStyle : inactiveStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'linear-gradient(180deg, rgba(74, 38, 16, 0.9), rgba(58, 30, 14, 1))';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'linear-gradient(180deg, rgba(74, 38, 16, 0.75), rgba(58, 30, 14, 0.85))';
        }
      }}
    >
      {/* Icon */}
      <div className={`mb-2 ${active ? '' : 'opacity-90'}`}>
        {icon}
      </div>

      {/* Widget Text */}
      <span className="text-xs font-medium text-center tracking-[0.1px]" style={{
        color: active ? '#1c0f07' : '#fcefd8'
      }}>
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
    { icon: <BarChart3 size={24} style={{ color: '#1c0f07' }} />, text: 'Chart', active: true },
    { icon: <Coins size={24} style={{ color: '#ffc24b' }} />, text: 'Token', onClick: handleTokenClick },
    { icon: <Users size={24} style={{ color: '#ffc24b' }} />, text: 'Holders', onClick: handleHoldersClick },
    { icon: <MessageCircle size={24} style={{ color: '#ffc24b' }} />, text: 'Chat', onClick: handleChatClick },
    { icon: <Bookmark size={24} style={{ color: '#ffc24b' }} />, text: 'Saved', onClick: handleSavedTokenClick },
  ];

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={() => setExpanded(false)}
        className={`fixed inset-0 z-40 transition-opacity lg:hidden ${
          expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(0, 0, 0, 0.35)' }}
      />

      {/* MOBILE BOTTOM SIDEBAR */}
      <div 
        className={`
          fixed bottom-0 left-0 right-0 z-50
          shadow-[0_-4px_20px_rgba(0,0,0,0.4)]
          transition-transform duration-300 ease-out
          lg:hidden
          ${expanded ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{
          background: 'linear-gradient(180deg, #3a1e0e, #241208)',
          borderTop: '1px solid #8b5a2b'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(184, 137, 87, 0.25)' }}>
          <h2 className="text-lg font-semibold tracking-[0.2px]" style={{ color: '#ffc24b' }}>
            Widgets
          </h2>
          <button 
            onClick={() => setExpanded(false)}
            className="p-2 rounded-full transition-all"
            type="button"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))',
              border: '1px solid #8b5a2b'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.24), rgba(255, 178, 32, 0.16))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))';
            }}
          >
            <X size={18} style={{ color: '#ffc24b' }} />
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
