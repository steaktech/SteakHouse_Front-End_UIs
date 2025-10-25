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
  return Array.isArray(result) ? result : [];
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