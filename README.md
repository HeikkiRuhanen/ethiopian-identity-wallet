# Ethiopian Identity Wallet

A decentralized identity wallet application for Ethiopian citizens that leverages privacy-preserving smart contracts to verify nationality and creates Soul Bound Tokens as proof of verification.

## Features

- **Privacy-Preserving Nationality Verification**: Verify Ethiopian nationality without revealing sensitive personal data
- **Soul Bound Token Creation**: Generate non-transferable tokens that prove nationality verification
- **Smart Contract Integration**: Uses Compact language smart contract for secure, on-chain verification
- **Credential Management**: View and manage verifiable credentials for Ethiopian identity
- **Zero-Knowledge Proofs**: Generate and verify proofs using the Midnight proof system
- **Enhanced Wallet Integration**: Robust connection with Midnight Lace wallet with fallback mechanisms

## Smart Contract

The project uses a single Compact smart contract:

**Ethiopian Nationality Verification**: Verifies a user's Ethiopian citizenship without revealing their personal information. The contract includes:
- A ledger for storing nationality verification statuses
- A structure for Ethiopian nationality credentials
- Functions to verify the validity of credentials and authorization of issuers
- A main function to verify and record nationality status

## Prerequisites

- Node.js 16+
- npm 8+
- Compactc 0.21.0+ (Compact language compiler)
- Docker (for running Midnight infrastructure)
- Midnight Lace Wallet extension (v1.2.5+)

## Installation

1. Install global dependencies:
   ```bash
   npm install -g @firmachain/compactc
   ```

2. Clone the repository and navigate to the project directory:
   ```bash
   cd examples/identity-wallet
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_PROOF_SERVER_URL=http://localhost:<port>
   NEXT_PUBLIC_INDEXER_URL=http://localhost:<port>
   NEXT_PUBLIC_NODE_URL=http://localhost:<port>
   NEXT_PUBLIC_NETWORK_ID=undeployed
   NEXT_PUBLIC_LACE_ENABLED=true
   NEXT_PUBLIC_USE_REAL_PROOFS=true
   ```

## Running Midnight Infrastructure

The application requires the Midnight blockchain infrastructure:

1. Start the Docker containers:
   ```bash
   docker-compose up -d
   ```

2. Verify the containers are running:
   ```bash
   ./scripts/check-docker.sh
   ```

3. Update `.env.local` with the correct ports from Docker:
   ```bash
   docker port counter-proof-server  # For NEXT_PUBLIC_PROOF_SERVER_URL
   docker port counter-indexer       # For NEXT_PUBLIC_INDEXER_URL
   docker port counter-node          # For NEXT_PUBLIC_NODE_URL
   ```

## Quick Start

The easiest way to run the application is using npm:

```bash
npm run dev
```

This will start the Next.js development server, and the application will be available at http://localhost:3000.

## Using the Application

1. **Install the Midnight Lace Wallet**:
   - Download the Midnight Lace wallet extension (v1.2.5 or later)
   - Unzip and load it as an unpacked extension in Chrome
   - Enable Developer mode in Chrome extensions
   - Configure the wallet to use the same endpoints as in `.env.local`

2. **Connect Your Wallet**:
   - Click the "Connect Wallet" button in the application
   - Approve the connection request in the wallet extension
   - The wallet addresses will be displayed if connected successfully
   - If the wallet is unavailable, mock addresses will be shown

3. **View Available Credentials**:
   - Navigate to the Credential Manager
   - View the mock Ethiopian Identity credentials
   - Each credential includes nationality verification details

4. **Generate Proofs and Create Soul Bound Tokens**:
   - Navigate to the Proof Generator
   - Select an Ethiopian nationality credential
   - Generate a zero-knowledge proof
   - Create a Soul Bound Token containing:
     - Issuer's public key
     - Issuer's DID
     - Subject's DID
     - Verification result
     - Proof protocol details

## Troubleshooting Wallet Connection

If you encounter issues connecting to the wallet:

1. **Check Wallet Extension**:
   - Ensure the Midnight Lace wallet is properly installed
   - Verify the extension is enabled in Chrome
   - Check the wallet is configured for the correct network

2. **Check Docker Services**:
   - Verify all Docker containers are running
   - Make sure ports are correctly configured in `.env.local`

3. **Use the Diagnostic Tools**:
   - The WalletDebug component shows detailed wallet state
   - The wallet-test.html page provides browser-level diagnostics
   - Check browser console for any error messages

## Development

### Directory Structure

- `/app`: Next.js application code
  - `/components`: React components including ProofGenerator and CredentialManager
  - `/services`: Service classes for API interactions
    - `MidnightAPI.ts`: Handles proof generation and verification
    - `LaceWalletService.ts`: Wallet integration service
    - `VerifiableCredentialService.ts`: Manages credentials
  - `/types`: TypeScript type definitions
  - `/compiled-contracts`: Compiled contract output
- `/contracts`: Compact language smart contract
- `/scripts`: Helper scripts for development and testing
- `/public`: Static assets and diagnostic tools

### Recent Improvements

1. **Enhanced Wallet Integration**:
   - Robust connection handling with timeout and retry logic
   - Fallback to mock addresses when wallet is unavailable
   - Improved error handling and user feedback

2. **Diagnostic Tools**:
   - Added WalletDebug component for real-time wallet state
   - Created diagnostic HTML pages for extension testing
   - Added Docker container status checking scripts

3. **UI Enhancements**:
   - Simplified credential management interface
   - Better feedback for wallet connection status
   - Clear indication of mock vs. real data usage

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Midnight Blockchain](https://input-output-hk.github.io/midnight/)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [Cardano Developer Portal](https://developers.cardano.org/)
