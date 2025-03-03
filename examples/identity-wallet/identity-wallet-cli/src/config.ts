import path from 'path';
import { NetworkId } from '@midnight-ntwrk/midnight-js-network-id';

const currentDir = path.dirname(new URL(import.meta.url).pathname);

export const contractConfig = {
  privateStateStoreName: 'identity-wallet-state',
  zkConfigPath: path.resolve(currentDir, '../../contract/build/zk_config'),
  networkId: NetworkId.TestNet,
  networkConfigs: {
    networkStorageConfigs: {
      [NetworkId.TestNet]: {
        indexerRpcUrl: 'https://api.midnight.testnet.laguna-labs.com',
        indexerWsUrl: 'wss://api.midnight.testnet.laguna-labs.com',
      }
    }
  }
};

export interface Config {
  privateStateStoreName: string;
  zkConfigPath: string;
  networkId: NetworkId;
  networkConfigs: {
    networkStorageConfigs: {
      [key: string]: {
        indexerRpcUrl: string;
        indexerWsUrl: string;
      }
    }
  };
  indexer?: string;
  indexerWS?: string;
  proofServer?: string;
  midnightNodeUrl?: string;
  useWallet?: boolean;
}

export class TestnetRemoteConfig implements Config {
  privateStateStoreName: string;
  zkConfigPath: string;
  networkId: NetworkId;
  networkConfigs: {
    networkStorageConfigs: {
      [key: string]: {
        indexerRpcUrl: string;
        indexerWsUrl: string;
      }
    }
  };
  indexer?: string;
  indexerWS?: string;
  proofServer?: string;
  midnightNodeUrl: string;
  useWallet: boolean;
  
  constructor() {
    this.privateStateStoreName = contractConfig.privateStateStoreName;
    this.zkConfigPath = contractConfig.zkConfigPath;
    this.networkId = contractConfig.networkId;
    this.networkConfigs = contractConfig.networkConfigs;
    this.indexer = 'https://api.midnight.testnet.laguna-labs.com';
    this.indexerWS = 'wss://api.midnight.testnet.laguna-labs.com';
    this.proofServer = 'https://prover.midnight.testnet.laguna-labs.com';
    this.midnightNodeUrl = 'https://node.midnight.testnet.laguna-labs.com';
    this.useWallet = false; // Default to false, can be overridden
  }
} 