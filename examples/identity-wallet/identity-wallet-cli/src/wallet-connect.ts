#!/usr/bin/env node

// wallet-connect.ts - CLI Tool to connect to Midnight Lace Wallet
// This script launches a local server to establish a connection
// with the Midnight Lace Wallet through the browser.

import http from 'http';
import { exec, spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import readline from 'readline';
import { createWalletConnectorHtml } from './wallet-connector.js';

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface for CLI interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Create a promise-based question function
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

// Define interface for wallet information
export interface WalletInfo {
  address: string;
  coinPublicKey: string;
  networkId: string;
}

// Path to store retrieved wallet credentials
const WALLET_CONFIG_PATH = path.join(process.env.HOME || process.env.USERPROFILE || '', '.midnight-wallet-cli.json');

// Function to open browser based on platform
function openBrowser(url: string): void {
  let command: string;
  let args: string[];
  
  switch (process.platform) {
    case 'darwin':
      command = 'open';
      args = [url];
      break;
    case 'win32':
      command = 'cmd.exe';
      args = ['/c', 'start', url];
      break;
    default:
      command = 'xdg-open';
      args = [url];
      break;
  }
  
  spawn(command, args, { detached: true }).unref();
  console.log(`Browser opened to ${url}`);
}

// Main function to connect to wallet
export async function connectToWallet(): Promise<WalletInfo> {
  // Check if we have existing credentials saved
  const credentialsPath = path.join(__dirname, '..', '.wallet-credentials.json');
  
  if (fs.existsSync(credentialsPath)) {
    try {
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      console.log('Found existing wallet credentials');
      
      // Ask if user wants to use existing credentials
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise<string>((resolve) => {
        rl.question('Use existing wallet credentials? (y/n): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() === 'y') {
        return credentials;
      }
    } catch (error) {
      console.error('Error reading credentials:', error);
    }
  }
  
  return new Promise<WalletInfo>(async (resolve, reject) => {
    console.log('\n===== Wallet Connection Options =====');
    console.log('1. Connect via browser (requires Midnight Lace wallet installed in Chrome)');
    console.log('2. Enter wallet details manually');
    console.log('====================================\n');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise<string>((resolve) => {
      rl.question('Choose an option (1 or 2): ', resolve);
    });
    
    if (answer === '2') {
      console.log('\n===== Manual Wallet Entry =====');
      const address = await new Promise<string>((resolve) => {
        rl.question('Enter wallet address: ', resolve);
      });
      
      if (!address) {
        rl.close();
        reject(new Error('Wallet address is required'));
        return;
      }
      
      console.log('\nNOTE: Coin Public Key is used for transaction signing.');
      console.log('If you do not have it, a dummy key will be used for testing purposes.');
      
      const coinPublicKey = await new Promise<string>((resolve) => {
        rl.question('Enter coin public key (leave empty for dummy key): ', resolve);
      });
      
      const finalCoinPublicKey = coinPublicKey || '0000000000000000000000000000000000000000000000000000000000000000';
      
      const walletInfo: WalletInfo = {
        address,
        coinPublicKey: finalCoinPublicKey,
        networkId: 'testnet'
      };
      
      // Save credentials to file
      fs.writeFileSync(credentialsPath, JSON.stringify(walletInfo, null, 2));
      console.log('Wallet credentials saved.');
      
      rl.close();
      resolve(walletInfo);
      return;
    }
    
    rl.close();
    
    // Create HTML content
    const html = createWalletConnectorHtml();
    
    // Create simple HTTP server
    const server = http.createServer((req, res) => {
      if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } 
      else if (req.url === '/api/wallet-info' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const walletInfo = JSON.parse(body);
            
            // Save credentials to file
            fs.writeFileSync(credentialsPath, JSON.stringify(walletInfo, null, 2));
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
            
            // Close server and resolve promise
            server.close(() => {
              console.log('Server closed');
              resolve(walletInfo);
            });
          } catch (error) {
            console.error('Error processing wallet info:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Invalid data format' }));
            reject(new Error('Invalid wallet info data'));
          }
        });
      } 
      else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    });
    
    // Start server
    const PORT = 3456;
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log('Opening browser to connect to wallet...');
      
      // Ask user if they want to open browser
      const rlBrowser = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rlBrowser.question('Open browser to connect to wallet? (y/n): ', (answer) => {
        rlBrowser.close();
        
        if (answer.toLowerCase() === 'y') {
          openBrowser(`http://localhost:${PORT}`);
        } else {
          console.log(`Please open your browser and navigate to http://localhost:${PORT}`);
        }
      });
      
      // Set timeout to allow for manual entry if browser connection fails
      setTimeout(async () => {
        console.log('\nNo wallet information received from browser.');
        console.log('Would you like to enter wallet details manually? (y/n): ');
        
        const rlTimeout = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise<string>((resolve) => {
          rlTimeout.question('', resolve);
        });
        
        if (answer.toLowerCase() === 'y') {
          const address = await new Promise<string>((resolve) => {
            rlTimeout.question('Enter wallet address: ', resolve);
          });
          
          if (!address) {
            rlTimeout.close();
            server.close();
            reject(new Error('Wallet address is required'));
            return;
          }
          
          console.log('\nNOTE: Coin Public Key is used for transaction signing.');
          console.log('If you do not have it, a dummy key will be used for testing purposes.');
          
          const coinPublicKey = await new Promise<string>((resolve) => {
            rlTimeout.question('Enter coin public key (leave empty for dummy key): ', resolve);
          });
          
          const finalCoinPublicKey = coinPublicKey || '0000000000000000000000000000000000000000000000000000000000000000';
          
          const walletInfo: WalletInfo = {
            address,
            coinPublicKey: finalCoinPublicKey,
            networkId: 'testnet'
          };
          
          // Save credentials to file
          fs.writeFileSync(credentialsPath, JSON.stringify(walletInfo, null, 2));
          console.log('Wallet credentials saved.');
          
          rlTimeout.close();
          server.close();
          resolve(walletInfo);
        } else {
          rlTimeout.close();
          server.close();
          reject(new Error('Wallet connection cancelled by user'));
        }
      }, 30000); // 30 seconds timeout
    });
  });
}

// Run the main function if this script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Starting Midnight Lace Wallet Connector...');
  console.log('This tool will help you connect to your wallet and retrieve the necessary information.');
  
  connectToWallet()
    .then(walletInfo => {
      console.log('\nWallet information retrieved successfully:');
      console.log('===========================================');
      console.log(`Address: ${walletInfo.address}`);
      console.log(`Coin Public Key: ${walletInfo.coinPublicKey}`);
      console.log(`Network: ${walletInfo.networkId}`);
      console.log('===========================================');
      console.log('\nYou can now use this information in the CLI.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Failed to connect to wallet:', error);
      process.exit(1);
    });
} 