import { NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { Config } from './config.js';
import type { IdentityWalletProviders } from './common-types.js';
import { type Logger } from 'pino';
import { execSync } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import os from 'os';
import http from 'http';
import open from 'open';
import { connectToWallet, type WalletInfo } from './wallet-connect.js';
import { fileURLToPath } from 'url';
// Import the required modules directly
import * as compactRuntime from '@midnight-ntwrk/compact-runtime';
import * as midnightJsContracts from '@midnight-ntwrk/midnight-js-contracts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
};

// Path to store wallet credentials
const WALLET_CONFIG_PATH = path.join(__dirname, '..', '.wallet-credentials.json');

// Load saved wallet credentials if they exist
const loadSavedWalletCredentials = () => {
  try {
    if (fs.existsSync(WALLET_CONFIG_PATH)) {
      const data = fs.readFileSync(WALLET_CONFIG_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Could not load saved wallet credentials:', error);
  }
  return null;
};

// Save wallet credentials for future use
const saveWalletCredentials = (credentials: { address: string, coinPublicKey?: string }) => {
  try {
    fs.writeFileSync(WALLET_CONFIG_PATH, JSON.stringify(credentials, null, 2));
    console.log('Wallet credentials saved for future use.');
  } catch (error) {
    console.log('Could not save wallet credentials:', error);
  }
};

// Create a simple HTML page for wallet connection
const createWalletConnectorHtml = () => {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Midnight Lace Wallet Connector</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
    }
    button {
      background-color: #4CAF50;
      color: white;
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin: 10px 0;
    }
    button:hover {
      background-color: #45a049;
    }
    pre {
      background-color: #f8f8f8;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    .status {
      margin: 20px 0;
      padding: 10px;
      border-radius: 4px;
    }
    .success {
      background-color: #dff0d8;
      color: #3c763d;
    }
    .error {
      background-color: #f2dede;
      color: #a94442;
    }
    .info {
      background-color: #d9edf7;
      color: #31708f;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Midnight Lace Wallet Connector</h1>
    <p>This page helps connect your CLI application to the Midnight Lace wallet.</p>
    
    <div class="status info" id="walletStatus">Checking for Midnight Lace wallet...</div>
    
    <div id="walletActions" style="display: none;">
      <button id="connectWallet">Connect Wallet</button>
      <button id="getNetworkId">Check Network</button>
      <button id="getAddresses">Get Addresses</button>
      <button id="copyDetails">Copy Details to CLI</button>
    </div>
    
    <div id="walletDetails" style="display: none;">
      <h3>Wallet Details</h3>
      <p>Address: <span id="walletAddress">-</span></p>
      <p>Coin Public Key: <span id="coinPublicKey">-</span></p>
      <p>Network: <span id="networkId">-</span></p>
    </div>
    
    <div id="instructions" style="display: none;">
      <h3>Instructions</h3>
      <p>Copy and paste the following details into your CLI:</p>
      <pre id="detailsForCli"></pre>
    </div>
  </div>

  <script>
    const walletStatus = document.getElementById('walletStatus');
    const walletActions = document.getElementById('walletActions');
    const walletDetails = document.getElementById('walletDetails');
    const instructions = document.getElementById('instructions');
    const connectWalletBtn = document.getElementById('connectWallet');
    const getNetworkIdBtn = document.getElementById('getNetworkId');
    const getAddressesBtn = document.getElementById('getAddresses');
    const copyDetailsBtn = document.getElementById('copyDetails');
    
    let walletAddress = '';
    let coinPublicKey = '';
    
    // Check if Midnight Lace wallet is available
    function checkWallet() {
      if (typeof window.midnightLace !== 'undefined') {
        walletStatus.textContent = 'Midnight Lace wallet detected!';
        walletStatus.className = 'status success';
        walletActions.style.display = 'block';
      } else {
        walletStatus.textContent = 'Midnight Lace wallet not found. Please make sure it is installed and enabled in your browser.';
        walletStatus.className = 'status error';
      }
    }
    
    // Connect to wallet
    connectWalletBtn.addEventListener('click', async () => {
      try {
        if (!window.midnightLace) {
          walletStatus.textContent = 'Midnight Lace wallet not found.';
          walletStatus.className = 'status error';
          return;
        }
        
        const isEnabled = await window.midnightLace.isEnabled();
        if (!isEnabled) {
          walletStatus.textContent = 'Enabling Midnight Lace wallet...';
          const enabled = await window.midnightLace.enable();
          if (!enabled) {
            walletStatus.textContent = 'Failed to enable Midnight Lace wallet.';
            walletStatus.className = 'status error';
            return;
          }
        }
        
        walletStatus.textContent = 'Wallet connected successfully!';
        walletStatus.className = 'status success';
        
        // Get network ID
        getNetworkIdBtn.click();
        
        // Get addresses
        getAddressesBtn.click();
      } catch (error) {
        walletStatus.textContent = 'Error connecting to wallet: ' + error.message;
        walletStatus.className = 'status error';
      }
    });
    
    // Get network ID
    getNetworkIdBtn.addEventListener('click', async () => {
      try {
        if (!window.midnightLace) {
          walletStatus.textContent = 'Midnight Lace wallet not found.';
          walletStatus.className = 'status error';
          return;
        }
        
        const networkId = await window.midnightLace.getNetworkId();
        document.getElementById('networkId').textContent = networkId;
        
        if (networkId !== 'testnet') {
          walletStatus.textContent = 'Warning: You are not connected to the Midnight Testnet. Please switch networks in your wallet.';
          walletStatus.className = 'status error';
        }
      } catch (error) {
        walletStatus.textContent = 'Error getting network ID: ' + error.message;
        walletStatus.className = 'status error';
      }
    });
    
    // Get addresses
    getAddressesBtn.addEventListener('click', async () => {
      try {
        if (!window.midnightLace) {
          walletStatus.textContent = 'Midnight Lace wallet not found.';
          walletStatus.className = 'status error';
          return;
        }
        
        const isEnabled = await window.midnightLace.isEnabled();
        if (!isEnabled) {
          walletStatus.textContent = 'Wallet not enabled. Please connect first.';
          walletStatus.className = 'status error';
          return;
        }
        
        let addresses = [];
        if (typeof window.midnightLace.getUsedAddresses === 'function') {
          addresses = await window.midnightLace.getUsedAddresses();
        } else if (typeof window.midnightLace.getRewardAddresses === 'function') {
          addresses = await window.midnightLace.getRewardAddresses();
        }
        
        if (addresses.length > 0) {
          walletAddress = addresses[0];
          document.getElementById('walletAddress').textContent = walletAddress;
          walletDetails.style.display = 'block';
          
          // Try to get coin public key
          if (typeof window.midnightLace.getCoinPublicKey === 'function') {
            coinPublicKey = await window.midnightLace.getCoinPublicKey();
            document.getElementById('coinPublicKey').textContent = coinPublicKey;
          }
        } else {
          walletStatus.textContent = 'No addresses found in wallet.';
          walletStatus.className = 'status error';
        }
      } catch (error) {
        walletStatus.textContent = 'Error getting addresses: ' + error.message;
        walletStatus.className = 'status error';
      }
    });
    
    // Copy details to CLI
    copyDetailsBtn.addEventListener('click', () => {
      const details = {
        address: walletAddress,
        coinPublicKey: coinPublicKey
      };
      
      document.getElementById('detailsForCli').textContent = JSON.stringify(details, null, 2);
      instructions.style.display = 'block';
      
      // Send details to server
      fetch('/wallet-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(details)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          walletStatus.textContent = 'Details sent to CLI successfully! You can close this window.';
          walletStatus.className = 'status success';
        }
      })
      .catch(error => {
        walletStatus.textContent = 'Error sending details to CLI: ' + error.message;
        walletStatus.className = 'status error';
      });
    });
    
    // Initialize
    window.addEventListener('load', checkWallet);
  </script>
</body>
</html>
  `;
};

// Create a wallet interface with Midnight Lace wallet
async function createMidnightLaceWallet(config: Config, logger: Logger) {
  logger.info('Setting up connection to Midnight Lace wallet (Chrome plugin v1.2.5)');
  
  console.log('\n========== MIDNIGHT LACE WALLET CONNECTION ==========');
  console.log('This application needs to connect to your Midnight Lace wallet.');
  console.log('Please ensure that:');
  console.log('1. You have Midnight Lace wallet v1.2.5 installed in Chrome');
  console.log('2. Your wallet is unlocked and ready to use');
  console.log('3. You are connected to the Midnight Testnet');
  
  try {
    // Use our new wallet connector
    const walletInfo = await connectToWallet();
    
    if (!walletInfo || !walletInfo.address) {
      throw new Error('Failed to get wallet information. Please ensure wallet is connected properly.');
    }
    
    logger.info(`Using wallet address: ${walletInfo.address}`);
    
    if (walletInfo.coinPublicKey) {
      logger.info(`Using coin public key: ${walletInfo.coinPublicKey}`);
    } else {
      logger.info('Using default dummy coin public key for testing');
    }
    
    // Create a wallet provider with the received information
    return {
      address: walletInfo.address,
      coinPublicKey: walletInfo.coinPublicKey || '0000000000000000000000000000000000000000000000000000000000000000',
      sign: async (message: Uint8Array) => {
        console.log('\nA signature is required from your wallet.');
        console.log('Please sign the message in your Midnight Lace wallet extension and provide the signature here.');
        console.log('Message to sign (hex):', Buffer.from(message).toString('hex'));
        
        const signature = await question('Signature (hex): ');
        return Buffer.from(signature, 'hex');
      },
      balanceTx: async (tx: any) => {
        console.log('\nTransaction needs to be balanced by your wallet.');
        console.log('Please balance the transaction in your Midnight Lace wallet extension.');
        console.log('Transaction data:', JSON.stringify(tx, null, 2));
        
        const balancedTxStr = await question('Balanced transaction (JSON): ');
        return JSON.parse(balancedTxStr);
      },
      submitTx: async (tx: any) => {
        console.log('\nTransaction needs to be submitted through your wallet.');
        console.log('Please submit the transaction in your Midnight Lace wallet extension.');
        console.log('Transaction data:', JSON.stringify(tx, null, 2));
        
        const txHash = await question('Transaction hash from submission: ');
        return txHash;
      },
      // Add zswapLocalState property required by the runtime
      zswapLocalState: {
        bytes: new Uint8Array(0),
        coins: [],
        coinPublicKey: {
          bytes: Buffer.from(walletInfo.coinPublicKey || '0000000000000000000000000000000000000000000000000000000000000000', 'hex')
        },
        currentIndex: 0,
        inputs: [],
        outputs: []
      }
    };
  } catch (error) {
    logger.error('Failed to set up wallet connection:', error);
    throw new Error('Wallet connection failed. Please ensure Midnight Lace wallet is installed and configured correctly.');
  }
}

/**
 * Create providers for the CLI application
 * @param walletInfo Wallet information
 * @param config Configuration object
 * @param logger Logger instance
 * @returns Promise resolving to providers object
 */
export const createProviders = async (
  walletInfo: WalletInfo | null,
  config: Config,
  logger: Logger
): Promise<IdentityWalletProviders> => {
  try {
    if (walletInfo) {
      // Create wallet provider with real wallet information
      logger.info('Creating wallet provider with provided wallet information...');
      logger.info(`Wallet address: ${walletInfo.address}`);
      
      // Create the wallet provider manually instead of using createMockWalletProviderForTestnet
      const walletProvider = {
        coinPublicKey: walletInfo.coinPublicKey,
        // Implement required WalletProvider methods
        balanceTx: async (tx: any, newCoins: any) => {
          logger.info('Balancing transaction...');
          // Simplified implementation - in a real scenario, this would properly balance the transaction
          return tx;
        },
        submitTx: async (tx: any) => {
          logger.info('Submitting transaction...');
          // Return a mock transaction ID (64 characters)
          return '0x' + Array(64).fill('0').join('');
        },
        // Add zswapLocalState that's needed by the SDK
        zswapLocalState: {
          bytes: new Uint8Array(0),
          coins: [],
          coinPublicKey: {
            bytes: Buffer.from(walletInfo.coinPublicKey || '00', 'hex')
          },
          currentIndex: 0,
          inputs: [],
          outputs: []
        },
        // Add initialized method required by the SDK
        initialized: async () => {
          logger.info('Wallet provider initialized');
          return true;
        }
      };
      
      logger.info('Creating Midnight provider...');
      // Create midnight provider manually
      const midnightProvider = {
        getChainInfo: async () => ({
          chainId: NetworkId.TestNet,
          genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3' // Testnet genesis hash
        }),
        submitTx: async (tx: any) => {
          logger.info('Submitting transaction to Midnight network...');
          // This would normally submit the tx to the network
          // For now, just return a transaction ID
          return '0x' + Array(64).fill('0').join('');
        }
      };
      
      // Create and initialize other providers
      logger.info('Creating ZK config provider...');
      // Create a simple ZK config provider
      const zkConfigProvider = {
        getZkConfig: async (circuitName: string) => {
          logger.info(`Getting ZK config for circuit: ${circuitName}`);
          // Return a minimal ZK config
          return {
            circuitName,
            config: {}
          };
        }
      };
      
      // Initialize the wallet provider
      logger.info('Initializing wallet provider...');
      await walletProvider.initialized();
      
      return {
        midnightProvider,
        zkConfigProvider,
        walletProvider
      };
    } else {
      // Using mock wallet (for development without real wallet)
      logger.info('Using mock wallet for testnet...');
      
      // Create mock wallet provider manually
      const walletProvider = {
        // Default mock wallet with a dummy coinPublicKey
        coinPublicKey: '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
        balanceTx: async (tx: any, newCoins: any) => {
          logger.info('Balancing transaction with mock wallet...');
          return tx;
        },
        submitTx: async (tx: any) => {
          logger.info('Submitting transaction with mock wallet...');
          return '0x' + Array(64).fill('0').join('');
        },
        zswapLocalState: {
          bytes: new Uint8Array(0),
          coins: [],
          coinPublicKey: {
            bytes: Buffer.from('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f', 'hex')
          },
          currentIndex: 0,
          inputs: [],
          outputs: []
        },
        initialized: async () => {
          logger.info('Mock wallet provider initialized');
          return true;
        }
      };
      
      logger.info('Creating Midnight provider...');
      const midnightProvider = {
        getChainInfo: async () => ({
          chainId: NetworkId.TestNet,
          genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3' // Testnet genesis hash
        }),
        submitTx: async (tx: any) => {
          logger.info('Submitting transaction to Midnight network with mock provider...');
          return '0x' + Array(64).fill('0').join('');
        }
      };
      
      logger.info('Creating ZK config provider...');
      const zkConfigProvider = (compactRuntime as any).createCompactRuntimeProvider(midnightProvider);
      
      // Initialize the mock wallet provider
      logger.info('Initializing mock wallet provider...');
      await walletProvider.initialized();
      
      return {
        midnightProvider,
        zkConfigProvider,
        walletProvider
      };
    }
  } catch (error) {
    logger.error('Error creating providers:', error);
    throw error;
  } finally {
    // Ensure readline interface is closed
    rl.close();
  }
}; 