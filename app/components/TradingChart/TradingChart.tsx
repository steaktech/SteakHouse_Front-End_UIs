"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Script from 'next/script';
import { useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomBar } from './MobileSidebar';
import dynamic from 'next/dynamic';

const TradingView = dynamic(
  () => import('./TradingView').then((mod) => mod.TradingView),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#0a0612] animate-pulse" />
  }
);
import { TradeHistory } from './TradeHistory';
import { TradePanel } from './TradePanel';
import { CompactLimitOrderBook } from './CompactLimitOrderBook';
import { MobileTradeHistoryTable } from './MobileTradeHistoryTable';
import { TokenCardProps } from '@/app/components/TradingDashboard/types';
import { MobileStyleTokenCard, TokenData } from './MobileStyleTokenCard';
import { useOrderManagement } from './useOrderManagement';
import { useNotifications } from './useNotifications';
import { OrderNotification } from './OrderNotification';
import { MobileBuySellPanel } from './MobileBuySellPanel';
// MODIFIED: Added ChevronUp for the new button icon
import { X } from 'lucide-react';
import { useTokenData } from '@/app/hooks/useTokenData';
import { useTokenWebSocket } from '@/app/hooks/useTokenWebSocket';
import type { Candle, Trade, WebSocketTrade, ChartUpdateEvent } from '@/app/types/token';
import { aggregateCandles } from '@/app/lib/utils/candles';
import VerticalTokenTicker from '@/app/components/Widgets/VerticalTokenTicker';
import TopTrendingTicker from '@/app/components/Widgets/TopTrendingTicker';
import MobileStats from './MobileStats';
import MobileBanner from './MobileBanner';
import MobileTokenInfo from './MobileTokenInfo';
import { call } from 'viem/actions';

interface TradingChartProps {
  tokenAddress?: string;
}

