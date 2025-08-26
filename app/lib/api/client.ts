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
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    // You can add more robust error handling here
    throw new Error(`API call to ${endpoint} failed: ${response.statusText}`);
  }

  return response.json();
}