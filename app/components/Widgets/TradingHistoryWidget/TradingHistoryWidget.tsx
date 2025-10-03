"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { TradingHistoryWidgetProps } from './types';
import { TradeHistory } from './TradeHistory';
import { useTokenData } from '@/app/hooks/useTokenData';
import styles from './TradingHistoryWidget.module.css';

export const TradingHistoryWidget: React.FC<TradingHistoryWidgetProps> = ({ 
  isOpen, 
  onClose, 
  tokenAddress = "0xc139475820067e2A9a09aABf03F58506B538e6Db"
}) => {
  // Fetch token data for trade history
  const { data: tokenData, isLoading, error } = useTokenData(tokenAddress);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Mobile popup version - wrapper like SavedToken
  const MobilePopupVersion = () => (
    <div className={`${styles.root} ${isOpen ? styles.open : ''}`}>
      <div className={styles.overlay} onClick={onClose} />
      
      <aside className={styles.panel} role="dialog" aria-modal="true">
        <header className={styles.header}>
          <div className={styles.icon}>H</div>
          <div>
            <div className={styles.title}>Trade History</div>
            <div className={styles.sub}>Recent trading activity</div>
          </div>
          <div className={styles.spacer} />
          <button className={styles.btn} title="Pin widget">Pin</button>
          <button className={styles.btn} onClick={onClose} title="Close">
            <X size={14} />
          </button>
        </header>

        <div className={styles.body}>
          <TradeHistory 
            tokenAddress={tokenAddress}
            tokenData={tokenData}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </aside>
    </div>
  );

  // Return only the mobile popup version
  // Desktop should use TradeHistory directly
  return <MobilePopupVersion />;
};
