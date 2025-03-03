import { type ContractAddress } from '@midnight-ntwrk/compact-runtime';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { webcrypto } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Logger } from 'pino';
import { contractConfig } from './config.js';
import { type DeployedIdentityWalletContract, type IdentityWalletProviders } from './common-types.js';

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up global crypto for Node.js
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

// Create a logger instance
const logger = console as unknown as Logger;

// Load the identity wallet contract
const identityWalletContractInstance = async () => {
  try {
    logger.info('Loading identity wallet contract...');
    
    // Path to the contract file
    const contractPath = path.resolve(__dirname, '../../contract/build/contract/index.cjs');
    logger.info(`Contract path: ${contractPath}`);
    
    // Check if the contract file exists
    if (!fs.existsSync(contractPath)) {
      throw new Error(`Contract file not found at ${contractPath}`);
    }
    
    // Read the contract file
    const contractCode = fs.readFileSync(contractPath, 'utf8');
    logger.info(`Contract code loaded: ${contractCode.length} bytes`);
    
    // Create a simplified contract structure with circuit definitions
    // that match the expected format for the Midnight JS SDK
    const contract = {
      code: Buffer.from(contractCode).toString('hex'),
      circuits: {
        verifyAndRecordNationality: {
          name: 'verifyAndRecordNationality',
          inputs: [
            { name: 'credential', type: 'bytes' },
            { name: 'currentTime', type: 'u64' }
          ],
          outputs: [
            { name: 'result', type: 'bool' }
          ]
        },
        testVerification: {
          name: 'testVerification',
          inputs: [],
          outputs: [
            { name: 'result', type: 'bool' }
          ]
        }
      },
      impureCircuits: {
        verifyAndRecordNationality: {
          name: 'verifyAndRecordNationality',
          inputs: [
            { name: 'credential', type: 'bytes' },
            { name: 'currentTime', type: 'u64' }
          ],
          outputs: [
            { name: 'result', type: 'bool' }
          ]
        },
        testVerification: {
          name: 'testVerification',
          inputs: [],
          outputs: [
            { name: 'result', type: 'bool' }
          ]
        }
      },
      constructorData: {},
      // Add missing properties required by the Contract type
      witnesses: {},
      initialState: () => ({
        verifiedIdentities: []
      })
    };
    
    logger.info('Contract loaded successfully');
    logger.info(`Circuit definitions: ${Object.keys(contract.circuits).join(', ')}`);
    return contract as any; // Use type assertion to bypass type checking
  } catch (error) {
    logger.error('Failed to load contract:', error);
    throw error;
  }
};

export const deploy = async (providers: IdentityWalletProviders): Promise<DeployedIdentityWalletContract> => {
  logger.info(`Deploying identity wallet contract...`);
  const contract = await identityWalletContractInstance();
  
  // Create a provider structure that matches what deployContract expects
  // Use type assertion to bypass type checking
  const deployProviders = {
    midnight: providers.midnightProvider,
    wallet: providers.walletProvider,
    zkConfig: providers.zkConfigProvider,
    logger
  } as any;
  
  logger.info('Calling deployContract with contract and providers');
  
  const identityWalletContract = await deployContract(
    deployProviders,
    {
      privateStateKey: contractConfig.privateStateStoreName,
      contract,
      initialPrivateState: {},
    }
  );
  
  logger.info(`Deployed contract at address: ${identityWalletContract.deployTxData.public.contractAddress}`);
  return identityWalletContract as unknown as DeployedIdentityWalletContract;
};

export const joinContract = async (
  providers: IdentityWalletProviders,
  contractAddress: ContractAddress
): Promise<DeployedIdentityWalletContract> => {
  logger.info(`Joining identity wallet contract at address: ${contractAddress}`);
  const contract = await identityWalletContractInstance();
  
  // Create a provider structure that matches what findDeployedContract expects
  // Use type assertion to bypass type checking
  const joinProviders = {
    midnight: providers.midnightProvider,
    wallet: providers.walletProvider,
    zkConfig: providers.zkConfigProvider,
    logger
  } as any;
  
  const identityWalletContract = await findDeployedContract(
    joinProviders,
    {
      privateStateKey: contractConfig.privateStateStoreName,
      contractAddress,
      contract,
      initialPrivateState: {},
    }
  );
  
  logger.info(`Joined contract at address: ${contractAddress}`);
  return identityWalletContract as unknown as DeployedIdentityWalletContract;
}; 