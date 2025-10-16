import { CandlestickDataPoint, TradeHistoryItem } from './types';

// Mock Data for Candlestick Chart
export const candlestickData: CandlestickDataPoint[] = [
  { time: 1, open: 11000, high: 11500, low: 10800, close: 11200, volume: 100 },
  { time: 2, open: 11200, high: 12000, low: 11100, close: 11800, volume: 150 },
  { time: 3, open: 11800, high: 12200, low: 11700, close: 12100, volume: 120 },
  { time: 4, open: 12100, high: 13000, low: 12050, close: 12900, volume: 200 },
  { time: 5, open: 12900, high: 13500, low: 12800, close: 13200, volume: 180 },
  { time: 6, open: 13200, high: 14000, low: 13100, close: 13900, volume: 250 },
  { time: 7, open: 13900, high: 14100, low: 13800, close: 14000, volume: 130 },
  { time: 8, open: 14000, high: 15500, low: 13950, close: 15200, volume: 300 },
  { time: 9, open: 15200, high: 16000, low: 15100, close: 15800, volume: 280 },
  { time: 10, open: 15800, high: 17000, low: 15700, close: 16900, volume: 350 },
  { time: 11, open: 16900, high: 17200, low: 16800, close: 17000, volume: 210 },
  { time: 12, open: 17000, high: 19000, low: 16900, close: 18800, volume: 400 },
  { time: 13, open: 18800, high: 21800, low: 18700, close: 21500, volume: 500 },
  { time: 14, open: 21500, high: 21600, low: 18000, close: 18200, volume: 450 },
];

// Mock Data for the Trade History Table
export const tradeHistoryData: TradeHistoryItem[] = [
  { id: 1, asset: 'BTC/USDT', type: 'Buy', amount: 0.05, price: 68050.50, status: 'Filled', time: '10:45:12' },
  { id: 2, asset: 'ETH/USDT', type: 'Sell', amount: 1.2, price: 3550.75, status: 'Filled', time: '10:42:55' },
  { id: 3, asset: 'SOL/USDT', type: 'Buy', amount: 15, price: 165.20, status: 'Pending', time: '10:40:30' },
  { id: 4, asset: 'BTC/USDT', type: 'Buy', amount: 0.02, price: 68045.00, status: 'Filled', time: '10:38:01' },
  { id: 5, asset: 'ADA/USDT', type: 'Sell', amount: 500, price: 0.45, status: 'Cancelled', time: '10:35:19' },
  { id: 6, asset: 'ETH/USDT', type: 'Buy', amount: 0.5, price: 3548.10, status: 'Filled', time: '10:33:45' },
]; 