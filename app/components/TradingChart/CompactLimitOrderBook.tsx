"use client";

import React, { useState } from "react";

// Minimal types for placeholder orders
export type OrderStatus = "pending" | "filled" | "cancelled";
export interface LimitOrder {
  id: string;
  side: "buy" | "sell";
  amount: number;
  remaining: number;
  price: number;
  createdAt: string; // ISO string
  status: OrderStatus;
}

interface CompactLimitOrderBookProps {
  orders?: LimitOrder[];
  loading?: boolean;
  error?: string;
  showToggle?: boolean;
  showLimitOrders?: boolean;
  onToggleChange?: (show: boolean) => void;
  isMobile?: boolean;
}

const BuyArrow = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const SellArrow = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 7L7 17M7 17H15M7 17V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export const CompactLimitOrderBook: React.FC<CompactLimitOrderBookProps> = ({
  orders = [],
  loading = false,
  error,
  showToggle = false,
  showLimitOrders = true,
  onToggleChange,
  isMobile = false,
}) => {
  const [filterStatus, setFilterStatus] = useState<"all" | OrderStatus>("all");

  const filteredOrders = (orders || [])
    .filter((o) => (filterStatus === "all" ? true : o.status === filterStatus))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "filled":
        return "✓";
      case "pending":
        return "⏳";
      case "cancelled":
        return "✕";
      default:
        return "•";
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        borderRadius: "clamp(18px, 2.5vw, 26px)",
        background:
          "linear-gradient(180deg, #572501, #572501 10%, #572501 58%, #7d3802 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        padding: "clamp(16px, 3vh, 22px)",
        border: "1px solid rgba(255, 215, 165, 0.4)",
        overflow: "hidden",
        color: "#fff7ea",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* Header with optional toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "clamp(6px, 1vh, 8px)",
        }}
      >
        <h3
          style={{
            color: "#feea88",
            fontFamily: '"Sora", "Inter", sans-serif',
            fontWeight: 800,
            fontSize: isMobile ? "12px" : "clamp(12px, 2vw, 14px)",
            lineHeight: 1,
            margin: 0,
            textShadow: "0 1px 0 rgba(0, 0, 0, 0.18)",
          }}
        >
          Limit Orders
        </h3>

        {showToggle && onToggleChange && (
          <div
            style={{
              position: "relative",
              display: "flex",
              background: "linear-gradient(180deg, #7f4108, #6f3906)",
              border: "1px solid rgba(255, 215, 165, 0.4)",
              borderRadius: "16px",
              padding: "2px",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.08)",
              flexShrink: 0,
              width: "120px",
              height: "26px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "2px",
                left: showLimitOrders ? "calc(50% + 1px)" : "2px",
                height: "calc(100% - 4px)",
                width: "calc(50% - 3px)",
                borderRadius: "13px",
                transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                background: showLimitOrders
                  ? "linear-gradient(180deg, #ffd700, #daa20b)"
                  : "linear-gradient(180deg, #4ade80, #22c55e)",
                boxShadow:
                  "0 2px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
              }}
            />
            <button
              onClick={() => onToggleChange(false)}
              style={{
                position: "relative",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                fontWeight: 700,
                color: !showLimitOrders ? "#1f2937" : "#feea88",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 200ms ease",
                whiteSpace: "nowrap",
                width: "50%",
                height: "100%",
                letterSpacing: "0.4px",
              }}
            >
              TXN
            </button>
            <button
              onClick={() => onToggleChange(true)}
              style={{
                position: "relative",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                fontWeight: 700,
                color: showLimitOrders ? "#1f2937" : "#feea88",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 200ms ease",
                whiteSpace: "nowrap",
                width: "50%",
                height: "100%",
                letterSpacing: "0.4px",
              }}
            >
              ORDERS
            </button>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "clamp(8px, 1.5vh, 12px)",
          flexWrap: "wrap",
          padding: "clamp(8px, 1.5vh, 10px) clamp(10px, 2.5vh, 14px)",
          background:
            "linear-gradient(180deg, rgba(87, 37, 1, 0.4), rgba(87, 37, 1, 0.3) 50%, rgba(87, 37, 1, 0.35) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))",
          border: "1px solid rgba(255, 215, 165, 0.25)",
          borderRadius: "clamp(8px, 1.6vw, 12px)",
          boxShadow:
            "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span
            style={{
              fontSize: "clamp(9px, 1.6vw, 11px)",
              color: "#feea88",
              fontWeight: 800,
              textShadow: "0 1px 0 rgba(0, 0, 0, 0.4)",
              letterSpacing: "0.2px",
            }}
          >
            STATUS
          </span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{
              background: "linear-gradient(180deg, #3a1c08, #2d1506)",
              border: "1px solid rgba(255, 215, 165, 0.4)",
              borderRadius: "clamp(5px, 1.2vw, 6px)",
              padding: "clamp(3px, 1vh, 5px) clamp(6px, 1.6vw, 8px)",
              fontSize: "clamp(8px, 1.4vw, 10px)",
              fontWeight: 700,
              color: "#feea88",
              outline: "none",
              cursor: "pointer",
              minWidth: "50px",
              boxShadow:
                "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 1px 3px rgba(0, 0, 0, 0.2)",
              textShadow: "0 1px 0 rgba(0, 0, 0, 0.3)",
            }}
          >
            <option value="all" style={{ background: "#2d1506", color: "#feea88" }}>
              All
            </option>
            <option value="pending" style={{ background: "#2d1506", color: "#feea88" }}>
              Active
            </option>
            <option value="filled" style={{ background: "#2d1506", color: "#feea88" }}>
              Filled
            </option>
            <option value="cancelled" style={{ background: "#2d1506", color: "#feea88" }}>
              Cancelled
            </option>
          </select>
        </div>

        <span
          style={{
            marginLeft: "auto",
            fontSize: "clamp(11px, 2vw, 13px)",
            color: "#feea88",
            fontWeight: 800,
            textShadow: "0 1px 0 rgba(0, 0, 0, 0.4)",
            letterSpacing: "0.3px",
          }}
        >
          {filteredOrders.length} ORDERS
        </span>
      </div>

      {/* Orders list */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div
          className="trade-history-scrollbar"
          style={{
            overflowY: "auto",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "8px" : "6px",
            padding: isMobile ? "0 3px" : "0 1px",
            paddingRight: isMobile ? "3px" : "4px",
          }}
        >
          {loading && (
            <div style={{ textAlign: "center", color: "#feea88", padding: "10px", fontSize: "11px" }}>
              Loading...
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div
              style={{ textAlign: "center", color: "#feea88", padding: "20px 10px", fontSize: "11px", opacity: 0.7 }}
            >
              No active orders
            </div>
          )}

          {!loading &&
            filteredOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: isMobile
                    ? "rgba(87, 37, 1, 0.6)"
                    : "linear-gradient(180deg, rgba(87, 37, 1, 0.4), rgba(87, 37, 1, 0.3) 50%, rgba(87, 37, 1, 0.35) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0))",
                  border: isMobile ? "2px solid rgba(255, 215, 165, 0.4)" : "1px solid rgba(255, 215, 165, 0.25)",
                  borderRadius: isMobile ? "14px" : "clamp(8px, 1.6vw, 12px)",
                  padding: isMobile ? "10px 12px" : "clamp(8px, 1.5vh, 10px) clamp(10px, 2.5vh, 14px)",
                  boxShadow: isMobile
                    ? "0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                    : "0 2px 6px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: order.side === "buy" ? "#22c55e" : "#ef4444",
                    color: "white",
                    fontSize: "9px",
                    fontWeight: "bold",
                    flexShrink: 0,
                  }}
                >
                  {order.side === "buy" ? <BuyArrow size={10} /> : <SellArrow size={10} />}
                </div>

                <span
                  style={{
                    fontSize: "clamp(11px, 2vw, 13px)",
                    fontWeight: 800,
                    color: order.side === "buy" ? "#22c55e" : "#ef4444",
                    textTransform: "uppercase",
                    minWidth: "28px",
                    flexShrink: 0,
                  }}
                >
                  {order.side.toUpperCase()}
                </span>

                <span style={{ fontSize: "clamp(11px, 2vw, 13px)", fontWeight: 700, color: "#feea88", flexShrink: 0 }}>
                  {order.amount.toLocaleString()}
                </span>

                <span
                  style={{ fontSize: "clamp(9px, 1.8vw, 11px)", color: "#feea88", opacity: 0.8, flexShrink: 0 }}
                >
                  (${order.price.toFixed(2)})
                </span>

                <span
                  style={{ fontSize: "clamp(9px, 1.8vw, 11px)", color: "#feea88", opacity: 0.7, flexShrink: 0 }}
                >
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>

                <span
                  style={{ fontSize: "clamp(12px, 2.2vw, 14px)", fontWeight: 800, color: "#feea88", marginLeft: "auto", flexShrink: 0 }}
                >
                  {getStatusIcon(order.status)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
