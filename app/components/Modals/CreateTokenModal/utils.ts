import { TokenState, ProfileType } from './types';

export const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });

export const initialState: TokenState = {
  step: 0,
  deploymentMode: null,
  taxMode: null,
  profile: null,
  fees: {
    creation: null,
    platformPct: 0.3,
    headerless: 0.001,
    stealth: 0.003,
    graduation: 0.1,
    locker: 0.08,
  },
  basics: {
    name: "",
    symbol: "",
    totalSupply: "",
    gradCap: "",
    gradCapWei: null,
    gradCapError: null,
    gradCapComputedKey: null,
    tokenCategory: null,
    startMode: "NOW",
    startTime: 0,
    lpMode: "LOCK",
    lockDays: 90,
    removeHeader: false,
    stealth: false,
  },
  curves: {
    finalType: {
      ZERO: "NO_TAX",
      SUPER: "NO_TAX",
      BASIC: "NO_TAX",
      ADVANCED: "NO_TAX",
    },
    finalTax: { ZERO: "", SUPER: "", BASIC: "", ADVANCED: "" },
    super: { maxWallet: "", maxTx: "" },
    basic: {
      startTax: "",
      taxDuration: "",
      maxWallet: "",
      maxWalletDuration: "",
      maxTx: "",
      maxTxDuration: "",
    },
    advanced: {
      startTax: "",
      taxStep: "",
      taxInterval: "",
      maxWStart: "",
      maxWStep: "",
      maxWInterval: "",
      maxTStart: "",
      maxTStep: "",
      maxTInterval: "",
      removeAfter: "",
      taxReceiver: "",
    },
  },
  v2Settings: {
    enableTradingMode: 'DEPLOY_ONLY',
    initialLiquidityETH: '1.0',
    taxSettings: {
      buyTax: '0',
      sellTax: '0',
      taxReceiver: ''
    },
    limits: {
      maxWallet: '2',
      maxTx: '2',
      enableLimits: false
    },
    advancedTaxConfig: {
      enabled: false,
      startTax: '20',        // 20%
      finalTax: '3',         // 3%
      taxDropInterval: '3600', // 1 hour
      taxDropStep: '1'       // -1% per interval
    },
    advancedLimitsConfig: {
      enabled: false,
      startMaxTx: '1',         // 1% of supply
      maxTxStep: '0.5',        // +0.5% per interval
      startMaxWallet: '2',     // 2% of supply
      maxWalletStep: '0.1',    // +0.1% per interval
      limitsInterval: '3600'   // 1 hour intervals
    },
    stealthConfig: {
      enabled: false,
      ethAmount: '1.0'         // 1 ETH for stealth LP
    }
  },
  meta: {
    desc: "",
    website: "",
    tg: "",
    tw: "",
    logo: "",
    logoFile: null,
    banner: "",
    bannerFile: null,
    autoBrand: false,
    mp3: "",
    mp3File: null,
    palette: "",
  },
  txHash: null,
};

export function updateCreationFee(profile: ProfileType | null, taxMode: string | null): number | null {
  let fee = null;
  switch (profile) {
    case "ZERO":
      fee = 0.0005;
      break;
    case "SUPER":
      fee = 0.001;
      break;
    case "BASIC":
      fee = 0.003;
      break;
    case "ADVANCED":
      fee = 0.01;
      break;
    default:
      fee = null;
  }
  return fee;
}

export function getPlatformFee(profile: ProfileType | null): number {
  return profile === "ADVANCED" ? 1.0 : profile === "BASIC" ? 0.6 : 0.3;
}

