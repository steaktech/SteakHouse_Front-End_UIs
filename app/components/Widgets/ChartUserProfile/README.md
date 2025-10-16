# User Profile Widget

A comprehensive wallet statistics and portfolio tracking widget for SteakHouse trading platform.

## Features

### 📊 Overview Tab
- **Wallet Information**: Display username, wallet address with copy functionality, and member since date
- **Balance Cards**: 
  - Total portfolio balance in USD
  - ETH balance with USD equivalent
- **Performance Metrics**:
  - Total P&L (profit and loss) with percentage
  - 24-hour P&L with percentage
  - 7-day P&L with percentage
- **Trading Statistics**:
  - Total number of trades
  - Win rate percentage
  - Best trade performance
  - Worst trade performance
  - Average trade size

### 💼 Positions Tab
- View all active token positions
- Search and filter positions
- For each position, display:
  - Token name and symbol
  - Amount held
  - Average buy price
  - Current price
  - Total value in USD
  - Profit/Loss with percentage
  - Visual indicators for positive/negative performance
- Sort by value or P&L

### 📜 History Tab
- View recent transaction history
- Search transactions by token name, symbol, or address
- For each transaction, display:
  - Buy or sell indicator with color coding
  - Token name and symbol
  - Amount traded
  - Price at time of transaction
  - Total transaction value
  - Timestamp (relative or absolute)
  - Transaction hash with copy functionality
  - Link to view on blockchain explorer

## Design

The widget follows the same design language as other widgets in the platform:

- **Color Scheme**: Warm gradient theme with browns, golds, and amber tones
- **Layout**: Right-side drawer that slides in on desktop
- **Mobile Responsive**: Full-width on mobile devices
- **Smooth Animations**: Fade-in transitions and hover effects
- **Dark Theme**: Optimized for low-light environments

## Usage

### Basic Implementation

```tsx
import { UserProfileWidget } from '@/app/components/Widgets/UserProfileWidget';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <UserProfileWidget
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
}
```

### With Custom Data

```tsx
import { UserProfileWidget, UserProfileData } from '@/app/components/Widgets/UserProfileWidget';

const customData: UserProfileData = {
  walletStats: {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    totalBalanceUSD: 45678.90,
    ethBalance: 12.5,
    ethBalanceUSD: 28750.00,
    totalPnL: 8934.50,
    totalPnLPercent: 24.3,
    dailyPnL: 342.75,
    dailyPnLPercent: 0.75,
    weeklyPnL: 1235.40,
    weeklyPnLPercent: 2.78,
    totalTrades: 127,
    winRate: 68.5,
    bestTrade: 2345.67,
    worstTrade: -1234.89,
    avgTradeSize: 850.45,
  },
  positions: [...],
  recentTransactions: [...],
  joinedDate: new Date('2024-06-15'),
  username: 'CryptoTrader'
};

<UserProfileWidget
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  data={customData}
/>
```

## Props

### UserProfileWidgetProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls widget visibility |
| `onClose` | `() => void` | Yes | Callback when widget is closed |
| `data` | `UserProfileData` | No | Custom user data (uses demo data if not provided) |

## Data Types

### WalletStats
```typescript
interface WalletStats {
  address: string;
  totalBalanceUSD: number;
  ethBalance: number;
  ethBalanceUSD: number;
  totalPnL: number;
  totalPnLPercent: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  weeklyPnL: number;
  weeklyPnLPercent: number;
  totalTrades: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
  avgTradeSize: number;
}
```

### TokenPosition
```typescript
interface TokenPosition {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  valueUSD: number;
  pnlUSD: number;
  pnlPercent: number;
}
```

### TokenTransaction
```typescript
interface TokenTransaction {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  type: 'buy' | 'sell';
  amount: number;
  priceUSD: number;
  totalValueUSD: number;
  timestamp: Date;
  txHash: string;
}
```

## Integration

The widget has been integrated into the Desktop Sidebar (`DesktopSidebar.tsx`):

1. **Import**: Added to the imports section
2. **State Management**: Widget open/close state managed in the sidebar
3. **Widget Item**: Displays in the widgets list with User icon
4. **Rendering**: Widget component rendered at the bottom with other widgets

## Keyboard Shortcuts

- **Escape**: Close the widget

## Features Inspired By

This widget design was inspired by popular crypto trading platforms including:
- **Uniswap**: Clean portfolio tracking interface
- **1inch**: Comprehensive transaction history
- **Zapper**: Multi-token position overview
- **DeBank**: Wallet performance metrics
- **Rainbow Wallet**: Beautiful balance cards and visual design

## Future Enhancements

Potential features for future versions:
- Real-time price updates via WebSocket
- Advanced filtering and sorting options
- Export transaction history to CSV
- Portfolio performance charts
- Token allocation pie chart
- NFT holdings section
- DeFi protocol positions
- Staking rewards tracking
- Gas spending analytics
- Custom timeframe selection
- Wallet comparison feature
- Social sharing of portfolio stats

## Files Structure

```
UserProfileWidget/
├── UserProfileWidget.tsx          # Main component
├── UserProfileWidget.module.css   # Styles
├── types.ts                       # TypeScript types
├── index.ts                       # Exports
└── README.md                      # Documentation
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- lucide-react (for icons)
- Next.js 13+ (App Router)

## License

Part of the SteakHouse Front-End UIs project.
