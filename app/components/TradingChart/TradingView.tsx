"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { makeTVDatafeed } from '@/app/lib/tradingview/datafeed';
import { SharePopup } from '@/app/components/Widgets/ChatWidget/SharePopup';
import { useSaveToken } from '@/app/hooks/useSaveToken';
import { useWallet } from '@/app/hooks/useWallet';
import { useToastHelpers } from '@/app/hooks/useToast';

interface TradingViewProps {
  title?: string;
  symbol?: string; // display symbol (e.g., SOL)
  address?: string; // token address for datafeed (0x...)
  timeframe?: string; // '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  onChangeTimeframe?: (tf: string) => void;
  tokenIconUrl?: string;
  // Socials
  telegramUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  // Audio controls
  isAudioPlaying?: boolean;
  isAudioAvailable?: boolean;
  onToggleAudio?: () => void;
}

const TF_OPTIONS: { label: string; value: string; resolution: string }[] = [
  { label: '1m', value: '1m', resolution: '1' },
  { label: '5m', value: '5m', resolution: '5' },
  { label: '15m', value: '15m', resolution: '15' },
  { label: '1h', value: '1h', resolution: '60' },
  { label: '4h', value: '4h', resolution: '240' },
  { label: '1D', value: '1d', resolution: '1440' },
];

function tfToResolution(tf: string): string {
  return TF_OPTIONS.find(t => t.value === tf)?.resolution ?? '1';
}

