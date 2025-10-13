"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@/app/hooks/useWallet";
import { useTrading } from "@/app/hooks/useTrading";
import { useToastHelpers } from "@/app/hooks/useToast";
import { blockchainApiClient } from "@/app/lib/api/blockchainClient";

interface WalletWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmountEth?: string;
}

export default function WalletWithdrawModal({
  isOpen,
  onClose,
  defaultAmountEth,
}: WalletWithdrawModalProps) {
  const { isConnected, address } = useWallet();
  const { tradingState } = useTrading();
  const { showError, showSuccess } = useToastHelpers();

  const [amount, setAmount] = useState<string>(defaultAmountEth || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAmount(defaultAmountEth || "");
  }, [defaultAmountEth, isOpen]);

  const handleConfirm = useCallback(async () => {
    if (!isConnected || !address) {
      showError("Please connect your wallet first.", "Withdraw");
      return;
    }
    if (!tradingState?.tradingWallet) {
      showError("Trading wallet is not available.", "Withdraw");
      return;
    }
    const sanitized = String(amount).trim().replace(/,/g, "");
    if (!sanitized || /^\d*(?:\.\d{1,18})?$/.test(sanitized) === false || Number(sanitized) <= 0) {
      showError("Enter a valid amount in ETH", "Withdraw");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await blockchainApiClient<{ txHash?: string; error?: string }>(
        "/withdraw",
        {
          method: "POST",
          body: JSON.stringify({
            ethAmount: sanitized,
            walletAddress: address,
          }),
        }
      );

      const txHash = data?.txHash;
      if (!txHash) {
        throw new Error(data?.error || "No transaction hash returned");
      }

      const short = `${txHash.slice(0, 10)}...${txHash.slice(-6)}`;
      showSuccess(`Withdrawal submitted. Tx: ${short}`, "Withdraw", 8000);
      setIsSubmitting(false);
      onClose();
    } catch (e: any) {
      const msg = e?.message || "Withdraw failed";
      showError(msg, "Withdraw failed", 12000);
      setIsSubmitting(false);
    }
  }, [isConnected, address, tradingState?.tradingWallet, amount, showError, showSuccess, onClose]);

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
          <h2 className="text-xl font-bold text-[#d4af37]">Withdraw from trading wallet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <div className="bg-[#1a0f08] rounded-lg p-4 border border-[#8b4513]/30">
            <div className="text-sm text-gray-400 mb-1">From (trading wallet)</div>
            <div className="text-white font-mono text-sm break-all mb-2">{shortAddr(tradingState?.tradingWallet)}</div>
            <div className="text-sm text-gray-400 mb-1">To (your wallet)</div>
            <div className="text-white font-mono text-sm break-all">{shortAddr(address)}</div>
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
              {isSubmitting ? "Processing..." : "Confirm Withdraw"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}