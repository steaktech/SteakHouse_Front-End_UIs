'use client';

import { useWallet } from '@/app/hooks/useWallet';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import styles from './WalletModal.module.css';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
}

export default function WalletModal({ isOpen, onClose, isConnected }: WalletModalProps) {
  const { connectors, connect, disconnect, address, balanceFormatted, chainId } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Prevent body scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.touchAction = 'auto';
      };
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = 'auto';
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };


  const modalContent = (
    <div 
      className={styles.modalOverlay}
      onClick={handleOverlayClick}
    >
      <div 
        className={styles.modalContainer}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={styles.closeButton}
        >
          ✕
        </button>

        {isConnected ? (
          /* Connected State */
          <div>
            <div className={styles.header}>
              <div className={styles.walletIcon}>
                ✓
              </div>
              <h2 className={styles.title}>Wallet Connected</h2>
            </div>

            <div className={styles.connectedContent}>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}>Address</div>
                <div className={styles.infoValue}>
                  {address && formatAddress(address)}
                </div>
              </div>
              
              {balanceFormatted && (
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>Balance</div>
                  <div className={styles.infoValue}>
                    {parseFloat(balanceFormatted).toFixed(4)} ETH
                  </div>
                </div>
              )}

              <div className={styles.infoCard}>
                <div className={styles.infoLabel}>Network</div>
                <div className={styles.infoValue}>
                  Chain ID: {chainId}
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                className={styles.disconnectButton}
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        ) : (
          /* Connection State */
          <div>
            <div className={styles.header}>
              <div className={styles.walletIcon}>
                <Image
                  src="/images/ethereum-logo.svg"
                  alt="Ethereum logo"
                  width={24}
                  height={39}
                  className="object-contain"
                />
              </div>
              <h2 className={styles.title}>Connect Wallet</h2>
            </div>

            <p className={styles.description}>
              Choose how you'd like to connect your wallet:
            </p>

            <div className={styles.walletList}>
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  className={styles.walletButton}
                  onClick={() => handleConnect(connector.id)}
                  disabled={!connector.ready || isConnecting}
                >
                  <div className={styles.walletButtonIcon}>
                    <Image
                      src={connector.icon || '/images/metamask-wallet.webp'}
                      alt={`${connector.name} logo`}
                      width={40}
                      height={40}
                      className="object-cover"
                      style={{ borderRadius: '12px' }}
                    />
                  </div>
                  <div className={styles.walletButtonContent}>
                    <div className={styles.walletButtonName}>{connector.name}</div>
                    <div className={styles.walletButtonStatus}>
                      {!connector.ready ? 'Not installed' : 'Ready to connect'}
                    </div>
                  </div>
                  {isConnecting && (
                    <div className={styles.loadingSpinner} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
