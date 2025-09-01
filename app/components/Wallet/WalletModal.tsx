'use client';

import { useWallet } from '@/app/hooks/useWallet';
import { useState } from 'react';
import Image from 'next/image';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
}

export default function WalletModal({ isOpen, onClose, isConnected }: WalletModalProps) {
  const { connectors, connect, disconnect, address, balanceFormatted, chainId } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async (connectorId: string) => {
    try {
      setIsConnecting(true);
      await connect(connectorId);
      onClose();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      onClose();
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-b from-[#2d1810] to-[#1a0f08] border border-[#8b4513] rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#d4af37]">
            {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {isConnected ? (
          /* Connected State */
          <div className="space-y-4">
            <div className="bg-[#1a0f08] rounded-lg p-4 border border-[#8b4513]/30">
              <div className="text-sm text-gray-400 mb-1">Address</div>
              <div className="text-white font-mono text-sm break-all">
                {address && formatAddress(address)}
              </div>
            </div>
            
            {balanceFormatted && (
              <div className="bg-[#1a0f08] rounded-lg p-4 border border-[#8b4513]/30">
                <div className="text-sm text-gray-400 mb-1">Balance</div>
                <div className="text-white font-semibold">
                  {parseFloat(balanceFormatted).toFixed(4)} ETH
                </div>
              </div>
            )}

            <div className="bg-[#1a0f08] rounded-lg p-4 border border-[#8b4513]/30">
              <div className="text-sm text-gray-400 mb-1">Network</div>
              <div className="text-white">
                Chain ID: {chainId}
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          /* Connection State */
          <div className="space-y-3">
            <p className="text-gray-300 text-sm mb-4">
              Choose how you'd like to connect your wallet:
            </p>
            
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => handleConnect(connector.id)}
                disabled={!connector.ready || isConnecting}
                className="w-full flex items-center space-x-3 p-4 bg-[#1a0f08] hover:bg-[#2d1810] border border-[#8b4513]/30 hover:border-[#d4af37]/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center text-black font-bold text-sm">
                  {connector.name.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-white font-semibold">{connector.name}</div>
                  <div className="text-sm text-gray-400">
                    {!connector.ready ? 'Not installed' : 'Ready to connect'}
                  </div>
                </div>
                {isConnecting && (
                  <div className="w-5 h-5 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}
            
            {/* <div className="text-xs text-gray-500 mt-4 text-center">
              By connecting, you agree to our Terms of Service and Privacy Policy
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}
