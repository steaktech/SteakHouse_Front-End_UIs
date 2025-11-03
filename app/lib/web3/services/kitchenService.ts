// lib/web3/services/kitchenService.ts
import Web3 from "web3";
import KitchenABI from "@/app/contracts/Kitchen.json";
import { 
  WEB3_CONFIG, 
  getKitchenAddress, 
  getCurrentNetwork, 
  getCurrentChainId, 
  getCurrentCurrencySymbol 
} from "@/app/lib/config/constants";
import { TokenState } from "@/app/components/Modals/CreateTokenModal/types";

export interface UnsignedTransaction {
  from: string;
  to: string;
  data: string;
  gas: string;
  value?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  gasPrice?: string;
  type?: string;
}

export interface GasFees {
  maxPriorityFeePerGas: string;
  maxFeePerGas: string;
}

/**
 * Service class for interacting with the Kitchen contract
 * Handles buy/sell transactions and gas estimation
 */
export class KitchenService {
  private web3: Web3;
  private contract: any;
  private account: string;
  private chainId: number;
  private kitchenAddress: string;

  constructor(web3: Web3, account: string, chainId?: number) {
    this.web3 = web3;
    this.account = account;
    this.chainId = chainId || WEB3_CONFIG.DEFAULT_CHAIN_ID;
    this.kitchenAddress = getKitchenAddress(this.chainId);
    
    // Validate contract address
    if (!this.kitchenAddress || this.kitchenAddress === 'undefined') {
      throw new Error('Kitchen contract address not configured');
    }
    
    if (!this.web3.utils.isAddress(this.kitchenAddress)) {
      throw new Error('Invalid Kitchen contract address format');
    }
    
    // Initialize contract instance
    this.contract = new this.web3.eth.Contract(KitchenABI, this.kitchenAddress);
  }



  /**
   * Get EIP-1559 gas fees with buffer for faster execution
   */
  private async get1559Fees(): Promise<GasFees> {
    if (!this.web3) throw new Error("Web3 not initialized");
    
    try {
      // Get current gas price from network
      const gasPrice = await (this.web3.eth as any).getGasPrice();
      
      // Convert to reasonable numbers for EIP-1559
      const gasPriceGwei = Math.ceil(Number(gasPrice) / 1000000000);
      const priorityFeeGwei = Math.max(2, Math.ceil(gasPriceGwei * 0.1)); // 10% of gas price or 2 gwei minimum
      const maxFeeGwei = gasPriceGwei + priorityFeeGwei;
      
      // Convert back to wei (as numbers, then to hex properly)
      const priorityFeeWei = priorityFeeGwei * 1000000000;
      const maxFeeWei = maxFeeGwei * 1000000000;

      return {
        maxPriorityFeePerGas: "0x" + priorityFeeWei.toString(16),
        maxFeePerGas: "0x" + maxFeeWei.toString(16),
      };
    } catch (error) {
      // Ultra-safe fallback values
      const priorityFeeWei = 2 * 1000000000; // 2 gwei
      const maxFeeWei = 20 * 1000000000; // 20 gwei
      
      return {
        maxPriorityFeePerGas: "0x" + priorityFeeWei.toString(16),
        maxFeePerGas: "0x" + maxFeeWei.toString(16),
      };
    }
  }

  /**
   * Estimate gas limit for a contract method call
   */
  private async estimateGasLimit(
    methodCall: any,
    value?: string,
    fallbackGas?: number
  ): Promise<string> {
    try {
      // First check if we have enough balance for the transaction
      if (value) {
        const balance = await (this.web3.eth as any).getBalance(this.account);
        const requiredValue = BigInt(value);
        const currentBalance = BigInt(balance);
        
        if (currentBalance < requiredValue) {
          // Use default gas but let user know about balance issue
          const defaultGas = WEB3_CONFIG.GAS.LIMITS.BUY_TOKEN;
          return this.web3.utils.toHex(defaultGas);
        }
      }
      
      const gasEstimate = await methodCall.estimateGas({ 
        from: this.account,
        ...(value && { value })
      });
      
      // Add 20% buffer to gas estimate for safety
      const gasWithBuffer = Math.floor(Number(gasEstimate) * 1.2);
      
      return this.web3.utils.toHex(gasWithBuffer);
    } catch (error: any) {
      // Return appropriate default gas limit based on operation
      const defaultGas = fallbackGas
        ? fallbackGas
        : (value ? WEB3_CONFIG.GAS.LIMITS.BUY_TOKEN : WEB3_CONFIG.GAS.LIMITS.SELL_TOKEN);
      return this.web3.utils.toHex(defaultGas);
    }
  }

