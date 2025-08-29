// lib/api/services/createTokenService.ts
import { CreateTokenFormData, CreateTokenApiResponse } from '@/app/types/createToken';
import { API_BASE_URL } from '@/app/lib/config/constants';

/**
 * Service for creating tokens via the /api/tokens/newToken endpoint
 * Following the existing codebase patterns for API services
 */
export class CreateTokenService {
  private static readonly ENDPOINT = '/tokens/newToken';

  /**
   * Creates a new token by calling the backend API
   * Uses FormData for multipart/form-data submission with optional file uploads
   * @param tokenData - The token data including optional file uploads
   * @returns Promise<CreateTokenApiResponse>
   */
  static async createToken(tokenData: CreateTokenFormData): Promise<CreateTokenApiResponse> {
    const formData = new FormData();

    // Add all text fields to FormData
    Object.entries(tokenData).forEach(([key, value]) => {
      if (key === 'logo' || key === 'banner') {
        // Handle file uploads separately
        if (value instanceof File) {
          formData.append(key, value);
        }
      } else if (value !== undefined && value !== null && value !== '') {
        // Convert all values to strings and skip empty values
        // Following API docs: don't send empty strings or nulls
        formData.append(key, String(value));
      }
    });

    try {
      console.log('🚀 Making API call to:', `${API_BASE_URL}${this.ENDPOINT}`);
      console.log('📝 FormData contents:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
      }

      const response = await fetch(`${API_BASE_URL}${this.ENDPOINT}`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary for multipart
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Token creation failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ API Success Response:', result);
      return result;
    } catch (error) {
      console.error('💥 Token creation error:', error);
      throw error;
    }
  }

  /**
   * Validates required fields before API call
   * @param tokenData - The token data to validate
   * @returns Array of validation errors (empty if valid)
   */
  static validateTokenData(tokenData: CreateTokenFormData): string[] {
    const errors: string[] = [];

    if (!tokenData.token_address) {
      errors.push('Token address is required');
    }

    if (tokenData.token_address && !/^0x[a-fA-F0-9]{40}$/.test(tokenData.token_address)) {
      errors.push('Token address must be a valid 0x-prefixed hex address');
    }

    // Add additional validation as needed
    if (tokenData.total_supply && !/^\d+$/.test(tokenData.total_supply)) {
      errors.push('Total supply must be a valid integer string');
    }

    if (tokenData.graduation_cap && !/^\d+$/.test(tokenData.graduation_cap)) {
      errors.push('Graduation cap must be a valid integer string');
    }

    return errors;
  }

  /**
   * Generates a temporary token address for demo/testing purposes
   * In production, this would come from wallet connection or contract deployment
   * @returns A valid 0x-prefixed hex address
   */
  static generateTempTokenAddress(): string {
    const array = new Uint8Array(20);
    crypto.getRandomValues(array);
    return "0x" + Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
