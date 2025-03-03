"use client";

// Real implementation for Midnight Lace wallet integration
// Based on the Midnight wallet API

interface WalletAddress {
  id: string;
  address: string;
  isMock?: boolean;  // Added to support mock addresses
}

interface TokenMetadata {
  issuerPublicKey: string;
  issuerDID: string;
  subjectDID: string;
  verificationResult: string;
  verificationTimestamp: number;
  proofProtocol: string;
  type: string;
}

interface SoulBoundTokenCreation {
  tokenId: string;
  proofData: any;
  metadata: TokenMetadata;
  success: boolean;
  txHash?: string;
  error?: string;
  isMock?: boolean;  // Added to support mock tokens
  blockHeight?: number;
  timestamp?: number;
  contractAddress?: string;
}

// Define the interface for the wallet API
interface MidnightLaceWallet {
  apiVersion: string;
  name: string;
  isEnabled: () => Promise<boolean>;
  enable: () => Promise<boolean>;
  getNetworkId?: () => Promise<string>;
  getBalance?: () => Promise<number>;
  getChangeAddress?: () => Promise<string>;
  getAddresses?: () => Promise<string[]>;
  getUsedAddresses?: () => Promise<string[]>;
  getUnusedAddresses?: () => Promise<string[]>;
  mnLace?: {
    apiVersion: string;
    name: string;
    isEnabled: () => Promise<boolean>;
    enable: () => Promise<boolean>;
    getNetworkId?: () => Promise<string>;
    getBalance?: () => Promise<{ address: string; amount: string }[]>;
    getRewardAddresses?: () => Promise<string[]>;
    getUsedAddresses?: () => Promise<string[]>;
    getUtxos?: () => Promise<any[]>;
    submitTx?: (tx: any) => Promise<string>;
    signTx?: (tx: any, partialSign: boolean) => Promise<any>;
    signData?: (address: string, payload: string) => Promise<any>;
    experimental?: {
      createSoulBoundToken?: (params: {
        metadata: any;
        proofData: any;
      }) => Promise<{ txHash: string }>;
    };
  };
  createSoulBoundToken?: (params: {
    metadata: {
      tokenId: string;
      issuerPublicKey: string;
      issuerDID: string;
      subjectDID: string;
      verificationResult: string;
      verificationTimestamp: number;
      proofProtocol: string;
      type: string;
    },
    proofData: any;
  }) => Promise<{
    txHash: string;
    blockHeight?: number;
    timestamp?: number;
  }>;
  experimental?: {
    createSoulBoundToken?: (params: {
      metadata: {
        tokenId: string;
        issuerPublicKey: string;
        issuerDID: string;
        subjectDID: string;
        verificationResult: string;
        verificationTimestamp: number;
        proofProtocol: string;
        type: string;
      },
      proofData: any;
    }) => Promise<{
      txHash: string;
      blockHeight?: number;
      timestamp?: number;
    }>;
  };
  midnight?: {
    submitProof: (params: {
      sender: string;
      contractAddress: string;
      proofData: any;
      gasLimit: number;
      gasPrice: number;
    }) => Promise<{
      txHash: string;
      blockHeight?: number;
      timestamp?: number;
    }>;
  };
  submitTransaction?: (transaction: {
    type: string;
    contractAddress: string;
    function: string;
    arguments: any[];
  }) => Promise<{
    txHash: string;
    blockHeight?: number;
    timestamp?: number;
  }>;
}

declare global {
  interface Window {
    midnight: MidnightLaceWallet | undefined;
    midnightLace?: {
      mnLace?: {
        apiVersion: string;
        name: string;
        isEnabled: () => Promise<boolean>;
        enable: () => Promise<boolean>;
        getNetworkId?: () => Promise<string>;
        getBalance?: () => Promise<{ address: string; amount: string }[]>;
        getRewardAddresses?: () => Promise<string[]>;
        getUsedAddresses?: () => Promise<string[]>;
        getUtxos?: () => Promise<any[]>;
        submitTx?: (tx: any) => Promise<string>;
        signTx?: (tx: any, partialSign: boolean) => Promise<any>;
        signData?: (address: string, payload: string) => Promise<any>;
        experimental?: {
          createSoulBoundToken?: (params: {
            metadata: any;
            proofData: any;
          }) => Promise<{ txHash: string }>;
        };
      };
    };
  }
}

