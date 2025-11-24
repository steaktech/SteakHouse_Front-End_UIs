"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Bookmark, Share2, Globe, Send, ExternalLink } from 'lucide-react';
import { useSaveToken } from '@/app/hooks/useSaveToken';
import { SharePopup } from '../Widgets/ChatWidget/SharePopup';
import { useTheme } from '@/app/contexts/ThemeContext';

interface MobileStatsProps {
  tokenAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  marketCap?: string;
  priceChange24h?: number;
  currentPrice?: number;
  tokenIconUrl?: string;
  telegramUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  // Audio controls (moved from TradingView header)
  isAudioPlaying?: boolean;
  isAudioAvailable?: boolean;
  onToggleAudio?: () => void;
}

// SVG paths for the requested brand icons
const ICONS = {
  discord: (
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
  ),
  telegram: (
    <path d="M22.2646 1.99384C22.5431 1.85525 22.8694 1.90093 23.0968 2.11033C23.3242 2.31973 23.3934 2.64301 23.2733 2.93395L19.2208 19.4339C19.0237 20.2357 18.0552 20.588 17.3639 20.0844L11.9327 16.1298L9.30046 19.1563C9.04546 19.4496 8.60952 19.5256 8.26668 19.337C7.92384 19.1484 7.76728 18.7472 7.89498 18.3836L9.4759 13.8829L3.47292 9.51234C2.82848 9.04322 2.87694 8.04835 3.56007 7.64216L22.2646 1.99384ZM11.3651 13.377L17.8962 6.4469L10.8843 12.2628L10.4263 13.5664L11.3651 13.377Z" />
  ),
  x: (
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  ),
  github: (
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  ),
  medium: (
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
  )
};

const SocialButton = ({ icon, href, label, isLight }: { icon: React.ReactNode, href: string, label: string, isLight: boolean }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group relative flex items-center justify-center"
    >
      {/* Glow Effect (Behind) */}
      <div className="absolute inset-0 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: isLight ? 'rgba(120, 53, 15, 0.2)' : 'rgba(254, 234, 136, 0.2)' }} />

      {/* Main Container */}
      <div className="
        relative
        w-7 h-7
        flex items-center justify-center 
        rounded-md
        border
        transition-all duration-300 ease-out
        group-hover:-translate-y-0.5
      " style={{
          background: isLight 
            ? 'linear-gradient(180deg, #fdfbf7, #f3eadd)' 
            : 'linear-gradient(180deg, rgba(255, 224, 185, 0.15), rgba(60, 32, 18, 0.25))',
          borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.3)',
          color: isLight ? '#2b1608' : '#feea88',
          boxShadow: isLight ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
        }}>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3 h-3 transition-transform duration-300 group-hover:scale-110"
        >
          {icon}
        </svg>
      </div>
    </a>
  );
};

