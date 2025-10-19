export interface TokenTransaction {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  imageUrl?: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdraw';
  amount: number;
  priceUSD: number;
  totalValueUSD: number;
  timestamp: Date;
  txHash: string;
}

export interface TokenPosition {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  imageUrl?: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  valueUSD: number;
  pnlUSD: number;
  pnlPercent: number;
}

export interface WalletStats {
  address: string;
  totalBalanceUSD: number;
  ethBalance: number;
  ethBalanceUSD: number;
  totalPnL: number;
  totalPnLPercent: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  weeklyPnL: number;
  weeklyPnLPercent: number;
  totalTrades: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
  avgTradeSize: number;
}

export interface UserProfileData {
  walletStats: WalletStats;
  positions: TokenPosition[];
  recentTransactions: TokenTransaction[];
  joinedDate?: Date;
  username?: string;
  avatar?: string;
}

export interface UserProfileWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  data?: UserProfileData;
}

export interface UserProfileWidgetState {
  activeTab: 'overview' | 'positions' | 'history';
  searchQuery: string;
  timeframe: '24h' | '7d' | '30d' | 'all';
  sortBy: 'value' | 'pnl' | 'recent';
  sortOrder: 'asc' | 'desc';
}

export type TabType = 'overview' | 'positions' | 'history';
export type TimeframeType = '24h' | '7d' | '30d' | 'all';
