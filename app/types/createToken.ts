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
  graduation_timestamp?: number;
  start_time?: number;
  created_at_block?: number;
  created_at_timestamp?: number;
  
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
  
  // Curve & policy params
  final_tax_rate?: number;
  lp_lock_duration?: number;
  burn_lp?: boolean;
  limit_removal_time?: number;
  
  // Curve limits (using naming convention from API docs)
  curve_max_wallet?: string;
  curve_max_tx?: string;
  curve_start_tax?: string;
  curve_tax_duration?: string;
  curve_tax_step?: string;
  curve_tax_interval?: string;
  
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
