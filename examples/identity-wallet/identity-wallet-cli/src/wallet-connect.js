#!/usr/bin/env node

// wallet-connect.js - CLI Tool to connect to Midnight Lace Wallet
// This script launches a local server to establish a connection
// with the Midnight Lace Wallet through the browser.

import http from 'http';
import { exec } from 'child_process';
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
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

// Path to store retrieved wallet credentials
const WALLET_CONFIG_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.midnight-wallet-cli.json');

// Function to open browser
function openBrowser(url) {
  console.log(`Opening browser to: ${url}`);
  
  // Detect platform and open browser accordingly
  const platform = process.platform;
  
  let command;
  if (platform === 'darwin') {  // macOS
    command = `open "${url}"`;
  } else if (platform === 'win32') {  // Windows
    command = `start "" "${url}"`;
  } else {  // Linux and others
    command = `xdg-open "${url}"`;
  }
  
  exec(command, (error) => {
    if (error) {
      console.error('Failed to open browser automatically. Please open this URL manually:', url);
    }
  });
}

// Main function to start server and connect to wallet
async function connectToWallet() {
  console.log('\n===== Midnight Lace Wallet Connection Tool =====');
  console.log('This tool helps connect to your Midnight Lace wallet to retrieve the necessary information');
  console.log('for the Identity Wallet CLI.\n');
  
  // Check if previously saved credentials exist
  if (fs.existsSync(WALLET_CONFIG_PATH)) {
    const useExisting = await question('Found saved wallet credentials. Would you like to use them? (y/n): ');
    if (useExisting.toLowerCase() === 'y') {
      try {
        const credentials = JSON.parse(fs.readFileSync(WALLET_CONFIG_PATH, 'utf8'));
        console.log(`\nLoaded credentials for address: ${credentials.address}`);
        
        if (!credentials.coinPublicKey) {
          console.log('WARNING: No Coin Public Key found in saved credentials.');
          
          const useDummy = await question('Would you like to use a generic dummy key for testing? (y/n): ');
          if (useDummy.toLowerCase() === 'y') {
            credentials.coinPublicKey = '0000000000000000000000000000000000000000000000000000000000000000';
            console.log('Using generic dummy key.');
            
            // Save the updated credentials
            fs.writeFileSync(WALLET_CONFIG_PATH, JSON.stringify(credentials, null, 2));
          }
        }
        
        rl.close();
        return credentials;
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    }
  }
  
  // Start a simple HTTP server to host the wallet connector
  const PORT = 3456;
  let walletInfo = null;
  
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      // Serve the wallet connector HTML
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(createWalletConnectorHtml());
    } else if (req.url === '/api/wallet-info' && req.method === 'POST') {
      // Endpoint to receive wallet information from the browser
      let body = '';
      
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          
          if (data.address) {
            walletInfo = data;
            
            // Log the received information
            console.log('\nReceived wallet information:');
            console.log(`- Address: ${data.address}`);
            console.log(`- Coin Public Key: ${data.coinPublicKey || 'Not provided'}`);
            console.log(`- Network: ${data.networkId || 'Unknown'}`);
            
            // Save the credentials for future use
            fs.writeFileSync(WALLET_CONFIG_PATH, JSON.stringify(walletInfo, null, 2));
            console.log('\nCredentials saved for future use.');
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Wallet information received' }));
            
            // Close the server after receiving the information
            setTimeout(() => {
              console.log('\nClosing wallet connection tool...');
              server.close();
              rl.close();
            }, 1000);
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: false, 
              message: 'Invalid wallet information. Address is required.' 
            }));
          }
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Invalid JSON received' }));
        }
      });
    } else {
      // Handle 404
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  });
  
  // Start the server
  server.listen(PORT, () => {
    console.log(`\nWallet connection server started on port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    
    // Ask if we should open the browser
    question('\nAttempt to open browser to connect to wallet? (y/n): ')
      .then((answer) => {
        if (answer.toLowerCase() === 'y') {
          openBrowser(`http://localhost:${PORT}`);
        } else {
          console.log('\nPlease manually open the URL in a browser with the Midnight Lace wallet extension installed.');
        }
        
        console.log('\nWaiting for wallet connection...');
        console.log('(Connect your wallet in the browser, then copy the information back here)');
      });
  });
  
  // Handle manual entry if browser connection fails
  setTimeout(async () => {
    if (!walletInfo) {
      console.log('\nNo wallet information received yet. Would you like to enter details manually? (y/n): ');
      const useManual = await question('');
      
      if (useManual.toLowerCase() === 'y') {
        const address = await question('Enter wallet address: ');
        
        if (!address) {
          console.error('Wallet address is required.');
          rl.close();
          server.close();
          return;
        }
        
        console.log('\nNOTE: Coin Public Key is not directly visible in the wallet UI.');
        console.log('If you don\'t have it, you can use a generic dummy key for testing purposes.');
        
        const coinPublicKey = await question('Enter coin public key (leave empty for generic dummy key): ');
        const finalCoinPublicKey = coinPublicKey || '0000000000000000000000000000000000000000000000000000000000000000';
        
        walletInfo = {
          address,
          coinPublicKey: finalCoinPublicKey,
          networkId: 'testnet'
        };
        
        // Save the credentials for future use
        fs.writeFileSync(WALLET_CONFIG_PATH, JSON.stringify(walletInfo, null, 2));
        console.log('\nCredentials saved for future use.');
        
        server.close();
        rl.close();
      }
    }
  }, 30000);  // Wait 30 seconds before prompting for manual entry
  
  // Return a promise that resolves with the wallet information
  return new Promise((resolve) => {
    // Set up an interval to check if we have wallet info
    const checkInterval = setInterval(() => {
      if (walletInfo) {
        clearInterval(checkInterval);
        resolve(walletInfo);
      }
    }, 1000);
  });
}

// Run the main function if this script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  connectToWallet().then((walletInfo) => {
    if (walletInfo) {
      console.log('\nSuccessfully retrieved wallet information:');
      console.log(walletInfo);
    } else {
      console.error('\nFailed to retrieve wallet information.');
    }
    process.exit(0);
  }).catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export { connectToWallet }; 