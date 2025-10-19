"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import { Lock, Clock, Unlock, ExternalLink } from "lucide-react";
import pageStyles from "./LockerPage.module.css";
import widgetStyles from "@/app/components/Widgets/LockerWidget/LockerWidget.module.css";
import type {
  DurationPreset,
  LockFormData,
  TokenLock,
  TabType,
} from "@/app/components/Widgets/LockerWidget/types";

// Demo data (same shape as widget)
const demoLocks: TokenLock[] = [
  {
    id: "1",
    tokenAddress: "0xA3bC4D5E6f78901234567890aBCDeF1234567890",
    tokenName: "Amber Launch",
    tokenSymbol: "AMBR",
    amount: 1000000,
    lockedAt: new Date("2025-09-01T10:00:00Z"),
    unlockDate: new Date("2025-12-01T10:00:00Z"),
    status: "active",
    owner: "0x123...789",
    withdrawable: false,
  },
  {
    id: "2",
    tokenAddress: "0x1234567890abcdef1234567890abcdef12345678",
    tokenName: "Ethereum",
    tokenSymbol: "ETH",
    amount: 50,
    lockedAt: new Date("2025-08-15T15:30:00Z"),
    unlockDate: new Date("2025-10-10T15:30:00Z"),
    status: "expired",
    owner: "0x123...789",
    withdrawable: true,
  },
  {
    id: "3",
    tokenAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    tokenName: "SteakCoin",
    tokenSymbol: "STEAK",
    amount: 500000,
    lockedAt: new Date("2025-07-01T08:00:00Z"),
    unlockDate: new Date("2026-01-01T08:00:00Z"),
    status: "active",
    owner: "0x123...789",
    withdrawable: false,
  },
];

// Utilities (mirroring widget for consistency)
const formatNumber = (num: number): string =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  }).format(num);

const formatCompactNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return formatNumber(num);
};

