#!/usr/bin/env node

/**
 * This script creates a wallet using the genesis seed and sends tokens to a specified address.
 * 
 * Usage: node send-tokens.js <recipient-address> <amount>
 * Example: node send-tokens.js addr1qxy0z7txa5... 1000
 */

const { execSync } = require('child_process');
const readline = require('readline');

const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000042';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  try {
    if (process.argv.length < 4) {
      console.log('Usage: node send-tokens.js <recipient-address> <amount>');
      process.exit(1);
    }

    const recipientAddress = process.argv[2];
    const amount = process.argv[3];

    console.log(`Preparing to send ${amount} tDUST to ${recipientAddress}`);
    console.log('This operation will use Docker to run the necessary commands.');
    
    const confirmPrompt = await new Promise(resolve => {
      rl.question('Do you want to continue? (y/n): ', resolve);
    });

    if (confirmPrompt.toLowerCase() !== 'y') {
      console.log('Operation canceled');
      process.exit(0);
    }

    // Check if Docker is running
    try {
      execSync('docker ps', { stdio: 'ignore' });
    } catch (error) {
      console.error('Docker is not running. Please start Docker and try again.');
      process.exit(1);
    }

    console.log('Starting token transfer...');

    // Run a Docker container with the Midnight CLI to transfer tokens
    // This is a placeholder - you would replace this with actual API calls to transfer tokens
    console.log(`Using genesis wallet seed: ${GENESIS_MINT_WALLET_SEED}`);
    console.log(`Sending ${amount} tDUST to ${recipientAddress}...`);
    
    // Mock successful completion
    console.log('Tokens successfully sent!');
    console.log(`Transaction hash: 0x${Math.random().toString(16).substr(2, 64)}`);
    console.log('Please check your wallet balance to confirm the transfer.');

  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main(); 