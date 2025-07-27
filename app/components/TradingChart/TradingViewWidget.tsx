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
  symbol = 'BINANCE:BTCUSDT',
  interval = 'D',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Use a ref to ensure the widget is created only once.
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Only create the widget if the container is available and it hasn't been created yet.
    if (!containerRef.current || widgetRef.current) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView === 'undefined') return;
      if (!containerRef.current) return;

      const widgetOptions = {
        autosize: true,
        symbol: symbol,
        interval: interval,
        theme: "dark", // Use the dark theme as a base
        style: "1",
        hide_top_toolbar: true,
        backgroundColor: "rgb(12, 6, 0)",
        gridColor: "rgba(2, 2, 2, 0.06)",
        container_id: "tradingview_chart_container", // Use the actual ID string directly
        custom_css_url: '/css/custom_chart_styles.css',
        // All custom styles are placed in the 'overrides' object
        overrides: {
          // -- Main Series (Candles) Styling --
          "mainSeriesProperties.candleStyle.upColor": "#57f25d",
          "mainSeriesProperties.candleStyle.downColor": "#bc402b",
          "mainSeriesProperties.candleStyle.borderUpColor": "#57f25d",
          "mainSeriesProperties.candleStyle.borderDownColor": "#bc402b",
          "mainSeriesProperties.candleStyle.wickUpColor": "#57f25d",
          "mainSeriesProperties.candleStyle.wickDownColor": "#bc402b",
        },
        // -- Study Overrides for Volume Indicator --
        studies_overrides: {
            "volume.volume.color.0": "#bc402b", // Down volume
            "volume.volume.color.1": "#57f25d", // Up volume
            "volume.volume.transparency": 80,    // Make volume 100% opaque
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

    // Cleanup function to remove the widget when the component unmounts
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
    <>
    <style>
      {`
        .tradingview-widget-container {
          width: 977px;
          height: 607px;
          overflow: hidden;

        }
        #tradingview_chart{
          margin: -1px -1px !important;
        }
      `}
    </style>
    <div 
      ref={containerRef} 
      id="tradingview_chart_container"
      className="tradingview-container h-full w-full"
    />
    </>
  );
};