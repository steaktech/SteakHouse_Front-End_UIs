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
  if (!BLOCKCHAIN_API_URL) {
    throw new Error('Missing NEXT_PUBLIC_BLOCKCHAIN_API_BASE_URL. Please set it in your environment to enable holders API calls.');
  }

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
    // Try to parse structured error JSON and surface only the human-readable message
    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        const msg = (typeof data?.error === 'string' && data.error)
          || (typeof data?.message === 'string' && data.message)
          || (typeof data?.detail === 'string' && data.detail)
          || null;
        if (msg) {
          console.error('Blockchain API Error:', msg);
          throw new Error(msg);
        }
        // Fallback to stringifying JSON if no known field
        throw new Error(JSON.stringify(data));
      } else {
        const errorText = await response.text();
        console.error('Blockchain API Error Details:', errorText);
        throw new Error(errorText || response.statusText);
      }
    } catch (e) {
      // Parsing failed; throw generic status text
      throw new Error(response.statusText || 'Request failed');
    }
  }

  const result = await response.json();
  console.log('Blockchain API Result:', result);
  return result;
}
