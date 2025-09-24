export interface TradeWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress?: string;
  defaultTab?: 'buy' | 'sell';
}
