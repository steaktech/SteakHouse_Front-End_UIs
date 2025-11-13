'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import styles from './AirDropModal.module.css';
import type { AirDropModalProps, AirDropPointsResponse } from './types';
import { apiClient } from '@/app/lib/api/client';
import { useTrading } from '@/app/hooks/useTrading';
import { useWallet } from '@/app/hooks/useWallet';

const WalletModal = dynamic(() => import('../WalletModal/WalletModal'), { ssr: false });

// Local inline icons to match existing modal style
const Icons = {
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 5L5 15M5 5l10 10"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M5 10V7.5L2.5 10 5 12.5V10zm10 0v2.5l2.5-2.5L15 7.5V10zm-5-5H7.5L10 2.5 12.5 5H10zm0 10h2.5L10 17.5 7.5 15H10z"/>
    </svg>
  ),
  Copy: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5.5" y="5.5" width="7" height="7" rx="1"/>
      <path d="M4.5 10.5h-1a1 1 0 01-1-1v-6a1 1 0 011-1h6a1 1 0 011 1v1"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8l3 3 7-7"/>
    </svg>
  ),
  Info: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="8" cy="8" r="7"/>
      <path d="M8 11.5V8M8 5.5h.01"/>
    </svg>
  ),
};

export default function AirDropModal({ isOpen, onClose, tradingWallet: tradingWalletProp }: AirDropModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AirDropPointsResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { tradingState } = useTrading();
  const { isConnected } = useWallet();
  const effectiveWallet = tradingWalletProp ?? tradingState?.tradingWallet ?? null;

  // Mount for portal and ESC handling
  useEffect(() => {
    setMounted(true);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const fetchPoints = useCallback(async () => {
    try {
      if (!effectiveWallet) {
        setError('Trading wallet not available. Connect and set up your trading wallet.');
        setData(null);
        return;
      }
      setLoading(true);
      setError(null);
      const res = await apiClient<AirDropPointsResponse>('/airdrop/points', {
        method: 'POST',
        body: JSON.stringify({ wallet: effectiveWallet }),
      });
      setData(res);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load airdrop points';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [effectiveWallet]);

  useEffect(() => {
    if (isOpen) {
      void fetchPoints();
    }
  }, [isOpen, fetchPoints]);

  const shortAddress = useMemo(() => {
    if (!data?.wallet) return '';
    const a = data.wallet;
    return `${a.slice(0, 6)}...${a.slice(-4)}`;
  }, [data?.wallet]);

  const handleCopy = useCallback(async () => {
    try {
      if (!data?.wallet) return;
      await navigator.clipboard.writeText(data.wallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }, [data?.wallet]);

  const usd = (v?: number) => {
    if (typeof v !== 'number' || Number.isNaN(v)) return '$0.00';
    return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
  };

  const formatCompact = (v: number) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
    if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
    return usd(v);
  };

  // Calculate estimated value based on 6% airdrop supply
  // Min raise: $240k, Max raise (hard cap): $1.2M
  // Distribution is proportional: user gets (their points / total platform points) * airdrop pool
  const airdropEstimates = useMemo(() => {
    if (!data?.points?.total) return { min: 0, max: 0, userSharePercentage: 0 };
    
    const MIN_AIRDROP_POOL = 240000; // $240k at minimum raise
    const MAX_AIRDROP_POOL = 1200000; // $1.2M at hard cap
    
    // Use total_platform_points from API if available, otherwise use a conservative estimate
    // This ensures everyone's points add up to 100% and are distributed proportionally
    const totalPlatformPoints = data.total_platform_points || (data.points.total * 100); // Fallback multiplier
    const userSharePercentage = (data.points.total / totalPlatformPoints) * 100;
    
    // Calculate user's proportional share of the airdrop pool
    const minValue = (data.points.total / totalPlatformPoints) * MIN_AIRDROP_POOL;
    const maxValue = (data.points.total / totalPlatformPoints) * MAX_AIRDROP_POOL;
    
    return {
      min: minValue,
      max: maxValue,
      userSharePercentage
    };
  }, [data?.points?.total, data?.total_platform_points]);

  if (!mounted || !isOpen) return null;

  const modal = (
    <div className={styles.modal}>
      <div className={styles.backdrop} onClick={onClose} />
      <section className={styles.container} role="dialog" aria-modal="true" aria-labelledby="airdrop-title">
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleWrapper}>
              <div className={styles.titleIcon} aria-hidden>
                <Icons.Sparkles />
              </div>
              <h2 id="airdrop-title" className={styles.title}>Airdrop Points</h2>
            </div>
            <p className={styles.headerSubtitle}>Track your contribution and rewards</p>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close airdrop modal">
            <Icons.Close />
          </button>
        </header>

        <div className={styles.content}>
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner} />
              <p>Fetching airdrop points...</p>
            </div>
          )}

          {!loading && error && (
            <>
              {!isConnected || !effectiveWallet ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Icons.Sparkles />
                  </div>
                  <div className={styles.emptyTitle}>Connect Your Wallet</div>
                  <div className={styles.emptyMessage}>
                    {error}
                  </div>
                  <div className={styles.walletCta}>
                    <button
                      className={styles.primary}
                      onClick={() => setIsWalletModalOpen(true)}
                      type="button"
                    >
                      Connect Wallet
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`${styles.statusMessage} ${styles.errorMessage}`} role="alert">
                  <span>{error}</span>
                  <button className={styles.retryBtn} onClick={fetchPoints}>Retry</button>
                </div>
              )}
            </>
          )}

          {!loading && !error && data && (
            <>
              <div className={styles.estimateSection}>
                <div className={styles.estimateCard}>
                  <div className={styles.estimateHeader}>
                    <div className={styles.estimateTitleBlock}>
                      <div className={styles.estimateTitle}>Estimated Airdrop Value</div>
                      <div className={styles.estimateSubtitle}>
                        6% supply allocation • {airdropEstimates.userSharePercentage.toFixed(4)}% of pool
                      </div>
                    </div>
                  </div>
                  <div className={styles.estimateRange}>
                    <div className={styles.rangeItem}>
                      <div className={styles.rangeLabel}>Minimum (Low Raise)</div>
                      <div className={styles.rangeValue}>{formatCompact(airdropEstimates.min)}</div>
                    </div>
                    <div className={styles.rangeDivider}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <div className={styles.rangeItem}>
                      <div className={styles.rangeLabel}>Maximum (Hard Cap)</div>
                      <div className={`${styles.rangeValue} ${styles.maxValue}`}>{formatCompact(airdropEstimates.max)}</div>
                    </div>
                  </div>
                  <div className={styles.disclaimer}>
                    <Icons.Info />
                    <span>Your share is calculated proportionally based on your points relative to all users. These values are based on <strong>6% of the $STEAK supply</strong> being allocated to the airdrop. The airdrop pool will be <strong>$240K–$1.2M</strong> (depending on final raise), distributed proportionally among all participants. Your percentage may change as more users earn points.</span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>Your Points</div>
                <div className={styles.cardsGrid}>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>Trade Points</div>
                    <div className={styles.cardValue}>{(data.points?.trade_points ?? 0).toLocaleString()}</div>
                    <div className={styles.cardSub}>From trading volume</div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>Dev Points</div>
                    <div className={styles.cardValue}>{(data.points?.dev_points ?? 0).toLocaleString()}</div>
                    <div className={styles.cardSub}>From token creation</div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>Referral Points</div>
                    <div className={styles.cardValue}>{(data.points?.referral_points ?? 0).toLocaleString()}</div>
                    <div className={styles.cardSub}>From referrals</div>
                  </div>
                  <div className={`${styles.card} ${styles.cardHighlight}`}>
                    <div className={styles.cardTitle}>Total Points</div>
                    <div className={styles.cardValue}>{(data.points?.total ?? 0).toLocaleString()}</div>
                    <div className={styles.cardSub}>All contributions</div>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>Contribution Bases</div>
                <div className={styles.cardsGrid}>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>My Trade Volume</div>
                    <div className={styles.cardValue}>{usd(data.bases?.my_trade_usd)}</div>
                    <div className={styles.cardSub}>Total USD traded</div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>My Dev Spend</div>
                    <div className={styles.cardValue}>{usd(data.bases?.my_dev_usd_spent)}</div>
                    <div className={styles.cardSub}>Token creation fees</div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>Referees Trade</div>
                    <div className={styles.cardValue}>{usd(data.bases?.referees_trade_usd)}</div>
                    <div className={styles.cardSub}>Referrals' volume</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <footer className={styles.modalFooter}>
          <div className={styles.footerLeft}>
            <button className={styles.ghostButton} onClick={fetchPoints} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          <div className={styles.footerRight}>
            <button className={styles.cancelButton} onClick={onClose}>Close</button>
          </div>
        </footer>
      </section>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        isConnected={isConnected}
      />
    </div>
  );

  return createPortal(modal, document.body);
}