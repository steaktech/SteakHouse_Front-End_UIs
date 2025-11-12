# Token Locker Implementation Summary

## Overview
The token locker functionality has been fully implemented using the blockchain API endpoints. All locker operations (Create, Extend, Withdraw, and Transfer) are now integrated with the blockchain API.

## API Endpoints Implemented

### Base URL
All endpoints use the blockchain API base URL configured in `NEXT_PUBLIC_BLOCKCHAIN_API_BASE_URL` environment variable.

### 1. Create Lock
**Endpoint:** `POST /createLock`
**Parameters:**
- `token` (string): Token address to lock
- `amount` (string): Amount/percentage to lock
- `lockDuration` (number): Lock duration in seconds
- `owner` (string): Main wallet address (not trading address)

**Response:**
```json
{
  "message": "Unsigned create lock transaction built successfully",
  "unsignedTx": {
    "to": "0x...",
    "data": "0x...",
    "from": "0x...",
    "gasLimit": "29543"
  }
}
```

### 2. Extend Lock
**Endpoint:** `POST /extendLock`
**Parameters:**
- `token` (string): Token address
- `extraTimeSec` (number): Additional time in seconds (e.g., 30 * 24 * 60 * 60 for 1 month)
- `owner` (string): Main wallet address (not trading address)

### 3. Withdraw/Unlock Lock
**Endpoint:** `POST /withdrawLock`
**Parameters:**
- `token` (string): Token address to withdraw
- `owner` (string): Main wallet address (not trading address)

### 4. Transfer Lock Ownership
**Endpoint:** `POST /transferLock`
**Parameters:**
- `token` (string): Token address
- `newOwner` (string): New owner wallet address
- `oldOwner` (string): Main wallet address of current owner (not trading address)

### 5. Get Locks
**Endpoint:** `GET /getLocks/:wallet`
**Parameters:**
- `wallet` (string): User's main wallet address (not trading address)

**Returns:** Array of locks for the user

## Error Handling

All endpoints return unsigned transactions that need to be signed by the user's wallet. Error responses follow this format:

```json
{
  "error": "execution reverted: \"Still locked\" ..."
}
```

The error messages are parsed and displayed to users in a user-friendly format.

## Files Modified

### 1. `/app/lib/api/services/lockerService.ts`
**Added Function:**
- `buildCreateLock(token, amount, lockDurationDays, owner)` - Builds unsigned transaction for creating a lock

**Existing Functions:**
- `fetchLocks(ownerAddress)` - Fetches all locks for a wallet
- `buildWithdrawLock(token, owner)` - Builds unsigned transaction for withdrawing tokens
- `buildExtendLock(token, extraTimeSec, owner)` - Builds unsigned transaction for extending lock
- `buildTransferLock(token, newOwner, oldOwner)` - Builds unsigned transaction for transferring ownership

### 2. `/app/components/Widgets/LockerWidget/LockerWidget.tsx`
**Updated:**
- Imported `buildCreateLock` from lockerService
- Updated `handleCreateLock` function to use the new API endpoint
- Added proper error handling and wallet address validation
- Integrated with `signAndSubmitTransaction` for transaction signing and submission

## Transaction Flow

1. **User Action** → User clicks "Create Lock", "Extend", "Withdraw", or "Transfer"
2. **API Call** → App calls blockchain API endpoint with required parameters
3. **Unsigned Transaction** → API returns unsigned transaction object
4. **Wallet Signing** → Transaction is sent to MetaMask/Web3 wallet for signing
5. **Submission** → Signed transaction is submitted to blockchain
6. **Confirmation** → App waits for transaction confirmation
7. **UI Update** → UI refreshes to show updated lock status

## Blockchain Client

All API calls use the `blockchainApiClient` utility from `/app/lib/api/blockchainClient.ts`, which:
- Handles authentication and headers
- Provides consistent error parsing
- Logs all requests and responses for debugging
- Extracts human-readable error messages from blockchain errors

## Transaction Service

Transaction signing and submission is handled by `signAndSubmitTransaction` from `/app/lib/web3/services/transactionService.ts`, which:
- Checks for MetaMask availability
- Requests account access
- Handles EIP-1559 gas pricing
- Waits for transaction confirmation with retry mechanism
- Provides status updates via callbacks

## Usage Example

```typescript
import { buildCreateLock } from '@/app/lib/api/services/lockerService';
import { signAndSubmitTransaction } from '@/app/lib/web3/services/transactionService';

// Create a lock
const unsignedTx = await buildCreateLock(
  '0xTokenAddress',
  '100', // percentage
  30, // days
  '0xOwnerAddress'
);

// Sign and submit
const txHash = await signAndSubmitTransaction(unsignedTx, false);
```

## Environment Variables Required

```env
NEXT_PUBLIC_BLOCKCHAIN_API_BASE_URL=https://your-blockchain-api-url.com
```

## Notes

1. All owner addresses should be **main wallet addresses**, not trading addresses
2. Lock duration is converted from days to seconds automatically
3. Amount can be a percentage (e.g., "100" for 100%) or actual token amount
4. All gas values are normalized to hex format before submission
5. Transactions are submitted using MetaMask/Web3 wallet
6. Error messages are extracted and displayed in user-friendly format
7. The widget automatically refreshes lock data after successful operations

## Testing Checklist

- [ ] Create Lock with valid parameters
- [ ] Extend Lock for active lock
- [ ] Withdraw Lock when unlocked
- [ ] Transfer Lock ownership
- [ ] Handle errors (locked tokens, invalid addresses, etc.)
- [ ] Verify gas estimation and transaction costs
- [ ] Test with different lock durations
- [ ] Verify UI updates after successful transactions
