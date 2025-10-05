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
}

export interface SocialLink {
  type: 'telegram' | 'twitter' | 'website';
  url: string;
}