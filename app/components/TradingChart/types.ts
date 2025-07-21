export type CandlestickDataPoint = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type TradeHistoryItem = {
  id: number;
  asset: string;
  type: 'Buy' | 'Sell';
  amount: number;
  price: number;
  status: 'Filled' | 'Pending' | 'Cancelled';
  time: string;
};



export type SidebarProps = {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
};

export type CandlestickChartProps = {
  data: CandlestickDataPoint[];
};

export type TradeHistoryProps = {
  trades: TradeHistoryItem[];
}; 