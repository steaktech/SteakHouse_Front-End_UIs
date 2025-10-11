"use client";

import React from "react";

interface ToolSidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const ToolSidebar: React.FC<ToolSidebarProps> = ({ children, className }) => {
  return (
    <div className={`bg-[#07040b] border-r border-[#1f1a24] flex flex-col items-center py-1 sm:py-2 gap-1.5 sm:gap-2 ${className ?? ''}`}>
      {children}
    </div>
  );
};

interface ToolButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const ToolButton: React.FC<ToolButtonProps> = ({ active, className, children, ...rest }) => {
  const base = active ? 'bg-[#111215] text-[#feea88]' : 'text-[#c0c0c0] hover:bg-black/30';
  return (
    <button {...rest} className={`p-1.5 sm:p-2 rounded ${base} ${className ?? ''}`}>
      {children}
    </button>
  );
};
