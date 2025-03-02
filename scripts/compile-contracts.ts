import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CONTRACT_NAMES = [
  'ethiopian_nationality_verification',
  'age_verification',
  'ethiopia_service_eligibility'
];

const BASE_DIR = path.resolve(__dirname, '..');
const CONTRACTS_DIR = path.join(BASE_DIR, 'contracts');
const OUTPUT_DIR = path.join(BASE_DIR, 'app', 'compiled-contracts');

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
    console.error('Error: Compactc compiler not found. Please install it globally using:');
    console.error('npm install -g @firmachain/compactc');
    process.exit(1);
  }
  
  // Compile each contract
  for (const contractName of CONTRACT_NAMES) {
    console.log(`\nCompiling ${contractName}...`);
    
    const contractPath = path.join(CONTRACTS_DIR, `${contractName}.compact`);
    const outputPath = path.join(OUTPUT_DIR, `${contractName}.json`);
    
    if (!fs.existsSync(contractPath)) {
      console.error(`Contract file not found: ${contractPath}`);
      continue;
    }
    
    try {
      // Run the Compactc compiler
      const { stdout, stderr } = await execAsync(`compactc compile ${contractPath} --output ${outputPath} --format json`);
      
      if (stderr) {
        console.error(`Compilation warnings for ${contractName}:`);
        console.error(stderr);
      }
      
      console.log(`Successfully compiled ${contractName}`);
      
      // Verify the output file was created
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`Output file size: ${(stats.size / 1024).toFixed(2)} KB`);
      } else {
        console.error(`Error: Output file was not created: ${outputPath}`);
      }
    } catch (error: any) {
      console.error(`Error compiling ${contractName}:`);
      console.error(error.message);
      
      if (error.stderr) {
        console.error('Compiler output:');
        console.error(error.stderr);
      }
    }
  }
  
  console.log('\nCompilation process completed.');
}

main().catch((error: any) => {
  console.error('Unexpected error occurred:');
  console.error(error);
  process.exit(1);
}); 