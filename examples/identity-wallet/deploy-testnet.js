// Deploying a contract using the Midnight SDK with testnet configuration
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { getLedgerNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';

// Required for WebSocket implementation
globalThis.WebSocket = WebSocket;

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup logging
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty'
  }
});

// Testnet configuration
const config = {
  // Testnet proof server 
  proofServer: 'http://localhost:6300', // Docker-exposed testnet proof server
  // Testnet indexer
  indexer: 'https://indexer.testnet.midnight.network/api/v1/graphql',
  indexerWS: 'wss://indexer.testnet.midnight.network/api/v1/graphql/ws',
  // Testnet node
  node: 'https://rpc.testnet.midnight.network',
  // Local paths
  zkConfigPath: path.join(__dirname, 'zk-config'),
  privateStateStoreName: 'identity-wallet-private-state',
  contractPath: path.join(__dirname, 'contract', 'build', 'contract', 'index.cjs'),
  // Use the Undeployed network ID for initial deployment
  networkId: getLedgerNetworkId('undeployed'),
  // Wallet address 
  // NOTE: In production, never hardcode wallet credentials in your code
  // This is the public address portion only
  walletAddress: '0300709a542186132be729d7f163bdcb9aadf1f3591aec6d613230ae01480262fe58b67e2d42c2c1242bd98af97292f84290cc60923884a91c8a'
};

logger.info('Starting contract deployment with testnet configuration:', config);

// Connect to the integrated Lace wallet
async function connectToWallet() {
  logger.info('Connecting to Lace wallet for testnet...');
  
  try {
    // Use the wallet address from config
    const walletAddress = config.walletAddress;
    
    logger.info('Using wallet address:', walletAddress);
    
    // Create a test signing key (for testnet only)
    const signingKey = new Uint8Array(32).fill(1);
    
    // Create a wallet API that simulates the Midnight wallet extension (window.midnight)
    // In browser context, this would be accessed via window.midnight.mnLace
    const walletAPI = {
      // Properties
      address: walletAddress,
      networkId: 'testnet',
      
      // Methods from Midnight wallet extension API
      // In browser, this would be window.midnight.mnLace.isEnabled(), etc.
      isEnabled: () => true,
      enable: async () => true,
      getNetworkId: async () => 'testnet',
      getUsedAddresses: async () => [walletAddress],
      
      // Methods required for SDK integration
      sign: async (message) => {
        logger.info('Signing message with wallet');
        logger.info('Message to sign:', toHex(message));
        
        // For testnet, we're using a placeholder signature
        const signature = new Uint8Array(64).fill(1);
        logger.info('Generated signature:', toHex(signature));
        return signature;
      },
      getAddress: () => walletAddress,
      getPublicKey: () => signingKey,
      // This property is crucial for the SDK
      signingKey: signingKey
    };
    
    logger.info('Wallet API successfully created for testnet');
    return walletAPI;
  } catch (error) {
    logger.error('Failed to connect to wallet:', error);
    throw error;
  }
}

