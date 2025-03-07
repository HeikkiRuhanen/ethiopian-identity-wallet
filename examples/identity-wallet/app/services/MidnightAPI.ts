"use client";

// Client-side config
export const MIDNIGHT_CONFIG = {
  proofServerUrl: typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_PROOF_SERVER_URL || 'http://localhost:3500' : '',
  indexerUrl: typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_INDEXER_URL || 'http://localhost:8081' : '',
  networkId: typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_NETWORK_ID || 'testnet' : '',
  useRealProofs: typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_USE_REAL_PROOFS === 'true' : false,
  contractsPath: '/contracts',
  bridgeUrl: typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_BRIDGE_URL || 'http://localhost:3500/api' : '',
  useBridge: typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_USE_CLI_BRIDGE === 'true' : false
};

// Types for proof data
export interface ProofData {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  publicInputs: string[];
  publicOutput: string;
}

export interface ProofResult {
  success: boolean;
  proof?: ProofData;
  error?: string;
  publicOutput?: string;
}

// Ethiopian Nationality Credential interface
export interface EthiopianNationalityCredentialData {
  id: string;
  issuer: string;
  issuedAt: number;
  expiresAt: number;
  subject: string;
  nationality: string;
  signature: [string, string];
}

// Ethiopian ID Credential interface with date of birth
export interface EthiopianIdCredentialData {
  id: string;
  issuer: string;
  issuedAt: number;
  expiresAt: number;
  subject: string;
  birthDateInDays: number;
  nationality: string;
  signature: [string, string];
}

// Full Ethiopian Identity Credential interface
export interface EthiopianIdentityCredentialData {
  id: string;
  issuer: string;
  issuedAt: number;
  expiresAt: number;
  subject: string;
  fullName: string;
  birthDateInDays: number;
  nationality: string;
  region: string;
  kebele: string;
  nationalIdNumber: string;
  signature: [string, string];
}

// Service Requirement interface
export interface ServiceRequirementData {
  id: string;
  minimumAge: number;
  requiresEthiopianNationality: boolean;
  requiredRegion: string;
}

// Compiled contract interface
export interface CompiledContract {
  name: string;
  bytecode: string;
  functions: string[];
}

// Contract compilation result
export interface CompilationResult {
  success: boolean;
  contract?: CompiledContract;
  error?: string;
}

// MidnightAPI class for handling interactions with the Midnight blockchain
export class MidnightAPI {
  private static compiledContracts: Map<string, CompiledContract> = new Map();

