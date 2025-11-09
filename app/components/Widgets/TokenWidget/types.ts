export interface TokenData {
  name: string;
  symbol: string;
  logo?: string;
  currentTax: {
    buy: number;
    sell: number;
  };
  maxTax: {
    buy: number;
    sell: number;
  };
  maxTransaction: number;
  description: string;
  marketCap: string;
  volume: string;
  liquidityPool: string;
  bondingProgress: number;
  tag: string;
  tagColor?: string;
}

export interface TokenWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  tokenData?: TokenData;
  // Optional: fetch live data when a token address is provided
  tokenAddress?: string | null;
  // Receive API data from parent to avoid duplicate calls
  apiTokenData?: any | null;
  isLoading?: boolean;
}

export interface SocialLink {
  type: 'telegram' | 'twitter' | 'website';
  url: string;
}