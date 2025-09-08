/**
 * Utility functions for Ethereum address validation and normalization
 */

/**
 * Validates if a string is a valid Ethereum address
 * @param address - The address string to validate
 * @returns boolean indicating if the address is valid
 */
export function isValidEthereumAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Check if it matches the Ethereum address pattern (0x followed by 40 hexadecimal characters)
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
}

/**
 * Normalizes an Ethereum address to lowercase (checksum addresses are case-sensitive, 
 * but for most use cases we want to normalize to lowercase)
 * @param address - The address to normalize
 * @returns normalized address or null if invalid
 */
export function normalizeEthereumAddress(address: string): string | null {
  if (!isValidEthereumAddress(address)) {
    return null;
  }
  return address.toLowerCase();
}

/**
 * Formats an Ethereum address for display (shows first 6 and last 4 characters)
 * @param address - The address to format
 * @param showFullAddress - Whether to show the full address
 * @returns formatted address string
 */
export function formatEthereumAddress(address: string, showFullAddress: boolean = false): string {
  if (!isValidEthereumAddress(address)) {
    return 'Invalid Address';
  }
  
  if (showFullAddress) {
    return address;
  }
  
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Validates multiple Ethereum addresses
 * @param addresses - Array of addresses to validate
 * @returns object with valid and invalid addresses
 */
export function validateEthereumAddresses(addresses: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  
  addresses.forEach(address => {
    if (isValidEthereumAddress(address)) {
      valid.push(normalizeEthereumAddress(address)!);
    } else {
      invalid.push(address);
    }
  });
  
  return { valid, invalid };
}
