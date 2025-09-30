"use client";

import { useCallback, useState } from "react";
import Web3 from "web3";
import { useWallet } from "@/app/hooks/useWallet";

interface UseCreationFeePaymentReturn {
  requestFeePayment: (ethAmount: number) => Promise<string | null>;
  isRequesting: boolean;
  error: string | null;
}

// Opens the wallet with a payment popup for the specified ETH amount.
// This sends a self-transfer (to your own address) so value net effect is 0 (only gas is spent) if approved.
// The intent is to validate wallet + Web3 flow before wiring real contract calls.
export function useCreationFeePayment(): UseCreationFeePaymentReturn {
  const { address, isConnected } = useWallet();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestFeePayment = useCallback(async (ethAmount: number): Promise<string | null> => {
    if (!isConnected || !address) {
      setError("Wallet not connected. Please connect your wallet first.");
      return null;
    }

    if (typeof window === "undefined" || !window.ethereum) {
      setError("No injected wallet found. Please install MetaMask or use a compatible wallet.");
      return null;
    }

    if (ethAmount <= 0) {
      setError("Payment amount must be greater than 0.");
      return null;
    }

    setIsRequesting(true);
    setError(null);

    try {
      const web3 = new Web3(window.ethereum as any);

      // Convert ETH -> wei -> hex
      // Using BigInt for precision and toHex conversion
      const valueWei = BigInt(Math.floor(ethAmount * 1e18));
      const valueHex = "0x" + valueWei.toString(16);

      // Self-transfer (from = to = user's address). Wallet will still show a gas fee.
      const params: any = {
        from: web3.utils.toChecksumAddress(address),
        to: web3.utils.toChecksumAddress(address),
        value: valueHex,
        // Omit gas to let the wallet estimate a safe value automatically
        // data omitted (simple transfer)
      };

      // Request accounts (ensures correct account is active)
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // This triggers the wallet popup. User can cancel to avoid spending gas.
      const txHash: string = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [params],
      });

      return txHash || null;
    } catch (e: any) {
      const msg = e?.message || e?.data?.message || "Failed to request fee payment";
      setError(msg);
      return null;
    } finally {
      setIsRequesting(false);
    }
  }, [address, isConnected]);

  return {
    requestFeePayment,
    isRequesting,
    error,
  };
}