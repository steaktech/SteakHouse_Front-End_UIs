// lib/config/constants.ts

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// External API Endpoints
export const EXTERNAL_APIS = {
  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    ENDPOINTS: {
      SIMPLE_PRICE: '/simple/price',
    },
  },
  ETHEREUM: {
    MAINNET_RPC: 'https://mainnet.infura.io/v3',
    METHODS: {
      GAS_PRICE: 'eth_gasPrice',
    },
  },
} as const;

// Price refresh intervals (in milliseconds)
export const PRICE_REFRESH_INTERVALS = {
  GAS_PRICE: 30000, // 30 seconds
  ETH_PRICE: 30000, // 30 seconds
} as const;

// Default placeholder image for tokens
export const DEFAULT_TOKEN_IMAGE = '/images/info_icon.jpg';

// Token launch type mappings
export const TOKEN_LAUNCH_TYPES = {
  0: 'Zero',
  1: 'Simple', 
  2: 'Basic',
  3: 'Advanced'
} as const;

// Token launch type descriptions
export const TOKEN_LAUNCH_DESCRIPTIONS = {
  'Zero': 'No tax, no limits, no max wallet',
  'Simple': 'No tax, limits and max wallet apply',
  'Basic': 'Static tax and limits for a set duration of time then lifted',
  'Advanced': 'Block based incremental tax decrease and limits increase'
} as const;

// Token tag colors based on launch type
export const TOKEN_TAG_COLORS = {
  'Zero': 'bg-green-500/20 text-green-300',
  'Simple': 'bg-blue-500/20 text-blue-300',
  'Basic': 'bg-orange-500/20 text-orange-300',
  'Advanced': 'bg-purple-500/20 text-purple-300'
} as const;

// Legacy token type mappings (for backward compatibility if needed)
export const LEGACY_TOKEN_TYPE_LABELS = {
  0: 'Meme',
  1: 'Utility',
  2: 'AI',
  3: 'X-post'
} as const;
