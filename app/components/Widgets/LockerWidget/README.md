# Token Locker Widget

A professional, UNCX-inspired token locker widget for securely locking and managing tokens with customizable durations.

## Features

- 🔒 **Token Locking**: Lock any ERC-20 token for a specified duration
- ⏰ **Duration Presets**: Quick selection of 7, 14, 30, 90, 180, or 365 days
- 📊 **Lock Management**: View and manage all your token locks in one place
- 🔍 **Search & Filter**: Easily find specific locks by token name, symbol, or address
- 📈 **Progress Tracking**: Visual progress bars showing time until unlock
- 🎨 **Professional Design**: Matches the existing widget style with amber/caramel theme
- 📱 **Responsive**: Works perfectly on desktop and mobile devices
- ♿ **Accessible**: Keyboard navigation and ARIA labels included

## Installation

The widget is already part of your project structure. Simply import it:

```tsx
import { LockerWidget } from '@/app/components/Widgets/LockerWidget';
```

## Usage

### Basic Usage (Demo Mode)

```tsx
import { LockerWidget } from '@/app/components/Widgets/LockerWidget';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Locker
      </button>
      
      <LockerWidget
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

### Advanced Usage (With Custom Data & Handlers)

```tsx
import { LockerWidget, TokenLock, LockFormData } from '@/app/components/Widgets/LockerWidget';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Your lock data from backend/blockchain
  const myLocks: TokenLock[] = [
    {
      id: '1',
      tokenAddress: '0x...',
      tokenName: 'My Token',
      tokenSymbol: 'MTK',
      amount: 1000000,
      lockedAt: new Date('2025-09-01'),
      unlockDate: new Date('2026-01-01'),
      status: 'active',
      owner: '0x...',
      withdrawable: false,
    },
  ];

  const handleLockCreate = async (formData: LockFormData) => {
    // Integrate with your smart contract
    await yourContract.createLock(
      formData.tokenAddress,
      formData.amount,
      formData.lockDuration
    );
  };

  const handleUnlock = async (lockId: string) => {
    // Integrate with your smart contract
    await yourContract.unlock(lockId);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Open Locker
      </button>
      
      <LockerWidget
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={myLocks}
        onLockCreate={handleLockCreate}
        onUnlock={handleUnlock}
      />
    </>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls widget visibility |
| `onClose` | `() => void` | Yes | Callback when widget is closed |
| `data` | `TokenLock[]` | No | Array of existing token locks (uses demo data if not provided) |
| `onLockCreate` | `(formData: LockFormData) => Promise<void>` | No | Callback when creating a new lock |
| `onUnlock` | `(lockId: string) => Promise<void>` | No | Callback when unlocking tokens |

## Types

### TokenLock

```typescript
interface TokenLock {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  amount: number;
  lockedAt: Date;
  unlockDate: Date;
  status: 'active' | 'expired' | 'unlocked';
  owner: string;
  withdrawable: boolean;
}
```

### LockFormData

```typescript
interface LockFormData {
  tokenAddress: string;
  amount: string;
  lockDuration: number; // in days
  customDuration?: number;
}
```

## Features in Detail

### Create Lock Tab
- Input token contract address
- Specify amount to lock
- Select duration from presets (7, 14, 30, 90, 180, 365 days)
- Preview unlock date before creating
- Form validation

### Manage Locks Tab
- View all your token locks
- Search by token name, symbol, or address
- Status badges (Active, Expired, Unlocked)
- Progress bars showing time until unlock
- Unlock button for withdrawable locks
- View on explorer button

### Lock Card Information
Each lock card displays:
- Token name and symbol with avatar
- Status badge (active/expired/unlocked)
- Lock amount
- Time remaining until unlock
- Locked date
- Unlock date
- Progress bar
- Action buttons

## Styling

The widget uses CSS modules and follows the same design language as other widgets:
- Amber/caramel color scheme
- Professional gradients and shadows
- Smooth transitions and hover effects
- Responsive design for all screen sizes

## Keyboard Shortcuts

- `Escape` - Close the widget
- `Tab` - Navigate between form fields and buttons

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Demo Data

When used without custom data, the widget displays demo locks for:
- Amber Launch (AMBR) - Active lock
- Ethereum (ETH) - Expired lock
- SteakCoin (STEAK) - Active lock

## Integration with Smart Contracts

To integrate with your token locker smart contract:

1. Implement `onLockCreate` to call your contract's lock creation function
2. Implement `onUnlock` to call your contract's unlock function
3. Fetch your locks from the blockchain and pass them via the `data` prop
4. Update lock status based on blockchain events

## Customization

The widget's appearance can be customized by modifying:
- `LockerWidget.module.css` - All styling
- CSS variables at the top of the CSS file for colors and dimensions

## License

Part of the SteakHouse Front-End UIs Experimental project.
