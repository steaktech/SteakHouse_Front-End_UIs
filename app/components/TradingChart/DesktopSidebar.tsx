"use client";

import React, { useState } from 'react';
// Icons from lucide-react, including X for the mobile close button
import { Plus, BarChart3, Coins, ArrowLeftRight, Users, MessageCircle, Bookmark, Lock, ExternalLink, User, Bot, Link, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { SidebarProps } from './types'; // Assuming this type is defined elsewhere
import { SteakHoldersWidget } from '../Widgets/SteakHoldersWidget';
import { ChatWidget } from '../Widgets/ChatWidget';
import { SavedTokenWidget } from '../Widgets/SavedToken';

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
  // Base classes for all items
  const baseClasses = "flex items-center h-[30px] py-1.5 px-2.5 mx-1.5 mb-[4px] rounded-[8px] transition-all duration-200 ease-in-out relative";

  // Conditional classes based on the state
  const activeClasses = "bg-[#a3580f] shadow-[inset_0_0_4px_3px_rgba(255,255,255,0.1)] cursor-pointer";
  const greyedOutClasses = "opacity-45 cursor-not-allowed bg-[rgba(0,0,0,0.2)] saturate-0";
  const inactiveClasses = "hover:bg-[rgba(0,0,0,0.178)] cursor-pointer";

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
        }`}>
        {icon}
      </div>

      {/* Widget Text: transitions in and out */}
      <span className={`
        flex-1 text-[11px] font-medium tracking-[0.08px]
        transition-all duration-200
        ${greyedOut ? 'text-[#777] opacity-55' : 'text-[#e6d4a3]'}
        ${active ? '[text-shadow:0_1px_2px_rgba(0,0,0,0.4)]' : ''}
        ${expanded ? 'ml-1.5 opacity-100' : 'ml-0 opacity-0 w-0 overflow-hidden'}
      `}>
        {text}
      </span>

      {/* Plus Icon: transitions in and out */}
      <div className={`
        flex flex-shrink-0 items-center justify-center w-3.5 h-3.5 text-sm
        transition-all duration-200
        ${greyedOut ? 'text-[#777] opacity-35 grayscale' : 'text-[#e0940a] opacity-90'}
        ${active ? 'font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]' : 'font-normal'}
        ${expanded ? 'opacity-inherit' : 'opacity-0'}
      `}>
        <Plus size={14} />
      </div>
    </div>
  );
};


export const DesktopSidebar: React.FC<SidebarProps> = ({ expanded, setExpanded, tokenAddress }) => {
  const [isHoldersWidgetOpen, setIsHoldersWidgetOpen] = useState(false);
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const [isSavedTokenWidgetOpen, setIsSavedTokenWidgetOpen] = useState(false);

  // Determine if any secondary widgets are open (making Chart, Token, Trade active)
  const hasActiveWidget = isHoldersWidgetOpen || isChatWidgetOpen || isSavedTokenWidgetOpen;

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
    console.log('Locker clicked');
    // TODO: Implement locker functionality
  };

  const handleExplorerClick = () => {
    console.log('Explorer clicked');
    // TODO: Implement explorer functionality
  };

  const handleUserClick = () => {
    console.log('User clicked');
    // TODO: Implement user functionality
  };

  // Handlers for bottom section
  const handleSteakTechBotClick = () => {
    console.log('SteakTech Bot clicked');
    // TODO: Implement bot functionality
  };

  const handleLinksClick = () => {
    console.log('Links clicked');
    // TODO: Implement links functionality
  };

  const handleCertikClick = () => {
    console.log('Certik clicked');
    // Open the certificate page - this should be updated to the actual certificate URL when available
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

  // Handlers for Chart, Token, Trade (only functional when hasActiveWidget is true)
  const handleChartClick = () => {
    if (hasActiveWidget) {
      // Handle chart action - could navigate or perform chart-related action
      console.log('Chart clicked - widget is active');
    } else {
      console.log('Chart clicked but no active widgets - greyed out');
    }
  };

  const handleTokenClick = () => {
    if (hasActiveWidget) {
      // Handle token action - could show token details or perform token-related action
      console.log('Token clicked - widget is active');
    } else {
      console.log('Token clicked but no active widgets - greyed out');
    }
  };

  const handleTradeClick = () => {
    if (hasActiveWidget) {
      // Handle trade action - could focus trade panel or perform trade-related action
      console.log('Trade clicked - widget is active');
    } else {
      console.log('Trade clicked but no active widgets - greyed out');
    }
  };

  const widgets = [
    // Chart, Token, Trade: greyed out by default, colorful when other widgets are open
    {
      icon: <BarChart3 size={16} className={hasActiveWidget ? "text-[#ffdd00]" : "text-[#666666]"} />,
      text: 'Chart',
      active: false,
      greyedOut: !hasActiveWidget,
      onClick: handleChartClick
    },
    {
      icon: <Coins size={16} className={hasActiveWidget ? "text-[#d29900]" : "text-[#666666]"} />,
      text: 'Token',
      active: false,
      greyedOut: !hasActiveWidget,
      onClick: handleTokenClick
    },
    {
      icon: <ArrowLeftRight size={16} className={hasActiveWidget ? "text-[#d29900]" : "text-[#666666]"} />,
      text: 'Trade',
      active: false,
      greyedOut: !hasActiveWidget,
      onClick: handleTradeClick
    },
    // Holders, Chat, Saved: normal behavior
    {
      icon: <Users size={16} className="text-[#d29900]" />,
      text: 'Holders',
      active: isHoldersWidgetOpen,
      greyedOut: false,
      onClick: handleHoldersClick
    },
    {
      icon: <MessageCircle size={16} className="text-[#d29900]" />,
      text: 'Chat',
      active: isChatWidgetOpen,
      greyedOut: false,
      onClick: handleChatClick
    },
    {
      icon: <Bookmark size={16} className="text-[#d29900]" />,
      text: 'Saved',
      active: isSavedTokenWidgetOpen,
      greyedOut: false,
      onClick: handleSavedTokenClick
    },
    // New widgets
    {
      icon: <Lock size={16} className="text-[#d29900]" />,
      text: 'Locker',
      active: false,
      greyedOut: false,
      onClick: handleLockerClick
    },
    {
      icon: <ExternalLink size={16} className="text-[#d29900]" />,
      text: 'Explorer',
      active: false,
      greyedOut: false,
      onClick: handleExplorerClick
    },
    {
      icon: <User size={16} className="text-[#d29900]" />,
      text: 'User',
      active: false,
      greyedOut: false,
      onClick: handleUserClick
    },
  ];

  return (
    <>
      {/* BACKDROP for mobile overlay */}
      <div
        onClick={() => setExpanded(false)}
        className={`fixed inset-0 bg-black/60 z-20 transition-opacity lg:hidden ${expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      />

      {/* RESPONSIVE SIDEBAR CONTAINER */}
      <aside
        className={`
          h-full flex flex-col
          transition-all duration-300 ease-in-out
          
          /* Mobile Overlay Styles */
          fixed inset-y-0 left-0 z-30
          ${expanded ? 'translate-x-0 w-[140px]' : '-translate-x-full w-[120px]'}

          /* Desktop Static Styles */
          lg:relative lg:translate-x-0
          ${expanded ? 'lg:w-[140px]' : 'lg:w-[60px]'}
        `}
        style={{
          background: 'linear-gradient(180deg, #572501 0%, #572501 65%, #7d3802 100%)',
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 relative flex items-center justify-center px-[10px] pt-[12px] pb-[16px]">
          <div className={`transition-opacity duration-200 ${expanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {/* Title styled to match the CSS */}
            <h2 className="text-[#daa20b] text-base font-semibold tracking-[0.15px] [text-shadow:0_2px_4px_rgba(0,0,0,0.6)]">
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
              greyedOut={widget.greyedOut}
              onClick={widget.onClick}
            />
          ))}
        </nav>

        {/* Bottom Section - Fixed at bottom, outside scrollable area */}
        <div className="flex-shrink-0 border-t border-[rgba(255,215,165,0.3)] pt-3 pb-3">
          {/* SteakTech Bot */}
          <WidgetItem
            icon={<Bot size={16} className="text-[#d29900]" />}
            text="SteakTech Bot"
            expanded={expanded}
            active={false}
            greyedOut={false}
            onClick={handleSteakTechBotClick}
          />

          {/* Links */}
          <WidgetItem
            icon={<Link size={16} className="text-[#d29900]" />}
            text="Links"
            expanded={expanded}
            active={false}
            greyedOut={false}
            onClick={handleLinksClick}
          />

          {/* Certik Badge - Full width, styled like main page Footer */}
          <div className="mx-1.5 mt-1.5">
            <button
              onClick={handleCertikClick}
              className="w-full p-1.5 bg-[rgba(0,0,0,0.3)] hover:bg-[rgba(0,0,0,0.5)] border border-[rgba(255,215,165,0.4)] rounded-md transition-all duration-200 flex items-center justify-center"
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

      {/* SteakHolders Widget */}
      <SteakHoldersWidget
        isOpen={isHoldersWidgetOpen}
        onClose={handleHoldersClose}
        tokenAddress={tokenAddress}
      />

      {/* Chat Widget */}
      <ChatWidget
        isOpen={isChatWidgetOpen}
        onClose={handleChatClose}
      />

      {/* Saved Token Widget */}
      <SavedTokenWidget
        isOpen={isSavedTokenWidgetOpen}
        onClose={handleSavedTokenClose}
      />
    </>
  );
};
