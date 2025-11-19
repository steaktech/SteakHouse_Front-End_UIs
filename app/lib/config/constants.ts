// lib/config/constants.ts

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

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

// Token type mappings
export const TOKEN_TYPE_LABELS = {
  0: 'Basic',
  1: 'Advanced',
  2: 'Stealth',
  3: 'Super Simple',
  4: 'Zero Simple'
} as const;

// Token tag colors based on type
export const TOKEN_TAG_COLORS = {
  'Basic': 'bg-blue-500/20 text-blue-300',
  'Advanced': 'bg-purple-500/20 text-purple-300',
  'Stealth': 'bg-gray-500/20 text-gray-300',
  'Super Simple': 'bg-green-500/20 text-green-300',
  'Zero Simple': 'bg-yellow-500/20 text-yellow-300',
  'Meme': 'bg-[#fade79] text-black',
  'Utility': 'bg-orange-500/20 text-orange-300'
} as const;

// ========== WEB3 CONFIGURATION ==========

// Network Configuration
export const NETWORKS = {
  MAINNET: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  SEPOLIA: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ethereum',
      symbol: 'SepoliaETH',
      decimals: 18,
    },
  },
  BASE: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
} as const;

// Web3 Contract Configuration
export const WEB3_CONFIG = {
  // 🔧 NETWORK SWITCHING: Change this line to switch networks
  // Options: 'SEPOLIA' (testnet), 'MAINNET' (production), 'BASE' 
  ACTIVE_NETWORK: 'SEPOLIA' as keyof typeof NETWORKS, // 🧪 Currently: Sepolia Testnet
  
  // Kitchen Contract Address (from environment)
  KITCHEN_ADDRESS: process.env.NEXT_PUBLIC_KITCHEN_CONTRACT_ADDRESS as string,
  
  // Network-specific Kitchen addresses for multi-chain support
  KITCHEN_ADDRESSES: {
    1: process.env.NEXT_PUBLIC_KITCHEN_CONTRACT_ADDRESS_MAINNET, // Mainnet
    11155111: process.env.NEXT_PUBLIC_KITCHEN_CONTRACT_ADDRESS_SEPOLIA || process.env.NEXT_PUBLIC_KITCHEN_CONTRACT_ADDRESS, // Sepolia (fallback to main address)
    8453: process.env.NEXT_PUBLIC_KITCHEN_CONTRACT_ADDRESS_BASE, // Base
  },
  
  // KitchenUtils Contract Address (for dev tooling and quotes)
  KITCHEN_UTILS_ADDRESS: process.env.NEXT_PUBLIC_KITCHEN_UTILS_CONTRACT_ADDRESS as string,
  
  // Network-specific KitchenUtils addresses
  KITCHEN_UTILS_ADDRESSES: {
    1: process.env.NEXT_PUBLIC_KITCHEN_UTILS_CONTRACT_ADDRESS_MAINNET,
    11155111: process.env.NEXT_PUBLIC_KITCHEN_UTILS_CONTRACT_ADDRESS_SEPOLIA || process.env.NEXT_PUBLIC_KITCHEN_UTILS_CONTRACT_ADDRESS,
    8453: process.env.NEXT_PUBLIC_KITCHEN_UTILS_CONTRACT_ADDRESS_BASE,
  },
  
  // Default chain configuration (dynamically set based on active network)
  get DEFAULT_CHAIN_ID() {
    return NETWORKS[this.ACTIVE_NETWORK].chainId;
  },
  
  // Gas Configuration
  GAS: {
    DEFAULT_LIMIT: parseInt(process.env.NEXT_PUBLIC_DEFAULT_GAS_LIMIT || '500000', 10),
    MAX_PRIORITY_FEE_GWEI: parseInt(process.env.NEXT_PUBLIC_MAX_PRIORITY_FEE_GWEI || '2', 10),
    PRICE_MULTIPLIER: parseFloat(process.env.NEXT_PUBLIC_GAS_PRICE_MULTIPLIER || '1.2'),
    
    // Method-specific gas limits based on Kitchen contract functions
    LIMITS: {
      BUY_TOKEN: 250000,
      SELL_TOKEN: 200000,
      CREATE_BASIC_TOKEN: 3000000,
      CREATE_ADVANCED_TOKEN: 3500000,
      CREATE_SUPER_SIMPLE_TOKEN: 2500000,
      CREATE_ZERO_SIMPLE_TOKEN: 2000000,
    },
  },
  
  // Transaction Configuration
  TRANSACTION: {
    CONFIRMATION_BLOCKS: 1,
    MAX_RETRIES: 10,
    RETRY_INTERVAL: 5000, // 5 seconds
    TIMEOUT: 300000, // 5 minutes
  },
  
  // Slippage Configuration
  SLIPPAGE: {
    DEFAULT: 0.5, // 0.5%
    MAX: 10, // 10%
    MIN: 0.1, // 0.1%
  },
} as const;

// Helper functions for network management
export const getCurrentNetwork = () => {
  return NETWORKS[WEB3_CONFIG.ACTIVE_NETWORK];
};

export const getCurrentChainId = () => {
  return getCurrentNetwork().chainId;
};

export const getCurrentCurrencySymbol = () => {
  return getCurrentNetwork().nativeCurrency.symbol;
};

// Get Kitchen contract address for specific chain
export const getKitchenAddress = (chainId?: number): string => {
  const targetChainId = chainId || getCurrentChainId();
  
  return WEB3_CONFIG.KITCHEN_ADDRESSES[targetChainId as keyof typeof WEB3_CONFIG.KITCHEN_ADDRESSES] 
    || WEB3_CONFIG.KITCHEN_ADDRESS;
};

// Get KitchenUtils contract address for specific chain
export const getKitchenUtilsAddress = (chainId?: number): string => {
  const targetChainId = chainId || getCurrentChainId();
  
  return WEB3_CONFIG.KITCHEN_UTILS_ADDRESSES[targetChainId as keyof typeof WEB3_CONFIG.KITCHEN_UTILS_ADDRESSES] 
    || WEB3_CONFIG.KITCHEN_UTILS_ADDRESS;
};

// Easy network switching function
export const switchToNetwork = (networkName: keyof typeof NETWORKS) => {
  // This would be used in development to easily switch networks
  console.log(`🔄 Switching to ${networkName} network`);
  console.log(`📍 Chain ID: ${NETWORKS[networkName].chainId}`);
  console.log(`💰 Currency: ${NETWORKS[networkName].nativeCurrency.symbol}`);
  
  // In a real implementation, you might want to update environment variables
  // or use a state management solution to persist the network choice
};

// Validation function to ensure required environment variables are set
export const validateWeb3Config = () => {
  const requiredVars = [
    'NEXT_PUBLIC_KITCHEN_CONTRACT_ADDRESS',
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn('Missing required Web3 environment variables:', missing);
    return false;
  }
  
  // Validate contract address format
  if (WEB3_CONFIG.KITCHEN_ADDRESS && !/^0x[a-fA-F0-9]{40}$/.test(WEB3_CONFIG.KITCHEN_ADDRESS)) {
    console.error('Invalid Kitchen contract address format:', WEB3_CONFIG.KITCHEN_ADDRESS);
    return false;
  }
  
  return true;
};