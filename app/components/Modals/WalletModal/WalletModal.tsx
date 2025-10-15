'use client';

import { useWallet } from '@/app/hooks/useWallet';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { addUser } from '@/app/lib/api/services/userService';
import type { AddUserPayload } from '@/app/types/user';
import { UserProfileModal } from '../UserProfileModal';
import UserWelcomeModal from '../UserWelcomeModal';

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
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);

  // Define registerUser function with useCallback to prevent unnecessary re-renders
const registerUser = useCallback(async (walletAddress: string): Promise<boolean> => {
    try {
      setIsRegisteringUser(true);
      setUserRegistrationError(null);
      
      const payload: AddUserPayload = {
        wallet_address: walletAddress
      };
      
      const response = await addUser(payload);
      console.log('User register response:', walletAddress, response);
      if (response.created) {
        // New user => show welcome modal
        setShowWelcomeModal(true);
        return true;
      }
      // Existing user => do nothing
      return false;
    } catch (error) {
      console.error('User registration failed:', error);
      setUserRegistrationError(error instanceof Error ? error.message : 'Failed to register user');
      return false;
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
      
      if (connectedAddress) {
        setConnectedWalletAddress(connectedAddress);
        const created = !isRegisteringUser ? await registerUser(connectedAddress) : false;
        // If user already exists (no welcome modal), close the wallet modal
        if (!created) {
          onClose();
        }
      }
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

  // UI styles (inspired by steakhouse WalletModal.module.css)
  const overlayStyle = {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(4px)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px'
  };
  const containerStyle = {
    background: 'radial-gradient(1200px 800px at 85% -10%, rgba(247,181,0,0.10) 0%, rgba(255,201,54,0.06) 25%, transparent 60%) no-repeat, #0d0704',
    color: '#f5e6d3',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '500px',
    padding: 0,
    position: 'relative' as const,
    boxShadow: '0 16px 60px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.03)',
    border: '1px solid #3a2418',
    overflow: 'hidden'
  };
  const headerStyle = { display: 'flex', alignItems: 'center', gap: '20px', padding: '24px 24px 16px' } as const;
  const walletIconStyle = {
    width: '48px', height: '48px', borderRadius: '14px',
    background: 'linear-gradient(135deg, #f28c28, #ffb347 60%, #f28c28)',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px rgba(205,120,40,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', color: '#1a0f08', fontWeight: 700, overflow: 'hidden'
  } as const;
  const titleStyle = { fontSize: '24px', fontWeight: 800, color: '#f5e6d3', margin: 0, letterSpacing: '-0.01em' } as const;
  const closeButtonStyle = {
    position: 'absolute' as const,
    top: '20px', right: '20px', width: '36px', height: '36px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid #3a2418', color: '#cbbba6',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '18px'
  };
  const descriptionStyle = { color: '#cbbba6', fontSize: '14px', marginBottom: '24px', lineHeight: 1.4, padding: '0 24px' } as const;
  const listStyle = { display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 24px 24px' } as const;
  const walletButtonStyle = {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#231611',
    border: '1px solid #3a2418', borderRadius: '14px', color: '#f5e6d3', fontSize: '16px', fontWeight: 500,
    cursor: 'pointer', transition: 'all 0.2s ease', width: '100%', textAlign: 'left' as const
  };
  const walletButtonIconStyle = { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } as const;
  const walletButtonNameStyle = { fontSize: '16px', fontWeight: 600, color: '#f5e6d3', marginBottom: '4px' } as const;
  const walletButtonStatusStyle = { fontSize: '12px', color: '#cbbba6' } as const;
  const connectedWrapStyle = { display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 24px 24px' } as const;
  const infoCardStyle = { background: '#231611', border: '1px solid #3a2418', borderRadius: '12px', padding: '12px' } as const;
  const infoLabelStyle = { fontSize: '11px', color: '#9b8976', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '4px' };
  const infoValueStyle = { color: '#f5e6d3', fontWeight: 500, fontSize: '14px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace' } as const;
  const primaryButtonStyle = {
    background: 'linear-gradient(180deg, #ffd700, #daa20b 60%, #b8860b)', border: 'none', borderRadius: '12px', padding: '12px 16px',
    color: '#1a0f08', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: '0.2s', textAlign: 'center' as const, width: '100%'
  };
  const dangerButtonStyle = {
    background: '#dc2626', border: 'none', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '14px', fontWeight: 700,
    cursor: 'pointer', transition: '0.2s', textAlign: 'center' as const, width: '100%'
  };
  const spinnerStyle = { width: '20px', height: '20px', border: '2px solid #3a2418', borderTop: '2px solid #ffb347', borderRadius: '50%' } as const;

  type DisplayConnector = { id: string; name: string; ready: boolean; icon?: string; connectId: string };
  const phantomInjected = typeof window !== 'undefined' && ((window as any).ethereum?.isPhantom || (window as any).phantom?.ethereum);
  const displayConnectors: DisplayConnector[] = [
    ...connectors.map((c) => ({ ...c, connectId: c.id })),
    { id: 'phantom', name: 'Phantom', ready: true, icon: '/images/phantom-wallet.webp', connectId: phantomInjected ? 'injected' : 'walletConnect' },
    { id: 'rainbow', name: 'Rainbow', ready: true, icon: '/images/walletconnect-wallet.webp', connectId: 'walletConnect' },
  ];

  // Resolve connector icon to an image that exists in /public/images
  const resolveConnectorIcon = (id: string, provided?: string) => {
    const byId: Record<string, string> = {
      injected: '/images/metamask-wallet.webp',
      'io.metamask': '/images/metamask-wallet.webp',
      walletConnect: '/images/walletconnect-wallet.webp',
      coinbaseWallet: '/images/coinbase-wallet.webp',
      coinbaseWalletSDK: '/images/coinbase-wallet.webp',
      phantom: '/images/phantom-wallet.webp',
      rainbow: '/images/walletconnect-wallet.webp',
    };
    if (byId[id]) return byId[id];
    // If a provided path already targets our images folder, keep it; otherwise fallback
    if (provided && provided.startsWith('/images/')) return provided;
    return '/images/metamask-wallet.webp';
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !showWelcomeModal) onClose();
  };

  return (
    <>
      {!showProfileModal && (
        <div style={overlayStyle} onClick={handleOverlayClick}>
          <div style={containerStyle} onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} style={closeButtonStyle}>✕</button>

            {/* Header */}
            <div style={headerStyle}>
              <div style={walletIconStyle}>
                {isConnected ? '✓' : (
                  <Image src="/images/ethereum-logo.svg" alt="Ethereum logo" width={24} height={39} style={{ objectFit: 'contain' }} />
                )}
              </div>
              <h2 style={titleStyle}>{isConnected ? 'Wallet Connected' : 'Connect Wallet'}</h2>
            </div>

            {isConnected ? (
              <div style={connectedWrapStyle}>
                {/* User Registration Status */}
                {isRegisteringUser && (
                  <div className="flex items-center gap-2 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid #60a5fa', borderTopColor: 'transparent', borderRadius: '50%' }} />
                    <div className="text-blue-400 text-sm">Registering user...</div>
                  </div>
                )}
                {userRegistrationError && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">Registration failed: {userRegistrationError}</div>
                )}

                {/* Wallet Summary */}
                <div style={infoCardStyle}>
                  <div className="flex items-center justify-between mb-2">
                    <div style={{ fontSize: 12, color: '#cbbba6' }}>Connected Wallet</div>
                    <div style={{ fontSize: 11, color: '#9b8976' }}>Chain ID: {chainId}</div>
                  </div>
                  <div style={{ ...infoValueStyle, marginBottom: 6 }}>
                    {address && formatAddress(address)}
                  </div>
                  {balanceFormatted && (
                    <div style={{ color: '#cbbba6', fontSize: 13 }}>
                      Balance: {parseFloat(balanceFormatted).toFixed(4)} ETH
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <button onClick={() => setShowProfileModal(true)} style={primaryButtonStyle}>View & Edit Profile</button>
                  <button onClick={handleDisconnect} style={dangerButtonStyle}>Disconnect Wallet</button>
                </div>
              </div>
            ) : (
              <div>
                <p style={descriptionStyle}>Choose how you'd like to connect your wallet:</p>
                <div style={listStyle}>
                  {displayConnectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => handleConnect(connector.connectId)}
                      disabled={!connector.ready || isConnecting}
                      style={{
                        ...walletButtonStyle,
                        opacity: !connector.ready || isConnecting ? 0.6 : 1,
                        cursor: !connector.ready || isConnecting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <div style={walletButtonIconStyle}>
                        <Image
                          src={resolveConnectorIcon(connector.id, connector.icon)}
                          alt={`${connector.name} logo`}
                          width={40}
                          height={40}
                          style={{ objectFit: 'cover', borderRadius: 12 }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={walletButtonNameStyle}>{connector.name}</div>
                        <div style={walletButtonStatusStyle}>{!connector.ready ? 'Not installed' : 'Ready to connect'}</div>
                      </div>
                      {isConnecting && <div className="animate-spin" style={spinnerStyle} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfileModal && address && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => { setShowProfileModal(false); onClose(); }}
          walletAddress={address}
        />
      )}

      {/* User Welcome Modal */}
      {showWelcomeModal && connectedWalletAddress && (
        <UserWelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => { setShowWelcomeModal(false); onClose(); }}
          walletAddress={connectedWalletAddress}
        />
      )}
    </>
  );
}