export const TradingView: React.FC<TradingViewProps> = ({ 
  title, 
  symbol, 
  address, 
  timeframe = '1m', 
  onChangeTimeframe, 
  tokenIconUrl, 
  telegramUrl, 
  twitterUrl, 
  websiteUrl,
  isAudioPlaying,
  isAudioAvailable,
  onToggleAudio
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<any>(null);
  const prevDatafeedRef = useRef<any>(null);
  const chartWrapperRef = useRef<HTMLDivElement | null>(null);

  // Wallet + toast
  const { isConnected } = useWallet();
  const { showError, showSuccess } = useToastHelpers();
  const [saveClicked, setSaveClicked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const TV_LIBRARY_PATH = useMemo(() => {
    const base = (typeof window !== 'undefined' && (window.__TV_BASE__ || '')) || '';
    return `${base}/charting_library/`;
  }, []);
  const TV_SCRIPT_SRC = useMemo(() => `${TV_LIBRARY_PATH}charting_library.standalone.js`, [TV_LIBRARY_PATH]);

  const [showSharePopup, setShowSharePopup] = useState(false);

  const shareData = useMemo(() => ({
    title: `${(title || symbol || 'Token')}${symbol ? ` (${symbol})` : ''}`,
    text: `Check out ${(title || symbol || 'this token')}${symbol ? ` (${symbol})` : ''} on SteakHouse Trading`,
    url: typeof window !== 'undefined' && address ? `${window.location.origin}/trading-chart/${address}` : (typeof window !== 'undefined' ? window.location.href : '')
  }), [title, symbol, address]);

  const sanitizeUrl = useCallback((u?: string | null) => {
    if (!u) return undefined;
    const s = String(u).trim();
    if (!s) return undefined;
    if (/^https?:\/\//i.test(s)) return s;
    return `https://${s.replace(/^\/+/, '')}`;
  }, []);

  const handleShareClick = useCallback(async () => {
    try {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
      if (isMobile && typeof navigator !== 'undefined' && 'share' in navigator) {
        await (navigator as any).share(shareData);
      } else {
        setShowSharePopup(true);
      }
    } catch (err) {
      setShowSharePopup(true);
    }
  }, [shareData]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when chart is fullscreen
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

// Build TradingView datafeed from our API/WS
  const { isSaved, isLoading: isSaveLoading, toggleSave, error: saveError, clearError } = useSaveToken((address || '').toLowerCase(), false);

  const datafeed = useMemo(() => {
    const restBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_BASE_URL || '';
    const displayMeta = async (addr: string) => {
      // Prefer token symbol for symbol field, token name for name field
      const short = `${addr.slice(0, 6)}…${addr.slice(-4)}`;
      const metaSymbol = (symbol ?? title) ?? short; // e.g. "SPACE"
      const metaName = (title ?? symbol) ?? short;   // e.g. "Spaceman"
      return { symbol: metaSymbol, name: metaName };
    };
    return makeTVDatafeed({
      restBaseUrl,
      socketUrl,
      timezone: 'Etc/UTC',
      session: '24x7',
      priceScale: 1e8,
      debug: true,
      metaResolver: displayMeta,
    });
  }, [symbol, title]);

  // Load script and create widget; recreate if datafeed (meta) changes so name updates
  useEffect(() => {
    let cancelled = false;
    if (!address) return;

    // If widget exists but datafeed reference changed (e.g. token name/symbol loaded), rebuild
    if (widgetRef.current && prevDatafeedRef.current && prevDatafeedRef.current !== datafeed) {
      try { widgetRef.current.remove?.(); } catch {}
      widgetRef.current = null;
      try { if (containerRef.current) containerRef.current.innerHTML = ''; } catch {}
    }
    prevDatafeedRef.current = datafeed;

    if (widgetRef.current || !containerRef.current) return;

    const loadTV = async (src: string) => {
      if (window.TradingView?.widget) return true;
      const s = document.createElement('script');
      s.src = src; s.async = true;
      const ok: boolean = await new Promise((res) => {
        s.onload = () => res(true);
        s.onerror = () => res(false);
        document.head.appendChild(s);
      });
      return ok && !!window.TradingView?.widget;
    };

    (async () => {
      const ok = await loadTV(TV_SCRIPT_SRC);
      if (!ok || cancelled) return;

      const el = containerRef.current!;
      const resolution = tfToResolution(timeframe);

      widgetRef.current = new window.TradingView.widget({
        library_path: TV_LIBRARY_PATH,
        container: el,
        autosize: true,
        symbol: address,
        interval: resolution,
        datafeed,
        timezone: 'Etc/UTC',
        theme: 'Dark',
        locale: 'en',
        fullscreen: false,
        autosize: true,
        enabled_features: ['header_fullscreen_button'],
        disabled_features: [
          'use_localstorage_for_settings',
          'header_symbol_search',
          'symbol_search_hot_key',
          'header_symbol_edit',
          'header_compare',
          'symbol_search',
          'header_undo_redo',
          'timeframes_toolbar',
        ],
        overrides: {
          'paneProperties.background': '#07040b',
          'paneProperties.backgroundType': 'solid',
          'paneProperties.vertGridProperties.color': '#1f2937',
          'paneProperties.horzGridProperties.color': '#1f2937',
          'scalesProperties.textColor': '#94a3b8',
'scalesProperties.lineColor': '#374151',

          // Improve readability and margins
          'paneProperties.topMargin': 15,
          'paneProperties.bottomMargin': 10,
          'paneProperties.crossHairProperties.color': '#9ca3af',
          'paneProperties.legendProperties.showLegend': true,
          'paneProperties.legendProperties.showSeriesTitle': true,
          'paneProperties.legendProperties.showSeriesOHLC': true,

          // Scales & last value marker
          'scalesProperties.showSeriesLastValue': true,

          // Candles - match TradePanel BUY/SELL palette and standard wick/border visibility
          'mainSeriesProperties.candleStyle.upColor': '#4ade80',
          'mainSeriesProperties.candleStyle.downColor': '#f87171',
          'mainSeriesProperties.candleStyle.borderUpColor': '#22c55e',
          'mainSeriesProperties.candleStyle.borderDownColor': '#ef4444',
          'mainSeriesProperties.candleStyle.wickUpColor': '#22c55e',
          'mainSeriesProperties.candleStyle.wickDownColor': '#ef4444',
          'mainSeriesProperties.candleStyle.drawWick': true,
          'mainSeriesProperties.candleStyle.drawBorder': true,
          'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false,

          // Price line marker
          'mainSeriesProperties.priceLineVisible': true,
          'mainSeriesProperties.priceLineColor': '#feea88',
          'mainSeriesProperties.priceLineWidth': 1,

          // Bars/hollow/Heikin-Ashi styles (if switched)
          'mainSeriesProperties.barStyle.upColor': '#4ade80',
          'mainSeriesProperties.barStyle.downColor': '#f87171',
          'mainSeriesProperties.hollowCandleStyle.upColor': '#4ade80',
          'mainSeriesProperties.hollowCandleStyle.downColor': '#f87171',
          'mainSeriesProperties.hollowCandleStyle.borderUpColor': '#22c55e',
          'mainSeriesProperties.hollowCandleStyle.borderDownColor': '#ef4444',
          'mainSeriesProperties.hollowCandleStyle.wickUpColor': '#22c55e',
          'mainSeriesProperties.hollowCandleStyle.wickDownColor': '#ef4444',
          'mainSeriesProperties.haStyle.upColor': '#4ade80',
          'mainSeriesProperties.haStyle.downColor': '#f87171',
          'mainSeriesProperties.haStyle.borderUpColor': '#22c55e',
          'mainSeriesProperties.haStyle.borderDownColor': '#ef4444',
          'mainSeriesProperties.haStyle.wickUpColor': '#22c55e',
          'mainSeriesProperties.haStyle.wickDownColor': '#ef4444',
        },
        studies_overrides: {
'volume.volume.color.0': '#f87171',
          'volume.volume.color.1': '#4ade80',
          'volume.volume.transparency': 30,
          'volume.show ma': false,
        },
      });

      window.tvWidget = widgetRef.current;
      widgetRef.current.onChartReady(() => {
        if (cancelled) return;
        try {
          const chart = widgetRef.current.activeChart();
          // Ensure a Volume study exists (separate pane)
          const studies = (chart.getAllStudies?.() ?? []) as any[];
          const hasVolume = Array.isArray(studies) && studies.some((s: any) => {
            const n = (s?.name || s?.title || s?.shortTitle || '').toString();
            return /(^|@)Volume(\b|@)/i.test(n);
          });
          if (!hasVolume) {
            try { chart.createStudy?.('Volume@tv-basicstudies', false, false); }
            catch { try { chart.createStudy?.('Volume', false, false); } catch {}
            }
          }
        } catch {}
      });
    })();

    return () => { cancelled = true; };
  }, [TV_SCRIPT_SRC, TV_LIBRARY_PATH, datafeed, address]);

  // Respond to timeframe changes
  useEffect(() => {
    const w = widgetRef.current;
    if (!w) return;
    const res = tfToResolution(timeframe);
    w.onChartReady(() => {
      try { w.activeChart().setResolution(res); } catch {}
    });
  }, [timeframe]);

  // Respond to address change
  useEffect(() => {
    const w = widgetRef.current;
    if (!w || !address) return;
    w.onChartReady(() => {
      try { w.activeChart().setSymbol(address, tfToResolution(timeframe)); } catch {}
    });
  }, [address, timeframe]);

  // Surface save errors via toast
  useEffect(() => {
    if (saveError) {
      showError(saveError, 'Save token');
      clearError();
      setSaveClicked(false);
    }
  }, [saveError, showError, clearError]);

  // Success toast after state changes due to our click
  const prevSavedRef = useRef(isSaved);
  useEffect(() => {
    if (saveClicked && prevSavedRef.current !== isSaved) {
      showSuccess(isSaved ? 'Saved token' : 'Removed from saved');
      setSaveClicked(false);
    }
    prevSavedRef.current = isSaved;
  }, [isSaved, saveClicked, showSuccess]);

  return (
    <>
      <div 
        ref={chartWrapperRef} 
        className="w-full h-full overflow-hidden" 
        style={isFullscreen ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: '#07040b'
        } : {}}
      >
        <div className="flex-grow flex flex-col h-full">
          {/* Top Toolbar */}
          <div className="h-10 sm:h-11 lg:h-12 px-2 sm:px-3 flex items-center gap-2 bg-[#07040b] border-b border-[#1f1a24]">
            <div className="flex items-center gap-2 sm:gap-3 pr-2 border-r border-[#1f1a24]">
              {tokenIconUrl ? <img src={tokenIconUrl} alt="" className="w-5 h-5 rounded-full" /> : null}
              <div className="text-[#e5e7eb] font-semibold text-xs sm:text-sm">{title ?? 'Token'}</div>
              {symbol ? <div className="text-[#9ca3af] text-[10px] sm:text-xs">{symbol}</div> : null}
            </div>
            <div className="flex items-center gap-2 pl-2">
              {/* Primary actions: Save + Share */}
              <div className="flex items-center gap-2 pr-2 border-r border-[#1f1a24]">
                {/* Audio control */}
                <button
                  type="button"
                  title={isAudioPlaying ? "Mute Audio" : "Unmute Audio"}
                  onClick={onToggleAudio}
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))',
                    border: '1px solid #8b5a2b',
                    color: isAudioPlaying ? '#ffdd00' : '#ffc24b',
                    padding: '6px 8px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    display: isAudioAvailable ? 'block' : 'none'
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.24), rgba(255, 178, 32, 0.16))'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))'; }}
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
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
                {/* Save token */}
                <button
                  type="button"
                  title={isSaved ? 'Remove from saved' : 'Save token'}
                  onClick={async () => {
                    if (isSaveLoading) return;
                    if (!isConnected) {
                      showError('Please connect your wallet to save tokens', 'Save token');
                      return;
                    }
                    setSaveClicked(true);
                    await toggleSave();
                  }}
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))',
                    border: '1px solid #8b5a2b',
                    color: isSaved ? '#ffdd00' : '#ffc24b',
                    padding: '6px 8px',
                    borderRadius: 10,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.24), rgba(255, 178, 32, 0.16))'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))'; }}
                  disabled={isSaveLoading}
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21 12 17.77 5.82 21 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
                {/* Share */}
                <button
                  type="button"
                  title="Share"
                  onClick={handleShareClick}
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))',
                    border: '1px solid #8b5a2b',
                    color: '#ffc24b',
                    padding: '6px 8px',
                    borderRadius: 10,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.24), rgba(255, 178, 32, 0.16))'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))'; }}
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                    <path d="M496 272l-144 144c-15 15-41 4.5-41-17v-80C150 321 40 401 40 464c0-159.1 141.6-264.8 271-271.7v-80c0-21.5 26-32.1 41-17l144 144c9.4 9.4 9.4 24.6 0 34z" />
                  </svg>
                </button>
              </div>

              {/* Fullscreen + Socials */}
              <div className="flex items-center gap-2 pl-2 pr-2 border-r border-[#1f1a24]">
                <button
                  type="button"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  onClick={toggleFullscreen}
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))',
                    border: '1px solid #8b5a2b',
                    color: '#ffc24b',
                    padding: '6px 8px',
                    borderRadius: 10,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.24), rgba(255, 178, 32, 0.16))'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))'; }}
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                    {isFullscreen ? (
                      <>
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                      </>
                    ) : (
                      <>
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 pl-2">
                <button
                  type="button"
                  title={telegramUrl ? 'Telegram' : 'Telegram (not provided)'}
                  onClick={() => {
                    const url = sanitizeUrl(telegramUrl);
                    if (url) window.open(url, '_blank'); else setShowSharePopup(true);
                  }}
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))',
                    border: '1px solid #8b5a2b',
                    color: '#ffc24b',
                    padding: '6px 8px',
                    borderRadius: 10,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.24), rgba(255, 178, 32, 0.16))'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))'; }}
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
                    <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001l-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15l4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
                  </svg>
                </button>
                <button
                  type="button"
                  title={twitterUrl ? 'X (Twitter)' : 'X (not provided)'}
                  onClick={() => {
                    const url = sanitizeUrl(twitterUrl);
                    if (url) window.open(url, '_blank'); else setShowSharePopup(true);
                  }}
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))',
                    border: '1px solid #8b5a2b',
                    color: '#ffc24b',
                    padding: '6px 8px',
                    borderRadius: 10,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.24), rgba(255, 178, 32, 0.16))'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))'; }}
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
                <button
                  type="button"
                  title={websiteUrl ? 'Website' : 'Website (not provided)'}
                  onClick={() => {
                    const url = sanitizeUrl(websiteUrl);
                    if (url) window.open(url, '_blank'); else setShowSharePopup(true);
                  }}
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))',
                    border: '1px solid #8b5a2b',
                    color: '#ffc24b',
                    padding: '6px 8px',
                    borderRadius: 10,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.24), rgba(255, 178, 32, 0.16))'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(180deg, rgba(255, 178, 32, 0.14), rgba(255, 178, 32, 0.06))'; }}
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Chart container */}
          <div className="relative min-h-0 h-full">
            <div
              ref={containerRef}
              className="absolute inset-0"
              style={{ background: '#07040b', borderRadius: 8 }}
            />
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
};
