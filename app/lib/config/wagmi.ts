import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, polygon, bsc, arbitrum } from 'wagmi/chains';
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
export const chains = [mainnet, sepolia, polygon, bsc, arbitrum] as const;

// Configure connectors
const connectors = [
  injected(),
  walletConnect({
    projectId,
    metadata,
    showQrModal: true,
  }),
  coinbaseWallet({
    appName: metadata.name,
    appLogoUrl: metadata.icons[0],
  }),
];

// Create and export Wagmi config
export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: true, // Enable SSR support for Next.js
});

// Export types for better TypeScript support
export type SupportedChain = typeof chains[number];
