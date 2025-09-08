// lib/web3/services/transactionService.ts
import Web3 from "web3";

export interface TransactionResult {
  contractAddress: string | null;
  errors: string | null;
}

export interface TransactionCallbacks {
  onStatusUpdate?: (message: string) => void;
  onSuccess?: (contractAddress: string) => void;
  onError?: (error: string) => void;
}

/**
 * Waits for transaction confirmation with retry mechanism
 * @param web3 Web3 instance
 * @param txHash Transaction hash to monitor
 * @returns Promise with transaction result
 */
export const waitForTransactionConfirmation = async (
  web3: Web3, 
  txHash: string
): Promise<TransactionResult> => {
  console.log(`🔄 Awaiting confirmation for tx: ${txHash}`);

  const maxRetries = 10;
  const retryInterval = 5000; // 5 seconds
  let retryCount = 0;

  return new Promise((resolve) => {
    const checkReceipt = async () => {
      try {
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        console.log('📄 Transaction receipt:', receipt);

        if (receipt) {
          if (receipt.status) {
            console.log(`✅ Transaction confirmed: ${txHash}`);
            console.log(`📦 Contract/To Address: ${receipt.contractAddress || receipt.to}`);
            return resolve({ 
              contractAddress: receipt.contractAddress || receipt.to, 
              errors: null 
            });
          } else {
            console.log(`❌ Transaction failed: ${txHash}`);
            try {
              const tx = await web3.eth.getTransaction(txHash);
              const errorMessage = tx?.input || "Transaction reverted without reason.";
              console.log(`⚠️ Failed transaction details:`, tx);
              return resolve({ 
                contractAddress: null, 
                errors: `Transaction failed: ${errorMessage}` 
              });
            } catch (txError) {
              console.log(`🚨 Error retrieving failed tx details:`, txError);
              return resolve({
                contractAddress: null,
                errors: "Transaction failed. Unable to retrieve further details."
              });
            }
          }
        } else {
          throw new Error("Receipt not yet available");
        }
      } catch (error) {
        retryCount++;
        console.log(`⏳ Attempt ${retryCount}/${maxRetries}... waiting for confirmation`);
        console.log(`🔍 Checking transaction:`, error);

        if (retryCount < maxRetries) {
          setTimeout(checkReceipt, retryInterval);
        } else {
          console.log("⏰ Timeout: Max retries reached. No confirmation.");
          return resolve({
            contractAddress: null,
            errors: "Transaction not confirmed in expected time. Please verify on-chain manually."
          });
        }
      }
    };

    checkReceipt();
  });
};

/**
 * Signs and submits transaction using MetaMask
 * @param unsignedTx Unsigned transaction object
 * @param isDeploy Whether this is a contract deployment
 * @param callbacks Optional callback functions for status updates
 * @returns Transaction hash or null if failed
 */
export const signAndSubmitTransaction = async (
  unsignedTx: any,
  isDeploy: boolean = false,
  callbacks?: TransactionCallbacks
): Promise<string | null> => {
  console.log('🚀 Starting transaction submission process');
  console.log('📋 Transaction details:', unsignedTx);

  // Check if MetaMask is available
  if (!window.ethereum) {
    const error = "Please install MetaMask to sign and submit the transaction.";
    console.error('❌ MetaMask not found');
    callbacks?.onError?.(error);
    return null;
  }

  const web3 = new Web3(window.ethereum as any);
  
  try {
    console.log("🔐 Requesting account access...");
    callbacks?.onStatusUpdate?.("Requesting account access...");
    
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("✅ Account access granted");
    
    console.log("📤 Sending transaction request to MetaMask...");
    callbacks?.onStatusUpdate?.("Sending transaction to MetaMask...");

    // Prepare transaction parameters for MetaMask
    const transactionParameters = {
      from: unsignedTx.from,
      ...(unsignedTx.to && { to: unsignedTx.to }),
      ...(unsignedTx.data && { data: unsignedTx.data }),
      ...(unsignedTx.value && { value: unsignedTx.value }), // Already hex from kitchenService
      
      // Gas configuration - prefer EIP-1559 if available
      ...(unsignedTx.maxFeePerGas && unsignedTx.maxPriorityFeePerGas ? {
        maxFeePerGas: unsignedTx.maxFeePerGas,
        maxPriorityFeePerGas: unsignedTx.maxPriorityFeePerGas,
        type: "0x2", // EIP-1559
      } : {
        gasPrice: unsignedTx.gasPrice, // Already hex from kitchenService
      }),
      
      gas: unsignedTx.gas, // Already hex from kitchenService
    };

    console.log('📋 Formatted transaction parameters:', transactionParameters);
    
    // Debug the exact values being sent to MetaMask
    console.log('🔍 Value debugging:', {
      originalValue: unsignedTx.value,
      finalValue: transactionParameters.value,
      valueInETH: transactionParameters.value ? `${parseInt(transactionParameters.value, 16) / 1e18} ETH` : 'No value',
      maxFeePerGas: transactionParameters.maxFeePerGas,
      maxFeeInGwei: transactionParameters.maxFeePerGas ? `${parseInt(transactionParameters.maxFeePerGas, 16) / 1e9} gwei` : 'No fee',
      gas: transactionParameters.gas,
      gasDecimal: transactionParameters.gas ? parseInt(transactionParameters.gas, 16) : 'No gas'
    });

    // Submit transaction to MetaMask
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    console.log(`📤 Transaction submitted with hash: ${txHash}`);
    callbacks?.onStatusUpdate?.(`Transaction submitted: ${txHash}`);

    // Wait for confirmation
    console.log('⏳ Monitoring transaction confirmation...');
    const { contractAddress, errors } = await waitForTransactionConfirmation(web3, txHash);

    if (contractAddress) {
      const successMessage = isDeploy 
        ? `Contract Successfully deployed\nContract Address: ${contractAddress}`
        : "Transaction successful";
      
      console.log(`✅ ${successMessage}`);
      callbacks?.onStatusUpdate?.(successMessage);
      callbacks?.onSuccess?.(contractAddress);
      return contractAddress;
    } else {
      const errorMsg = `Transaction failed or contract address not found: ${errors}`;
      console.error(`❌ ${errorMsg}`);
      callbacks?.onStatusUpdate?.(errorMsg);
      callbacks?.onError?.(errorMsg);
      return null;
    }
  } catch (error: any) {
    const errorMsg = `Error: ${error.message || error.data?.message || 'Unknown error occurred'}`;
    //console.error('❌ Transaction submission failed:', error);
    callbacks?.onStatusUpdate?.(errorMsg);
    callbacks?.onError?.(errorMsg);
    return null;
  }
};

/**
 * Utility function to format transaction for logging
 * @param tx Transaction object
 * @returns Formatted string for logging
 */
export const formatTransactionForLog = (tx: any): string => {
  return `
🔍 Transaction Details:
  From: ${tx.from}
  To: ${tx.to || 'Contract Creation'}
  Value: ${tx.value || '0'} wei
  Gas: ${tx.gas}
  Gas Price: ${tx.gasPrice || tx.maxFeePerGas || 'Unknown'}
  Data: ${tx.data ? `${tx.data.substring(0, 10)}...` : 'None'}
  `;
};