export class LaceWalletService {
  // Class property to track wallet state
  private static _walletState = {
    initialized: false,
    connecting: false,
    connectionAttempts: 0,
    lastError: '',
    apiVersion: '',
    name: '',
  };

  // Helper method to get the wallet API object (mnLace)
  private static getWalletApi() {
    // Check both possible namespaces and access the mnLace property
    if (window.midnight?.mnLace) {
      if (!this._walletState.initialized && window.midnight.mnLace) {
        this._walletState.initialized = true;
        this._walletState.apiVersion = window.midnight.mnLace.apiVersion || 'unknown';
        this._walletState.name = window.midnight.mnLace.name || 'unknown';
        console.log(`Wallet initialized: ${this._walletState.name} (${this._walletState.apiVersion})`);
      }
      return window.midnight.mnLace;
    }
    
    if (window.midnightLace?.mnLace) {
      if (!this._walletState.initialized && window.midnightLace.mnLace) {
        this._walletState.initialized = true;
        this._walletState.apiVersion = window.midnightLace.mnLace.apiVersion || 'unknown';
        this._walletState.name = window.midnightLace.mnLace.name || 'unknown';
        console.log(`Wallet initialized: ${this._walletState.name} (${this._walletState.apiVersion})`);
      }
      return window.midnightLace.mnLace;
    }
    
    return null;
  }

  // Get wallet state information
  static getWalletState() {
    // Force a check of the wallet to update properties
    const api = this.getWalletApi();
    return {
      ...this._walletState,
      isAvailable: !!api,
      hasEnableMethod: typeof api?.enable === 'function',
      hasIsEnabledMethod: typeof api?.isEnabled === 'function',
      hasGetAddressesMethod: typeof api?.getUsedAddresses === 'function' || 
                           typeof api?.getRewardAddresses === 'function',
      methods: api ? Object.keys(api).filter(key => typeof api[key as keyof typeof api] === 'function') : []
    };
  }

  // Check if the Lace wallet is available
  static async isWalletAvailable(): Promise<boolean> {
    try {
      console.log('Checking wallet availability...');
      
      // Log detailed wallet information for debugging
      const windowWallet = {
        hasMidnight: !!window.midnight,
        hasMidnightLace: !!window.midnightLace,
        midnightKeys: window.midnight ? Object.keys(window.midnight) : [],
        midnightLaceKeys: window.midnightLace ? Object.keys(window.midnightLace) : [],
        midnightMnLace: window.midnight?.mnLace ? Object.keys(window.midnight.mnLace) : [],
        midnightLaceMnLace: window.midnightLace?.mnLace ? Object.keys(window.midnightLace.mnLace) : []
      };
      
      console.log('Window wallet objects:', windowWallet);
      
      // Check if we can access the actual wallet API through mnLace
      const wallet = this.getWalletApi();
      const isAvailable = !!wallet;
      
      console.log('Wallet API available:', isAvailable);
      
      if (isAvailable && wallet) {
        console.log('Wallet API:', {
          apiVersion: wallet.apiVersion,
          name: wallet.name,
          methods: Object.keys(wallet).filter(key => typeof wallet[key as keyof typeof wallet] === 'function')
        });
      }
      
      return isAvailable;
    } catch (error) {
      console.error('Error checking wallet availability:', error);
      this._walletState.lastError = error instanceof Error ? error.message : String(error);
      return false;
    }
  }

  // Connect to the Lace wallet with timeout and retry logic
  static async connectWallet(maxAttempts = 3, timeout = 10000): Promise<boolean> {
    try {
      if (this._walletState.connecting) {
        console.log('Connection already in progress');
        return false;
      }
      
      this._walletState.connecting = true;
      this._walletState.connectionAttempts += 1;
      console.log(`Connecting to Lace wallet (attempt ${this._walletState.connectionAttempts})...`);
      
      // Get the wallet API
      const wallet = this.getWalletApi();
      
      if (!wallet) {
        this._walletState.lastError = 'Wallet API not found';
        this._walletState.connecting = false;
        console.error('Midnight Lace wallet API not found. Please install the extension.');
        return false;
      }

      // Check if the wallet has the expected methods
      if (typeof wallet.isEnabled !== 'function') {
        this._walletState.lastError = 'Missing isEnabled method';
        this._walletState.connecting = false;
        console.error('Wallet API is missing isEnabled method');
        return false;
      }

      if (typeof wallet.enable !== 'function') {
        this._walletState.lastError = 'Missing enable method';
        this._walletState.connecting = false;
        console.error('Wallet API is missing enable method');
        return false;
      }

      // Check if already enabled with timeout
      try {
        const isEnabledPromise = wallet.isEnabled();
        const isEnabled = await Promise.race([
          isEnabledPromise,
          new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('isEnabled timeout')), timeout)
          )
        ]);
        
