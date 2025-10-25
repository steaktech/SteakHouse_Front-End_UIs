// app/types/tradingview.d.ts
export {};

declare global {
  interface Window {
    TradingView: any;
    tvWidget?: any;
    __TV_BASE__?: string;
  }
}
