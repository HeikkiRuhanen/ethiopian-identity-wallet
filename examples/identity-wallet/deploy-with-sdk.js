// Deploying a contract using the Midnight SDK
import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { getLedgerNetworkId } from '@midnight-ntwrk/ledger';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { fileURLToPath } from 'url';

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

// Configuration based on the counter example
const config = {
  // Use the port we confirmed is working for the proof server
  proofServer: 'http://localhost:62805',
  indexer: 'http://localhost:8088/api/v1/graphql',
  indexerWS: 'ws://localhost:8088/api/v1/graphql/ws',
  node: 'http://localhost:9944',
  zkConfigPath: path.join(__dirname, 'zk-config'),
  privateStateStoreName: 'identity-wallet-private-state',
  // Use the undeployed network ID for local development
  networkId: getLedgerNetworkId('undeployed')
};

logger.info('Starting contract deployment with configuration:', config);

// Create a mock wallet for testing
// In a real scenario, you would use a proper wallet
const mockWallet = {
  address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
  sign: async (message) => {
    // Mock signature for testing purposes
    return new Uint8Array(64).fill(1);
  }
};

// Create a mock Midnight provider for testing
// In a real scenario, you would use a proper provider
const mockMidnightProvider = {
  getChainInfo: async () => ({
    chainId: config.networkId,
    genesisHash: '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3'
  })
};

// Create a simple contract instance
// In a real scenario, this would come from your compiled contract
const simpleContract = {
  constructor: {
    // Mock contract code - in a real scenario this would be your actual contract
    codeHex: '0x' + '00'.repeat(100),
    salt: '0x' + Array(64).fill('0').join('')
  }
};

// Setup the providers required by the SDK
async function setupProviders() {
  logger.info('Setting up providers...');
  
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
    wallet: mockWallet,
    midnightProvider: mockMidnightProvider
  };
  
  logger.info('Providers initialized successfully');
  return providers;
}

// Deploy the contract
async function deployContractWithSdk() {
  try {
    const providers = await setupProviders();
    
    logger.info('Deploying contract...');
    const deployedContract = await deployContract({
      contract: simpleContract,
      wallet: providers.wallet,
      proofProvider: providers.proofProvider,
      privateStateProvider: providers.privateStateProvider,
      zkConfigProvider: providers.zkConfigProvider,
      publicDataProvider: providers.publicDataProvider,
      midnightProvider: providers.midnightProvider
    });
    
    logger.info('Contract deployed successfully!');
    logger.info(`Contract address: ${deployedContract.address}`);
    return deployedContract;
  } catch (error) {
    logger.error('Contract deployment failed:');
    logger.error(error);
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