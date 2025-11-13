'use client';

import { useEffect } from 'react';
import { getReferralCodeFromUrl, storeReferralCode } from '@/app/lib/utils/referralHelpers';

/**
 * ReferralHandler Component
 * 
 * Detects referral codes from URL parameters and stores them for later use during registration.
 * Should be included in the root layout to capture referral codes on any page visit.
 * 
 * Usage:
 * - User visits site with ?ref=CODE or ?referral=CODE
 * - Code is stored in sessionStorage
 * - When user connects wallet and registers, code is attached automatically
 * - Code is cleared after successful registration
 */
export default function ReferralHandler() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check URL for referral code
    const referralCode = getReferralCodeFromUrl();
    
    if (referralCode) {
      console.log('🎯 Referral code detected from URL:', referralCode);
      storeReferralCode(referralCode);
      
      // Optionally show a notification to user
      // You could dispatch a toast notification here
    }
  }, []); // Run once on mount

  // This component doesn't render anything
  return null;
}
