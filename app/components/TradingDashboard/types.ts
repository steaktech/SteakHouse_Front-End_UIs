export interface StatCardProps {
  title: string;
  value: string;
}

export interface TokenCardProps {
  isOneStop?: boolean;
  imageUrl: string;
  name: string;
  symbol: string;
  tag: string;
  tagColor: string;
  description: string;
  mcap: string;
  liquidity: string;
  volume: string;
  progress?: number;
  circulating_supply?: string;
  graduation_cap?: string;
  category?: string | null;
  token_address: string;
  isSaved?: boolean;
}

export interface FilterButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
} 