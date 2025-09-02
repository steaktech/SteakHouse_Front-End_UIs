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
    value?: string
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
      const defaultGas = value ? WEB3_CONFIG.GAS.LIMITS.BUY_TOKEN : WEB3_CONFIG.GAS.LIMITS.SELL_TOKEN;
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
}
