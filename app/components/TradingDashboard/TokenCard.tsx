import React, { useEffect, useRef, useState } from 'react';
import { Globe, Send, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TokenCardProps } from './types';
import { TwitterIcon } from './TwitterIcon';
import { useSaveToken } from '@/app/hooks/useSaveToken';
import { useToastHelpers } from '@/app/hooks/useToast';
import { useWallet } from '@/app/hooks/useWallet';
import styles from './TokenCard.module.css';

export const TokenCard: React.FC<TokenCardProps> = ({ 
  isOneStop, 
  imageUrl, 
  bannerUrl,
  name, 
  symbol, 
  tag, 
  tagColor, 
  description, 
  mcap, 
  liquidity, 
  volume, 
  currentTax,
  finalTax,
  maxTxPercent,
  progress,
  circulating_supply,
  graduation_cap,
  category,
  token_address,
  telegram,
  twitter,
  website,
  isSaved = false
}) => {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const flamesRef = useRef<HTMLDivElement>(null);
  const sparkTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Save token functionality
  const { isSaved: savedState, isLoading: isSaveLoading, toggleSave, error: saveError, clearError } = useSaveToken(token_address, isSaved);
  const [saveClicked, setSaveClicked] = useState(false);
  const { showError, showSuccess } = useToastHelpers();
  const { isConnected } = useWallet();

  // Handle card click for navigation
  const handleCardClick = () => {
    router.push(`/trading-chart/${token_address}`);
  };

  // Handle social button clicks (prevent card navigation)
  const handleSocialClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const openLink = (url?: string | null) => {
    if (!url) return;
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {}
  };

  // Handle save button click
  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnected) {
      showError('Please connect your wallet to save tokens', 'Save token');
      return;
    }
    setSaveClicked(true);
    await toggleSave();
  };

  // Normalize percentage (0-1 or 0-100 to 0-100)
  const normalizePercent = (val: number) => {
    if (val == null || isNaN(val)) return 0;
    return val <= 1 ? val * 100 : val;
  };

  // Format percentage with locale
  const formatPercent = (v: number) => {
    return v.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }) + '%';
  };

  // Format display values to prevent layout issues
  const formatDisplayValue = (value: string | number | null | undefined, maxLength: number = 12): string => {
    if (!value && value !== 0) return 'N/A';
    
    const stringValue = String(value);
    
    // If it's a percentage, handle it specially
    if (stringValue.includes('%')) {
      const numericPart = stringValue.replace(/[^0-9.-]/g, '');
      const numValue = parseFloat(numericPart);
      
      if (!isNaN(numValue)) {
        // Cap percentage at reasonable values
        if (numValue > 100) {
          return '100%+';
        } else if (numValue < 0) {
          return '0%';
        } else {
          return `${numValue.toFixed(1)}%`;
        }
      }
    }
    
    // If the value is too long, truncate it
    if (stringValue.length > maxLength) {
      return stringValue.substring(0, maxLength - 1) + '…';
    }
    
    return stringValue;
  };

  // Calculate progress percentage
  const calculateProgress = (): number => {
    // If progress is explicitly provided, use it
    if (progress !== undefined && progress !== null) {
      return progress;
    }
    
    // Calculate progress from circulating supply and graduation cap
    if (circulating_supply && graduation_cap) {
      const circulatingSupplyNum = parseFloat(circulating_supply);
      const graduationCapNum = parseFloat(graduation_cap);
      
      // Handle edge cases
      if (isNaN(circulatingSupplyNum) || isNaN(graduationCapNum) || graduationCapNum === 0) {
        return 0;
      }
      
      return (circulatingSupplyNum / graduationCapNum) * 100;
    }
    
    // Default to 0 if no data available
    return 0;
  };

  // Seed flames along current fill width
  const seedFlames = () => {
    if (!flamesRef.current || !fillRef.current) return;
    
    flamesRef.current.innerHTML = '';
    const w = fillRef.current.clientWidth || 1;
    const FLAME_COUNT = 16;
    
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

  // Start sparks animation
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

  // Set progress bar
  const setProgress = (percent: number) => {
    if (!fillRef.current || !trackRef.current || !labelRef.current) return;
    
    const clamped = Math.max(0, Math.min(100, percent));
    fillRef.current.style.width = `${clamped}%`;
    trackRef.current.setAttribute('aria-valuenow', clamped.toFixed(1));
    labelRef.current.textContent = formatPercent(clamped);

    const tipStrength = Math.max(0, (clamped - 90) / 10);
    fillRef.current.style.setProperty('--tip', tipStrength.toFixed(3));
  };

  // Animate progress bar
  const animateTo = (target: number, ms = 1600) => {
    if (!fillRef.current) return;
    
    const startWidth = parseFloat(fillRef.current.style.width) || 0;
    const t0 = performance.now();
    
    const frame = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const eased = 1 - Math.pow(1 - k, 3);
      const value = startWidth + (target - startWidth) * eased;
      setProgress(value);
      if (k < 1) {
        requestAnimationFrame(frame);
      } else {
        seedFlames();
      }
    };
    requestAnimationFrame(frame);
  };

  // Parallax effect
  const enableParallax = (elem: HTMLElement, { maxTilt = 5, perspective = 800 } = {}) => {
    elem.style.transform = `perspective(${perspective}px)`;
    
    const onMove = (e: MouseEvent) => {
      const r = elem.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);
      const rx = Math.max(-maxTilt, Math.min(maxTilt, -dy * maxTilt));
      const ry = Math.max(-maxTilt, Math.min(maxTilt, dx * maxTilt));
      elem.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    
    const reset = () => {
      elem.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`;
    };
    
    //elem.addEventListener('mousemove', onMove);
    //elem.addEventListener('mouseleave', reset);
    
    return () => {
      //elem.removeEventListener('mousemove', onMove);
      //elem.removeEventListener('mouseleave', reset);
    };
  };

  // Show error toast when hook surfaces an error
  useEffect(() => {
    if (saveError) {
      showError(saveError, 'Save token');
      clearError();
      setSaveClicked(false);
    }
  }, [saveError, showError, clearError]);

  // Show success toast only when the saved state actually changes due to our click
  const prevSavedRef = useRef(savedState);
  useEffect(() => {
    if (saveClicked && prevSavedRef.current !== savedState) {
      showSuccess(savedState ? 'Saved token' : 'Removed from saved');
      setSaveClicked(false);
    }
    prevSavedRef.current = savedState;
  }, [savedState, saveClicked, showSuccess]);

  useEffect(() => {
    let cleanupParallax: (() => void) | undefined;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion && cardRef.current) {
      cleanupParallax = enableParallax(cardRef.current, { maxTilt: 6, perspective: 900 });
    }

    // Initialize progress bar
    setProgress(0);
    seedFlames();
    
    if (!prefersReducedMotion) {
      startSparks();
    }

    // Animate to target progress
    const calculatedProgress = calculateProgress();
    const normalizedProgress = normalizePercent(calculatedProgress);
    setTimeout(() => {
      animateTo(normalizedProgress, 1800);
    }, 100);

    // Cleanup
    return () => {
      stopSparks();
      if (cleanupParallax) cleanupParallax();
    };
  }, [progress, circulating_supply, graduation_cap]);

  return (
    <article 
      ref={cardRef}
      className={styles.tokenCard}
      role="article"
      aria-label={`${name} token card`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Token banner */}
      <div 
        className={styles.tokenBanner} 
        aria-hidden="true"
        style={bannerUrl ? ({ ['--banner-image' as any]: `url(${bannerUrl})` } as React.CSSProperties) : undefined}
      >
        <div className={`${styles.bannerLayer} ${styles.gradient}`}></div>
        <div className={`${styles.bannerLayer} ${styles.texture}`}></div>
        <div className={`${styles.bannerLayer} ${styles.innerBevel}`}></div>
        <div className={`${styles.bannerLayer} ${styles.rimGlow}`}></div>
      </div>

      {/* Identity row */}
      <header className={styles.header}>
        <div className={styles.identity}>
          <div className={styles.avatar}>
            <img 
              src={imageUrl} 
              alt={name} 
              className={styles.avatarImage} 
            />
          </div>
          <div className={styles.nameBlock}>
            <div className={styles.nameRow}>
            <h1 className={styles.name}>{name}</h1>
              <div className={styles.rightSection}>
                <div className={styles.badge}>{category || "N/A"}</div>
                <button 
                  className={`${styles.socialBtn} ${styles.save} ${savedState ? styles.saved : ''} ${saveClicked ? styles.clicked : ''}`}
                  aria-label={savedState ? "Remove from saved" : "Save token"}
                  title={savedState ? "Remove from saved" : "Save token"}
                  onClick={handleSaveClick}
                  disabled={isSaveLoading || !token_address}
                  
                  style={{ 
                    opacity: isSaveLoading ? 0.6 : 1,
                    color: savedState ? '#ffdd00' : '#fff1dc'
                  }}
                >
                  <Bookmark size={12} fill={savedState ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
            <div className={styles.symbolRow}>
              <div className={styles.ticker}>{symbol}</div>
              <nav className={styles.socials} aria-label="Social links">
                <button 
                  className={`${styles.socialBtn} ${styles.tg}`} 
                  aria-label="Telegram" 
                  title="Telegram"
                  onClick={(e) => handleSocialClick(e, () => openLink(telegram))}
                  disabled={!telegram}
                >
                  <Send size={12} />
                </button>
                <button 
                  className={`${styles.socialBtn} ${styles.x}`} 
                  aria-label="X (Twitter)" 
                  title="X"
                  onClick={(e) => handleSocialClick(e, () => openLink(twitter))}
                  disabled={!twitter}
                >
                  <TwitterIcon />
                </button>
                <button 
                  className={`${styles.socialBtn} ${styles.web}`} 
                  aria-label="Website" 
                  title="Website"
                  onClick={(e) => handleSocialClick(e, () => openLink(website))}
                  disabled={!website}
                >
                  <Globe size={12} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.taxLine}>
        <div className={styles.taxStrong}>Tax: {currentTax ?? '3'}/{finalTax ?? '3'}</div>
        <div className={styles.taxChips}>
          <span className={styles.chip}>Current Tax: {currentTax ?? '3'}/{finalTax ?? '3'}</span>
          <span className={styles.chip}>MaxTX: {formatDisplayValue(maxTxPercent ?? '2.1%', 8)}</span>
        </div>
      </section>

      <p className={styles.desc}>
        {description}
      </p>

      {/* Bottom panel: stats row + searing progress bar */}
      <section className={styles.score}>
        <div className={styles.scoreStats} aria-label="Token stats">
          <div className={styles.stat}>
            <div className={styles.statLabel}>MCAP</div>
            <div className={styles.statValue}>{mcap}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>VOLUME</div>
            <div className={styles.statValue}>{volume}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>LP</div>
            <div className={styles.statValue}>{liquidity}</div>
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