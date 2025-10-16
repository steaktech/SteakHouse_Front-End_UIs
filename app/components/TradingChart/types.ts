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
  tokenAddress?: string;
};

export type CandlestickChartProps = {
  data: CandlestickDataPoint[];
};

export type TradeHistoryProps = {
  trades: TradeHistoryItem[];
};

// Limit Order Types
export type OrderType = 'market' | 'limit' | 'stop-limit';
export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'filled' | 'cancelled';
export type OrderTimeInForce = 'GTC' | 'IOC' | 'FOK' | 'DAY';

export type LimitOrder = {
  id: string;
  type: OrderType;
  side: OrderSide;
  price: number;
  amount: number;
  filled: number;
  remaining: number;
  status: OrderStatus;
  timeInForce: OrderTimeInForce;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  marketPrice?: number; // Price at time of order creation
  priceDeviation?: number; // Percentage deviation from market price
  estimatedTotal: number; // price * amount
  fees?: number;
  userId?: string;
  symbol: string;
  notes?: string;
};

export type OrderBookEntry = {
  price: number;
  amount: number;
  total: number;
  orders: number; // Number of orders at this price level
  side: OrderSide;
};

export type OrderBook = {
  bids: OrderBookEntry[]; // Buy orders (highest price first)
  asks: OrderBookEntry[]; // Sell orders (lowest price first)
  spread: number;
  midPrice: number;
  lastUpdated: string;
};

export type PriceLevel = {
  label: string;
  price: number;
  deviation: number; // Percentage from current market price
  type: 'market' | 'support' | 'resistance' | 'custom';
};

export type OrderFormData = {
  side: OrderSide;
  type: OrderType;
  price: string;
  amount: string;
  timeInForce: OrderTimeInForce;
  notes?: string;
};

export type OrderExecutionResult = {
  success: boolean;
  orderId?: string;
  message: string;
  partialFill?: {
    filled: number;
    remaining: number;
  };
};

export type LimitOrderPanelProps = {
  currentPrice?: number;
  onOrderSubmit?: (order: OrderFormData) => Promise<OrderExecutionResult>;
  maxBalance?: number;
  minOrderSize?: number;
  tickSize?: number; // Minimum price increment
  initialSide?: OrderSide;
};

export type LimitOrderBookProps = {
  orders: LimitOrder[];
  onCancelOrder?: (orderId: string) => Promise<boolean>;
  onModifyOrder?: (orderId: string, newPrice: number, newAmount: number) => Promise<boolean>;
  loading?: boolean;
  error?: string;
};

export type OrderNotification = {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  orderId?: string;
  timestamp: string;
  autoClose?: boolean;
  duration?: number;
};