  /**
   * Build Buy Token Transaction
   * Calls buyToken(address token) payable function from Kitchen contract
   */
  async buildBuyTokenTx(tokenAddress: string, ethAmount: string): Promise<UnsignedTransaction> {
    if (!this.web3 || !this.account || !this.contract) {
      throw new Error("Service not properly initialized - connect wallet first");
    }

    // Validate and format inputs
    const token = this.web3.utils.toChecksumAddress(tokenAddress);
    
    // Use simple math to avoid Web3 utils issues
    const ethAmountNum = parseFloat(ethAmount);
    const valueInWei = Math.floor(ethAmountNum * 1e18); // Use number, not string
    const value = valueInWei;
    
    // Create method call for buyToken(address token)
    const methodCall = this.contract.methods.buyToken(token);
    const data = methodCall.encodeABI();
    
    // Estimate gas and get fees
    const gas = await this.estimateGasLimit(methodCall, value.toString());
    const { maxFeePerGas, maxPriorityFeePerGas } = await this.get1559Fees();

    // Convert value to hex properly (value is already a number)
    const hexValue = "0x" + value.toString(16);

    const transaction: UnsignedTransaction = {
      from: this.account,
      to: this.web3.utils.toChecksumAddress(this.kitchenAddress),
      data,
      value: hexValue,
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      type: "0x2", // EIP-1559
    };

    return transaction;
  }

  /**
   * Build Sell Token Transaction
   * Calls sellToken(address token, uint256 amount) function from Kitchen contract
   * Now accepts ETH amount and converts it to equivalent token amount
   */
  async buildSellTokenTx(tokenAddress: string, ethAmount: string): Promise<UnsignedTransaction> {
    if (!this.web3 || !this.account || !this.contract) {
      throw new Error("Service not properly initialized - connect wallet first");
    }

    // Validate and format inputs
    const token = this.web3.utils.toChecksumAddress(tokenAddress);
    
    // Convert ETH amount to equivalent token amount
    // This is a simplified conversion - in a real app, you'd get the actual exchange rate
    // For now, assuming 1 ETH = 1000 tokens (adjust this ratio as needed)
    const ethAmountNum = parseFloat(ethAmount);
    const TOKEN_PER_ETH_RATIO = 1000; // 1 ETH = 1000 tokens (example ratio)
    const tokenAmountNum = ethAmountNum * TOKEN_PER_ETH_RATIO;
    const amountInBaseUnits = Math.floor(tokenAmountNum * 1e18); // Convert to base units
    const amount = amountInBaseUnits.toString(); // Convert to string for contract call
    
    // Create method call for sellToken(address token, uint256 amount)
    const methodCall = this.contract.methods.sellToken(token, amount);
    const data = methodCall.encodeABI();
    
    // Estimate gas and get fees
    const gas = await this.estimateGasLimit(methodCall);
    const { maxFeePerGas, maxPriorityFeePerGas } = await this.get1559Fees();

    const transaction: UnsignedTransaction = {
      from: this.account,
      to: this.web3.utils.toChecksumAddress(this.kitchenAddress),
      data,
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      type: "0x2", // EIP-1559
    };

    return transaction;
  }

  /**
   * Validate buy transaction parameters
   */
  validateBuyParams(tokenAddress: string, ethAmount: string): string | null {
    if (!tokenAddress || !this.web3.utils.isAddress(tokenAddress)) {
      return "Invalid token address provided";
    }
    
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      return `Invalid ${getCurrentCurrencySymbol()} amount - must be greater than 0`;
    }

