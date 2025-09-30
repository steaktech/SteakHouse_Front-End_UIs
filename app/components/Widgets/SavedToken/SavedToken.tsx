"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Bookmark, Search, X, Trash2 } from 'lucide-react';
import styles from './SavedToken.module.css';
import { SavedTokenData, SavedTokenWidgetProps, SavedTokenWidgetState } from './types';

// Demo data for saved tokens
const demoSavedTokens: SavedTokenData[] = [
  {
    id: '1',
    name: 'Amber Launch',
    symbol: 'AMBR',
    address: '0xA3bC4D5E6f78901234567890aBCDeF1234567890',
    chain: 'EVM',
    priceUSD: 0.0567,
    savedAt: new Date('2024-01-15T10:30:00Z'),
  },
  {
    id: '2',
    name: 'Bitcoin',
    symbol: 'BTC',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    chain: 'Bitcoin',
    priceUSD: 45230.45,
    savedAt: new Date('2024-01-14T15:20:00Z'),
  },
  {
    id: '3',
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    chain: 'EVM',
    priceUSD: 2890.75,
    savedAt: new Date('2024-01-13T09:45:00Z'),
  },
  {
    id: '4',
    name: 'Solana Meme Token',
    symbol: 'SMT',
    address: '0xfedcba0987654321fedcba0987654321fedcba09',
    chain: 'Solana',
    priceUSD: 0.0123,
    savedAt: new Date('2024-01-12T14:15:00Z'),
  },
  {
    id: '5',
    name: 'Dogecoin',
    symbol: 'DOGE',
    address: '0x5555555555555555555555555555555555555555',
    chain: 'EVM',
    priceUSD: 0.0825,
    savedAt: new Date('2024-01-11T11:30:00Z'),
  },
];

// Utility functions
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 6,
});

const formatCompactCurrency = (num: number): string => {
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return "$" + (num / 1e3).toFixed(2) + "K";
  return USD.format(num);
};

const getTokenInitials = (symbol: string): string => {
  return symbol.slice(0, 2).toUpperCase();
};

export const SavedTokenWidget: React.FC<SavedTokenWidgetProps> = ({ 
  isOpen, 
  onClose, 
  data 
}) => {
  const [state, setState] = useState<SavedTokenWidgetState>({
    searchQuery: "",
    sortBy: "savedAt",
    sortOrder: "desc",
  });

  const [savedTokens, setSavedTokens] = useState<SavedTokenData[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<SavedTokenData[]>([]);

  // Initialize with demo data or provided data
  useEffect(() => {
    setSavedTokens(data || demoSavedTokens);
  }, [data]);

  // Apply filters and sorting
  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...savedTokens];

    // Apply search filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(token =>
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query) ||
        token.address.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (state.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'symbol':
          aValue = a.symbol.toLowerCase();
          bValue = b.symbol.toLowerCase();
          break;
        case 'price':
          aValue = a.priceUSD;
          bValue = b.priceUSD;
          break;
        case 'savedAt':
        default:
          aValue = a.savedAt.getTime();
          bValue = b.savedAt.getTime();
          break;
      }

      if (state.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredTokens(filtered);
  }, [savedTokens, state]);

  // Update filtered tokens when state changes
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  // Event handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleRemoveToken = (tokenId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedTokens(prev => prev.filter(token => token.id !== tokenId));
  };

  const handleTokenClick = (token: SavedTokenData) => {
    // Handle token selection - could navigate to token page or open details
    console.log('Selected token:', token);
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        document.getElementById("saved-search")?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Render empty state
  const renderEmptyState = () => (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <Bookmark size={24} />
      </div>
      <div className={styles.emptyTitle}>No Saved Tokens</div>
      <div className={styles.emptyMessage}>
        {state.searchQuery ? 'No tokens match your search criteria.' : 'Start saving tokens to see them here.'}
      </div>
    </div>
  );

  return (
    <div className={`${styles.root} ${isOpen ? styles.open : ''}`}>
      <div className={styles.overlay} onClick={onClose} />
      
      <aside className={styles.panel} role="dialog" aria-modal="true">
        <header className={styles.header}>
          <div className={styles.icon}>S</div>
          <div>
            <div className={styles.title}>Saved Tokens</div>
            <div className={styles.sub}>Your bookmarked tokens</div>
          </div>
          <div className={styles.spacer} />
          <button className={styles.btn} title="Pin widget">Pin</button>
          <button className={styles.btn} onClick={onClose} title="Close">
            <X size={14} />
          </button>
        </header>

        <div className={styles.body}>
          {/* Search Controls */}
          <div className={styles.controls}>
            <div className={styles.searchField}>
              <label htmlFor="saved-search">Search tokens</label>
              <input
                id="saved-search"
                type="text"
                placeholder="Search by name, symbol, or address..."
                value={state.searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Token List */}
          {filteredTokens.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className={styles.tokenList}>
              {filteredTokens.map((token) => (
                <div
                  key={token.id}
                  className={styles.tokenItem}
                  onClick={() => handleTokenClick(token)}
                >
                  {/* Token Image/Placeholder */}
                  <div className={styles.tokenImage}>
                    {getTokenInitials(token.symbol)}
                  </div>

                  {/* Token Info */}
                  <div className={styles.tokenInfo}>
                    <div className={styles.tokenName}>{token.name}</div>
                    <div className={styles.tokenDetails}>
                      <span className={styles.tokenSymbol}>{token.symbol}</span>
                      <span className={styles.tokenChain}>{token.chain}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className={styles.tokenPrice}>
                    {formatCompactCurrency(token.priceUSD)}
                  </div>

                  {/* Remove Button */}
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => handleRemoveToken(token.id, e)}
                    title="Remove from saved"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className={styles.footer}>
            <div className={styles.footerContent}>
              <span>{filteredTokens.length} of {savedTokens.length} tokens</span>
              <span className={styles.desktopOnly}>Press <strong>/</strong> to search</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
