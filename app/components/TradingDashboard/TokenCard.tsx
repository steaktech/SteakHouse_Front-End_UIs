import React, { useEffect, useRef, useState } from 'react';
import { Share2, Bookmark, Globe, Send, Copy, Check } from 'lucide-react';
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
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const flamesRef = useRef<HTMLDivElement>(null);
  const sparkTimer = useRef<NodeJS.Timeout | null>(null);

  // Save token functionality
  const { isSaved: savedState, isLoading: isSaveLoading, toggleSave, error: saveError, clearError } = useSaveToken(token_address, isSaved);
  const [saveClicked, setSaveClicked] = useState(false);
  const [copied, setCopied] = useState(false);
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
    } catch { }
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

  // Handle copy address
  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token_address) return;
    navigator.clipboard.writeText(token_address);
    setCopied(true);
    showSuccess('Address copied to clipboard', 'Copied');
    setTimeout(() => setCopied(false), 2000);
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

  // Calculate progress percentage
  const calculateProgress = (): number => {
    if (progress !== undefined && progress !== null) {
      return progress;
    }
    if (circulating_supply && graduation_cap) {
      const circulatingSupplyNum = parseFloat(circulating_supply);
      const graduationCapNum = parseFloat(graduation_cap);
      if (isNaN(circulatingSupplyNum) || isNaN(graduationCapNum) || graduationCapNum === 0) {
        return 0;
      }
      return (circulatingSupplyNum / graduationCapNum) * 100;
    }
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

  // Initialize animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    };
  }, [progress, circulating_supply, graduation_cap]);

  return (
    <div
      className={`${styles.tokenCard} group cursor-pointer`}
      onClick={handleCardClick}
    >

      {/* Header Image Area - Negative margins to counteract card padding */}
      <div className="h-32 w-[calc(100%+32px)] -mx-4 -mt-4 bg-gradient-to-b from-[#3a1b0c]/60 to-[#0f0f0f] relative overflow-hidden mb-4">
        {/* Banner Image if available */}
        {bannerUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-500"
            style={{ backgroundImage: `url(${bannerUrl})` }}
          />
        )}

        {/* Abstract Pattern Overlay (if no banner or on top) */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>

        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-[#ffd088] hover:text-white border border-[#ffd088]/30 hover:border-[#ffd088] transition-colors"
            onClick={(e) => { e.stopPropagation(); /* Share logic if needed */ }}
          >
            <Share2 size={16} />
          </button>
          <button
            className={`p-2 bg-black/50 backdrop-blur-md rounded-lg border transition-colors ${savedState ? 'text-[#ffd088] border-[#ffd088]' : 'text-[#ffd088]/70 border-[#ffd088]/30 hover:text-white hover:border-[#ffd088]'}`}
            onClick={handleSaveClick}
            disabled={isSaveLoading}
          >
            <Bookmark size={16} fill={savedState ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="relative">

        {/* Avatar & Socials Row */}
        <div className="flex justify-between items-end mb-4 -mt-14 relative z-10 px-2">
          <div className="relative">
            <div className="w-17 h-17 rounded-xl bg-[#0f0f0f] border-2 border-[#ffd088] p-1 shadow-lg shadow-[#3a1b0c]/50">
              {imageUrl ? (
                <img src={imageUrl} alt={name} className="w-full h-full rounded-lg object-cover bg-[#1a1a1a]" />
              ) : (
                <div className="w-full h-full bg-[#3a1b0c]/20 rounded-lg flex items-center justify-center text-[#ffd088] font-bold text-2xl">
                  {name?.charAt(0) || 'T'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#ffd088] text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-black uppercase">
              {category || 'Meme'}
            </div>
          </div>
          <div className="flex gap-1 mt-3">
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
          </div>
        </div>

        {/* Title & Description */}
        <div className="mb-4 px-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white tracking-wider font-satoshi truncate max-w-[200px]">{name}</h2>
            <span className="text-[#ffd088]/60 text-sm font-bold font-satoshi">/ {symbol}</span>
          </div>

          {/* Token Address Copy */}
          <div
            className="inline-flex items-center gap-2 px-2 py-1 bg-[#ffd088]/5 border border-[#ffd088]/20 rounded-md cursor-pointer hover:bg-[#ffd088]/10 transition-colors mb-3 group/copy"
            onClick={handleCopyAddress}
          >
            <span className="text-[#ffd088]/60 text-[10px] font-mono font-bold group-hover/copy:text-[#ffd088] transition-colors">
              {token_address ? `${token_address.slice(0, 6)}...${token_address.slice(-4)}` : 'Address'}
            </span>
            {copied ? (
              <Check size={10} className="text-green-400" />
            ) : (
              <Copy size={10} className="text-[#ffd088]/40 group-hover/copy:text-[#ffd088] transition-colors" />
            )}
          </div>

          <p className="text-gray-400 text-xs leading-relaxed border-l-2 border-[#ffd088]/30 pl-3 line-clamp-2 min-h-[2.5em]">
            {description || 'No description available.'}
          </p>
        </div>

        {/* Bottom panel: stats row + searing progress bar */}
        <section className={styles.score}>
          <div className={styles.scoreStats} aria-label="Token stats">
            <div className={styles.stat}>
              <div className={`${styles.statLabel} font-satoshi`}>MCAP</div>
              <div className={styles.statValue}>{mcap}</div>
            </div>
            <div className={styles.stat}>
              <div className={`${styles.statLabel} font-satoshi`}>VOLUME</div>
              <div className={styles.statValue}>{volume}</div>
            </div>
            <div className={styles.stat}>
              <div className={`${styles.statLabel} font-satoshi`}>LP</div>
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
      </div>
    </div>
  );
};