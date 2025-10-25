"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Send, Globe, Copy, Check } from 'lucide-react';
import styles from './TokenWidget.module.css';
import { TokenWidgetProps, TokenData } from './types';
import { useTokenData } from '@/app/hooks/useTokenData';

// Twitter icon component
const TwitterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 1200 1227" fill="currentColor">
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6902H306.615L611.412 515.685L658.88 583.579L1055.08 1150.31H892.476L569.165 687.854V687.828Z"/>
  </svg>
);

// Demo token data matching the screenshot
const defaultTokenData: TokenData = {
  name: "SpaceMan",
  symbol: "SPACE",
  currentTax: {
    buy: 3,
    sell: 3
  },
  maxTax: {
    buy: 2.1,
    sell: 2.1
  },
  maxTransaction: 2.1,
  description: "Spaceman is a meme deflationary token with a finite supply and buyback and burn mechanism.",
  marketCap: "$21.5K",
  volume: "$6.2K",
  liquidityPool: "$2.3K",
  bondingProgress: 82,
  tag: "Meme",
  tagColor: "#ffd700"
};

export const TokenWidget: React.FC<TokenWidgetProps> = ({ 
  isOpen, 
  onClose, 
  tokenData = defaultTokenData,
  tokenAddress = null,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const flamesRef = useRef<HTMLDivElement>(null);
  const sparkTimer = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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

  // Fetch live token data when tokenAddress is provided
  const { data: apiTokenData } = useTokenData(tokenAddress ?? null, { interval: '1m', limit: 200 });

  // Copy token address handler with small animation
  const [copied, setCopied] = useState(false);
  const handleCopyToken = async () => {
    try {
      const addr = apiTokenData?.tokenInfo?.real_token_address
        || apiTokenData?.tokenInfo?.token_address
        || tokenAddress
        || '';
      if (!addr) return;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(addr);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = addr;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } finally {
          document.body.removeChild(textArea);
        }
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error('Failed to copy token address to clipboard', err);
    }
  };

  // Map API data to widget TokenData shape (using MobileStyleTokenCard approach)
  const resolved = useMemo<TokenData>(() => {
    const apiInfo = apiTokenData?.tokenInfo;
    const apiLastTrade = apiTokenData?.lastTrade;

    // Helpers
    const formatShort = (n?: number) => {
      if (n == null || isNaN(n)) return undefined as unknown as string;
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
      return `$${n.toFixed(2)}`;
    };

    const taxValue = Number(apiInfo?.final_tax_rate ?? apiInfo?.curve_starting_tax ?? tokenData.currentTax?.buy ?? 3);
    const maxTxPctNum = apiInfo?.curve_max_tx && apiInfo?.total_supply
      ? (() => {
          const pct = (Number(apiInfo.curve_max_tx) / Number(apiInfo.total_supply)) * 100;
          return pct >= 100 ? 100 : pct;
        })()
      : tokenData.maxTransaction;
    const bondingPct = apiInfo
      ? (() => {
          const circulating = Number(apiInfo.circulating_supply);
          const cap = Number(apiInfo.graduation_cap_norm);
          return !isNaN(circulating) && !isNaN(cap) && cap > 0 ? (circulating / cap) * 100 : (tokenData.bondingProgress ?? 0);
        })()
      : (tokenData.bondingProgress ?? 0);
    const volumeUsd = (() => {
      const last = apiLastTrade ?? null;
      if (!last) return tokenData.volume;
      const v = typeof last.usdValue === 'string'
        ? parseFloat(String(last.usdValue).replace(/[^0-9.-]+/g, ''))
        : Number(last.usdValue ?? 0);
      return isNaN(v) ? tokenData.volume : `$${v.toFixed(2)}`;
    })();

    return {
      name: apiInfo?.name ?? tokenData.name,
      symbol: apiInfo?.symbol ?? tokenData.symbol,
      logo: apiInfo?.image_url ?? tokenData.logo,
      currentTax: {
        buy: taxValue,
        sell: taxValue,
      },
      maxTax: {
        buy: taxValue,
        sell: taxValue,
      },
      maxTransaction: typeof maxTxPctNum === 'number' ? parseFloat(maxTxPctNum.toFixed(1)) : (maxTxPctNum as number),
      description: apiInfo?.bio ?? tokenData.description,
      marketCap: formatShort(apiTokenData?.marketCap as number) ?? tokenData.marketCap,
      volume: volumeUsd,
      liquidityPool: apiInfo?.eth_pool != null ? `${Number(apiInfo.eth_pool).toFixed(2)} ETH` : tokenData.liquidityPool,
      bondingProgress: bondingPct,
      tag: apiInfo?.catagory ?? tokenData.tag,
      tagColor: tokenData.tagColor,
    };
  }, [apiTokenData, tokenData]);

  // Also expose bannerUrl locally to support banner background
  const bannerUrl = apiTokenData?.tokenInfo?.banner_url as string | undefined;

  // Progress bar functions (copied from TokenCard)
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
    const FLAME_COUNT = 16;
    
    const existingFlames = flamesRef.current.querySelectorAll(`.${styles.flame}`);
    if (existingFlames.length === FLAME_COUNT && w > 0) {
      existingFlames.forEach((flame, i) => {
        const left = (i / (FLAME_COUNT - 1)) * Math.max(0, w - 26);
        (flame as HTMLElement).style.left = `${left}px`;
      });
      return;
    }
    
    flamesRef.current.innerHTML = '';
    
    for (let i = 0; i < FLAME_COUNT; i++) {
      const flame = document.createElement('span');
      flame.className = styles.flame;
      const left = (i / (FLAME_COUNT - 1)) * Math.max(0, w - 26);
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

  // Initialize progress bar animation on mount and when progress changes
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    setProgress(0);
    seedFlames();
    
    if (!prefersReducedMotion) {
      startSparks();
    }

    const normalizedProgress = normalizePercent(resolved.bondingProgress);
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
  }, [resolved.bondingProgress]);

  return (
    <div 
      className={`${styles.root} ${isOpen ? styles.open : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        margin: 0,
        padding: 0
      }}
    >
      <div 
        className={styles.overlay} 
        onClick={handleOverlayClick}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          margin: 0,
          padding: 0
        }}
      >
        <div 
          className={styles.panel} 
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            margin: '0',
            padding: '0',
            zIndex: 10000
          }}
        >
          {/* Close button */}
          <button 
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close token widget"
          >
            <X size={16} />
          </button>

          {/* Token card structure - now with API-backed data mapping */}
          <article className={styles.tokenCard} role="article" aria-label={`${resolved.name} token card`}>
            {/* Token banner */}
            <div 
              className={styles.tokenBanner} 
              aria-hidden="true"
              style={bannerUrl ? ({ ['--banner-image' as any]: `url(${bannerUrl})` } as React.CSSProperties) : undefined}
            >
              <div className={`${styles.bannerLayer} ${styles.gradient}`}></div>
              <div className={`${styles.bannerLayer} ${styles.innerBevel}`}></div>
            </div>

            {/* Identity row */}
            <header className={styles.header}>
              <div className={styles.identity}>
                <div className={styles.avatar}>
                  {resolved.logo ? (
                    <img src={resolved.logo} alt={`${resolved.name} logo`} className={styles.avatarImage} />
                  ) : (
                    <div className={styles.avatarFallback} aria-hidden="true">{resolved.symbol?.[0] ?? '?'}</div>
                  )}
                </div>
                <div className={styles.nameBlock}>
                  <h1 className={styles.name}>{resolved.name}</h1>
                  <div className={styles.tickerRow}>
                    <div className={styles.ticker}>${resolved.symbol}</div>
                    <nav className={styles.socialsTop} aria-label="Social links">
                      <button className={`${styles.socialBtn} ${styles.tg}`} onClick={handleTelegramClick} aria-label="Telegram" title="Telegram">
                        <Send size={16} />
                      </button>
                      <button className={`${styles.socialBtn} ${styles.x}`} onClick={handleTwitterClick} aria-label="X (Twitter)" title="X">
                        <TwitterIcon />
                      </button>
                      <button className={`${styles.socialBtn} ${styles.web}`} onClick={handleWebsiteClick} aria-label="Website" title="Website">
                        <Globe size={16} />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>

              <div className={styles.badgeRow}>
                <div className={styles.badge}>{resolved.tag}</div>
                <button
                  className={`${styles.copyTokenBtn} ${copied ? styles.copied : ''}`}
                  onClick={handleCopyToken}
                  aria-label={copied ? 'Copied token address' : 'Copy token address'}
                  title={copied ? 'Copied!' : 'Copy token address to clipboard'}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </header>

            <section className={styles.taxLine}>
              <div className={styles.taxStrong}>Tax: {resolved.currentTax.buy}/{resolved.currentTax.sell}</div>
              <div className={styles.taxChips}>
                <span className={styles.chip}>Current Tax: {resolved.currentTax.buy}/{resolved.currentTax.sell}</span>
                <span className={styles.chip}>MaxTX: {resolved.maxTransaction >= 100 ? '100%+' : `${resolved.maxTransaction}%`}</span>
              </div>
            </section>

            <p className={styles.desc}>
              {resolved.description}
            </p>

            {/* Bottom panel: stats row + searing progress bar */}
            <section className={styles.score}>
              <div className={styles.scoreStats} aria-label="Token stats">
                <div className={styles.stat}>
                  <div className={styles.statLabel}>MCAP</div>
                  <div className={styles.statValue}>{resolved.marketCap}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>VOLUME</div>
                  <div className={styles.statValue}>{resolved.volume}</div>
                </div>
                <div className={styles.stat}>
                  <div className={styles.statLabel}>LP</div>
                  <div className={styles.statValue}>{resolved.liquidityPool}</div>
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
        </div>
      </div>
    </div>
  );
};