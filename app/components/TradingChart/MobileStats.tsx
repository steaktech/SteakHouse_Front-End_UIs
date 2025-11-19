"use client";

import React, { useState, useCallback } from 'react';
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
                <span className="text-white font-bold text-lg truncate leading-tight">
                  {tokenName}
                </span>

                {/* Token Symbol */}
                <div className="flex items-center gap-2">
                  {tokenSymbol && (
                    <span className="text-[#6b7280] text-sm font-medium">
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
                  <span className="text-white text-xl font-bold">
                    $ {currentPrice.toFixed(6)}
                  </span>
                </div>
              )}
            </div>

            {/* Third Row: Social Icons (aligned with circle) */}
            <div className="flex items-center gap-2">
              {/* Website */}
              {websiteUrl && (
                <a
                  href={sanitizeUrl(websiteUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-[#1f1a24] hover:scale-110 active:scale-95"
                  style={{ background: 'rgba(31, 26, 36, 0.5)' }}
                  title="Website"
                >
                  <Globe size={18} className="text-[#9ca3af]" />
                </a>
              )}

              {/* Discord */}
              <a
                href="/coming-soon"
                className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-[#1f1a24] hover:scale-110 active:scale-95"
                style={{ background: 'rgba(31, 26, 36, 0.5)' }}
                title="Discord"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#5865F2]">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/steakhouse"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-[#1f1a24] hover:scale-110 active:scale-95"
                style={{ background: 'rgba(31, 26, 36, 0.5)' }}
                title="Telegram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#0088cc]">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19c-.14.75-.42 1-.68 1.03c-.58.05-1.02-.38-1.58-.75c-.88-.58-1.38-.94-2.23-1.5c-.99-.65-.35-1.01.22-1.59c.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02c-.09.02-1.49.95-4.22 2.79c-.4.27-.76.41-1.08.4c-.36-.01-1.04-.2-1.55-.37c-.63-.2-1.12-.31-1.08-.66c.02-.18.27-.36.74-.55c2.92-1.27 4.86-2.11 5.83-2.51c2.78-1.16 3.35-1.36 3.73-1.36c.08 0 .27.02.39.12c.1.08.13.19.14.27c-.01.06.01.24 0 .38z"/>
                </svg>
              </a>

              {/* Twitter/X */}
              <a
                href="https://x.com/steak_tech"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-[#1f1a24] hover:scale-110 active:scale-95"
                style={{ background: 'rgba(31, 26, 36, 0.5)' }}
                title="Twitter"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#1da1f2]">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/steaktech"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-[#1f1a24] hover:scale-110 active:scale-95"
                style={{ background: 'rgba(31, 26, 36, 0.5)' }}
                title="GitHub"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#9ca3af]">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </a>

              {/* Medium */}
              <a
                href="https://medium.com/@steakhousefinance"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-[#1f1a24] hover:scale-110 active:scale-95"
                style={{ background: 'rgba(31, 26, 36, 0.5)' }}
                title="Medium"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#9ca3af]">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right Side: Social Icons and Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Social Links */}
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
                className={isSaved ? 'text-[#ffd700]' : 'text-[#9ca3af]'}
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
              <Share2 size={16} className="text-[#9ca3af]" />
            </button>
          </div>

          {/* 24h Price Change Badge - Absolute Position Bottom Right */}
          <div className="absolute bottom-0 right-0">
            <span
              className={`text-4xl font-bold flex items-center gap-0.5 ${
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
              {typeof priceChange24h === 'number' ? Math.abs(priceChange24h).toFixed(2) : '0.00'}% 24h
            </span>
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
