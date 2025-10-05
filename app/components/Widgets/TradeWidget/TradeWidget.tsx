"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { TradeWidgetProps } from './types';
import { TradePanel } from './TradePanel';
import styles from './TradeWidget.module.css';

export const TradeWidget: React.FC<TradeWidgetProps> = ({ 
  isOpen, 
  onClose, 
  tokenAddress,
  defaultTab = 'buy'
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

  // Mobile popup version - centered trade panel
  const MobilePopupVersion = () => (
    <div className={`${styles.root} ${isOpen ? styles.open : ''}`}>
      <div className={styles.overlay} onClick={onClose} />
      
      <div className={styles.centeredCard}>
        <button className={styles.closeBtn} onClick={onClose} title="Close">
          <X size={20} />
        </button>
        <TradePanel tokenAddress={tokenAddress} defaultTab={defaultTab} isMobile={true} />
      </div>
    </div>
  );

  // Return only the mobile popup version
  // Desktop should use TradePanel directly
  return <MobilePopupVersion />;
};
