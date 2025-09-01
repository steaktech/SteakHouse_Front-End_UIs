// lib/api/services/userService.ts
import { apiClient } from '../client';
import type { 
  UserProfile, 
  AddUserPayload, 
  UpdateProfilePayload, 
  UpdateProfileResponse
} from '@/app/types/user';

interface SuccessResponse {
  success: boolean;
}

/**
 * Adds a new user.
 * [cite_start]POST /addUser [cite: 7]
 */
export async function addUser(payload: AddUserPayload): Promise<SuccessResponse> {
  console.log('addUser called with:', payload);
  try {
    const result = await apiClient<SuccessResponse>('/addUser', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    console.log('addUser success:', result);
    return result;
  } catch (error) {
    console.error('addUser error:', error);
    // If the user already exists, treat it as success to prevent repeated calls
    if (error instanceof Error && error.message.includes('already exists')) {
      console.log('User already exists, treating as success');
      return { success: true };
    }
    throw error;
  }
}

/**
 * Fetches a full user profile by wallet address.
 * [cite_start]GET /users/:wallet [cite: 21]
 */
export async function fetchUserProfile(walletAddress: string): Promise<UserProfile> {
  console.log('fetchUserProfile called with:', walletAddress);
  try {
    const result = await apiClient<UserProfile>(`/users/${walletAddress}`);
    console.log('fetchUserProfile success:', result);
    return result;
  } catch (error) {
    console.error('fetchUserProfile error:', error);
    throw error;
  }
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

/**
 * Updates a user's profile information.
 * Supports both JSON and multipart form data depending on whether a file is included.
 * POST /users/:wallet/updateProfile
 */
export async function updateUserProfile(walletAddress: string, payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  console.log('updateUserProfile called with:', { walletAddress, payload });
  
  try {
    // Check if payload contains a File object for profile_picture
    const hasFile = payload.profile_picture instanceof File;
    const hasProfilePictureUpdate = 'profile_picture' in payload;
    
    if (hasFile || (hasProfilePictureUpdate && payload.profile_picture === null)) {
      // Use multipart form data when uploading a file or deleting profile picture
      const formData = new FormData();
      
      // Add text fields
      if (payload.username !== undefined) {
        formData.append('username', payload.username);
      }
      if (payload.bio !== undefined) {
        formData.append('bio', payload.bio);
      }
      
      // Add file
      if (payload.profile_picture instanceof File) {
        formData.append('profile_picture', payload.profile_picture);
      }
      
      // Handle profile picture deletion
      if (hasProfilePictureUpdate && payload.profile_picture === null) {
        formData.append('delete_profile_picture', 'true');
      }
      
      // Use fetch directly for multipart form data
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${API_URL}/users/${walletAddress}/updateProfile`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Profile update failed: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('updateUserProfile success (multipart):', result);
      return result;
    } else {
      // Use JSON for text-only updates
      const result = await apiClient<UpdateProfileResponse>(`/users/${walletAddress}/updateProfile`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log('updateUserProfile success (json):', result);
      return result;
    }
  } catch (error) {
    console.error('updateUserProfile error:', error);
    throw error;
  }
}



/**
 * Deletes a user's profile picture by updating profile with null.
 * Uses the unified updateUserProfile function.
 */
export async function deleteProfilePicture(walletAddress: string): Promise<UpdateProfileResponse> {
  return updateUserProfile(walletAddress, { profile_picture: null });
}