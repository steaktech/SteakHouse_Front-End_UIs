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
  console.log(`Making API call to: ${API_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    console.log(`API response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error response:`, errorText);
      throw new Error(`API call to ${endpoint} failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`API response data length:`, Array.isArray(data) ? data.length : 'Not an array');
    return data;
  } catch (error) {
    console.error(`API client error for ${endpoint}:`, error);
    throw error;
  }
}
