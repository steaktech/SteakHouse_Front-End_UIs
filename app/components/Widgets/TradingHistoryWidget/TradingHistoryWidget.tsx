"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { TradingHistoryWidgetProps } from './types';
import { TradeHistory } from './TradeHistory';
import styles from './TradingHistoryWidget.module.css';

export const TradingHistoryWidget: React.FC<TradingHistoryWidgetProps> = ({ 
  isOpen, 
  onClose, 
  tokenAddress = "0xc139475820067e2A9a09aABf03F58506B538e6Db"
}) => {
  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Mobile popup version - centered trade history
  const MobilePopupVersion = () => (
    <div className={`${styles.root} ${isOpen ? styles.open : ''}`}>
      <div className={styles.overlay} onClick={onClose} />
      
      <div className={styles.centeredCard}>
        <button className={styles.closeBtn} onClick={onClose} title="Close">
          <X size={20} />
        </button>
        <TradeHistory tokenAddress={tokenAddress} />
      </div>
    </div>
  );

  // Return only the mobile popup version
  // Desktop should use TradeHistory directly
  return <MobilePopupVersion />;
};
