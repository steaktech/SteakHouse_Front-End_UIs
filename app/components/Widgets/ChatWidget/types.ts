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
  id: number; // local UI id for React keys
  messageId?: string; // server UUID
  clientId?: string; // local client correlation id for optimistic updates
  senderId?: string; // server sender id (wallet address or username)
  addr: string; // display label (typically short address)
  role: 'holder' | 'mod' | 'team' | 'system' | 'guest';
  avatar: string;
  text: string;
  ts: number; // ms timestamp
  reactions: Record<string, number>;
  likes: number;
  system?: boolean;
  pending?: boolean; // optimistic message not yet acked
}

export interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress?: string; // ERC-20 token address for the room (lowercased before use)
}

export type SortMode = 'new' | 'old' | 'top';
