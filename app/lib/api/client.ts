// lib/api/client.ts
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * A reusable API client for making fetch requests.
 * It automatically sets the base URL and JSON headers.
 * @param endpoint The API endpoint to call (e.g., '/users/123').
 * @param options The standard RequestInit options for fetch.
 * @returns The JSON response from the API.
 */
export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const fullUrl = `${API_URL}${endpoint}`;
  console.log('API Request:', {
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

  console.log('API Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    url: response.url
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Details:', errorText);
    throw new Error(`API call to ${endpoint} failed: ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log('API Result:', result);
  return result;
}