"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, Lock, Unlock, Clock, Search, Calendar, ExternalLink } from 'lucide-react';
import styles from './LockerWidget.module.css';
import { 
  LockerWidgetProps, 
  LockerWidgetState, 
  TokenLock,
  TabType,
  DurationPreset,
  LockFormData
} from './types';

// Demo lock data
const demoLocks: TokenLock[] = [
  {
    id: '1',
    tokenAddress: '0xA3bC4D5E6f78901234567890aBCDeF1234567890',
    tokenName: 'Amber Launch',
    tokenSymbol: 'AMBR',
    amount: 1000000,
    lockedAt: new Date('2025-09-01T10:00:00Z'),
    unlockDate: new Date('2025-12-01T10:00:00Z'),
    status: 'active',
    owner: '0x123...789',
    withdrawable: false,
  },
  {
    id: '2',
    tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenName: 'Ethereum',
    tokenSymbol: 'ETH',
    amount: 50,
    lockedAt: new Date('2025-08-15T15:30:00Z'),
    unlockDate: new Date('2025-10-10T15:30:00Z'),
    status: 'expired',
    owner: '0x123...789',
    withdrawable: true,
  },
  {
    id: '3',
    tokenAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    tokenName: 'SteakCoin',
    tokenSymbol: 'STEAK',
    amount: 500000,
    lockedAt: new Date('2025-07-01T08:00:00Z'),
    unlockDate: new Date('2026-01-01T08:00:00Z'),
    status: 'active',
    owner: '0x123...789',
    withdrawable: false,
  },
];

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
}) => {
  const [state, setState] = useState<LockerWidgetState>({
    activeTab: 'create',
    formData: {
      tokenAddress: '',
      amount: '',
      lockDuration: 30,
    },
    searchQuery: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const [locks, setLocks] = useState<TokenLock[]>([]);
  const [filteredLocks, setFilteredLocks] = useState<TokenLock[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize locks
  useEffect(() => {
    setLocks(data || demoLocks);
  }, [data]);

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

    setIsLoading(true);
    try {
      if (onLockCreate) {
        await onLockCreate(state.formData);
      } else {
        // Demo mode: add to local state
        const newLock: TokenLock = {
          id: Date.now().toString(),
          tokenAddress: state.formData.tokenAddress,
          tokenName: 'New Token',
          tokenSymbol: 'NEW',
          amount: parseFloat(state.formData.amount),
          lockedAt: new Date(),
          unlockDate: new Date(Date.now() + state.formData.lockDuration * 24 * 60 * 60 * 1000),
          status: 'active',
          owner: '0x123...789',
          withdrawable: false,
        };
        setLocks(prev => [...prev, newLock]);
      }
      
      // Reset form
      setState(prev => ({
        ...prev,
        formData: {
          tokenAddress: '',
          amount: '',
          lockDuration: 30,
        },
        activeTab: 'manage',
      }));
    } catch (error) {
      console.error('Error creating lock:', error);
      alert('Failed to create lock');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async (lockId: string) => {
    setIsLoading(true);
    try {
      if (onUnlock) {
        await onUnlock(lockId);
      } else {
        // Demo mode: update local state
        setLocks(prev => 
          prev.map(lock => 
            lock.id === lockId 
              ? { ...lock, status: 'unlocked' as const, withdrawable: false }
              : lock
          )
        );
      }
    } catch (error) {
      console.error('Error unlocking:', error);
      alert('Failed to unlock tokens');
    } finally {
      setIsLoading(false);
    }
  };

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
          <label className={styles.label}>Token Contract Address</label>
          <input
            type="text"
            className={styles.input}
            placeholder="0x..."
            value={state.formData.tokenAddress}
            onChange={(e) => handleFormChange('tokenAddress', e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Amount to Lock</label>
          <input
            type="number"
            className={styles.input}
            placeholder="0.0"
            value={state.formData.amount}
            onChange={(e) => handleFormChange('amount', e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Lock Duration</label>
          <div className={styles.durationGrid}>
            {durationPresets.map((days) => (
              <button
                key={days}
                className={`${styles.durationBtn} ${
                  state.formData.lockDuration === days ? styles.selected : ''
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
          disabled={isLoading || !state.formData.tokenAddress || !state.formData.amount}
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
              : 'Create your first token lock to get started.'}
          </div>
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
                  className={styles.unlockBtn}
                  onClick={() => handleUnlock(lock.id)}
                  disabled={!lock.withdrawable || isLoading}
                >
                  {lock.withdrawable ? (
                    <>
                      <Unlock size={14} /> Unlock
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
      </div>
    </div>
  );
};
