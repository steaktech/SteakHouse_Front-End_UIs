"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Bookmark, Share2, Globe, Send, ExternalLink } from 'lucide-react';
import { useSaveToken } from '@/app/hooks/useSaveToken';
import { SharePopup } from '../Widgets/ChatWidget/SharePopup';

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
      <div className="lg:hidden bg-[#0a0612] px-3 py-3 border-b border-[#1f1a24]">
        <div className="flex items-start justify-between gap-2 relative">
          {/* Left Side: Token Info */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* First Row: Token Circle/Icon and Name + Symbol */}
            <div className="flex gap-3">
              {/* Token Initial Circle or Icon */}
              {tokenIconUrl ? (
                <img
                  src={tokenIconUrl}
                  alt={tokenName}
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#daa20b] to-[#8b5a2b] text-white font-bold text-xl">
                  {tokenName.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Token Name and Symbol Column */}
              <div className="flex flex-col gap-1 flex-1 min-w-0 justify-center">
                {/* Token Name */}
                <span className="text-white text-xl font-bold truncate leading-tight font-pump-display tracking-tight">
                  {tokenName}
                </span>

                {/* Token Symbol */}
                <div className="flex items-center gap-2">
                  {tokenSymbol && (
                    <span className="text-[#9ca3af] text-xs font-semibold uppercase tracking-[0.18em] font-degen">
                      / {tokenSymbol}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Second Row: Price Badge (aligned with circle) */}
            <div className="flex items-center justify-between gap-2">
              {currentPrice !== undefined && (
                <div className="px-3 py-1.5 rounded-md bg-[#1f1a24] border border-[#2d2838]">
                  <span className="text-white text-3xl font-semibold font-degen tabular-nums">
                    {renderFormattedPrice(currentPrice)}
                  </span>
                </div>
              )}
            </div>

            {/* Third Row: Social Icons (aligned with circle) */}
            <div className="flex items-center ">
              {/* Discord */}
              <a
                href="/coming-soon"
                className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                title="Discord"
              >
                <Image
                  src="/images/discord.png"
                  alt="Discord"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/steakhouse"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                title="Telegram"
              >
                <Image
                  src="/images/telegram.png"
                  alt="Telegram"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </a>

              {/* Twitter/X */}
              <a
                href="https://x.com/steak_tech"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                title="Twitter"
              >
                <Image
                  src="/images/twitter.png"
                  alt="Twitter"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/steaktech"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                title="GitHub"
              >
                <Image
                  src="/images/github-icon.png"
                  alt="GitHub"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </a>

              {/* Medium */}
              <a
                href="https://medium.com/@steakhousefinance"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                title="Medium"
              >
                <Image
                  src="/images/medium-icon.png"
                  alt="Medium"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </a>
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
                  className="p-1.5 rounded-md transition-all duration-200 hover:bg-[#1f1a24] hover:scale-110 active:scale-95"
                  title={link.label}
                  style={{
                    background: 'rgba(31, 26, 36, 0.5)',
                  }}
                >
                  <Icon size={16} style={{ color: link.color }} />
                </a>
              );
            })}

            {/* Divider */}
            {socialLinks.length > 0 && (
              <div className="w-px h-5 bg-[#1f1a24] mx-0.5"></div>
            )}

            {/* Audio Button (moved from TradingView header) */}
            {isAudioAvailable && onToggleAudio && (
              <button
                type="button"
                onClick={onToggleAudio}
                className="p-1.5 rounded-md transition-all duration-200 hover:bg-[#1f1a24] hover:scale-110 active:scale-95"
                style={{
                  background: 'rgba(31, 26, 36, 0.5)',
                }}
                title={isAudioPlaying ? 'Mute Audio' : 'Play Audio'}
              >
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#e9af5a"
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
              className="p-1.5 rounded-md transition-all duration-200 hover:bg-[#1f1a24] hover:scale-110 active:scale-95"
              style={{
                background: 'rgba(31, 26, 36, 0.5)',
              }}
              title={isSaved ? 'Saved' : 'Save token'}
            >
              <Bookmark
                size={16}
                className="text-[#e9af5a]"
                fill={isSaved ? 'currentColor' : 'none'}
              />
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShareClick}
              className="p-1.5 rounded-md transition-all duration-200 hover:bg-[#1f1a24] hover:scale-110 active:scale-95"
              style={{
                background: 'rgba(31, 26, 36, 0.5)',
              }}
              title="Share"
            >
              <Share2 size={16} className="text-[#e9af5a]" />
            </button>
          </div>

          {/* 24h Price Change Badge - Absolute Position Bottom Right */}
          <div className="absolute right-0 bottom-12 text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#9ca3af] font-degen mb-0.5">
              24h Change
            </div>
            <div
              className={`text-2xl font-semibold flex items-center justify-end gap-0.5 font-degen tabular-nums ${
                typeof priceChange24h === 'number'
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
        onShare={() => {}}
        shareData={shareData}
      />
    </>
  );
}
