"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import { makeTVDatafeed } from '@/app/lib/tradingview/datafeed';

// Minimal TradingView Charting Library container; kept in this file to preserve import paths.


export interface TVCandleChartProps {
  address: string; // 0x-address to chart
  timeframe?: string; // '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
}

export const CandleChart: React.FC<TVCandleChartProps> = ({ address, timeframe = '1m' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<any>(null);

  const TV_LIBRARY_PATH = useMemo(() => {
    const base = (typeof window !== 'undefined' && (window.__TV_BASE__ || '')) || '';
    return `${base}/charting_library/`;
  }, []);
  const TV_SCRIPT_SRC = useMemo(() => `${TV_LIBRARY_PATH}charting_library.standalone.js`, [TV_LIBRARY_PATH]);

  const datafeed = useMemo(() => {
    const restBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_BASE_URL || '';
    return makeTVDatafeed({ restBaseUrl, socketUrl, timezone: 'Etc/UTC', session: '24x7', priceScale: 1e8, debug: true });
  }, []);

  function tfToResolution(tf: string): string {
    switch (tf) {
      case '5m': return '5';
      case '15m': return '15';
      case '1h': return '60';
      case '4h': return '240';
      case '1d': return '1440';
      default: return '1';
    }
  }

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
    })();

    return () => { cancelled = true; };
  }, [TV_SCRIPT_SRC, TV_LIBRARY_PATH, datafeed, address, timeframe]);

  return (
    <div className="w-full h-full min-h-[145px] relative">
      <div
        ref={containerRef}
        className="absolute left-0 right-0 top-0"
        style={{ bottom: 'calc(var(--mobile-bottom-inset, 0px) + var(--mobile-recent-inset, 0px) + var(--chart-bottom-offset, 0px))', background: '#07040b', borderRadius: 8 }}
      />
    </div>
  );
};
