const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const CONTRACT_NAMES = [
  'ethiopian_nationality_verification',
  'age_verification',
  'ethiopia_service_eligibility'
];

const BASE_DIR = path.resolve(__dirname, '..');
const CONTRACTS_DIR = path.join(BASE_DIR, 'contracts');
const OUTPUT_DIR = path.join(BASE_DIR, 'app', 'compiled-contracts');

// Define error interface
interface CompilerError extends Error {
  stderr?: string;
}

async function main() {
  console.log('Ethiopian Identity Wallet - Compact Contract Compiler');
  console.log('==================================================');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Check if Compactc is installed
  try {
    const { stdout } = await execAsync('compactc --version');
    console.log(`Using Compactc version: ${stdout.trim()}`);
  } catch (error) {
    console.warn('Warning: Compactc compiler not found. Using mock implementations.');
    createMockContracts();
    return; // Exit early with mock implementations
  }
  
  let hasCompilationErrors = false;
  
  // Compile each contract
  for (const contractName of CONTRACT_NAMES) {
    console.log(`\nCompiling ${contractName}...`);
    
    const contractPath = path.join(CONTRACTS_DIR, `${contractName}.compact`);
    
    if (!fs.existsSync(contractPath)) {
      console.error(`Contract file not found: ${contractPath}`);
      hasCompilationErrors = true;
      continue;
    }
    
    // Create a specific output directory for this contract
    const contractOutputDir = path.join(OUTPUT_DIR, contractName);
    if (!fs.existsSync(contractOutputDir)) {
      fs.mkdirSync(contractOutputDir, { recursive: true });
    }
    
    try {
      // Run the Compactc compiler with the correct syntax
      // compactc <source-pathname> <target-directory-pathname>
      const { stdout, stderr } = await execAsync(`compactc --skip-zk ${contractPath} ${contractOutputDir}`);
      
      if (stderr) {
        console.error(`Compilation warnings for ${contractName}:`);
        console.error(stderr);
      }
      
      console.log(`Successfully compiled ${contractName}`);
      console.log(`Output directory: ${contractOutputDir}`);
      
      // Copy the resulting CJS file to the root of the compiled-contracts directory with a .json extension
      // for compatibility with our existing code
      const cjsFilePath = path.join(contractOutputDir, `${contractName}.cjs`);
      if (fs.existsSync(cjsFilePath)) {
        const jsonFilePath = path.join(OUTPUT_DIR, `${contractName}.json`);
        fs.copyFileSync(cjsFilePath, jsonFilePath);
        console.log(`Copied output to: ${jsonFilePath}`);
      } else {
        console.error(`Error: Expected .cjs file was not created: ${cjsFilePath}`);
        hasCompilationErrors = true;
      }
    } catch (unknownError) {
      const error = unknownError as CompilerError;
      console.error(`Error compiling ${contractName}:`);
      console.error(error.message || 'Unknown error occurred');
      
      if (error.stderr) {
        console.error('Compiler output:');
        console.error(error.stderr);
      }
      
      hasCompilationErrors = true;
    }
  }
  
  console.log('\nCompilation process completed.');
  
  // If there were any compilation errors, use mock implementations
  if (hasCompilationErrors) {
    console.warn('\nWARNING: Some contracts failed to compile. Using mock implementations.');
    createMockContracts();
  }
}

// Function to create mock contract implementations
function createMockContracts() {
  console.log('Creating mock contract implementations...');
  
  for (const contractName of CONTRACT_NAMES) {
    const jsonFilePath = path.join(OUTPUT_DIR, `${contractName}.json`);
    
    // Create a mock contract JSON file
    const mockContract = {
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
    };
    
    // Write the mock contract to the file
    fs.writeFileSync(jsonFilePath, JSON.stringify(mockContract, null, 2));
    console.log(`Created mock implementation for ${contractName}`);
  }
  
  console.log('Mock implementations created successfully.');
}

main().catch((unknownError) => {
  const error = unknownError as Error;
  console.error('Unexpected error occurred:');
  console.error(error.message || String(unknownError));
  
  // Create mock implementations even if there's an error
  console.warn('Creating mock implementations due to error...');
  createMockContracts();
  
  // Don't exit with error to allow the application to start
  // process.exit(1);
}); 