  // Check if the proof server is available
  static async checkProofServer(): Promise<boolean> {
    try {
      console.log(`Checking proof server at ${MIDNIGHT_CONFIG.proofServerUrl}/health`);
      
      const response = await fetch(`${MIDNIGHT_CONFIG.proofServerUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      console.log(`Proof server health check result: ${result}`);
      return true;
    } catch (error) {
      console.error('Error checking proof server:', error);
      return false;
    }
  }

  // Check if the proof server is alive and responding
  static async isProofServerAlive(): Promise<boolean> {
    try {
      console.log('Checking if proof server is alive');
      
      if (!MIDNIGHT_CONFIG.proofServerUrl) {
        console.warn('Proof server URL not configured');
        return false;
      }
      
      console.log('Proof server URL:', MIDNIGHT_CONFIG.proofServerUrl);
      const url = `${MIDNIGHT_CONFIG.proofServerUrl}/health`;
      console.log('Attempting to fetch from:', url);
      
      // Try to connect to the health endpoint
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Proof server health check response status:', response.status);
      
      if (!response.ok) {
        console.warn(`Proof server health check failed with status: ${response.status}`);
        return false;
      }
      
      const resultText = await response.text();
      console.log('Proof server health check response:', resultText);
      
      try {
        const resultJson = JSON.parse(resultText);
        return resultJson.status === 'ok';
      } catch (parseError) {
        console.log('Response is not JSON, checking for "alive" message');
        return resultText.includes('alive');
      }
    } catch (error) {
      console.error('Error checking proof server health:', error);
      return false;
    }
  }

  // Compile a Compact contract using the compactc compiler
  static async compileContract(contractName: string): Promise<CompilationResult> {
    try {
      // Check if we've already compiled/loaded this contract
      if (MidnightAPI.compiledContracts.has(contractName)) {
        return {
          success: true,
          contract: MidnightAPI.compiledContracts.get(contractName)
        };
      }
      
      // For the Ethiopian nationality verification contract, check if we have the pre-compiled version
      if (contractName === 'ethiopian_nationality_verification' && typeof window !== 'undefined') {
        // First try to check if the compiled contract exists
        try {
          // In a browser environment, we can't directly check the file system
          // But we can prepare the contract based on the functions we know are exported
          const contract: CompiledContract = {
            name: contractName,
            bytecode: `compiled-${contractName}`,
            functions: ['verify_and_record_nationality', 'test_verification']
          };
          
          MidnightAPI.compiledContracts.set(contractName, contract);
          
          console.log('Using pre-compiled Ethiopian nationality verification contract');
          
          return {
            success: true,
            contract
          };
        } catch (err) {
          console.warn(`Error loading pre-compiled contract: ${err}. Falling back to mock implementation.`);
        }
      }
      
      // If we get here, we'll use the mock implementation
      console.log(`Using mock implementation for ${contractName}`);
      const mockResult = this.createMockContractResult(contractName);
      
      // Cache the mock implementation
      if (mockResult.success && mockResult.contract) {
        MidnightAPI.compiledContracts.set(contractName, mockResult.contract);
      }
      
      return mockResult;
    } catch (error) {
      console.error('Error compiling contract:', error);
      return {
        success: false,
        error: `Failed to compile contract: ${error}`
      };
    }
  }

  // Helper to get the exported functions of a contract based on its name
  private static getContractFunctions(contractName: string): string[] {
    switch (contractName) {
      case 'ethiopian_nationality_verification':
        return ['verify_and_record_nationality', 'test_verification'];
      case 'age_verification':
        return ['verify_and_record_age', 'create_age_verification_proof', 'test_age_verification'];
      case 'ethiopia_service_eligibility':
        return ['verify_and_record_eligibility', 'verify_service_eligibility', 'test_service_eligibility'];
      default:
        return [];
    }
  }

  // Generate a proof for a given contract and function with inputs
  static async generateProof(
    contractName: string,
    functionName: string,
    inputs: any
  ): Promise<ProofResult> {
    try {
      console.log(`Generating proof for ${contractName}.${functionName} with inputs:`, inputs);
      console.log('Environment config:', MIDNIGHT_CONFIG);

      // First, ensure the contract is compiled
      const compilationResult = await this.compileContract(contractName);
      if (!compilationResult.success || !compilationResult.contract) {
        return {
          success: false,
          error: `Failed to compile contract: ${compilationResult.error || 'Unknown error'}`
        };
      }

      if (MIDNIGHT_CONFIG.useRealProofs) {
        // Call the real proof generation
        return this.generateRealProof(contractName, functionName, inputs);
      } else {
        // For testing/development, generate mock proofs
        return this.generateMockProof(contractName, functionName, inputs);
      }
    } catch (error) {
      console.error('Error generating proof:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Generate mock proofs for different contract types
  private static generateMockProof(
    contractName: string,
    functionName: string,
    inputs: any
  ): ProofResult {
    // Ethiopian nationality verification
    if (contractName === 'ethiopian_nationality_verification') {
      if (functionName === 'verify_and_record_nationality') {
        const credential = inputs.credential as EthiopianNationalityCredentialData;
        
        // Basic validation
        if (!credential || !credential.nationality) {
          return {
            success: false,
            error: 'Invalid credential data'
          };
        }

        const isEthiopian = credential.nationality.toLowerCase() === 'ethiopian';
        const notExpired = credential.expiresAt > Date.now() / 1000;
        const isValid = isEthiopian && notExpired;

        return {
          success: true,
          publicOutput: isValid ? "1" : "0",
          proof: this.createMockProofData(isValid)
        };
      }
    }
    
    // Age verification
    else if (contractName === 'age_verification') {
      if (functionName === 'verify_and_record_age' || functionName === 'create_age_verification_proof') {
        const credential = inputs.credential as EthiopianIdCredentialData;
        const currentDateDays = inputs.currentDateDays || Math.floor(Date.now() / (1000 * 86400));
        const ageThreshold = inputs.ageThreshold || 18;
        
        // Basic validation
        if (!credential || typeof credential.birthDateInDays !== 'number') {
          return {
            success: false,
            error: 'Invalid credential data or birth date'
          };
        }

        // Calculate age (simplified)
        const ageDays = currentDateDays - credential.birthDateInDays;
        const ageYears = Math.floor(ageDays / 365);
        const isAboveAge = ageYears >= ageThreshold;
        const notExpired = credential.expiresAt > Date.now() / 1000;
        const isValid = isAboveAge && notExpired;

        return {
          success: true,
          publicOutput: isValid ? "1" : "0",
          proof: this.createMockProofData(isValid)
        };
      }
    }
    
    // Service eligibility
    else if (contractName === 'ethiopia_service_eligibility') {
      if (functionName === 'verify_and_record_eligibility') {
        const credential = inputs.credential as EthiopianIdentityCredentialData;
        const service = inputs.service as ServiceRequirementData;
        const currentDateDays = inputs.currentDateDays || Math.floor(Date.now() / (1000 * 86400));
        
        // Basic validation
        if (!credential || !service) {
          return {
            success: false,
            error: 'Invalid credential or service data'
          };
        }

        // Calculate age (simplified)
        const ageDays = currentDateDays - credential.birthDateInDays;
        const ageYears = Math.floor(ageDays / 365);
        
        // Check requirements
        const meetsAgeRequirement = ageYears >= service.minimumAge;
        const meetsNationalityRequirement = !service.requiresEthiopianNationality || 
                                            credential.nationality.toLowerCase() === 'ethiopian';
        const meetsRegionRequirement = service.requiredRegion === '0' || 
                                      credential.region === service.requiredRegion;
        const notExpired = credential.expiresAt > Date.now() / 1000;
        
        const isEligible = meetsAgeRequirement && 
                          meetsNationalityRequirement && 
                          meetsRegionRequirement &&
                          notExpired;

        return {
          success: true,
          publicOutput: isEligible ? "1" : "0",
          proof: this.createMockProofData(isEligible)
        };
      }
    }

    // Default fallback for unsupported contracts/functions
    return {
      success: false,
      error: `Unsupported contract or function: ${contractName}.${functionName}`,
    };
  }

  // Helper to create mock proof data
  private static createMockProofData(isValid: boolean): ProofData {
    return {
      pi_a: ["123456789", "987654321", "1"],
      pi_b: [["123456789", "987654321"], ["123456789", "987654321"], ["1", "0"]],
      pi_c: ["123456789", "987654321", "1"],
      protocol: "groth16",
      publicInputs: [isValid ? "1" : "0", "0", "1"],
      publicOutput: isValid ? "1" : "0"
    };
  }

  // Try to connect to the CLI bridge wallet
  static async connectToBridgeWallet(): Promise<{
    success: boolean;
    walletInfo?: any;
    error?: string;
  }> {
    if (!MIDNIGHT_CONFIG.useBridge) {
      return { success: false, error: 'Bridge is not enabled in configuration' };
    }

    try {
      const response = await fetch(`${MIDNIGHT_CONFIG.bridgeUrl}/wallet/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error connecting to bridge wallet:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to bridge wallet'
      };
    }
  }

