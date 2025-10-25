"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import { makeTVDatafeed } from '@/app/lib/tradingview/datafeed';


interface TradingViewProps {
  title?: string;
  symbol?: string; // display symbol (e.g., SOL)
  address?: string; // token address for datafeed (0x...)
  timeframe?: string; // '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  onChangeTimeframe?: (tf: string) => void;
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

export const TradingView: React.FC<TradingViewProps> = ({ title, symbol, address, timeframe = '1m', onChangeTimeframe }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<any>(null);

  const TV_LIBRARY_PATH = useMemo(() => {
    const base = (typeof window !== 'undefined' && (window.__TV_BASE__ || '')) || '';
    return `${base}/charting_library/`;
  }, []);
  const TV_SCRIPT_SRC = useMemo(() => `${TV_LIBRARY_PATH}charting_library.standalone.js`, [TV_LIBRARY_PATH]);

  // Build TradingView datafeed from our API/WS
  const datafeed = useMemo(() => {
    const restBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_BASE_URL || '';
    const displayMeta = async (addr: string) => {
      // Prefer provided display props
      const display = symbol || title;
      if (display) return { symbol: display, name: display };
      // Fallback to short address
      const short = `${addr.slice(0, 6)}…${addr.slice(-4)}`;
      return { symbol: short, name: short };
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

  // Load script and create widget once
  useEffect(() => {
    let cancelled = false;
    if (!address) return;
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
        ],
        overrides: {
          'paneProperties.background': '#07040b',
          'paneProperties.backgroundType': 'solid',
          'paneProperties.vertGridProperties.color': '#1f2937',
          'paneProperties.horzGridProperties.color': '#1f2937',
          'scalesProperties.textColor': '#94a3b8',
          'scalesProperties.lineColor': '#374151',

          'mainSeriesProperties.candleStyle.upColor': '#29f266',
          'mainSeriesProperties.candleStyle.downColor': '#ff3b3b',
          'mainSeriesProperties.candleStyle.borderUpColor': '#29f266',
          'mainSeriesProperties.candleStyle.borderDownColor': '#ff3b3b',
          'mainSeriesProperties.candleStyle.wickUpColor': '#29f266',
          'mainSeriesProperties.candleStyle.wickDownColor': '#ff3b3b',
          'mainSeriesProperties.candleStyle.drawWick': true,
          'mainSeriesProperties.candleStyle.drawBorder': false,
        },
      });

      window.tvWidget = widgetRef.current;
      widgetRef.current.onChartReady(() => {
        if (cancelled) return;
      });
    })();

    return () => { cancelled = true; };
  }, [TV_SCRIPT_SRC, TV_LIBRARY_PATH, datafeed, address, timeframe]);

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

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="flex-grow flex flex-col h-full">
        {/* Top Toolbar */}
        <div className="h-10 sm:h-11 lg:h-12 px-2 sm:px-3 flex items-center gap-2 bg-[#07040b] border-b border-[#1f1a24]">
          <div className="flex items-center gap-2 sm:gap-3 pr-2 border-r border-[#1f1a24]">
            <div className="text-[#e5e7eb] font-semibold text-xs sm:text-sm">{title ?? 'Token'}</div>
            {symbol ? <div className="text-[#9ca3af] text-[10px] sm:text-xs">{symbol}</div> : null}
          </div>
          <div className="flex items-center gap-1 pr-2 border-r border-[#1f1a24]">
            {TF_OPTIONS.map((tf) => (
              <button
                key={tf.value}
                onClick={() => onChangeTimeframe?.(tf.value)}
                className={`px-2 py-1 rounded text-[10px] sm:text-xs font-medium transition-colors ${timeframe === tf.value ? 'bg-[#111215] text-[#feea88] border border-[#2b2b2b]' : 'text-[#c0c0c0] hover:bg-black/30'}`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart container */}
        <div className="relative min-h-0 h-full">
          <div
            ref={containerRef}
            className="absolute left-0 right-0 top-0"
            style={{ bottom: 'calc(var(--mobile-bottom-inset, 0px) + var(--mobile-recent-inset, 0px) + var(--chart-bottom-offset, 0px))', background: '#07040b', borderRadius: 8 }}
          />
        </div>
      </div>
    </div>
  );
};
