export interface TokenPair {
  id: string;
  name: string;
  symbol: string;
  address: string;
  creator: string;
  imageUrl?: string;
  
  // Market data
  marketCap: number;
  price: number;
  volume24h: number;
  priceChange24h: number;
  
  // Liquidity & Graduation (Market Cap Based)
  graduationMcGoal?: number; // MC required to graduate (e.g., 69,000)
  graduationProgress?: number; // 0-100 based on MC
  
  // Social & Activity
  holders: number;
  replies?: number;
  views?: number;
  likes?: number;
  
  // Timing
  createdAt: Date;
  graduatedAt?: Date;
  
  // Status
  status: 'newly-created' | 'about-to-graduate' | 'graduated';
  isVerified?: boolean;
  hasWarning?: boolean;
  
  // Tags
  tags?: string[];
  chain: 'EVM' | 'Solana' | 'Bitcoin';
}

export interface ExplorerSection {
  id: 'newly-created' | 'about-to-graduate' | 'graduated';
  title: string;
  description: string;
  pairs: TokenPair[];
}

export interface ExplorerWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  data?: ExplorerSection[];
  onPairClick?: (pair: TokenPair) => void;
}

export interface ExplorerWidgetState {
  activeSection: 'newly-created' | 'about-to-graduate' | 'graduated';
  searchQuery: string;
  sortBy: 'recent' | 'marketcap' | 'volume' | 'holders';
  sortOrder: 'asc' | 'desc';
  filterChain?: 'EVM' | 'Solana' | 'Bitcoin' | 'all';
}

export type SectionType = 'newly-created' | 'about-to-graduate' | 'graduated';
export type SortType = 'recent' | 'marketcap' | 'volume' | 'holders';