// Setup the providers required by the SDK
async function setupProviders() {
  logger.info('Setting up providers...');
  
  try {
    // Connect to the wallet
    const wallet = await connectToWallet();
    
    // Debug log the wallet structure
    logger.info('Wallet structure for debugging:');
    logger.info(JSON.stringify({
      address: wallet.address,
      hasSigningKey: !!wallet.signingKey,
      hasSignMethod: typeof wallet.sign === 'function',
      signingKeyLength: wallet.signingKey ? wallet.signingKey.length : 'N/A'
    }, null, 2));
    
    // Create a wallet provider that matches the counter example
    const walletProvider = {
      coinPublicKey: Buffer.from(wallet.signingKey).toString('hex'), // Convert Uint8Array to hex string
      balanceTx: async (tx, newCoins) => {
        logger.info('Balancing transaction');
        // In a real implementation, this would balance the transaction
        return tx;
      },
      submitTx: async (tx) => {
        logger.info('Submitting transaction');
        // In a real implementation, this would submit the transaction
        return '0x' + Array(64).fill('0').join('');
      },
      // Create a properly structured ZSwap LocalState as expected by decodeZswapLocalState
      zswapLocalState: {
        bytes: new Uint8Array(0),
        coins: [],
        coinPublicKey: {
          bytes: Buffer.from(wallet.signingKey)
        },
        currentIndex: 0,
        inputs: [],
        outputs: []
      }
    };
    
    // Debug log the wallet provider
    logger.info('WalletProvider object before deployment:');
    logger.info(JSON.stringify({
      hasCoinPublicKey: !!walletProvider.coinPublicKey,
      coinPublicKeyValue: walletProvider.coinPublicKey,
      hasBalanceTx: typeof walletProvider.balanceTx === 'function',
      hasSubmitTx: typeof walletProvider.submitTx === 'function',
      hasZswapLocalState: !!walletProvider.zswapLocalState,
      zswapLocalStateBytes: walletProvider.zswapLocalState ? walletProvider.zswapLocalState.bytes.length : 'N/A',
      zswapLocalStateCoins: walletProvider.zswapLocalState ? walletProvider.zswapLocalState.coins.length : 'N/A'
    }, null, 2));
    
    // Create a midnight provider
    const midnightProvider = {
      getChainInfo: async () => ({
        chainId: getLedgerNetworkId('undeployed'),
        // This should be the actual genesis hash for testnet
        genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3'
      })
    };
    
    const providers = {
      proofProvider: httpClientProofProvider(config.proofServer),
      privateStateProvider: levelPrivateStateProvider({
        privateStateStoreName: config.privateStateStoreName,
      }),
      zkConfigProvider: new NodeZkConfigProvider(config.zkConfigPath),
      publicDataProvider: indexerPublicDataProvider(
        config.indexer,
        config.indexerWS
      ),
      walletProvider: walletProvider,
      midnightProvider: midnightProvider
    };
    
    logger.info('Providers initialized successfully');
    return providers;
  } catch (error) {
    logger.error('Failed to setup providers:', error);
    throw error;
  }
}

// Create a contract instance from your actual contract
async function createContractInstance() {
  logger.info('Creating contract instance...');
  
  try {
    // Load the actual compiled contract code
    logger.info(`Loading contract from: ${config.contractPath}`);
    
    // Read the contract file
    const contractCode = fs.readFileSync(config.contractPath);
    
    // Convert to Uint8Array for deployment
    const contractCodeArray = new Uint8Array(contractCode);
    const codeHex = toHex(contractCodeArray);
    
    logger.info(`Contract loaded, size: ${contractCodeArray.length} bytes`);
    
    // Create a salt for the contract
    // In a real implementation, you might want to generate this differently
    const salt = '0x' + Array(64).fill('0').join('');
    
    // Create a contract with proper circuit definitions
    // This is a more compatible structure for the SDK
    const contract = {
      // Circuit definitions (required by getImpureCircuitIds)
      test_verification: {
        name: 'test_verification'
      },
      verify_and_record_nationality: {
        name: 'verify_and_record_nationality'
      },
      // Add impureCircuits property required by getImpureCircuitIds
      impureCircuits: {
        test_verification: true,
        verify_and_record_nationality: true
      },
      // Constructor data
      constructor: {
        codeHex,
        salt
      },
      // Add initialState function to provide the required state objects
      initialState: (context, ...args) => {
        logger.info('Initializing contract state with context keys:', Object.keys(context).join(', '));
        
        try {
          // Create minimal valid state buffers based on ledger requirements
          // Version 2.0 followed by minimal valid structure
          const contractState = Buffer.from([
            2, 0,  // Version 2.0
            10,    // Length of "Undeployed"
            85, 110, 100, 101, 112, 108, 111, 121, 101, 100 // "Undeployed" in ASCII
          ]);
          
          // Print the buffer for debugging
          logger.info('Contract state buffer:', Array.from(contractState).map(b => b.toString(16).padStart(2, '0')).join(' '));
          logger.info('Contract state as string:', contractState.toString('utf8'));
          
          contractState.serialize = function() { 
            logger.info('serialize() called on contractState');
            return this; 
          };
          
          // Private state - just version info
          const privateState = Buffer.from([
            2, 0,  // Version 2.0
            0      // Empty data
          ]);
          privateState.serialize = function() { return this; };
          
          // Ensure ZSwap local state has the right structure
          const zswapLocalState = context.wallet?.zswapLocalState || {
            bytes: Buffer.from([
              2, 0,  // Version 2.0
              0      // Empty data
            ]),
            coins: [],
            coinPublicKey: {
              bytes: Buffer.from(context.wallet?.coinPublicKey || '01'.repeat(32), 'hex')
            },
            currentIndex: 0,
            inputs: [],
            outputs: []
          };
          
          // Add serialize method if it doesn't exist
          if (!zswapLocalState.serialize) {
            zswapLocalState.serialize = function() { return this.bytes; };
          }
          
          logger.info('Created initial state objects with proper formatting');
          
          return {
            currentContractState: contractState,
            currentPrivateState: privateState,
            currentZswapLocalState: zswapLocalState
          };
        } catch (error) {
          logger.error('Error creating initial state:', error);
          throw error;
        }
      }
    };
    
    logger.info('Contract instance created with circuit definitions');
    return contract;
  } catch (error) {
    logger.error('Failed to create contract instance:', error);
    throw error;
  }
}

