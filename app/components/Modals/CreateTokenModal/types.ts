export interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TokenBasics {
  name: string;
  symbol: string;
  totalSupply: string;
  gradCap: string;
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

export interface MetaData {
  desc: string;
  website: string;
  tg: string;
  tw: string;
  logo: string;
  banner: string;
}

export interface Fees {
  creation: number | null;
  platformPct: number;
  headerless: number;
  graduation: number;
  locker: number;
}

export interface TokenState {
  step: number;
  taxMode: 'BASIC' | 'NO_TAX' | null;
  profile: 'ZERO' | 'SUPER' | 'BASIC' | 'ADVANCED' | null;
  fees: Fees;
  basics: TokenBasics;
  curves: CurveSettings;
  meta: MetaData;
  files: FileUploads;
  txHash: string | null;
  creationResult?: CreateTokenResult;
  isCreating?: boolean;
}

export interface CreateTokenResult {
  success: boolean;
  data?: any;
  error?: string;
  txHash?: string;
}

export interface FileUploads {
  logo?: File;
  banner?: File;
}

export type ProfileType = 'ZERO' | 'SUPER' | 'BASIC' | 'ADVANCED';
export type TaxMode = 'BASIC' | 'NO_TAX';
export type FinalTokenType = 'NO_TAX' | 'TAX';

