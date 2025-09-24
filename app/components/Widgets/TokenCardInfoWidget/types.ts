export interface TokenCardInfoData {
  imageUrl: string;
  name: string;
  symbol: string;
  tag: string;
  tagColor?: string;
  description: string;
  mcap: string;
  liquidity: string;
  volume: string;
  progress: number;
  token_address?: string;
}

export interface TokenCardInfoWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  data?: TokenCardInfoData;
  tokenAddress?: string;
}

export interface TokenCardWrapperProps extends TokenCardInfoData {
  isOneStop?: boolean;
  circulating_supply?: number;
  graduation_cap?: number;
  category?: string;
  isSaved?: boolean;
}
