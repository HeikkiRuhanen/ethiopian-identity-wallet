"use client";

// Constants for API configuration
const MIDNIGHT_CONFIG = {
  proofServerUrl: process.env.NEXT_PUBLIC_PROOF_SERVER_URL || "http://localhost:55207",
  indexerUrl: process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:55004",
  networkId: process.env.NEXT_PUBLIC_NETWORK_ID || "testnet",
  useRealProofs: process.env.NEXT_PUBLIC_USE_REAL_PROOFS === "true",
  contractsPath: "/contracts" // Path to the Compact contracts relative to project root
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

  // Compile a Compact contract using the compactc compiler
  static async compileContract(contractName: string): Promise<CompilationResult> {
    try {
      // If we already have this contract compiled, return it from cache
      if (this.compiledContracts.has(contractName)) {
        return {
          success: true,
          contract: this.compiledContracts.get(contractName)
        };
      }

      console.log(`Compiling contract: ${contractName}`);

      if (MIDNIGHT_CONFIG.useRealProofs) {
        // In a real application, call the compactc compiler
        // Using the Node.js child_process API to run the compiler
        // This would be executed on the server-side, not in the browser
        
        // For now, we'll return a mock response
        const mockContract: CompiledContract = {
          name: contractName,
          bytecode: "mock_bytecode_for_" + contractName,
          functions: this.getContractFunctions(contractName)
        };

        this.compiledContracts.set(contractName, mockContract);

        return {
          success: true,
          contract: mockContract
        };
      } else {
        // For testing without the actual compiler
        const mockContract: CompiledContract = {
          name: contractName,
          bytecode: "mock_bytecode_for_" + contractName,
          functions: this.getContractFunctions(contractName)
        };

        this.compiledContracts.set(contractName, mockContract);

        return {
          success: true,
          contract: mockContract
        };
      }
    } catch (error) {
      console.error('Error compiling contract:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
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
        // In a real implementation, this would call the Midnight proof server
        // For now, we'll use conditional logic based on the contract/function
        return this.generateMockProof(contractName, functionName, inputs);
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

  // Verify a proof for a given contract and function
  static async verifyProof(
    contractName: string,
    functionName: string,
    proof: ProofData
  ): Promise<boolean> {
    try {
      console.log(`Verifying proof for ${contractName}.${functionName}:`, proof);
      
      if (MIDNIGHT_CONFIG.useRealProofs) {
        // In a real implementation, this would call the Midnight proof server
        // For example:
        /*
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
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.verified === true;
        */
        
        // For now, we'll just simulate verification based on the proof
        return proof.publicOutput === "1";
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
        // In a real implementation, this would submit the proof to the blockchain
        // For example:
        /*
        const response = await fetch(`${MIDNIGHT_CONFIG.indexerUrl}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contractName,
            functionName,
            proof,
            networkId: MIDNIGHT_CONFIG.networkId
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return {
          success: true,
          txHash: result.txHash
        };
        */
        
        // For now, we'll just simulate a transaction hash
        return {
          success: true,
          txHash: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
        };
      } else {
        // For testing without the actual blockchain
        return {
          success: true,
          txHash: `mock_tx_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
        };
      }
    } catch (error) {
      console.error('Error submitting proof to blockchain:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Run Compact compiler on a specific contract file
  static async runCompiler(contractPath: string): Promise<CompilationResult> {
    try {
      console.log(`Running Compact compiler on ${contractPath}`);
      
      // In a browser environment, we would need to make a server-side call
      // This is just a placeholder for a server API that would run the command
      
      // Mock successful compilation
      return {
        success: true,
        contract: {
          name: contractPath.split('/').pop()?.replace('.compact', '') || '',
          bytecode: "mock_bytecode",
          functions: []
        }
      };
    } catch (error) {
      console.error('Error running compiler:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
} 