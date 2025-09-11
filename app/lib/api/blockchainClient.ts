// lib/api/blockchainClient.ts
const BLOCKCHAIN_API_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_API_BASE_URL;

/**
 * A specialized API client for blockchain-related requests.
 * Uses the NEXT_PUBLIC_BLOCKCHAIN_API_BASE_URL environment variable.
 * @param endpoint The API endpoint to call (e.g., '/maxTx/0x123...').
 * @param options The standard RequestInit options for fetch.
 * @returns The JSON response from the blockchain API.
 */
export async function blockchainApiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const fullUrl = `${BLOCKCHAIN_API_URL}${endpoint}`;
  console.log('Blockchain API Request:', {
    url: fullUrl,
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: options?.body
  });

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  console.log('Blockchain API Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    url: response.url
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Blockchain API Error Details:', errorText);
    throw new Error(`Blockchain API call to ${endpoint} failed: ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Blockchain API Result:', result);
  return result;
}
