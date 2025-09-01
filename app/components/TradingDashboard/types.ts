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
  progress: number;
}

export interface FilterButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
} 