"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import type { Candle } from "@/app/types/token";
import {
  createChart,
  CrosshairMode,
  PriceScaleMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

export type ChartType = "candles" | "line";
export type CrosshairSetting = "normal" | "magnet" | "hidden";
export type PriceScaleSetting = "normal" | "log";

interface IndicatorSMA {
  type: "sma";
  length: number;
  color?: string;
}

interface CandleChartProps {
  candles?: Candle[];
  chartType?: ChartType;
  showVolume?: boolean;
  indicators?: IndicatorSMA[];
  crosshair?: CrosshairSetting;
  priceScaleMode?: PriceScaleSetting;
}

export interface CandleChartHandle {
  fitContent: () => void;
}

export const CandleChart = forwardRef<CandleChartHandle, CandleChartProps>(function CandleChart(
  { candles, chartType = "candles", showVolume = true, indicators = [], crosshair = "normal", priceScaleMode = "normal" },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const smaSeriesRefs = useRef<ISeriesApi<"Line">[]>([]);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useImperativeHandle(ref, () => ({
    fitContent: () => chartRef.current?.timeScale().fitContent(),
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight || 480,
      layout: {
        background: { color: "transparent" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "rgba(2, 2, 2, 0.06)" },
        horzLines: { color: "rgba(2, 2, 2, 0.06)" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { scaleMargins: { top: 0.1, bottom: 0.25 } },
      timeScale: { rightOffset: 6, barSpacing: 6, timeVisible: true, secondsVisible: true },
    });

    chartRef.current = chart;

    // Base series (candles or line)
    candleSeriesRef.current = chart.addCandlestickSeries({
      upColor: "#29f266",
      downColor: "#ff3b3b",
      borderUpColor: "#29f266",
      borderDownColor: "#ff3b3b",
      wickUpColor: "#29f266",
      wickDownColor: "#ff3b3b",
    });
    lineSeriesRef.current = chart.addLineSeries({ color: "#8ab4f8", lineWidth: 2, visible: false });

    // Volume (overlay histogram)
    volumeSeriesRef.current = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      color: "#7185aa",
      priceScaleId: "volume",
      visible: showVolume,
    });
    chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

    // Keep chart sized to container
    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        chart.applyOptions({ width: Math.floor(cr.width), height: Math.floor(cr.height) });
      }
    });
    resizeObserverRef.current.observe(container);

    // Fallback: respond to window resizes as well (some layouts may not trigger RO reliably)
    const onWindowResize = () => {
      if (!container) return;
      const w = Math.floor(container.clientWidth);
      const h = Math.floor(container.clientHeight);
      chart.applyOptions({ width: w, height: h > 0 ? h : 480 });
    };
    window.addEventListener('resize', onWindowResize);

    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      window.removeEventListener('resize', onWindowResize);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      lineSeriesRef.current = null;
      volumeSeriesRef.current = null;
      smaSeriesRefs.current = [];
    };
  }, []);

  // Update base series type and data
  useEffect(() => {
    const chart = chartRef.current;
    const candleSeries = candleSeriesRef.current;
    const lineSeries = lineSeriesRef.current;
    const volumeSeries = volumeSeriesRef.current;
    if (!chart || !candleSeries || !lineSeries || !volumeSeries) return;

    const bars = (candles ?? []).map((c) => {
      const t = Math.floor(c.timestamp / 1000) as UTCTimestamp;
      return { time: t, open: c.open, high: c.high, low: c.low, close: c.close };
    });

    if (chartType === "candles") {
      candleSeries.setData(bars);
      candleSeries.applyOptions({ visible: true });
      lineSeries.applyOptions({ visible: false });
    } else {
      const lineData = (candles ?? []).map((c) => ({ time: Math.floor(c.timestamp / 1000) as UTCTimestamp, value: c.close }));
      lineSeries.setData(lineData);
      candleSeries.applyOptions({ visible: false });
      lineSeries.applyOptions({ visible: true });
    }

    // Volume data
    const volumes = (candles ?? []).map((c) => ({
      time: Math.floor(c.timestamp / 1000) as UTCTimestamp,
      value: c.volume,
      color: c.close >= c.open ? "#29f266" : "#ff3b3b",
    }));
    volumeSeries.setData(volumes);

    chart.timeScale().fitContent();
  }, [candles, chartType]);

  // Show/hide volume
  useEffect(() => {
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.applyOptions({ visible: showVolume });
    }
  }, [showVolume]);

  // Crosshair mode (support hidden by toggling line visibility)
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    if (crosshair === 'hidden') {
      chart.applyOptions({
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { visible: false },
          horzLine: { visible: false },
        },
      });
    } else {
      const mode = crosshair === 'magnet' ? CrosshairMode.Magnet : CrosshairMode.Normal;
      chart.applyOptions({
        crosshair: {
          mode,
          vertLine: { visible: true },
          horzLine: { visible: true },
        },
      });
    }
  }, [crosshair]);

  // Price scale mode
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.applyOptions({ rightPriceScale: { mode: priceScaleMode === "log" ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal } });
  }, [priceScaleMode]);

  // Indicators (SMAs)
  useEffect(() => {
    const chart = chartRef.current;
    const lineSeries = lineSeriesRef.current;
    const candleSeries = candleSeriesRef.current;
    if (!chart || !candleSeries) return;

    // Remove any existing SMA series
    for (const s of smaSeriesRefs.current) {
      chart.removeSeries(s);
    }
    smaSeriesRefs.current = [];

    if (!indicators.length || !(candles?.length)) return;

    const closes = candles.map((c) => ({ time: Math.floor(c.timestamp / 1000) as UTCTimestamp, value: c.close }));

    function calcSMA(length: number) {
      const data: { time: UTCTimestamp; value: number }[] = [];
      let sum = 0;
      for (let i = 0; i < closes.length; i++) {
        sum += closes[i].value;
        if (i >= length) sum -= closes[i - length].value;
        if (i >= length - 1) data.push({ time: closes[i].time, value: sum / length });
      }
      return data;
    }

    indicators.forEach((ind) => {
      if (ind.type === "sma") {
const series = chart.addLineSeries({ color: ind.color ?? "#eab308", lineWidth: 2 });
        series.setData(calcSMA(ind.length));
        smaSeriesRefs.current.push(series);
        // Overlay must align with whichever base is visible; nothing else to do
      }
    });
  }, [indicators, candles]);

  return (
    <div className="w-full h-full min-h-[145px]">
      <div ref={containerRef} className="w-full h-full" style={{ background: "#07040b", borderRadius: 8 }} />
    </div>
  );
});
