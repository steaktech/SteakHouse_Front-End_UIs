"use client";

import { useState, useCallback } from 'react';
import { CreateTokenService } from '@/app/lib/api/services/createTokenService';
import { CreateTokenFormData, CreateTokenResult } from '@/app/types/createToken';
import { TokenState } from '@/app/components/Modals/CreateTokenModal/types';
import { transformStateToApiRequest } from '@/app/components/Modals/CreateTokenModal/utils/apiTransformer';

export interface UseCreateTokenOptions {
  onSuccess?: (result: CreateTokenResult) => void;
  onError?: (error: Error) => void;
}

export interface UseCreateTokenReturn {
  /**
   * Creates a token using the API
   * tokenAddressOverride can be provided to explicitly set the real token address in the API payload.
   * opts.usd_spent can be provided to include the USD value of fees spent
   */
  createToken: (
    state: TokenState, files?: { logo?: File; banner?: File; mp3?: File}, 
    tokenAddressOverride?: string, 
    opts?: { usd_spent?: number }
  ) => Promise<CreateTokenResult>;
  /**
   * Whether the API call is in progress
   */
  isLoading: boolean;
  /**
   * Error from the last API call
   */
  error: Error | null;
  /**
   * Result from the last successful API call
   */
  result: CreateTokenResult | null;
  /**
   * Resets the hook state
   */
  reset: () => void;
}

/**
 * Custom hook for creating tokens via the API
 * Handles state transformation, API calls, and response management
 */
export function useCreateToken(options: UseCreateTokenOptions = {}): UseCreateTokenReturn {
  const { onSuccess, onError } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<CreateTokenResult | null>(null);

  /**
   * Creates a token by transforming modal state to API format and calling the service
   */
  const createToken = useCallback(async (
    state: TokenState, 
    files?: { logo?: File; banner?: File; mp3?: File},
    tokenAddressOverride?: string,
    opts?: { usd_spent?: number }
  ): Promise<CreateTokenResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[useCreateToken] Starting token creation...');
      
      // Transform modal state to API request format (include real token address if provided)
      const apiRequest = transformStateToApiRequest(state, tokenAddressOverride);
      
      // Add USD spent if provided
      if (opts?.usd_spent !== undefined) {
        (apiRequest as any).usd_spent = opts.usd_spent;
      }
      
      // Add files if provided
      const formData: CreateTokenFormData = {
        ...apiRequest,
        ...(files?.logo && { logo: files.logo }),
        ...(files?.banner && { banner: files.banner }),
        ...(files?.mp3 && { mp3: files.mp3 })
      };
      
      // Validate the data
      const validationErrors = CreateTokenService.validateTokenData(formData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      console.log('[useCreateToken] Calling API with data:', {
        ...formData,
        logo: formData.logo ? `File(${formData.logo.name})` : undefined,
        banner: formData.banner ? `File(${formData.banner.name})` : undefined,
        mp3: formData.mp3 ? `File(${formData.mp3.name})` : undefined,
        usd_spent: opts?.usd_spent
      });
      
      // Call the API
      const response = await CreateTokenService.createToken(formData);
      
      // Create success result
      const successResult: CreateTokenResult = {
        success: true,
        data: response,
        txHash: response.txHash || response.transaction_hash || undefined
      };
      
      setResult(successResult);
      onSuccess?.(successResult);
      
      console.log('[useCreateToken] Token created successfully:', successResult);
      
      return successResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Token creation failed');
      console.error('[useCreateToken] Error creating token:', error);
      
      const errorResult: CreateTokenResult = {
        success: false,
        error: error.message
      };
      
      setError(error);
      setResult(errorResult);
      onError?.(error);
      
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  /**
   * Resets the hook state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    createToken,
    isLoading,
    error,
    result,
    reset
  };
}