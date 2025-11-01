export interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TokenBasics {
  name: string;
  symbol: string;
  totalSupply: string; // human units (e.g., 100000000)
  gradCap: string;     // user-entered USD target (e.g., "50000")
  /**
   * Computed graduation cap token amount in base units (wei), returned by /gradcap API (results.supplyToCirculate).
   * This is what we pass to the Kitchen contract and the backend.
   */
  gradCapWei?: string | null;
  /**
   * Optional error from grad-cap simulation; if present, block confirmation.
   */
  gradCapError?: string | null;
  tokenCategory: 'Meme' | 'Utility' | 'AI' | 'X-post' | 'Charity' | 'Animal' | 'Governance' | 'Privacy' | null;
  startMode: 'NOW' | 'SCHEDULE';
  startTime: number;
  lpMode: 'LOCK' | 'BURN';
  lockDays: number;
  removeHeader: boolean;
  stealth: boolean;
}

export interface CurveSettings {
  finalType: {
    ZERO: 'NO_TAX' | 'TAX';
    SUPER: 'NO_TAX' | 'TAX';
    BASIC: 'NO_TAX' | 'TAX';
    ADVANCED: 'NO_TAX' | 'TAX';
  };
  finalTax: {
    ZERO: string;
    SUPER: string;
    BASIC: string;
    ADVANCED: string;
  };
  super: {
    maxWallet: string;
    maxTx: string;
  };
  basic: {
    startTax: string;
    taxDuration: string;
    maxWallet: string;
    maxWalletDuration: string;
    maxTx: string;
    maxTxDuration: string;
  };
  advanced: {
    startTax: string;
    taxStep: string;
    taxInterval: string;
    maxWStart: string;
    maxWStep: string;
    maxWInterval: string;
    maxTStart: string;
    maxTStep: string;
    maxTInterval: string;
    removeAfter: string;
    taxReceiver: string;
  };
}

export interface V2LaunchSettings {
  enableTradingMode: 'DEPLOY_ONLY' | 'FULL_LAUNCH';
  initialLiquidityETH: string;
  taxSettings: {
    buyTax: string;
    sellTax: string;
    taxReceiver: string;
  };
  limits: {
    maxWallet: string;
    maxTx: string;
    enableLimits: boolean;
  };
  // Advanced tax configuration for manual deploy
  advancedTaxConfig: {
    enabled: boolean;
    startTax: string;        // Starting tax percentage (e.g., "20" for 20%)
    finalTax: string;        // Final tax percentage (e.g., "3" for 3%)
    taxDropInterval: string; // Interval in seconds for tax drops
    taxDropStep: string;     // Tax reduction per interval (e.g., "1" for -1%)
  };
  // Advanced limits configuration
  advancedLimitsConfig: {
    enabled: boolean;
    startMaxTx: string;      // Starting max transaction in tokens
    maxTxStep: string;       // Transaction limit increase per interval
    startMaxWallet: string;  // Starting max wallet in tokens
    maxWalletStep: string;   // Wallet limit increase per interval
    limitsInterval: string;  // Interval in seconds for limit increases
  };
  // Stealth launch configuration
  stealthConfig: {
    enabled: boolean;
    ethAmount: string;       // ETH amount to use for LP if stealth
  };
}

export interface MetaData {
  desc: string;
  website: string;
  tg: string;
  tw: string;
  logo: string;
  logoFile: File | null;
  banner: string;
  bannerFile: File | null;
  autoBrand: boolean;
  audio: string;
  audioFile: File | null;
}

export interface Fees {
  creation: number | null;
  platformPct: number;
  headerless: number;
  stealth: number;
  graduation: number;
  locker: number;
}

export interface TokenState {
  step: number;
  deploymentMode: 'VIRTUAL_CURVE' | 'V2_LAUNCH' | null;
  taxMode: 'BASIC' | 'NO_TAX' | null;
  profile: 'ZERO' | 'SUPER' | 'BASIC' | 'ADVANCED' | null;
  fees: Fees;
  basics: TokenBasics;
  curves: CurveSettings;
  v2Settings: V2LaunchSettings;
  meta: MetaData;
  txHash: string | null;
}

export type DeploymentMode = 'VIRTUAL_CURVE' | 'V2_LAUNCH';
export type ProfileType = 'ZERO' | 'SUPER' | 'BASIC' | 'ADVANCED';
export type TaxMode = 'BASIC' | 'NO_TAX';
export type FinalTokenType = 'NO_TAX' | 'TAX';
export type V2EnableTradingMode = 'DEPLOY_ONLY' | 'FULL_LAUNCH';

