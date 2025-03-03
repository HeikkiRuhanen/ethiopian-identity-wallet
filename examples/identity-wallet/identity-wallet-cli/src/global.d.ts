// Type definitions for Midnight Lace Wallet global interfaces

interface MidnightLaceWallet {
  enable: () => Promise<boolean>;
  getAccounts?: () => Promise<string[]>;
  getUsedAddresses?: () => Promise<string[]>;
  getRewardAddresses?: () => Promise<string[]>;
  getCoinPublicKey?: () => Promise<string>;
  getNetworkId?: () => Promise<string>;
  coinPublicKey?: string;
  publicKey?: string;
}

interface MidnightNamespace {
  mnLace?: MidnightLaceWallet;
}

declare global {
  interface Window {
    midnight?: MidnightNamespace;
    midnightLace?: MidnightLaceWallet;
  }
}

export {}; 