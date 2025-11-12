// lib/api/services/lockerService.ts
import { blockchainApiClient } from '@/app/lib/api/blockchainClient';

export type UnsignedTx = {
  to?: string;
  data?: `0x${string}` | string;
  from?: string;
  gas?: string; // 0x-hex
  gasLimit?: string | number; // sometimes returned as decimal string
  value?: string; // 0x-hex
  maxFeePerGas?: string; // 0x-hex
  maxPriorityFeePerGas?: string; // 0x-hex
  gasPrice?: string; // 0x-hex
};

function unwrapUnsignedTx(res: any): UnsignedTx {
  return (res?.unsignedTx ?? res) as UnsignedTx;
}

export async function fetchLocks(ownerAddress: string): Promise<any[]> {
  if (!ownerAddress) throw new Error('ownerAddress is required');
  const result = await blockchainApiClient<any>(`/getLocks/${ownerAddress}`);

  // Normalize various possible response shapes
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.allLocks)) return result.allLocks;
  if (Array.isArray(result?.locks)) return result.locks;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;

  // Fallback: find the first array property in the response object
  if (result && typeof result === 'object') {
    const firstArray = Object.values(result).find(Array.isArray) as any[] | undefined;
    if (Array.isArray(firstArray)) return firstArray;
  }
  return [];
}

export async function buildWithdrawLock(token: string, owner: string): Promise<UnsignedTx> {
  const res = await blockchainApiClient<any>(`/withdrawLock`, {
    method: 'POST',
    body: JSON.stringify({ token, owner }),
  });
  if (res?.error) throw new Error(res.error);
  return unwrapUnsignedTx(res);
}

export async function buildExtendLock(token: string, extraTimeSec: number, owner: string): Promise<UnsignedTx> {
  const res = await blockchainApiClient<any>(`/extendLock`, {
    method: 'POST',
    body: JSON.stringify({ token, extraTimeSec, owner }),
  });
  if (res?.error) throw new Error(res.error);
  return unwrapUnsignedTx(res);
}

export async function buildTransferLock(token: string, newOwner: string, oldOwner: string): Promise<UnsignedTx> {
  const res = await blockchainApiClient<any>(`/transferLock`, {
    method: 'POST',
    body: JSON.stringify({ token, newOwner, oldOwner }),
  });
  if (res?.error) throw new Error(res.error);
  return unwrapUnsignedTx(res);
}

export async function buildCreateLock(token: string, amount: string, lockDurationDays: number, owner: string): Promise<UnsignedTx> {
  // Convert amount percentage to actual token amount (this will need token decimals from the contract)
  // For now, we'll pass the percentage as a string and let the backend handle it
  // lockDuration needs to be converted to seconds
  const lockDurationSeconds = lockDurationDays * 24 * 60 * 60;
  
  const res = await blockchainApiClient<any>(`/createLock`, {
    method: 'POST',
    body: JSON.stringify({ 
      token, 
      amount, // percentage or actual amount
      lockDuration: lockDurationSeconds,
      owner 
    }),
  });
  if (res?.error) throw new Error(res.error);
  return unwrapUnsignedTx(res);
}