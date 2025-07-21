"use client";

import React from 'react';
import { Plus, BarChart3, Coins, ArrowLeftRight, Users, MessageCircle, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import { SidebarProps } from './types';

interface WidgetItemProps {
  icon: React.ReactNode;
  text: string;
  expanded: boolean;
  active?: boolean;
}

const WidgetItem: React.FC<WidgetItemProps> = ({ icon, text, expanded, active }) => {
  return (
    <div className={`
      flex items-center justify-between p-3 my-1 rounded-lg transition-all duration-300 cursor-pointer group
      ${active ? 'bg-amber-700/30' : 'hover:bg-amber-800/20'}
    `}>
      <div className="flex items-center">
        <div className="text-amber-400 group-hover:text-amber-300 transition-colors duration-200">
          {icon}
        </div>
        <span className={`
          text-amber-300 group-hover:text-amber-200 transition-all duration-300 font-medium
          ${expanded ? 'ml-3 opacity-100 w-auto' : 'ml-0 opacity-0 w-0 overflow-hidden'}
        `}>
          {text}
        </span>
      </div>
      <div className={`
        text-amber-400 group-hover:text-amber-300 transition-all duration-300
        ${expanded ? 'opacity-100' : 'opacity-0'}
      `}>
        <Plus size={16} />
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ expanded, setExpanded }) => {
  const widgets = [
    { icon: <BarChart3 size={20} />, text: 'chart', active: true },
    { icon: <Coins size={20} />, text: 'token' },
    { icon: <ArrowLeftRight size={20} />, text: 'trade' },
    { icon: <Users size={20} />, text: 'holders' },
    { icon: <MessageCircle size={20} />, text: 'chat' },
    { icon: <Bookmark size={20} />, text: 'saved' },
  ];

  const handleToggle = () => {
    console.log('Toggle clicked, current expanded:', expanded);
    setExpanded(!expanded);
    console.log('New expanded value should be:', !expanded);
  };

  console.log('Sidebar render - expanded:', expanded);

  return (
    <aside 
      className={`h-screen transition-all duration-300 ease-in-out bg-gradient-to-b from-[#4a2c0a] to-[#2d1a05] text-amber-300 flex flex-col border-r border-amber-600/30 relative flex-shrink-0 ${
        expanded ? 'w-64' : 'w-16'
      }`}
      style={{ 
        width: expanded ? '256px' : '64px',
        minWidth: expanded ? '256px' : '64px',
        maxWidth: expanded ? '256px' : '64px'
      }}
    >
      {/* Header */}
      <div className={`p-4 border-b border-amber-600/30 relative transition-all duration-300 ${expanded ? '' : 'pb-2'}`}>
        {expanded && (
          <div className="transition-all duration-300 text-center">
            <h2 className="text-amber-200 font-bold text-lg tracking-wider">WIDGETS</h2>
          </div>
        )}
      </div>

      {/* Toggle Button - Positioned separately */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={handleToggle}
          className="p-2 rounded-lg bg-amber-800/50 hover:bg-amber-700/60 transition-all duration-200 border border-amber-600/40 cursor-pointer shadow-lg backdrop-blur-sm"
          type="button"
        >
          {expanded ? <ChevronLeft size={18} className="text-amber-200" /> : <ChevronRight size={18} className="text-amber-200" />}
        </button>
      </div>

      {/* Widget List */}
      <nav className="flex-1 p-4 space-y-2">
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
  );
}; 