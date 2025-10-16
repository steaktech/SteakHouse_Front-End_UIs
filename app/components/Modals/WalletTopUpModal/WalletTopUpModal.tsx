"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/app/hooks/useWallet";
import { useToastHelpers } from "@/app/hooks/useToast";
import { parseEther } from "viem";
import { useTrading } from "@/app/hooks/useTrading";

interface WalletTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradingWallet?: string | null;
  defaultAmountEth?: string;
  onConfirmTopUp: (amountEth: string) => Promise<string | null>;
}

export default function WalletTopUpModal({
  isOpen,
  onClose,
  tradingWallet,
  defaultAmountEth,
  onConfirmTopUp,
}: WalletTopUpModalProps) {
  const { isConnected, address } = useWallet();
  const { showError, showSuccess, showInfo } = useToastHelpers();
  const { tradingState } = useTrading();

  const [amount, setAmount] = useState<string>(defaultAmountEth || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAmount(defaultAmountEth || "");
  }, [defaultAmountEth, isOpen]);

  const handleConfirm = useCallback(async () => {
    if (!isConnected) {
      showError("Please connect your wallet first.", "Top up");
      return;
    }
    if (!tradingWallet) {
      showError("Trading wallet is not available.", "Top up");
      return;
    }
    const sanitized = String(amount).trim().replace(/,/g, "");
    if (!sanitized || /^\d*(?:\.\d{1,18})?$/.test(sanitized) === false || Number(sanitized) <= 0) {
      showError("Enter a valid amount in ETH", "Top up");
      return;
    }

    try {
      setIsSubmitting(true);
      let hash = await onConfirmTopUp(sanitized);
      if (!hash) {
        // Try to surface a more accurate error first
        if (tradingState?.error) {
          showError(tradingState.error, "Top up");
        }
        // Attempt direct send as a fallback if we have a target trading wallet
        if (typeof window !== 'undefined' && (window as any).ethereum && tradingWallet && address) {
          try {
            const valueHex = '0x' + parseEther(sanitized).toString(16);
            const txParams = { from: address as `0x${string}`, to: tradingWallet as `0x${string}`, value: valueHex } as any;
            hash = await (window as any).ethereum.request({ method: 'eth_sendTransaction', params: [txParams] });
          } catch (fallbackErr: any) {
            const msg = fallbackErr?.shortMessage || fallbackErr?.message || 'Transaction rejected or failed to submit.';
            showError(msg, 'Top up');
            setIsSubmitting(false);
            return;
          }
        } else {
          if (!tradingState?.error) {
            showError("Transaction rejected or failed to submit.", "Top up");
          }
          setIsSubmitting(false);
          return;
        }
      }
      if (!hash) {
        showError('Transaction not submitted.', 'Top up');
        setIsSubmitting(false);
        return;
      }
      const short = `${hash.slice(0, 10)}...${hash.slice(-6)}`;
      showSuccess(`Top up submitted. Tx: ${short}`, "Top up", 8000);
      setIsSubmitting(false);
      onClose();
    } catch (e) {
      const msg = (e as any)?.message || "Failed to top up";
      showError(msg, "Top up failed");
      setIsSubmitting(false);
    }
  }, [amount, isConnected, tradingWallet, onConfirmTopUp, showError, showSuccess, tradingState, address, onClose]);

  if (!isOpen) return null;

  const shortAddr = (addr?: string | null) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gradient-to-b from-[#2d1810] to-[#1a0f08] border border-[#8b4513] rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#d4af37]">Top up trading wallet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <div className="bg-[#1a0f08] rounded-lg p-4 border border-[#8b4513]/30">
            <div className="text-sm text-gray-400 mb-1">From (your wallet)</div>
            <div className="text-white font-mono text-sm break-all mb-2">{shortAddr(address)}</div>
            <div className="text-sm text-gray-400 mb-1">To (trading wallet)</div>
            <div className="text-white font-mono text-sm break-all">{shortAddr(tradingWallet || undefined)}</div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#feea88]">Amount (ETH)</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d*\.?\d*$/.test(v)) setAmount(v);
              }}
              placeholder="0.1"
              className="w-full bg-[#1a0f08] border border-[#8b4513]/50 rounded-lg px-4 py-3 text-[#feea88] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40"
            />
            <div className="flex gap-2">
              {["0.05", "0.1", "0.25", "0.5"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className="px-3 py-1.5 text-xs bg-[#1a0f08] border border-[#8b4513]/50 rounded-lg text-[#feea88] hover:border-[#d4af37]/60"
                >
                  {preset} ETH
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-[#3a2a20] hover:bg-[#453124] text-white py-3 px-4 rounded-lg transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 bg-[#d4af37] hover:bg-[#f4d03f] text-[#1a0f08] py-3 px-4 rounded-lg transition-colors font-semibold disabled:opacity-60"
            >
              {isSubmitting ? "Processing..." : "Confirm Top Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}