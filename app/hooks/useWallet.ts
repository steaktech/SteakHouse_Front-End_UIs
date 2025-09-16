'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { useCallback, useMemo } from 'react';

// Extend Window interface for MetaMask detection
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request?: (...args: any[]) => Promise<any>;
    };
  }
}

export interface WalletState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  
  // Account info
  address: string | undefined;
  chainId: number | undefined;
  
  // Balance info
  balance: string | undefined;
  balanceFormatted: string | undefined;
  
  // Actions
  connect: (connectorId?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Available connectors
  connectors: Array<{
    id: string;
    name: string;
    ready: boolean;
    icon?: string;
  }>;
  
  // Error states
  error: Error | null;
}

export function useWallet(): WalletState {
  const account = useAccount();
  const { connect: wagmiConnect, connectors, isPending: isConnecting, error } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  
  const { data: balance } = useBalance({
    address: account.address,
  });

  // Connect function with error handling
  const connect = useCallback(async (connectorId?: string) => {
    try {
      const connector = connectorId 
        ? connectors.find(c => c.id === connectorId) 
        : connectors[0]; // Default to first available connector
      
      if (!connector) {
        throw new Error('No connector available');
      }
      
      await wagmiConnect({ connector });
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      throw err;
    }
  }, [connectors, wagmiConnect]);

  // Disconnect function
  const disconnect = useCallback(async () => {
    try {
      await wagmiDisconnect();
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      throw err;
    }
  }, [wagmiDisconnect]);

  // Format connectors for easier use
  const formattedConnectors = useMemo(() => {
    // Create a clean list of unique connectors with MetaMask first
    const uniqueConnectors: any[] = [];
    const seenNames = new Set<string>();
    
    // Always add MetaMask first if we have an injected connector
    const injectedConnector = connectors.find(c => 
      c.id === 'injected' || c.id === 'metaMask' || c.id === 'io.metamask'
    );
    
    if (injectedConnector) {
      uniqueConnectors.push({
        ...injectedConnector,
        _forceName: 'MetaMask', // Force the name to be MetaMask
        _forceIcon: 'metamask'
      });
      seenNames.add('MetaMask');
    }
    
    // Then add other unique connectors - but detect wallet types properly
    connectors.forEach(connector => {
      // Skip injected wallets since we already added MetaMask
      if (connector.id === 'injected' || connector.id === 'metaMask' || connector.id === 'io.metamask') {
        return;
      }
      
      const connectorName = getConnectorName(connector.id, connector.name);
      
      // Only add if we haven't seen this name before
      if (!seenNames.has(connectorName)) {
        seenNames.add(connectorName);
        uniqueConnectors.push(connector);
      }
    });
    
    return uniqueConnectors.map(connector => {
      const isReady = connector.id === 'walletConnect' ? true : // WalletConnect is always ready
        connector.id === 'coinbaseWallet' || connector.id === 'coinbaseWalletSDK' ? true : // Coinbase wallet is always ready
        typeof window !== 'undefined' && window.ethereum !== undefined; // Injected wallets

      return {
        id: connector.id,
        name: connector._forceName || getConnectorName(connector.id, connector.name),
        ready: isReady,
        icon: getConnectorIcon(connector.id, connector._forceIcon),
      };
    });
  }, [connectors]);

  return {
    // Connection state
    isConnected: account.isConnected,
    isConnecting,
    isReconnecting: account.isReconnecting,
    
    // Account info
    address: account.address,
    chainId: account.chainId,
    
    // Balance info
    balance: balance?.value.toString(),
    balanceFormatted: balance?.formatted,
    
    // Actions
    connect,
    disconnect,
    
    // Connectors
    connectors: formattedConnectors,
    
    // Error state
    error,
  };
}

// Helper function to get connector name
function getConnectorName(connectorId: string, defaultName: string): string {
  // Direct mapping for known connectors
  const nameMap: Record<string, string> = {
    walletConnect: 'WalletConnect',
    coinbaseWallet: 'Coinbase Wallet',
    coinbaseWalletSDK: 'Coinbase Wallet',
    'io.metamask': 'MetaMask',
    metaMask: 'MetaMask',
    injected: 'MetaMask', // Always treat injected as MetaMask
    rainbow: 'Rainbow',
    phantom: 'Phantom',
  };
  
  return nameMap[connectorId] || defaultName || 'Unknown Wallet';
}

// Helper function to get connector icons
function getConnectorIcon(connectorId: string, forceIcon?: string): string {
  // Handle forced icon first
  if (forceIcon === 'metamask') {
    return '/images/metamask-wallet.webp';
  }
  
  // Comprehensive mapping of all possible connector identifiers to icons
  const walletIconMap: Record<string, string> = {
    // Rainbow wallet variations
    'rainbow': '/images/rainbow-wallet.webp',
    'rainbowWallet': '/images/rainbow-wallet.webp',
    'rainbow-wallet': '/images/rainbow-wallet.webp',
    'com.rainbow': '/images/rainbow-wallet.webp',
    'me.rainbow': '/images/rainbow-wallet.webp',
    
    // Phantom wallet variations
    'phantom': '/images/phantom-wallet.webp',
    'phantomWallet': '/images/phantom-wallet.webp',
    'phantom-wallet': '/images/phantom-wallet.webp',
    'app.phantom': '/images/phantom-wallet.webp',
    
    // WalletConnect variations
    'walletConnect': '/images/walletconnect-wallet.webp',
    'walletconnect': '/images/walletconnect-wallet.webp',
    'wallet-connect': '/images/walletconnect-wallet.webp',
    
    // Coinbase wallet variations
    'coinbaseWallet': '/images/coinbase-wallet.webp',
    'coinbaseWalletSDK': '/images/coinbase-wallet.webp',
    'coinbase-wallet': '/images/coinbase-wallet.webp',
    'coinbase': '/images/coinbase-wallet.webp',
    
    // MetaMask variations
    'metaMask': '/images/metamask-wallet.webp',
    'metamask': '/images/metamask-wallet.webp',
    'io.metamask': '/images/metamask-wallet.webp',
    'injected': '/images/metamask-wallet.webp',
  };
  
  // Check direct connector ID match first
  if (walletIconMap[connectorId]) {
    return walletIconMap[connectorId];
  }
  
  // Check by connector name (converted to lowercase)
  const connectorName = getConnectorName(connectorId, '').toLowerCase().replace(/\s+/g, '');
  const nameBasedMatch = walletIconMap[connectorName];
  if (nameBasedMatch) {
    return nameBasedMatch;
  }
  
  // Check if the name contains any wallet keywords
  if (connectorName.includes('rainbow')) {
    return '/images/rainbow-wallet.webp';
  }
  if (connectorName.includes('phantom')) {
    return '/images/phantom-wallet.webp';
  }
  if (connectorName.includes('coinbase')) {
    return '/images/coinbase-wallet.webp';
  }
  if (connectorName.includes('walletconnect')) {
    return '/images/walletconnect-wallet.webp';
  }
  
  // Default fallback to MetaMask
  return '/images/metamask-wallet.webp';
}
