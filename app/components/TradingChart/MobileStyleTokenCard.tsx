"use client";

import React, { useEffect, useRef } from 'react';
import { Send, Globe } from 'lucide-react';
import styles from './MobileStyleTokenCard.module.css';

// Twitter icon component
const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 1200 1227" fill="currentColor">
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6902H306.615L611.412 515.685L658.88 583.579L1055.08 1150.31H892.476L569.165 687.854V687.828Z"/>
  </svg>
);

export interface TokenData {
  name: string;
  symbol: string;
  logo?: string;
  currentTax: {
    buy: number;
    sell: number;
  };
  maxTax?: {
    buy: number;
    sell: number;
  };
  maxTransaction: number;
  description: string;
  marketCap: string;
  volume: string;
  liquidityPool: string;
  bondingProgress: number;
  tag: string;
  tagColor?: string;
}

interface MobileStyleTokenCardProps {
  tokenData: TokenData;
}

export const MobileStyleTokenCard: React.FC<MobileStyleTokenCardProps> = ({ tokenData }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const flamesRef = useRef<HTMLDivElement>(null);
  const sparkTimer = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Social button handlers
  const handleTelegramClick = () => {
    window.open('https://t.me/spaceman', '_blank');
  };

  const handleTwitterClick = () => {
    window.open('https://twitter.com/spaceman', '_blank');
  };

  const handleWebsiteClick = () => {
    window.open('https://spaceman.com', '_blank');
  };

  // Progress bar functions
  const normalizePercent = (val: number) => {
    if (val == null || isNaN(val)) return 0;
    return val <= 1 ? val * 100 : val;
  };

  const formatPercent = (v: number) => {
    return v.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }) + '%';
  };

  const seedFlames = () => {
    if (!flamesRef.current || !fillRef.current) return;
    
    const w = fillRef.current.clientWidth || 1;
    const FLAME_COUNT = 14; // Reduced for compact version
    const FLAME_WIDTH = 20; // Match the compact CSS flame width
    
    const existingFlames = flamesRef.current.querySelectorAll(`.${styles.flame}`);
    if (existingFlames.length === FLAME_COUNT && w > 0) {
      existingFlames.forEach((flame, i) => {
        const left = (i / (FLAME_COUNT - 1)) * Math.max(0, w - FLAME_WIDTH);
        (flame as HTMLElement).style.left = `${left}px`;
      });
      return;
    }
    
    flamesRef.current.innerHTML = '';
    
    for (let i = 0; i < FLAME_COUNT; i++) {
      const flame = document.createElement('span');
      flame.className = styles.flame;
      const left = (i / (FLAME_COUNT - 1)) * Math.max(0, w - FLAME_WIDTH);
      flame.style.left = `${left}px`;
      flame.style.animationDuration = `${900 + Math.random() * 700}ms`;
      flame.style.animationDelay = `${-Math.random() * 900}ms`;
      flame.style.transform = `translateY(${Math.random() * 2}px) scale(${0.9 + Math.random() * 0.35})`;
      flamesRef.current.appendChild(flame);
    }
  };

  const startSparks = () => {
    stopSparks();
    sparkTimer.current = setInterval(() => {
      if (!fillRef.current) return;
      if (document.querySelectorAll(`.${styles.spark}`).length > 40) return;
      
      const spark = document.createElement('span');
      spark.className = styles.spark;
      const w = fillRef.current.clientWidth;
      const maxLeft = Math.max(0, w - 8);

      const tipStrength = parseFloat(fillRef.current.style.getPropertyValue('--tip') || '0');
      let x;
      if (tipStrength > 0) {
        const zone = Math.min(120, w);
        const start = Math.max(0, w - zone);
        x = start + Math.random() * zone;
      } else {
        x = Math.random() * maxLeft;
      }

      const drift = (Math.random() * 24 - 8).toFixed(1);
      spark.style.left = `${x}px`;
      spark.style.setProperty('--drift', `${drift}px`);
      spark.style.animationDuration = `${1100 + Math.random() * 900}ms`;

      fillRef.current.appendChild(spark);
      spark.addEventListener('animationend', () => spark.remove(), { once: true });
    }, 150);
  };

  const stopSparks = () => {
    if (sparkTimer.current) clearInterval(sparkTimer.current);
    sparkTimer.current = null;
  };

  const setProgress = (percent: number) => {
    if (!fillRef.current || !trackRef.current || !labelRef.current) return;
    
    const clamped = Math.max(0, Math.min(100, percent));
    fillRef.current.style.width = `${clamped}%`;
    trackRef.current.setAttribute('aria-valuenow', clamped.toFixed(1));
    labelRef.current.textContent = formatPercent(clamped);

    const tipStrength = Math.max(0, (clamped - 90) / 10);
    fillRef.current.style.setProperty('--tip', tipStrength.toFixed(3));
  };

  const animateTo = (target: number, ms = 1600) => {
    if (!fillRef.current) return;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    const startWidth = parseFloat(fillRef.current.style.width) || 0;
    const t0 = performance.now();
    let lastFlameUpdate = 0;
    
    const frame = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const eased = 1 - Math.pow(1 - k, 3);
      const value = startWidth + (target - startWidth) * eased;
      setProgress(value);
      
      if (t - lastFlameUpdate > 100) {
        seedFlames();
        lastFlameUpdate = t;
      }
      
      if (k < 1) {
        animationFrameRef.current = requestAnimationFrame(frame);
      } else {
        seedFlames();
        animationFrameRef.current = null;
      }
    };
    animationFrameRef.current = requestAnimationFrame(frame);
  };

  // Initialize progress bar animation on mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    setProgress(0);
    seedFlames();
    
    if (!prefersReducedMotion) {
      startSparks();
    }

    const normalizedProgress = normalizePercent(tokenData.bondingProgress);
    setTimeout(() => {
      animateTo(normalizedProgress, 1800);
    }, 100);

    return () => {
      stopSparks();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [tokenData.bondingProgress]);

  return (
    <article className={styles.compactCard} role="article" aria-label={`${tokenData.name} token card`}>
      {/* Token banner */}
      <div className={styles.compactBanner} aria-hidden="true">
        <div className={`${styles.bannerLayer} ${styles.gradient}`}></div>
        <div className={`${styles.bannerLayer} ${styles.innerBevel}`}></div>
      </div>

      {/* Identity row */}
      <header className={styles.compactHeader}>
        <div className={styles.identity}>
          <div className={styles.avatar}>
            <div className={styles.avatarImage}>?</div>
          </div>
          <div className={styles.nameBlock}>
            <h1 className="name">{tokenData.name}</h1>
            <div className="tickerRow">
              <div className="ticker">{tokenData.symbol}</div>
              <nav className={styles.socialsTop} aria-label="Social links">
                <button className={styles.socialBtn} onClick={handleTelegramClick} aria-label="Telegram" title="Telegram">
                  <Send size={12} />
                </button>
                <button className={styles.socialBtn} onClick={handleTwitterClick} aria-label="X (Twitter)" title="X">
                  <TwitterIcon />
                </button>
                <button className={styles.socialBtn} onClick={handleWebsiteClick} aria-label="Website" title="Website">
                  <Globe size={12} />
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className={styles.badge}>{tokenData.tag}</div>
      </header>

      <section className={styles.taxLine}>
        <div className={styles.taxStrong}>Tax: {tokenData.currentTax.buy}/{tokenData.currentTax.sell}</div>
        <div className={styles.taxChips}>
          <span className="chip">Current Tax: {tokenData.currentTax.buy}/{tokenData.currentTax.sell}</span>
          <span className="chip">MaxTX: {tokenData.maxTransaction}%</span>
        </div>
      </section>

      <p className={styles.desc}>
        {tokenData.description}
      </p>

      {/* Bottom panel: stats row + searing progress bar */}
      <section className={styles.score}>
        <div className={styles.scoreStats} aria-label="Token stats">
          <div className="stat">
            <div className="statLabel">MCAP</div>
            <div className="statValue">{tokenData.marketCap}</div>
          </div>
          <div className="stat">
            <div className="statLabel">VOLUME</div>
            <div className="statValue">{tokenData.volume}</div>
          </div>
          <div className="stat">
            <div className="statLabel">LP</div>
            <div className="statValue">{tokenData.liquidityPool}</div>
          </div>
        </div>

        {/* Searing progress bar */}
        <div
          ref={trackRef}
          className={styles.track}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
        >
          <div ref={fillRef} className={styles.fill} style={{ width: '0%' }}>
            <div ref={labelRef} className={styles.label}>0%</div>
            <div ref={flamesRef} className={styles.flames}></div>
            <div className={styles.heat} aria-hidden="true"></div>
          </div>
        </div>
      </section>
    </article>
  );
};
