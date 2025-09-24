"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { TokenCardInfoWidgetProps } from './types';
import { TradingTokenCard } from './TradingTokenCard';
import styles from './TokenCardInfoWidget.module.css';

// Default demo data
const defaultTokenData = {
  imageUrl: "/images/info_icon.jpg",
  name: "SPACE Token",
  symbol: "SPACE",
  tag: "MEME",
  tagColor: "#ffe49c",
  description: "A revolutionary space-themed meme token designed to take your portfolio to the moon and beyond!",
  mcap: "$2.5M",
  liquidity: "$450K",
  volume: "$1.2M",
  progress: 75
};

export const TokenCardInfoWidget: React.FC<TokenCardInfoWidgetProps> = ({ 
  isOpen, 
  onClose, 
  data,
  tokenAddress 
}) => {
  const tokenData = data || defaultTokenData;

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Mobile popup version - just the token card centered
  const MobilePopupVersion = () => (
    <div className={`${styles.root} ${isOpen ? styles.open : ''}`}>
      <div className={styles.overlay} onClick={onClose} />
      
      <div className={styles.centeredCard}>
        <button className={styles.closeBtn} onClick={onClose} title="Close">
          <X size={20} />
        </button>
        <TradingTokenCard {...tokenData} />
      </div>
    </div>
  );

  // Return only the mobile popup version
  // Desktop should use TradingTokenCard directly
  return <MobilePopupVersion />;
};
