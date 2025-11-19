"use client";

import { useCallback, useState } from "react";
import Web3 from "web3";
import { useWallet } from "@/app/hooks/useWallet";
import { KitchenService } from "@/app/lib/web3/services/kitchenService";
import { TokenState } from "@/app/components/Modals/CreateTokenModal/types";
import { waitForTransactionConfirmation } from "@/app/lib/web3/services/transactionService";
import KitchenABI from "@/app/contracts/Kitchen.json";

export interface UseKitchenCreateTokenOptions {
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export interface CreateOnChainResult {
  success: boolean;
  txHash?: string;
  tokenAddress?: string;
  error?: string;
}

export function useKitchenCreateToken(options: UseKitchenCreateTokenOptions = {}) {
  const { onSuccess, onError } = options;
  const { isConnected, address, chainId } = useWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTokenOnChain = useCallback(async (state: TokenState): Promise<CreateOnChainResult> => {
    if (!isConnected || !address) {
      const err = new Error("Wallet not connected");
      setError(err);
      onError?.(err);
      return { success: false, error: err.message };
    }

    if (typeof window === "undefined" || !window.ethereum) {
      const err = new Error("No injected wallet found (e.g., MetaMask)");
      setError(err);
      onError?.(err);
      return { success: false, error: err.message };
    }

    setIsLoading(true);
    setError(null);

    try {
      const web3 = new Web3(window.ethereum as any);
      const service = new KitchenService(web3, address, chainId);
      // Log target contract info for debug
      console.log('[KitchenCreate] Target', service.getContractInfo());

      // Preflight simulation (non-blocking): we log failures but still proceed to wallet popup as requested
      try {
        const sim = await service.simulateCreateTokenCall(state);
        if (!sim.success) {
          const reason = String(sim.reason || '').toLowerCase();
          // If the failure is clearly due to insufficient funds, stop here and surface a helpful error
          if (reason.includes('insufficient funds')) {
            const err = new Error('Insufficient funds for creation fee and gas. Please fund your wallet with a small amount of ETH and try again.');
            setError(err);
            onError?.(err);
            return { success: false, error: err.message };
          }
          console.warn('[KitchenCreate] Simulation failed, proceeding to wallet popup anyway:', sim.reason);
        } else {
          console.log('[KitchenCreate] Simulation passed');
        }
      } catch (e) {
        console.warn('[KitchenCreate] Simulation error, proceeding anyway:', e);
      }

      const unsignedTx = await service.buildCreateTokenTxFromState(state);

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const params: any = {
        from: unsignedTx.from,
        to: unsignedTx.to,
        data: unsignedTx.data,
        value: unsignedTx.value,
        gas: unsignedTx.gas,
        ...(unsignedTx.maxFeePerGas && unsignedTx.maxPriorityFeePerGas
          ? { maxFeePerGas: unsignedTx.maxFeePerGas, maxPriorityFeePerGas: unsignedTx.maxPriorityFeePerGas, type: "0x2" }
          : {}),
      };

      // Send transaction and obtain tx hash
      const txHash: string = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [params],
      });

      // Wait for confirmation
      const result = await waitForTransactionConfirmation(web3, txHash);
      if (result.contractAddress || !result.errors) {
        // Fetch full receipt to decode logs for token address
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        const tokenAddress = decodeTokenAddressFromReceipt(web3, receipt, service.getContractInfo().address);
        onSuccess?.(txHash);
        return { success: true, txHash, tokenAddress };
      } else {
        const err = new Error(result.errors || "Transaction failed");
        setError(err);
        onError?.(err);
        return { success: false, error: err.message };
      }
    } catch (e: any) {
      const err = new Error(e?.message || e?.data?.message || "Failed to create token on-chain");
      setError(err);
      onError?.(err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, chainId, onSuccess, onError]);

  const createFixedBasicTest = useCallback(async (valueEth: number): Promise<CreateOnChainResult> => {
    if (!isConnected || !address) {
      const err = new Error("Wallet not connected");
      setError(err);
      onError?.(err);
      return { success: false, error: err.message };
    }
    if (typeof window === "undefined" || !window.ethereum) {
      const err = new Error("No injected wallet found (e.g., MetaMask)");
      setError(err);
      onError?.(err);
      return { success: false, error: err.message };
    }

    setIsLoading(true);
    setError(null);

    try {
      const web3 = new Web3(window.ethereum as any);
      const service = new KitchenService(web3, address, chainId);
      console.log('[KitchenCreate][TEST] Target', service.getContractInfo());

      const unsignedTx = await service.buildTestBasicTokenTx(valueEth);

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const params: any = {
        from: unsignedTx.from,
        to: unsignedTx.to,
        data: unsignedTx.data,
        value: unsignedTx.value,
        gas: unsignedTx.gas,
        ...(unsignedTx.maxFeePerGas && unsignedTx.maxPriorityFeePerGas
          ? { maxFeePerGas: unsignedTx.maxFeePerGas, maxPriorityFeePerGas: unsignedTx.maxPriorityFeePerGas, type: "0x2" }
          : {}),
      };

      const txHash: string = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [params],
      });

      const result = await waitForTransactionConfirmation(web3, txHash);
      if (result.contractAddress || !result.errors) {
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        const tokenAddress = decodeTokenAddressFromReceipt(web3, receipt, service.getContractInfo().address);
        onSuccess?.(txHash);
        return { success: true, txHash, tokenAddress };
      } else {
        const err = new Error(result.errors || "Transaction failed");
        setError(err);
        onError?.(err);
        return { success: false, error: err.message };
      }
    } catch (e: any) {
      const err = new Error(e?.message || e?.data?.message || "Failed to submit test tx");
      setError(err);
      onError?.(err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, chainId, onSuccess, onError]);

  const createFixedAdvancedTest = useCallback(async (valueEth: number): Promise<CreateOnChainResult> => {
    if (!isConnected || !address) {
      const err = new Error("Wallet not connected");
      setError(err);
      onError?.(err);
      return { success: false, error: err.message };
    }
    if (typeof window === "undefined" || !window.ethereum) {
      const err = new Error("No injected wallet found (e.g., MetaMask)");
      setError(err);
      onError?.(err);
      return { success: false, error: err.message };
    }

    setIsLoading(true);
    setError(null);

    try {
      const web3 = new Web3(window.ethereum as any);
      const service = new KitchenService(web3, address, chainId);
      console.log('[KitchenCreate][TEST] Target', service.getContractInfo());

      // Build test Advanced tx (3-arg variant)
      const unsignedTx = await service.buildTestAdvancedTokenTx(valueEth);

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const params: any = {
        from: unsignedTx.from,
        to: unsignedTx.to,
        data: unsignedTx.data,
        value: unsignedTx.value,
        gas: unsignedTx.gas,
        ...(unsignedTx.maxFeePerGas && unsignedTx.maxPriorityFeePerGas
          ? { maxFeePerGas: unsignedTx.maxFeePerGas, maxPriorityFeePerGas: unsignedTx.maxPriorityFeePerGas, type: "0x2" }
          : {}),
      };

      const txHash: string = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [params],
      });

      const result = await waitForTransactionConfirmation(web3, txHash);
      if (result.contractAddress || !result.errors) {
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        const tokenAddress = decodeTokenAddressFromReceipt(web3, receipt, service.getContractInfo().address);
        onSuccess?.(txHash);
        return { success: true, txHash, tokenAddress };
      } else {
        const err = new Error(result.errors || "Transaction failed");
        setError(err);
        onError?.(err);
        return { success: false, error: err.message };
      }
    } catch (e: any) {
      const err = new Error(e?.message || e?.data?.message || "Failed to submit Advanced test tx");
      setError(err);
      onError?.(err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, chainId, onSuccess, onError]);

  return {
    createTokenOnChain,
    createFixedBasicTest,
    createFixedAdvancedTest,
    isLoading,
    error,
  };
}

// === Helpers ===
function decodeTokenAddressFromReceipt(web3: any, receipt: any, kitchenAddress: string): string | undefined {
  if (!receipt || !receipt.logs) return undefined;

  // Build a map of event signatures from ABI
  const eventMap: Record<string, any> = {};
  for (const item of KitchenABI as any[]) {
    if (item.type === 'event') {
      const sig = web3.eth.abi.encodeEventSignature(item);
      eventMap[sig] = item;
    }
  }

  let found: string | undefined;
  for (const log of receipt.logs) {
    // only consider logs from Kitchen contract
    if (!log || log.address?.toLowerCase() !== kitchenAddress.toLowerCase()) continue;
    const topic0 = log.topics?.[0];
    if (!topic0 || !eventMap[topic0]) continue;
    const abiEvent = eventMap[topic0];
    try {
      const decoded = web3.eth.abi.decodeLog(
        abiEvent.inputs,
        log.data,
        log.topics.slice(1)
      );
      // Prefer TokenCreated or TokenDeployed events
      if ((abiEvent.name === 'TokenCreated' || abiEvent.name === 'TokenDeployed') && decoded.token) {
        found = decoded.token;
        break;
      }
      // Fallback: if any event has a 'token' field, use it
      if (decoded.token) {
        found = decoded.token;
        break;
      }
    } catch {}
  }

  return found;
}
