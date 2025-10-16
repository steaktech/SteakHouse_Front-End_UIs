"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './SteakHoldersWidget.module.css';
import { useHoldersData } from '@/app/hooks/useHoldersData';
import { 
  SteakHoldersWidgetProps, 
  SteakHoldersWidgetState, 
  DatasetType, 
  ProcessedHolderData,
  DistributionSegment,
  TierFilter,
  TokenData,
  HolderData
} from './types';

// Demo data matching the original structure
const demoData = {
  token: {
    name: "Amber Launch",
    symbol: "AMBR",
    chain: "EVM • Mainnet",
    address: "0xA3bC4D5E6f78901234567890aBCDeF1234567890",
    priceUSD: 0.0567,
    totalSupply: 1_000_000_000,
  },
  holders: [
    {
      address: "0x000000000000000000000000000000000000dead",
      label: "burn" as const,
      tx: 0,
      balance: 120_000_000,
    },
    {
      address: "0x12f3abC9fE00340192A5b7eE6A12F9930cAa1001",
      label: "contract" as const,
      tx: 132,
      balance: 90_000_000,
    },
    {
      address: "0x9a21bE77c0A7D343eCa11fccAc96613C5b0b9002",
      label: "exchange" as const,
      tx: 40,
      balance: 80_000_000,
    },
    {
      address: "0x88DfA22b7E3F7a6678cD334A9020aBbC9f990003",
      label: "team" as const,
      tx: 11,
      balance: 60_000_000,
    },
    {
      address: "0x77fF00B3Ae93271a21f1f9cbb2aAa91111111004",
      label: "team" as const,
      tx: 8,
      balance: 40_000_000,
    },
    {
      address: "0x6C1cF40fA9C71B1aAf5e1F9D4C771e89B55a0005",
      label: "normal" as const,
      tx: 21,
      balance: 35_800_000,
    },
    {
      address: "0x55cD672309b5F55F2a1A54c0aC0c3d19dA220006",
      label: "normal" as const,
      tx: 10,
      balance: 25_300_000,
    },
    {
      address: "0x44AA7FfE11cB055857Cab072aAb0c17010F00007",
      label: "exchange" as const,
      tx: 75,
      balance: 22_000_000,
    },
    {
      address: "0x33cCeE88a0b7dD3b9fAa50C0BBe811C0eEaa0008",
      label: "normal" as const,
      tx: 3,
      balance: 18_450_000,
    },
    {
      address: "0x22fA0B18F8810023bB3E003AfF2211900Baa0009",
      label: "normal" as const,
      tx: 15,
      balance: 15_000_000,
    },
    {
      address: "0x1111aAaA1111aaAA1111aaaa1111AaAa11110010",
      label: "normal" as const,
      tx: 9,
      balance: 12_300_000,
    },
    {
      address: "0x0fAa0a0B0C0d0E0F1029384756AaBbCcDdEe0011",
      label: "normal" as const,
      tx: 5,
      balance: 10_000_000,
    },
    {
      address: "0x19a2b3c4d5e6f7081928374655647382910e0012",
      label: "contract" as const,
      tx: 2,
      balance: 9_000_000,
    },
    {
      address: "0x20A1b2C3D4E5F60718273645aBcDeFf012340013",
      label: "normal" as const,
      tx: 1,
      balance: 8_200_000,
    },
    {
      address: "0x21BBB2222CcC3333ddd4444EEE5555fff6660014",
      label: "normal" as const,
      tx: 3,
      balance: 6_000_000,
    },
    {
      address: "0x22CcDD33eeFF44aA55bB66Cc77Dd88Ee99Ff0015",
      label: "normal" as const,
      tx: 2,
      balance: 5_500_000,
    },
    {
      address: "0x23a1a1a1a1b2b2b2c3c3c3d4d4e5e5f6f6f60016",
      label: "normal" as const,
      tx: 4,
      balance: 3_000_000,
    },
    {
      address: "0x24dddd1111eeee2222ffff3333aaaa4444bbbb17",
      label: "normal" as const,
      tx: 2,
      balance: 2_100_000,
    },
    {
      address: "0x25cafeBabe000111222333444555666777888018",
      label: "normal" as const,
      tx: 1,
      balance: 1_600_000,
    },
    {
      address: "0x26deADbeef00112233445566778899aabbcc0019",
      label: "normal" as const,
      tx: 1,
      balance: 1_250_000,
    },
    {
      address: "0x27abCD1234ef5678ABcd9012EF34567890ab0020",
      label: "normal" as const,
      tx: 1,
      balance: 890_000,
    },
  ],
};