export default function TradingChart({ tokenAddress = "0xc139475820067e2A9a09aABf03F58506B538e6Db" }: TradingChartProps) {
  const searchParams = useSearchParams();
  const tokenSymbol = searchParams.get('symbol');

  // Order management and notifications
  const notifications = useNotifications();
  const orderManagement = useOrderManagement();

  // Enhanced order handlers with notifications
  const handleOrderSubmit = async (orderData: any) => {
    const result = await orderManagement.createOrder(orderData);

    if (result.success) {
      notifications.notifySuccess(
        'Order Placed',
        result.message,
        result.orderId
      );
      // Fallback: ensure recent trades refresh soon after an order is placed in case WS 'trade' is delayed/missed
      try { setTimeout(() => { refetch?.(); }, 1200); } catch { }
    } else {
      notifications.notifyError(
        'Order Failed',
        result.message
      );
    }

    return result;
  };

  const handleOrderCancel = async (orderId: string) => {
    const success = await orderManagement.cancelOrder(orderId);

    if (success) {
      notifications.notifySuccess('Order Cancelled', 'Order has been successfully cancelled', orderId);
    } else {
      notifications.notifyError('Cancellation Failed', 'Failed to cancel order');
    }

    return success;
  };

  const handleOrderModify = async (orderId: string, newPrice: number, newAmount: number) => {
    const success = await orderManagement.modifyOrder(orderId, newPrice, newAmount);

    if (success) {
      notifications.notifySuccess('Order Modified', 'Order has been successfully updated', orderId);
    } else {
      notifications.notifyError('Modification Failed', 'Failed to modify order');
    }

    return success;
  };

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileSidebarExpanded, setMobileSidebarExpanded] = useState(false);
  const [isMobileTradeOpen, setIsMobileTradeOpen] = useState(false);
  const [selectedTradeTab, setSelectedTradeTab] = useState<'buy' | 'sell'>('buy');
  const [desktopTradeTab, setDesktopTradeTab] = useState<'buy' | 'sell' | 'limit'>('buy');
  const [transactionsHeight, setTransactionsHeight] = useState(160); // Default height
  const [desktopTransactionsHeight, setDesktopTransactionsHeight] = useState(280); // Default height for desktop
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingDesktop, setIsDraggingDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isDraggingRef = useRef(false);
  const isDraggingDesktopRef = useRef(false);
  const dragStateRef = useRef({ startY: 0, startHeight: 0, lastY: 0, frameId: 0 });
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showLimitOrders, setShowLimitOrders] = useState(false);
  const [tokenData, setTokenData] = useState<TokenCardProps>({
    token_address: tokenAddress,
  });

  // API: timeframe + token data
  const [timeframe, setTimeframe] = useState<string>('1m');
  // Fetch candles based on selected timeframe
  const { data: apiTokenData, isLoading, error, refetch } = useTokenData(tokenAddress, { interval: timeframe, limit: 200 });

  // Force refetch when token address changes to ensure fresh trade data
  useEffect(() => {
    if (tokenAddress && refetch) {
      console.log('[TradingChart] Token address changed, forcing refetch:', tokenAddress);
      refetch();
      // Clear live updates when switching tokens
      setLiveTokenUpdates({});
    }
  }, [tokenAddress]); // Don't include refetch in deps to avoid infinite loop

  // Set brand colors to match token palette if available
  useEffect(() => {
    const autoBrand = apiTokenData?.tokenInfo?.auto_brand ?? false;
    const palette = apiTokenData?.tokenInfo?.color_palette || '';
    if (palette && palette !== '' && autoBrand) {
      const colors = JSON.parse(palette);
      const r = document.documentElement;
      r.style.setProperty('--ab-bg-200', colors?.recommended?.background);
      r.style.setProperty('--ab-bg-300', colors?.recommended?.background);
      r.style.setProperty('--ab-bg-400', colors?.recommended?.background);
      r.style.setProperty('--ab-bg-500', colors?.recommended?.background);
      r.style.setProperty('--ab-desc', colors?.recommended?.text);
      r.style.setProperty('--ab-text-200', colors?.recommended?.text);
      r.style.setProperty('--ab-text-400', colors?.recommended?.text);
    }
    else {
      const r = document.documentElement;
      r.style.removeProperty('--ab-bg-200');
      r.style.removeProperty('--ab-bg-300');
      r.style.removeProperty('--ab-bg-400');
      r.style.removeProperty('--ab-bg-500');
      r.style.removeProperty('--ab-desc');
      r.style.removeProperty('--ab-text-200');
      r.style.removeProperty('--ab-text-400');
    }
  }, [apiTokenData?.tokenInfo?.color_palette]);

  // Create audio player ref and handle audio URL updates
  const mp3PlayerRef = useRef<HTMLAudioElement>(null);
  const scWidgetRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load SoundCloud Widget API script on component mount
  // SoundCloud Widget API is loaded via next/script below

  // Audio playback control function - handles both MP3 and SoundCloud widget
  const playAudio = () => {
    const newPlayingState = !isPlaying;

    // Try to control SoundCloud widget first
    if (scWidgetRef.current && (window as any).SC && (window as any).SC.Widget) {
      try {
        const widget = (window as any).SC.Widget(scWidgetRef.current);
        if (newPlayingState) {
          widget.play();
        } else {
          widget.pause();
        }
        setIsPlaying(newPlayingState);
      } catch (e) {
        console.warn('[Audio] Failed to control SoundCloud widget, falling back to MP3:', e);
      }
    }

    // Fallback to regular MP3 player
    if (mp3PlayerRef.current) {
      if (newPlayingState) {
        mp3PlayerRef.current.play();
      } else {
        mp3PlayerRef.current.pause();
      }
      setIsPlaying(newPlayingState);
    }
  };

  // Utility function to extract SoundCloud track info
  const extractSoundCloudTrackUrl = (url: string): string | null => {
    try {
      // Verify it's a SoundCloud URL
      if (!url.includes('soundcloud.com')) {
        return null;
      }
      // SoundCloud URLs can be:
      // - https://soundcloud.com/user/track-name
      // - https://soundcloud.com/user/sets/playlist-name
      // - https://soundcloud.com/user/track-name/s-SHORTID
      // The widget.load() API accepts the full URL
      return url;
    } catch (error) {
      console.error('[SC] Failed to parse SoundCloud URL:', error);
      return null;
    }
  };

  // Update audio source when token info changes
  useEffect(() => {
    const mp3Url = apiTokenData?.tokenInfo?.mp3_url || null;
    let soundsCount = 0;

    console.log('[Audio] Updating audio source to:', mp3Url);

    if (!mp3Url) {
      console.log('[Audio] No audio URL provided');
      setIsPlaying(false);
      return;
    }

    console.log('[Audio] Processing URL:', mp3Url);

    // Check if URL is SoundCloud
    const isSoundCloudUrl = mp3Url.includes('soundcloud.com');

    if (isSoundCloudUrl) {
      console.log('[Audio] Detected SoundCloud URL');

      // Extract and validate the SoundCloud URL
      const scUrl = extractSoundCloudTrackUrl(mp3Url);
      if (!scUrl) {
        console.error('[SC] Invalid SoundCloud URL format');
        setIsPlaying(false);
        return;
      }

      // Load into SoundCloud widget
      if (scWidgetRef.current && typeof window !== 'undefined') {
        // Wait for SC API to be available
        const waitForSC = setInterval(() => {
          if ((window as any).SC && (window as any).SC.Widget) {
            clearInterval(waitForSC);
            try {
              // Create widget instance
              const widget = (window as any).SC.Widget(scWidgetRef.current);

              // Register event listeners before loading
              widget.bind((window as any).SC.Widget.Events.READY, function () {
                console.log('[SC] Widget ready - initiating autoplay');
                try {
                  if (soundsCount > 1) {
                    const rand = Math.floor(Math.random() * soundsCount);
                    widget.skip(rand)
                  }
                  widget.play();
                  setIsPlaying(true);
                  console.log('[SC] Track playback started on READY');
                } catch (e) {
                  console.warn('[SC] Auto-play on READY failed:', e);
                }
              });

              widget.bind((window as any).SC.Widget.Events.ERROR, function (error: any) {
                console.error('[SC] Widget error:', error);
                // Fallback to regular MP3 player on error
                if (mp3PlayerRef.current) {
                  mp3PlayerRef.current.src = mp3Url;
                  mp3PlayerRef.current.load();
                }
              });

              widget.bind((window as any).SC.Widget.Events.FINISH, function () {
                console.log('[SC] Track finished - restarting for loop');
                try {
                  if (soundsCount > 1) {
                    const rand = Math.floor(Math.random() * soundsCount);
                    widget.skip(rand)
                  }
                  widget.seekTo(0); // Reset to beginning
                  widget.play(); // Play again
                  setIsPlaying(true);
                } catch (e) {
                  console.warn('[SC] Loop replay failed:', e);
                }
              });

              widget.bind((window as any).SC.Widget.Events.PLAY, function () {
                setIsPlaying(true);
              });

              widget.bind((window as any).SC.Widget.Events.PAUSE, function () {
                setIsPlaying(false);
              });

              // Load the track with the SoundCloud URL
              console.log('[SC] Loading track from URL:', scUrl);
              widget.load(scUrl, {
                options: {
                  buying: false,
                  sharing: false,
                  liking: false,
                  download: false,
                  show_teaser: false,
                  show_playcount: false,
                  show_comments: false
                },
                auto_play: true,
                callback: function () {
                  widget.setVolume(50);
                  widget.getSounds(function (sounds: any) {
                    soundsCount = Array.isArray(sounds) ? sounds.length : 0;
                    console.log('[SC] Tracklist count:', soundsCount);
                    if (soundsCount > 1) {
                      const rand = Math.floor(Math.random() * soundsCount);
                      widget.skip(rand)
                      widget.play();
                      setIsPlaying(true);
                    }
                  });
                }
              });

              console.log('[SC] Loaded SoundCloud track:', scUrl);

              // Attempt to play after a delay in case READY event is missed
              setTimeout(() => {
                if (!isPlaying) {
                  playAudio();
                } else {
                  widget.play();
                }
              }, 5000);

            } catch (error) {
              console.error('[SC] Failed to initialize SoundCloud widget:', error);
              // Fallback to regular MP3 player
              if (mp3PlayerRef.current) {
                mp3PlayerRef.current.src = mp3Url;
                mp3PlayerRef.current.load();
              }
            }
          }
        }, 100);

        // Clear interval after 10 seconds if SC API not available
        const timeoutId = setTimeout(() => clearInterval(waitForSC), 10000);

        // Cleanup on unmount
        return () => {
          clearInterval(waitForSC);
          clearTimeout(timeoutId);
        };
      }
    } else {
      // Load regular MP3 into audio player
      if (mp3PlayerRef.current) {
        mp3PlayerRef.current.src = mp3Url;
        mp3PlayerRef.current.load(); // Load the new mp3 source
        mp3PlayerRef.current.volume = 0.5; // Set volume to 50%
        setTimeout(() => { playAudio() }, 5000);
      } else {
        console.error('[Audio] Audio player ref not available');
        setIsPlaying(false);
      }
    }
  }, [apiTokenData?.tokenInfo?.mp3_url]);

  // Local live state driven by WebSocket events
  const [candles1m, setCandles1m] = useState<Candle[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const lastWsTradeRef = useRef<WebSocketTrade | null>(null);

  // Track live WebSocket updates for token card
  const [liveTokenUpdates, setLiveTokenUpdates] = useState<{
    marketCap?: number;
    circulatingSupply?: number;
    virtualEth?: number;
    bondingProgress?: number;
  }>({});

  // Seed local state from API on load/change
  useEffect(() => {
    if (!apiTokenData) return;

    console.log('[TradingChart] API data received:', {
      hasCandles: Array.isArray(apiTokenData.candles),
      candlesCount: apiTokenData.candles?.length,
      hasRecentTrades: Array.isArray(apiTokenData.recentTrades),
      recentTradesCount: apiTokenData.recentTrades?.length,
      hasTrades: Array.isArray((apiTokenData as any).trades),
      tradesCount: (apiTokenData as any).trades?.length,
      tokenInfo: apiTokenData.tokenInfo?.symbol
    });

    if (Array.isArray(apiTokenData.candles)) {
      setCandles1m(apiTokenData.candles);
      console.log('[TradingChart] Set candles from API:', apiTokenData.candles.length, 'candles');
    } else {
      // Fresh token with no history - set empty array and wait for WebSocket
      console.log('[TradingChart] No candles from API (fresh token), awaiting WebSocket data');
      setCandles1m([]);
    }
    // Handle both 'recentTrades' and 'trades' for backward compatibility
    const tradesArray = (apiTokenData as any).recentTrades || (apiTokenData as any).trades;
    if (Array.isArray(tradesArray)) {
      console.log('[TradingChart] Setting trades:', tradesArray.length, 'trades');
      setTrades(tradesArray);
    } else {
      console.warn('[TradingChart] No trades found in API response');
      setTrades([]);
    }
  }, [apiTokenData]);

  // Use candles directly from API for display (no aggregation needed)
  const candlesForDisplay = useMemo(() => candles1m, [candles1m]);

  // Determine live price for display and price line: prefer last trade, then API price, then last close
  const livePrice: number | undefined = (() => {
    const fromTrade = lastWsTradeRef.current?.price;
    if (typeof fromTrade === 'number' && !Number.isNaN(fromTrade)) return fromTrade;
    const fromApi = apiTokenData?.price;
    if (typeof fromApi === 'number' && !Number.isNaN(fromApi)) return fromApi;
    const lastClose = candles1m.length ? candles1m[candles1m.length - 1].close : undefined;
    return typeof lastClose === 'number' && !Number.isNaN(lastClose) ? lastClose : undefined;
  })();

  // WebSocket: subscribe to token, update trades and candles
  // Normalize seconds/milliseconds to ms
  const toMs = (t: number) => (t > 1e12 ? Math.floor(t) : Math.floor(t * 1000));

  const handleWsTrade = (trade: WebSocketTrade) => {
    // Debug: log incoming trade from WebSocket
    console.log('[WS] Trade received', trade);
    // Normalize to Trade type; keep usdValue as number (component handles formatting)
    const normalized: Trade = {
      type: trade.type,
      token: trade.token,
      name: trade.name,
      symbol: trade.symbol,
      total_supply: trade.total_supply,
      trader: trade.trader,
      amountEth: Number(trade.amountEth),
      amountTokens: Number(trade.amountTokens),
      price: Number(trade.price),
      usdValue: Number(trade.usdValue),
      marketCap: Number(trade.marketCap),
      txHash: trade.txHash,
      virtualEth: typeof trade.virtualEth === 'number' ? trade.virtualEth : undefined,
      circulatingSupply: typeof trade.circulatingSupply === 'number' ? trade.circulatingSupply : undefined,
      timestamp: toMs(Number(trade.timestamp)),
    };
    lastWsTradeRef.current = trade;
    // Prepend and keep bounded; sorting in UI assumes ms timestamps
    setTrades(prev => [normalized, ...(prev || [])].slice(0, 200));

    // Update live token data for the token card
    if (trade.marketCap || trade.circulatingSupply || trade.virtualEth) {
      setLiveTokenUpdates(prev => {
        const updates: typeof prev = { ...prev };

        if (typeof trade.marketCap === 'number') {
          updates.marketCap = trade.marketCap;
        }

        if (typeof trade.circulatingSupply === 'number') {
          updates.circulatingSupply = trade.circulatingSupply;
        }

        if (typeof trade.virtualEth === 'number') {
          updates.virtualEth = trade.virtualEth;
        }

        // Calculate bonding progress if we have circulatingSupply and graduation cap
        if (typeof trade.circulatingSupply === 'number' && apiTokenData?.tokenInfo?.graduation_cap_norm) {
          const cap = Number(apiTokenData.tokenInfo.graduation_cap_norm);
          if (!isNaN(cap) && cap > 0) {
            updates.bondingProgress = (trade.circulatingSupply / cap) * 100;
          }
        }

        return updates;
      });
    }
  };

  const handleWsChartUpdate = ({ timeframe: tf, candle }: ChartUpdateEvent) => {
    // Debug: log incoming chart update from WebSocket
    console.log('[WS] Chart update', { timeframe: tf, candle });
    // Parse strings to numbers and normalize timestamp to ms
    const newCandle: Candle = {
      timestamp: toMs(Number(candle.timestamp)),
      open: typeof candle.open === 'string' ? parseFloat(candle.open) : (candle.open as unknown as number),
      high: Number(candle.high),
      low: Number(candle.low),
      close: typeof candle.close === 'string' ? parseFloat(candle.close) : (candle.close as unknown as number),
      volume: Number(candle.volume),
    };

    // Update local candle buffer for the current timeframe
    setCandles1m(prev => {
      // For fresh tokens with no candles, this is the first bar
      if (!prev || prev.length === 0) {
        console.log('[WS] Adding first candle for fresh token:', newCandle);
        return [newCandle];
      }

      const last = prev[prev.length - 1];
      if (last.timestamp === newCandle.timestamp) {
        const updated = [...prev];
        updated[updated.length - 1] = newCandle;
        return updated;
      }
      // Append, ensure increasing order and trim to limit similar to API (keep latest 200)
      const merged = [...prev, newCandle];
      if (merged.length > 200) merged.shift();
      return merged;
    });

    // Bridge the update into the TradingView datafeed (if present), so the visible chart updates immediately
    try {
      if (typeof window !== 'undefined') {
        const diag = (window as any).tvDiag;
        const addr = (tokenAddress ?? '').toLowerCase();
        const eventResolution = (() => {
          const s = String((tf as any) ?? '1');
          switch (s.toLowerCase()) {
            case '1':
            case '5':
            case '15':
            case '60':
            case '240':
            case '1440':
              return s;
            case '1m': return '1';
            case '5m': return '5';
            case '15m': return '15';
            case '1h': return '60';
            case '4h': return '240';
            case '1d':
            case '1day':
            case '24h': return '1440';
            default: return s;
          }
        })();
        if (diag?.subs && diag.subs.size) {
          diag.subs.forEach((sub: any) => {
            if (sub.address === addr && String(sub.resolution) === eventResolution) {
              const bar = {
                time: newCandle.timestamp,
                open: newCandle.open,
                high: newCandle.high,
                low: newCandle.low,
                close: newCandle.close,
                volume: newCandle.volume,
              };
              if (!Number.isFinite(bar.time) || !Number.isFinite(bar.close)) return;
              sub.lastTs = bar.time;
              sub.lastBar = bar;
              try { sub.onRealtimeCallback(bar); } catch (e) { console.error('[TV bridge] onRealtimeCallback failed', e); }
            }
          });
        }
      }
    } catch (e) {
      console.warn('[TV bridge] failed to propagate realtime bar', e);
    }
  };

  const { isConnected: wsConnected, connectionError: wsError } = useTokenWebSocket({
    tokenAddress: tokenAddress ?? null,
    resolution: timeframe,
    onTrade: handleWsTrade,
    onChartUpdate: handleWsChartUpdate,
  });

  // Mobile-style token data derived from API (fallback to existing state values)
  const formatShort = (n?: number) => {
    if (n == null || isNaN(n)) return undefined as unknown as string;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
  };
  const apiInfo = apiTokenData?.tokenInfo;
  const apiLastTrade = apiTokenData?.lastTrade;
  const taxValue = Number(apiInfo?.final_tax_rate ?? apiInfo?.curve_starting_tax ?? 3);

  // Helpers to compute limit percentages from tokenInfo (as % of total supply)
  const computeLimitPct = (limitTokens?: number | null): number | undefined => {
    if (!apiInfo?.total_supply || limitTokens == null) return undefined;
    const total = Number(apiInfo.total_supply);
    const lim = Number(limitTokens);
    if (!Number.isFinite(total) || !Number.isFinite(lim) || total <= 0 || lim <= 0) return undefined;
    return (lim / total) * 100;
  };

  const computeCurrentAndFinalLimitPct = (
    baseTokens?: number | null,
    stepTokens?: number | null,
    intervalSec?: number | string | null,
    limitDurationSec?: number | string | null,
    createdAtMs?: number | null,
  ): { current?: number; final?: number } => {
    if (baseTokens == null) return { current: undefined, final: undefined };

    const base = Number(baseTokens);
    if (!Number.isFinite(base) || base <= 0) return { current: undefined, final: undefined };

    const step = stepTokens != null ? Number(stepTokens) : undefined;
    const interval = intervalSec != null ? Number(intervalSec) : undefined;
    const limitDur = limitDurationSec != null ? Number(limitDurationSec) : undefined;

    // If we don't have dynamic step/interval info, treat as static limit
    if (!step || !interval || !limitDur || step <= 0 || interval <= 0 || limitDur <= 0) {
      const pct = computeLimitPct(base);
      return { current: pct, final: pct };
    }

    const totalSteps = Math.floor(limitDur / interval);
    if (!Number.isFinite(totalSteps) || totalSteps <= 0) {
      const pct = computeLimitPct(base);
      return { current: pct, final: pct };
    }

    const finalTokens = base + step * totalSteps;
    const finalPct = computeLimitPct(finalTokens) ?? computeLimitPct(base);

    let currentTokens = base;
    if (createdAtMs && createdAtMs > 0) {
      const nowSec = Date.now() / 1000;
      const createdSec = createdAtMs / 1000;
      const elapsedSec = Math.max(0, nowSec - createdSec);
      const stepsSoFar = Math.min(Math.floor(elapsedSec / interval), totalSteps);
      if (stepsSoFar > 0) {
        currentTokens = base + step * stepsSoFar;
      }
    }
    const currentPct = computeLimitPct(currentTokens) ?? computeLimitPct(base);

    return { current: currentPct, final: finalPct };
  };

  // Max Tx / Max Wallet percentages for "More Info" (as % of total supply)
  const maxTxLimits = computeCurrentAndFinalLimitPct(
    apiInfo?.curve_max_tx ?? null,
    apiInfo?.max_tx_step ?? null,
    apiInfo?.max_tx_interval ?? null,
    apiInfo?.limit_removal_time ?? null,
    apiInfo?.created_at_timestamp ?? null,
  );

  const maxWalletLimits = computeCurrentAndFinalLimitPct(
    apiInfo?.curve_max_wallet ?? null,
    apiInfo?.max_wallet_step ?? null,
    apiInfo?.max_wallet_interval ?? null,
    apiInfo?.limit_removal_time ?? null,
    apiInfo?.created_at_timestamp ?? null,
  );

  // Fallback max-tx for token card display (simple heuristic)
  const maxTxPctNum = apiInfo?.curve_max_tx && apiInfo?.total_supply
    ? (Number(apiInfo.curve_max_tx) / Number(apiInfo.total_supply)) * 100
    : 2.1;

  // Use live bonding progress from WebSocket if available, otherwise calculate from API
  const bondingPct = (() => {
    // Prefer live WebSocket update
    if (liveTokenUpdates.bondingProgress != null) {
      return liveTokenUpdates.bondingProgress;
    }
    // Fall back to API data
    if (apiInfo) {
      const circulating = Number(apiInfo.circulating_supply);
      const cap = Number(apiInfo.graduation_cap_norm);
      return !isNaN(circulating) && !isNaN(cap) && cap > 0 ? (circulating / cap) * 100 : 0;
    }
    return 0;
  })();

  // Use volume24h from API
  const volumeUsd = (() => {
    const vol24h = apiTokenData?.volume24h;
    if (vol24h != null && !isNaN(Number(vol24h))) {
      return formatShort(Number(vol24h));
    }
    return undefined;
  })();

  // Use marketCap from WebSocket if available (more recent), otherwise from API
  const marketCapFormatted = (() => {
    // Prefer live WebSocket update
    if (liveTokenUpdates.marketCap != null && !isNaN(liveTokenUpdates.marketCap)) {
      return formatShort(liveTokenUpdates.marketCap);
    }
    // Fall back to API data
    const mcap = apiTokenData?.marketCap;
    if (mcap != null && !isNaN(Number(mcap))) {
      return formatShort(Number(mcap));
    }
    return undefined;
  })();

  // Use virtualEth (liquidity pool) from WebSocket if available, otherwise from API
  const liquidityPoolFormatted = (() => {
    // Prefer live WebSocket update
    if (liveTokenUpdates.virtualEth != null && !isNaN(liveTokenUpdates.virtualEth)) {
      return `${liveTokenUpdates.virtualEth.toFixed(4)} ETH`;
    }
    // Fall back to API data
    if (apiInfo?.eth_pool != null) {
      return `${Number(apiInfo.eth_pool).toFixed(4)} ETH`;
    }
    return undefined;
  })();

  const mobileStyleTokenData: TokenData = {
    name: apiInfo?.name ?? 'Unknown',
    symbol: apiInfo?.symbol ?? '???',
    logo: apiInfo?.image_url ?? undefined,
    bannerUrl: apiInfo?.banner_url ?? undefined,
    currentTax: {
      buy: taxValue,
      sell: taxValue,
    },
    maxTransaction: Number(maxTxPctNum.toFixed(1)),
    description: apiInfo?.bio ?? undefined,
    marketCap: marketCapFormatted,
    volume: volumeUsd,
    liquidityPool: liquidityPoolFormatted,
    bondingProgress: bondingPct,
    tag: apiInfo?.catagory ?? undefined,
    tagColor: undefined,
    address: apiInfo?.real_token_address ?? apiInfo?.token_address ?? tokenAddress,
    contractAddress: apiInfo?.token_address ?? undefined,
    tokenAddress: apiInfo?.real_token_address ?? apiInfo?.token_address ?? tokenAddress,
    price: typeof livePrice === 'number' ? livePrice : undefined,
    priceChange24h:
      typeof apiTokenData?.priceChange24h === 'number'
        ? apiTokenData.priceChange24h
        : undefined,
    rawMarketCap:
      liveTokenUpdates.marketCap ??
      (apiTokenData?.marketCap != null ? Number(apiTokenData.marketCap) : undefined),
    rawLiquidityEth:
      liveTokenUpdates.virtualEth ??
      (apiInfo?.eth_pool != null ? Number(apiInfo.eth_pool) : undefined),
    rawVolume24h:
      apiTokenData?.volume24h != null ? Number(apiTokenData.volume24h) : undefined,
    circulatingSupply:
      liveTokenUpdates.circulatingSupply ??
      (apiInfo?.circulating_supply != null
        ? Number(apiInfo.circulating_supply)
        : undefined),
    totalSupply:
      apiInfo?.total_supply != null ? Number(apiInfo.total_supply) : undefined,
    graduationCap:
      apiInfo?.graduation_cap != null ? Number(apiInfo.graduation_cap) : undefined,
    graduated: apiInfo?.graduated ?? undefined,
    createdAt: apiInfo?.inserted_at ?? undefined,
    tokenType:
      apiInfo?.token_type != null ? Number(apiInfo.token_type) : undefined,
    currentMaxTxPct: maxTxLimits.current,
    finalMaxTxPct: maxTxLimits.final,
    currentMaxWalletPct: maxWalletLimits.current,
    finalMaxWalletPct: maxWalletLimits.final,
    currentTaxPct:
      apiInfo?.curve_starting_tax != null
        ? Number(apiInfo.curve_starting_tax)
        : apiInfo?.final_tax_rate != null
          ? Number(apiInfo.final_tax_rate)
          : undefined,
    finalTaxPct:
      apiInfo?.final_tax_rate != null
        ? Number(apiInfo.final_tax_rate)
        : apiInfo?.curve_starting_tax != null
          ? Number(apiInfo.curve_starting_tax)
          : undefined,
    telegramUrl: apiInfo?.telegram ?? undefined,
    twitterUrl: apiInfo?.twitter ?? undefined,
    websiteUrl: apiInfo?.website ?? undefined,
  };

  // Load token data based on URL parameter
  useEffect(() => {
    if (tokenSymbol) {
      // TODO: Map symbol -> address if needed; for now update label fields only
      setTokenData(prev => ({
        ...prev,
        symbol: tokenSymbol,
        name: tokenSymbol
      }));
    }
  }, [tokenSymbol]);


  // BUY inner style (green glossy pill)
  const buyInnerStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #6ef0a1, #34d37a 60%, #23bd6a)',
    borderRadius: '16px',
    padding: '14px 16px',
    textAlign: 'center',
    fontWeight: 800,
    color: '#1f2937',
    letterSpacing: '0.5px',
    width: '100%',
    boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -6px 12px rgba(0,0,0,0.18)'
  };

  // SELL inner style (red glossy pill)
  const sellInnerStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #ffb1a6, #ff7a6f 60%, #ff5b58)',
    borderRadius: '16px',
    padding: '14px 16px',
    textAlign: 'center',
    fontWeight: 800,
    color: '#2b1b14',
    letterSpacing: '0.5px',
    width: '100%',
    boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -6px 12px rgba(0,0,0,0.18)'
  };

  // Smooth drag handlers for resizing transactions
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsTransitioning(false);
    dragStateRef.current.startY = e.clientY;
    dragStateRef.current.startHeight = transactionsHeight;
    dragStateRef.current.lastY = e.clientY;
    e.preventDefault();
    e.stopPropagation();
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    setIsTransitioning(false);
    const touch = e.touches[0];
    dragStateRef.current.startY = touch.clientY;
    dragStateRef.current.startHeight = transactionsHeight;
    dragStateRef.current.lastY = touch.clientY;

    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;

    e.preventDefault();
    dragStateRef.current.lastY = e.clientY;

    // Cancel any pending animation frame
    if (dragStateRef.current.frameId) {
      cancelAnimationFrame(dragStateRef.current.frameId);
    }

    // Use requestAnimationFrame for smooth updates
    dragStateRef.current.frameId = requestAnimationFrame(() => {
      if (!isDraggingRef.current) return;

      const deltaY = dragStateRef.current.startY - dragStateRef.current.lastY;
      const newHeight = dragStateRef.current.startHeight + deltaY;

      const minHeight = 56;
      const maxHeight = Math.min(400, window.innerHeight * 0.6);

      setTransactionsHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
    });
  }, []);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current) return;

    e.preventDefault();
    const touch = e.touches[0];
    dragStateRef.current.lastY = touch.clientY;

    // Cancel any pending animation frame
    if (dragStateRef.current.frameId) {
      cancelAnimationFrame(dragStateRef.current.frameId);
    }

    // Use requestAnimationFrame for smooth updates
    dragStateRef.current.frameId = requestAnimationFrame(() => {
      if (!isDraggingRef.current) return;

      const deltaY = dragStateRef.current.startY - dragStateRef.current.lastY;
      const newHeight = dragStateRef.current.startHeight + deltaY;

      const minHeight = 56;
      const maxHeight = Math.min(400, window.innerHeight * 0.6);

      setTransactionsHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
    });
  }, []);

  const handleMouseUp = React.useCallback((e?: MouseEvent) => {
    if (!isDraggingRef.current && !isDraggingDesktopRef.current) return;

    // Immediately stop dragging
    isDraggingRef.current = false;
    isDraggingDesktopRef.current = false;

    // Cancel any pending animation frame
    if (dragStateRef.current.frameId) {
      cancelAnimationFrame(dragStateRef.current.frameId);
      dragStateRef.current.frameId = 0;
    }

    // Update state
    setIsDragging(false);
    setIsDraggingDesktop(false);
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    if (!isDraggingRef.current) return;

    // Immediately stop dragging
    isDraggingRef.current = false;

    // Cancel any pending animation frame
    if (dragStateRef.current.frameId) {
      cancelAnimationFrame(dragStateRef.current.frameId);
      dragStateRef.current.frameId = 0;
    }

    // Update state
    setIsDragging(false);
  }, []);

  // Desktop drag handlers for resizing transactions panel
  const handleDesktopMouseDown = (e: React.MouseEvent) => {
    isDraggingDesktopRef.current = true;
    setIsDraggingDesktop(true);
    setIsTransitioning(false);
    dragStateRef.current.startY = e.clientY;
    dragStateRef.current.startHeight = desktopTransactionsHeight;
    dragStateRef.current.lastY = e.clientY;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDesktopMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDraggingDesktopRef.current) return;

    e.preventDefault();
    dragStateRef.current.lastY = e.clientY;

    // Cancel any pending animation frame
    if (dragStateRef.current.frameId) {
      cancelAnimationFrame(dragStateRef.current.frameId);
    }

    // Use requestAnimationFrame for smooth updates
    dragStateRef.current.frameId = requestAnimationFrame(() => {
      if (!isDraggingDesktopRef.current) return;

      const deltaY = dragStateRef.current.startY - dragStateRef.current.lastY;
      const newHeight = dragStateRef.current.startHeight + deltaY;

      const minHeight = 150;
      const maxHeight = window.innerHeight * 0.7;

      setDesktopTransactionsHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
    });
  }, []);

  // Event listeners for mobile drag
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current && !isDraggingDesktopRef.current) {
        handleMouseMove(e);
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDraggingRef.current || isDraggingDesktopRef.current) {
        handleMouseUp(e);
      }
    };

    const handleGlobalMouseDown = (e: MouseEvent) => {
      // Stop dragging when clicking anywhere (including TradingView chart and iframes)
      if (isDraggingRef.current || isDraggingDesktopRef.current) {
        e.preventDefault();
        e.stopPropagation();
        handleMouseUp();
      }
    };

    const handleGlobalClick = (e: MouseEvent) => {
      // Stop dragging when clicking anywhere
      if (isDraggingRef.current || isDraggingDesktopRef.current) {
        e.preventDefault();
        e.stopPropagation();
        handleMouseUp();
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      // Stop dragging on Escape key
      if ((isDraggingRef.current || isDraggingDesktopRef.current) && e.key === 'Escape') {
        e.preventDefault();
        handleMouseUp();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousedown', handleGlobalMouseDown, { capture: true });
      document.addEventListener('click', handleGlobalClick, { capture: true });
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      document.body.style.touchAction = 'none';
      // Prevent pointer events on iframes/embeds during drag
      document.body.style.setProperty('--dragging-pointer-events', 'none');
    } else {
      document.body.style.removeProperty('--dragging-pointer-events');
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousedown', handleGlobalMouseDown, { capture: true });
      document.removeEventListener('click', handleGlobalClick, { capture: true });
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (!isDraggingDesktop) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.body.style.touchAction = '';
      }
      document.body.style.removeProperty('--dragging-pointer-events');
    };
  }, [isDragging, isDraggingDesktop, handleMouseMove, handleTouchMove, handleMouseUp, handleTouchEnd]);

  // Event listeners for desktop drag
  React.useEffect(() => {
    const handleGlobalDesktopMouseMove = (e: MouseEvent) => {
      if (isDraggingDesktopRef.current) {
        handleDesktopMouseMove(e);
      }
    };

    const handleGlobalDesktopMouseUp = (e: MouseEvent) => {
      if (isDraggingDesktopRef.current) {
        handleMouseUp(e);
      }
    };

    const handleGlobalDesktopMouseDown = (e: MouseEvent) => {
      // Stop dragging when clicking anywhere (including TradingView chart)
      if (isDraggingDesktopRef.current) {
        e.preventDefault();
        e.stopPropagation();
        handleMouseUp();
      }
    };

    const handleGlobalDesktopClick = (e: MouseEvent) => {
      // Stop dragging when clicking anywhere
      if (isDraggingDesktopRef.current) {
        e.preventDefault();
        e.stopPropagation();
        handleMouseUp();
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      // Stop dragging on Escape key
      if (isDraggingDesktopRef.current && e.key === 'Escape') {
        e.preventDefault();
        handleMouseUp();
      }
    };

    if (isDraggingDesktop) {
      document.addEventListener('mousemove', handleGlobalDesktopMouseMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalDesktopMouseUp);
      document.addEventListener('mousedown', handleGlobalDesktopMouseDown, { capture: true });
      document.addEventListener('click', handleGlobalDesktopClick, { capture: true });
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
      // Prevent pointer events on iframes/embeds during drag
      document.body.style.setProperty('--dragging-pointer-events', 'none');
    } else {
      document.body.style.removeProperty('--dragging-pointer-events');
    }

    return () => {
      if (dragStateRef.current.frameId) {
        cancelAnimationFrame(dragStateRef.current.frameId);
        dragStateRef.current.frameId = 0;
      }
      document.removeEventListener('mousemove', handleGlobalDesktopMouseMove);
      document.removeEventListener('mouseup', handleGlobalDesktopMouseUp);
      document.removeEventListener('mousedown', handleGlobalDesktopMouseDown, { capture: true });
      document.removeEventListener('click', handleGlobalDesktopClick, { capture: true });
      document.removeEventListener('keydown', handleEscapeKey);
      if (!isDragging) {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
      document.body.style.removeProperty('--dragging-pointer-events');
    };
  }, [isDraggingDesktop, isDragging, handleDesktopMouseMove, handleMouseUp]);

  // Mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set initial transactions height to 30% of screen height
  React.useEffect(() => {
    const initialHeight = window.innerHeight * 0.3;
    setTransactionsHeight(initialHeight);
  }, []);

  // No CSS variable adjustments needed - chart should remain independent of adjustable panel
  React.useEffect(() => {
    // Cleanup any existing CSS variables if they were set previously
    document.documentElement.style.removeProperty('--mobile-recent-inset');
    document.documentElement.style.removeProperty('--mobile-bottom-inset');
    document.documentElement.style.removeProperty('--chart-bottom-offset');
  }, []);

  // Copy to clipboard function
  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedItem(itemId);
        setTimeout(() => setCopiedItem(null), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // Handlers for Buy/Sell buttons
  const handleBuyClick = () => {
    setSelectedTradeTab('buy');
    setIsMobileTradeOpen(true);
  };

  const handleSellClick = () => {
    setSelectedTradeTab('sell');
    setIsMobileTradeOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-[#07040b]">
      {/* Header */}
      <Header />

      {/* Mobile Scrollable Content Container */}
      <div className="lg:hidden flex-1 overflow-y-auto overflow-x-hidden scrollbar-custom">
        {/* Trending Bar - Mobile Only */}
        <TopTrendingTicker />

        {/* Progress Bar - Mobile Only */}
        <div className="bg-[#07040b] px-4 py-2 border-b border-[#daa20b]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#daa20b] text-xs font-semibold tracking-wide">BONDING CURVE</span>
            <span className="text-[#feea88] text-xs font-bold">{tokenData.progress}%</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-gradient-to-r from-[#472303] to-[#5a2d04] border border-[#daa20b]/30 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#ffd700] to-[#daa20b] shadow-lg transition-all duration-700 ease-out"
              style={{
                width: `${tokenData.progress}%`,
                boxShadow: '0 0 8px rgba(255, 215, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Mobile Stats - Token Info and Actions */}
        <MobileStats
          tokenAddress={tokenAddress}
          tokenName={apiInfo?.name}
          tokenSymbol={apiInfo?.symbol}
          marketCap={marketCapFormatted}
          currentPrice={livePrice}
          priceChange24h={typeof apiTokenData?.priceChange24h === 'number' ? apiTokenData.priceChange24h : undefined}
          tokenIconUrl={apiInfo?.image_url ?? undefined}
          telegramUrl={apiInfo?.telegram ?? undefined}
          twitterUrl={apiInfo?.twitter ?? undefined}
          websiteUrl={apiInfo?.website ?? undefined}
          isAudioAvailable={apiTokenData?.tokenInfo?.mp3_url ? true : false}
          isAudioPlaying={isPlaying}
          onToggleAudio={playAudio}
        />

        {/* Mobile Banner - Token Banner Image */}
        <MobileBanner
          bannerUrl={apiInfo?.banner_url ?? undefined}
          tokenName={apiInfo?.name}
        />

        {/* Mobile Token Info - Stats Panel */}
        <MobileTokenInfo
          data={{
            tokenAddress: apiInfo?.token_address,
            tokenSymbol: apiInfo?.symbol,
            marketCap: liveTokenUpdates.marketCap ?? apiTokenData?.marketCap,
            liquidity: liveTokenUpdates.virtualEth ?? apiInfo?.eth_pool,
            circulatingSupply: liveTokenUpdates.circulatingSupply ?? apiInfo?.circulating_supply,
            volume24h: apiTokenData?.volume24h,
            totalSupply: apiInfo?.total_supply,
            graduationCap: apiInfo?.graduation_cap,
            graduated: apiInfo?.graduated,
            createdAt: apiInfo?.inserted_at,
            tokenType: apiInfo?.token_type,
            bondingProgress: bondingPct,
            description: apiInfo?.bio ?? undefined,
            currentMaxTx: maxTxLimits.current,
            finalMaxTx: maxTxLimits.final,
            currentMaxWallet: maxWalletLimits.current,
            finalMaxWallet: maxWalletLimits.final,
            currentTax: apiInfo?.curve_starting_tax ?? apiInfo?.final_tax_rate ?? undefined,
            finalTax: apiInfo?.final_tax_rate ?? apiInfo?.curve_starting_tax ?? undefined,
          }}
        />

        {/* Mobile Chart Section - Full height for visibility */}
        <div className="w-full bg-[#0a0612] px-2 py-3" style={{ minHeight: '500px', height: '70vh' }}>
          <TradingView
            title={apiTokenData?.tokenInfo?.name}
            symbol={apiTokenData?.tokenInfo?.symbol}
            address={tokenAddress ?? undefined}
            timeframe={timeframe}
            onChangeTimeframe={(tf) => setTimeframe(tf)}
            tokenIconUrl={mobileStyleTokenData.logo}
            telegramUrl={apiTokenData?.tokenInfo?.telegram ?? undefined}
            twitterUrl={apiTokenData?.tokenInfo?.twitter ?? undefined}
            websiteUrl={apiTokenData?.tokenInfo?.website ?? undefined}
          />
        </div>

        {/* Mobile Trade History Table - Below Chart */}
        <div className="w-full bg-[#07040b] px-3 py-4 pb-32">
          <MobileTradeHistoryTable
            tokenAddress={tokenAddress}
            tokenData={apiTokenData}
            trades={trades}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>

      <div className="hidden lg:flex flex-1 text-white font-sans overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DesktopSidebar
            expanded={sidebarExpanded}
            setExpanded={setSidebarExpanded}
            tokenAddress={tokenAddress}
            tokenLogoUrl={apiInfo?.image_url ?? undefined}
            apiTokenData={apiTokenData}
            isLoading={isLoading}
          />
        </div>

        <main
          className="flex-1 p-[8px] overflow-hidden flex flex-col gap-[8px]"
          style={{
            paddingBottom: '8px',
            height: isMobile ? 'calc(100vh - 56px)' : '100%'
          }}
        >
          {/* Content row: Left chart area + Right token card panel */}
          <div className="flex flex-1 gap-[8px] overflow-hidden">
            {/* Left Column - Chart and Recent Transactions */}
            <div className="flex-1 flex flex-col gap-[8px] overflow-y-auto overflow-x-hidden scrollbar-custom">
              {/* Top trending bar (desktop only) within left column only */}
              <div className="hidden md:block">
                <TopTrendingTicker />
              </div>
              {/* Trading Chart flanked by vertical trending tickers */}
              <div className="flex-1 min-h-[500px] overflow-hidden">
                <div className="h-full w-full flex items-stretch gap-0">
                  {/* Left vertical ticker (temporarily disabled)
                  <div className="hidden lg:flex flex-none">
                    <VerticalTokenTicker direction="up" className="w-fit" />
                  </div>
                  */}

                  {/* Chart fills remaining space with no gap */}
                  <div className="flex-1 min-h-0 relative">
                    <TradingView
                      title={apiTokenData?.tokenInfo?.name}
                      symbol={apiTokenData?.tokenInfo?.symbol}
                      address={tokenAddress ?? undefined}
                      timeframe={timeframe}
                      onChangeTimeframe={(tf) => setTimeframe(tf)}
                      tokenIconUrl={mobileStyleTokenData.logo}
                      telegramUrl={apiTokenData?.tokenInfo?.telegram ?? undefined}
                      twitterUrl={apiTokenData?.tokenInfo?.twitter ?? undefined}
                      websiteUrl={apiTokenData?.tokenInfo?.website ?? undefined}
                    />
                  </div>

                  {/* Right vertical ticker (temporarily disabled)
                  <div className="hidden lg:flex flex-none">
                    <VerticalTokenTicker direction="down" className="w-fit" />
                  </div>
                  */}
                </div>
              </div>

              {/* Recent Transactions Panel (desktop only) */}
              <div
                className="hidden lg:block"
                style={{
                  flexShrink: 0
                }}>
                <div style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box'
                }}>
                  {/* Content Area */}
                  <div style={{ flex: 1 }}>
                    {showLimitOrders ? (
                      <CompactLimitOrderBook
                        orders={orderManagement.orders}
                        tokenAddress={tokenAddress ?? undefined}
                        onCancelOrder={handleOrderCancel}
                        onModifyOrder={handleOrderModify}
                        loading={orderManagement.loading}
                        error={orderManagement.error ?? undefined}
                        showToggle={true}
                        showLimitOrders={showLimitOrders}
                        onToggleChange={setShowLimitOrders}
                        isMobile={false}
                      />
                    ) : (
                      <TradeHistory
                        tokenAddress={tokenAddress}
                        tokenData={apiTokenData}
                        trades={trades}
                        isLoading={isLoading}
                        error={error}
                        showToggle={true}
                        showLimitOrders={showLimitOrders}
                        onToggleChange={setShowLimitOrders}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Token Card and Trade Panel (desktop only) */}
            <div
              className={`hidden lg:flex flex-col gap-[8px] overflow-y-auto overflow-x-hidden scrollbar-custom ${desktopTradeTab === 'limit' ? 'w-[360px]' : 'w-[350px]'}`}
              style={{
                transition: 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                flexShrink: 0,
                height: '100%'
              }}
            >
              {/* Token Card */}
              <div className="flex justify-center items-center overflow-hidden" style={{ flexShrink: 0, height: 'auto' }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '420px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MobileStyleTokenCard
                    tokenData={mobileStyleTokenData}
                    isLoading={!apiTokenData}
                    isAudioPlaying={isPlaying}
                    isAudioAvailable={!!apiTokenData?.tokenInfo?.mp3_url}
                    onToggleAudio={playAudio}
                  />
                </div>
              </div>

              {/* Trade Panel */}
              <div style={{
                flex: '1 0 auto',
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <TradePanel
                  onTabChange={(tab) => setDesktopTradeTab(tab)}
                  tokenAddress={tokenAddress}
                  apiTokenData={apiTokenData}
                />
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* Recent Transactions Widget (Mobile Only) - Bottom slide-up panel - COMMENTED OUT FOR NOW
      <div
        className="lg:hidden fixed left-0 right-0 z-30"
        style={{
          bottom: '68px',
          height: `${transactionsHeight}px`,
          background: 'linear-gradient(180deg, #572501, #572501 10%, var(--ab-bg-500) 58%, var(--ab-bg-400) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
          borderTop: '1px solid rgba(255, 215, 165, 0.4)',
          boxShadow: isDragging
            ? '0 -8px 24px rgba(0, 0, 0, 0.3), 0 -2px 8px rgba(254, 234, 136, 0.2)'
            : '0 -4px 12px rgba(0, 0, 0, 0.2)',
          transition: 'box-shadow 150ms ease'
        }}
      >
        Drag Handle / Expand Button (Mobile Only)
        <div
          className={`absolute top-0 left-0 right-0 h-12 cursor-row-resize flex items-center justify-center group`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={() => {
            if (transactionsHeight < 100 && !isDraggingRef.current) {
              setTransactionsHeight(window.innerHeight * 0.35);
              if (navigator.vibrate) navigator.vibrate(10);
            }
          }}
          style={{
            zIndex: 10,
            touchAction: 'none',
            background: isDragging
              ? 'linear-gradient(180deg, rgba(255, 215, 165, 0.15), rgba(255, 215, 165, 0.05))'
              : 'transparent',
            transition: 'background 150ms ease'
          }}
        >
          {transactionsHeight < 100 ? (
            // Collapsed state - enhanced button design
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(254, 234, 136, 0.2), rgba(254, 234, 136, 0.1))',
                border: '1px solid rgba(254, 234, 136, 0.3)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                color: '#feea88',
                transition: 'all 200ms ease'
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'
                }}
              >
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
              <span className="text-xs font-bold tracking-wide" style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}>RECENT TRANSACTIONS</span>
            </div>
          ) : (
            // Expanded state - enhanced drag handle
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="rounded-full"
                style={{
                  width: isDragging ? '72px' : '56px',
                  height: '4px',
                  background: isDragging
                    ? 'linear-gradient(90deg, rgba(254, 234, 136, 0.4), rgba(254, 234, 136, 0.9), rgba(254, 234, 136, 0.4))'
                    : 'rgba(255, 215, 165, 0.5)',
                  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isDragging
                    ? '0 0 12px rgba(254, 234, 136, 0.5), 0 2px 4px rgba(0, 0, 0, 0.2)'
                    : '0 1px 2px rgba(0, 0, 0, 0.2)'
                }}
              />
              {isDragging && (
                <div
                  className="text-[10px] font-bold tracking-wide"
                  style={{
                    color: 'rgba(254, 234, 136, 0.9)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                    animation: 'fadeIn 150ms ease-in'
                  }}
                >
                  DRAG TO RESIZE
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="h-full flex flex-col"
          style={{
            display: transactionsHeight < 100 ? 'none' : 'flex',
            padding: '12px 16px 12px 16px',
            paddingTop: '48px' // Extra top padding for mobile drag handle
          }}
        >
          Content Area - Recent Transactions Only
          <div className="flex-1 overflow-hidden">
            <TradeHistory
              tokenAddress={tokenAddress}
              tokenData={apiTokenData}
              trades={trades}
              isLoading={isLoading}
              error={error}
              showToggle={false}
              showLimitOrders={false}
              onToggleChange={undefined}
              isMobile={true}
            />
          </div>
        </div>
      </div>
      */}

      {/* Fixed Buy/Sell bar for mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        {/* Fading overlay at the top with subtle blur - gradually fades away */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: 0,
          right: 0,
          height: '41px',
          background: 'linear-gradient(to bottom, rgba(7, 4, 11, 0) 0%, rgba(7, 4, 11, 0.1) 30%, rgba(7, 4, 11, 0.4) 70%, rgba(7, 4, 11, 0.8) 90%, rgba(71, 35, 3, 0.5) 100%)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40%, black 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        <div className="bg-gradient-to-t from-[#472303] to-[#5a2d04]" style={{ borderTop: '1px solid rgba(218, 162, 11, 0.12)' }}>
          <div className="px-3 py-3 flex items-center gap-2 max-w-screen-md mx-auto" style={{ height: '68px' }}>
            <button onClick={handleBuyClick} type="button" className="flex-1" style={{ padding: '4px' }}>
              <div style={{
                background: 'linear-gradient(180deg, #6ef0a1, #34d37a 60%, #23bd6a)',
                borderRadius: '12px',
                textAlign: 'center',
                fontWeight: 800,
                color: '#1f2937',
                letterSpacing: '0.5px',
                fontSize: '13px',
                boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -6px 12px rgba(0,0,0,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '36px'
              }}>BUY</div>
            </button>
            <button onClick={handleSellClick} type="button" className="flex-1" style={{ padding: '4px' }}>
              <div style={{
                background: 'linear-gradient(180deg, #ffb1a6, #ff7a6f 60%, #ff5b58)',
                borderRadius: '12px',
                textAlign: 'center',
                fontWeight: 800,
                color: '#2b1b14',
                letterSpacing: '0.5px',
                fontSize: '13px',
                boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -6px 12px rgba(0,0,0,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '36px'
              }}>SELL</div>
            </button>
            <button
              onClick={() => setMobileSidebarExpanded(true)}
              type="button"
              className="flex-shrink-0"
              title="Open Widgets"
              style={{ padding: '4px', width: '48px' }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  background: 'linear-gradient(180deg, #ffd700, #daa20b 60%, #b8860b)',
                  borderRadius: '12px',
                  boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -6px 12px rgba(0,0,0,0.18)',
                  width: '100%',
                  height: '36px'
                }}
              >
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile trade modal */}
      {isMobileTradeOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <MobileBuySellPanel
            orderType={selectedTradeTab}
            tokenAddress={tokenAddress}
            apiTokenData={apiTokenData}
            onClose={() => setIsMobileTradeOpen(false)}
          />
        </div>
      )}

      {/* Mobile Widgets Panel */}
      <MobileBottomBar
        expanded={mobileSidebarExpanded}
        setExpanded={setMobileSidebarExpanded}
        tokenAddress={tokenAddress}
        tokenLogoUrl={apiInfo?.image_url ?? undefined}
        apiTokenData={apiTokenData}
        isLoading={isLoading}
      />

      {/* Order Notifications */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
        {notifications.notifications.map((notification, index) => (
          <div key={notification.id} style={{ marginBottom: index < notifications.notifications.length - 1 ? '12px' : '0' }}>
            <OrderNotification
              notification={notification}
              onClose={() => notifications.removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>

      {/* Hidden audio player for token audio */}
      <audio
        ref={mp3PlayerRef}
        style={{ display: 'none' }}
        controls={false}
        preload="auto"
        autoPlay={true}
        loop={true}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Hidden SoundCloud Widget iframe API */}
      <iframe
        id="sc-widget"
        ref={scWidgetRef}
        title="SoundCloud Widget"
        style={{ display: 'none' }}
        src="https://w.soundcloud.com/player/?url=about:blank&visual=false&show_comments=false"
        allow="autoplay"
      />
      <Script
        src="https://w.soundcloud.com/player/api.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('[SC] SoundCloud Widget API script loaded successfully');
        }}
        onError={() => {
          console.error('[SC] Failed to load SoundCloud Widget API script');
        }}
      />
    </div>
  );
}
