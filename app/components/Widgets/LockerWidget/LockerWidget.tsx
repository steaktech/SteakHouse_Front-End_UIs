"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Lock, Unlock, Clock, Search, Calendar, ExternalLink, UserPlus, CalendarPlus } from 'lucide-react';
import styles from './LockerWidget.module.css';
import {
  LockerWidgetProps,
  LockerWidgetState,
  TokenLock,
  TabType,
  DurationPreset,
  LockFormData
} from './types';
import { signAndSubmitTransaction } from '@/app/lib/web3/services/transactionService';
import { fetchLocks as apiFetchLocks, buildWithdrawLock, buildExtendLock, buildTransferLock } from '@/app/lib/api/services/lockerService';
import { useAccount } from 'wagmi';


// Utility functions
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(num);
};

const formatCompactNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return formatNumber(num);
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const shortAddress = (address: string): string => {
  return address.slice(0, 6) + '...' + address.slice(-4);
};

const getTimeRemaining = (unlockDate: Date): string => {
  const now = new Date();
  const diff = unlockDate.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes}m`;
};

const getLockProgress = (lock: TokenLock): number => {
  const now = new Date().getTime();
  const start = lock.lockedAt.getTime();
  const end = lock.unlockDate.getTime();
  const total = end - start;
  const elapsed = now - start;

  if (elapsed >= total) return 100;
  if (elapsed <= 0) return 0;

  return (elapsed / total) * 100;
};

const getTokenInitials = (symbol: string): string => {
  return symbol.slice(0, 2).toUpperCase();
};

export const LockerWidget: React.FC<LockerWidgetProps> = ({
  isOpen,
  onClose,
  data,
  onLockCreate,
  onUnlock,
  onTransferOwnership,
  onExtendLock,
}) => {
  const [state, setState] = useState<LockerWidgetState>(() => ({
    activeTab: onLockCreate ? 'create' : 'manage',
    formData: {
      tokenAddress: '',
      amount: '100', // Start at 100%
      lockDuration: 30,
    },
    searchQuery: '',
    sortBy: 'date',
    sortOrder: 'desc',
  }));

  const [locks, setLocks] = useState<TokenLock[]>([]);
  const [filteredLocks, setFilteredLocks] = useState<TokenLock[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { address: walletAddress } = useAccount();

  // Modal state for Transfer Ownership and Extend Lock
  const [actionModal, setActionModal] = useState<{
    type: 'transfer' | 'extend' | null;
    lock?: TokenLock;
  }>({ type: null });
  const [transferAddress, setTransferAddress] = useState<string>('');
  const [extendDays, setExtendDays] = useState<number>(30);

  const refreshLocks = useCallback(async () => {
    if (!walletAddress) return;
    try {
const result = await apiFetchLocks(walletAddress);
      const mapped: TokenLock[] = Array.isArray(result)
        ? result.map((r: any, idx: number) => {
const unlockDate = r.rawUnlockTime ? new Date(Number(r.rawUnlockTime) * 1000) : new Date(r.unlockDate ?? r.unlockAt ?? r.unlockTime ?? Date.now());
            const withdrawable = Boolean(
              r.withdrawable ?? r.canWithdraw ?? (Date.now() >= unlockDate.getTime())
            );
            return {
              id: String(r.id ?? idx),
              tokenAddress: r.token ?? r.tokenAddress ?? '',
              tokenName: r.tokenName ?? r.name ?? 'Token',
              tokenSymbol: r.tokenSymbol ?? r.symbol ?? 'TKN',
              amount: Number(r.amount ?? r.lockedAmount ?? 0),
              lockedAt: new Date(r.lockedAt ?? r.createdAt ?? Date.now()),
              unlockDate,
              status: (r.status as any) ?? 'active',
              owner: r.owner ?? walletAddress,
              withdrawable,
            };
          })
        : [];
      setLocks(mapped);
    } catch (err) {
      console.warn('Failed to refresh locks from blockchain API', err);
    }
  }, [walletAddress]);

// Initialize locks (no demo data)
useEffect(() => {
  if (data) setLocks(data);
  else setLocks([]);
}, [data]);

  // Optionally fetch locks from blockchain API when wallet is connected and no external data provided
  useEffect(() => {
    const fetchLocks = async () => {
      if (!walletAddress || (Array.isArray(data) && data.length > 0)) return;
      try {
        // GET /getLocks/:wallet (owner is main wallet address)
const result = await apiFetchLocks(walletAddress);
        // Try to map API response to TokenLock[] if possible; otherwise keep existing locks
        // Expected fields are not strictly defined; attempt a best-effort mapping
        const mapped: TokenLock[] = Array.isArray(result)
          ? result.map((r: any, idx: number) => {
const unlockDate = r.rawUnlockTime ? new Date(Number(r.rawUnlockTime) * 1000) : new Date(r.unlockDate ?? r.unlockAt ?? r.unlockTime ?? Date.now());
              const withdrawable = Boolean(
                r.withdrawable ?? r.canWithdraw ?? (Date.now() >= unlockDate.getTime())
              );
              return {
                id: String(r.id ?? idx),
                tokenAddress: r.token ?? r.tokenAddress ?? '',
                tokenName: r.tokenName ?? r.name ?? 'Token',
                tokenSymbol: r.tokenSymbol ?? r.symbol ?? 'TKN',
                amount: Number(r.amount ?? r.lockedAmount ?? 0),
                lockedAt: new Date(r.lockedAt ?? r.createdAt ?? Date.now()),
                unlockDate,
                status: (r.status as any) ?? 'active',
                owner: r.owner ?? walletAddress,
                withdrawable,
              };
            })
          : locks;
        if (mapped.length) setLocks(mapped);
      } catch (err) {
        // Silent fail; keep demo or provided data
        console.warn('Failed to fetch locks from blockchain API', err);
      }
    };
    fetchLocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  // Apply filters and sorting
  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...locks];

    // Apply search filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(lock =>
        lock.tokenName.toLowerCase().includes(query) ||
        lock.tokenSymbol.toLowerCase().includes(query) ||
        lock.tokenAddress.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (state.sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'date':
        default:
          aValue = a.unlockDate.getTime();
          bValue = b.unlockDate.getTime();
          break;
      }

      if (state.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredLocks(filtered);
  }, [locks, state.searchQuery, state.sortBy, state.sortOrder]);

  // Update filtered locks when state changes
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Event handlers
  const handleTabChange = (tab: TabType) => {
    setState(prev => ({ ...prev, activeTab: tab }));
    // If switching to Manage tab, trigger a refresh from API when possible
    if (tab === 'manage' && walletAddress && !(Array.isArray(data) && data.length > 0)) {
      // fire and forget; internal errors handled in refreshLocks
      refreshLocks();
    }
  };

  const handleFormChange = (field: keyof LockFormData, value: string | number) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
    }));
  };

  const handleDurationSelect = (days: DurationPreset) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, lockDuration: days },
    }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, searchQuery: e.target.value }));
  };

const handleCreateLock = async () => {
  if (!state.formData.tokenAddress || !state.formData.amount) {
    alert('Please fill in all required fields');
    return;
  }
  if (!walletAddress) {
    try {
      await (window as any)?.ethereum?.request?.({ method: 'eth_requestAccounts' });
    } catch (e) {
      alert('Please connect your wallet');
      return;
    }
  }

  setIsLoading(true);
  let created = false;
  try {
    if (onLockCreate) {
      await onLockCreate(state.formData);
      created = true;
    } else {
      alert('Create lock API is not available yet. Please use Extend/Withdraw/Transfer while create is being added.');
      return;
    }
  } catch (error) {
    console.error('Error creating lock:', error);
    alert('Failed to create lock');
  } finally {
    if (created) {
      setState(prev => ({
        ...prev,
        formData: {
          tokenAddress: '',
          amount: '',
          lockDuration: 30,
        },
        activeTab: 'manage',
      }));
    }
    setIsLoading(false);
  }
};

  const handleUnlock = async (lockId: string) => {
    setIsLoading(true);
    try {
      if (onUnlock) {
        await onUnlock(lockId);
      } else {
        const lock = locks.find(l => l.id === lockId);
        if (!lock) throw new Error('Lock not found');
        if (!walletAddress && (!lock.owner || lock.owner.length < 10)) {
          throw new Error('Owner wallet address is required to withdraw');
        }
// POST /withdrawLock { token, owner }
        const unsigned = await buildWithdrawLock(lock.tokenAddress, walletAddress || lock.owner);
        // Normalize gas field to hex string as 'gas'
        const gasDec = unsigned.gas ?? unsigned.gasLimit;
        const gasHex = gasDec ? ('0x' + Number(gasDec).toString(16)) : undefined;
        const toSend = {
          from: (walletAddress || unsigned.from),
          ...(unsigned.to ? { to: unsigned.to } : {}),
          ...(unsigned.data ? { data: unsigned.data } : {}),
          ...(gasHex ? { gas: gasHex } : {}),
          ...(unsigned.value ? { value: unsigned.value } : {}),
          ...(unsigned.maxFeePerGas ? { maxFeePerGas: unsigned.maxFeePerGas } : {}),
          ...(unsigned.maxPriorityFeePerGas ? { maxPriorityFeePerGas: unsigned.maxPriorityFeePerGas } : {}),
          ...(unsigned.gasPrice ? { gasPrice: unsigned.gasPrice } : {}),
        } as any;
        const txHashOrAddr = await signAndSubmitTransaction(toSend, false);
        if (!txHashOrAddr) throw new Error('Transaction failed or was rejected');
        // Optimistically update local state
        setLocks(prev =>
          prev.map(l =>
            l.id === lockId ? { ...l, status: 'unlocked', withdrawable: false } : l
          )
        );
        // Refresh from API to ensure accurate state
        await refreshLocks();
      }
    } catch (error: any) {
      console.error('Error unlocking:', error);
      const msg = error?.message || 'Failed to unlock tokens';
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Transfer ownership flow
  const openTransferModal = (lock: TokenLock) => {
    setActionModal({ type: 'transfer', lock });
    setTransferAddress('');
  };

  const confirmTransfer = async () => {
    if (!actionModal.lock) return;
    if (!transferAddress.trim()) {
      alert('Please enter a valid wallet address');
      return;
    }
    setIsLoading(true);
    try {
      if (onTransferOwnership) {
        await onTransferOwnership(actionModal.lock.id, transferAddress.trim());
      } else {
        const lock = actionModal.lock;
        const oldOwner = walletAddress || lock.owner;
        if (!oldOwner) throw new Error('Old owner wallet address is required');
// POST /transferLock { token, newOwner, oldOwner }
        const unsigned = await buildTransferLock(lock.tokenAddress, transferAddress.trim(), oldOwner);
        const gasDec = unsigned.gas ?? unsigned.gasLimit;
        const gasHex = gasDec ? ('0x' + Number(gasDec).toString(16)) : undefined;
        const toSend = {
          from: (walletAddress || unsigned.from),
          ...(unsigned.to ? { to: unsigned.to } : {}),
          ...(unsigned.data ? { data: unsigned.data } : {}),
          ...(gasHex ? { gas: gasHex } : {}),
          ...(unsigned.value ? { value: unsigned.value } : {}),
          ...(unsigned.maxFeePerGas ? { maxFeePerGas: unsigned.maxFeePerGas } : {}),
          ...(unsigned.maxPriorityFeePerGas ? { maxPriorityFeePerGas: unsigned.maxPriorityFeePerGas } : {}),
          ...(unsigned.gasPrice ? { gasPrice: unsigned.gasPrice } : {}),
        } as any;
        const txHashOrAddr = await signAndSubmitTransaction(toSend, false);
        if (!txHashOrAddr) throw new Error('Transaction failed or was rejected');
        // Optimistically update local owner field
        setLocks(prev => prev.map(l => l.id === lock.id ? { ...l, owner: transferAddress.trim() } : l));
        // Refresh from API to ensure accurate state
        await refreshLocks();
      }
      setActionModal({ type: null });
    } catch (error: any) {
      console.error('Error transferring ownership:', error);
      const msg = error?.message || 'Failed to transfer ownership';
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Extend lock flow
  const openExtendModal = (lock: TokenLock) => {
    setActionModal({ type: 'extend', lock });
    setExtendDays(30);
  };

  const confirmExtend = async () => {
    if (!actionModal.lock) return;
    if (!extendDays || extendDays <= 0) {
      alert('Please enter a valid number of days (> 0)');
      return;
    }
    setIsLoading(true);
    try {
      if (onExtendLock) {
        await onExtendLock(actionModal.lock.id, extendDays);
      } else {
        const lock = actionModal.lock;
        if (!walletAddress && (!lock.owner || lock.owner.length < 10)) {
          throw new Error('Owner wallet address is required to extend lock');
        }
// POST /extendLock { token, extraTimeSec, owner }
        const extraTimeSec = extendDays * 24 * 60 * 60;
        const unsigned = await buildExtendLock(lock.tokenAddress, extraTimeSec, walletAddress || lock.owner);
        const gasDec = unsigned.gas ?? unsigned.gasLimit;
        const gasHex = gasDec ? ('0x' + Number(gasDec).toString(16)) : undefined;
        const toSend = {
          from: (walletAddress || unsigned.from),
          ...(unsigned.to ? { to: unsigned.to } : {}),
          ...(unsigned.data ? { data: unsigned.data } : {}),
          ...(gasHex ? { gas: gasHex } : {}),
          ...(unsigned.value ? { value: unsigned.value } : {}),
          ...(unsigned.maxFeePerGas ? { maxFeePerGas: unsigned.maxFeePerGas } : {}),
          ...(unsigned.maxPriorityFeePerGas ? { maxPriorityFeePerGas: unsigned.maxPriorityFeePerGas } : {}),
          ...(unsigned.gasPrice ? { gasPrice: unsigned.gasPrice } : {}),
        } as any;
        const txHashOrAddr = await signAndSubmitTransaction(toSend, false);
        if (!txHashOrAddr) throw new Error('Transaction failed or was rejected');
        // Optimistically extend unlock date locally
        setLocks(prev => prev.map(l => {
          if (l.id !== lock.id) return l;
          const ms = extendDays * 24 * 60 * 60 * 1000;
          return {
            ...l,
            unlockDate: new Date(l.unlockDate.getTime() + ms),
            status: 'active',
            withdrawable: false,
          };
        }));
        // Refresh from API to ensure accurate state
        await refreshLocks();
      }
      setActionModal({ type: null });
    } catch (error: any) {
      console.error('Error extending lock:', error);
      const msg = error?.message || 'Failed to extend lock';
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const closeActionModal = () => setActionModal({ type: null });

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Render functions
  const renderCreateTab = () => {
    const durationPresets: DurationPreset[] = [7, 14, 30, 90, 180, 365];

    const unlockDate = new Date(
      Date.now() + state.formData.lockDuration * 24 * 60 * 60 * 1000
    );

    return (
      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Liquidity Pool / Token Address</label>
          <input
            type="text"
            className={styles.input}
            placeholder="0x..."
            value={state.formData.tokenAddress}
            onChange={(e) => handleFormChange('tokenAddress', e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Amount to Lock: {state.formData.amount}%</label>
          <div style={{ position: 'relative', marginTop: '12px' }}>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={state.formData.amount}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                // Magnetic snap near major percentages (within 3% range)
                const snapRange = 3;
                const majorValues = [0, 25, 50, 75, 100];

                let snappedValue = value;
                for (const major of majorValues) {
                  if (Math.abs(value - major) <= snapRange) {
                    snappedValue = major;
                    break;
                  }
                }

                handleFormChange('amount', snappedValue.toString());
              }}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: `linear-gradient(to right, #4ade80 0%, #4ade80 ${state.formData.amount}%, rgba(255, 224, 185, 0.2) ${state.formData.amount}%, rgba(255, 224, 185, 0.2) 100%)`,
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                cursor: 'pointer',
                border: '1px solid rgba(255, 210, 160, 0.3)'
              }}
              className="locker-slider"
            />
            <style>{`
              .locker-slider::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: linear-gradient(180deg, #ffe49c, #ffc96a);
                border: 2px solid #8c5523;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              }
              .locker-slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: linear-gradient(180deg, #ffe49c, #ffc96a);
                border: 2px solid #8c5523;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              }
              .locker-slider::-webkit-slider-thumb:hover {
                background: linear-gradient(180deg, #ffeeb0, #ffd47e);
                box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
              }
              .locker-slider::-moz-range-thumb:hover {
                background: linear-gradient(180deg, #ffeeb0, #ffd47e);
                box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
              }
            `}</style>
            {/* Percentage markers */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '8px',
              fontSize: '10px',
              color: 'rgba(254, 234, 136, 0.6)',
              fontWeight: 600
            }}>
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Lock Duration</label>
          <div className={styles.durationGrid}>
            {durationPresets.map((days) => (
              <button
                key={days}
                className={`${styles.durationBtn} ${state.formData.lockDuration === days ? styles.selected : ''
                  }`}
                onClick={() => handleDurationSelect(days)}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        <div className={styles.infoBox}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Lock Duration</span>
            <span className={styles.infoValue}>{state.formData.lockDuration} Days</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Unlock Date</span>
            <span className={styles.infoValue}>{formatDate(unlockDate)}</span>
          </div>
        </div>

        <button
          className={styles.actionBtn}
          onClick={handleCreateLock}
          disabled={isLoading || !state.formData.tokenAddress?.trim() || !state.formData.amount}
        >
          {isLoading ? 'Creating Lock...' : 'Create Lock'}
        </button>
      </div>
    );
  };

  const renderManageTab = () => {
    if (filteredLocks.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Lock size={28} />
          </div>
          <div className={styles.emptyTitle}>No Locks Found</div>
          <div className={styles.emptyMessage}>
            {state.searchQuery
              ? 'No locks match your search criteria.'
              : 'No locks found for your wallet.'}
          </div>
          <button
            className={styles.actionBtn}
            onClick={() => setState(prev => ({ ...prev, activeTab: 'create' }))}
            disabled={isLoading}
          >
            Create a Lock
          </button>
        </div>
      );
    }

    return (
      <div className={styles.lockList}>
        <div className={styles.searchBar}>
          <div className={styles.formGroup}>
            <input
              type="text"
              className={styles.input}
              placeholder="Search by token name, symbol, or address..."
              value={state.searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>

        {filteredLocks.map((lock) => {
          const progress = getLockProgress(lock);
          const timeRemaining = getTimeRemaining(lock.unlockDate);

          return (
            <div key={lock.id} className={styles.lockCard}>
              <div className={styles.lockHeader}>
                <div className={styles.lockToken}>
                  <div className={styles.lockAvatar}>
                    {getTokenInitials(lock.tokenSymbol)}
                  </div>
                  <div className={styles.lockTokenInfo}>
                    <div className={styles.lockName}>{lock.tokenName}</div>
                    <div className={styles.lockSymbol}>{lock.tokenSymbol}</div>
                  </div>
                </div>
                <div className={`${styles.lockBadge} ${styles[lock.status]}`}>
                  {lock.status}
                </div>
              </div>

              <div className={styles.lockDetails}>
                <div className={styles.lockDetail}>
                  <div className={styles.lockDetailLabel}>Amount</div>
                  <div className={styles.lockDetailValue}>
                    {formatCompactNumber(lock.amount)}
                  </div>
                </div>
                <div className={styles.lockDetail}>
                  <div className={styles.lockDetailLabel}>Time Left</div>
                  <div className={styles.lockDetailValue}>{timeRemaining}</div>
                </div>
                <div className={styles.lockDetail}>
                  <div className={styles.lockDetailLabel}>Locked On</div>
                  <div className={styles.lockDetailValue}>
                    {formatDate(lock.lockedAt)}
                  </div>
                </div>
                <div className={styles.lockDetail}>
                  <div className={styles.lockDetailLabel}>Unlock Date</div>
                  <div className={styles.lockDetailValue}>
                    {formatDate(lock.unlockDate)}
                  </div>
                </div>
              </div>

              {lock.status !== 'unlocked' && (
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className={styles.lockActions}>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => openExtendModal(lock)}
                  disabled={lock.status === 'unlocked' || isLoading}
                  title="Extend lock duration"
                >
                  <CalendarPlus size={14} /> Extend
                </button>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => openTransferModal(lock)}
                  disabled={isLoading}
                  title="Transfer lock ownership"
                >
                  <UserPlus size={14} /> Transfer
                </button>
                <button
                  className={styles.unlockBtn}
                  onClick={() => handleUnlock(lock.id)}
                  disabled={!lock.withdrawable || isLoading}
                  title="Withdraw tokens"
                >
                  {lock.withdrawable ? (
                    <>
                      <Unlock size={14} /> Withdraw
                    </>
                  ) : (
                    'Locked'
                  )}
                </button>
                <button className={styles.viewBtn}>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`${styles.root} ${isOpen ? styles.open : ''}`}>
      <div className={styles.overlay} onClick={handleOverlayClick} />

      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.icon}>
              🔒
            </div>
            <div className={styles.titleBlock}>
              <h2 className={styles.title}>Token Locker</h2>
              <div className={styles.sub}>Lock tokens securely for any duration</div>
            </div>
          </div>

          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close locker widget"
          >
            <X size={18} />
          </button>
        </header>

        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${state.activeTab === 'create' ? styles.active : ''}`}
              onClick={() => handleTabChange('create')}
            >
              <Lock size={16} /> Create Lock
            </button>
            <button
              className={`${styles.tab} ${state.activeTab === 'manage' ? styles.active : ''}`}
              onClick={() => handleTabChange('manage')}
            >
              <Clock size={16} /> Manage Locks
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {state.activeTab === 'create' ? renderCreateTab() : renderManageTab()}
        </div>

        {/* Action Modals */}
        {actionModal.type && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>
                  {actionModal.type === 'transfer' ? 'Transfer Ownership' : 'Extend Lock'}
                </div>
                <button className={styles.closeBtn} onClick={closeActionModal} aria-label="Close action modal">
                  <X size={16} />
                </button>
              </div>

              <div className={styles.modalBody}>
                {actionModal.type === 'transfer' ? (
                  <>
                    <label className={styles.label}>New Owner Address</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="0x..."
                      value={transferAddress}
                      onChange={(e) => setTransferAddress(e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <label className={styles.label}>Additional Days to Extend</label>
                    <input
                      type="number"
                      min={1}
                      className={styles.input}
                      placeholder="e.g. 30"
                      value={extendDays}
                      onChange={(e) => setExtendDays(parseInt(e.target.value) || 0)}
                    />
                  </>
                )}
              </div>

              <div className={styles.modalActions}>
                <button className={styles.cancelBtn} onClick={closeActionModal} disabled={isLoading}>Cancel</button>
                {actionModal.type === 'transfer' ? (
                  <button className={styles.confirmBtn} onClick={confirmTransfer} disabled={isLoading}>
                    {isLoading ? 'Transferring...' : 'Confirm Transfer'}
                  </button>
                ) : (
                  <button className={styles.confirmBtn} onClick={confirmExtend} disabled={isLoading || extendDays <= 0}>
                    {isLoading ? 'Extending...' : 'Confirm Extend'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
