// types/blockchain.ts

/**
 * Response from the maxTx API endpoint
 * Provides information about maximum transaction limits and quotes
 */
export interface MaxTxResponse {
  token: string;
  limitsLifted: boolean;
  maxWallet: string;
  maxTx: string;
  tradeFeeBps: string;
  currentTaxBps: string;
  finalTaxRateBps: string;
  totalSupply: string;
  circulatingSupply: string;
  ethPoolWei: string;
  human: {
    maxWalletTokens: string | null;
    maxTxTokens: string | null;
    totalSupplyTokens: string;
    circulatingSupplyTokens: string;
    ethPoolEth: string;
  };
  quotes: {
    maxTx: {
      tokensRaw: string;
      curveWei: string;
      grossWei: string;
      priceWeiPer1e18: string;
      human: {
        tokens: string;
        ethToCurve: string;
        ethGrossToSend: string;
        priceEthPerToken: string;
      };
    };
  };
}

/**
 * Response from the maxWallet API endpoint
 * Mirrors MaxTxResponse but with quotes.maxWallet
 */
export interface MaxWalletResponse {
  token: string;
  limitsLifted: boolean;
  maxWallet: string;
  maxTx: string;
  tradeFeeBps: string;
  currentTaxBps: string;
  finalTaxRateBps: string;
  totalSupply: string;
  circulatingSupply: string;
  ethPoolWei: string;
  human: {
    maxWalletTokens: string | null;
    maxTxTokens: string | null;
    totalSupplyTokens: string;
    circulatingSupplyTokens: string;
    ethPoolEth: string;
  };
  quotes: {
    maxWallet: {
      tokensRaw: string;
      curveWei: string;
      grossWei: string;
      priceWeiPer1e18: string;
      human: {
        tokens: string;
        ethToCurve: string;
        ethGrossToSend: string;
        priceEthPerToken: string;
      };
    } | null;
  };
}

/**
 * Error response from blockchain API
 */
export interface BlockchainApiError {
  error: string;
  message?: string;
}
