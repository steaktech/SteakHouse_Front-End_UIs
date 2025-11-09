// types/createToken.ts
// API types for token creation endpoint following codebase patterns

export interface CreateTokenApiRequest {
  // Required fields
  token_address: string;
  
  // Optional addresses
  virtual_token_address?: string;
  real_token_address?: string;
  creator?: string;
  tax_wallet?: string;
  steakhouse_treasury_basic?: string;
  
  // Status & timing
  graduated?: boolean;
  graduation_timestamp?: number; // seconds
  start_time?: number; // seconds
  created_at_block?: number;
  created_at_timestamp?: number; // milliseconds
  
  // Identity & media
  name?: string;
  symbol?: string;
  image_url?: string;
  banner_url?: string;
  
  // Big numbers (as strings)
  total_supply?: string;
  graduation_cap?: string;
  eth_pool?: string;
  circulating_supply?: string;
  
  // Enums & flags
  token_type?: 0 | 1;
  is_stealth?: boolean;
  is_super_simple?: boolean;
  is_zero_simple?: boolean;
  
  /**
   * Explicit profile choice for backend routing: 'basic' | 'advanced' | 'simple' | 'zero'
   * Only set for virtual-curve flows where a profile is selected.
   */
  tokenChoice?: 'basic' | 'advanced' | 'simple' | 'zero';
  
  // Curve & policy params - CORRECTED FIELD NAMES
  curve_starting_tax?: number; // percent (was curve_start_tax)
  curve_tax_duration?: number; // seconds
  curve_max_wallet?: string; // tokens (uint256)
  curve_max_wallet_duration?: number; // seconds
  curve_max_tx?: string; // tokens (uint256) 
  curve_max_tx_duration?: number; // seconds
  final_tax_rate?: number; // percent
  lp_lock_duration?: number; // seconds
  burn_lp?: boolean;
  limit_removal_time?: number; // seconds
  
  // Step-down configs - MISSING FIELDS ADDED
  tax_drop_step?: number; // percent step
  tax_drop_interval?: number; // seconds
  max_wallet_step?: string; // tokens (uint256)
  max_wallet_interval?: number; // seconds
  max_tx_step?: string; // tokens (uint256)
  max_tx_interval?: number; // seconds
  
  // Social/meta
  bio?: string;
  telegram?: string;
  twitter?: string;
  website?: string;
}

export interface CreateTokenApiResponse {
  // This will be the JSON row returned by the API
  [key: string]: any;
}

export interface CreateTokenFormData extends CreateTokenApiRequest {
  // File uploads
  logo?: File;
  banner?: File;
}

export interface CreateTokenResult {
  success: boolean;
  data?: CreateTokenApiResponse;
  error?: string;
  txHash?: string;
}

export interface FileUploads {
  logo?: File;
  banner?: File;
}
