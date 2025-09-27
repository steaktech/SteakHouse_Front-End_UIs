// types/token.ts

export interface Token {
    // Base Fields - Updated to match getFilteredTokens API response
    token_address: string;
    virtual_token_address: string;
    real_token_address: string | null;
    graduated: boolean;
    graduation_timestamp: string | null;
    creator: string;
    name: string;
    symbol: string;
    total_supply: string;
    token_type: number | null;
    graduation_cap: string;
    tax_wallet: string | null;
    steakhouse_treasury_basic: string | null;
    curve_starting_tax: string | null;
    curve_tax_duration: string | null;
    curve_max_wallet: string | null;
    curve_max_wallet_duration: string | null;
    curve_max_tx: string | null;
    curve_max_tx_duration: string | null;
    final_tax_rate: string | null;
    lp_lock_duration: string | null;
    burn_lp: boolean;
    start_time: string | null;
    is_stealth: boolean;
    is_super_simple: boolean;
    is_zero_simple: boolean;
    is_advanced: boolean;
    tax_drop_step: string | null;
    tax_drop_interval: string | null;
    max_wallet_step: string | null;
    max_wallet_interval: string | null;
    max_tx_step: string | null;
    max_tx_interval: string | null;
    limit_removal_time: string | null;
    eth_pool: string;
    circulating_supply: string;
    created_at_block: string | null;
    created_at_timestamp: string;
    inserted_at: string; // ISO 8601 date string
    updated_at: string; // ISO 8601 date string
    image_url: string | null;
    banner_url?: string | null;
    bio: string | null;
    telegram: string | null;
    twitter: string | null;
    website: string | null;
    catagory: string | null;
  
    // Derived Fields - Now included in getFilteredTokens response
    age_hours: string;
    volume_24h: string;
    market_cap: string;
    tax_rate: string | null;
    price_change_24h: number | null;
    progress: number;
}

// Paginated API response structure - Updated to match new API format
export interface PaginatedTokenResponse {
    page: number;
    page_size: number;
    has_more: boolean;
    next_page: number | null;
    prev_page: number | null;
    items: Token[];
}
  
export interface Trade {
  type: 'BUY' | 'SELL';
  token: string;
  name: string;
  symbol: string;
  total_supply: number | string;
  trader: string;
  amountEth: number;
  amountTokens: number;
  price: number;
  usdValue: string | number;
  marketCap: number;
  txHash: string;
  virtualEth?: number;
  circulatingSupply?: number;
  timestamp: number;
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Full token data API response interface
export interface FullTokenDataResponse {
  token: string;
  price: number;
  marketCap: number;
  lastTrade: Trade;
  recentTrades: Trade[];
  candles: Candle[];
  interval: string;
}

// WebSocket Event Types
export interface WebSocketTrade {
  type: 'BUY' | 'SELL';
  token: string;
  name: string;
  symbol: string;
  total_supply: number;
  trader: string;
  amountEth: number;
  amountTokens: number;
  price: number;
  usdValue: number;
  marketCap: number;
  txHash: string;
  virtualEth: number;
  circulatingSupply: number;
  timestamp: number;
}

export interface WebSocketCandle {
  token: string;
  timestamp: number;
  open: string;
  high: number;
  low: number;
  close: string;
  volume: number;
}

export interface ChartUpdateEvent {
  timeframe: string;
  candle: WebSocketCandle;
}

// Trending Token WebSocket Types
export interface TrendingToken {
  token_address: string;
  trending_score: number;
  symbol: string;
  image_url: string | null;
  price_change_24h: number;
}

export interface TrendingSnapshot {
  tokens: TrendingToken[];
  timestamp: number;
}