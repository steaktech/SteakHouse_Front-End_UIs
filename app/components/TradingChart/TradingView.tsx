"use client";

import React, { useMemo, useRef, useState } from 'react';
import type { Candle } from '@/app/types/token';
import { CandleChart, type CandleChartHandle } from './CandleChart';
import { ToolSidebar, ToolButton } from '@/app/components/UI/ToolSidebar';
import {
  CandlestickChart,
  LineChart,
  BarChart2,
  Crosshair,
  RefreshCcw,
  Settings,
  Eye,
  EyeOff,
  Activity,
  Ruler,
  TrendingUp,
  Layers,
  Trash2,
} from 'lucide-react';

interface TradingViewProps {
  candles?: Candle[];
  title?: string;
  symbol?: string;
  timeframe?: string; // e.g., '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  onChangeTimeframe?: (tf: string) => void;
  livePrice?: number; // latest trade price to display and feed price line
}

const TF_OPTIONS: { label: string; value: string }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1D', value: '1d' },
];

export const TradingView: React.FC<TradingViewProps> = ({ candles, title, symbol, timeframe = '1m', onChangeTimeframe, livePrice }) => {
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [showVolume, setShowVolume] = useState(true);
  const [showSMA9, setShowSMA9] = useState(false);
  const [showSMA21, setShowSMA21] = useState(false);
  const [crosshair, setCrosshair] = useState<'normal' | 'magnet' | 'hidden'>('normal');
  const [logScale, setLogScale] = useState(false);
  const [activeTool, setActiveTool] = useState<'none' | 'trendline' | 'ruler' | 'fib'>('none');
  const [autoFibEnabled, setAutoFibEnabled] = useState(true);
  const [autoTrendEnabled, setAutoTrendEnabled] = useState(true);

  const handleRef = useRef<CandleChartHandle | null>(null);

  const indicators = useMemo(() => {
    const list: { type: 'sma'; length: number; color?: string }[] = [];
    if (showSMA9) list.push({ type: 'sma', length: 9, color: '#f59e0b' });
    if (showSMA21) list.push({ type: 'sma', length: 21, color: '#60a5fa' });
    return list;
  }, [showSMA9, showSMA21]);

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="flex-grow flex flex-col h-full">
        {/* Top Toolbar */}
        <div className="h-10 sm:h-11 lg:h-12 px-2 sm:px-3 flex items-center gap-2 bg-[#07040b] border-b border-[#1f1a24]">
          <div className="flex items-center gap-2 sm:gap-3 pr-2 border-r border-[#1f1a24]">
            <div className="text-[#e5e7eb] font-semibold text-xs sm:text-sm">{title ?? 'Token'}</div>
            {symbol ? <div className="text-[#9ca3af] text-[10px] sm:text-xs">{symbol}</div> : null}
            {/* Live price like other platforms */}
            {(() => {
              const last = candles && candles.length > 0 ? candles[candles.length - 1] : undefined;
              const prev = candles && candles.length > 1 ? candles[candles.length - 2] : undefined;
              const price = typeof livePrice === 'number' && !Number.isNaN(livePrice) ? livePrice : last?.close;
              if (price == null) return null;
              const isUp = prev && last ? price >= prev.close : true;
              const decimals = price >= 1 ? 4 : 8;
              return (
                <div className={`ml-1 px-2 py-0.5 rounded border text-[10px] sm:text-xs ${isUp ? 'text-[#29f266] border-[#29f266]/40' : 'text-[#ff3b3b] border-[#ff3b3b]/40'}`}>
                  {price.toFixed(decimals)}
                </div>
              );
            })()}
          </div>

          {/* Timeframes */}
          <div className="flex items-center gap-1 pr-2 border-r border-[#1f1a24]">
            {TF_OPTIONS.map((tf) => (
              <button key={tf.value} onClick={() => onChangeTimeframe?.(tf.value)} className={`px-2 py-1 rounded text-[10px] sm:text-xs font-medium transition-colors ${
                timeframe === tf.value ? 'bg-[#111215] text-[#feea88] border border-[#2b2b2b]' : 'text-[#c0c0c0] hover:bg-black/30'
              }`}>
                {tf.label}
              </button>
            ))}
          </div>

          {/* Chart type */}
          <div className="flex items-center gap-1 pr-2 border-r border-[#1f1a24]">
            <button onClick={() => setChartType('candles')} title="Candles" className={`p-1.5 sm:p-1.5 lg:p-1.5 rounded ${chartType === 'candles' ? 'bg-[#111215] text-[#feea88]' : 'text-[#c0c0c0] hover:bg-black/30'}`}>
              <CandlestickChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button onClick={() => setChartType('line')} title="Line" className={`p-1.5 sm:p-1.5 lg:p-1.5 rounded ${chartType === 'line' ? 'bg-[#111215] text-[#feea88]' : 'text-[#c0c0c0] hover:bg-black/30'}`}>
              <LineChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Volume toggle */}
          <div className="flex items-center gap-1 pr-2 border-r border-[#1f1a24]">
            <button onClick={() => setShowVolume((v) => !v)} title="Toggle Volume" className={`p-1.5 rounded ${showVolume ? 'bg-[#111215] text-[#feea88]' : 'text-[#c0c0c0] hover:bg-black/30'}`}>
              {showVolume ? <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
            <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#9ca3af]" />
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-2">
            <div className="text-[#9ca3af] text-[10px] sm:text-xs flex items-center gap-1"><Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Indicators</div>
            <button onClick={() => setShowSMA9((s) => !s)} className={`px-2 py-1 rounded text-[10px] sm:text-xs ${showSMA9 ? 'bg-[#111215] text-[#feea88]' : 'text-[#c0c0c0] hover:bg-black/30'}`}>SMA 9</button>
            <button onClick={() => setShowSMA21((s) => !s)} className={`px-2 py-1 rounded text-[10px] sm:text-xs ${showSMA21 ? 'bg-[#111215] text-[#feea88]' : 'text-[#c0c0c0] hover:bg-black/30'}`}>SMA 21</button>
            {/* Auto Overlays */}
            <div className="ml-2 flex items-center gap-1 border-l border-[#1f1a24] pl-2">
              <button onClick={() => setAutoFibEnabled((v) => !v)} title="Toggle Auto Fib (tracks visible range)" className={`px-2 py-1 rounded text-[10px] sm:text-xs ${autoFibEnabled ? 'bg-[#166534] text-white' : 'text-[#c0c0c0] hover:bg-black/30'}`}>Fib Auto</button>
              <button onClick={() => setAutoTrendEnabled((v) => !v)} title="Toggle Auto Trendline (tracks visible range)" className={`px-2 py-1 rounded text-[10px] sm:text-xs ${autoTrendEnabled ? 'bg-[#4c1d95] text-white' : 'text-[#c0c0c0] hover:bg-black/30'}`}>Trend Auto</button>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => handleRef.current?.fitContent()} title="Reset / Fit" className="p-1.5 rounded text-[#c0c0c0] hover:bg-black/30">
              <RefreshCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Body with Side Toolbar + Chart */}
        <div className="flex-1 grid grid-cols-[32px_1fr] sm:grid-cols-[40px_1fr] lg:grid-cols-[44px_1fr] grid-rows-[1fr] min-h-0">
          {/* Left toolbar */}
          <ToolSidebar>
            {/* Crosshair toggle */}
            <ToolButton onClick={() => setCrosshair((c) => (c === 'hidden' ? 'normal' : 'hidden'))} title="Toggle Crosshair" active={crosshair !== 'hidden'}>
              <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </ToolButton>

            {/* Log scale */}
            <ToolButton onClick={() => setLogScale((l) => !l)} title="Log Scale" active={logScale}>
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </ToolButton>

            {/* Fit content */}
            <ToolButton onClick={() => handleRef.current?.fitContent()} title="Fit Content">
              <RefreshCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </ToolButton>

            {/* Divider */}
            <div className="h-[1px] w-6 sm:w-7 bg-[#1f1a24] my-1 sm:my-2" />

            {/* Drawing tools */}
            <ToolButton title="Trendline" active={activeTool === 'trendline'} onClick={() => setActiveTool((t) => (t === 'trendline' ? 'none' : 'trendline'))}>
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </ToolButton>
            <ToolButton title="Ruler" active={activeTool === 'ruler'} onClick={() => setActiveTool((t) => (t === 'ruler' ? 'none' : 'ruler'))}>
              <Ruler className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </ToolButton>
            <ToolButton title="Fibonacci Retracement" active={activeTool === 'fib'} onClick={() => setActiveTool((t) => (t === 'fib' ? 'none' : 'fib'))}>
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </ToolButton>

            {/* Clear drawings */}
            <ToolButton title="Clear Drawings" onClick={() => handleRef.current?.clearDrawings()}>
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </ToolButton>
          </ToolSidebar>

          {/* Chart area */}
          <div className="relative min-h-0 h-full">
            <CandleChart
              ref={handleRef}
              candles={candles}
              chartType={chartType}
              showVolume={showVolume}
              indicators={indicators as any}
              crosshair={crosshair}
              priceScaleMode={logScale ? 'log' : 'normal'}
              livePrice={livePrice}
              activeTool={activeTool}
              autoFibEnabled={autoFibEnabled}
              autoTrendEnabled={autoTrendEnabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
