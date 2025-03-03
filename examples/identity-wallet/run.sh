#!/bin/bash

# Ethiopian Identity Wallet - Run Script

# Set colors for console output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Ethiopian Identity Wallet ===${NC}"
echo -e "Starting development environment..."

# Check if compactc is installed
if ! command -v compactc &> /dev/null; then
    echo -e "${YELLOW}Warning: compactc is not installed${NC}"
    echo "The application will use mock implementations for contract compilation."
    echo "To install compactc globally, use: npm install -g @firmachain/compactc"
else
    # Check version
    COMPACTC_VERSION=$(compactc --version)
    echo -e "${BLUE}Found Compactc:${NC} $COMPACTC_VERSION"
fi

# Check if directory exists
if [ ! -d "contracts" ]; then
    echo -e "${RED}Error: 'contracts' directory not found${NC}"
    echo "Please run this script from the identity-wallet project root directory"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p app/compiled-contracts

# Attempt to compile contracts but don't fail if it doesn't work
echo -e "\n${GREEN}=== Compiling Compact Contracts ===${NC}"
npx ts-node scripts/compile-contracts.ts
COMPILE_EXIT_CODE=$?

if [ $COMPILE_EXIT_CODE -ne 0 ]; then
    echo -e "${YELLOW}Warning: Contract compilation had some issues${NC}"
    echo "The application will continue using mock implementations."
    
    # Ensure mock contract files exist
    if [ ! -f "app/compiled-contracts/ethiopian_nationality_verification.json" ]; then
        echo "Creating mock contract files..."
        npx ts-node -e "
        const fs = require('fs');
        const path = require('path');
        const OUTPUT_DIR = path.join(process.cwd(), 'app', 'compiled-contracts');
        const CONTRACT_NAMES = [
          'ethiopian_nationality_verification',
          'age_verification',
          'ethiopia_service_eligibility'
        ];
        
        for (const contractName of CONTRACT_NAMES) {
          const jsonFilePath = path.join(OUTPUT_DIR, \`\${contractName}.json\`);
          
          const mockContract = {
            name: contractName,
            bytecode: 'mock_bytecode',
            functions: [
              'verify_and_record_nationality', 
              'test_verification',
              'verify_and_record_age',
              'create_age_verification_proof',
              'test_age_verification',
              'verify_and_record_eligibility',
              'test_service_eligibility'
            ]
          };
          
          fs.writeFileSync(jsonFilePath, JSON.stringify(mockContract, null, 2));
          console.log(\`Created mock implementation for \${contractName}\`);
        }
        "
    fi
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "\n${GREEN}=== Installing dependencies ===${NC}"
    npm install
fi

# Run the Next.js application
echo -e "\n${GREEN}=== Starting Next.js application ===${NC}"
echo -e "The application will be available at ${BLUE}http://localhost:3000${NC}"
npm run dev 