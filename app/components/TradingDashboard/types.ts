export interface StatCardProps {
  title: string;
  value: string;
}

export interface TokenCardProps {
  isOneStop?: boolean;
  imageUrl?: string;
  // Optional banner image for the top of the card
  bannerUrl?: string;
  name?: string;
  symbol?: string;
  tag?: string;
  tagColor?: string;
  description?: string;
  mcap?: string;
  liquidity?: string;
  volume?: string;
  // Dynamic tax info (optional)
  currentTax?: string;
  finalTax?: string;
  maxTxPercent?: string;
  progress?: number;
  priceChange24h?: number;
  circulating_supply?: string;
  graduation_cap?: string;
  category?: string | null;
  token_address: string;
  chain_id?: number;
  // Social links (optional)
  telegram?: string | null;
  twitter?: string | null;
  website?: string | null;
  isSaved?: boolean;
  ethPriceUsd?: number | null;
}

export interface FilterButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}