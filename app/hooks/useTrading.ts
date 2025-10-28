// hooks/useTrading.ts
import { useState, useCallback, useEffect } from 'react';
import Web3 from 'web3';
import { useWallet } from './useWallet';
import { fetchUserProfile } from '@/app/lib/api/services/userService';
import type { KitchenService } from '@/app/lib/web3/services/kitchenService';

export interface TradingState {
  isTrading: boolean;
  isInitializing: boolean;
  txHash: string | null;
  error: string | null;
  statusMessage: string | null;
  lastTradeType: 'buy' | 'sell' | null;
  // Trading wallet and top-up aids
  tradingWallet: string | null;
  canTopUp: boolean;
  topUpSuggestionWei: string | null;
  topUpSuggestionEth: string | null;
}

export interface UseTrading {
  // State
  tradingState: TradingState;
  
  // Actions
  buyToken: (tokenAddress: string, ethAmount: string, opts?: { slippageBps?: number }) => Promise<string | null>;
  sellToken: (tokenAddress: string, ethAmount: string, opts?: { slippageBps?: number }) => Promise<string | null>;
  clearStatus: () => void;
  topUpTradingWallet: (amountEth: string) => Promise<string | null>;
  refreshTradingWallet: () => Promise<void>;
  
  // Service info
  kitchenService: KitchenService | null;
  isReady: boolean;
}

// API endpoints provided by backend
const API_BASE = 'https://steak-blockchain-api-bf5e689d4321.herokuapp.com';

interface BuyResponse { txHash: string }
interface SellResponse { txHash: string }

interface BackendError {
  error?: {
    code?: string;
    shortMessage?: string;
    message?: string;
    transaction?: any;
    info?: {
      payload?: any;
      error?: { code?: number; message?: string };
    };
  };
}

