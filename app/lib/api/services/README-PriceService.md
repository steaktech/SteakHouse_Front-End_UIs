# Price Service Implementation

This document explains the structured implementation of gas price and ETH value fetching in the trading platform.

## Architecture Overview

The implementation follows a clean, organized structure with separated concerns:

```
📁 lib/config/
├── constants.ts          # API endpoints and configuration
📁 lib/api/services/
├── priceService.ts       # Price fetching logic
📁 hooks/
├── usePriceData.ts       # React hook for price management
📁 components/UI/
├── PriceDisplay.tsx      # Reusable price display component
```

## Components

### 1. Constants Configuration (`lib/config/constants.ts`)

Centralized configuration for external APIs and refresh intervals:

```typescript
export const EXTERNAL_APIS = {
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    ENDPOINTS: {
      SIMPLE_PRICE: '/simple/price',
    },
  },
  // ... more APIs
} as const;

export const PRICE_REFRESH_INTERVALS = {
  GAS_PRICE: 30000, // 30 seconds
  ETH_PRICE: 30000, // 30 seconds
} as const;
```

### 2. Price Service (`lib/api/services/priceService.ts`)

Service class handling all price-related API calls:

**Key Features:**
- Gas price fetching using wagmi
- ETH price fetching from CoinGecko (free API)
- Error handling and validation
- Data formatting utilities
- Concurrent fetching for better performance

**Main Methods:**
- `fetchGasPrice(publicClient)` - Fetches gas price in Gwei
- `fetchEthPrice()` - Fetches ETH price in USD
- `fetchAllPrices(publicClient)` - Fetches both prices concurrently
- `formatGasPrice(price)` - Formats gas price for display
- `formatEthPrice(price)` - Formats ETH price for display

### 3. Price Data Hook (`hooks/usePriceData.ts`)

React hook for managing price data state:

**Features:**
- Automatic data fetching when enabled
- Auto-refresh every 30 seconds
- Loading and error states
- Cleanup on unmount
- Formatted values for display
- Optimized for performance

**Usage:**
```typescript
// Full hook with all features
const { gasPrice, ethPrice, loading, error, refetch } = usePriceData(true);

// Simplified hook for basic display
const { formattedGasPrice, formattedEthPrice, loading } = useBasicPriceData(true);
```

### 4. Reusable Price Display (`components/UI/PriceDisplay.tsx`)

Standalone component for displaying price data anywhere in the app:

```typescript
<PriceDisplay 
  enabled={true}
  orientation="horizontal"
  className="custom-styles"
/>
```

## Integration Examples

### In CreateTokenModal

```typescript
import { useBasicPriceData } from '@/app/hooks/usePriceData';

const CreateTokenModal = ({ isOpen, onClose }) => {
  // Only fetch when modal is open
  const { formattedGasPrice, formattedEthPrice, loading } = useBasicPriceData(isOpen);
  
  return (
    <div>
      {loading ? (
        <span>Loading prices...</span>
      ) : (
        <div>
          <span>⛽ {formattedGasPrice}</span>
          <span>Ξ {formattedEthPrice}</span>
        </div>
      )}
    </div>
  );
};
```

### In Other Components

```typescript
import { PriceDisplay } from '@/app/components/UI/PriceDisplay';

const Header = () => (
  <header>
    <PriceDisplay orientation="horizontal" />
  </header>
);
```

## API Details

### Gas Price Source
- **Method**: Uses wagmi's `publicClient.getGasPrice()`
- **Network**: Automatically uses the connected network (mainnet, sepolia, etc.)
- **Format**: Converted from wei to Gwei for readability
- **Update Frequency**: Every 30 seconds

### ETH Price Source
- **API**: CoinGecko Free API
- **Endpoint**: `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
- **Rate Limits**: 10-50 requests/minute (generous for our use case)
- **Format**: USD price with proper formatting
- **Update Frequency**: Every 30 seconds

## Error Handling

The implementation includes comprehensive error handling:

1. **Network Errors**: Graceful fallback with error messages
2. **API Rate Limits**: Proper error handling and user feedback
3. **Invalid Responses**: Validation of API response format
4. **Timeout Handling**: 10-second timeout for API requests
5. **Component Unmounting**: Cleanup of intervals and requests

## Performance Optimizations

1. **Conditional Fetching**: Only fetch when component is active
2. **Concurrent Requests**: Gas and ETH price fetched in parallel
3. **Automatic Cleanup**: Intervals cleared on unmount
4. **Memoized Values**: Formatted values are memoized
5. **Optimistic Updates**: Show cached data while refreshing

## Customization

### Changing Refresh Intervals

Modify `PRICE_REFRESH_INTERVALS` in `constants.ts`:

```typescript
export const PRICE_REFRESH_INTERVALS = {
  GAS_PRICE: 60000, // 1 minute
  ETH_PRICE: 30000, // 30 seconds
} as const;
```

### Adding New Price Sources

Extend the `PriceService` class:

```typescript
static async fetchBTCPrice(): Promise<BTCPriceResponse> {
  // Implementation
}
```

### Custom Formatting

Override formatting methods in `PriceService`:

```typescript
static formatGasPrice(gasPrice: string | null): string {
  if (!gasPrice) return 'N/A';
  return `Gas: ${gasPrice} Gwei`;
}
```

## Testing

The modular structure makes testing straightforward:

```typescript
// Test the service
import { PriceService } from '@/app/lib/api/services/priceService';

// Test the hook
import { renderHook } from '@testing-library/react';
import { usePriceData } from '@/app/hooks/usePriceData';

// Test the component
import { render } from '@testing-library/react';
import { PriceDisplay } from '@/app/components/UI/PriceDisplay';
```

## Future Enhancements

1. **Caching**: Add localStorage caching for offline support
2. **More Currencies**: Support for different fiat currencies
3. **Historical Data**: Add price history and trends
4. **WebSocket**: Real-time price updates via WebSocket
5. **Price Alerts**: User-configurable price notifications
