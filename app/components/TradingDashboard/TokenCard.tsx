import React, { useEffect, useRef } from 'react';
import { Globe, Send } from 'lucide-react';
import { TokenCardProps } from './types';
import { TwitterIcon } from './TwitterIcon';
import styles from './TokenCard.module.css';

export const TokenCard: React.FC<TokenCardProps> = ({ 
  isOneStop, 
  imageUrl, 
  name, 
  symbol, 
  tag, 
  tagColor, 
  description, 
  mcap, 
  liquidity, 
  volume, 
  progress 
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const flamesRef = useRef<HTMLDivElement>(null);
  const sparkTimer = useRef<NodeJS.Timeout | null>(null);

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


  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Initialize progress bar
    setProgress(0);
    seedFlames();
    
    if (!prefersReducedMotion) {
      startSparks();
    }

    // Animate to target progress
    const normalizedProgress = normalizePercent(progress);
    setTimeout(() => {
      animateTo(normalizedProgress, 1800);
    }, 100);

    // Cleanup
    return () => {
      stopSparks();
    };
  }, [progress]);

  return (
    <article 
      className={styles.tokenCard}
      role="article"
      aria-label={`${name} token card`}
    >
      {/* Token banner */}
      <div className={styles.tokenBanner} aria-hidden="true">
        <div className={`${styles.bannerLayer} ${styles.gradient}`}></div>
        <div className={`${styles.bannerLayer} ${styles.innerBevel}`}></div>
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
            <h1 className={styles.name}>{name}</h1>
            <div className={styles.ticker}>{symbol}</div>
          </div>
        </div>

        <div className={styles.badge}>{tag}</div>
      </header>

      <section className={styles.taxLine}>
        <div className={styles.taxStrong}>Tax: 3/3</div>
        <div className={styles.taxChips}>
          <span className={styles.chip}>Current Tax: 3/3</span>
          <span className={styles.chip}>MaxTX: 2,1%</span>
        </div>
      </section>

      <p className={styles.desc}>
        {description}
      </p>

      <nav className={styles.socials} aria-label="Social links">
        <button className={`${styles.socialBtn} ${styles.tg}`} aria-label="Telegram" title="Telegram">
          <Send size={18} />
        </button>
        <button className={`${styles.socialBtn} ${styles.x}`} aria-label="X (Twitter)" title="X">
          <TwitterIcon />
        </button>
        <button className={`${styles.socialBtn} ${styles.web}`} aria-label="Website" title="Website">
          <Globe size={18} />
        </button>
      </nav>

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