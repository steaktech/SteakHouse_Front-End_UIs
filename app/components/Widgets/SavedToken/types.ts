export interface SavedTokenData {
  id: string;
  name: string;
  symbol: string;
  address: string;
  chain: string;
  priceUSD: number;
  imageUrl?: string;
  savedAt: Date;
}

export interface SavedTokenWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  data?: SavedTokenData[];
}

export interface SavedTokenWidgetState {
  searchQuery: string;
  sortBy: 'name' | 'symbol' | 'savedAt' | 'price';
  sortOrder: 'asc' | 'desc';
}
