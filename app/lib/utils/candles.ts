// app/lib/utils/candles.ts
import type { Candle } from '@/app/types/token';

// Map timeframe string to minutes
function timeframeToMinutes(tf: string): number {
  switch (tf.toLowerCase()) {
    case '1m': return 1;
    case '5m': return 5;
    case '15m': return 15;
    case '1h': return 60;
    case '4h': return 240;
    case '1d':
    case '1day':
    case '24h': return 1440;
    default: return 1;
  }
}

// Floor a timestamp (ms) to the start of the bucket in ms
function floorToBucket(tsMs: number, minutes: number): number {
  const bucketMs = minutes * 60 * 1000;
  return Math.floor(tsMs / bucketMs) * bucketMs;
}

/**
 * Aggregate a series of 1m candles into a larger timeframe.
 * - Assumes input candles are sorted by timestamp ascending.
 * - If timeframe is '1m' or invalid, returns the input.
 */
export function aggregateCandles(candles: Candle[], timeframe: string): Candle[] {
  const mins = timeframeToMinutes(timeframe);
  if (mins <= 1 || !Array.isArray(candles) || candles.length === 0) return candles ?? [];

  const result: Candle[] = [];
  let currentBucketStart = -1;
  let agg: Candle | null = null;

  for (const c of candles) {
    const bucketStart = floorToBucket(c.timestamp, mins);
    if (bucketStart !== currentBucketStart) {
      // push previous agg
      if (agg) result.push(agg);
      // start new bucket with this candle
      agg = {
        timestamp: bucketStart,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      };
      currentBucketStart = bucketStart;
    } else if (agg) {
      // extend existing bucket
      agg.high = Math.max(agg.high, c.high);
      agg.low = Math.min(agg.low, c.low);
      agg.close = c.close;
      agg.volume += c.volume;
    }
  }

  if (agg) result.push(agg);
  return result;
}
