# WebSocket Chart Update Fix for Fresh Tokens

## Problem Description

When visiting a fresh token page (newly created token with no trading history), the TradingView chart would appear empty even though WebSocket updates were being received. The error `[DF.getBars] "getBars error" "Empty bars"` would appear in the console, and the chart wouldn't display until after a page refresh.

## Root Cause Analysis

1. **Empty Initial Data**: Fresh tokens have no historical candle data, so the API returns an empty candles array `[]`
2. **TradingView noData Flag**: The datafeed was setting `noData: true` when receiving empty bars, which tells TradingView "this symbol has no data and never will"
3. **WebSocket Updates Ignored**: Even though WebSocket updates were coming in correctly, TradingView wouldn't display them because it believed the symbol had no data
4. **Cache Not Updated**: The empty cache wasn't being populated with the first real-time bar from WebSocket

## Solution Implemented

### 1. Datafeed Changes (`app/lib/tradingview/datafeed.ts`)

#### A. Modified `getBars` to handle empty history gracefully:
```typescript
// OLD: Returned noData:true for empty bars, blocking real-time updates
if (!bars.length) {
  onResult([], { noData: true });
  return;
}

// NEW: Returns noData:false to allow real-time updates
if (!bars.length) {
  G.log('getBars -> 0 bars (fresh token, awaiting real-time data)');
  onResult([], { noData: false });
  historyRequestBudget.set(budgetKey, used + 1);
  return;
}
```

#### B. Enhanced error handling for "Empty bars" errors:
```typescript
catch (e: any) {
  const msg = e?.message || '';
  if (msg.includes('Empty bars')) {
    G.log('getBars -> Empty bars from API (fresh token, awaiting real-time data)');
    onResult([], { noData: false });  // Allow real-time updates
    historyRequestBudget.set(budgetKey, used + 1);
  } else {
    G.error('getBars error', msg || e);
    onError?.(msg || 'history failed');
  }
}
```

#### C. Cache empty results to prevent repeated API calls:
```typescript
// Cache the result even if empty, so we don't keep retrying
historyCache.set(cacheKey, { bars, ts: now });
```

#### D. Populate cache with first WebSocket bar for fresh tokens:
```typescript
ws.on('chartUpdate', (msg: any) => {
  // ... validation code ...
  
  for (const [uid, sub] of diag.subs) {
    // ... matching logic ...
    
    // Update the cache with the new bar for fresh tokens
    const cacheKey = `${addr}|${sub.resolution}`;
    const cached = historyCache.get(cacheKey);
    if (cached && cached.bars.length === 0) {
      // For fresh tokens with no history, add this first bar to cache
      L.log('Adding first bar to empty cache for fresh token', { addr, bar });
      cached.bars.push(bar);
      cached.ts = Date.now();
    }
    
    // ... callback code ...
  }
});
```

### 2. TradingChart Component Changes (`app/components/TradingChart/TradingChart.tsx`)

#### A. Better handling of empty API responses:
```typescript
if (Array.isArray(apiTokenData.candles)) {
  setCandles1m(apiTokenData.candles);
  console.log('[TradingChart] Set candles from API:', apiTokenData.candles.length, 'candles');
} else {
  // Fresh token with no history - set empty array and wait for WebSocket
  console.log('[TradingChart] No candles from API (fresh token), awaiting WebSocket data');
  setCandles1m([]);
}
```

#### B. Initialize empty trades array:
```typescript
if (Array.isArray(tradesArray)) {
  console.log('[TradingChart] Setting trades:', tradesArray.length, 'trades');
  setTrades(tradesArray);
} else {
  console.warn('[TradingChart] No trades found in API response');
  setTrades([]);  // Initialize empty for fresh tokens
}
```

#### C. Enhanced WebSocket chart update handler:
```typescript
setCandles1m(prev => {
  // For fresh tokens with no candles, this is the first bar
  if (!prev || prev.length === 0) {
    console.log('[WS] Adding first candle for fresh token:', newCandle);
    return [newCandle];
  }
  
  // ... existing update logic ...
});
```

## How It Works Now

1. **Initial Load**: When visiting a fresh token page:
   - API returns empty candles array `[]`
   - Datafeed returns `[]` with `noData: false` (telling TradingView "no history yet, but data may come")
   - Chart displays empty but ready for real-time data
   - WebSocket connection established

2. **First Trade/Update**: When the first trade happens:
   - WebSocket receives `chartUpdate` event
   - Handler adds the first candle to local state
   - Handler updates the empty cache with first bar
   - Handler calls TradingView's `onRealtimeCallback` with the new bar
   - Chart displays the first candle immediately

3. **Subsequent Updates**: All following updates work normally:
   - WebSocket updates come in
   - Existing candles are updated or new ones appended
   - TradingView chart updates in real-time
   - Cache stays populated for any refresh scenarios

## Testing Recommendations

1. **Fresh Token**: Create a new token and visit its chart page immediately
   - Chart should show empty but not throw errors
   - First trade should appear on chart immediately
   - Subsequent trades should update smoothly

2. **Refresh After First Trade**: After first trade appears, refresh the page
   - Should load the single bar from API
   - Real-time updates should continue working

3. **Established Token**: Visit a token with existing history
   - Should load historical data normally
   - Real-time updates should work as before

## Key Changes Summary

- ✅ `noData: false` for empty bars (allows real-time updates)
- ✅ Cache empty results to prevent repeated API calls
- ✅ Populate cache with first WebSocket bar
- ✅ Better logging for debugging fresh token scenarios
- ✅ Initialize empty arrays for fresh tokens
- ✅ Enhanced error handling for "Empty bars" errors

## No Breaking Changes

All changes are backward compatible:
- Existing tokens with history work exactly as before
- Only affects the edge case of fresh tokens with no history
- Error handling is more robust, not less
