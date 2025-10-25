// app/lib/tradingview/datafeed.ts
// A lightweight TradingView Charting Library datafeed implementation adapted from reference.

import { io, type Socket } from 'socket.io-client';

export interface MakeDatafeedOptions {
  restBaseUrl: string;
  socketUrl: string;
  timezone?: string;
  session?: string; // e.g. '24x7'
  priceScale?: number; // e.g. 1e8 for tiny-priced tokens
  historyLimit?: number;
  debug?: boolean;
  metaResolver?: (address: string) => Promise<{ symbol: string; name: string } | null> | ({ symbol: string; name: string } | null);
}

function nowStr() {
  return new Date().toISOString().replace('T', ' ').slice(0, 23);
}

function mkLogger(ns: string, on = true) {
  const wrap = (fn: (...a: any[]) => void) => (...a: any[]) => { if (on) try { fn(`[${nowStr()}] [${ns}]`, ...a); } catch {} };
  return {
    log: wrap(console.log.bind(console)),
    warn: wrap(console.warn.bind(console)),
    error: wrap(console.error.bind(console)),
    group: wrap((console as any).groupCollapsed?.bind(console) ?? console.log.bind(console)),
    groupEnd: wrap((console as any).groupEnd?.bind(console) ?? (() => {})),
  };
}

const HEX40 = /^0x[a-fA-F0-9]{40}$/;

function toMs(x: any): number | undefined {
  const n = Number(x);
  if (!Number.isFinite(n)) return undefined;
  return n > 1e12 ? Math.floor(n) : Math.floor(n * 1000);
}

function normalizeBars(rows: any[], L?: ReturnType<typeof mkLogger>) {
  const out: any[] = [];
  for (const r of rows || []) {
    const t = toMs((r as any).timestamp ?? (r as any).ts ?? (r as any).time);
    const o = +r.open, h = +r.high, l = +r.low, c = +r.close;
    const v = (r as any).volume != null ? +((r as any).volume) : undefined;
    if (Number.isFinite(t) && [o, h, l, c].every(Number.isFinite)) {
      out.push({ time: t, open: o, high: h, low: l, close: c, volume: Number.isFinite(v) ? v : undefined });
    }
  }
  out.sort((a, b) => a.time - b.time);
  if (!out.length) L?.warn?.('normalizeBars -> 0 valid bars from payload');
  return out;
}

