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
    console.log('🏭 Initializing KitchenService');
    console.log(`👤 Account: ${account}`);
    console.log(`🌐 Chain ID: ${chainId || WEB3_CONFIG.DEFAULT_CHAIN_ID}`);

    this.web3 = web3;
    this.account = account;
    this.chainId = chainId || WEB3_CONFIG.DEFAULT_CHAIN_ID;
    this.kitchenAddress = getKitchenAddress(this.chainId);
    
    console.log(`🏠 Kitchen Contract Address: ${this.kitchenAddress}`);
    
    // Debug network configuration
    const currentNetwork = getCurrentNetwork();
    console.log('🔍 Network Debug Info:', {
      configuredNetwork: currentNetwork.name,
      configuredChainId: currentNetwork.chainId,
      configuredCurrency: currentNetwork.nativeCurrency.symbol,
      actualChainId: this.chainId,
      chainIdMatch: this.chainId === currentNetwork.chainId,
      shouldShow: getCurrentCurrencySymbol()
    });
    
    // Validate contract address
    if (!this.kitchenAddress || this.kitchenAddress === 'undefined') {
      console.error('❌ Kitchen contract address not configured!');
      console.error('💡 Please set NEXT_PUBLIC_KITCHEN_CONTRACT_ADDRESS in your .env.local file');
      throw new Error('Kitchen contract address not configured');
    }
    
    if (!this.web3.utils.isAddress(this.kitchenAddress)) {
      console.error('❌ Invalid Kitchen contract address format:', this.kitchenAddress);
      throw new Error('Invalid Kitchen contract address format');
    }
    
    // Initialize contract instance
    this.contract = new this.web3.eth.Contract(KitchenABI, this.kitchenAddress);
    console.log('✅ Kitchen contract initialized');
    
    // Log current network for debugging
    this.logNetworkInfo();
  }

  /**
   * Log network information for debugging
   */
  private async logNetworkInfo() {
    try {
      const network = getCurrentNetwork();
      const networkId = await this.web3.eth.net.getId();
      const blockNumber = await this.web3.eth.getBlockNumber();
      
      console.log('🌐 Network Info:', {
        configuredNetwork: network.name,
        configuredChainId: network.chainId,
        currency: network.nativeCurrency.symbol,
        actualChainId: this.chainId,
        networkId: networkId.toString(),
        currentBlock: blockNumber.toString(),
        kitchenAddress: this.kitchenAddress,
        isCorrectNetwork: this.chainId === network.chainId
      });
      
      if (this.chainId !== network.chainId) {
        console.warn(`⚠️ Network mismatch! Expected ${network.name} (${network.chainId}), got chain ${this.chainId}`);
        console.log(`💡 To switch networks: Update ACTIVE_NETWORK in constants.ts or connect MetaMask to ${network.name}`);
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch network info:', error);
    }
  }

  /**
   * Get EIP-1559 gas fees with buffer for faster execution
   */
  private async get1559Fees(): Promise<GasFees> {
    console.log('⛽ Calculating EIP-1559 gas fees...');
    
    if (!this.web3) throw new Error("Web3 not initialized");

    // Use simple, safe gas pricing to avoid BigInt issues
    console.log('🔄 Using safe gas pricing for testnet');
    
    try {
      // Get current gas price from network
      const gasPrice = await this.web3.eth.getGasPrice();
      console.log(`📊 Current gas price: ${gasPrice} wei (${Number(gasPrice) / 1000000000} gwei)`);
      
      // Convert to reasonable numbers for EIP-1559
      const gasPriceGwei = Math.ceil(Number(gasPrice) / 1000000000);
      const priorityFeeGwei = Math.max(2, Math.ceil(gasPriceGwei * 0.1)); // 10% of gas price or 2 gwei minimum
      const maxFeeGwei = gasPriceGwei + priorityFeeGwei;
      
      // Convert back to wei (as numbers, then to hex properly)
      const priorityFeeWei = priorityFeeGwei * 1000000000;
      const maxFeeWei = maxFeeGwei * 1000000000;

      const fees = {
        maxPriorityFeePerGas: "0x" + priorityFeeWei.toString(16),
        maxFeePerGas: "0x" + maxFeeWei.toString(16),
      };

      console.log('💰 Safe gas fees calculated:', {
        priorityFee: `${priorityFeeGwei} gwei`,
        maxFee: `${maxFeeGwei} gwei`,
        priorityFeeHex: fees.maxPriorityFeePerGas,
        maxFeeHex: fees.maxFeePerGas
      });

      return fees;
    } catch (error) {
      console.error('❌ Gas price fetching failed:', error);
      console.log('🔄 Using ultra-safe fixed gas values');
      
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
    value?: string
  ): Promise<string> {
    console.log('⛽ Estimating gas limit...');
    console.log(`📋 Estimation params:`, {
      from: this.account,
      value: value || '0',
      to: this.kitchenAddress
    });
    
    try {
      // First check if we have enough balance for the transaction
      if (value) {
        const balance = await this.web3.eth.getBalance(this.account);
        const requiredValue = BigInt(value);
        const currentBalance = BigInt(balance);
        
        console.log(`💰 Balance check:`, {
          required: `${Number(requiredValue) / 1e18} ${getCurrentCurrencySymbol()}`,
          available: `${Number(currentBalance) / 1e18} ${getCurrentCurrencySymbol()}`,
          sufficient: currentBalance >= requiredValue
        });
        
        if (currentBalance < requiredValue) {
          console.warn('⚠️ Insufficient balance for transaction value alone');
          // Use default gas but let user know about balance issue
          const defaultGas = WEB3_CONFIG.GAS.LIMITS.BUY_TOKEN;
          console.log(`🔄 Using default gas limit due to balance: ${defaultGas}`);
          return this.web3.utils.toHex(defaultGas);
        }
      }
      
      const gasEstimate = await methodCall.estimateGas({ 
        from: this.account,
        ...(value && { value })
      });
      
      // Add 20% buffer to gas estimate for safety
      const gasWithBuffer = Math.floor(Number(gasEstimate) * 1.2);
      console.log(`📊 Gas estimate: ${gasEstimate}, with buffer: ${gasWithBuffer}`);
      
      return this.web3.utils.toHex(gasWithBuffer);
    } catch (error: any) {
      console.error('❌ Gas estimation failed:', error);
      
      // Check if it's an insufficient funds error
      if (error.message && error.message.includes('insufficient funds')) {
        console.warn('💸 Insufficient funds detected in gas estimation');
        console.log('💡 This might be because:');
        console.log('  1. Wallet balance is too low');
        console.log('  2. Contract requires minimum amount');
        console.log('  3. Gas price is too high');
        console.log('  4. Contract validation failed');
      }
      
      // Return appropriate default gas limit based on operation
      const defaultGas = value ? WEB3_CONFIG.GAS.LIMITS.BUY_TOKEN : WEB3_CONFIG.GAS.LIMITS.SELL_TOKEN;
      console.log(`🔄 Using default gas limit: ${defaultGas}`);
      return this.web3.utils.toHex(defaultGas);
    }
  }

  /**
   * Build Buy Token Transaction
   * Calls buyToken(address token) payable function from Kitchen contract
   */
  async buildBuyTokenTx(tokenAddress: string, ethAmount: string): Promise<UnsignedTransaction> {
    console.log('🔨 Building buy token transaction...');
    console.log(`🎯 Token: ${tokenAddress}`);
    console.log(`💰 ${getCurrentCurrencySymbol()} Amount: ${ethAmount}`);
    
    // 🔍 EARLY DEBUG: Check inputs and Web3 state
    console.log('🔬 Early Debug Check:', {
      ethAmountRaw: ethAmount,
      ethAmountType: typeof ethAmount,
      parsedFloat: parseFloat(ethAmount),
      isValidInput: !isNaN(parseFloat(ethAmount)) && parseFloat(ethAmount) > 0,
      tokenAddressValid: this.web3?.utils.isAddress(tokenAddress),
      web3Available: !!this.web3,
      accountSet: !!this.account,
      contractSet: !!this.contract
    });

    if (!this.web3 || !this.account || !this.contract) {
      throw new Error("Service not properly initialized - connect wallet first");
    }

    // Validate and format inputs
    const token = this.web3.utils.toChecksumAddress(tokenAddress);
    
    // Use simple math to avoid Web3 utils issues
    const ethAmountNum = parseFloat(ethAmount);
    const valueInWei = Math.floor(ethAmountNum * 1e18); // Use number, not string
    
    console.log(`✅ Formatted token address: ${token}`);
    console.log(`✅ Simple value conversion:`, {
      input: `${ethAmount} ${getCurrentCurrencySymbol()}`,
      ethAmountNum: ethAmountNum,
      valueInWei: valueInWei,
      isReasonable: ethAmountNum > 0 && ethAmountNum < 1000
    });
    
    const value = valueInWei;
    
    // Create method call for buyToken(address token)
    const methodCall = this.contract.methods.buyToken(token);
    const data = methodCall.encodeABI();
    
    console.log(`📝 Encoded function data: ${data.substring(0, 42)}...`);
    
    // Estimate gas and get fees
    const gas = await this.estimateGasLimit(methodCall, value.toString());
    const { maxFeePerGas, maxPriorityFeePerGas } = await this.get1559Fees();

    // Convert value to hex properly (value is already a number)
    const hexValue = "0x" + value.toString(16);
    
    console.log(`🔍 Hex conversion debugging:`, {
      originalValue: value,
      hexValue: hexValue,
      hexValueType: typeof hexValue,
      hexValueDecimal: parseInt(hexValue, 16),
      backToCurrency: `${parseInt(hexValue, 16) / 1e18} ${getCurrentCurrencySymbol()}`,
      isReasonable: true
    });

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

    console.log('✅ Buy transaction built successfully');
    console.log('📋 Transaction summary:', {
      from: transaction.from,
      to: transaction.to,
      value: `${ethAmount} ${getCurrentCurrencySymbol()} (${value} wei)`,
      gas: `${parseInt(gas, 16)} gas`,
      maxFeePerGas: `${parseInt(transaction.maxFeePerGas!, 16)} wei`,
      maxPriorityFeePerGas: `${parseInt(transaction.maxPriorityFeePerGas!, 16)} wei`,
      type: 'EIP-1559'
    });
    
    console.log('🔍 Raw transaction object being sent:', transaction);

    return transaction;
  }

  /**
   * Build Sell Token Transaction
   * Calls sellToken(address token, uint256 amount) function from Kitchen contract
   * Now accepts ETH amount and converts it to equivalent token amount
   */
  async buildSellTokenTx(tokenAddress: string, ethAmount: string): Promise<UnsignedTransaction> {
    console.log('🔨 Building sell token transaction...');
    console.log(`🎯 Token: ${tokenAddress}`);
    console.log(`💰 ${getCurrentCurrencySymbol()} Amount: ${ethAmount}`);

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
    
    console.log(`✅ Formatted token address: ${token}`);
    console.log(`✅ ETH to Token conversion:`, {
      inputEthAmount: ethAmount,
      parsedEthAmount: ethAmountNum,
      conversionRatio: `1 ${getCurrentCurrencySymbol()} = ${TOKEN_PER_ETH_RATIO} tokens`,
      calculatedTokenAmount: tokenAmountNum,
      amountInBaseUnits: amountInBaseUnits,
      finalAmount: amount,
      isValid: !isNaN(ethAmountNum) && ethAmountNum > 0
    });
    
    // Create method call for sellToken(address token, uint256 amount)
    const methodCall = this.contract.methods.sellToken(token, amount);
    const data = methodCall.encodeABI();
    
    console.log(`📝 Encoded function data: ${data.substring(0, 42)}...`);
    
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

    console.log('✅ Sell transaction built successfully');
    console.log('📋 Transaction summary:', {
      to: transaction.to,
      ethAmount: `${ethAmount} ${getCurrentCurrencySymbol()}`,
      calculatedTokenAmount: `${tokenAmountNum} tokens`,
      tokenAmountInBaseUnits: amount,
      gas: `${parseInt(gas, 16)} gas`,
      type: 'EIP-1559'
    });

    return transaction;
  }

  /**
   * Validate buy transaction parameters
   */
  validateBuyParams(tokenAddress: string, ethAmount: string): string | null {
    console.log('🔍 Validating buy parameters...');
    
    if (!tokenAddress || !this.web3.utils.isAddress(tokenAddress)) {
      const error = "Invalid token address provided";
      console.error(`❌ ${error}: ${tokenAddress}`);
      return error;
    }
    
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      const error = `Invalid ${getCurrentCurrencySymbol()} amount - must be greater than 0`;
      console.error(`❌ ${error}: ${ethAmount}`);
      return error;
    }

    try {
      // Test if the amount can be converted to wei
      this.web3.utils.toWei(ethAmount, "ether");
      console.log('✅ Buy parameters validation passed');
      return null;
    } catch (error) {
      const errorMsg = `Invalid ${getCurrentCurrencySymbol()} amount format`;
      console.error(`❌ ${errorMsg}:`, error);
      return errorMsg;
    }
  }

  /**
   * Validate sell transaction parameters
   * Now validates ETH amount instead of token amount
   */
  validateSellParams(tokenAddress: string, ethAmount: string): string | null {
    console.log('🔍 Validating sell parameters...');
    
    if (!tokenAddress || !this.web3.utils.isAddress(tokenAddress)) {
      const error = "Invalid token address provided";
      console.error(`❌ ${error}: ${tokenAddress}`);
      return error;
    }
    
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      const error = `Invalid ${getCurrentCurrencySymbol()} amount - must be greater than 0`;
      console.error(`❌ ${error}: ${ethAmount}`);
      return error;
    }

    try {
      // Test if the amount is a valid number
      const numAmount = parseFloat(ethAmount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Invalid number");
      }
      
      // Test if the amount can be converted to wei
      this.web3.utils.toWei(ethAmount, "ether");
      
      console.log('✅ Sell parameters validation passed', {
        inputEthAmount: ethAmount,
        numAmount: numAmount,
        note: `Will be converted to token amount using exchange rate`
      });
      return null;
    } catch (error) {
      const errorMsg = `Invalid ${getCurrentCurrencySymbol()} amount format: ${(error as Error).message}`;
      console.error(`❌ ${errorMsg}:`, error);
      return errorMsg;
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
}