export const useTrading = (): UseTrading => {
  const { isConnected, address } = useWallet();
  
  const [tradingState, setTradingState] = useState<TradingState>({
    isTrading: false,
    isInitializing: false,
    txHash: null,
    error: null,
    statusMessage: null,
    lastTradeType: null,
    tradingWallet: null,
    canTopUp: false,
    topUpSuggestionWei: null,
    topUpSuggestionEth: null,
  });
  
  const [web3, setWeb3] = useState<Web3 | null>(null);

  // Initialize Web3 (for receipt polling) when wallet connects and fetch trading wallet
  useEffect(() => {
    const init = async () => {
      if (isConnected && typeof window !== 'undefined' && (window as any).ethereum) {
        setTradingState(prev => ({ ...prev, isInitializing: true }));
        try {
          const web3Instance = new Web3((window as any).ethereum);
          setWeb3(web3Instance);
          // Fetch trading wallet mapped to the main wallet
          if (address) {
            try {
              const profile = await fetchUserProfile(address);
              const tradingWallet = (profile as any)?.trading_wallet || null;
              setTradingState(prev => ({ ...prev, tradingWallet }));
            } catch (e) {
              console.warn('Failed to fetch trading wallet:', e);
            }
          }
          setTradingState(prev => ({ ...prev, isInitializing: false, error: null }));
        } catch (error) {
          console.error('Failed to initialize Web3:', error);
          setTradingState(prev => ({ ...prev, isInitializing: false, error: `Failed to initialize: ${(error as Error).message}` }));
        }
      } else {
        setWeb3(null);
        setTradingState(prev => ({ ...prev, isInitializing: false }));
      }
    };
    init();
  }, [isConnected, address]);

  const clearStatus = useCallback(() => {
    setTradingState(prev => ({
      ...prev,
      error: null,
      statusMessage: null,
      txHash: null,
      lastTradeType: null,
      canTopUp: false,
      topUpSuggestionWei: null,
      topUpSuggestionEth: null,
    }));
  }, []);

  const postTrade = useCallback(async (
    kind: 'buy' | 'sell',
    tokenAddress: string,
    amount: string,
    walletAddress: string,
    opts?: { slippageBps?: number }
  ): Promise<string> => {
    const url = `${API_BASE}/${kind === 'buy' ? 'buyToken' : 'sellToken'}`;
    const body: any = kind === 'buy'
      ? { tokenAddress, buyAmount: amount, walletAddress }
      : { tokenAddress, sellAmount: amount, walletAddress };
    if (opts?.slippageBps !== undefined) {
      body.slippageBps = opts.slippageBps;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let errText = 'Unexpected error while submitting trade';
      let errCode: string | undefined;
      let raw: any;
      try {
        const data = (await res.json()) as BackendError | { error?: string };
        raw = data;
        if (typeof (data as any)?.error === 'string') {
          errText = (data as any).error as string;
        } else {
          const code = (data as BackendError)?.error?.code;
          const shortMsg = (data as BackendError)?.error?.shortMessage;
          const nestedMsg = (data as BackendError)?.error?.info?.error?.message;
          errCode = code;
          if (code === 'INSUFFICIENT_FUNDS') {
            errText = 'Service is temporarily unable to process the trade (insufficient funds). Please top up your trading wallet.';
          } else if (shortMsg) {
            errText = shortMsg;
          } else if (nestedMsg) {
            errText = nestedMsg;
          }
        }
      } catch {}
      const err = new Error(errText) as Error & { code?: string; raw?: any };
      if (errCode) (err as any).code = errCode;
      if (raw) (err as any).raw = raw;
      throw err;
    }

    const data = (await res.json()) as BuyResponse | SellResponse;
    return data.txHash;
  }, []);

  const waitForConfirmation = useCallback(async (
    txHash: string,
    confirmations: number = 1,
    pollMs: number = 3000,
    maxWaitMs: number = 5 * 60 * 1000 // 5 minutes
  ) => {
    if (!web3) return null;
    const start = Date.now();

    // First wait for receipt
    let receipt = await web3.eth.getTransactionReceipt(txHash);
    while (!receipt) {
      if (Date.now() - start > maxWaitMs) {
        throw new Error('Timed out waiting for transaction confirmation');
      }
      await new Promise(r => setTimeout(r, pollMs));
      receipt = await web3.eth.getTransactionReceipt(txHash);
    }

    // Optionally wait for additional confirmations
    if (confirmations > 1) {
      const receiptBlockRaw: any = receipt.blockNumber ?? 0;
      const receiptBlockBig: bigint = typeof receiptBlockRaw === 'bigint' ? receiptBlockRaw : BigInt(receiptBlockRaw);
      const targetBlock: bigint = receiptBlockBig + BigInt(confirmations - 1);

      let currentBlockRaw: any = await web3.eth.getBlockNumber();
      let currentBlockBig: bigint = typeof currentBlockRaw === 'bigint' ? currentBlockRaw : BigInt(currentBlockRaw);

      while (currentBlockBig < targetBlock) {
        if (Date.now() - start > maxWaitMs) {
          throw new Error('Timed out waiting for transaction confirmations');
        }
        await new Promise(r => setTimeout(r, pollMs));
        currentBlockRaw = await web3.eth.getBlockNumber();
        currentBlockBig = typeof currentBlockRaw === 'bigint' ? currentBlockRaw : BigInt(currentBlockRaw);
      }
    }

    return receipt;
  }, [web3]);

  const startTradeState = useCallback((tradeType: 'buy' | 'sell') => {
    setTradingState(prev => ({
      ...prev,
      isTrading: true,
      error: null,
      statusMessage: `Submitting ${tradeType} order...`,
      txHash: null,
      lastTradeType: tradeType,
    }));
  }, []);

  const updateStatus = useCallback((message: string) => {
    setTradingState(prev => ({ ...prev, statusMessage: message }));
  }, []);

  const finishTradeSuccess = useCallback((tradeType: 'buy' | 'sell', txHash: string) => {
    setTradingState(prev => ({
      ...prev,
      isTrading: false,
      txHash,
      statusMessage: `${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} completed successfully!`,
      error: null,
    }));
  }, []);

  const finishTradeError = useCallback((tradeType: 'buy' | 'sell', error: string) => {
    setTradingState(prev => ({
      ...prev,
      isTrading: false,
      error: `${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} failed: ${error}`,
      statusMessage: null,
    }));
  }, []);

  const buyToken = useCallback(async (tokenAddress: string, ethAmount: string, opts?: { slippageBps?: number }): Promise<string | null> => {
    if (!isConnected || !address) {
      const msg = 'Wallet not connected';
      setTradingState(prev => ({ ...prev, error: msg, lastTradeType: 'buy' }));
      return null;
    }

    if (!tokenAddress || !ethAmount || isNaN(Number(ethAmount)) || Number(ethAmount) <= 0) {
      const msg = 'Invalid buy parameters';
      setTradingState(prev => ({ ...prev, error: msg, lastTradeType: 'buy' }));
      return null;
    }

    startTradeState('buy');

    try {
      const txHash = await postTrade('buy', tokenAddress, ethAmount, address, opts);
      setTradingState(prev => ({ ...prev, txHash }));
      updateStatus('Order broadcasted. Waiting for confirmation...');

      try {
        await waitForConfirmation(txHash, 1);
        finishTradeSuccess('buy', txHash);
      } catch (confirmErr) {
        // If waiting for confirmation fails/timeouts, still keep the tx hash and surface error
        finishTradeError('buy', (confirmErr as Error).message);
      }

      return txHash;
    } catch (err) {
      const e = err as any;
      // Detect insufficient funds from backend and surface top-up suggestion
      if (e?.code === 'INSUFFICIENT_FUNDS' || /insufficient funds/i.test(e?.message || '')) {
        const { needWei, needEth } = parseTopUpSuggestionFromBackendError(e?.raw) || {} as any;
        setTradingState(prev => ({
          ...prev,
          isTrading: false,
          error: 'Trading wallet has insufficient funds. Please top up to proceed.',
          canTopUp: true,
          topUpSuggestionWei: needWei || prev.topUpSuggestionWei,
          topUpSuggestionEth: needEth || prev.topUpSuggestionEth,
        }));
      } else {
        finishTradeError('buy', (e as Error).message);
      }
      return null;
    }
  }, [isConnected, address, postTrade, startTradeState, updateStatus, waitForConfirmation, finishTradeSuccess, finishTradeError]);

  const sellToken = useCallback(async (tokenAddress: string, ethAmount: string, opts?: { slippageBps?: number }): Promise<string | null> => {
    if (!isConnected || !address) {
      const msg = 'Wallet not connected';
      setTradingState(prev => ({ ...prev, error: msg, lastTradeType: 'sell' }));
      return null;
    }

    if (!tokenAddress || !ethAmount || isNaN(Number(ethAmount)) || Number(ethAmount) <= 0) {
      const msg = 'Invalid sell parameters';
      setTradingState(prev => ({ ...prev, error: msg, lastTradeType: 'sell' }));
      return null;
    }

    startTradeState('sell');

    try {
      const txHash = await postTrade('sell', tokenAddress, ethAmount, address, opts);
      setTradingState(prev => ({ ...prev, txHash }));
      updateStatus('Order broadcasted. Waiting for confirmation...');

      try {
        await waitForConfirmation(txHash, 1);
        finishTradeSuccess('sell', txHash);
      } catch (confirmErr) {
        finishTradeError('sell', (confirmErr as Error).message);
      }

      return txHash;
    } catch (err) {
      const e = err as any;
      if (e?.code === 'INSUFFICIENT_FUNDS' || /insufficient funds/i.test(e?.message || '')) {
        const { needWei, needEth } = parseTopUpSuggestionFromBackendError(e?.raw) || {} as any;
        setTradingState(prev => ({
          ...prev,
          isTrading: false,
          error: 'Trading wallet has insufficient funds. Please top up to proceed.',
          canTopUp: true,
          topUpSuggestionWei: needWei || prev.topUpSuggestionWei,
          topUpSuggestionEth: needEth || prev.topUpSuggestionEth,
        }));
      } else {
        finishTradeError('sell', (e as Error).message);
      }
      return null;
    }
  }, [isConnected, address, postTrade, startTradeState, updateStatus, waitForConfirmation, finishTradeSuccess, finishTradeError]);

  // Helper: parse backend insufficient funds message to extract required wei
  const parseTopUpSuggestionFromBackendError = (raw: any): { needWei: string; needEth: string } | null => {
    try {
      const msg: string | undefined = raw?.error?.info?.error?.message || raw?.error?.shortMessage || raw?.error?.message;
      if (!msg) return null;
      const m = msg.match(/have\s+(\d+)\s+want\s+(\d+)/i);
      if (!m) return null;
      const have = BigInt(m[1]);
      const want = BigInt(m[2]);
      const need = want > have ? want - have : BigInt(0);
      const needWei = need.toString();
      const needEth = web3 ? (web3.utils.fromWei(needWei, 'ether')) : (Number(needWei) / 1e18).toString();
      return { needWei, needEth };
    } catch {
      return null;
    }
  };

  // Top up trading wallet by sending ETH from user wallet
  const topUpTradingWallet = useCallback(async (amountEth: string): Promise<string | null> => {
    if (!isConnected || !address) {
      setTradingState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return null;
    }
    if (!tradingState.tradingWallet) {
      setTradingState(prev => ({ ...prev, error: 'Trading wallet not set up yet' }));
      return null;
    }
    if (!web3) {
      setTradingState(prev => ({ ...prev, error: 'Web3 provider not initialized' }));
      return null;
    }

    try {
      const sanitized = String(amountEth).trim().replace(/,/g, '');
      // Validate up to 18 decimals
      if (!/^\d+(?:\.\d{1,18})?$/.test(sanitized)) {
        throw new Error('Invalid amount format');
      }
      const valueWei = web3.utils.toWei(sanitized, 'ether');
      // Encode as proper hex quantity (wei)
      const valueHex = '0x' + BigInt(valueWei).toString(16);
      // Prefer direct provider request to avoid web3 promievent typings issues
      const provider = (web3.currentProvider || (window as any).ethereum) as any;
      const txParams = {
        from: address,
        to: tradingState.tradingWallet,
        value: valueHex, // value in wei (0x-prefixed hex quantity)
      };
      const txHash: string = await provider.request({ method: 'eth_sendTransaction', params: [txParams] });

      // Do NOT wait here; let UI (modal) await confirmation to avoid double prompts
      setTradingState(prev => ({
        ...prev,
        txHash,
        statusMessage: 'Top up submitted. Waiting for confirmation...',
        error: null,
        canTopUp: false,
      }));
      return txHash;
    } catch (e) {
      const msg = (e as any)?.message || 'Failed to top up trading wallet';
      setTradingState(prev => ({ ...prev, error: msg }));
      return null;
    }
  }, [isConnected, address, tradingState.tradingWallet, web3]);

  const refreshTradingWallet = useCallback(async () => {
    if (!isConnected || !address) return;
    try {
      const profile = await fetchUserProfile(address);
      const tradingWallet = (profile as any)?.trading_wallet || null;
      setTradingState(prev => ({ ...prev, tradingWallet }));
    } catch (e) {
      console.warn('Failed to refresh trading wallet:', e);
    }
  }, [isConnected, address]);

  // With server-side broadcast, readiness is simply wallet connected
  const isReady = isConnected && !tradingState.isInitializing;

  return {
    tradingState,
    buyToken,
    sellToken,
    clearStatus,
    topUpTradingWallet,
    refreshTradingWallet,
    kitchenService: null,
    isReady,
  };
};