const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const getTimeRemaining = (unlockDate: Date): string => {
  const now = new Date();
  const diff = unlockDate.getTime() - now.getTime();
  if (diff <= 0) return "Expired";
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

const getTokenInitials = (symbol: string): string => symbol.slice(0, 2).toUpperCase();

export default function LockerPage() {
  const [activeTab, setActiveTab] = useState<TabType>("create");
  const [formData, setFormData] = useState<LockFormData>({
    tokenAddress: "",
    amount: "100",
    lockDuration: 30,
  });
  const [locks, setLocks] = useState<TokenLock[]>(demoLocks);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const filteredLocks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let arr = [...locks];
    if (q) {
      arr = arr.filter(
        (l) =>
          l.tokenName.toLowerCase().includes(q) ||
          l.tokenSymbol.toLowerCase().includes(q) ||
          l.tokenAddress.toLowerCase().includes(q)
      );
    }
    // Default sort by unlock date desc
    arr.sort((a, b) => b.unlockDate.getTime() - a.unlockDate.getTime());
    return arr;
  }, [locks, searchQuery]);

  const handleFormChange = (field: keyof LockFormData, value: string | number) => {
    setFormData((p) => ({ ...p, [field]: value as any }));
  };

  const handleDurationSelect = (days: DurationPreset) => {
    setFormData((p) => ({ ...p, lockDuration: days }));
  };

  const handleCreateLock = async () => {
    if (!formData.tokenAddress || !formData.amount) return;
    setIsLoading(true);
    try {
      const newLock: TokenLock = {
        id: Date.now().toString(),
        tokenAddress: formData.tokenAddress,
        tokenName: "New Token",
        tokenSymbol: "NEW",
        amount: parseFloat(formData.amount),
        lockedAt: new Date(),
        unlockDate: new Date(Date.now() + formData.lockDuration * 24 * 60 * 60 * 1000),
        status: "active",
        owner: "0x123...789",
        withdrawable: false,
      };
      setLocks((prev) => [...prev, newLock]);
      setFormData({ tokenAddress: "", amount: "100", lockDuration: 30 });
      setActiveTab("manage");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async (lockId: string) => {
    setIsLoading(true);
    try {
      setLocks((prev) =>
        prev.map((l) => (l.id === lockId ? { ...l, status: "unlocked", withdrawable: false } : l))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderCreate = () => {
    const durationPresets: DurationPreset[] = [7, 14, 30, 90, 180, 365];
    const unlockDate = new Date(Date.now() + formData.lockDuration * 24 * 60 * 60 * 1000);

    return (
      <div className={widgetStyles.form}>
        <div className={widgetStyles.formGroup}>
          <label className={widgetStyles.label}>Liquidity Pool / Token Address</label>
          <input
            type="text"
            className={widgetStyles.input}
            placeholder="0x..."
            value={formData.tokenAddress}
            onChange={(e) => handleFormChange("tokenAddress", e.target.value)}
          />
        </div>

        <div className={widgetStyles.formGroup}>
          <label className={widgetStyles.label}>Amount to Lock: {formData.amount}%</label>
          <div style={{ position: "relative", marginTop: 12 }}>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={formData.amount}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                const snapRange = 3;
                const major = [0, 25, 50, 75, 100];
                let snapped = value;
                for (const m of major) if (Math.abs(value - m) <= snapRange) { snapped = m; break; }
                handleFormChange("amount", snapped.toString());
              }}
              style={{
                width: "100%",
                height: 8,
                borderRadius: 4,
                background: `linear-gradient(to right, #4ade80 0%, #4ade80 ${formData.amount}%, rgba(255, 224, 185, 0.2) ${formData.amount}%, rgba(255, 224, 185, 0.2) 100%)`,
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
                cursor: "pointer",
                border: "1px solid rgba(255, 210, 160, 0.3)",
              }}
              className="locker-slider"
            />
            <style>{`
              .locker-slider::-webkit-slider-thumb {
                appearance: none;
                width: 20px; height: 20px; border-radius: 50%;
                background: linear-gradient(180deg, #ffe49c, #ffc96a);
                border: 2px solid #8c5523; cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              }
              .locker-slider::-moz-range-thumb {
                width: 20px; height: 20px; border-radius: 50%;
                background: linear-gradient(180deg, #ffe49c, #ffc96a);
                border: 2px solid #8c5523; cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              }
              .locker-slider::-webkit-slider-thumb:hover,
              .locker-slider::-moz-range-thumb:hover {
                background: linear-gradient(180deg, #ffeeb0, #ffd47e);
                box-shadow: 0 3px 6px rgba(0,0,0,0.4);
              }
            `}</style>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "rgba(254, 234, 136, 0.6)", fontWeight: 600 }}>
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
          </div>
        </div>

        <div className={widgetStyles.formGroup}>
          <label className={widgetStyles.label}>Lock Duration</label>
          <div className={widgetStyles.durationGrid}>
            {durationPresets.map((days) => (
              <button
                key={days}
                className={`${widgetStyles.durationBtn} ${formData.lockDuration === days ? widgetStyles.selected : ""}`}
                onClick={() => handleDurationSelect(days)}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        <div className={widgetStyles.infoBox}>
          <div className={widgetStyles.infoRow}>
            <span className={widgetStyles.infoLabel}>Lock Duration</span>
            <span className={widgetStyles.infoValue}>{formData.lockDuration} Days</span>
          </div>
          <div className={widgetStyles.infoRow}>
            <span className={widgetStyles.infoLabel}>Unlock Date</span>
            <span className={widgetStyles.infoValue}>{formatDate(unlockDate)}</span>
          </div>
        </div>

        <button className={widgetStyles.actionBtn} onClick={handleCreateLock} disabled={isLoading || !formData.tokenAddress || !formData.amount}>
          {isLoading ? "Creating Lock..." : "Create Lock"}
        </button>
      </div>
    );
  };

  const renderManage = () => {
    if (filteredLocks.length === 0) {
      return (
        <div className={widgetStyles.emptyState}>
          <div className={widgetStyles.emptyIcon}>
            <Lock size={28} />
          </div>
          <div className={widgetStyles.emptyTitle}>No Locks Found</div>
          <div className={widgetStyles.emptyMessage}>
            {searchQuery ? "No locks match your search criteria." : "Create your first token lock to get started."}
          </div>
        </div>
      );
    }

    return (
      <div className={widgetStyles.lockList}>
        <div className={widgetStyles.searchBar}>
          <div className={widgetStyles.formGroup}>
            <input
              type="text"
              className={widgetStyles.input}
              placeholder="Search by token name, symbol, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredLocks.map((lock) => {
          const progress = getLockProgress(lock);
          const timeRemaining = getTimeRemaining(lock.unlockDate);
          return (
            <div key={lock.id} className={widgetStyles.lockCard}>
              <div className={widgetStyles.lockHeader}>
                <div className={widgetStyles.lockToken}>
                  <div className={widgetStyles.lockAvatar}>{getTokenInitials(lock.tokenSymbol)}</div>
                  <div className={widgetStyles.lockTokenInfo}>
                    <div className={widgetStyles.lockName}>{lock.tokenName}</div>
                    <div className={widgetStyles.lockSymbol}>{lock.tokenSymbol}</div>
                  </div>
                </div>
                <div className={`${widgetStyles.lockBadge} ${widgetStyles[lock.status]}`}>{lock.status}</div>
              </div>

              <div className={widgetStyles.lockDetails}>
                <div className={widgetStyles.lockDetail}>
                  <div className={widgetStyles.lockDetailLabel}>Amount</div>
                  <div className={widgetStyles.lockDetailValue}>{formatCompactNumber(lock.amount)}</div>
                </div>
                <div className={widgetStyles.lockDetail}>
                  <div className={widgetStyles.lockDetailLabel}>Time Left</div>
                  <div className={widgetStyles.lockDetailValue}>{timeRemaining}</div>
                </div>
                <div className={widgetStyles.lockDetail}>
                  <div className={widgetStyles.lockDetailLabel}>Locked On</div>
                  <div className={widgetStyles.lockDetailValue}>{formatDate(lock.lockedAt)}</div>
                </div>
                <div className={widgetStyles.lockDetail}>
                  <div className={widgetStyles.lockDetailLabel}>Unlock Date</div>
                  <div className={widgetStyles.lockDetailValue}>{formatDate(lock.unlockDate)}</div>
                </div>
              </div>

              {lock.status !== "unlocked" && (
                <div className={widgetStyles.progressBar}>
                  <div className={widgetStyles.progressFill} style={{ width: `${progress}%` }} />
                </div>
              )}

              <div className={widgetStyles.lockActions}>
                <button className={widgetStyles.unlockBtn} onClick={() => handleUnlock(lock.id)} disabled={!lock.withdrawable || isLoading}>
                  {lock.withdrawable ? (
                    <>
                      <Unlock size={14} /> Unlock
                    </>
                  ) : (
                    "Locked"
                  )}
                </button>
                <button className={widgetStyles.viewBtn}>
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
    <>
      <Header />
      <main className={pageStyles.root}>
        <div className={pageStyles.container}>
          <section className={pageStyles.header}>
            <div className={pageStyles.icon}>🔒</div>
            <div>
              <h1 className={pageStyles.title}>Token Locker</h1>
              <p className={pageStyles.subtitle}>Lock tokens securely for any duration</p>
            </div>
          </section>

          {/* Top tabs on all sizes */}
          <nav className={pageStyles.tabs}>
            <button
              className={`${pageStyles.tab} ${activeTab === "create" ? pageStyles.active : ""}`}
              onClick={() => setActiveTab("create")}
            >
              <Lock size={16} /> Create Lock
            </button>
            <button
              className={`${pageStyles.tab} ${activeTab === "manage" ? pageStyles.active : ""}`}
              onClick={() => setActiveTab("manage")}
            >
              <Clock size={16} /> Manage Locks
            </button>
          </nav>

          <div className={pageStyles.main}>
            <section className={pageStyles.content}>
              {activeTab === "create" ? renderCreate() : renderManage()}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}