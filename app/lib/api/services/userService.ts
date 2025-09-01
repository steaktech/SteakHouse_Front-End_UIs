// lib/api/services/userService.ts
import { apiClient } from '../client';
import type { UserProfile, AddUserPayload } from '@/app/types/user';

interface SuccessResponse {
  success: boolean;
}

/**
 * Adds a new user.
 * [cite_start]POST /addUser [cite: 7]
 */
export async function addUser(payload: AddUserPayload): Promise<SuccessResponse> {
  return apiClient<SuccessResponse>('/addUser', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Fetches a full user profile by wallet address.
 * [cite_start]GET /users/:wallet [cite: 21]
 */
export async function fetchUserProfile(walletAddress: string): Promise<UserProfile> {
  return apiClient<UserProfile>(`/users/${walletAddress}`);
}

/**
 * Saves a token to a user's profile.
 * [cite_start]POST /users/:wallet/saved [cite: 72]
 */
export async function saveToken(walletAddress: string, tokenAddress: string): Promise<SuccessResponse> {
  return apiClient<SuccessResponse>(`/users/${walletAddress}/saved`, {
    method: 'POST',
    body: JSON.stringify({ token_address: tokenAddress }),
  });
}

/**
 * Likes a token for a user.
 * [cite_start]POST /users/:wallet/liked [cite: 82]
 */
export async function likeToken(walletAddress: string, tokenAddress: string): Promise<SuccessResponse> {
  return apiClient<SuccessResponse>(`/users/${walletAddress}/liked`, {
    method: 'POST',
    body: JSON.stringify({ token_address: tokenAddress }),
  });
}

/**
 * Removes a saved token from a user's profile.
 * [cite_start]DELETE /users/:wallet/saved/:token [cite: 91]
 */
export async function removeSavedToken(walletAddress: string, tokenAddress: string): Promise<SuccessResponse> {
  return apiClient<SuccessResponse>(`/users/${walletAddress}/saved/${tokenAddress}`, {
    method: 'DELETE',
  });
}

/**
 * Removes a liked token from a user's profile.
 * [cite_start]DELETE /users/:wallet/liked/:token [cite: 98]
 */
export async function removeLikedToken(walletAddress: string, tokenAddress: string): Promise<SuccessResponse> {
  return apiClient<SuccessResponse>(`/users/${walletAddress}/liked/${tokenAddress}`, {
    method: 'DELETE',
  });
}

// Note: Functions for file uploads (profile picture) would require a different
// client setup that handles multipart/form-data and are omitted here for simplicity.