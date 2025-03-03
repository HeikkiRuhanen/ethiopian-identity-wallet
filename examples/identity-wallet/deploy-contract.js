const fs = require('fs');
const path = require('path');

// Configuration for the proof server
const PROOF_SERVER_URL = 'http://localhost:62805'; // Use the port from the Docker compose file
const CONTRACT_NAME = 'example_contract';

/**
 * Deploys a contract to the Midnight blockchain using the proof server
 */
async function deployContract() {
  console.log(`Deploying contract ${CONTRACT_NAME} to blockchain`);
  
  try {
    // First check if the proof server is running
    console.log(`Checking proof server at ${PROOF_SERVER_URL}/health`);
    const healthResponse = await fetch(`${PROOF_SERVER_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!healthResponse.ok) {
      throw new Error(`Proof server health check failed: ${healthResponse.status}`);
    }

    console.log('Proof server is running');
    const healthData = await healthResponse.text();
    console.log(`Health check response: ${healthData}`);

    // Get the contract source code
    // In a real implementation, this would be loaded from a file
    const contractSource = `
    // Example Compact contract
    export public owner: PublicKey;
    export ledger counter: Cell<Uint<32>>;

    export constructor(owner: PublicKey) {
      this.owner = owner;
      counter.write(0);
    }

    export function increment() {
      const current = counter.read();
      counter.write(current + 1);
    }
    `;

    // Send the contract deployment request to the proof server
    console.log('Sending contract deployment request to proof server');
    const deployResponse = await fetch(`${PROOF_SERVER_URL}/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: CONTRACT_NAME,
        source: contractSource
      }),
    });

    if (!deployResponse.ok) {
      const errorData = await deployResponse.text();
      throw new Error(`Deployment error! status: ${deployResponse.status}, message: ${errorData}`);
    }

    const result = await deployResponse.json();
    
    if (result.success && result.contractAddress) {
      console.log(`Contract ${CONTRACT_NAME} deployed successfully at address ${result.contractAddress}`);
      return {
        success: true,
        contractAddress: result.contractAddress
      };
    } else {
      console.error('Deployment failed:', result.error || 'Unknown error from proof server');
      return {
        success: false,
        error: result.error || 'Unknown error from proof server'
      };
    }
  } catch (error) {
    console.error('Error deploying contract:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute the deployment
deployContract()
  .then(result => {
    console.log('Deployment result:', result);
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Deployment failed with exception:', err);
    process.exit(1);
  }); 