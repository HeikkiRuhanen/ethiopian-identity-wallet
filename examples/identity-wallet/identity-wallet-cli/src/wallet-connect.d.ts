// Type definitions for wallet-connect module

/**
 * Information retrieved from the Midnight Lace wallet
 */
export interface WalletInfo {
  /**
   * Wallet address
   */
  address: string;
  
  /**
   * Coin public key (may be undefined if not available)
   */
  coinPublicKey: string;
  
  /**
   * Network ID (e.g., "testnet")
   */
  networkId: string;
}

/**
 * Connects to the Midnight Lace wallet and retrieves wallet information
 * This function launches a web server to facilitate browser-based wallet connection
 * 
 * @returns A promise that resolves with wallet information
 */
export function connectToWallet(): Promise<WalletInfo>; 