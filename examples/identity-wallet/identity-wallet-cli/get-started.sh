#!/bin/bash

# Identity Wallet CLI - Getting Started Script
# This script helps users get started with the Identity Wallet CLI

# Text formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}=== Identity Wallet CLI - Getting Started ===${RESET}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${RESET}"
    echo -e "Please install Node.js v16 or later from https://nodejs.org/"
    exit 1
fi

# Check if Yarn is installed
if ! command -v yarn &> /dev/null; then
    echo -e "${RED}Error: Yarn is not installed.${RESET}"
    echo -e "Please install Yarn from https://yarnpkg.com/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
if [ $NODE_MAJOR_VERSION -lt 16 ]; then
    echo -e "${YELLOW}Warning: Node.js version $NODE_VERSION detected.${RESET}"
    echo -e "The Identity Wallet CLI requires Node.js v16 or later."
    echo -e "Please upgrade your Node.js installation."
    exit 1
fi

echo -e "${GREEN}✓ Node.js v$NODE_VERSION detected${RESET}"
echo -e "${GREEN}✓ Yarn detected${RESET}\n"

# Install dependencies
echo -e "${BOLD}Installing dependencies...${RESET}"
yarn install
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to install dependencies.${RESET}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed successfully${RESET}\n"

# Build the project
echo -e "${BOLD}Building the project...${RESET}"
yarn build
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to build the project.${RESET}"
    exit 1
fi
echo -e "${GREEN}✓ Project built successfully${RESET}\n"

# Wallet connection
echo -e "${BOLD}${BLUE}=== Wallet Connection ===${RESET}\n"
echo -e "Before using the CLI with the Midnight Lace Wallet, you need to connect to it."
echo -e "This will open a browser window where you can connect to your wallet and retrieve the necessary information."
echo -e "Make sure you have the Midnight Lace Wallet (v1.2.5 or later) installed in Chrome.\n"

read -p "Would you like to connect to your wallet now? (y/n): " CONNECT_WALLET
if [[ $CONNECT_WALLET == "y" || $CONNECT_WALLET == "Y" ]]; then
    echo -e "\n${BOLD}Connecting to wallet...${RESET}"
    yarn wallet-connect
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to connect to wallet.${RESET}"
        echo -e "You can try again later by running 'yarn wallet-connect'."
    else
        echo -e "${GREEN}✓ Wallet connection successful${RESET}\n"
    fi
else
    echo -e "\nYou can connect to your wallet later by running 'yarn wallet-connect'.\n"
fi

# Display available commands
echo -e "${BOLD}${BLUE}=== Available Commands ===${RESET}\n"
echo -e "${BOLD}1. Deploy a new contract:${RESET}"
echo -e "   ${YELLOW}yarn start deploy --wallet${RESET}\n"

echo -e "${BOLD}2. Join an existing contract:${RESET}"
echo -e "   ${YELLOW}yarn start join <contract-address> --wallet${RESET}\n"

echo -e "${BOLD}3. Test verification functionality:${RESET}"
echo -e "   ${YELLOW}yarn start verify <contract-address> --wallet${RESET}\n"

echo -e "${BOLD}4. Connect to wallet:${RESET}"
echo -e "   ${YELLOW}yarn wallet-connect${RESET}\n"

echo -e "${BOLD}${BLUE}=== Getting Help ===${RESET}\n"
echo -e "For more information, refer to the README.md file or run:"
echo -e "${YELLOW}yarn start --help${RESET}\n"

echo -e "${BOLD}${GREEN}You're all set! Happy coding!${RESET}\n" 