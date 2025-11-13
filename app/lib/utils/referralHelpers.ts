// lib/utils/referralHelpers.ts
'use client';

const REFERRAL_STORAGE_KEY = 'steakhouse_referral_code';

/**
 * Extracts referral code from URL query parameters
 * Looks for ?ref=CODE or ?referral=CODE
 */
export function getReferralCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref') || urlParams.get('referral');
}

/**
 * Stores referral code in sessionStorage for later use during registration
 */
export function storeReferralCode(code: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.setItem(REFERRAL_STORAGE_KEY, code);
    console.log('✅ Stored referral code:', code);
  } catch (error) {
    console.error('Failed to store referral code:', error);
  }
}

/**
 * Retrieves stored referral code from sessionStorage
 */
export function getReferralCodeFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return sessionStorage.getItem(REFERRAL_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to retrieve referral code:', error);
    return null;
  }
}

/**
 * Clears stored referral code from sessionStorage
 * Should be called after successfully registering with a referral
 */
export function clearReferralCodeFromStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
    console.log('✅ Cleared stored referral code');
  } catch (error) {
    console.error('Failed to clear referral code:', error);
  }
}

/**
 * Generates a shareable referral link with the user's referral code
 */
export function generateReferralLink(referralCode: string): string {
  if (typeof window === 'undefined') return '';
  
  const baseUrl = window.location.origin;
  return `${baseUrl}?ref=${encodeURIComponent(referralCode)}`;
}

/**
 * Copies referral link to clipboard
 */
export async function copyReferralLinkToClipboard(referralCode: string): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.clipboard) return false;
  
  try {
    const link = generateReferralLink(referralCode);
    await navigator.clipboard.writeText(link);
    console.log('✅ Copied referral link to clipboard:', link);
    return true;
  } catch (error) {
    console.error('Failed to copy referral link:', error);
    return false;
  }
}

/**
 * Validates referral code format
 * Add your validation rules here
 */
export function isValidReferralCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  
  // Basic validation: alphanumeric, underscores, hyphens, 3-20 characters
  const pattern = /^[a-zA-Z0-9_-]{3,20}$/;
  return pattern.test(code);
}
