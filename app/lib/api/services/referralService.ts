// lib/api/services/referralService.ts
import { apiClient } from '../client';

/**
 * Payload for attaching a referral connection
 */
export interface AttachReferralPayload {
  referee_wallet: string;   // Trading wallet of the person signing up
  referral_code: string;    // Referral code of the referrer
}

/**
 * Response from attaching a referral
 */
export interface AttachReferralResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Payload for updating a user's referral code
 */
export interface UpdateReferralCodePayload {
  wallet: string;           // Trading wallet of the user
  referral_code: string;    // New referral code to set
}

/**
 * Response from updating referral code
 */
export interface UpdateReferralCodeResponse {
  wallet: string;
  referral_code: string;
}

/**
 * Error response from referral code update
 */
export interface ReferralCodeErrorResponse {
  error: string; // 'referral code not allowed' | 'referral code already taken' | 'internal error'
}

/**
 * Attaches a new user to their referrer via referral code
 * POST /api/referrals/attach
 */
export async function attachReferral(
  payload: AttachReferralPayload
): Promise<AttachReferralResponse> {
  console.log('attachReferral called with:', payload);
  try {
    const result = await apiClient<AttachReferralResponse>('/referrals/attach', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    console.log('attachReferral success:', result);
    return result;
  } catch (error) {
    console.error('attachReferral error:', error);
    throw error;
  }
}

/**
 * Updates a user's referral code to a custom one
 * POST /api/referrals/code/update
 * 
 * Possible responses:
 * - 400: { error: 'referral code not allowed' }
 * - 409: { error: 'referral code already taken' }
 * - 500: { error: 'internal error' }
 * - 200: { wallet, referral_code }
 */
export async function updateReferralCode(
  payload: UpdateReferralCodePayload
): Promise<UpdateReferralCodeResponse> {
  console.log('updateReferralCode called with:', payload);
  
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!API_URL) throw new Error('Missing NEXT_PUBLIC_API_BASE_URL');

  const url = `${API_URL}/referrals/code/update`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    const result = await response.json();
    console.log('updateReferralCode success:', result);
    return result as UpdateReferralCodeResponse;
  }

  // Handle error responses
  const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
  const errorMsg = errorData.error || `Request failed with status ${response.status}`;
  
  console.error('updateReferralCode error:', response.status, errorMsg);
  throw new Error(errorMsg);
}
