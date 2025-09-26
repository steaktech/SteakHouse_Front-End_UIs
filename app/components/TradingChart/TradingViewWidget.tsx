"use client";

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = 'BINANCE:SOLUSD',
  interval = '1',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Ensure the container is ready and the widget isn't already created
    if (!containerRef.current || widgetRef.current) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView === 'undefined' || !containerRef.current) return;

      const widgetOptions = {
        autosize: true,
        symbol: symbol,
        interval: interval,
        theme: "dark",
        style: "1",
        hide_top_toolbar: false,
        backgroundColor: "#07040b",
        hide_side_toolbar: true,
        gridColor: "rgba(2, 2, 2, 0.06)",
        container_id: "tradingview_chart_container", // Must match the container's id
        overrides: {
          "mainSeriesProperties.candleStyle.upColor": "#29f266",
          "mainSeriesProperties.candleStyle.downColor": "#ff3b3b",
          "mainSeriesProperties.candleStyle.borderUpColor": "#29f266",
          "mainSeriesProperties.candleStyle.borderDownColor": "#ff3b3b",
          "mainSeriesProperties.candleStyle.wickUpColor": "#29f266",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ff3b3b",
        },
        studies_overrides: {
            "volume.volume.color.0": "#ff3b3b",
            "volume.volume.color.1": "#29f266",
            "volume.volume.transparency": 80,
        },
      };

      try {
        const tvWidget = new window.TradingView.widget(widgetOptions);
        widgetRef.current = tvWidget;
      } catch (error) {
        console.error('Error creating TradingView widget:', error);
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load TradingView script');
    };
    
    document.head.appendChild(script);

    // Cleanup function to remove widget on component unmount
    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (error) {
          console.error('Error removing TradingView widget:', error);
        }
        widgetRef.current = null;
      }
    };
  }, [symbol, interval]);

  return (
    // This outer wrapper clips the scaled content, hiding the border.
    <div className="w-full h-full overflow-hidden">
      <div
        ref={containerRef}
        id="tradingview_chart_container"
        // Scale the widget up slightly to push its border outside the visible area.
        className="w-full h-full transform scale-[1.01]"
        style={{ minHeight: 'unset', height: '100%' }}
      />
    </div>
  );
};