'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { useCallback, useMemo } from 'react';

// Extend Window interface for MetaMask detection
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request?: (...args: any[]) => Promise<any>;
      on?: (eventName: string, callback: (...args: any[]) => void) => void;
      removeListener?: (eventName: string, callback: (...args: any[]) => void) => void;
      removeAllListeners?: (eventName?: string) => void;
      selectedAddress?: string | null;
      chainId?: string;
      networkVersion?: string;
      _metamask?: {
        isUnlocked?: () => Promise<boolean>;
      };
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
    // Remove duplicates by creating a unique set based on connector functionality
    const uniqueConnectors: any[] = [];
    const seenTypes = new Set<string>();
    
    connectors.forEach(connector => {
      let connectorType = connector.id;
      
      // Special handling for injected wallets - only keep one
      if (connector.id === 'injected' || connector.id === 'metaMask' || connector.id === 'io.metamask') {
        connectorType = 'injected';
      }
      
      if (!seenTypes.has(connectorType)) {
        seenTypes.add(connectorType);
        uniqueConnectors.push(connector);
      }
    });
    
    return uniqueConnectors.map(connector => {
      const isReady = connector.id === 'walletConnect' ? true : // WalletConnect is always ready
        connector.id === 'coinbaseWallet' || connector.id === 'coinbaseWalletSDK' ? true : // Coinbase wallet is always ready
        typeof window !== 'undefined' && window.ethereum !== undefined; // Injected wallets

      return {
        id: connector.id,
        name: getConnectorName(connector.id, connector.name),
        ready: isReady,
        icon: getConnectorIcon(connector.id),
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
  if (connectorId === 'injected') {
    if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
      return 'MetaMask';
    }
    return 'Browser Wallet';
  }
  
  if (connectorId === 'io.metamask') {
    return 'MetaMask';
  }
  
  const nameMap: Record<string, string> = {
    walletConnect: 'WalletConnect',
    coinbaseWallet: 'Coinbase Wallet',
    coinbaseWalletSDK: 'Coinbase Wallet',
  };
  
  return nameMap[connectorId] || defaultName;
}

// Helper function to get connector icons
function getConnectorIcon(connectorId: string): string {
  if (connectorId === 'injected') {
    if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
      return '/images/metamask.png';
    }
    return '/images/wallet.png';
  }
  
  if (connectorId === 'io.metamask') {
    return '/images/metamask.png';
  }
  
  const iconMap: Record<string, string> = {
    walletConnect: '/images/walletconnect.png',
    coinbaseWallet: '/images/coinbase.png',
    coinbaseWalletSDK: '/images/coinbase.png',
  };
  
  return iconMap[connectorId] || '/images/wallet.png';
}
