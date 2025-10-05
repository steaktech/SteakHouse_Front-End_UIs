'use client';

import { useWallet } from '@/app/hooks/useWallet';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { addUser } from '@/app/lib/api/services/userService';
import type { AddUserPayload } from '@/app/types/user';
import { UserProfileModal } from '../UserProfileModal';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
}

export default function WalletModal({ isOpen, onClose, isConnected }: WalletModalProps) {
  const { connectors, connect, disconnect, address, balanceFormatted, chainId } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRegisteringUser, setIsRegisteringUser] = useState(false);
  const [userRegistrationError, setUserRegistrationError] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Define registerUser function with useCallback to prevent unnecessary re-renders
  const registerUser = useCallback(async (walletAddress: string) => {
    try {
      setIsRegisteringUser(true);
      setUserRegistrationError(null);
      
      const payload: AddUserPayload = {
        wallet_address: walletAddress
      };
      
      const response = await addUser(payload);
      console.log('User registered successfully:', walletAddress, response);
    } catch (error) {
      console.error('User registration failed:', error);
      setUserRegistrationError(error instanceof Error ? error.message : 'Failed to register user');
    } finally {
      setIsRegisteringUser(false);
    }
  }, []);

  // Note: We intentionally do NOT auto-register on refresh or auto-reconnect.
  // Registration happens explicitly after a manual connect action.

  // Clear error state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUserRegistrationError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async (connectorId: string) => {
    try {
      setIsConnecting(true);
      setUserRegistrationError(null);
      
      let connectedAddress = await connect(connectorId);
      
      // Fallback: if address not returned yet, attempt to read from provider
      if (!connectedAddress && typeof window !== 'undefined' && (window as any).ethereum?.request) {
        try {
          const accounts: string[] = await (window as any).ethereum.request({ method: 'eth_accounts' });
          connectedAddress = accounts?.[0];
        } catch {}
      }
      
      if (connectedAddress && !isRegisteringUser) {
        await registerUser(connectedAddress);
      }
      
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
            {/* User Registration Status */}
            {isRegisteringUser && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <div className="text-blue-400 text-sm">Registering user...</div>
                </div>
              </div>
            )}
            
            {/* User Registration Error */}
            {userRegistrationError && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <div className="text-red-400 text-sm">
                  Registration failed: {userRegistrationError}
                </div>
              </div>
            )}

            {/* Wallet Summary */}
            <div className="bg-[#1a0f08] rounded-lg p-4 border border-[#8b4513]/30">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-400">Connected Wallet</div>
                <div className="text-xs text-gray-500">Chain ID: {chainId}</div>
              </div>
              <div className="text-white font-mono text-sm break-all mb-2">
                {address && formatAddress(address)}
              </div>
              {balanceFormatted && (
                <div className="text-gray-300 text-sm">
                  Balance: {parseFloat(balanceFormatted).toFixed(4)} ETH
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-full bg-[#d4af37] hover:bg-[#f4d03f] text-[#1a0f08] py-3 px-4 rounded-lg transition-colors font-semibold"
              >
                View & Edit Profile
              </button>
              
              <button
                onClick={handleDisconnect}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
              >
                Disconnect Wallet
              </button>
            </div>
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
      
      {/* User Profile Modal */}
      {showProfileModal && address && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          walletAddress={address}
        />
      )}
    </div>
  );
}
