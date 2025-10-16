"use client";

import React from 'react';
import { TradePanel } from '@/app/components/TradingChart/TradePanel';

export type TradeWidgetProps = {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress?: string;
  defaultTab?: 'buy' | 'sell' | 'limit';
};

export const TradeWidget: React.FC<TradeWidgetProps> = ({ isOpen, onClose, tokenAddress, defaultTab = 'buy' }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Panel container */}
      <div
        className="w-full lg:max-w-lg lg:rounded-2xl lg:overflow-hidden"
        style={{
          maxWidth: '680px',
          width: '100%',
          height: 'auto',
          margin: 0,
          padding: 0,
        }}
        onClick={stop}
      >
        <div
          className="bg-[rgba(0,0,0,0.15)] border border-[rgba(255,215,165,0.4)]"
          style={{
            borderRadius: 'clamp(14px, 2vw, 20px)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="p-3 flex items-center justify-between lg:hidden">
            <span className="text-[#daa20b] font-semibold tracking-wide text-sm">Trade</span>
            <button
              onClick={onClose}
              className="px-2 py-1 rounded bg-black/30 hover:bg-black/50 text-[#feea88] text-xs border border-[#daa20b]/40"
              type="button"
            >
              Close
            </button>
          </div>
          <div className="p-2 lg:p-3" style={{ minHeight: '300px' }}>
            <TradePanel initialTab={defaultTab} isMobile={true} tokenAddress={tokenAddress} />
          </div>
        </div>
      </div>
    </div>
  );
};