        console.log('Wallet already connected:', isEnabled);
        
        if (isEnabled) {
          this._walletState.connecting = false;
          return true;
        }
      } catch (error) {
        console.warn('Error or timeout checking if wallet is enabled:', error);
        // Continue to enable, don't return here as the timeout might be temporary
      }

      // Request connection with timeout
      try {
        const enablePromise = wallet.enable();
        const enabled = await Promise.race([
          enablePromise,
          new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('enable timeout')), timeout)
          )
        ]);
        
        console.log('Wallet connection result:', enabled);
        this._walletState.connecting = false;
        return enabled;
      } catch (error) {
        console.error('Error or timeout enabling wallet:', error);
        this._walletState.lastError = error instanceof Error ? error.message : String(error);
        this._walletState.connecting = false;
        
        // Retry if we haven't exceeded max attempts
        if (this._walletState.connectionAttempts < maxAttempts) {
          console.log(`Retrying connection (${this._walletState.connectionAttempts}/${maxAttempts})`);
          return this.connectWallet(maxAttempts, timeout);
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      this._walletState.lastError = error instanceof Error ? error.message : String(error);
      this._walletState.connecting = false;
      return false;
    }
  }

  // Get the user's wallet address with fallback to mock addresses
  static async getWalletAddresses(): Promise<WalletAddress[]> {
    try {
      // Get wallet API
      const wallet = this.getWalletApi();
      
      if (!wallet) {
        console.error('Wallet API not available');
        return this.getMockAddresses(); // Fallback to mock addresses
      }

      // First check if we need to connect
      if (typeof wallet.isEnabled === 'function') {
        try {
          const isEnabledPromise = wallet.isEnabled();
          const isEnabled = await Promise.race([
            isEnabledPromise,
            new Promise<boolean>((_, reject) => 
              setTimeout(() => reject(new Error('isEnabled timeout')), 5000)
            )
          ]);
          
          if (!isEnabled && typeof wallet.enable === 'function') {
            try {
              const enablePromise = wallet.enable();
              const connected = await Promise.race([
                enablePromise,
                new Promise<boolean>((_, reject) => 
                  setTimeout(() => reject(new Error('enable timeout')), 5000)
                )
              ]);
              
              if (!connected) {
                console.warn('Failed to connect wallet, using mock addresses');
                return this.getMockAddresses();
              }
            } catch (error) {
              console.warn('Timeout or error enabling wallet, using mock addresses');
              return this.getMockAddresses();
            }
          }
        } catch (error) {
          console.error('Error checking or enabling wallet:', error);
          return this.getMockAddresses();
        }
      }

      // Try different methods to get addresses
      let addresses: string[] = [];
      let usesMockAddresses = false;
      
      if (typeof wallet.getUsedAddresses === 'function') {
        try {
          const addressPromise = wallet.getUsedAddresses();
          addresses = await Promise.race([
            addressPromise,
            new Promise<string[]>((_, reject) => 
              setTimeout(() => reject(new Error('getUsedAddresses timeout')), 5000)
            )
          ]);
          console.log('Got addresses using getUsedAddresses:', addresses);
        } catch (error) {
          console.error('Error or timeout getting used addresses:', error);
        }
      } 
      
      if (addresses.length === 0 && typeof wallet.getRewardAddresses === 'function') {
        try {
          const addressPromise = wallet.getRewardAddresses();
          addresses = await Promise.race([
            addressPromise,
            new Promise<string[]>((_, reject) => 
              setTimeout(() => reject(new Error('getRewardAddresses timeout')), 5000)
            )
          ]);
          console.log('Got addresses using getRewardAddresses:', addresses);
        } catch (error) {
          console.error('Error or timeout getting reward addresses:', error);
        }
      }

      if (!addresses || addresses.length === 0) {
        console.warn('No addresses found in wallet, using mock addresses');
        usesMockAddresses = true;
        addresses = [
          'addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
          'addr_test1qrp9xckpj3mqsa5dxghgmpnp7slmjgd5amzgpre8peixl8yehnmyj05gflm0ll0n7swx5f2kcsnp9t9xs3m8qm29z9wqeht9sl'
        ];
      }

      // Map addresses to the expected format
      return addresses.map((address, index) => ({
        id: `address-${index}`,
        address,
        isMock: usesMockAddresses
      }));
    } catch (error) {
      console.error('Error getting wallet addresses:', error);
      return this.getMockAddresses();
    }
  }

  // Get mock addresses for testing when wallet is not available
  static getMockAddresses(): WalletAddress[] {
    return [
      {
        id: 'mock-address-1',
        address: 'addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
        isMock: true
      },
      {
        id: 'mock-address-2',
        address: 'addr_test1qrp9xckpj3mqsa5dxghgmpnp7slmjgd5amzgpre8peixl8yehnmyj05gflm0ll0n7swx5f2kcsnp9t9xs3m8qm29z9wqeht9sl',
        isMock: true
      }
    ];
  }

  // Create a Soul Bound Token from a verified credential
  static async createSoulBoundToken(
    tokenId: string,
    proofData: any,
    credentialData?: any,
    contractAddress?: string
  ): Promise<SoulBoundTokenCreation> {
    try {
      // Get wallet API
      const wallet = this.getWalletApi();
      
      // Check if the wallet and experimental API are available
      if (!wallet || (!wallet.experimental?.createSoulBoundToken && !wallet.createSoulBoundToken)) {
        console.warn('Soul Bound Token creation not supported, using mock implementation');
        return this.createMockSoulBoundToken(tokenId, proofData, credentialData, contractAddress);
      }

      // Check if the wallet is connected
      let isEnabled = false;
      if (typeof wallet.isEnabled === 'function') {
        try {
          isEnabled = await wallet.isEnabled();
          if (!isEnabled && typeof wallet.enable === 'function') {
            const connected = await wallet.enable();
            if (!connected) {
              throw new Error('Failed to connect to wallet');
            }
            isEnabled = true;
          }
        } catch (error) {
          console.error('Error checking or enabling wallet:', error);
          return this.createMockSoulBoundToken(tokenId, proofData, credentialData, contractAddress);
        }
      }

      // If wallet is not enabled, return mock
      if (!isEnabled) {
        console.warn('Wallet not enabled, using mock implementation');
        return this.createMockSoulBoundToken(tokenId, proofData, credentialData, contractAddress);
      }

      console.log('Creating Soul Bound Token with data:', { tokenId, proofData, credentialData, contractAddress });

      // Create metadata object for the token
      const metadata: TokenMetadata = {
        issuerPublicKey: credentialData?.issuerPublicKey || '',
        issuerDID: credentialData?.issuerDID || '',
        subjectDID: credentialData?.subjectDID || '',
        verificationResult: 'verified',
        verificationTimestamp: Date.now(),
        proofProtocol: 'midnight-zk',
        type: credentialData?.type || 'EthiopianNationalityCredential',
      };

      // Add contract address if provided
      const tokenParams = {
        metadata: {
          tokenId,
          ...metadata
        },
        proofData,
        ...(contractAddress && { contractAddress })
      };

      // Determine which API to use
      let result;
      try {
        if (wallet.createSoulBoundToken) {
          // Call the direct API
          result = await wallet.createSoulBoundToken(tokenParams);
        } else if (wallet.experimental?.createSoulBoundToken) {
          // Call the experimental API
          result = await wallet.experimental.createSoulBoundToken(tokenParams);
        } else {
          // This shouldn't happen due to earlier checks, but just in case
          throw new Error('Soul Bound Token creation not supported by wallet');
        }

        console.log('Soul Bound Token creation result:', result);

        return {
          tokenId,
          proofData,
          metadata,
          success: true,
          txHash: result.txHash,
          ...(result.blockHeight && { blockHeight: result.blockHeight }),
          ...(result.timestamp && { timestamp: result.timestamp }),
          ...(contractAddress && { contractAddress })
        };
      } catch (error) {
        console.error('Error creating Soul Bound Token:', error);
        // If the real wallet API fails, fallback to the mock implementation
        return this.createMockSoulBoundToken(tokenId, proofData, credentialData, contractAddress);
      }
    } catch (error) {
      console.error('Error creating Soul Bound Token:', error);
      return this.createMockSoulBoundToken(tokenId, proofData, credentialData, contractAddress);
    }
  }

  // Create a mock Soul Bound Token for testing
  private static createMockSoulBoundToken(
    tokenId: string,
    proofData: any,
    credentialData?: any,
    contractAddress?: string
  ): SoulBoundTokenCreation {
    console.log('Creating mock Soul Bound Token for:', tokenId);
    
    const metadata: TokenMetadata = {
      issuerPublicKey: credentialData?.issuerPublicKey || '',
      issuerDID: credentialData?.issuerDID || '',
      subjectDID: credentialData?.subjectDID || '',
      verificationResult: 'verified',
      verificationTimestamp: Date.now(),
      proofProtocol: 'midnight-zk',
      type: credentialData?.type || 'EthiopianNationalityCredential'
    };
    
    return {
      tokenId,
      proofData,
      metadata,
      success: true,
      txHash: `mock-tx-${Date.now()}`,
      isMock: true,
      ...(contractAddress && { contractAddress })
    };
  }

  // Submit a proof to a smart contract
  static async submitProofToContract(
    contractAddress: string,
    proofData: any,
    credentialData?: any
  ): Promise<any> {
    try {
      // Get wallet API
      const wallet = this.getWalletApi();
      
      if (!wallet) {
        console.warn('Wallet API not available, using mock implementation');
        return {
          success: true,
          txHash: `mock-tx-${Date.now()}`,
          contractAddress,
          isMock: true
        };
      }

      // Check if the wallet is connected
      if (typeof wallet.isEnabled === 'function') {
        try {
          const isEnabled = await wallet.isEnabled();
          if (!isEnabled && typeof wallet.enable === 'function') {
            const connected = await wallet.enable();
            if (!connected) {
              throw new Error('Failed to connect to wallet');
            }
          }
        } catch (error) {
          console.error('Error checking or enabling wallet:', error);
        }
      }

      console.log('Submitting proof to contract:', { contractAddress, proofData });

      // Get the wallet addresses
      const addresses = await this.getWalletAddresses();
      if (!addresses || addresses.length === 0) {
        throw new Error('No wallet addresses available');
      }

      // Use the first address as the sender
      const senderAddress = addresses[0];
      
      // Prepare transaction parameters
      const txParams = {
        sender: senderAddress,
        contractAddress: contractAddress,
        proofData: proofData,
        // Add any other required parameters based on the contract's requirements
        gasLimit: 2000000, // Example gas limit
        gasPrice: 1000000  // Example gas price
      };

      // Check if the wallet has a submitProof method
      if (wallet.midnight && typeof wallet.midnight.submitProof === 'function') {
        try {
          // Call the wallet's submitProof method
          const result = await wallet.midnight.submitProof(txParams);
          
          return {
            success: true,
            txHash: result.txHash,
            contractAddress,
            blockHeight: result.blockHeight,
            timestamp: result.timestamp
          };
        } catch (submitError) {
          console.error('Error from wallet submitProof method:', submitError);
          throw submitError;
        }
      }
      
      // Fallback to a more generic transaction submission if specific method not available
      if (wallet.submitTransaction && typeof wallet.submitTransaction === 'function') {
        try {
          // Create a transaction object
          const transaction = {
            type: 'contract_call',
            contractAddress: contractAddress,
            function: 'verify_and_record_nationality',
            arguments: [proofData],
            // Add other required transaction parameters
          };
          
          const result = await wallet.submitTransaction(transaction);
          
          return {
            success: true,
            txHash: result.txHash,
            contractAddress,
            blockHeight: result.blockHeight,
            timestamp: result.timestamp
          };
        } catch (txError) {
          console.error('Error submitting transaction:', txError);
          throw txError;
        }
      }

      // If we reach here, no suitable method was found
      console.warn('No suitable method found in wallet for contract submission, using mock');
      return {
        success: true,
        txHash: `mock-tx-${Date.now()}`,
        contractAddress,
        isMock: true
      };
    } catch (error) {
      console.error('Error submitting proof to contract:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        isMock: false
      };
    }
  }
} 