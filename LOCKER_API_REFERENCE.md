# Locker API Endpoints Quick Reference

## Base Configuration
```typescript
// All endpoints use: NEXT_PUBLIC_BLOCKCHAIN_API_BASE_URL
const BLOCKCHAIN_API_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_API_BASE_URL;
```

## Available Endpoints

### ⚠️ Create Lock - NOT AVAILABLE
The blockchain API does not provide a `/createLock` endpoint. 

**Workaround:** Use the `onLockCreate` callback prop when using the LockerWidget component:
```typescript
<LockerWidget
  isOpen={isOpen}
  onClose={handleClose}
  onLockCreate={async (formData) => {
    // Implement your custom lock creation logic here
    // This could call a different API or smart contract directly
  }}
/>
```

### 1. Extend Lock
```typescript
POST /extendLock
Body: {
  token: string,           // Token address
  extraTimeSec: number,    // Additional time in seconds (e.g., 30 * 24 * 60 * 60)
  owner: string            // Main wallet address
}

Response: {
  message: "Unsigned extend lock transaction built successfully",
  unsignedTx: UnsignedTx
}
```

### 3. Withdraw Lock
```typescript
POST /withdrawLock
Body: {
  token: string,           // Token address
  owner: string            // Main wallet address
}

Response: {
  message: "Unsigned withdraw lock transaction built successfully",
  unsignedTx: UnsignedTx
}
```

### 4. Transfer Lock Ownership
```typescript
POST /transferLock
Body: {
  token: string,           // Token address
  newOwner: string,        // New owner wallet address
  oldOwner: string         // Current owner wallet address
}

Response: {
  message: "Unsigned transfer lock transaction built successfully",
  unsignedTx: UnsignedTx
}
```

### 5. Get Locks
```typescript
GET /getLocks/:wallet

Parameters:
  wallet: string           // User's main wallet address

Response: Array<Lock>
```

## UnsignedTx Type
```typescript
type UnsignedTx = {
  to?: string;
  data?: string;
  from?: string;
  gas?: string;            // hex format
  gasLimit?: string | number;
  value?: string;          // hex format
  maxFeePerGas?: string;   // hex format
  maxPriorityFeePerGas?: string;
  gasPrice?: string;       // hex format
}
```

## Error Response Format
```json
{
  "error": "Detailed error message from blockchain"
}
```

## Important Notes

1. **Owner Address**: Always use main wallet address, NOT trading address
2. **Gas Values**: Automatically normalized to hex format before submission
3. **Lock Duration**: Converted from days to seconds (days * 24 * 60 * 60)
4. **Amount**: Can be percentage string or actual token amount
5. **Transaction Flow**: 
   - Get unsigned transaction from API
   - Sign with MetaMask/Web3 wallet
   - Submit to blockchain
   - Wait for confirmation
6. **Error Handling**: All errors are parsed and displayed in user-friendly format

## Usage in Code

```typescript
import { 
  buildCreateLock, 
  buildExtendLock, 
  buildWithdrawLock, 
  buildTransferLock, 
  fetchLocks 
} from '@/app/lib/api/services/lockerService';
import { signAndSubmitTransaction } from '@/app/lib/web3/services/transactionService';

// Example: Create a lock
const unsignedTx = await buildCreateLock(
  tokenAddress,
  '100',        // 100% of tokens
  30,           // 30 days
  walletAddress
);

const txHash = await signAndSubmitTransaction(unsignedTx, false);

// Example: Get all locks for a wallet
const locks = await fetchLocks(walletAddress);
```

## Testing Commands

```bash
# Build the project
pnpm build

# Start development server
pnpm dev

# Check for TypeScript errors
pnpm tsc --noEmit
```
