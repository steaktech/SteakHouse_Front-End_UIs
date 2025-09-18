import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { saveToken, removeSavedToken } from '@/app/lib/api/services/userService';

export interface UseSaveTokenReturn {
  isSaved: boolean;
  isLoading: boolean;
  error: string | null;
  toggleSave: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing token save/unsave functionality
 * Integrates with wallet connection and user service API
 */
export function useSaveToken(tokenAddress: string, initialSavedState = false): UseSaveTokenReturn {
  const { isConnected, address } = useWallet();
  const [isSaved, setIsSaved] = useState(initialSavedState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const toggleSave = useCallback(async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet to save tokens');
      return;
    }

    if (!tokenAddress) {
      setError('Invalid token address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isSaved) {
        // Remove from saved tokens
        await removeSavedToken(address, tokenAddress);
        setIsSaved(false);
      } else {
        // Add to saved tokens
        await saveToken(address, tokenAddress);
        setIsSaved(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update saved token';
      setError(errorMessage);
      console.error('Save token error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, tokenAddress, isSaved]);

  return {
    isSaved,
    isLoading,
    error,
    toggleSave,
    clearError,
  };
}
