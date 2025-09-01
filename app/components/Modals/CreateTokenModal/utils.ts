import { TokenState, ProfileType } from './types';

export const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });

export const initialState: TokenState = {
  step: 1,
  taxMode: null,
  profile: null,
  fees: {
    creation: null,
    platformPct: 0.3,
    headerless: 0.003,
    graduation: 0.1,
    locker: 0.08,
  },
  basics: {
    name: "",
    symbol: "",
    totalSupply: "1000000000",
    gradCap: "",
    startMode: "NOW",
    startTime: 0,
    lpMode: "LOCK",
    lockDays: 30,
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
  meta: { desc: "", website: "", tg: "", tw: "", logo: "", banner: "" },
  files: {},
  txHash: null,
};

export function updateCreationFee(profile: ProfileType | null, taxMode: string | null): number | null {
  let fee = null;
  switch (profile) {
    case "ZERO":
      fee = 0.0;
      break;
    case "SUPER":
      fee = 0.0;
      break;
    case "BASIC":
      fee = taxMode === "BASIC" ? 0.003 : 0.001;
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

  const totalSupply = basics.totalSupply?.trim() || "1000000000";
  const totalOK = isInt(totalSupply) && BigInt(totalSupply) > BigInt(0);
  if (!totalOK) {
    errors.totalSupply = "Enter a valid positive integer.";
  }

  if (basics.gradCap?.trim()) {
    const capOK = isInt(basics.gradCap.trim()) && totalOK && BigInt(basics.gradCap.trim()) <= BigInt(totalSupply);
    if (!capOK) {
      errors.gradCap = "Graduation cap must be ≤ total supply.";
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
    const lockDays = Number(basics.lockDays || "30");
    if (!isInt(String(lockDays)) || lockDays < 30) {
      errors.lockDays = "Lock duration must be ≥ 30 days.";
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

  if (profile === "ZERO") {
    if (finalType.ZERO === "TAX") {
      const v = pct(curves.finalTax.ZERO);
      if (!(v != null && inRange(v, 0, 5))) {
        errors.zeroFinalTax = "Enter 0-5%.";
      }
    }
  }

  if (profile === "SUPER") {
    if (finalType.SUPER === "TAX") {
      const v = pct(curves.finalTax.SUPER);
      if (!(v != null && inRange(v, 0, 5))) {
        errors.superFinalTax = "Enter 0-5%.";
      }
    }
  }

  if (profile === "BASIC") {
    const st = pct(curves.basic.startTax);
    if (!(st != null && inRange(st, 0, 100))) {
      errors.basicStartTax = "Enter 0-100%.";
    }
    if (!isInt(curves.basic.taxDuration)) {
      errors.basicTaxDuration = "Enter minutes (integer).";
    }
    if (!isInt(curves.basic.maxWallet)) {
      errors.basicMaxWallet = "Enter integer tokens.";
    }
    if (!isInt(curves.basic.maxWalletDuration)) {
      errors.basicMaxWalletDuration = "Enter minutes (integer).";
    }
    if (!isInt(curves.basic.maxTx)) {
      errors.basicMaxTx = "Enter integer tokens.";
    }
    if (!isInt(curves.basic.maxTxDuration)) {
      errors.basicMaxTxDuration = "Enter minutes (integer).";
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
    if (!(st >= 0 && st <= 100)) {
      errors.advStartTax = "Enter 0-100%.";
    }

    const step = curves.advanced.taxStep === "" ? 0 : Number(curves.advanced.taxStep.replace(",", "."));
    const tint = curves.advanced.taxInterval === "" ? 0 : Number(curves.advanced.taxInterval);
    if (step > 0 && !(tint > 0)) {
      errors.advTaxInterval = "Required if step > 0.";
    }

    if (
      !isInt(curves.advanced.maxWStart) ||
      (curves.advanced.maxWStep && !isInt(curves.advanced.maxWStep)) ||
      (curves.advanced.maxWStep && !(isInt(curves.advanced.maxWInterval) && Number(curves.advanced.maxWInterval) > 0))
    ) {
      errors.advMaxW = "Enter integers; if step > 0, interval > 0.";
    }
    if (
      !isInt(curves.advanced.maxTStart) ||
      (curves.advanced.maxTStep && !isInt(curves.advanced.maxTStep)) ||
      (curves.advanced.maxTStep && !(isInt(curves.advanced.maxTInterval) && Number(curves.advanced.maxTInterval) > 0))
    ) {
      errors.advMaxT = "Enter integers; if step > 0, interval > 0.";
    }
    if (!isInt(curves.advanced.removeAfter)) {
      errors.advRemoveAfter = "Enter minutes (integer).";
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

export function generateFakeHash(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return "0x" + Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

