import React, { useEffect, useRef, useState } from 'react';
import { Share2, Bookmark, Globe, Send, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TokenCardProps } from './types';
import { TwitterIcon } from './TwitterIcon';
import { useSaveToken } from '@/app/hooks/useSaveToken';
import { useToastHelpers } from '@/app/hooks/useToast';
import { useWallet } from '@/app/hooks/useWallet';
import { useStablePriceData } from '@/app/hooks/useStablePriceData';
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
  priceChange24h,
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

  const { isSaved: savedState, isLoading: isSaveLoading, toggleSave, error: saveError, clearError } = useSaveToken(token_address, isSaved);
  const [saveClicked, setSaveClicked] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showError, showSuccess } = useToastHelpers();
  const { isConnected } = useWallet();

  const { ethPriceUsd } = useStablePriceData(true);

  const volume24hUsd = (() => {
    if (volume == null) return undefined;
    const volNum = typeof volume === 'string' ? parseFloat(volume.replace(/[^0-9.-]+/g, "")) : volume;
    if (isNaN(volNum)) return undefined;
    if (ethPriceUsd && !isNaN(ethPriceUsd) && volNum < 10000) {
      return volNum * ethPriceUsd;
    }
    return volNum;
  })();

  const WEI_1E18 = BigInt(10) ** BigInt(18);

  function priceWeiPer1e18AtSupply(totalSupplyRaw: bigint, supplyRaw: bigint): bigint {
    const A = totalSupplyRaw;
    const s = supplyRaw;
    if (s <= BigInt(0) || s >= A) return BigInt(0);
    const denom = (A - s) * (A - s);
    return (A * WEI_1E18 * WEI_1E18) / denom;
  }

  function computeMcapUsdFromSupplySync(params: {
    totalSupply?: number;
    supplyToCirculate?: number;
    ethPriceUsd: number | null;
  }): number | null {
    const { totalSupply, supplyToCirculate, ethPriceUsd } = params;
    if (!totalSupply || !supplyToCirculate || !ethPriceUsd) return null;

    try {
      const A = BigInt(Math.floor(totalSupply));
      const s = BigInt(Math.floor(supplyToCirculate));
      if (A <= BigInt(0) || s <= BigInt(0) || s > A) return null;

      const priceWeiPer1e18 = priceWeiPer1e18AtSupply(A, s);
      const mcapWei = (priceWeiPer1e18 * s) / WEI_1E18;

      const centsPerEth = BigInt(Math.round(ethPriceUsd * 100));
      const usdCents = (mcapWei * centsPerEth) / WEI_1E18;

      return Number(usdCents) / 100;
    } catch {
      return null;
    }
  }

  const gcapValue = (() => {
    let totalSupply: number | undefined;
    if (typeof circulating_supply === 'string') {
      totalSupply = parseFloat(circulating_supply.replace(/[^0-9.-]+/g, ""));
    } else if (typeof circulating_supply === 'number') {
      totalSupply = circulating_supply;
    }

    let supplyToCirculate: number | undefined;
    if (typeof graduation_cap === 'string') {
      supplyToCirculate = parseFloat(graduation_cap.replace(/[^0-9.-]+/g, ""));
    } else if (typeof graduation_cap === 'number') {
      supplyToCirculate = graduation_cap;
    }

    if (typeof supplyToCirculate === 'number' && supplyToCirculate > 1e15) {
      supplyToCirculate = supplyToCirculate / 1e18;
    }

    const mcapCalc = computeMcapUsdFromSupplySync({
      totalSupply,
      supplyToCirculate,
      ethPriceUsd,
    });

    if (mcapCalc != null && !isNaN(mcapCalc) && mcapCalc > 0) return mcapCalc;
    if (supplyToCirculate != null && !isNaN(supplyToCirculate) && supplyToCirculate > 0) {
      return supplyToCirculate;
    }
    return undefined;
  })();

  const currentMcapValue = (() => {
    if (!mcap) return undefined;
    const parsed = typeof mcap === 'string' ? parseFloat(mcap.replace(/[^0-9.-]+/g, "")) : mcap;
    return isNaN(parsed) ? undefined : parsed;
  })();

  const gcapProgressPercent = (() => {
    if (gcapValue && currentMcapValue && gcapValue > 0) {
      return (currentMcapValue / gcapValue) * 100;
    }
    return 0;
  })();

  const formatCurrency = (value: number | undefined) => {
    if (value == null || isNaN(value)) return '$0';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const handleCardClick = () => {
    if (token_address) {
      router.push(`/trading-chart/${token_address}`);
    }
  };

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

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnected) {
      showError('Please connect your wallet to save tokens', 'Save token');
      return;
    }
    setSaveClicked(true);
    await toggleSave();
  };

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token_address) return;
    navigator.clipboard.writeText(token_address);
    setCopied(true);
    showSuccess('Address copied to clipboard', 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

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

  const calculateProgress = (): number => {
    if (progress !== undefined && progress !== null) {
      return progress;
    }
    if (gcapProgressPercent > 0) {
      return gcapProgressPercent;
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
    if (saveError) {
      showError(saveError, 'Save token');
      clearError();
      setSaveClicked(false);
    }
  }, [saveError, showError, clearError]);

  const prevSavedRef = useRef(savedState);
  useEffect(() => {
    if (saveClicked && prevSavedRef.current !== savedState) {
      showSuccess(savedState ? 'Saved token' : 'Removed from saved');
      setSaveClicked(false);
    }
    prevSavedRef.current = savedState;
  }, [savedState, saveClicked, showSuccess]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setProgress(0);
    seedFlames();
    if (!prefersReducedMotion) {
      startSparks();
    }
    const calculatedProgress = calculateProgress();
    const normalizedProgress = normalizePercent(calculatedProgress);
    setTimeout(() => {
      animateTo(normalizedProgress, 1800);
    }, 100);
    return () => {
      stopSparks();
    };
  }, [progress, circulating_supply, graduation_cap, gcapProgressPercent]);

  return (
    <div className={`${styles.tokenCard} group cursor-pointer`} onClick={handleCardClick}>
      <div className="h-32 w-[calc(100%+32px)] -mx-4 -mt-4 bg-gradient-to-b from-[#3a1b0c]/60 to-[#0f0f0f] relative overflow-hidden mb-4">
        {bannerUrl && (
          <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${bannerUrl})` }} />
        )}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-[#ffd088] hover:text-white border border-[#ffd088]/30 hover:border-[#ffd088] transition-colors" onClick={(e) => { e.stopPropagation(); }}>
            <Share2 size={16} />
          </button>
          <button className={`p-2 bg-black/50 backdrop-blur-md rounded-lg border transition-colors ${savedState ? 'text-[#ffd088] border-[#ffd088]' : 'text-[#ffd088]/70 border-[#ffd088]/30 hover:text-white hover:border-[#ffd088]'}`} onClick={handleSaveClick} disabled={isSaveLoading}>
            <Bookmark size={16} fill={savedState ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="relative">
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
            <button className={`${styles.socialBtn} ${styles.tg}`} aria-label="Telegram" title="Telegram" onClick={(e) => handleSocialClick(e, () => openLink(telegram))} disabled={!telegram}>
              <Send size={12} />
            </button>
            <button className={`${styles.socialBtn} ${styles.x}`} aria-label="X (Twitter)" title="X" onClick={(e) => handleSocialClick(e, () => openLink(twitter))} disabled={!twitter}>
              <TwitterIcon />
            </button>
            <button className={`${styles.socialBtn} ${styles.web}`} aria-label="Website" title="Website" onClick={(e) => handleSocialClick(e, () => openLink(website))} disabled={!website}>
              <Globe size={12} />
            </button>
          </div>
        </div>

        <div className="mb-4 px-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white tracking-wider font-satoshi mb-1">{name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-[#ffd088]/60 text-xs font-bold font-satoshi whitespace-nowrap">/{symbol}</span>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#ffd088]/5 border border-[#ffd088]/20 rounded-md cursor-pointer hover:bg-[#ffd088]/10 transition-colors group/copy whitespace-nowrap" onClick={handleCopyAddress}>
                  <span className="text-[#ffd088]/60 text-[10px] font-mono font-bold group-hover/copy:text-[#ffd088] transition-colors">
                    {token_address ? `${token_address.slice(0, 6)}...${token_address.slice(-4)}` : 'Address'}
                  </span>
                  {copied ? (
                    <Check size={8} className="text-green-400" />
                  ) : (
                    <Copy size={8} className="text-[#ffd088]/40 group-hover/copy:text-[#ffd088] transition-colors" />
                  )}
                </div>
                {(currentTax !== undefined || finalTax !== undefined) && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded-md whitespace-nowrap">
                    <span className="text-green-400 text-[10px] font-bold font-satoshi">Tax:</span>
                    <span className="text-green-400 text-[10px] font-bold">
                      {currentTax !== undefined ? `${currentTax}` : finalTax !== undefined ? `${finalTax}` : '0'}/{finalTax !== undefined ? finalTax : '0'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {gcapValue && gcapValue > 0 && (
              <div className="text-right flex-shrink-0 -mt-2">
                <div className="flex items-center justify-end gap-1 mb-0.5">
                  <svg className="w-3 h-3 text-[#ffd088]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  <span className="text-[#ffd088] text-[10px] font-bold font-satoshi uppercase tracking-wide whitespace-nowrap">GRAD. CAP</span>
                </div>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-white text-sm font-bold whitespace-nowrap">{formatCurrency(gcapValue)}</span>
                  {gcapProgressPercent > 0 && (
                    <span className="text-green-400 text-[10px] font-semibold whitespace-nowrap">+{gcapProgressPercent.toFixed(0)}%</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="text-[#fff6e6] text-xs leading-relaxed border-l-2 border-[#ffd088]/30 pl-3 line-clamp-2 min-h-[2.5em]">
            {description || 'No description available.'}
          </p>
        </div>

        <section className={styles.score}>
          <div className={styles.scoreStats} aria-label="Token stats">
            <div className={styles.stat}>
              <div className={`${styles.statLabel} font-satoshi`}>MCAP</div>
              <div className={styles.statValue}>{mcap}</div>
            </div>
            <div className={styles.stat}>
              <div className={`${styles.statLabel} font-satoshi`}>24H VOL</div>
              <div className={styles.statValue}>{formatCurrency(volume24hUsd)}</div>
            </div>
            <div className={styles.stat}>
              <div className={`${styles.statLabel} font-satoshi`}>24H ^</div>
              <div className={`${styles.statValue} ${priceChange24h && priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange24h ? `${priceChange24h.toFixed(2)}%` : '0.00%'}
              </div>
            </div>
          </div>

          <div ref={trackRef} className={styles.track} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
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