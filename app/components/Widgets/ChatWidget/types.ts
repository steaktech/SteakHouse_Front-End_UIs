export interface Token {
  name: string;
  symbol: string;
  logoEmoji: string;
  priceUsd: number;
  mcUsd: number;
  change24hPct: number;
  holders: number;
  bondedPct: number;
}

export interface Message {
  id: number;
  addr: string;
  role: 'holder' | 'mod' | 'team' | 'system' | 'guest';
  avatar: string;
  text: string;
  ts: number;
  reactions: Record<string, number>;
  likes: number;
  system?: boolean;
}

export interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export type SortMode = 'new' | 'old' | 'top';
