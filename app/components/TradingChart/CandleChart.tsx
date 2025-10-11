"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
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
export type DrawingTool = 'none' | 'trendline' | 'ruler' | 'fib';

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
  livePrice?: number; // latest trade/price to render price line like other platforms
  showLastPriceLine?: boolean;
  activeTool?: DrawingTool; // drawing tool from parent UI
}

export interface CandleChartHandle {
  fitContent: () => void;
  clearDrawings: () => void;
}

type Anchor = { time: UTCTimestamp; price: number };
type TrendlineShape = { id: string; type: 'trendline'; a: Anchor; b: Anchor; color?: string };
type RulerShape = { id: string; type: 'ruler'; a: Anchor; b: Anchor };
type FibShape = { id: string; type: 'fib'; a: Anchor; b: Anchor };
type Shape = TrendlineShape | RulerShape | FibShape;

export const CandleChart = forwardRef<CandleChartHandle, CandleChartProps>(function CandleChart(
  { candles, chartType = "candles", showVolume = true, indicators = [], crosshair = "normal", priceScaleMode = "normal", livePrice, showLastPriceLine = true, activeTool = 'none' },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const smaSeriesRefs = useRef<ISeriesApi<"Line">[]>([]);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  // Price line references for candle/line series
  const priceLineCandleRef = useRef<any>(null);
  const priceLineLineRef = useRef<any>(null);
  // Drawing state
  const drawingsRef = useRef<Shape[]>([]);
  const draftRef = useRef<{ tool: Exclude<DrawingTool, 'none'>; a?: Anchor; b?: Anchor } | null>(null);
  const subsRef = useRef<{ onRange?: () => void; onCrosshair?: (p?: any) => void }>({});

  useImperativeHandle(ref, () => ({
    fitContent: () => chartRef.current?.timeScale().fitContent(),
    clearDrawings: () => {
      drawingsRef.current = [];
      draftRef.current = null;
      redraw();
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight || 480,
      layout: {
        background: { color: "#07040b" }, // keep solid black background similar to test chart
        textColor: "rgba(255,255,255,0.9)",
      },
      grid: {
        vertLines: { color: "#334158" },
        horzLines: { color: "#334158" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { scaleMargins: { top: 0.1, bottom: 0.25 }, borderColor: "#485c7b" },
      timeScale: { rightOffset: 6, barSpacing: 6, timeVisible: true, secondsVisible: true, borderColor: "#485c7b" },
    });

    chartRef.current = chart;

    // keep overlay sized when created
    syncOverlaySize();

    // redraw on pan/zoom horizontally
    const handleRangeChange = () => redraw();
    chart.timeScale().subscribeVisibleTimeRangeChange(handleRangeChange);
    subsRef.current.onRange = handleRangeChange;

    // also redraw on crosshair move as a general fallback for many interactions
    const handleCrosshairMove = () => redraw();
    chart.subscribeCrosshairMove(handleCrosshairMove);
    subsRef.current.onCrosshair = handleCrosshairMove;

    // Base series (candles or line)
    candleSeriesRef.current = chart.addCandlestickSeries({
      upColor: "#29f266",
      downColor: "#ff3b3b",
      borderUpColor: "#29f266",
      borderDownColor: "#ff3b3b",
      wickUpColor: "#29f266",
      wickDownColor: "#ff3b3b",
    });
    lineSeriesRef.current = chart.addLineSeries({ color: "#2196F3", lineWidth: 2, visible: false });

    // Volume series is added/removed dynamically based on showVolume (to mirror the test component structure)
    volumeSeriesRef.current = null;

    // Keep chart sized to container
    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        const w = Math.floor(cr.width);
        const h = Math.floor(cr.height);
        if (w > 0 && h > 0) {
          chart.applyOptions({ 
            width: w, 
            height: h,
            timeScale: { barSpacing: w < 480 ? 4 : 6 }
          });
          // keep last candle and timeline visible when container changes
          chart.timeScale().fitContent();
          syncOverlaySize();
          redraw();
        }
      }
    });
    resizeObserverRef.current.observe(container);

    // Fallback: respond to window resizes as well (some layouts may not trigger RO reliably)
    const onWindowResize = () => {
      if (!container) return;
      const w = Math.floor(container.clientWidth);
      const h = Math.floor(container.clientHeight);
      if (w > 0 && h > 0) {
        chart.applyOptions({ 
          width: w, 
          height: h,
          timeScale: { barSpacing: w < 480 ? 4 : 6 }
        });
        chart.timeScale().fitContent();
        syncOverlaySize();
        redraw();
      }
    };
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('orientationchange', onWindowResize);

    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('orientationchange', onWindowResize);
      try { if (subsRef.current.onRange) chart.timeScale().unsubscribeVisibleTimeRangeChange(subsRef.current.onRange); } catch {}
      try { if (subsRef.current.onCrosshair) chart.unsubscribeCrosshairMove(subsRef.current.onCrosshair as any); } catch {}
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      lineSeriesRef.current = null;
      volumeSeriesRef.current = null;
      smaSeriesRefs.current = [];
      priceLineCandleRef.current = null;
      priceLineLineRef.current = null;
    };
  }, []);

  // Update base series type and data
  useEffect(() => {
    const chart = chartRef.current;
    const candleSeries = candleSeriesRef.current;
    const lineSeries = lineSeriesRef.current;
    if (!chart || !candleSeries || !lineSeries) return;

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

    // Volume data (if series exists)
    if (volumeSeriesRef.current) {
      const volumes = (candles ?? []).map((c) => ({
        time: Math.floor(c.timestamp / 1000) as UTCTimestamp,
        value: c.volume,
        color: c.close >= c.open ? "#29f266" : "#ff3b3b",
      }));
      volumeSeriesRef.current.setData(volumes);
    }

    chart.timeScale().fitContent();
    redraw();
  }, [candles, chartType]);

  // Show/hide volume (add/remove the series to mirror test chart structure)
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (showVolume) {
      if (!volumeSeriesRef.current) {
        const vs = chart.addHistogramSeries({
          color: "#7185aa",
          priceFormat: { type: "volume" },
          priceScaleId: "",
        });
        // place volume on overlay scale with margins similar to test chart
        vs.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
        // seed with current data if available
        if (candles?.length) {
          const vols = candles.map((c) => ({
            time: Math.floor(c.timestamp / 1000) as UTCTimestamp,
            value: c.volume,
            color: c.close >= c.open ? "#29f266" : "#ff3b3b",
          }));
          vs.setData(vols);
        }
        volumeSeriesRef.current = vs;
      }
    } else if (volumeSeriesRef.current) {
      chart.removeSeries(volumeSeriesRef.current);
      volumeSeriesRef.current = null;
    }
  }, [showVolume, candles]);

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
    redraw();
  }, [priceScaleMode]);

  // Last price line (like TradingView) using latest livePrice or last close
  useEffect(() => {
    const candleSeries = candleSeriesRef.current;
    const lineSeries = lineSeriesRef.current;
    if (!candleSeries || !lineSeries || !showLastPriceLine) return;

    const last = candles && candles.length > 0 ? candles[candles.length - 1] : undefined;
    const prev = candles && candles.length > 1 ? candles[candles.length - 2] : undefined;
    const fallbackPrice = last?.close ?? undefined;
    const price = typeof livePrice === 'number' && !Number.isNaN(livePrice) ? livePrice : fallbackPrice;
    if (price == null) return;

    const isUp = prev && last ? last.close >= prev.close : true;
    const color = isUp ? '#29f266' : '#ff3b3b';

    // Format label with sensible precision
    const decimals = price >= 1 ? 4 : 8;
    const title = price.toFixed(decimals);

    // Remove existing price lines before creating new ones
    if (priceLineCandleRef.current) {
      try { candleSeries.removePriceLine(priceLineCandleRef.current); } catch {}
    }
    if (priceLineLineRef.current) {
      try { lineSeries.removePriceLine(priceLineLineRef.current); } catch {}
    }

    priceLineCandleRef.current = candleSeries.createPriceLine({
      price,
      color,
      lineWidth: 2,
      axisLabelVisible: true,
      title,
    });

    priceLineLineRef.current = lineSeries.createPriceLine({
      price,
      color,
      lineWidth: 2,
      axisLabelVisible: true,
      title,
    });
    redraw();
  }, [candles, livePrice, showLastPriceLine]);

  // Indicators (SMAs)
  useEffect(() => {
    const chart = chartRef.current;
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

  // cancel draft when tool disabled
  useEffect(() => {
    if (activeTool === 'none' && draftRef.current) {
      draftRef.current = null;
      redraw();
    }
  }, [activeTool]);

  // ---------- Drawing overlay helpers ----------
  const getActiveSeries = () => {
    return (chartType === 'candles' ? candleSeriesRef.current : lineSeriesRef.current) as ISeriesApi<any> | null;
  };

  const syncOverlaySize = () => {
    const canvas = overlayRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const w = Math.floor(container.clientWidth);
    const h = Math.floor(container.clientHeight);
    if (w <= 0 || h <= 0) return;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
  };

  const clearCanvas = (ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = '#feea88', width = 1) => {
    ctx.save();
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, Math.round(width * dpr));
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  const drawGlowLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = '#feea88', width = 1) => {
    ctx.save();
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 2.5 * dpr;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, Math.round(width * dpr));
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  const drawOutlinedLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = '#fbbf24', width = 2) => {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    // outer light outline for maximum contrast
    drawLine(ctx, x1, y1, x2, y2, 'rgba(255,255,255,0.85)', width + 2);
    // inner main color
    drawLine(ctx, x1, y1, x2, y2, color, width);
  };

  const drawDashedLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = 'rgba(148,163,184,0.8)', width = 1, dash: number[] = [6, 4]) => {
    ctx.save();
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, Math.round(width * dpr));
    ctx.setLineDash(dash.map(v => v * dpr));
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, r = 3, color = '#e5e7eb', stroke = 'rgba(0,0,0,0.6)') => {
    ctx.save();
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1 * dpr;
    ctx.arc(x, y, r * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const drawInfoBox = (ctx: CanvasRenderingContext2D, x: number, y: number, lines: string[], opts?: { bg?: string; color?: string; accent?: string }) => {
    ctx.save();
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const font = `${12 * dpr}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
    ctx.font = font;
    const paddingX = 8 * dpr;
    const paddingY = 6 * dpr;
    const lineGap = 4 * dpr;
    const widths = lines.map(t => ctx.measureText(t).width);
    const w = Math.max(...widths) + paddingX * 2;
    const lineHeight = 16 * dpr;
    const h = lineHeight * lines.length + paddingY * 2 + lineGap * (lines.length - 1);

    // Position to keep box within canvas if near edges
    const canvas = ctx.canvas;
    const bx = Math.min(Math.max(0, x), canvas.width - w - 2 * dpr);
    const by = Math.min(Math.max(h / 2 + 2 * dpr, y), canvas.height - h / 2 - 2 * dpr);

    // Box
    ctx.fillStyle = opts?.bg ?? 'rgba(7,10,18,0.9)';
    ctx.strokeStyle = opts?.accent ?? 'rgba(254,234,136,0.25)';
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    (ctx as any).roundRect?.(bx, by - h / 2, w, h, 6 * dpr);
    if (!(ctx as any).roundRect) {
      ctx.rect(bx, by - h / 2, w, h);
    }
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = opts?.color ?? '#e5e7eb';
    lines.forEach((t, i) => {
      ctx.fillText(t, bx + paddingX, by - h / 2 + paddingY + lineHeight * (i + 0.8) + (i > 0 ? lineGap * i : 0));
    });

    ctx.restore();
  };

  const drawLabel = (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, opts?: { bg?: string; color?: string }) => {
    ctx.save();
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    ctx.font = `${12 * dpr}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
    const paddingX = 6 * dpr;
    const paddingY = 4 * dpr;
    const metrics = ctx.measureText(text);
    const w = metrics.width + paddingX * 2;
    const h = 16 * dpr + paddingY * 2;
    ctx.fillStyle = opts?.bg ?? 'rgba(0,0,0,0.6)';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    (ctx as any).roundRect?.(x, y - h / 2, w, h, 4 * dpr);
    if (!(ctx as any).roundRect) {
      ctx.rect(x, y - h / 2, w, h);
    }
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = opts?.color ?? '#e5e7eb';
    ctx.fillText(text, x + paddingX, y + 4 * dpr);
    ctx.restore();
  };

  const anchorToPx = (a: Anchor): { x: number; y: number } | null => {
    const chart = chartRef.current;
    const series = getActiveSeries();
    if (!chart || !series) return null;
    let x = chart.timeScale().timeToCoordinate(a.time);
    const y = (series as any).priceToCoordinate(a.price) as number | null;
    if (x == null) {
      // try nearest candle time as fallback
      if (candles && candles.length) {
        const secs = candles.map(c => Math.floor(c.timestamp / 1000) as UTCTimestamp);
        let bestI = 0, bestD = Number.POSITIVE_INFINITY;
        for (let i = 0; i < secs.length; i++) {
          const d = Math.abs(secs[i] - a.time);
          if (d < bestD) { bestD = d; bestI = i; }
        }
        x = chart.timeScale().timeToCoordinate(secs[bestI]);
      }
    }
    if (x == null || y == null) return null;
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    return { x: x * dpr, y: y * dpr };
  };

  const pxToAnchor = (px: number, py: number): Anchor | null => {
    const chart = chartRef.current;
    const series = getActiveSeries();
    if (!chart || !series) return null;
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const x = px / dpr;
    const y = py / dpr;
    const t = chart.timeScale().coordinateToTime(x) as UTCTimestamp | undefined;
    const price = (series as any).coordinateToPrice(y) as number | null;
    if (t == null || price == null) return null;
    let anchor: Anchor = { time: t, price };

    // Magnet snap to nearest candle OHLC if crosshair is magnet and we have candles
    if (crosshair === 'magnet' && candles && candles.length) {
      const secs = candles.map(c => Math.floor(c.timestamp / 1000) as UTCTimestamp);
      // find nearest time index
      let idx = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < secs.length; i++) {
        const d = Math.abs(secs[i] - anchor.time);
        if (d < bestDist) { bestDist = d; idx = i; }
      }
      const c = candles[idx];
      const o = c.open, h = c.high, l = c.low, cl = c.close;
      const candPrices = [o, h, l, cl];
      // choose OHLC closest to current anchor price
      let bestP = o;
      let bestPDist = Math.abs(o - anchor.price);
      for (const p of candPrices) {
        const dist = Math.abs(p - anchor.price);
        if (dist < bestPDist) { bestPDist = dist; bestP = p; }
      }
      anchor = { time: secs[idx], price: bestP };
    }

    return anchor;
  };

  const drawTrendline = (ctx: CanvasRenderingContext2D, s: TrendlineShape) => {
    const pa = anchorToPx(s.a);
    const pb = anchorToPx(s.b);
    if (!pa || !pb) return;
    const color = s.color ?? '#fbbf24'; // high-contrast amber
    // strong outline for visibility and then main line
    drawOutlinedLine(ctx, pa.x, pa.y, pb.x, pb.y, color, 2.5);
    // endpoints for better visibility
    drawCircle(ctx, pa.x, pa.y, 2.75, '#fef3c7', 'rgba(0,0,0,0.65)');
    drawCircle(ctx, pb.x, pb.y, 2.75, '#fef3c7', 'rgba(0,0,0,0.65)');
  };

  const formatNumber = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1) return v.toFixed(4);
    return v.toFixed(8);
  };

  const drawRuler = (ctx: CanvasRenderingContext2D, s: RulerShape) => {
    const pa = anchorToPx(s.a);
    const pb = anchorToPx(s.b);
    if (!pa || !pb) return;

    const up = s.b.price >= s.a.price;
    const accent = up ? '#22c55e' : '#ef4444';
    const secondary = '#93c5fd';

    // Fill rectangle between points across the selected time range
    const left = Math.min(pa.x, pb.x);
    const right = Math.max(pa.x, pb.x);
    const top = Math.min(pa.y, pb.y);
    const bottom = Math.max(pa.y, pb.y);
    ctx.save();
    ctx.fillStyle = up ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)';
    ctx.fillRect(left, top, right - left, bottom - top);
    ctx.restore();

    // Dashed L-shaped guides (horizontal then vertical) and subtle diagonal
    drawDashedLine(ctx, pa.x, pa.y, pb.x, pa.y, 'rgba(148,163,184,0.9)', 1, [6,4]);
    drawDashedLine(ctx, pb.x, pa.y, pb.x, pb.y, 'rgba(148,163,184,0.9)', 1, [6,4]);
    drawLine(ctx, pa.x, pa.y, pb.x, pb.y, secondary, 1); // subtle diagonal

    // Endpoints
    drawCircle(ctx, pa.x, pa.y, 3, '#e5e7eb', 'rgba(0,0,0,0.6)');
    drawCircle(ctx, pb.x, pb.y, 3, '#e5e7eb', 'rgba(0,0,0,0.6)');

    // Metrics
    const priceDelta = s.b.price - s.a.price;
    const pct = (priceDelta / s.a.price) * 100;
    const tDeltaSec = (s.b.time - s.a.time);

    // bar count using nearest indices
    let bars = 0;
    if (candles && candles.length) {
      const secs = candles.map(c => Math.floor(c.timestamp / 1000) as UTCTimestamp);
      const nearestIdx = (t: UTCTimestamp) => {
        let bestI = 0, bestD = Number.POSITIVE_INFINITY;
        for (let i = 0; i < secs.length; i++) {
          const d = Math.abs(secs[i] - t);
          if (d < bestD) { bestD = d; bestI = i; }
        }
        return bestI;
      };
      const aIdx = nearestIdx(s.a.time);
      const bIdx = nearestIdx(s.b.time);
      bars = Math.abs(bIdx - aIdx);
    }

    const prettyTime = (() => {
      const sec = Math.abs(tDeltaSec);
      const minutes = Math.floor(sec / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      if (days > 0) return `${days}d ${hours % 24}h`;
      if (hours > 0) return `${hours}h ${minutes % 60}m`;
      if (minutes > 0) return `${minutes}m ${sec % 60}s`;
      return `${sec}s`;
    })();

    const line1 = `${formatNumber(priceDelta)} (${pct.toFixed(2)}%)`;
    const line2 = `${bars} bars • ${prettyTime}`;

    // Info box near end point, offset a bit to the right/below
    const infoX = pb.x + 12;
    const infoY = pb.y + (up ? -14 : 14);
    drawInfoBox(ctx, infoX, infoY, [line1, line2], { bg: 'rgba(7,10,18,0.9)', color: '#e5e7eb', accent });
  };

  const drawFib = (ctx: CanvasRenderingContext2D, s: FibShape) => {
    const a = s.a;
    const b = s.b;
    const high = Math.max(a.price, b.price);
    const low = Math.min(a.price, b.price);
    const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    const xa = anchorToPx(a)?.x;
    const xb = anchorToPx(b)?.x;
    if (xa == null || xb == null) return;
    const left = Math.min(xa, xb);
    const right = Math.max(xa, xb);
    const colors = ['#0ea5e9', '#22c55e', '#eab308', '#f59e0b', '#ef4444', '#a78bfa', '#38bdf8'];

    // filled bands between levels
    for (let i = 0; i < levels.length; i++) {
      const lvl = levels[i];
      const price = low + (high - low) * lvl;
      const y = anchorToPx({ time: a.time, price })?.y;
      if (y == null) continue;
      // draw line across range
      drawLine(ctx, left, y, right, y, colors[i % colors.length], 1);
      // label text on right side
      drawLabel(ctx, right + 8, y, `${(lvl * 100).toFixed(1)}%  ${formatNumber(price)}`, { bg: 'rgba(7,4,11,0.7)', color: '#e5e7eb' });
      // fill area to next level lightly
      if (i < levels.length - 1) {
        const nextLvl = levels[i + 1];
        const nextPrice = low + (high - low) * nextLvl;
        const y2 = anchorToPx({ time: a.time, price: nextPrice })?.y;
        if (y2 != null) {
          ctx.save();
          ctx.fillStyle = 'rgba(254,234,136,0.06)';
          ctx.fillRect(left, Math.min(y, y2), right - left, Math.abs(y2 - y));
          ctx.restore();
        }
      }
    }
  };

  const redraw = useCallback(() => {
    const canvas = overlayRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    clearCanvas(ctx);
    // draw saved drawings
    for (const s of drawingsRef.current) {
      if (s.type === 'trendline') drawTrendline(ctx, s);
      else if (s.type === 'ruler') drawRuler(ctx, s);
      else if (s.type === 'fib') drawFib(ctx, s);
    }
    // draw current draft preview
    const d = draftRef.current;
    if (d?.a && d?.b) {
      const tempId = 'preview';
      if (d.tool === 'trendline') drawTrendline(ctx, { id: tempId, type: 'trendline', a: d.a, b: d.b });
      if (d.tool === 'ruler') drawRuler(ctx, { id: tempId, type: 'ruler', a: d.a, b: d.b });
      if (d.tool === 'fib') drawFib(ctx, { id: tempId, type: 'fib', a: d.a, b: d.b });
    }
  }, []);

  // pointer handlers on overlay
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'none') return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;
    const anchor = pxToAnchor(x, y);
    if (!anchor) return;
    if (!draftRef.current) {
      draftRef.current = { tool: activeTool as Exclude<DrawingTool, 'none'>, a: anchor };
    } else if (draftRef.current && !draftRef.current.b) {
      draftRef.current.b = anchor;
      // finalize shape
      const d = draftRef.current;
      if (d.a && d.b) {
        const id = `${d.tool}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        drawingsRef.current.push({ id, type: d.tool, a: d.a, b: d.b } as Shape);
      }
      draftRef.current = null;
    }
    redraw();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool === 'none') return;
    const d = draftRef.current;
    if (!d || !d.a) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;
    const anchor = pxToAnchor(x, y);
    if (!anchor) return;
    draftRef.current = { ...d, b: anchor };
    redraw();
  };

  const onContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (activeTool === 'none') return;
    // right-click cancels current draft
    if (draftRef.current) {
      draftRef.current = null;
      redraw();
    }
  };

  const onWheel = () => {
    // when zooming/panning with wheel, ensure overlay redraws
    redraw();
  };

  // Fallback mouse handlers (in case pointer events are not firing in some envs)
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => onPointerDown(e as any);
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => onPointerMove(e as any);

  return (
    <div className="w-full h-full min-h-[145px] relative">
      <div
        ref={containerRef}
        className="absolute left-0 right-0 top-0"
        style={{ bottom: 'calc(var(--mobile-bottom-inset, 0px) + var(--mobile-recent-inset, 0px) + var(--chart-bottom-offset, 0px))', background: "#07040b", borderRadius: 8 }}
      />
      <canvas
        ref={overlayRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onContextMenu={onContextMenu}
        onWheel={onWheel}
        className="absolute left-0 right-0 top-0"
        style={{ pointerEvents: activeTool === 'none' ? 'none' : 'auto', bottom: 'calc(var(--mobile-bottom-inset, 0px) + var(--mobile-recent-inset, 0px) + var(--chart-bottom-offset, 0px))', zIndex: 5, cursor: activeTool === 'none' ? 'default' : 'crosshair' }}
      />
    </div>
  );
});