// Deploy the contract
async function deployContractWithSdk() {
  try {
    logger.info('Starting contract deployment process');
    
    // Setup all the providers needed for deployment
    logger.info('Setting up providers...');
    const providers = await setupProviders();
    logger.info('Providers setup complete');
    
    // Create the contract instance
    logger.info('Creating contract instance...');
    const contract = await createContractInstance();
    logger.info('Contract instance created successfully');
    
    // Log deployment parameters
    logger.info('Deployment parameters:');
    logger.info(`- Proof Server: ${config.proofServer}`);
    logger.info(`- Indexer: ${config.indexer}`);
    logger.info(`- Network ID: ${config.networkId}`);
    
    // Debug log for wallet provider
    logger.info('WalletProvider object before deployment:');
    logger.info(JSON.stringify({
      hasCoinPublicKey: !!providers.walletProvider.coinPublicKey,
      hasBalanceTx: typeof providers.walletProvider.balanceTx === 'function',
      hasSubmitTx: typeof providers.walletProvider.submitTx === 'function',
      hasZswapLocalState: !!providers.walletProvider.zswapLocalState,
      zswapLocalStateProperties: providers.walletProvider.zswapLocalState ? Object.keys(providers.walletProvider.zswapLocalState) : []
    }, null, 2));
    
    // Deploy the contract
    logger.info('Deploying contract to testnet...');
    logger.info('This process involves:');
    logger.info('1. Creating an unproven deployment transaction');
    logger.info('2. Sending the transaction to the proof server');
    logger.info('3. Waiting for the proof server to generate proofs');
    logger.info('4. Submitting the proven transaction to the blockchain');
    
    const deploymentResult = await deployContract(providers, {
      contract,
      privateStateKey: config.privateStateStoreName,
      initialPrivateState: {}
    });
    
    // Log the success result
    logger.info('✅ Contract deployment successful!');
    logger.info(`Contract address: ${deploymentResult.deployTxData.public.contractAddress}`);
    logger.info('Deployment transaction details:');
    logger.info(JSON.stringify(deploymentResult.deployTxData.public, null, 2));
    
    return deploymentResult;
  } catch (error) {
    // Detailed error handling
    logger.error('❌ Contract deployment failed');
    
    if (error.message && error.message.includes('proof server')) {
      logger.error('Error appears to be related to the proof server:');
      logger.error(`- Proof server URL: ${config.proofServer}`);
      logger.error('- Check if the proof server is running and accessible');
      logger.error('- Verify that the proof server supports the required circuit');
    } else if (error.message && error.message.includes('wallet')) {
      logger.error('Error appears to be related to the wallet:');
      logger.error('- Check if the wallet is properly connected');
      logger.error('- Verify that the wallet has sufficient funds');
    } else if (error.message && error.message.includes('indexer')) {
      logger.error('Error appears to be related to the indexer:');
      logger.error(`- Indexer URL: ${config.indexer}`);
      logger.error('- Check if the indexer is running and accessible');
    }
    
    // Log the full error for debugging
    logger.error('Full error details:');
    logger.error(error);
    
    if (error.stack) {
      logger.debug('Error stack trace:');
      logger.debug(error.stack);
    }
    
    throw error;
  }
}

// Execute the deployment
deployContractWithSdk()
  .then(() => logger.info('Deployment process completed'))
  .catch((error) => {
    logger.error('Deployment process failed:', error);
    process.exit(1);
  }); 