export function makeTVDatafeed(opts: MakeDatafeedOptions) {
  const {
    restBaseUrl,
    socketUrl,
    timezone = 'Etc/UTC',
    session = '24x7',
    priceScale = 1e8,
    historyLimit = 1000,
    debug = false,
    metaResolver,
  } = opts;

  const L = mkLogger('DF', debug);

  // Limit how many history fetches TV can trigger per symbol+resolution
  const MAX_HISTORY_REQUESTS = 2;
  const historyRequestBudget = new Map<string, number>(); // `${addr}|${resolution}` -> count
  const historyCache = new Map<string, { bars: any[]; ts: number }>();
  const pendingHistory = new Map<string, Promise<any[]>>();
  const CACHE_TTL_MS = 30_000;

  const diag: { socket: Socket | null; subs: Map<string, { address: string; resolution: string; onRealtimeCallback: (bar: any) => void; lastTs?: number; lastBar?: any }>; } = {
    socket: null,
    subs: new Map(),
  };

  if (typeof window !== 'undefined') {
    (window as any).tvDiag = diag;
  }

  function ensureSocket() {
    if (diag.socket?.connected) return;
    if (diag.socket) {
      try { diag.socket.disconnect(); } catch {}
    }
    const ws = io(socketUrl, { transports: ['websocket'], reconnection: true, secure: true } as any);
    diag.socket = ws as any;

    ws.on('connect', () => {
      L.log('WS connected', (ws as any).id);
      for (const [, sub] of diag.subs) {
        try { (ws as any).emit('subscribe', { tokenAddress: sub.address, resolution: String(sub.resolution) }); } catch {}
      }
    });
    ws.on('disconnect', (reason: any) => L.warn('WS disconnect', reason));
    ws.on('connect_error', (err: any) => L.error('WS connect_error', err?.message || err));
    ws.on('error', (err: any) => L.error('WS error', err?.message || err));

    ws.on('chartUpdate', (msg: any) => {
      const addr = String(msg?.address ?? msg?.token ?? msg?.candle?.token ?? '').toLowerCase();
      const c = msg?.candle;
      if (!HEX40.test(addr) || !c) return;

      const bar = {
        time: toMs(c.timestamp ?? c.ts ?? c.time),
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
        volume: c.volume != null ? Number(c.volume) : undefined,
      };
      if (!Number.isFinite(bar.time) || !Number.isFinite(bar.close)) return;

      const eventResolution = String(msg?.resolution ?? msg?.timeframe ?? '1');

      for (const [uid, sub] of diag.subs) {
        if (sub.address !== addr) continue;
        if (String(sub.resolution) !== eventResolution) continue;
        if (Number.isFinite(sub.lastTs) && (bar.time as number) < (sub.lastTs as number)) continue;
        sub.lastTs = bar.time as number;
        sub.lastBar = bar;
        try { sub.onRealtimeCallback(bar); } catch (e) { L.error('onRealtime failed', e); }
      }
    });
  }

  async function fetchHistory(address: string) {
    // Try multiple endpoints to match different backends
    const baseNoTrailing = restBaseUrl.replace(/\/$/, '');
    const baseWithoutApi = baseNoTrailing.replace(/\/?api\/?$/, '');
    const candidates = [
      `${baseWithoutApi}/api/token/${encodeURIComponent(address)}/chart?timeframe=1m&limit=500`,
      `${baseNoTrailing}/token/${encodeURIComponent(address)}/chart?timeframe=1m&limit=500`,
      `${baseNoTrailing}/api/token/${encodeURIComponent(address)}/chart?timeframe=1m&limit=500`,
    ];

    let lastErr: any = null;
    for (const url of candidates) {
      try {
        const r = await fetch(url, { credentials: 'omit' });
        if (!r.ok) { lastErr = new Error(`HTTP ${r.status} for ${url}`); continue; }
        let payload: any;
        try { payload = await r.json(); } catch { payload = JSON.parse(await r.text()); }
        const rows = payload?.candles || payload?.data || payload || [];
        const bars = normalizeBars(rows, L);
        if (bars.length) return bars;
        // If empty, try next candidate
        lastErr = new Error('Empty bars');
      } catch (e) {
        lastErr = e;
      }
    }
    // If all failed, throw last error
    throw (lastErr ?? new Error('history failed'));
  }

  async function resolveMeta(address: string): Promise<{ symbol: string; name: string }> {
    try {
      const maybe = await Promise.resolve(metaResolver?.(address));
      if (maybe && typeof maybe.symbol === 'string') return maybe;
    } catch {}
    // Fallback: short address
    const short = `${address.slice(0, 6)}…${address.slice(-4)}`;
    return { symbol: short, name: short };
  }

  return {
    onReady(cb: (conf: any) => void) {
      L.log('onReady()');
      setTimeout(() => {
        cb({
          supports_search: false,
          supports_group_request: false,
          supports_marks: false,
          supports_timescale_marks: false,
          supports_time: true,
          supported_resolutions: ['1', '5', '15', '60', '240', '1440'],
        });
      }, 0);
    },

    resolveSymbol(symbol: string, onResolve: (info: any) => void, onError: (reason: string) => void) {
      (async () => {
        try {
          const address = String(symbol || '').trim().toLowerCase();
          if (!HEX40.test(address)) throw new Error('Symbol must be a 0x-address (40 hex chars).');
          const meta = await resolveMeta(address);
          const display = meta.symbol || `${address.slice(0, 6)}…${address.slice(-4)}`;
          onResolve({
            name: display,
            symbol, display,
            ticker: address,
            description: display,
            type: 'crypto',
            session,
            timezone,
            minmov: 1,
            pricescale: priceScale,
            has_intraday: true,
            has_no_volume: false,
            supported_resolutions: ['1', '5', '15', '60', '240', '1440'],
            data_status: 'streaming',
            volume_precision: 6,
          });
        } catch (e: any) {
          onError?.(e?.message || 'resolveSymbol failed');
        }
      })();
    },

    async getBars(symbolInfo: any, resolution: string, periodParams: any, onResult: (bars: any[], meta: { noData?: boolean; nextTime?: number }) => void, onError: (reason: string) => void) {
      const addr = String(symbolInfo?.ticker || '').toLowerCase();
      const G = mkLogger('DF.getBars', debug);
      G.group('getBars()', { addr, resolution, periodParams });

      const budgetKey = `${addr}|${resolution}`;
      const used = historyRequestBudget.get(budgetKey) ?? 0;
      const isFirst = !!(periodParams && periodParams.firstDataRequest);

      // If this isn't the initial request, tell TV there is no more data to backfill.
      if (!isFirst) {
        G.log('Backfill request -> stop with noData');
        onResult([], { noData: true });
        G.groupEnd();
        return;
      }

      if (used >= MAX_HISTORY_REQUESTS) {
        G.warn('Max history requests reached for key', budgetKey);
        onResult([], { noData: true });
        G.groupEnd();
        return;
      }

      try {
        const cacheKey = `${addr}|${resolution}`;
        const now = Date.now();

        // Serve from cache if fresh
        const cached = historyCache.get(cacheKey);
        if (cached && (now - cached.ts) < CACHE_TTL_MS) {
          G.log(`Cache hit (${cached.bars.length} bars)`);
          onResult(cached.bars, { noData: false });
          historyRequestBudget.set(budgetKey, used + 1);
          return;
        }

        // Coalesce concurrent fetches
        let promise = pendingHistory.get(cacheKey);
        if (!promise) {
          promise = fetchHistory(addr);
          pendingHistory.set(cacheKey, promise);
        }
        const bars = await promise;
        pendingHistory.delete(cacheKey);

        if (!bars.length) {
          onResult([], { noData: true });
          G.log('getBars -> 0 bars (noData=true)');
          return;
        }

        historyCache.set(cacheKey, { bars, ts: now });

        if (bars.length < 10) {
          onResult(bars, { noData: false });
          G.log(`getBars -> ${bars.length} bars (tiny set, stop backfill)`);
        } else {
          onResult(bars, { noData: false });
          G.log(`getBars -> ${bars.length} bars`);
        }

        historyRequestBudget.set(budgetKey, used + 1);
      } catch (e: any) {
        G.error('getBars error', e?.message || e);
        onError?.(e?.message || 'history failed');
      } finally {
        G.groupEnd();
      }
    },

    subscribeBars(symbolInfo: any, resolution: string, onRealtimeCallback: (bar: any) => void, subscriberUID: string) {
      const addr = String(symbolInfo?.ticker || '').toLowerCase();
      const S = mkLogger('DF.subscribe', debug);
      S.group('subscribeBars()', { addr, resolution, subscriberUID });
      try {
        ensureSocket();
        diag.subs.set(subscriberUID, { address: addr, resolution, onRealtimeCallback, lastTs: undefined });
        if (diag.socket?.connected) {
          try { diag.socket.emit('subscribe', { tokenAddress: addr, resolution: String(resolution) }); } catch {}
          S.log('WS subscribe sent', { addr, resolution: String(resolution) });
        } else {
          S.warn('WS not connected yet; will subscribe on connect');
        }
      } catch (e: any) {
        S.error('subscribeBars error', e?.message || e);
      } finally {
        S.groupEnd();
      }
    },

    unsubscribeBars(subscriberUID: string) {
      const U = mkLogger('DF.unsubscribe', debug);
      U.group('unsubscribeBars()', { subscriberUID });
      try {
        const sub = diag.subs.get(subscriberUID);
        if (sub && diag.socket?.connected) {
          try { diag.socket.emit('unsubscribe', { tokenAddress: sub.address, resolution: String(sub.resolution) }); } catch {}
          U.log('WS unsubscribe sent', { address: sub.address, resolution: String(sub.resolution) });
        }
        diag.subs.delete(subscriberUID);
        if (!diag.subs.size) {
          try { diag.socket?.disconnect?.(); } catch {}
          diag.socket = null as any;
          U.log('No subscribers left; WS closed');
        }
      } catch (e: any) {
        U.error('unsubscribeBars error', e?.message || e);
      } finally {
        U.groupEnd();
      }
    },

    getServerTime(cb: (t: number) => void) {
      cb(Math.floor(Date.now() / 1000));
    },
  };
}
