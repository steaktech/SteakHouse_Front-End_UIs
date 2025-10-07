'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchUserProfile } from '@/app/lib/api/services/userService';
import type { UserProfile } from '@/app/types/user';

interface UserWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

interface EthBalanceResponse {
  eth?: string;
  error?: string;
}

const BLOCKCHAIN_API_BASE = 'https://steak-blockchain-api-bf5e689d4321.herokuapp.com';

type ProfileWithTrading = UserProfile & { trading_wallet?: string; wallet?: string };

export default function UserWelcomeModal({ isOpen, onClose, walletAddress }: UserWelcomeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ProfileWithTrading | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [tradingBalance, setTradingBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !walletAddress) return;

    let active = true;

    const run = async () => {
      setLoadingProfile(true);
      setProfileError(null);
      setBalanceError(null);
      setTradingBalance(null);
      try {
        const p = (await fetchUserProfile(walletAddress)) as ProfileWithTrading;
        if (!active) return;
        setProfile(p);

        if (p?.trading_wallet) {
          setLoadingBalance(true);
          try {
            const res = await fetch(
              `${BLOCKCHAIN_API_BASE}/ethBalance/${encodeURIComponent(p.trading_wallet)}`
            );
            if (!res.ok) throw new Error(`Balance fetch failed: ${res.status}`);
            const data: EthBalanceResponse = await res.json();
            if (!active) return;
            if (data?.eth) {
              setTradingBalance(data.eth);
            } else if (data?.error) {
              setBalanceError(data.error);
            } else {
              setBalanceError('Unexpected response');
            }
          } catch (err) {
            if (!active) return;
            setBalanceError(err instanceof Error ? err.message : 'Failed to fetch balance');
          } finally {
            if (active) setLoadingBalance(false);
          }
        }
      } catch (err) {
        if (!active) return;
        setProfileError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [isOpen, walletAddress]);

  const username = (profile?.username ?? '') as string;
  const tradingWallet = profile?.trading_wallet || '';

  const shortAddress = useMemo(() => {
    const fmt = (addr: string) => (addr && addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr);
    return {
      wallet: fmt(walletAddress),
      trading: fmt(tradingWallet),
    };
  }, [walletAddress, tradingWallet]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  if (!isOpen || !mounted) return null;

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-gradient-to-b from-[#2d1810] to-[#1a0f08] border border-[#8b4513] rounded-2xl shadow-2xl p-6 sm:p-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#d4af37]">
              {username ? `Welcome, ${username}!` : 'Welcome to SteakHouse!'}
            </h2>
            <p className="text-sm text-gray-300 mt-1">Your account is ready to trade.</p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Addresses and Balance */}
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          {/* Trading Wallet Card */}
          <div className="bg-[#1a0f08] border border-[#8b4513]/40 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Trading Wallet</div>
            <div className="flex items-center justify-between gap-2">
              <div className="font-mono break-all text-sm">{tradingWallet ? shortAddress.trading : '—'}</div>
              {tradingWallet && (
                <button
                  className="text-xs px-2 py-1 rounded bg-[#2d1810] hover:bg-[#3a1f12] border border-[#8b4513]/40 text-[#d4af37]"
                  onClick={() => copy(tradingWallet)}
                >
                  Copy
                </button>
              )}
            </div>
            <div className="mt-3 text-gray-300 text-sm">
              {loadingProfile ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                  Loading profile...
                </div>
              ) : profileError ? (
                <span className="text-red-400">{profileError}</span>
              ) : null}
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-[#1a0f08] border border-[#8b4513]/40 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Trading Wallet Balance</div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              {loadingBalance ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                  Fetching...
                </div>
              ) : balanceError ? (
                <span className="text-red-400 text-sm">{balanceError}</span>
              ) : tradingBalance !== null ? (
                <>
                  <span className="text-[#d4af37]">{Number(tradingBalance).toFixed(6)}</span>
                  <span className="text-gray-300 text-sm">ETH</span>
                </>
              ) : (
                <span className="text-gray-400 text-sm">—</span>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-400">Based on Blockchain API /ethBalance</div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-6 border-t border-[#8b4513]/30 pt-5">
          <h3 className="text-lg font-bold text-[#efb95e] mb-3">How to trade here</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-[#d6c6b2]">
            <li>Use your Trading Wallet to Buy/Sell inside the Steakhouse Kitchen (bonding curve).</li>
            <li>Buy to take a position; Sell to exit — no chart snipers or slippage inside the Kitchen.</li>
            <li>When the target is hit, liquidity is created and positions are mirrored to Uniswap V2.</li>
            <li>Track your PnL and activity in your profile; balances update as you trade.</li>
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-[#f4d03f] text-[#1a0f08] font-semibold"
          >
            Start Trading
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}