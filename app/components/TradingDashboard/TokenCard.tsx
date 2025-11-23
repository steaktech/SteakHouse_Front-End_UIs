import React, { useEffect, useRef, useState } from 'react';
import { Share2, Bookmark, Globe, MessageCircle, Twitter, Zap, Activity, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TokenCardProps } from './types';
import { TwitterIcon } from './TwitterIcon';
import { useSaveToken } from '@/app/hooks/useSaveToken';
import { useToastHelpers } from '@/app/hooks/useToast';
import { useWallet } from '@/app/hooks/useWallet';
import styles from './TokenCard.module.css';
import Image from 'next/image';

export const TokenCardComponent: React.FC<TokenCardProps> = ({
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
  isSaved = false,
  ethPriceUsd
}) => {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const { isSaved: savedState, isLoading: isSaveLoading, toggleSave, error: saveError, clearError } = useSaveToken(token_address, isSaved);
  const [saveClicked, setSaveClicked] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showError, showSuccess } = useToastHelpers();
  const { isConnected } = useWallet();

  const volume24hUsd = React.useMemo(() => {
    if (volume == null) return undefined;
    const volNum = typeof volume === 'string' ? parseFloat(volume.replace(/[^0-9.-]+/g, "")) : volume;
    if (isNaN(volNum)) return undefined;
    if (ethPriceUsd && !isNaN(ethPriceUsd) && volNum < 10000) {
      return volNum * ethPriceUsd;
    }
    return volNum;
  }, [volume, ethPriceUsd]);

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

  const gcapValue = React.useMemo(() => {
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
      ethPriceUsd: ethPriceUsd || null,
    });

    if (mcapCalc != null && !isNaN(mcapCalc) && mcapCalc > 0) return mcapCalc;
    if (supplyToCirculate != null && !isNaN(supplyToCirculate) && supplyToCirculate > 0) {
      return supplyToCirculate;
    }
    return undefined;
  }, [circulating_supply, graduation_cap, ethPriceUsd]);

  const currentMcapValue = React.useMemo(() => {
    if (!mcap) return undefined;
    const parsed = typeof mcap === 'string' ? parseFloat(mcap.replace(/[^0-9.-]+/g, "")) : mcap;
    return isNaN(parsed) ? undefined : parsed;
  }, [mcap]);

  const gcapProgressPercent = React.useMemo(() => {
    if (gcapValue && currentMcapValue && gcapValue > 0) {
      return (currentMcapValue / gcapValue) * 100;
    }
    return 0;
  }, [gcapValue, currentMcapValue]);

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

  const progressValue = normalizePercent(calculateProgress());

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

  return (
    <div className="w-full max-w-sm bg-[#1a0f08] border border-[#c87414]/30 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(200,116,20,0.15)] relative group hover:shadow-[0_0_30px_rgba(200,116,20,0.3)] transition-all duration-300 flex flex-col h-full" onClick={handleCardClick}>

      {/* Header Image Area */}
      <div className="h-32 w-full bg-gradient-to-b from-[#2b1200]/80 to-[#1a0f08] relative">
        {/* Banner Image if available */}
        {bannerUrl && (
          <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${bannerUrl})` }} />
        )}
        {/* Abstract Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none"></div>

        {/* Top Actions */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            className="p-2 bg-[#1a0f08]/50 backdrop-blur-md rounded-lg text-[#f6e7b5] hover:text-white border border-[#c87414]/30 hover:border-[#c87414] transition-colors"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <Share2 size={16} />
          </button>
          <button
            className={`p-2 bg-[#1a0f08]/50 backdrop-blur-md rounded-lg border transition-colors ${savedState ? 'text-[#c87414] border-[#c87414]' : 'text-[#f6e7b5] hover:text-white border-[#c87414]/30 hover:border-[#c87414]'}`}
            onClick={handleSaveClick}
            disabled={isSaveLoading}
          >
            <Bookmark size={16} fill={savedState ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="px-5 pb-6 relative -mt-10 flex-1 flex flex-col">

        {/* Avatar & Socials Row */}
        <div className="flex justify-between items-end mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl bg-[#1a0f08] border-2 border-[#c87414] p-1 shadow-lg shadow-[#2b1200]/50 relative overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={name || 'Token'}
                  fill
                  className="rounded-lg object-cover bg-[#2b1200]/20"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full bg-[#2b1200]/20 rounded-lg flex items-center justify-center text-[#c87414] font-bold text-2xl">
                  {name?.charAt(0) || 'T'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#c87414] text-white text-xs font-bold px-2 py-0.5 rounded-full border border-[#1a0f08]">
              LIVE
            </div>
          </div>
          <div className="flex gap-2 mb-1">
            <SocialIcon icon={<MessageCircle size={14} />} onClick={(e) => handleSocialClick(e, () => openLink(telegram))} disabled={!telegram} />
            <SocialIcon icon={<Twitter size={14} />} onClick={(e) => handleSocialClick(e, () => openLink(twitter))} disabled={!twitter} />
            <SocialIcon icon={<Globe size={14} />} onClick={(e) => handleSocialClick(e, () => openLink(website))} disabled={!website} />
          </div>
        </div>

        {/* Title & Description */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-2xl font-bold text-[#f6e7b5] tracking-wider truncate max-w-[180px]">{name}</h2>
            <span className="text-[#c87414] text-sm font-bold whitespace-nowrap">/ {symbol}</span>
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            <span className="px-2 py-1 bg-[#c87414]/10 border border-[#c87414]/20 text-[#c87414] text-xs rounded uppercase tracking-wider">
              {category || 'Meme'}
            </span>
            {isOneStop && (
              <span className="px-2 py-1 bg-[#c87414]/10 border border-[#c87414]/20 text-[#c87414] text-xs rounded uppercase tracking-wider">
                Utility
              </span>
            )}
            <div
              className="px-2 py-1 bg-[#c87414]/10 border border-[#c87414]/20 text-[#c87414] text-xs rounded uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:bg-[#c87414]/20 transition-colors"
              onClick={handleCopyAddress}
            >
              <span>{token_address ? `${token_address.slice(0, 4)}...${token_address.slice(-4)}` : 'Address'}</span>
              {copied ? <Check size={10} /> : <Copy size={10} />}
            </div>
          </div>

          <p className="text-[#f6e7b5]/80 text-xs leading-relaxed border-l-2 border-[#c87414]/30 pl-3 line-clamp-2 min-h-[2.5em]">
            {description || 'No description available.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatBox label="24H VOL" value={formatCurrency(volume24hUsd)} />
          <StatBox
            label="24H ^"
            value={priceChange24h ? `${priceChange24h.toFixed(2)}%` : '0.00%'}
            valueClassName={priceChange24h && priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}
          />
          <StatBox label="TAX" value={`${currentTax || 0}/${finalTax || 0}`} highlight />
        </div>

        {/* Progress & Button */}
        <div className="space-y-2 mt-auto">
          <div className="flex justify-between text-xs text-[#c87414] font-bold uppercase">
            <span>Bonding Curve</span>
            <span>{formatPercent(progressValue)}</span>
          </div>

          {/* Glowing Progress Bar */}
          <div className="h-3 bg-[#2b1200] rounded-full overflow-hidden border border-[#c87414]/20 relative">
            <div
              className="h-full bg-gradient-to-r from-[#f3cc76] via-[#e8b35c] to-[#c87414] shadow-[0_0_15px_rgba(200,116,20,0.6)] transition-all duration-1000 ease-out"
              style={{ width: `${progressValue}%` }}
            ></div>
          </div>

          <button className="w-full mt-4 bg-gradient-to-r from-[#efb95e] to-[#c87414] hover:from-[#f3cc76] hover:to-[#e8b35c] text-[#1a0f08] font-bold py-3 rounded-lg uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(200,116,20,0.4)] hover:shadow-[0_0_25px_rgba(200,116,20,0.6)] flex items-center justify-center gap-2 group-hover:scale-[1.02] duration-200 border border-[#c87414]">
            Trade {symbol} <Zap size={16} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---

const StatBox = ({ label, value, highlight, valueClassName }: { label: string, value: string | number, highlight?: boolean, valueClassName?: string }) => (
  <div className={`bg-[#2b1200]/60 p-2 rounded border ${highlight ? 'border-[#c87414]/30 text-[#c87414]' : 'border-[#c87414]/10 text-[#f6e7b5]'} text-center`}>
    <div className="text-[10px] text-[#f6e7b5]/60 uppercase font-bold mb-1">{label}</div>
    <div className={`text-sm font-bold truncate ${valueClassName || ''}`}>{value}</div>
  </div>
);

const SocialIcon = ({ icon, onClick, disabled }: { icon: React.ReactNode, onClick?: (e: React.MouseEvent) => void, disabled?: boolean }) => (
  <button
    className="p-2 bg-[#2b1200]/60 text-[#f6e7b5]/60 hover:text-[#f6e7b5] hover:bg-[#2b1200] rounded-lg transition-colors border border-[#c87414]/20 disabled:opacity-50 disabled:cursor-not-allowed"
    onClick={onClick}
    disabled={disabled}
  >
    {icon}
  </button>
);

export const TokenCard = React.memo(TokenCardComponent);
