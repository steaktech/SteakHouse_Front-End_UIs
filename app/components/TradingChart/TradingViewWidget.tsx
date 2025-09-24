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
  const containerIdRef = useRef(`tradingview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Ensure the container is ready and the widget isn't already created
    if (!containerRef.current || widgetRef.current) {
      return;
    }

    let isMounted = true;
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    
    script.onload = () => {
      // Check if component is still mounted and container still exists
      if (!isMounted || typeof window.TradingView === 'undefined' || !containerRef.current) {
        return;
      }

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
        container_id: containerIdRef.current, // Use unique container ID
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
        // Double-check container still exists before creating widget
        if (containerRef.current && isMounted) {
          const tvWidget = new window.TradingView.widget(widgetOptions);
          widgetRef.current = tvWidget;
        }
      } catch (error) {
        console.error('Error creating TradingView widget:', error);
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load TradingView script');
    };
    
    // Only append script if component is still mounted
    if (isMounted) {
      document.head.appendChild(script);
    }

    // Cleanup function to remove widget on component unmount
    return () => {
      isMounted = false;
      
      // Clean up widget with better error handling
      if (widgetRef.current) {
        try {
          // Check if the widget and its methods still exist
          if (typeof widgetRef.current.remove === 'function') {
            widgetRef.current.remove();
          } else if (typeof widgetRef.current.destroy === 'function') {
            widgetRef.current.destroy();
          }
        } catch (error) {
          // Silently handle cleanup errors to prevent console spam
          console.warn('TradingView widget cleanup warning:', error instanceof Error ? error.message : 'Unknown error');
        }
        widgetRef.current = null;
      }
      
      // Clean up container content if it still exists
      if (containerRef.current) {
        try {
          containerRef.current.innerHTML = '';
        } catch (error) {
          // Ignore cleanup errors for unmounted components
        }
      }
      
      // Remove script if it was added and still exists
      try {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      } catch (error) {
        // Ignore script removal errors
      }
    };
  }, [symbol, interval]);

  return (
    // This outer wrapper clips the scaled content, hiding the border.
    <div className="w-full h-full overflow-hidden">
      <div
        ref={containerRef}
        id={containerIdRef.current}
        // Scale the widget up slightly to push its border outside the visible area.
        className="w-full h-full min-h-145 transform scale-[1.01]"
      />
    </div>
  );
};