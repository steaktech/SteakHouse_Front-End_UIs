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
  // Audio controls (now handled in MobileStats for mobile)
  // (Props kept for potential future desktop usage but currently unused)
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
  const headerFullscreenButtonCreatedRef = useRef(false);

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
    // Reset header fullscreen button flag when (re)creating widget
    headerFullscreenButtonCreatedRef.current = false;
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
        // Use our own fullscreen implementation instead of TradingView's built-in one
        enabled_features: [],
        disabled_features: [
          'use_localstorage_for_settings',
          'header_symbol_search',
          'symbol_search_hot_key',
          'header_symbol_edit',
          'header_compare',
          'symbol_search',
          'header_undo_redo',
          'timeframes_toolbar',
          'header_fullscreen_button',
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

        // Add a custom fullscreen button into the TradingView header that uses our in-app fullscreen
        try {
          const w: any = widgetRef.current;
          if (!w || headerFullscreenButtonCreatedRef.current || !w.headerReady || !w.createButton) return;

          w.headerReady().then(() => {
            if (cancelled) return;
            try {
              const button: HTMLElement | any = w.createButton({ align: 'right' }) || w.createButton();
              if (!button) return;
              button.setAttribute('title', 'Toggle fullscreen');
              // Use TradingView's tooltip styling if available
              if (button.classList) {
                button.classList.add('apply-common-tooltip');
              }
              // Simple fullscreen glyph; TradingView will style the button chrome
              button.innerHTML = '<span style="display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:14px;line-height:1;">⛶</span>';
              button.addEventListener('click', () => {
                toggleFullscreen();
              });
              headerFullscreenButtonCreatedRef.current = true;
            } catch (e) {
              console.warn('[TV] Failed to create custom fullscreen header button', e);
            }
          });
        } catch {}
      });
    })();

    return () => { cancelled = true; };
  }, [TV_SCRIPT_SRC, TV_LIBRARY_PATH, datafeed, address, toggleFullscreen]);

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
          {/* Top Toolbar (custom React header) - disabled in favor of TradingView's own header */}
          {false && (
            <div className="h-10 sm:h-11 lg:h-12 px-2 sm:px-3 flex items-center gap-2 bg-[#07040b] border-b border-[#1f1a24]">
              {/* ...custom header content removed... */}
            </div>
          )}
          
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
