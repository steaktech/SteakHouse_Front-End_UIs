'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './AirDropModal.module.css';
import type { AirDropModalProps, AirDropPointsResponse } from './types';
import { apiClient } from '@/app/lib/api/client';
import { useTrading } from '@/app/hooks/useTrading';

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
};

export default function AirDropModal({ isOpen, onClose, tradingWallet: tradingWalletProp }: AirDropModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AirDropPointsResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const { tradingState } = useTrading();
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

  if (!mounted || !isOpen) return null;

  const modal = (
    <div className={styles.modal}>
      <div className={styles.backdrop} onClick={onClose} />
      <section className={styles.container} role="dialog" aria-modal="true" aria-labelledby="airdrop-title">
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleWrapper}>
              <div className={styles.titleIcon}>
                <Icons.Sparkles />
              </div>
              <h2 id="airdrop-title" className={styles.title}>Airdrop Points</h2>
            </div>
            <p className={styles.headerSubtitle}>Your current points and contribution bases</p>
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
            <div className={`${styles.statusMessage} ${styles.errorMessage}`} role="alert">
              <span>{error}</span>
              <button className={styles.retryBtn} onClick={fetchPoints}>Retry</button>
            </div>
          )}

          {!loading && !error && data && (
            <>
              <div className={styles.section}>
                <div className={styles.walletRow}>
                  <div className={styles.walletInfo}>
                    <span className={styles.walletLabel}>Wallet</span>
                    <code className={styles.walletValue}>{shortAddress}</code>
                  </div>
                  <button className={styles.copyButton} onClick={handleCopy} aria-label="Copy wallet address" data-copied={copied}>
                    {copied ? <Icons.Check /> : <Icons.Copy />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>Points</div>
                <div className={styles.cardsGrid}>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>Trade Points</div>
                    <div className={styles.cardValue}>{(data.points?.trade_points ?? 0).toLocaleString()}</div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>Dev Points</div>
                    <div className={styles.cardValue}>{(data.points?.dev_points ?? 0).toLocaleString()}</div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>Referral Points</div>
                    <div className={styles.cardValue}>{(data.points?.referral_points ?? 0).toLocaleString()}</div>
                  </div>
                  <div className={`${styles.card} ${styles.cardHighlight}`}>
                    <div className={styles.cardTitle}>Total</div>
                    <div className={styles.cardValue}>{(data.points?.total ?? 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>Bases</div>
                <div className={styles.cardsGrid}>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>My Trade Volume</div>
                    <div className={styles.cardValue}>{usd(data.bases?.my_trade_usd)}</div>
                    <div className={styles.cardSub}>USD Equivalent</div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>My Dev Spend</div>
                    <div className={styles.cardValue}>{usd(data.bases?.my_dev_usd_spent)}</div>
                    <div className={styles.cardSub}>USD Spent</div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>Referees Trade</div>
                    <div className={styles.cardValue}>{usd(data.bases?.referees_trade_usd)}</div>
                    <div className={styles.cardSub}>USD Volume</div>
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
    </div>
  );

  return createPortal(modal, document.body);
}