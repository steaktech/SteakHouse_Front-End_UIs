import { createConfig, http, Config } from 'wagmi';
import { mainnet, sepolia, polygon, bsc, arbitrum, base } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors';

// WalletConnect Project ID - Get this from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'temp-project-id';

// App metadata for WalletConnect
const metadata = {
  name: 'Trading Platform',
  description: 'Advanced Trading Platform with Token Creation',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.com',
  icons: ['https://yourapp.com/icon.png'],
};

// Configure supported chains
export const chains = [mainnet, sepolia, polygon, bsc, arbitrum, base] as const;

// Cache for the config
let _config: Config | null = null;

// Function to create wagmi config dynamically
export function getWagmiConfig(): Config {
  if (_config) {
    return _config;
  }

  const connectors = [];
  
  // Always include injected connector (MetaMask, etc.)
  connectors.push(injected());
  
  // Only add WalletConnect and Coinbase on client side
  if (typeof window !== 'undefined') {
    try {
      // Add WalletConnect
      connectors.push(
        walletConnect({
          projectId,
          metadata,
          showQrModal: true,
        })
      );
      
      // Add Coinbase Wallet
      connectors.push(
        coinbaseWallet({
          appName: metadata.name,
          appLogoUrl: metadata.icons[0],
        })
      );
    } catch (error) {
      console.warn('Failed to initialize some wallet connectors:', error);
    }
  }

  _config = createConfig({
    chains,
    connectors,
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [polygon.id]: http(),
      [bsc.id]: http(),
      [arbitrum.id]: http(),
      [base.id]: http(),
    },
    ssr: true,
  });

  return _config;
}

// Create a basic config for SSR (server-side) with minimal connectors
const ssrConfig = createConfig({
  chains,
  connectors: [injected()], // Only injected connector for SSR
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
});

// Export the appropriate config based on environment
export const wagmiConfig = typeof window !== 'undefined' ? getWagmiConfig() : ssrConfig;

// Export types for better TypeScript support
export type SupportedChain = typeof chains[number];
