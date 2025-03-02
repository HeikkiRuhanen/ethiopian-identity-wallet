#!/bin/bash

# Ethiopian Identity Wallet - Run Script

# Set colors for console output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Ethiopian Identity Wallet ===${NC}"
echo -e "Starting development environment..."

# Check if compactc is installed
if ! command -v compactc &> /dev/null; then
    echo -e "${RED}Error: compactc is not installed${NC}"
    echo "Please install compactc globally using:"
    echo "npm install -g @firmachain/compactc"
    exit 1
fi

# Check version
COMPACTC_VERSION=$(compactc --version)
echo -e "${BLUE}Found Compactc:${NC} $COMPACTC_VERSION"

# Check if directory exists
if [ ! -d "contracts" ]; then
    echo -e "${RED}Error: 'contracts' directory not found${NC}"
    echo "Please run this script from the identity-wallet project root directory"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p app/compiled-contracts

# Compile contracts
echo -e "\n${GREEN}=== Compiling Compact Contracts ===${NC}"
npx ts-node scripts/compile-contracts.ts

# Check if compilation was successful
if [ $? -ne 0 ]; then
    echo -e "\n${RED}Error during contract compilation${NC}"
    exit 1
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