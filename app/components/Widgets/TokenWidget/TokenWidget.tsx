"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import styles from './TokenWidget.module.css';
import cardStyles from '@/app/components/TradingChart/MobileStyleTokenCard.module.css';
import { TokenWidgetProps, TokenData } from './types';
import type { FullTokenDataResponse } from '@/app/types/token';

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
  apiTokenData = null, // Receive API data from parent to avoid duplicate calls
  isLoading = false,   // Receive loading state from parent
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
      ? (Number(apiInfo.curve_max_tx) / Number(apiInfo.total_supply)) * 100
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
    const FLAME_COUNT = 14;
    const FLAME_WIDTH = 18;
    
    const existingFlames = flamesRef.current.querySelectorAll(`.${cardStyles.flame}`);
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
      flame.className = cardStyles.flame;
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
      if (document.querySelectorAll(`.${cardStyles.spark}`).length > 40) return;
      
      const spark = document.createElement('span');
      spark.className = cardStyles.spark;
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

    // While loading, stop animations and skip progress update
    if (isLoading) {
      stopSparks();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }
    
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
  }, [resolved.bondingProgress, isLoading]);

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
{/* Token card structure with loading skeleton */}
          {tokenAddress && isLoading ? (
<article
              className={cardStyles.compactCard}
              role="article"
              aria-busy="true"
              aria-label="Loading token data"
              style={{ width: 'min(92vw, 352px)', maxWidth: 352, minHeight: 'min(80vh, 360px)' }}
            >
              {/* Close button anchored to the card */}
              <button 
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close token widget"
              >
                <X size={16} />
              </button>

              {/* Skeleton Banner */}
              <div
                className={`${cardStyles.compactBanner} ${cardStyles.skeleton}`}
                aria-hidden="true"
                style={{ position: 'relative' }}
              />

              {/* Skeleton Header */}
              <header className={cardStyles.compactHeader}>
                <div className={cardStyles.identity}>
                  <div className={`${cardStyles.avatar} ${cardStyles.skeleton}`}></div>
                  <div className={cardStyles.nameBlock}>
                    <div className={cardStyles.skeletonText} style={{ width: '60%', height: '14px' }}></div>
                    <div className="tickerRow" style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className={`${cardStyles.skeletonChip}`} style={{ width: 60 }}></div>
                      <div className={`${cardStyles.skeletonChip}`} style={{ width: 28 }}></div>
                      <div className={`${cardStyles.skeletonChip}`} style={{ width: 28 }}></div>
                    </div>
                  </div>
                </div>
                <div className={cardStyles.skeletonBadge}></div>
              </header>

              {/* Skeleton Tax Line */}
              <section className={cardStyles.taxLine}>
                <div className={cardStyles.skeletonText} style={{ width: '40%', height: '12px' }}></div>
                <div className={cardStyles.taxChips}>
                  <span className={cardStyles.skeletonChip} style={{ width: 100 }}></span>
                  <span className={cardStyles.skeletonChip} style={{ width: 80 }}></span>
                </div>
              </section>

              {/* Skeleton Description */}
              <div className={cardStyles.skeletonText} style={{ width: '100%', height: '14px', margin: '4px 0 6px' }}></div>

              {/* Skeleton Stats + Progress Bar */}
              <section className={cardStyles.score}>
                <div className={cardStyles.scoreStats} style={{ gap: '5px', marginBottom: '5px' }}>
                  <div className={cardStyles.skeletonStat}></div>
                  <div className={cardStyles.skeletonStat}></div>
                  <div className={cardStyles.skeletonStat}></div>
                </div>
                <div className={cardStyles.track} aria-hidden="true">
                  <div className={`${cardStyles.skeletonBar}`}></div>
                </div>
              </section>
            </article>
          ) : (
<article className={cardStyles.compactCard} role="article" aria-label={`${resolved.name} token card`} style={{ width: 'min(92vw, 352px)', maxWidth: 352, minHeight: 'min(80vh, 360px)' }}>
              {/* Close button anchored to the card */}
              <button 
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close token widget"
              >
                <X size={16} />
              </button>
              {/* Token banner */}
              <div
                className={cardStyles.compactBanner}
                aria-hidden="true"
                style={{
                  position: 'relative',
                  ...(bannerUrl ? ({ ['--banner-image' as any]: `url(${bannerUrl})` } as React.CSSProperties) : {})
                }}
              >
                <div className={`${cardStyles.bannerLayer} ${cardStyles.gradient}`} style={{ pointerEvents: 'none', zIndex: 1 }}></div>
                <div className={`${cardStyles.bannerLayer} ${cardStyles.innerBevel}`} style={{ pointerEvents: 'none', zIndex: 2 }}></div>
              </div>

              {/* Header: tax + tag + copy */}
              <header className={cardStyles.compactHeader}>
                <div className={cardStyles.identity}>
                  <div className={cardStyles.taxStrong}>Tax: {resolved.currentTax.buy}/{resolved.currentTax.sell}</div>
                </div>

                <div className={cardStyles.badgeRow}>
                  <div className={cardStyles.badge}>{resolved.tag}</div>
                  <button
                    className={`${cardStyles.copyTokenBtn} ${copied ? cardStyles.copied : ''}`}
                    onClick={handleCopyToken}
                    aria-label={copied ? 'Copied token address' : 'Copy token address'}
                    title={copied ? 'Copied!' : 'Copy token address to clipboard'}
                  >
                    <span className={cardStyles.copyLabel}>CA</span>
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </header>

              {/* Tax chips line */}
              <section className={cardStyles.taxLine}>
                <div className={cardStyles.taxChips}>
                  <span className="chip">Current Tax: {resolved.currentTax.buy}/{resolved.currentTax.sell}</span>
                </div>
                <div className={cardStyles.taxChips}>
                  <span className="chip">MaxTX: {resolved.maxTransaction >= 100 ? '100%+' : `${resolved.maxTransaction}%`}</span>
                </div>
              </section>

              {/* Description */}
              <div>
                <p className={cardStyles.desc}>{resolved.description}</p>
              </div>

              {/* Bottom panel: stats row + searing progress bar */}
              <section className={cardStyles.score}>
                <div className={cardStyles.scoreStats} aria-label="Token stats">
                  <div className="stat">
                    <div className="statLabel">MCAP</div>
                    <div className="statValue">{resolved.marketCap}</div>
                  </div>
                  <div className="stat">
                    <div className="statLabel">VOLUME</div>
                    <div className="statValue">{resolved.volume}</div>
                  </div>
                  <div className="stat">
                    <div className="statLabel">LP</div>
                    <div className="statValue">{resolved.liquidityPool}</div>
                  </div>
                </div>

                {/* Searing progress bar */}
                <div
                  ref={trackRef}
                  className={cardStyles.track}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={0}
                >
                  <div ref={fillRef} className={cardStyles.fill} style={{ width: '0%' }}>
                    <div ref={labelRef} className={cardStyles.label}>0%</div>
                    <div ref={flamesRef} className={cardStyles.flames}></div>
                    <div className={cardStyles.heat} aria-hidden="true"></div>
                  </div>
                </div>
              </section>
            </article>
          )}
        </div>
      </div>
    </div>
  );
};