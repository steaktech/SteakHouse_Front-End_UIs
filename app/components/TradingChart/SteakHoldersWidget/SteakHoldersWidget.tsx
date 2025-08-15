"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './SteakHoldersWidget.module.css';
import { 
  SteakHoldersWidgetProps, 
  SteakHoldersWidgetState, 
  DatasetType, 
  ProcessedHolderData,
  DistributionSegment,
  TierFilter
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
    // Add more demo data as needed...
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

  // Load dataset
  const loadDataset = useCallback((dataset: typeof demoData) => {
    const total = dataset.token.totalSupply;
    const holders = dataset.holders.map((h) => ({
      ...h,
      percent: (h.balance / total) * 100,
      valueUSD: h.balance * dataset.token.priceUSD,
    }));
    
    const newDataset: DatasetType = { 
      token: { ...dataset.token }, 
      holders 
    };
    
    setState(prev => ({ ...prev, dataset: newDataset }));
  }, []);

  // Initialize with demo data or provided data
  useEffect(() => {
    loadDataset(data || demoData);
  }, [data, loadDataset]);

  // Build distribution segments
  const buildDistribution = useCallback(() => {
    if (!state.dataset) return [];

    const { holders } = state.dataset;
    const colors = {
      team: "#8C7BFF",
      exchange: "#2bd899",
      contract: "#ff9f43",
      burn: "#ff5c5c",
      others: "#9c7a4c",
    };

    const top10 = [...holders].sort((a, b) => b.percent - a.percent).slice(0, 10);
    const top10Share = top10.reduce((s, h) => s + h.percent, 0);

    const sum = (lbl: string) => {
      return holders
        .filter((h) => h.label === lbl)
        .reduce((s, h) => s + h.percent, 0);
    };

    const buckets = [
      { label: "Team", value: sum("team"), color: colors.team },
      { label: "Exchanges", value: sum("exchange"), color: colors.exchange },
      { label: "Contracts", value: sum("contract"), color: colors.contract },
      { label: "Burn", value: sum("burn"), color: colors.burn },
    ];

    const others = Math.max(0, 100 - buckets.reduce((s, b) => s + b.value, 0));
    buckets.push({ label: "Others", value: others, color: colors.others });

    const segments = [
      { label: "Top 10", value: top10Share, color: "#FFB000" },
    ].concat(buckets.filter((b) => b.value > 0.05));

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
          {segments.find(s => s.label === "Top 10") ? PCT(segments.find(s => s.label === "Top 10")!.value) : "—"}
        </text>
      </svg>
    );
  };

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
                  {token.symbol.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.row} style={{ gap: '8px', alignItems: 'center' }}>
                    <div className={styles.tokenTitle}>
                      {token.name} ({token.symbol})
                    </div>
                    <span className={styles.pill}>{token.chain}</span>
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
                  <div className="lbl">Price</div>
                  <div className="val">{USD.format(token.priceUSD)}</div>
                </div>
                <div className={styles.kpi}>
                  <div className="lbl">Market Cap</div>
                  <div className="val">{formatCompactCurrency(token.priceUSD * token.totalSupply)}</div>
                </div>
                <div className={styles.kpi}>
                  <div className="lbl">Total Supply</div>
                  <div className="val">{formatCompactNumber(token.totalSupply)} {token.symbol}</div>
                </div>
                <div className={styles.kpi}>
                  <div className="lbl">Top 10 share</div>
                  <div className="val">{PCT(top10Share)}</div>
                </div>
              </div>

              <div className={styles.card} style={{ marginTop: '14px' }}>
                <div className={styles.dist}>
                  {renderDonut()}
                  <div className={styles.legend}>
                    {distributionSegments.map((segment, index) => (
                      <div key={index} className="item">
                        <div className={styles.dot} style={{ background: segment.color }} />
                        <div className={`${styles.legend} lbl`}>{segment.label}</div>
                        <div style={{ flex: 1 }} />
                        <div className={`${styles.legend} val`}>{PCT(segment.value)}</div>
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
                          {EN.format(holder.balance)} {token.symbol}
                        </td>
                        <td className={`${styles.pct} num`}>{PCT(holder.percent)}</td>
                        <td className={`${styles.val} num`}>{USD.format(holder.valueUSD)}</td>
                        <td className={`${styles.muted} num`}>{EN.format(holder.tx)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
