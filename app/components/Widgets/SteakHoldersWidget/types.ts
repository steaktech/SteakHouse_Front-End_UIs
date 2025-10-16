export interface TokenData {
  name: string;
  symbol: string;
  chain: string;
  address: string;
  priceUSD: number;
  totalSupply: number;
}

export interface HolderData {
  address: string;
  label: 'burn' | 'contract' | 'exchange' | 'team' | 'normal';
  tx: number;
  balance: number;
  percent?: number;
  valueUSD?: number;
}

export interface ProcessedHolderData extends HolderData {
  percent: number;
  valueUSD: number;
}

export interface DatasetType {
  token: TokenData;
  holders: ProcessedHolderData[];
}

export interface DistributionSegment {
  label: string;
  value: number;
  color: string;
  address?: string;
}

export interface FilterState {
  contract: boolean;
  exchange: boolean;
  burn: boolean;
  team: boolean;
}

export interface TierFilter {
  min: number;
  max: number;
}

export interface SteakHoldersWidgetState {
  dataset: DatasetType | null;
  q: string;
  sort: 'percentDesc' | 'percentAsc' | 'balanceDesc' | 'balanceAsc' | 'valueDesc' | 'valueAsc';
  hide: FilterState;
  tier: TierFilter | null;
}

export interface SteakHoldersWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress?: string;
  data?: {
    token: TokenData;
    holders: HolderData[];
  };
}