    try {
      // Test if the amount can be converted to wei
      this.web3.utils.toWei(ethAmount, "ether");
      return null;
    } catch (error) {
      return `Invalid ${getCurrentCurrencySymbol()} amount format`;
    }
  }

  /**
   * Validate sell transaction parameters
   * Now validates ETH amount instead of token amount
   */
  validateSellParams(tokenAddress: string, ethAmount: string): string | null {
    if (!tokenAddress || !this.web3.utils.isAddress(tokenAddress)) {
      return "Invalid token address provided";
    }
    
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      return `Invalid ${getCurrentCurrencySymbol()} amount - must be greater than 0`;
    }

    try {
      // Test if the amount is a valid number
      const numAmount = parseFloat(ethAmount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Invalid number");
      }
      
      // Test if the amount can be converted to wei
      this.web3.utils.toWei(ethAmount, "ether");
      
      return null;
    } catch (error) {
      return `Invalid ${getCurrentCurrencySymbol()} amount format: ${(error as Error).message}`;
    }
  }

  /**
   * Get contract information for debugging
   */
  getContractInfo() {
    return {
      address: this.kitchenAddress,
      chainId: this.chainId,
      account: this.account,
      isInitialized: !!this.contract
    };
  }

  // =================== CREATE TOKEN HELPERS & BUILDERS ===================

  private toWeiBigIntFromEthNumber(amountEth: number): bigint {
    // Avoid float drift by rounding to 18 decimal places, then converting to wei using BigInt math
    // Example: 0.003 -> "0.003000000000000000" -> wei = 3_000_000_000_000_000n
    const ONE_ETHER_WEI = BigInt('1000000000000000000');
    const s = amountEth.toFixed(18); // rounded string with exactly 18 decimals
    const [intPartRaw, fracPartRaw = ''] = s.split('.');
    const intPart = intPartRaw.replace(/^(-?)0+(?=\d)/, '$1'); // keep sign if any, strip leading zeros
    const fracPart = (fracPartRaw + '000000000000000000').slice(0, 18); // pad/right-trim to 18 digits
    const intWei = (intPart === '' || intPart === '-' || intPart === '+') ? BigInt(0) : BigInt(intPart) * ONE_ETHER_WEI;
    const fracWei = BigInt(fracPart);
    return intWei + fracWei;
  }

  private toHexWeiFromEth(amountEth: number): string {
    const wei = this.toWeiBigIntFromEthNumber(amountEth);
    return "0x" + wei.toString(16);
  }

  private toWeiDecimalStringFromEth(amountEth: number): string {
    return this.toWeiBigIntFromEthNumber(amountEth).toString(10);
  }

  private toBaseUnitsFromRawTokens(rawTokens: string): bigint {
    try {
      const supply = BigInt(rawTokens || "0");
      return supply * BigInt('1000000000000000000');
    } catch {
      return BigInt(0);
    }
  }

  private percentToBps(pct: string | number | undefined): number {
    if (pct == null || pct === "") return 0;
    const v = typeof pct === "number" ? pct : Number(String(pct).replace(",", "."));
    if (isNaN(v) || v < 0) return 0;
    return Math.floor(v * 100); // 1% = 100 bps
  }

  private maybePercentToBaseUnits(totalSupplyWei: bigint, valueStr: string | undefined): string {
    if (!valueStr || valueStr === "") return "0";
    const v = Number(String(valueStr).replace(",", "."));
    if (isNaN(v) || v <= 0) return "0";
    // Heuristic: if value <= 100, treat as percent of total supply, else as absolute tokens
    if (v <= 100) {
      const num = BigInt(Math.floor(v * 1e6));
      const amount = (totalSupplyWei * num) / BigInt(1e6 * 100);
      return amount.toString(10);
    }
    // Treat as absolute tokens (whole token units), convert to base units
    const tokens = BigInt(Math.floor(v));
    return (tokens * BigInt(1e18)).toString(10);
  }

  private getTokenTypeCode(profile: string | null): number {
    switch (profile) {
      case "ZERO": return 4; // Zero Simple
      case "SUPER": return 3; // Super Simple
      case "ADVANCED": return 1; // Advanced
      case "BASIC": return 0; // Basic
      default: return 0;
    }
  }

  private percentStrToNumber(pct: string | number | undefined): number {
    if (pct == null || pct === "") return 0;
    const v = typeof pct === "number" ? pct : Number(String(pct).replace(",", "."));
    if (isNaN(v) || v < 0) return 0;
    return Math.floor(v);
  }

  private getFinalTokenTypeCode(finalType: string | undefined): number {
    // 0 = NO_TAX, 1 = TAX per client example
    if (!finalType) return 0;
    return finalType === 'TAX' ? 1 : 0;
  }

  private toBaseUnitsFromTokens(tokensStr: string | undefined): string {
    if (!tokensStr || tokensStr.trim() === '') return '0';
    try {
      const n = BigInt(tokensStr);
      return (n * BigInt(1e18)).toString(10);
    } catch {
      return '0';
    }
  }

  private clampDurationSeconds(value: string | number | undefined, min: number = 1800): number {
    const n = Number(value ?? 0) || 0;
    return n < min ? min : n;
  }

  private getMinimumCreationFeeEth(profile: string): number {
    // Client-specified minimums (align with UI base fees)
    // ZERO -> 0.0005, SUPER -> 0.001, BASIC -> 0.01, ADVANCED -> 0.01
    if (profile === 'ZERO') return 0.0005;
    if (profile === 'SUPER') return 0.001;
    if (profile === 'BASIC') return 0.01;
    if (profile === 'ADVANCED') return 0.01; // per latest client guidance
    return 0;
  }

  /**
   * Build Create Token transaction from modal state
   * Supports ZERO, SUPER, BASIC, ADVANCED under VIRTUAL_CURVE deployment.
   */
  async buildCreateTokenTxFromState(state: TokenState): Promise<UnsignedTransaction> {
    if (state.deploymentMode !== 'VIRTUAL_CURVE') {
      throw new Error('Only VIRTUAL_CURVE mode is supported for on-chain creation in this step');
    }
    if (!state.profile) {
      throw new Error('Profile not selected');
    }
    if (!this.web3 || !this.account || !this.contract) {
      throw new Error('Service not properly initialized - connect wallet first');
    }

    const b = state.basics;
    const curves = state.curves;
    const profile = state.profile;
    const tokenType = this.getFinalTokenTypeCode(curves.finalType[profile as keyof typeof curves.finalType]);

    const totalSupplyWei = this.toBaseUnitsFromRawTokens(b.totalSupply || '0');
    // Graduation cap: prefer API-computed wei amount if available; fallback to legacy 75,000,000 * 1e18
    const graduationCap = (() => {
      try {
        const v = (b as any)?.gradCapWei as string | null | undefined;
        if (v && v !== '0') return BigInt(v);
      } catch {}
      return BigInt("75000000000000000000000000");
    })();
    const removeHeader = !!b.removeHeader;
    const isStealth = !!b.stealth;

    // Use latest block timestamp + 60s when launching NOW, to satisfy contracts requiring startTime > block.timestamp
    let startTime = 0;
    if (b.startMode === 'NOW') {
      const latest = await (this.web3.eth as any).getBlock('latest');
      const ts = Number(latest?.timestamp || Math.floor(Date.now() / 1000));
      startTime = ts + 60;
    } else {
      startTime = (Number(b.startTime || 0) || 0);
    }

    // Use lp lock from inputs; clamp to at least 3 months (7,776,000 seconds) when LOCK is selected
    const lpLockDurationSecRaw = b.lpMode === 'LOCK' ? Number(b.lockDays || 0) * 24 * 60 * 60 : 0;
    const lpLockDurationSec = b.lpMode === 'LOCK' ? Math.max(lpLockDurationSecRaw, 7776000) : 0;
    const burnLP = b.lpMode === 'BURN';

    // Final tax handling per profile
    const finalType = curves.finalType[profile as keyof typeof curves.finalType];
    const finalTaxStr = curves.finalTax[profile as keyof typeof curves.finalTax];
    const finalTaxRatePct = this.percentStrToNumber(finalTaxStr);

    // Payable value (creation fee): ensure at least client minimums per profile
    const minRequired = this.getMinimumCreationFeeEth(profile);
    const configured = typeof state.fees.creation === 'number' ? state.fees.creation : 0;
    const creationFeeEth = Math.max(configured, minRequired);
    const hexValue = this.toHexWeiFromEth(creationFeeEth);

    let methodCall: any;
    let methodName = "" as string;
    let methodArgs: any[] = [];

    if (profile === 'ZERO') {
      // TokenZeroSimple meta
      const meta = {
        creator: this.account,
        name: b.name,
        symbol: b.symbol,
        totalSupply: totalSupplyWei.toString(10),
        graduationCap: graduationCap.toString(10),
        tokenType,
        finalTaxRate: finalTaxRatePct,
        removeHeader,
        lpConfig: {
          lpLockDuration: lpLockDurationSec,
          burnLP,
        },
      } as any;

      methodName = 'createZeroSimpleToken';
      methodArgs = [meta, startTime, isStealth];
      methodCall = this.contract.methods.createZeroSimpleToken(meta, startTime, isStealth);
    } else if (profile === 'SUPER') {
      // TokenSuperSimple meta
      const maxWallet = this.maybePercentToBaseUnits(totalSupplyWei, curves.super.maxWallet);
      const maxTx = this.maybePercentToBaseUnits(totalSupplyWei, curves.super.maxTx);
      const meta = {
        creator: this.account,
        name: b.name,
        symbol: b.symbol,
        totalSupply: totalSupplyWei.toString(10),
        graduationCap: graduationCap.toString(10),
        maxWallet,
        maxTx,
        tokenType,
        finalTaxRate: finalTaxRatePct,
        removeHeader,
        lpConfig: {
          lpLockDuration: lpLockDurationSec,
          burnLP,
        },
      } as any;

      methodName = 'createSuperSimpleToken';
      methodArgs = [meta, startTime, isStealth];
      methodCall = this.contract.methods.createSuperSimpleToken(meta, startTime, isStealth);
    } else if (profile === 'BASIC' || profile === 'ADVANCED') {
      // Basic/Advanced params share similar base tuple
      const baseParams = {
        name: b.name,
        symbol: b.symbol,
        totalSupply: totalSupplyWei.toString(10),
        tokenType,
        graduationCap: graduationCap.toString(10),
        lpLockDuration: lpLockDurationSec,
        burnLP,
        startTime,
        finalTaxRate: finalTaxRatePct,
        removeHeader,
      } as any;

      let staticParams: any;

      if (profile === 'ADVANCED') {
        // Per client working example, static curve params should be zeroed for Advanced
        const adv = curves.advanced;
        staticParams = {
          curveStartingTax: 0,
          curveTaxDuration: 0,
          curveMaxWallet: "0",
          curveMaxWalletDuration: 0,
          curveMaxTx: "0",
          curveMaxTxDuration: 0,
        } as any;

        // Advanced dynamic params
        // Ensure limitRemovalTime is after startTime by at least 60s
        const delta = Number(adv.removeAfter || 1800) || 1800;
        const minDelta = 60;
        const limitRemovalTime = startTime + Math.max(delta, minDelta);

        const advParams = {
          taxDropStep: this.percentStrToNumber(adv.taxStep || 0),
          taxDropInterval: this.clampDurationSeconds(adv.taxInterval, 60),
          maxWalletStep: this.toBaseUnitsFromTokens(adv.maxWStep),
          maxWalletInterval: this.clampDurationSeconds(adv.maxWInterval, 60),
          maxTxStep: this.toBaseUnitsFromTokens(adv.maxTStep),
          maxTxInterval: this.clampDurationSeconds(adv.maxTInterval, 60),
          limitRemovalTime,
        } as any;

        // Determine tax wallet: prefer advanced.taxReceiver, fallback to creator account
        const taxWallet = (curves.advanced?.taxReceiver && this.web3.utils.isAddress(curves.advanced.taxReceiver))
          ? this.web3.utils.toChecksumAddress(curves.advanced.taxReceiver)
          : this.web3.utils.toChecksumAddress(this.account);

        methodName = isStealth ? 'createAdvancedTokenStealth' : 'createAdvancedToken';
        methodArgs = [baseParams, staticParams, advParams, taxWallet];
        methodCall = isStealth
          ? this.contract.methods.createAdvancedTokenStealth(baseParams, staticParams, advParams, taxWallet)
          : this.contract.methods.createAdvancedToken(baseParams, staticParams, advParams, taxWallet);
      } else {
        staticParams = {
          curveStartingTax: this.percentStrToNumber(curves.basic.startTax),
          curveTaxDuration: this.clampDurationSeconds(curves.basic.taxDuration, 1800),
          curveMaxWallet: this.maybePercentToBaseUnits(totalSupplyWei, curves.basic.maxWallet),
          curveMaxWalletDuration: this.clampDurationSeconds(curves.basic.maxWalletDuration, 1800),
          curveMaxTx: this.maybePercentToBaseUnits(totalSupplyWei, curves.basic.maxTx),
          curveMaxTxDuration: this.clampDurationSeconds(curves.basic.maxTxDuration, 1800),
        } as any;

        methodName = isStealth ? 'createBasicTokenStealth' : 'createBasicToken';
        methodArgs = [baseParams, staticParams];
        methodCall = isStealth
          ? this.contract.methods.createBasicTokenStealth(baseParams, staticParams)
          : this.contract.methods.createBasicToken(baseParams, staticParams);
      }
    } else {
      throw new Error(`Unsupported profile: ${profile}`);
    }

    // Debug: log method and arguments being sent
    try {
      console.groupCollapsed(`[KitchenCreate] build tx -> ${methodName}`);
      console.log('from:', this.account);
      console.log('to (Kitchen):', this.kitchenAddress);
      console.log('value (ETH):', creationFeeEth);
      console.log('value (wei):', this.toWeiDecimalStringFromEth(creationFeeEth));
      console.log('args:', methodArgs);
      console.groupEnd();
    } catch {}

    const data = methodCall.encodeABI();

    // Estimate gas and fees
    // Choose sensible fallback gas per create function
    const fallbackGas = profile === 'BASIC'
      ? WEB3_CONFIG.GAS.LIMITS.CREATE_BASIC_TOKEN
      : profile === 'ADVANCED'
        ? WEB3_CONFIG.GAS.LIMITS.CREATE_ADVANCED_TOKEN
        : profile === 'SUPER'
          ? WEB3_CONFIG.GAS.LIMITS.CREATE_SUPER_SIMPLE_TOKEN
          : WEB3_CONFIG.GAS.LIMITS.CREATE_ZERO_SIMPLE_TOKEN;

    const gas = await this.estimateGasLimit(
      methodCall,
      this.toWeiDecimalStringFromEth(creationFeeEth),
      fallbackGas
    );
    const { maxFeePerGas, maxPriorityFeePerGas } = await this.get1559Fees();

    const transaction: UnsignedTransaction = {
      from: this.account,
      to: this.web3.utils.toChecksumAddress(this.kitchenAddress),
      data,
      value: hexValue,
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      type: "0x2",
    };

    return transaction;
  }

  /**
   * Build a fixed createAdvancedToken transaction for testing with hardcoded parameters.
   * Matches tuple order exactly as requested: (b,s,a) with no taxWallet param.
   */
  async buildTestAdvancedTokenTx(valueEth: number): Promise<UnsignedTransaction> {
    if (!this.web3 || !this.account || !this.contract) {
      throw new Error('Service not properly initialized - connect wallet first');
    }

    // Build tuples close to client's working example, but ensure time-based fields are valid now
    const latest = await (this.web3.eth as any).getBlock('latest');
    const nowTs = Number(latest?.timestamp || Math.floor(Date.now() / 1000));

    const baseParams: any = {
      name: 'ADVANCTEST1',
      symbol: 'ADVTST1',
      totalSupply: '100000000000000000000000000', // 100,000,000 * 1e18
      tokenType: 0,
      graduationCap: '75000000000000000000000000', // 75,000,000 * 1e18
      lpLockDuration: 15552000, // 6 months
      burnLP: false,
      startTime: nowTs + 60, // now + 60s
      finalTaxRate: 0,
      removeHeader: false,
    };

    // Static params all zeros
    const staticParams: any = {
      curveStartingTax: 0,
      curveTaxDuration: 0,
      curveMaxWallet: '0',
      curveMaxWalletDuration: 0,
      curveMaxTx: '0',
      curveMaxTxDuration: 0,
    };

    // Advanced params input; make intervals >= 60 and use limitRemovalTime > startTime
    const advParams: any = {
      taxDropStep: 1,
      taxDropInterval: 60,
      maxWalletStep: '10000000000000000000000000',
      maxWalletInterval: 60,
      maxTxStep: '10000000000000000000000000',
      maxTxInterval: 60,
      limitRemovalTime: baseParams.startTime + 60,
    };

    // Prefer 4-arg variant with tax wallet if ABI supports it; fallback to 3-arg
    const taxWallet = this.web3.utils.toChecksumAddress(this.account);
    let methodName = 'createAdvancedToken';
    let methodArgs: any[] = [];
    let methodCall: any;

    try {
      // Try 4-arg first
      methodArgs = [baseParams, staticParams, advParams, taxWallet];
      methodCall = this.contract.methods.createAdvancedToken(baseParams, staticParams, advParams, taxWallet);
      // encode once to surface ABI mismatch early
      methodCall.encodeABI();
    } catch {
      // Fallback to 3-arg variant
      methodArgs = [baseParams, staticParams, advParams];
      methodCall = this.contract.methods.createAdvancedToken(baseParams, staticParams, advParams);
    }

    // Debug log
    try {
      console.groupCollapsed(`[KitchenCreate][TEST] build tx -> ${methodName}`);
      console.log('from:', this.account);
      console.log('to (Kitchen):', this.kitchenAddress);
      console.log('value (ETH):', valueEth);
      console.log('value (wei):', this.toWeiDecimalStringFromEth(valueEth));
      console.log('args:', methodArgs);
      console.groupEnd();
    } catch {}

    const data = methodCall.encodeABI();
    const gas = await this.estimateGasLimit(
      methodCall,
      this.toWeiDecimalStringFromEth(valueEth),
      WEB3_CONFIG.GAS.LIMITS.CREATE_ADVANCED_TOKEN
    );
    const { maxFeePerGas, maxPriorityFeePerGas } = await this.get1559Fees();

    const transaction: UnsignedTransaction = {
      from: this.account,
      to: this.web3.utils.toChecksumAddress(this.kitchenAddress),
      data,
      value: this.toHexWeiFromEth(valueEth),
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      type: '0x2',
    };

    return transaction;
  }

  /**
   * Build a fixed createBasicToken transaction for testing with hardcoded parameters.
   */
  async buildTestBasicTokenTx(valueEth: number): Promise<UnsignedTransaction> {
    if (!this.web3 || !this.account || !this.contract) {
      throw new Error('Service not properly initialized - connect wallet first');
    }

    // Hardcoded test tuples
    // Compute start time as latest block timestamp + 60s
    const latest = await (this.web3.eth as any).getBlock('latest');
    const ts = Number(latest?.timestamp || Math.floor(Date.now() / 1000));

    const baseParams: any = {
      name: 'sagas',
      symbol: 'asdgasgd',
      // TOTAL_SUPPLY = 100,000,000 * 1e18
      totalSupply: '100000000000000000000000000',
      tokenType: 0,
      // GRADUATION_CAP = 75,000,000 * 1e18
      graduationCap: '75000000000000000000000000',
      // LP_LOCK_DURATION = 3 months
      lpLockDuration: 7776000,
      burnLP: false,
      // START_TIME = latest block ts + 60
      startTime: ts + 60,
      finalTaxRate: 0,
      removeHeader: false,
    };

    const staticParams: any = {
      // CURVE_START_TAX = 1
      curveStartingTax: 1,
      // durations = 30 minutes
      curveTaxDuration: 1800,
      // CURVE_MAX_WALLET = 10,000,000 * 1e18
      curveMaxWallet: '10000000000000000000000000',
      curveMaxWalletDuration: 1800,
      // CURVE_MAX_TX = 10,000,000 * 1e18
      curveMaxTx: '10000000000000000000000000',
      curveMaxTxDuration: 1800,
    };

    const methodName = 'createBasicToken';
    const methodArgs = [baseParams, staticParams];
    const methodCall = this.contract.methods.createBasicToken(baseParams, staticParams);

    // Debug log
    try {
      console.groupCollapsed(`[KitchenCreate][TEST] build tx -> ${methodName}`);
      console.log('from:', this.account);
      console.log('to (Kitchen):', this.kitchenAddress);
      console.log('value (ETH):', valueEth);
      console.log('value (wei):', this.toWeiDecimalStringFromEth(valueEth));
      console.log('args:', methodArgs);
      console.groupEnd();
    } catch {}

    const data = methodCall.encodeABI();
    const gas = await this.estimateGasLimit(
      methodCall,
      this.toWeiDecimalStringFromEth(valueEth),
      WEB3_CONFIG.GAS.LIMITS.CREATE_BASIC_TOKEN
    );
    const { maxFeePerGas, maxPriorityFeePerGas } = await this.get1559Fees();

    const transaction: UnsignedTransaction = {
      from: this.account,
      to: this.web3.utils.toChecksumAddress(this.kitchenAddress),
      data,
      value: this.toHexWeiFromEth(valueEth),
      gas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      type: '0x2',
    };

    return transaction;
  }

  private async checkKitchenConfigured(): Promise<{ ok: boolean; missing: string[]; details: Record<string, string> }> {
    try {
      const [factory, storageAddr, curve, graduation] = await Promise.all([
        this.contract.methods.factory().call(),
        this.contract.methods.storageContract().call(),
        this.contract.methods.kitchenBondingCurve().call(),
        this.contract.methods.graduation().call(),
      ]);
      const details: Record<string, string> = { factory, storage: storageAddr, curve, graduation };
      const missing: string[] = [];
      if (!factory || /^0x0{40}$/i.test(factory)) missing.push('factory');
      if (!storageAddr || /^0x0{40}$/i.test(storageAddr)) missing.push('storage');
      if (!curve || /^0x0{40}$/i.test(curve)) missing.push('kitchenBondingCurve');
      if (!graduation || /^0x0{40}$/i.test(graduation)) missing.push('graduation');
      return { ok: missing.length === 0, missing, details };
    } catch (e) {
      // If read calls fail, treat as not configured
      return { ok: false, missing: ['factory','storage','kitchenBondingCurve','graduation'], details: {} };
    }
  }

  /**
   * Simulate the create token call to detect reverts before sending a transaction.
   * Returns success=false with a reason if call would revert.
   */
  async simulateCreateTokenCall(state: TokenState): Promise<{ success: boolean; reason?: string }> {
    try {
      if (state.deploymentMode !== 'VIRTUAL_CURVE') {
        return { success: false, reason: 'Only VIRTUAL_CURVE mode supported for simulation' };
      }
      if (!state.profile) {
        return { success: false, reason: 'Profile not selected' };
      }
      // Ensure kitchen has been configured (factory/storage/curve/graduation)
      const config = await this.checkKitchenConfigured();
      if (!config.ok) {
        return { success: false, reason: `Kitchen not configured: missing ${config.missing.join(', ')}` };
      }

      const b = state.basics;
      const curves = state.curves;
      const profile = state.profile;
      const tokenType = this.getFinalTokenTypeCode(curves.finalType[profile as keyof typeof curves.finalType]);

      const totalSupplyWei = this.toBaseUnitsFromRawTokens(b.totalSupply || '0');
      // Graduation cap: prefer API-computed wei amount if available; fallback to legacy 75,000,000 * 1e18
      const graduationCap = (() => {
        try {
          const v = (b as any)?.gradCapWei as string | null | undefined;
          if (v && v !== '0') return BigInt(v);
        } catch {}
        return BigInt("75000000000000000000000000");
      })();
      const removeHeader = !!b.removeHeader;
      const isStealth = !!b.stealth;
      let startTime = 0;
      if (b.startMode === 'NOW') {
        const latest = await (this.web3.eth as any).getBlock('latest');
        const ts = Number(latest?.timestamp || Math.floor(Date.now() / 1000));
        startTime = ts + 60;
      } else {
        startTime = (Number(b.startTime || 0) || 0);
      }
      // Use lp lock from inputs; clamp to at least 3 months (7,776,000 seconds) when LOCK is selected
      const lpLockDurationSecRaw = b.lpMode === 'LOCK' ? Number(b.lockDays || 0) * 24 * 60 * 60 : 0;
      const lpLockDurationSec = b.lpMode === 'LOCK' ? Math.max(lpLockDurationSecRaw, 7776000) : 0;
      const burnLP = b.lpMode === 'BURN';

      const finalType = curves.finalType[profile as keyof typeof curves.finalType];
      const finalTaxStr = curves.finalTax[profile as keyof typeof curves.finalTax];
      const finalTaxRatePct = this.percentStrToNumber(finalTaxStr);

      const minRequired = this.getMinimumCreationFeeEth(profile);
      const configured = typeof state.fees.creation === 'number' ? state.fees.creation : 0;
      const creationFeeEth = Math.max(configured, minRequired);
      const valueDecimalWei = this.toWeiDecimalStringFromEth(creationFeeEth);

      let methodCall: any;
      let methodName = '' as string;
      let methodArgs: any[] = [];
      if (profile === 'ZERO') {
        const meta = {
          creator: this.account,
          name: b.name,
          symbol: b.symbol,
          totalSupply: totalSupplyWei.toString(10),
          graduationCap: graduationCap.toString(10),
          tokenType,
          finalTaxRate: finalTaxRatePct,
          removeHeader,
          lpConfig: { lpLockDuration: lpLockDurationSec, burnLP },
        } as any;
        methodName = 'createZeroSimpleToken';
        methodArgs = [meta, startTime, isStealth];
        methodCall = this.contract.methods.createZeroSimpleToken(meta, startTime, isStealth);
      } else if (profile === 'SUPER') {
        const maxWallet = this.maybePercentToBaseUnits(totalSupplyWei, curves.super.maxWallet);
        const maxTx = this.maybePercentToBaseUnits(totalSupplyWei, curves.super.maxTx);
        const meta = {
          creator: this.account,
          name: b.name,
          symbol: b.symbol,
          totalSupply: totalSupplyWei.toString(10),
          graduationCap: graduationCap.toString(10),
          maxWallet,
          maxTx,
          tokenType,
          finalTaxRate: finalTaxRatePct,
          removeHeader,
          lpConfig: { lpLockDuration: lpLockDurationSec, burnLP },
        } as any;
        methodName = 'createSuperSimpleToken';
        methodArgs = [meta, startTime, isStealth];
        methodCall = this.contract.methods.createSuperSimpleToken(meta, startTime, isStealth);
      } else if (profile === 'BASIC' || profile === 'ADVANCED') {
        const baseParams = {
          name: b.name,
          symbol: b.symbol,
          totalSupply: totalSupplyWei.toString(10),
          tokenType,
          graduationCap: graduationCap.toString(10),
          lpLockDuration: lpLockDurationSec,
          burnLP,
          startTime,
          finalTaxRate: finalTaxRatePct,
          removeHeader,
        } as any;
        let staticParams: any;
        if (profile === 'ADVANCED') {
          const adv = curves.advanced;
          // Per client working example, static curve params should be zeroed for Advanced
          staticParams = {
            curveStartingTax: 0,
            curveTaxDuration: 0,
            curveMaxWallet: "0",
            curveMaxWalletDuration: 0,
            curveMaxTx: "0",
            curveMaxTxDuration: 0,
          } as any;

          // Ensure limitRemovalTime is after startTime by at least 60s
          const delta = Number(adv.removeAfter || 1800) || 1800;
          const minDelta = 60;
          const limitRemovalTime = startTime + Math.max(delta, minDelta);

          const advParams = {
            taxDropStep: this.percentStrToNumber(adv.taxStep || 0),
            taxDropInterval: this.clampDurationSeconds(adv.taxInterval, 60),
            maxWalletStep: this.toBaseUnitsFromTokens(adv.maxWStep),
            maxWalletInterval: this.clampDurationSeconds(adv.maxWInterval, 60),
            maxTxStep: this.toBaseUnitsFromTokens(adv.maxTStep),
            maxTxInterval: this.clampDurationSeconds(adv.maxTInterval, 60),
            limitRemovalTime,
          } as any;
          const taxWallet = (curves.advanced?.taxReceiver && this.web3.utils.isAddress(curves.advanced.taxReceiver))
            ? this.web3.utils.toChecksumAddress(curves.advanced.taxReceiver)
            : this.web3.utils.toChecksumAddress(this.account);

          methodName = isStealth ? 'createAdvancedTokenStealth' : 'createAdvancedToken';
          methodArgs = [baseParams, staticParams, advParams, taxWallet];
          methodCall = isStealth
            ? this.contract.methods.createAdvancedTokenStealth(baseParams, staticParams, advParams, taxWallet)
            : this.contract.methods.createAdvancedToken(baseParams, staticParams, advParams, taxWallet);
        } else {
          staticParams = {
            curveStartingTax: this.percentStrToNumber(curves.basic.startTax),
            curveTaxDuration: this.clampDurationSeconds(curves.basic.taxDuration, 1800),
            curveMaxWallet: this.maybePercentToBaseUnits(totalSupplyWei, curves.basic.maxWallet),
            curveMaxWalletDuration: this.clampDurationSeconds(curves.basic.maxWalletDuration, 1800),
            curveMaxTx: this.maybePercentToBaseUnits(totalSupplyWei, curves.basic.maxTx),
            curveMaxTxDuration: this.clampDurationSeconds(curves.basic.maxTxDuration, 1800),
          } as any;
          methodName = isStealth ? 'createBasicTokenStealth' : 'createBasicToken';
          methodArgs = [baseParams, staticParams];
          methodCall = isStealth
            ? this.contract.methods.createBasicTokenStealth(baseParams, staticParams)
            : this.contract.methods.createBasicToken(baseParams, staticParams);
        }
      } else {
        return { success: false, reason: `Unsupported profile: ${profile}` };
      }

      // Log what we're simulating
      try {
        console.groupCollapsed(`[KitchenCreate] simulate -> ${methodName}`);
        console.log('from:', this.account);
        console.log('to (Kitchen):', this.kitchenAddress);
        console.log('value (wei):', valueDecimalWei);
        console.log('args:', methodArgs);
        console.groupEnd();
      } catch {}

      // Try a static call (no state change). If it reverts, catch reason.
      await methodCall.call({ from: this.account, value: valueDecimalWei });
      return { success: true };
    } catch (err: any) {
      const reason = err?.data?.message || err?.reason || err?.message || 'Simulation failed';
      return { success: false, reason };
    }
  }
}
