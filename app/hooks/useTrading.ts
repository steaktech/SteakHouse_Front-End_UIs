// hooks/useTrading.ts
import { useState, useCallback, useEffect } from 'react';
import Web3 from 'web3';
import { useWallet } from './useWallet';
import { KitchenService } from '@/app/lib/web3/services/kitchenService';
import { signAndSubmitTransaction, TransactionCallbacks } from '@/app/lib/web3/services/transactionService';
import { getCurrentCurrencySymbol } from '@/app/lib/config/constants';

export interface TradingState {
  isTrading: boolean;
  isInitializing: boolean;
  txHash: string | null;
  error: string | null;
  statusMessage: string | null;
  lastTradeType: 'buy' | 'sell' | null;
}

export interface UseTrading {
  // State
  tradingState: TradingState;
  
  // Actions
  buyToken: (tokenAddress: string, ethAmount: string) => Promise<string | null>;
  sellToken: (tokenAddress: string, ethAmount: string) => Promise<string | null>;
  clearStatus: () => void;
  
  // Service info
  kitchenService: KitchenService | null;
  isReady: boolean;
}

/**
 * Hook for managing Web3 trading operations with the Kitchen contract
 * Handles buy/sell transactions with MetaMask popup confirmations
 */
export const useTrading = (): UseTrading => {
  const { isConnected, address, chainId } = useWallet();
  
  const [tradingState, setTradingState] = useState<TradingState>({
    isTrading: false,
    isInitializing: false,
    txHash: null,
    error: null,
    statusMessage: null,
    lastTradeType: null,
  });
  
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [kitchenService, setKitchenService] = useState<KitchenService | null>(null);

  // Initialize Web3 and KitchenService when wallet connects
  useEffect(() => {
    // console.log('🔄 useTrading: Wallet state changed', {
    //   isConnected,
    //   address,
    //   chainId
    // });

    if (isConnected && address && window.ethereum) {
      //console.log('🚀 Initializing Web3 and Kitchen service...');
      setTradingState(prev => ({ ...prev, isInitializing: true }));
      
      try {
        const web3Instance = new Web3(window.ethereum as any);
        setWeb3(web3Instance);
        
        const service = new KitchenService(web3Instance, address, chainId);
        setKitchenService(service);
        
        //console.log('✅ Trading services initialized');
        //console.log('🏭 Kitchen service info:', service.getContractInfo());
        
        setTradingState(prev => ({ 
          ...prev, 
          isInitializing: false,
          error: null 
        }));
      } catch (error) {
        console.error('❌ Failed to initialize trading services:', error);
        setTradingState(prev => ({ 
          ...prev, 
          isInitializing: false,
          error: `Failed to initialize: ${(error as Error).message}` 
        }));
      }
    } else {
      //console.log('🔌 Wallet disconnected or not ready, cleaning up services');
      setWeb3(null);
      setKitchenService(null);
      setTradingState(prev => ({ 
        ...prev, 
        isInitializing: false 
      }));
    }
  }, [isConnected, address, chainId]);

  // Clear status and reset state
  const clearStatus = useCallback(() => {
    //console.log('🧹 Clearing trading status');
    setTradingState(prev => ({
      ...prev,
      error: null,
      statusMessage: null,
      txHash: null,
      lastTradeType: null,
    }));
  }, []);

  // Create transaction callbacks for status updates
  const createTransactionCallbacks = useCallback((tradeType: 'buy' | 'sell'): TransactionCallbacks => ({
    onStatusUpdate: (message: string) => {
      //console.log(`📢 ${tradeType.toUpperCase()} Status:`, message);
      setTradingState(prev => ({
        ...prev,
        statusMessage: message,
      }));
    },
    onSuccess: (contractAddress: string) => {
      //console.log(`✅ ${tradeType.toUpperCase()} Transaction successful:`, contractAddress);
      setTradingState(prev => ({
        ...prev,
        isTrading: false,
        txHash: contractAddress, // In real implementation, this would be the tx hash
        statusMessage: `${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} completed successfully!`,
        error: null,
      }));
    },
    onError: (error: string) => {
      console.error(`❌ ${tradeType.toUpperCase()} Transaction failed:`, error);
      setTradingState(prev => ({
        ...prev,
        isTrading: false,
        error: `${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} failed: ${error}`,
        statusMessage: null,
      }));
    },
  }), []);

  // Buy Token function
  const buyToken = useCallback(async (tokenAddress: string, ethAmount: string): Promise<string | null> => {
    //console.log('🟢 Starting BUY transaction...');
    //console.log(`🎯 Token: ${tokenAddress}, Amount: ${ethAmount} ${getCurrentCurrencySymbol()}`);

    if (!kitchenService || !isConnected) {
      const error = "Trading service not ready - please ensure wallet is connected";
      console.error('❌', error);
      setTradingState(prev => ({ 
        ...prev, 
        error,
        lastTradeType: 'buy' 
      }));
      return null;
    }

    // Validate parameters
    const validationError = kitchenService.validateBuyParams(tokenAddress, ethAmount);
    if (validationError) {
      console.error('❌ Buy validation failed:', validationError);
      setTradingState(prev => ({ 
        ...prev, 
        error: validationError,
        lastTradeType: 'buy' 
      }));
      return null;
    }

    // Set trading state
    setTradingState(prev => ({
      ...prev,
      isTrading: true,
      error: null,
      statusMessage: null,
      txHash: null,
      lastTradeType: 'buy',
    }));

    try {
      //console.log('🔨 Building buy transaction...');
      const unsignedTx = await kitchenService.buildBuyTokenTx(tokenAddress, ethAmount);
      
      //console.log('📤 Submitting buy transaction to MetaMask...');
      const callbacks = createTransactionCallbacks('buy');
      
      const result = await signAndSubmitTransaction(
        unsignedTx,
        false, // Not a deployment
        callbacks
      );

      //console.log('🎯 Buy transaction result:', result);
      return result;
    } catch (error) {
      const errorMsg = `Buy transaction failed: ${(error as Error).message}`;
      //console.error('❌', errorMsg, error);
      setTradingState(prev => ({
        ...prev,
        isTrading: false,
        error: errorMsg,
        lastTradeType: 'buy',
      }));
      return null;
    }
  }, [kitchenService, isConnected, createTransactionCallbacks]);

  // Sell Token function
  const sellToken = useCallback(async (tokenAddress: string, ethAmount: string): Promise<string | null> => {
    //console.log('🔴 Starting SELL transaction...');
    //console.log(`🎯 Token: ${tokenAddress}, ETH Amount: ${ethAmount} ${getCurrentCurrencySymbol()}`);

    if (!kitchenService || !isConnected) {
      const error = "Trading service not ready - please ensure wallet is connected";
      console.error('❌', error);
      setTradingState(prev => ({ 
        ...prev, 
        error,
        lastTradeType: 'sell' 
      }));
      return null;
    }

    // Validate parameters for sell (now uses ETH amount)
    const validationError = kitchenService.validateSellParams(tokenAddress, ethAmount);
    if (validationError) {
      console.error('❌ Sell validation failed:', validationError);
      setTradingState(prev => ({ 
        ...prev, 
        error: validationError,
        lastTradeType: 'sell' 
      }));
      return null;
    }

    // Set trading state
    setTradingState(prev => ({
      ...prev,
      isTrading: true,
      error: null,
      statusMessage: null,
      txHash: null,
      lastTradeType: 'sell',
    }));

    try {
      //console.log('🔨 Building sell transaction...');
      const unsignedTx = await kitchenService.buildSellTokenTx(tokenAddress, ethAmount);
      
      //console.log('📤 Submitting sell transaction to MetaMask...');
      const callbacks = createTransactionCallbacks('sell');
      
      const result = await signAndSubmitTransaction(
        unsignedTx,
        false, // Not a deployment
        callbacks
      );

      //console.log('🎯 Sell transaction result:', result);
      return result;
    } catch (error) {
      const errorMsg = `Sell transaction failed: ${(error as Error).message}`;
      console.error('❌', errorMsg, error);
      setTradingState(prev => ({
        ...prev,
        isTrading: false,
        error: errorMsg,
        lastTradeType: 'sell',
      }));
      return null;
    }
  }, [kitchenService, isConnected, createTransactionCallbacks]);

  // Calculate if the trading hook is ready to use
  const isReady = isConnected && !!kitchenService && !tradingState.isInitializing;

  // Log current state for debugging
  useEffect(() => {
    // console.log('📊 useTrading state update:', {
    //   isConnected,
    //   hasKitchenService: !!kitchenService,
    //   isReady,
    //   tradingState: {
    //     isTrading: tradingState.isTrading,
    //     isInitializing: tradingState.isInitializing,
    //     hasError: !!tradingState.error,
    //     lastTradeType: tradingState.lastTradeType,
    //   }
    // });
  }, [isConnected, kitchenService, isReady, tradingState]);

  return {
    tradingState,
    buyToken,
    sellToken,
    clearStatus,
    kitchenService,
    isReady,
  };
};
