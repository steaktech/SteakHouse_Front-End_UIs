// components/Modals/CreateTokenModal/apiTransform.ts
// Transformation utilities for converting modal state to API format

import { TokenState } from './types';
import { CreateTokenFormData } from '@/app/types/createToken';

/**
 * Transforms the modal's TokenState into API-compatible format
 * Following the API documentation field mappings and requirements
 * @param state - The current modal state
 * @param tokenAddress - The token address (from wallet or generated)
 * @param logoFile - Optional logo file upload
 * @param bannerFile - Optional banner file upload
 * @returns CreateTokenFormData ready for API submission
 */
export function transformTokenStateToApiData(
  state: TokenState, 
  tokenAddress: string,
  logoFile?: File,
  bannerFile?: File
): CreateTokenFormData {
  const { basics, curves, meta, profile, taxMode } = state;

  // Base transformation following API field requirements
  const apiData: CreateTokenFormData = {
    // Required field
    token_address: tokenAddress,
    
    // Optional addresses - set virtual to token_address if not provided (per client logic)
    virtual_token_address: tokenAddress, // default to token_address per client
    
    // Basic token info
    name: basics.name || undefined,
    symbol: basics.symbol || undefined,
    total_supply: basics.totalSupply || undefined,
    graduation_cap: basics.gradCap || undefined,
    
    // Timing - convert to seconds if scheduled
    start_time: basics.startMode === 'SCHEDULE' ? basics.startTime : undefined,
    created_at_timestamp: Date.now(), // milliseconds per API docs
    
    // Token type mapping based on profile
    token_type: mapProfileToTokenType(profile),
    
    // Boolean flags - only set if true (per client logic)
    is_stealth: basics.stealth ? basics.stealth : undefined,
    is_super_simple: profile === 'SUPER' ? true : undefined,
    is_zero_simple: profile === 'ZERO' ? true : undefined,
    
    // LP handling
    burn_lp: basics.lpMode === 'BURN' ? true : undefined,
    lp_lock_duration: basics.lpMode === 'LOCK' ? basics.lockDays * 24 * 60 * 60 : undefined, // convert days to seconds
    
    // State fields - initialize as per client
    eth_pool: "0",
    circulating_supply: "0",
    graduated: false,
    
    // Social media and metadata
    bio: meta.desc || undefined,
    website: meta.website || undefined,
    telegram: meta.tg || undefined,
    twitter: meta.tw || undefined,
    
    // File uploads
    logo: logoFile,
    banner: bannerFile,
    
    // Use image URLs if provided and no file uploads
    image_url: !logoFile && meta.logo ? meta.logo : undefined,
    banner_url: !bannerFile && meta.banner ? meta.banner : undefined,
  };

  // Add profile-specific curve settings
  addProfileSpecificSettings(apiData, state);

  return apiData;
}

/**
 * Maps modal profile types to API token_type values
 * @param profile - The selected profile type
 * @returns API token_type value
 */
function mapProfileToTokenType(profile: string | null): 0 | 1 | undefined {
  switch (profile) {
    case 'ZERO':
    case 'SUPER':
      return 0; // Basic type
    case 'BASIC':
    case 'ADVANCED':
      return 1; // Advanced type
    default:
      return undefined;
  }
}

/**
 * Adds profile-specific curve and tax settings to the API data
 * @param apiData - The API data object to modify
 * @param state - The modal state containing curve settings
 */
function addProfileSpecificSettings(apiData: CreateTokenFormData, state: TokenState): void {
  const { curves, profile } = state;

  if (profile === 'ZERO') {
    // Zero profile settings
    apiData.final_tax_rate = parseFloatOrUndefined(curves.finalTax.ZERO);
    
  } else if (profile === 'SUPER') {
    // Super profile settings
    apiData.curve_max_wallet = curves.super.maxWallet || undefined;
    apiData.curve_max_tx = curves.super.maxTx || undefined;
    apiData.final_tax_rate = parseFloatOrUndefined(curves.finalTax.SUPER);
    
  } else if (profile === 'BASIC') {
    // Basic profile settings - CORRECTED FIELD NAMES
    apiData.curve_starting_tax = parseFloatOrUndefined(curves.basic.startTax);
    apiData.curve_tax_duration = parseIntOrUndefined(curves.basic.taxDuration);
    apiData.curve_max_wallet = curves.basic.maxWallet || undefined;
    apiData.curve_max_wallet_duration = parseIntOrUndefined(curves.basic.maxWalletDuration);
    apiData.curve_max_tx = curves.basic.maxTx || undefined;
    apiData.curve_max_tx_duration = parseIntOrUndefined(curves.basic.maxTxDuration);
    apiData.final_tax_rate = parseFloatOrUndefined(curves.finalTax.BASIC);
    
  } else if (profile === 'ADVANCED') {
    // Advanced profile settings - CORRECTED AND ADDED FIELDS
    const adv = curves.advanced;
    apiData.curve_starting_tax = parseFloatOrUndefined(adv.startTax);
    apiData.curve_tax_duration = parseIntOrUndefined(adv.taxInterval); // tax interval = tax duration for advanced
    apiData.curve_max_wallet = adv.maxWStart || undefined;
    apiData.curve_max_tx = adv.maxTStart || undefined;
    apiData.limit_removal_time = parseIntOrUndefined(adv.removeAfter);
    apiData.tax_wallet = adv.taxReceiver || undefined;
    apiData.final_tax_rate = parseFloatOrUndefined(curves.finalTax.ADVANCED);
    
    // Step-down configs - NEWLY ADDED
    apiData.tax_drop_step = parseFloatOrUndefined(adv.taxStep);
    apiData.tax_drop_interval = parseIntOrUndefined(adv.taxInterval);
    apiData.max_wallet_step = adv.maxWStep || undefined;
    apiData.max_wallet_interval = parseIntOrUndefined(adv.maxWInterval);
    apiData.max_tx_step = adv.maxTStep || undefined;
    apiData.max_tx_interval = parseIntOrUndefined(adv.maxTInterval);
  }
}

/**
 * Safely parses a string to float, returning undefined if invalid
 * @param value - String value to parse
 * @returns Parsed float or undefined
 */
function parseFloatOrUndefined(value: string): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const parsed = parseFloat(value.replace(',', '.'));
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Safely parses a string to integer, returning undefined if invalid
 * @param value - String value to parse
 * @returns Parsed integer or undefined
 */
function parseIntOrUndefined(value: string): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}