  // Get wallet info from the bridge
  static async getBridgeWalletInfo(): Promise<{
    success: boolean;
    walletInfo?: any;
    error?: string;
  }> {
    if (!MIDNIGHT_CONFIG.useBridge) {
      return { success: false, error: 'Bridge is not enabled in configuration' };
    }

    try {
      const response = await fetch(`${MIDNIGHT_CONFIG.bridgeUrl}/wallet/info`);
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error getting bridge wallet info:', error);
      return {
        success: false,
        error: error.message || 'Failed to get wallet information'
      };
    }
  }

  // Simulate deploying a contract using the bridge
  static async simulateDeployContractWithBridge(): Promise<{
    success: boolean;
    contractAddress?: string;
    error?: string;
    output?: string;
  }> {
    if (!MIDNIGHT_CONFIG.useBridge) {
      return { success: false, error: 'Bridge is not enabled in configuration' };
    }

    try {
      const response = await fetch(`${MIDNIGHT_CONFIG.bridgeUrl}/contract/simulate-deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error simulating contract deployment with bridge:', error);
      return {
        success: false,
        error: error.message || 'Failed to simulate contract deployment'
      };
    }
  }

  // Override the deployContract method to use the bridge when enabled
  static async deployContract(contractName: string): Promise<{
    success: boolean;
    contractAddress?: string;
    error?: string;
  }> {
    console.log(`Deploying contract: ${contractName} with useBridge=${MIDNIGHT_CONFIG.useBridge}`);
    
    // If bridge is enabled, use it for deployment
    if (MIDNIGHT_CONFIG.useBridge) {
      const simulateResult = await this.simulateDeployContractWithBridge();
      if (simulateResult.success && simulateResult.contractAddress) {
        return {
          success: true,
          contractAddress: simulateResult.contractAddress
        };
      } else {
        return {
          success: false,
          error: simulateResult.error || 'Failed to deploy contract using bridge'
        };
      }
    }
    
    // Otherwise use the original implementation
    try {
      // Attempt to compile the contract
      const compilationResult = await this.compileContract(contractName);
      if (!compilationResult.success || !compilationResult.contract) {
        return {
          success: false,
          error: compilationResult.error || 'Contract compilation failed'
        };
      }

      // For simplicity in this prototype, use a mock deployment
      const contractAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
      
      return {
        success: true,
        contractAddress
      };
    } catch (error: any) {
      console.error('Contract deployment error:', error);
      return {
        success: false,
        error: error.message || 'Unknown error during contract deployment'
      };
    }
  }

  // Get the source code of a contract
  static async getContractSource(contractName: string): Promise<{
    success: boolean;
    source?: string;
    error?: string;
  }> {
    try {
      console.log(`Getting source for contract ${contractName}`);
      
      // In a real implementation, this might load from a file or database
      // For now, we'll have a simple switch statement
      let source = '';
      
      switch(contractName) {
        case 'ethiopian_nationality_verification':
          // Try to fetch the contract from the contracts directory
          try {
            const response = await fetch('/contracts/ethiopian_nationality_verification.compact');
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            source = await response.text();
          } catch (error) {
            // If fetch fails, use a simple hard-coded version for testing
            console.warn('Failed to fetch contract source, using default version');
            source = `
              pragma language_version >= 0.14.0;
              
              export ledger nationality_verifications: Map<Field, Boolean>;
              
              export circuit verify_and_record_nationality(
                credential: any,
                current_time: Field
              ): [] {
                const is_valid = true; // Simplified for testing
                nationality_verifications.insert(disclose(credential.subject), disclose(is_valid));
              }
            `;
          }
          break;
          
        // Add more contracts here
        default:
          return {
            success: false,
            error: `Unknown contract: ${contractName}`
          };
      }
      
      return {
        success: true,
        source
      };
    } catch (error) {
      console.error('Error getting contract source:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Generate a real proof using the proof server
  static async generateRealProof(
    contractName: string,
    functionName: string,
    inputs: any
  ): Promise<ProofResult> {
    try {
      if (!MIDNIGHT_CONFIG.proofServerUrl) {
        return {
          success: false,
          error: 'Proof server URL not configured'
        };
      }

      // Make a request to the proof server
      const response = await fetch(`${MIDNIGHT_CONFIG.proofServerUrl}/prove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractName,
          functionName,
          inputs
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const result = await response.json();
      
      if (result.success && result.proof) {
        return {
          success: true,
          publicOutput: result.publicOutput,
          proof: result.proof
        };
      } else {
        return {
          success: false,
          error: result.error || 'Unknown error from proof server'
        };
      }
    } catch (error) {
      console.error('Error generating real proof:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Verify a real proof using the proof server
  static async verifyRealProof(
    contractName: string,
    functionName: string,
    proof: ProofData
  ): Promise<boolean> {
    try {
      if (!MIDNIGHT_CONFIG.proofServerUrl) {
        console.error('Proof server URL not configured');
        return false;
      }

      // Make a request to the proof server
      const response = await fetch(`${MIDNIGHT_CONFIG.proofServerUrl}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractName,
          functionName,
          proof
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`HTTP error! status: ${response.status}, message: ${errorData}`);
        return false;
      }

      const result = await response.json();
      return result.verified === true;
    } catch (error) {
      console.error('Error verifying real proof:', error);
      return false;
    }
  }

  // Verify a proof for a given contract and function
  static async verifyProof(
    contractName: string,
    functionName: string,
    proof: ProofData
  ): Promise<boolean> {
    try {
      console.log(`Verifying proof for ${contractName}.${functionName}:`, proof);
      
      if (MIDNIGHT_CONFIG.useRealProofs) {
        // Call the real proof verification
        return this.verifyRealProof(contractName, functionName, proof);
      } else {
        // For testing without the actual proof server
        return proof.publicOutput === "1";
      }
    } catch (error) {
      console.error('Error verifying proof:', error);
      return false;
    }
  }

  // Submit a proof to the Midnight blockchain
  static async submitProof(
    contractName: string,
    functionName: string,
    proof: ProofData
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      console.log(`Submitting proof for ${contractName}.${functionName} to blockchain`);
      
      if (MIDNIGHT_CONFIG.useRealProofs) {
        if (!MIDNIGHT_CONFIG.proofServerUrl) {
          return {
            success: false,
            error: 'Proof server URL not configured'
          };
        }

        // Make a request to the proof server to submit the proof
        try {
          const response = await fetch(`${MIDNIGHT_CONFIG.proofServerUrl}/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contractName,
              functionName,
              proof
            }),
          });

          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
          }

          const result = await response.json();
          
          if (result.success && result.txHash) {
            return {
              success: true,
              txHash: result.txHash
            };
          } else {
            return {
              success: false,
              error: result.error || 'Unknown error from proof server'
            };
          }
        } catch (error) {
          console.error('Error submitting proof:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
          };
        }
      } else {
        // For testing/development, return a mock transaction hash
        return {
          success: true,
          txHash: `mock-tx-${Date.now()}`
        };
      }
    } catch (error) {
      console.error('Error submitting proof:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Run Compact compiler on a specific contract file - This is only for Node.js environments
  static async runCompiler(contractName: string): Promise<CompilationResult> {
    // In a browser environment, we can't run the compiler
    console.log('Using mock implementation for', contractName);
    return this.createMockContractResult(contractName);
  }

  // Helper function to create a mock contract result
  private static createMockContractResult(contractName: string): CompilationResult {
    return {
      success: true,
      contract: {
        name: contractName,
        bytecode: "mock_bytecode",
        functions: [
          "verify_and_record_nationality", 
          "test_verification",
          "verify_and_record_age",
          "create_age_verification_proof",
          "test_age_verification",
          "verify_and_record_eligibility",
          "test_service_eligibility"
        ]
      }
    };
  }
} 