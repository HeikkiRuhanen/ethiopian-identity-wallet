# Ethiopian Identity Wallet

A decentralized identity wallet application for Ethiopian citizens that leverages privacy-preserving smart contracts to verify nationality and creates Soul Bound Tokens as proof of verification.

## Features

- **Privacy-Preserving Nationality Verification**: Verify Ethiopian nationality without revealing sensitive personal data
- **Soul Bound Token Creation**: Generate non-transferable tokens that prove nationality verification
- **Smart Contract Integration**: Uses Compact language smart contract for secure, on-chain verification
- **Credential Management**: Create and manage verifiable credentials for Ethiopian identity
- **Zero-Knowledge Proofs**: Generate and verify proofs using the Midnight proof system

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

## Quick Start

The easiest way to run the application is using npm:

```bash
npm run dev
```

This will start the Next.js development server, and the application will be available at http://localhost:3000.

## Using the Application

1. **Connect Your Wallet**:
   - Click the "Connect Wallet" button in the Proof Generator
   - The application uses a mock Lace wallet implementation for demonstration

2. **View Available Credentials**:
   - Navigate to the Credential Manager
   - View the mock Ethiopian Identity credentials
   - Each credential includes nationality verification details

3. **Generate Proofs and Create Soul Bound Tokens**:
   - Navigate to the Proof Generator
   - Select an Ethiopian nationality credential
   - Generate a zero-knowledge proof
   - Create a Soul Bound Token containing:
     - Issuer's public key
     - Issuer's DID
     - Subject's DID
     - Verification result
     - Proof protocol details

## Development

### Directory Structure

- `/app`: Next.js application code
  - `/components`: React components including ProofGenerator and CredentialManager
  - `/services`: Service classes for API interactions
    - `MidnightAPI.ts`: Handles proof generation and verification
    - `LaceWalletService.ts`: Mock wallet implementation
    - `VerifiableCredentialService.ts`: Manages credentials
  - `/types`: TypeScript type definitions
  - `/compiled-contracts`: Compiled contract output
- `/contracts`: Compact language smart contract

### Mock Implementations

The application includes several mock implementations for demonstration:

1. **Lace Wallet Integration**: 
   - Simulates wallet connection and token creation
   - Returns mock transaction hashes
   - Handles Soul Bound Token metadata

2. **Proof Generation**:
   - Simulates zero-knowledge proof creation
   - Uses mock credential data
   - Demonstrates the proof verification flow

3. **Credentials**:
   - Provides mock Ethiopian nationality credentials
   - Includes sample issuer and subject DIDs
   - Demonstrates the credential format

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Midnight Blockchain](https://input-output-hk.github.io/midnight/)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [Cardano Developer Portal](https://developers.cardano.org/)
