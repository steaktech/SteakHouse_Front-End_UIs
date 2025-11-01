// lib/api/services/stealthService.ts
import { blockchainApiClient } from '@/app/lib/api/blockchainClient';

export interface StealthTokensResponse {
  tokens: string[];
}

export interface NewStealthTokenResponse {
  token: string;
}

export async function getStealthTokens(wallet: string): Promise<StealthTokensResponse> {
  return blockchainApiClient<StealthTokensResponse>('/getStealthTokens', {
    method: 'POST',
    body: JSON.stringify({ wallet }),
  });
}

export async function getNewStealthToken(wallet: string): Promise<NewStealthTokenResponse> {
  return blockchainApiClient<NewStealthTokenResponse>('/getNewStealthToken', {
    method: 'POST',
    body: JSON.stringify({ wallet }),
  });
}