// Utility functions
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const EN = new Intl.NumberFormat("en-US");

const PCT = (p: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(p) + "%";

const formatCompactNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return EN.format(num);
};

const formatCompactCurrency = (num: number): string => {
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return "$" + (num / 1e3).toFixed(1) + "K";
  return USD.format(num);
};

const short = (address: string): string => {
  return address.slice(0, 6) + "…" + address.slice(-4);
};

const cap = (s: string): string => {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
};

export const SteakHoldersWidget: React.FC<SteakHoldersWidgetProps> = ({ 
  isOpen, 
  onClose, 
  tokenAddress,
  data 
}) => {
  const [state, setState] = useState<SteakHoldersWidgetState>({
    dataset: null,
    q: "",
    sort: "percentDesc",
    hide: { contract: true, exchange: false, burn: false, team: false },
    tier: null,
  });

  const [filteredHolders, setFilteredHolders] = useState<ProcessedHolderData[]>([]);
  const [distributionSegments, setDistributionSegments] = useState<DistributionSegment[]>([]);

  // Fetch real holders data when tokenAddress is provided
  const { 
    data: holdersData, 
    loading: holdersLoading, 
    error: holdersError,
    refetch: refetchHolders
  } = useHoldersData({
    tokenAddress,
    enabled: isOpen && !!tokenAddress,
    autoFetch: false,
  });

  // Load dataset
  const loadDataset = useCallback((dataset: { token: TokenData; holders: HolderData[] }) => {
    const total = dataset.token.totalSupply;
    const holders = dataset.holders.map((h) => ({
      ...h,
      percent: (h.balance / total) * 100,
      valueUSD: h.balance * dataset.token.priceUSD,
    }));
    
    const newDataset: DatasetType = { 
      token: { ...dataset.token }, 
      holders: holders as ProcessedHolderData[]
    };
    
    setState(prev => ({ ...prev, dataset: newDataset }));
  }, []);

  // Load API data when available
  const loadApiDataset = useCallback((apiData: NonNullable<typeof holdersData>) => {
    const total = apiData.token.totalSupply;
    const holders = apiData.holders.map((h) => ({
      address: h.address,
      label: h.label,
      tx: h.tx,
      balance: h.balance,
      percent: h.percent, // Already calculated by API
      valueUSD: h.valueUSD, // Will be 0 for now (N/A)
    }));
    
    const newDataset: DatasetType = { 
      token: { 
        name: apiData.token.name,
        symbol: apiData.token.symbol,
        chain: apiData.token.chain,
        address: apiData.token.address,
        priceUSD: apiData.token.priceUSD,
        totalSupply: apiData.token.totalSupply
      }, 
      holders 
    };
    
    setState(prev => ({ ...prev, dataset: newDataset }));
  }, []);

  // Initialize with API data; if explicit data prop provided, use it; do not fall back to demo data
  useEffect(() => {
    if (holdersData) {
      console.log('📊 Loading API holders data');
      loadApiDataset(holdersData);
    } else if (data) {
      console.log('📊 Loading provided data');
      loadDataset(data);
    } else {
      // Keep dataset null so the widget can show an empty state instead of demo data
      console.log('⏳ Waiting for API holders data...');
      setState(prev => ({ ...prev, dataset: null }));
    }
  }, [holdersData, data, loadApiDataset, loadDataset]);

  // Fetch when widget opens (manual trigger) with guard to prevent duplicate calls in StrictMode
  const lastOpenKeyRef = React.useRef<string | null>(null);
  useEffect(() => {
    const key = isOpen && tokenAddress ? `${tokenAddress}-open` : null;
    if (!key) return;
    if (lastOpenKeyRef.current === key) return; // already fetched for this open state
    lastOpenKeyRef.current = key;
    refetchHolders();
  }, [isOpen, tokenAddress, refetchHolders]);

  // Build distribution segments - now showing top 5 holders
  const buildDistribution = useCallback(() => {
    if (!state.dataset) return [];

    const { holders } = state.dataset;
    const colors = ["#FFB000", "#8C7BFF", "#2bd899", "#ff9f43", "#ff5c5c", "#9c7a4c"];

    // Get top 5 holders
    const top5 = [...holders].sort((a, b) => b.percent - a.percent).slice(0, 5);
    const top5Share = top5.reduce((s, h) => s + h.percent, 0);
    
    // Calculate others percentage
    const othersPercent = Math.max(0, 100 - top5Share);

    // Create segments for top 5 holders
    const segments = top5.map((holder, index) => ({
      label: `#${index + 1} ${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`,
      value: holder.percent,
      color: colors[index] || colors[colors.length - 1],
      address: holder.address
    }));

    // Add others segment if there's remaining percentage
    if (othersPercent > 0.1) {
      segments.push({
        label: "Others",
        value: othersPercent,
        color: colors[5],
        address: ""
      });
    }

    return segments;
  }, [state.dataset]);

  // Apply filters
  const applyFilters = useCallback(() => {
    if (!state.dataset) return;

    const { holders } = state.dataset;
    let rows = [...holders];

    // Apply hide filters
    if (state.hide.contract) rows = rows.filter((h) => h.label !== "contract");
    if (state.hide.exchange) rows = rows.filter((h) => h.label !== "exchange");
    if (state.hide.burn) rows = rows.filter((h) => h.label !== "burn");
    if (state.hide.team) rows = rows.filter((h) => h.label !== "team");

    // Apply tier filter
    if (state.tier) {
      rows = rows.filter(
        (h) => h.percent >= state.tier!.min && h.percent <= state.tier!.max
      );
    }

    // Apply search filter
    const q = state.q.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (h) =>
          h.address.toLowerCase().includes(q) ||
          (h.label || "").toLowerCase().includes(q)
      );
    }

    // Apply sorting
    const sorters = {
      percentDesc: (a: ProcessedHolderData, b: ProcessedHolderData) => b.percent - a.percent,
      percentAsc: (a: ProcessedHolderData, b: ProcessedHolderData) => a.percent - b.percent,
      balanceDesc: (a: ProcessedHolderData, b: ProcessedHolderData) => b.balance - a.balance,
      balanceAsc: (a: ProcessedHolderData, b: ProcessedHolderData) => a.balance - b.balance,
      valueDesc: (a: ProcessedHolderData, b: ProcessedHolderData) => b.valueUSD - a.valueUSD,
      valueAsc: (a: ProcessedHolderData, b: ProcessedHolderData) => a.valueUSD - b.valueUSD,
    };
    rows.sort(sorters[state.sort]);

    setFilteredHolders(rows);
  }, [state]);

  // Update filters when state changes
  useEffect(() => {
    applyFilters();
    setDistributionSegments(buildDistribution());
  }, [state, applyFilters, buildDistribution]);

  // Event handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, q: e.target.value }));
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(prev => ({ ...prev, sort: e.target.value as any }));
  };

  const handleTierClick = (min: string, max: string) => {
    const minVal = min === "" ? null : parseFloat(min);
    const maxVal = max === "" ? null : parseFloat(max);
    const tier = minVal === null || maxVal === null ? null : { min: minVal, max: maxVal };
    setState(prev => ({ ...prev, tier }));
  };

  const handleToggle = (key: keyof typeof state.hide) => {
    setState(prev => ({
      ...prev,
      hide: { ...prev.hide, [key]: !prev.hide[key] }
    }));
  };

  const copyToClipboard = async (text: string, button: HTMLButtonElement) => {
    try {
      await navigator.clipboard.writeText(text);
      button.classList.add(styles.ok);
      setTimeout(() => button.classList.remove(styles.ok), 900);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("hw-search")?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Render donut chart
  const renderDonut = () => {
    const segments = distributionSegments;
    const C = 2 * Math.PI * 46;
    let offset = 0;

    return (
      <svg
        viewBox="0 0 120 120"
        width="92"
        height="92"
        role="img"
        aria-label="Supply distribution"
      >
        <circle
          cx="60"
          cy="60"
          r="46"
          fill="none"
          stroke="#3a2a19"
          strokeWidth="14"
        />
        {segments.map((segment, index) => {
          const length = (Math.max(0, Math.min(100, segment.value)) / 100) * C;
          const element = (
            <circle
              key={index}
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke={segment.color}
              strokeWidth="14"
              strokeDasharray={`${length} ${C - length}`}
              strokeDashoffset={`${-offset}`}
              transform="rotate(-90 60 60)"
            />
          );
          offset += length;
          return element;
        })}
        <circle cx="60" cy="60" r="35" fill="url(#hw-hole)" />
        <defs>
          <radialGradient id="hw-hole">
            <stop offset="0%" stopColor="#1b0f08" />
            <stop offset="100%" stopColor="#1b0f08" stopOpacity=".85" />
          </radialGradient>
        </defs>
        <text
          x="60"
          y="60"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffd79a"
          fontSize="12"
          fontWeight="900"
        >
          Top 5
        </text>
      </svg>
    );
  };

  // Show loading state
  if (holdersLoading && !state.dataset) {
    return (
      <div className={`${styles.root} ${isOpen ? styles.open : ''}`}>
        <div className={styles.overlay} onClick={onClose} />
        <aside className={styles.panel} role="dialog" aria-modal="true">
          <header className={styles.header}>
            <div className={styles.icon}>H</div>
            <div>
              <div className={styles.title}>Holders</div>
              <div className={styles.sub}>Loading token data...</div>
            </div>
            <div className={styles.spacer} />
            <button className={styles.btn} onClick={onClose} title="Close">Close</button>
          </header>
          <div className={styles.body}>
            <div style={{ padding: '40px', textAlign: 'center', color: '#ffd79a' }}>
              <div>Loading holders data...</div>
              {tokenAddress && (
                <div style={{ marginTop: '10px', fontSize: '14px', opacity: 0.7 }}>
                  Token: {tokenAddress.slice(0, 8)}...{tokenAddress.slice(-6)}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    );
  }

  // Show error state: render only the error string
  if (holdersError && !state.dataset) {
    return (
      <div className={`${styles.root} ${isOpen ? styles.open : ''}`}>
        <div className={styles.overlay} onClick={onClose} />
        <aside className={styles.panel} role="dialog" aria-modal="true">
          <header className={styles.header}>
            <div className={styles.icon}>H</div>
            <div>
              <div className={styles.title}>Holders</div>
            </div>
            <div className={styles.spacer} />
            <button className={styles.btn} onClick={onClose} title="Close">Close</button>
          </header>
          <div className={styles.body}>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#e6d4a3', opacity: 0.85 }}>
                {holdersError}
              </div>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  // Empty state: no dataset and not loading/error -> show message
  if (!holdersLoading && !holdersError && !state.dataset) {
    return (
      <div className={`${styles.root} ${isOpen ? styles.open : ''}`}>
        <div className={styles.overlay} onClick={onClose} />
        <aside className={styles.panel} role="dialog" aria-modal="true">
          <header className={styles.header}>
            <div className={styles.icon}>H</div>
            <div>
              <div className={styles.title}>Holders</div>
              <div className={styles.sub}>No holders data available</div>
            </div>
            <div className={styles.spacer} />
            <button className={styles.btn} onClick={onClose} title="Close">Close</button>
          </header>
          <div className={styles.body}>
            <div style={{ padding: '40px', textAlign: 'center', color: '#ffd79a' }}>
              <div>Holders is empty.</div>
              {tokenAddress && (
                <div style={{ marginTop: '10px', fontSize: '14px', opacity: 0.7 }}>
                  Token: {tokenAddress.slice(0, 8)}...{tokenAddress.slice(-6)}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    );
  }

  if (!state.dataset) return null;

  const { token, holders } = state.dataset;
  const top10 = [...holders].sort((a, b) => b.percent - a.percent).slice(0, 10);
  const top10Share = top10.reduce((s, h) => s + h.percent, 0);

  return (
    <div className={`${styles.root} ${isOpen ? styles.open : ''}`}>
      <div className={styles.overlay} onClick={onClose} />
      
      <aside className={styles.panel} role="dialog" aria-modal="true">
        <header className={styles.header}>
          <div className={styles.icon}>H</div>
          <div>
            <div className={styles.title}>Holders</div>
            <div className={styles.sub}>Token distribution • whales • filters</div>
          </div>
          <div className={styles.spacer} />
          <button className={styles.btn} title="Pin widget">Pin</button>
          <button className={styles.btn} onClick={onClose} title="Close">Close</button>
        </header>

        <div className={styles.body}>
          <div className={styles.grid}>
            {/* LEFT: Token Overview */}
            <section className={styles.card}>
              <div className={styles.row} style={{ gap: '14px', marginBottom: '10px' }}>
                <div className={styles.tokenLogo}>
                  {token.symbol === "N/A" ? "??" : token.symbol.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.row} style={{ gap: '8px', alignItems: 'center' }}>
                    <div className={styles.tokenTitle}>
                      {token.name === "N/A" ? `Token ${short(token.address)}` : `${token.name} (${token.symbol})`}
                    </div>
                    <span className={styles.pill}>
                      {token.chain === "N/A" ? "EVM Network" : token.chain}
                    </span>
                    <span className={styles.pill}>Holders: {EN.format(holders.length)}</span>
                  </div>
                  <div className={styles.row} style={{ marginTop: '6px' }}>
                    <span className={styles.muted}>Contract:</span>
                    <span className={styles.contract}>{short(token.address)}</span>
                    <button 
                      className={styles.copyBtn}
                      onClick={(e) => copyToClipboard(token.address, e.currentTarget)}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.kpis}>
                <div className={styles.kpi}>
                  <div className={`${styles.lbl} lbl`}>Price</div>
                  <div className={`${styles.val} val`}>
                    {token.priceUSD === 0 ? "N/A" : USD.format(token.priceUSD)}
                  </div>
                </div>
                <div className={styles.kpi}>
                  <div className={`${styles.lbl} lbl`}>Market Cap</div>
                  <div className={`${styles.val} val`}>
                    {token.priceUSD === 0 ? "N/A" : formatCompactCurrency(token.priceUSD * token.totalSupply)}
                  </div>
                </div>
                <div className={styles.kpi}>
                  <div className={`${styles.lbl} lbl`}>Total Supply</div>
                  <div className={`${styles.val} val`}>
                    {formatCompactNumber(token.totalSupply)} {token.symbol === "N/A" ? "Tokens" : token.symbol}
                  </div>
                </div>
                <div className={styles.kpi}>
                  <div className={`${styles.lbl} lbl`}>Top 10 share</div>
                  <div className={`${styles.val} val`}>{PCT(top10Share)}</div>
                </div>
              </div>

              <div className={styles.card} style={{ marginTop: '14px' }}>
                <div className={styles.dist}>
                  {renderDonut()}
                  <div className={styles.legend}>
                    {distributionSegments.map((segment, index) => (
                      <div key={index} className={styles.item}>
                        <div className={styles.dot} style={{ background: segment.color }} />
                        <span 
                          className={styles.legendLbl}
                          style={{ 
                            cursor: segment.address ? 'pointer' : 'default',
                            textDecoration: segment.address ? 'underline' : 'none'
                          }}
                          onClick={() => {
                            if (segment.address) {
                              navigator.clipboard.writeText(segment.address);
                              console.log('Copied address:', segment.address);
                            }
                          }}
                          title={segment.address ? `Click to copy: ${segment.address}` : segment.label}
                        >
                          {segment.label}
                        </span>
                        <span className={styles.legendVal}>{PCT(segment.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.foot}>
                <div>Last update: <span>{new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span></div>
                <div className={styles.row}>
                  <button className={styles.btn}>Export CSV</button>
                  <button className={styles.btn}>Export JSON</button>
                </div>
              </div>
            </section>

            {/* RIGHT: Filters + Table */}
            <section className={styles.card}>
              <div className={styles.controls}>
                <div className={styles.field}>
                  <span className={styles.muted}>Search</span>
                  <input
                    id="hw-search"
                    placeholder="0xabc… • exchange • team • whale"
                    value={state.q}
                    onChange={handleSearch}
                  />
                </div>
                <div className={styles.field}>
                  <span className={styles.muted}>Sort</span>
                  <select value={state.sort} onChange={handleSort}>
                    <option value="percentDesc">% of supply ↓</option>
                    <option value="percentAsc">% of supply ↑</option>
                    <option value="balanceDesc">Balance ↓</option>
                    <option value="balanceAsc">Balance ↑</option>
                    <option value="valueDesc">Value (USD) ↓</option>
                    <option value="valueAsc">Value (USD) ↑</option>
                  </select>
                </div>
              </div>

              <div className={styles.chips}>
                <div 
                  className={`${styles.chip} ${!state.tier ? styles.active : ''}`}
                  onClick={() => handleTierClick('', '')}
                >
                  All
                </div>
                <div 
                  className={`${styles.chip} ${state.tier?.min === 1 ? styles.active : ''}`}
                  onClick={() => handleTierClick('1', '100')}
                >
                  Whales ≥ 1%
                </div>
                <div 
                  className={`${styles.chip} ${state.tier?.min === 0.1 && state.tier?.max === 1 ? styles.active : ''}`}
                  onClick={() => handleTierClick('0.1', '1')}
                >
                  Dolphins 0.1–1%
                </div>
                <div 
                  className={`${styles.chip} ${state.tier?.max === 0.1 ? styles.active : ''}`}
                  onClick={() => handleTierClick('0', '0.1')}
                >
                  Shrimps ≤ 0.1%
                </div>
              </div>

              <div className={styles.toggles}>
                <label className={styles.toggle}>
                  <input 
                    type="checkbox" 
                    checked={state.hide.contract}
                    onChange={() => handleToggle('contract')}
                  />
                  Hide Contracts
                </label>
                <label className={styles.toggle}>
                  <input 
                    type="checkbox" 
                    checked={state.hide.exchange}
                    onChange={() => handleToggle('exchange')}
                  />
                  Hide Exchanges
                </label>
                <label className={styles.toggle}>
                  <input 
                    type="checkbox" 
                    checked={state.hide.burn}
                    onChange={() => handleToggle('burn')}
                  />
                  Hide Burn
                </label>
                <label className={styles.toggle}>
                  <input 
                    type="checkbox" 
                    checked={state.hide.team}
                    onChange={() => handleToggle('team')}
                  />
                  Hide Team
                </label>
              </div>

              <div className={styles.table}>
                {filteredHolders.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#ffd79a' }}>
                    Holders is empty.
                  </div>
                ) : (
                  <table className={styles.tableElement}>
                  <colgroup>
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '38%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '8%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Address</th>
                      <th className="num">Balance</th>
                      <th className="num">% Supply</th>
                      <th className="num">Value (USD)</th>
                      <th className="num">Tx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHolders.map((holder, index) => (
                      <tr key={holder.address}>
                        <td className={styles.rank}>{index + 1}</td>
                        <td>
                          <div className={styles.addr}>
                            <span style={{ fontFamily: 'ui-monospace, Menlo, Consolas' }}>
                              {short(holder.address)}
                            </span>
                            {holder.label !== 'normal' && (
                              <span className={`${styles.tag} ${styles[holder.label]}`}>
                                {cap(holder.label)}
                              </span>
                            )}
                            <button 
                              className={styles.copyBtn}
                              onClick={(e) => copyToClipboard(holder.address, e.currentTarget)}
                            />
                          </div>
                        </td>
                        <td className={`${styles.val} num`}>
                          {EN.format(holder.balance)} {token.symbol === "N/A" ? "Tokens" : token.symbol}
                        </td>
                        <td className={`${styles.pct} num`}>{PCT(holder.percent)}</td>
                        <td className={`${styles.val} num`}>
                          {holder.valueUSD === 0 ? "N/A" : USD.format(holder.valueUSD)}
                        </td>
                        <td className={`${styles.muted} num`}>
                          {holder.tx === 0 ? "N/A" : EN.format(holder.tx)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>

              <div className={styles.foot}>
                <div>
                  Filtered: <span>{EN.format(filteredHolders.length)}</span> of{' '}
                  <span>{EN.format(holders.length)}</span>
                </div>
                <div className={styles.muted}>
                  Tip: Press <span className={styles.kbd}>/</span> to focus search
                </div>
              </div>
            </section>
          </div>
        </div>
      </aside>
    </div>
  );
};