export function validateBasics(basics: any): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const isInt = (s: string) => /^[0-9]+$/.test(s);

  if (!basics.name?.trim()) {
    errors.name = "Name is required.";
  }

  if (!basics.symbol?.trim()) {
    errors.symbol = "Symbol is required.";
  }

  if (!basics.tokenCategory) {
    errors.tokenCategory = "Please select a token category.";
  }

  const totalSupply = basics.totalSupply?.trim() || "1000000000";
  const totalOK = isInt(totalSupply) && BigInt(totalSupply) > BigInt(0);
  if (!totalOK) {
    errors.totalSupply = "Enter a valid positive integer.";
  }

  // Graduation cap is required and must be a positive dollar amount
  if (!basics.gradCap?.trim()) {
    errors.gradCap = "Graduation cap is required.";
  } else {
    const capValue = Number(basics.gradCap.trim());
    const capOK = !isNaN(capValue) && capValue >= 36000 && capValue <= 500000;
    if (!capOK) {
      errors.gradCap = "Graduation cap must be between $36,000 and $500,000.";
    }
  }

  if (basics.startMode === "SCHEDULE") {
    if (!basics.launchDateTime) {
      errors.startTime = "Start time must be now or later.";
    } else {
      const t = Math.floor(new Date(basics.launchDateTime).getTime() / 1000);
      const now = Math.floor(Date.now() / 1000);
      if (t < now) {
        errors.startTime = "Start time must be now or later.";
      }
    }
  }

  if (basics.lpMode === "LOCK") {
    const lockDays = Number(basics.lockDays || "90");
    if (!isInt(String(lockDays)) || lockDays < 90) {
      errors.lockDays = "Lock duration must be ≥ 90 days (3 months).";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateCurve(profile: ProfileType, curves: any, finalType: any): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const inRange = (x: number, a: number, b: number) => x >= a && x <= b;
  const pct = (v: string) => (v === "" ? null : Number(String(v).replace(",", ".")));
  const isInt = (s: string) => /^[0-9]+$/.test(s);

  // Zero and Simple profiles are always tax-free, no validation needed for tax settings
  if (profile === "ZERO") {
    // Zero profiles have no configurable settings, always valid
    return {
      isValid: true,
      errors: {}
    };
  }

  if (profile === "SUPER") {
    // Simple profiles only need wallet and transaction limit validation
    const maxWallet = pct(curves.super.maxWallet);
    if (!(maxWallet != null && maxWallet > 0 && maxWallet <= 100)) {
      errors.superMaxWallet = "Enter a value between 0.1-100%.";
    }

    const maxTx = pct(curves.super.maxTx);
    if (!(maxTx != null && maxTx > 0 && maxTx <= 100)) {
      errors.superMaxTx = "Enter a value between 0.1-100%.";
    }
  }

  if (profile === "BASIC") {
    const st = pct(curves.basic.startTax);
    if (!(st != null && inRange(st, 0, 100))) {
      errors.basicStartTax = "Enter 0-100%.";
    }
    if (!isInt(curves.basic.taxDuration) || !inRange(Number(curves.basic.taxDuration), 10, 1200)) {
      errors.basicTaxDuration = "Enter seconds (10 - 1200).";
    }
    if (!isInt(curves.basic.maxWallet)) {
      errors.basicMaxWallet = "Enter integer tokens.";
    }
    if (!isInt(curves.basic.maxWalletDuration) || !inRange(Number(curves.basic.maxWalletDuration), 10, 1200)) {
      errors.basicMaxWalletDuration = "Enter seconds (10 - 1200).";
    }
    if (!isInt(curves.basic.maxTx)) {
      errors.basicMaxTx = "Enter integer tokens.";
    }
    if (!isInt(curves.basic.maxTxDuration) || !inRange(Number(curves.basic.maxTxDuration), 10, 1200)) {
      errors.basicMaxTxDuration = "Enter seconds (10 - 1200).";
    }
    if (finalType.BASIC === "TAX") {
      const v = pct(curves.finalTax.BASIC);
      if (!(v != null && inRange(v, 0, 5))) {
        errors.basicFinalTax = "Enter 0-5%.";
      }
    }
  }

  if (profile === "ADVANCED") {
    const st = Number(curves.advanced.startTax.replace(",", "."));
    if (!(st >= 0 && st <= 20)) {
      errors.advStartTax = "Enter 0-20%.";
    }

    const step = curves.advanced.taxStep === "" ? 0 : Number(curves.advanced.taxStep.replace(",", "."));
    const tint = curves.advanced.taxInterval === "" ? 0 : Number(curves.advanced.taxInterval);
    if (step > 0 && !inRange(tint, 10, 1200)) {
      errors.advTaxInterval = "If step > 0, interval must be 10-1200s.";
    }

    // Max Wallet validations
    const mwStartOk = isInt(curves.advanced.maxWStart) && Number(curves.advanced.maxWStart) > 0;
    const mwStepOk = (curves.advanced.maxWStep === "") || isInt(curves.advanced.maxWStep);
    const mwIntOk = (curves.advanced.maxWStep === "") || (isInt(curves.advanced.maxWInterval) && inRange(Number(curves.advanced.maxWInterval), 10, 1200));
    if (!mwStartOk || !mwStepOk || !mwIntOk) {
      errors.advMaxW = "Enter integer tokens; if step > 0, interval 10-1200s.";
    }

    // Max Tx validations
    const mtStartOk = isInt(curves.advanced.maxTStart) && Number(curves.advanced.maxTStart) > 0;
    const mtStepOk = (curves.advanced.maxTStep === "") || isInt(curves.advanced.maxTStep);
    const mtIntOk = (curves.advanced.maxTStep === "") || (isInt(curves.advanced.maxTInterval) && inRange(Number(curves.advanced.maxTInterval), 10, 1200));
    if (!mtStartOk || !mtStepOk || !mtIntOk) {
      errors.advMaxT = "Enter integer tokens; if step > 0, interval 10-1200s.";
    }

    // Relationship: maxTxStart <= maxWalletStart
    if (mwStartOk && mtStartOk && Number(curves.advanced.maxTStart) > Number(curves.advanced.maxWStart)) {
      errors.advMaxT = (errors.advMaxT ? errors.advMaxT + " " : "") + "Max Tx start must be ≤ Max Wallet start.";
    }

    if (!isInt(curves.advanced.removeAfter) || !inRange(Number(curves.advanced.removeAfter), 10, 1200)) {
      errors.advRemoveAfter = "Enter seconds (10 - 1200).";
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(curves.advanced.taxReceiver)) {
      errors.advTaxReceiver = "Enter a valid address (0x…40 hex).";
    }

    if (finalType.ADVANCED === "TAX") {
      const v = Number(curves.finalTax.ADVANCED.replace(",", "."));
      if (!(v >= 0 && v <= 5)) {
        errors.advFinalTax = "Enter 0-5%.";
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateV2Settings(v2Settings: any): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const isValidNumber = (s: string) => !isNaN(Number(s)) && Number(s) >= 0;
  const isValidPercent = (s: string) => isValidNumber(s) && Number(s) >= 0 && Number(s) <= 100;
  const isInt = (s: string) => /^[0-9]+$/.test(s);

  // Validate liquidity amount for full launch mode
  if (v2Settings.enableTradingMode === 'FULL_LAUNCH') {
    if (!v2Settings.initialLiquidityETH || !isValidNumber(v2Settings.initialLiquidityETH) || Number(v2Settings.initialLiquidityETH) <= 0) {
      errors.initialLiquidityETH = 'Initial liquidity must be greater than 0 ETH';
    }
  }

  // Validate tax settings
  if (!isValidPercent(v2Settings.taxSettings.buyTax)) {
    errors.buyTax = 'Buy tax must be between 0-100%';
  }
  if (!isValidPercent(v2Settings.taxSettings.sellTax)) {
    errors.sellTax = 'Sell tax must be between 0-100%';
  }

  // Validate tax receiver if taxes are set
  const hasTax = Number(v2Settings.taxSettings.buyTax) > 0 || Number(v2Settings.taxSettings.sellTax) > 0;
  if (hasTax) {
    if (!v2Settings.taxSettings.taxReceiver || !/^0x[a-fA-F0-9]{40}$/.test(v2Settings.taxSettings.taxReceiver)) {
      errors.taxReceiver = 'Valid tax receiver address required when taxes > 0';
    }
  }

  // Validate limits if enabled
  if (v2Settings.limits.enableLimits) {
    if (!isValidPercent(v2Settings.limits.maxWallet)) {
      errors.maxWallet = 'Max wallet must be between 0-100% of supply';
    }
    if (!isValidPercent(v2Settings.limits.maxTx)) {
      errors.maxTx = 'Max transaction must be between 0-100% of supply';
    }
  }

  // Validate advanced tax configuration if enabled
  if (v2Settings.advancedTaxConfig.enabled) {
    if (!isValidPercent(v2Settings.advancedTaxConfig.startTax)) {
      errors.advStartTax = 'Start tax must be between 0-100%';
    }
    if (!isValidPercent(v2Settings.advancedTaxConfig.finalTax)) {
      errors.advFinalTax = 'Final tax must be between 0-100%';
    }
    if (!isInt(v2Settings.advancedTaxConfig.taxDropInterval) || Number(v2Settings.advancedTaxConfig.taxDropInterval) <= 0) {
      errors.advTaxDropInterval = 'Tax drop interval must be a positive integer (seconds)';
    }
    if (!isValidPercent(v2Settings.advancedTaxConfig.taxDropStep)) {
      errors.advTaxDropStep = 'Tax drop step must be between 0-100%';
    }

    // Validate that final tax is lower than or equal to start tax
    const startTax = Number(v2Settings.advancedTaxConfig.startTax);
    const finalTax = Number(v2Settings.advancedTaxConfig.finalTax);
    if (finalTax > startTax) {
      errors.advFinalTax = 'Final tax must be less than or equal to start tax';
    }
  }

  // Validate advanced limits configuration if enabled
  if (v2Settings.advancedLimitsConfig.enabled) {
    if (!isValidPercent(v2Settings.advancedLimitsConfig.startMaxTx) || Number(v2Settings.advancedLimitsConfig.startMaxTx) <= 0) {
      errors.advStartMaxTx = 'Starting max transaction must be between 0.1-100% of supply';
    }
    if (!isValidNumber(v2Settings.advancedLimitsConfig.maxTxStep) || Number(v2Settings.advancedLimitsConfig.maxTxStep) < 0 || Number(v2Settings.advancedLimitsConfig.maxTxStep) > 100) {
      errors.advMaxTxStep = 'Max transaction step must be between 0-100%';
    }
    if (!isValidPercent(v2Settings.advancedLimitsConfig.startMaxWallet) || Number(v2Settings.advancedLimitsConfig.startMaxWallet) <= 0) {
      errors.advStartMaxWallet = 'Starting max wallet must be between 0.1-100% of supply';
    }
    if (!isValidNumber(v2Settings.advancedLimitsConfig.maxWalletStep) || Number(v2Settings.advancedLimitsConfig.maxWalletStep) < 0 || Number(v2Settings.advancedLimitsConfig.maxWalletStep) > 100) {
      errors.advMaxWalletStep = 'Max wallet step must be between 0-100%';
    }
    if (!isInt(v2Settings.advancedLimitsConfig.limitsInterval) || Number(v2Settings.advancedLimitsConfig.limitsInterval) <= 0) {
      errors.advLimitsInterval = 'Limits interval must be a positive integer (seconds)';
    }
  }

  // Validate stealth configuration if enabled
  if (v2Settings.stealthConfig.enabled) {
    if (!v2Settings.stealthConfig.ethAmount || !isValidNumber(v2Settings.stealthConfig.ethAmount) || Number(v2Settings.stealthConfig.ethAmount) <= 0) {
      errors.stealthEthAmount = 'Stealth ETH amount must be greater than 0';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function generateFakeHash(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return "0x" + Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

