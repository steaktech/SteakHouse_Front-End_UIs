"use client";

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
    tvWidget: any;
  }
}

interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = 'BINANCE:BTCUSDT',
  interval = 'D',
  theme = 'light'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScriptLoaded = useRef(false);

  useEffect(() => {
    // Ensure the script is loaded only once
    if (isScriptLoaded.current || !containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;

    // Script onload callback
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined' && containerRef.current) {
        // Create the widget using the proper constructor
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: interval,
          timezone: "Etc/UTC",
          theme: theme,
          style: "1",
          locale: "en",
          hide_top_toolbar: false,
          save_image: true,
          // The widget will be rendered inside the div with this ID
          container_id: containerRef.current.id,
          studies: [
            "Volume@tv-basicstudies"
          ],
          studies_overrides: {
            "volume.volume.color.0": "#57f25d", // Color for down volume bar
            "volume.volume.color.1": "#ff0000",  // Color for up volume bar
            "volume.volume.transparency": "10%"
          },
          // Custom candle colors
          overrides: {
            "mainSeriesProperties.candleStyle.upColor": "#57f25d",
            "mainSeriesProperties.candleStyle.downColor": "#ff0000",
            "mainSeriesProperties.candleStyle.borderUpColor": "#57f25d",
            "mainSeriesProperties.candleStyle.borderDownColor": "#ff0000",
            "mainSeriesProperties.candleStyle.wickUpColor": "#57f25d",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ff0000",
          }
        });
      }
    };
    
    document.body.appendChild(script);
    isScriptLoaded.current = true;

    // Cleanup on component unmount
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval, theme]);

  return (
    <div 
      ref={containerRef} 
      id="tradingview_chart_container"
      className="h-full w-full"
    />
  );
}; 