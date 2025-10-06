"use client";

import React, { useMemo, useRef, useState } from 'react';
import type { Candle } from '@/app/types/token';
import { CandleChart, type CandleChartHandle } from './CandleChart';
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
} from 'lucide-react';

interface TradingViewProps {
  candles?: Candle[];
  title?: string;
  symbol?: string;
  timeframe?: string; // e.g., '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
  onChangeTimeframe?: (tf: string) => void;
}

const TF_OPTIONS: { label: string; value: string }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1D', value: '1d' },
];

export const TradingView: React.FC<TradingViewProps> = ({ candles, title, symbol, timeframe = '1m', onChangeTimeframe }) => {
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [showVolume, setShowVolume] = useState(true);
  const [showSMA9, setShowSMA9] = useState(false);
  const [showSMA21, setShowSMA21] = useState(false);
  const [crosshair, setCrosshair] = useState<'normal' | 'magnet' | 'hidden'>('normal');
  const [logScale, setLogScale] = useState(false);

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
          <div className="bg-[#07040b] border-r border-[#1f1a24] flex flex-col items-center py-1 sm:py-2 gap-1.5 sm:gap-2">
            <button onClick={() => setCrosshair((c) => (c === 'hidden' ? 'normal' : 'hidden'))} title="Toggle Crosshair" className={`p-1.5 sm:p-2 rounded ${crosshair === 'hidden' ? 'text-[#c0c0c0] hover:bg-black/30' : 'bg-[#111215] text-[#feea88]'}`}>
              <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button onClick={() => setLogScale((l) => !l)} title="Log Scale" className={`p-1.5 sm:p-2 rounded ${logScale ? 'bg-[#111215] text-[#feea88]' : 'text-[#c0c0c0] hover:bg-black/30'}`}>
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button onClick={() => handleRef.current?.fitContent()} title="Fit Content" className="p-1.5 sm:p-2 rounded text-[#c0c0c0] hover:bg-black/30">
              <RefreshCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

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
            />
          </div>
        </div>
      </div>
    </div>
  );
};