export default function MobileStats({
  tokenAddress,
  tokenName = 'Token',
  tokenSymbol,
  marketCap,
  priceChange24h,
  currentPrice,
  tokenIconUrl,
  telegramUrl,
  twitterUrl,
  websiteUrl,
  isAudioPlaying,
  isAudioAvailable,
  onToggleAudio,
}: MobileStatsProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [showSharePopup, setShowSharePopup] = useState(false);
  const { isSaved, isLoading: isSaveLoading, toggleSave } = useSaveToken(
    tokenAddress.toLowerCase(),
    false
  );

  const shareData = {
    title: `${tokenName}${tokenSymbol ? ` (${tokenSymbol})` : ''}`,
    text: `Check out ${tokenName}${tokenSymbol ? ` (${tokenSymbol})` : ''} on SteakHouse Trading`,
    url: typeof window !== 'undefined' && tokenAddress
      ? `${window.location.origin}/trading-chart/${tokenAddress}`
      : typeof window !== 'undefined'
        ? window.location.href
        : '',
  };

  const sanitizeUrl = useCallback((url?: string | null) => {
    if (!url) return undefined;
    const sanitized = String(url).trim();
    if (!sanitized) return undefined;
    if (/^https?:\/\//i.test(sanitized)) return sanitized;
    return `https://${sanitized.replace(/^\/+/, '')}`;
  }, []);

  const handleShareClick = useCallback(async () => {
    try {
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(userAgent);
      if (
        isMobileDevice &&
        typeof navigator !== 'undefined' &&
        'share' in navigator
      ) {
        await (navigator as any).share(shareData);
      } else {
        setShowSharePopup(true);
      }
    } catch (err) {
      setShowSharePopup(true);
    }
  }, [shareData]);

  const handleSaveClick = async () => {
    await toggleSave();
  };

  // DEXTools-style price formatting (e.g. $0.0₅3957 for very small prices)
  const renderFormattedPrice = (price?: number) => {
    if (price == null || isNaN(price)) {
      return '$ -';
    }
    if (price === 0) {
      return '$ 0.00';
    }

    // For normal prices, just show up to 6 decimals
    if (price >= 0.0001) {
      const formatted = price < 1
        ? price.toFixed(6)
        : price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        });
      return `$ ${formatted}`;
    }

    // Very small price -> 0.0ₙXXXX format
    const raw = price.toFixed(18); // ensure enough precision
    const parts = raw.split('.');
    const decimals = parts[1] ?? '';

    let zeros = 0;
    while (zeros < decimals.length && decimals[zeros] === '0') {
      zeros++;
    }

    const significant = (decimals.slice(zeros, zeros + 4) || '0').replace(/^0+$/, '0');

    const subscriptMap: Record<string, string> = {
      '0': '₀',
      '1': '₁',
      '2': '₂',
      '3': '₃',
      '4': '₄',
      '5': '₅',
      '6': '₆',
      '7': '₇',
      '8': '₈',
      '9': '₉',
    };
    const zerosSub = String(zeros)
      .split('')
      .map((d) => subscriptMap[d] ?? d)
      .join('');

    return (
      <>
        $ 0.0
        <span className="text-[23px] font-code italic font-semibold align-baseline inline-block leading-none translate-y-[-3px]">
          {zerosSub}
        </span>
        {significant}
      </>
    );
  };

  const socialLinks: any[] = [];

  return (
    <>
      <div className="px-3 py-3 border-b" style={{
        background: isLight
          ? 'var(--theme-grad-card)'
          : 'linear-gradient(180deg, #1A0F08, #1A0F08 10%, #1A0F08 58%, #241207 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
        borderColor: isLight ? '#c9a875' : 'rgba(255, 215, 165, 0.2)'
      }}>
        <div className="flex items-start justify-between gap-2 relative">
          {/* Left Side: Token Info */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* First Row: Token Circle/Icon and Name + Symbol */}
            <div className="flex gap-3">
              {/* Token Initial Circle or Icon */}
              {tokenIconUrl ? (
                <Image
                  src={tokenIconUrl}
                  alt={tokenName}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#daa20b] to-[#8b5a2b] text-white font-bold text-xl">
                  {tokenName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Token Name and Symbol Column */}
              <div className="flex flex-col gap-1 flex-1 min-w-0 justify-center">
                {/* Token Name */}
                <span className="text-xl font-bold truncate leading-tight font-pump-display tracking-tight" style={{ color: isLight ? '#2b1608' : '#feea88' }}>
                  {tokenName}
                </span>

                {/* Token Symbol */}
                <div className="flex items-center gap-2">
                  {tokenSymbol && (
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] font-degen" style={{ color: isLight ? '#b45309' : '#fff7ea', opacity: 0.8 }}>
                      / {tokenSymbol}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Second Row: Price Badge (aligned with circle) */}
            <div className="flex items-center justify-between gap-2">
              {currentPrice !== undefined && (
                <div className="px-3 py-1.5 rounded-md border" style={{
                  background: isLight
                    ? 'linear-gradient(180deg, #ffffff, #fdfbf7)'
                    : 'linear-gradient(180deg, rgba(255, 224, 185, 0.08), rgba(60, 32, 18, 0.15))',
                  borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.25)',
                  boxShadow: isLight ? '0 1px 2px rgba(0,0,0,0.05)' : 'inset 0 1px 0 rgba(255, 255, 255, 0.06)'
                }}>
                  <span className="text-3xl font-semibold font-degen tabular-nums" style={{ color: isLight ? '#2b1608' : '#fff7ea' }}>
                    {renderFormattedPrice(currentPrice)}
                  </span>
                </div>
              )}
            </div>

            {/* Third Row: Social Icons (aligned with circle) */}
            <div className="flex items-center gap-3 mt-1">
              <SocialButton
                icon={ICONS.discord}
                label="Discord"
                href="/coming-soon"
                isLight={isLight}
              />
              <SocialButton
                icon={ICONS.telegram}
                label="Telegram"
                href={telegramUrl || "https://t.me/steakhouse"}
                isLight={isLight}
              />
              <SocialButton
                icon={ICONS.x}
                label="X (Twitter)"
                href={twitterUrl || "https://x.com/steak_tech"}
                isLight={isLight}
              />
              <SocialButton
                icon={ICONS.github}
                label="GitHub"
                href="https://github.com/steaktech"
                isLight={isLight}
              />
              <SocialButton
                icon={ICONS.medium}
                label="Medium"
                href="https://medium.com/@steakhousefinance"
                isLight={isLight}
              />
            </div>
          </div>

          {/* Right Side: Social Icons and Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Social Links (currently unused) */}
            {socialLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md transition-all duration-200 hover:scale-110 active:scale-95"
                  title={link.label}
                  style={{
                    background: isLight
                      ? 'linear-gradient(180deg, #fdfbf7, #f3eadd)'
                      : 'linear-gradient(180deg, rgba(255, 224, 185, 0.15), rgba(60, 32, 18, 0.25))',
                    borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.3)'
                  }}
                >
                  <Icon size={16} style={{ color: link.color }} />
                </a>
              );
            })}

            {/* Divider */}
            {socialLinks.length > 0 && (
              <div className="w-px h-5 mx-0.5" style={{ background: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.3)' }}></div>
            )}

            {/* Audio Button (moved from TradingView header) */}
            {isAudioAvailable && onToggleAudio && (
              <button
                type="button"
                onClick={onToggleAudio}
                className="p-1.5 rounded-md border transition-all duration-200 hover:scale-110 active:scale-95"
                style={{
                  background: isLight
                    ? 'linear-gradient(180deg, #fdfbf7, #f3eadd)'
                    : 'linear-gradient(180deg, rgba(255, 224, 185, 0.15), rgba(60, 32, 18, 0.25))',
                  borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.3)'
                }}
                title={isAudioPlaying ? 'Mute Audio' : 'Play Audio'}
              >
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isLight ? '#2b1608' : '#feea88'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: 'block' }}
                >
                  {isAudioPlaying ? (
                    <>
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </>
                  ) : (
                    <>
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </>
                  )}
                </svg>
              </button>
            )}

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={isSaveLoading}
              className="p-1.5 rounded-md border transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: isLight
                  ? 'linear-gradient(180deg, #fdfbf7, #f3eadd)'
                  : 'linear-gradient(180deg, rgba(255, 224, 185, 0.15), rgba(60, 32, 18, 0.25))',
                borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.3)'
              }}
              title={isSaved ? 'Saved' : 'Save token'}
            >
              <Bookmark
                size={16}
                style={{ color: isLight ? '#2b1608' : '#feea88' }}
                fill={isSaved ? 'currentColor' : 'none'}
              />
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShareClick}
              className="p-1.5 rounded-md border transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                background: isLight
                  ? 'linear-gradient(180deg, #fdfbf7, #f3eadd)'
                  : 'linear-gradient(180deg, rgba(255, 224, 185, 0.15), rgba(60, 32, 18, 0.25))',
                borderColor: isLight ? '#c9a875' : 'rgba(255, 210, 160, 0.3)'
              }}
              title="Share"
            >
              <Share2 size={16} style={{ color: isLight ? '#2b1608' : '#feea88' }} />
            </button>
          </div>

          {/* 24h Price Change Badge - Absolute Position Bottom Right */}
          <div className="absolute right-0 bottom-12 text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] font-degen -mb-0.5" style={{ color: isLight ? '#b45309' : '#9ca3af' }}>
              24h Change
            </div>
            <div
              className={`text-2xl font-semibold flex items-center justify-end gap-0.5 font-degen tabular-nums ${typeof priceChange24h === 'number'
                ? priceChange24h > 0
                  ? 'text-[#10b981]'
                  : priceChange24h < 0
                    ? 'text-[#ef4444]'
                    : 'text-[#9ca3af]'
                : 'text-[#9ca3af]'
                }`}
            >
              {typeof priceChange24h === 'number' && priceChange24h > 0 ? '+' : ''}
              {typeof priceChange24h === 'number' && priceChange24h < 0 ? '-' : ''}
              {typeof priceChange24h === 'number'
                ? Math.abs(priceChange24h).toFixed(2)
                : '0.00'}
              <span className="text-sm font-normal opacity-80 ml-0.5">%</span>
            </div>
          </div>
        </div>
      </div>

      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        onShare={() => { }}
        shareData={shareData}
      />
    </>
  );
}
