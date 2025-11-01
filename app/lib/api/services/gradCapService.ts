// lib/api/services/gradCapService.ts
// Calls external endpoint to simulate graduation cap token amount

export interface GradCapInputs {
  totalSupplyWei: string; // total supply in wei
  targetMcapUsd: string;  // e.g., "50000"
}

export interface GradCapApiResponse {
  inputs: {
    totalSupply: string;
    targetMcapWei: string;
    decimals: number;
  };
  results: {
    supplyToCirculate: string;   // token amount in wei to circulate at graduation
    ethRaisedWei: string;        // how much ETH needs to be raised
    priceWei?: string;           // price per 1 token in wei (new field)
    priceWeiPer1e18?: string;    // legacy field name
  };
}

import { blockchainApiClient } from '@/app/lib/api/blockchainClient';

export async function simulateGradCap({ totalSupplyWei, targetMcapUsd }: GradCapInputs): Promise<GradCapApiResponse> {
  // The blockchain API base should proxy to the steak-blockchain API; endpoint path is '/grad-cap'
  return blockchainApiClient<GradCapApiResponse>(`/grad-cap`, {
    method: 'POST',
    body: JSON.stringify({ totalSupply: totalSupplyWei, targetMcapUsd }),
  });
}
