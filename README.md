# Ethiopian Identity Wallet

A decentralized identity wallet application for Ethiopian citizens that leverages privacy-preserving smart contracts to verify nationality, age, and service eligibility without exposing sensitive personal data.

## Features

- **Privacy-Preserving Verification**: Verify Ethiopian nationality, age, and service eligibility without revealing actual personal information.
- **Smart Contract Integration**: Uses Compact language smart contracts for secure, on-chain verification.
- **Credential Management**: Create and manage verifiable credentials for Ethiopian identity.
- **Zero-Knowledge Proofs**: Generate and verify proofs using the Midnight proof system.

## Smart Contracts

The project includes three Compact smart contracts:

1. **Ethiopian Nationality Verification**: Verifies a user's Ethiopian citizenship without revealing their personal information.
2. **Age Verification**: Verifies a user's age without revealing their date of birth.
3. **Service Eligibility**: Combines nationality and age verification to determine eligibility for various Ethiopian services.

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

The easiest way to run the application is using the provided run script:

```bash
./run.sh
```

This script will:
1. Check if Compactc is installed
2. Compile all Compact contracts
3. Start the Next.js development server

Alternatively, if you're in the root directory of the monorepo, you can use:

```bash
# From the midnight-examples root directory
npm run identity-wallet
```

Once started, the application will be available at http://localhost:3000 (or another port if 3000 is already in use).

## Manual Setup

If you prefer to set up manually, follow these steps:

1. Compile the Compact contracts:
   ```bash
   npx ts-node scripts/compile-contracts.ts
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Using the Application

1. **Create or Import Credentials**:
   - Navigate to the Credential Manager
   - Create a new Ethiopian Identity credential
   - Fill in the required information

2. **Generate Proofs**:
   - Navigate to the Proof Generator
   - Select a contract and function
   - Choose a credential
   - Generate a proof

3. **Verify Proofs**:
   - Submit the generated proof for verification
   - View the verification result

## Development

### Directory Structure

- `/app`: Next.js application code
- `/contracts`: Compact language smart contracts
- `/app/compiled-contracts`: Compiled contract output (generated during build)
- `/app/components`: React components
- `/app/services`: Service classes for API interactions
- `/app/types`: TypeScript type definitions

### Smart Contract Development

To add or modify Compact contracts:

1. Edit or create a new contract in the `/contracts` directory
2. Compile the contract using the compile-contracts script
3. Update the MidnightAPI service to include the new contract

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Midnight Blockchain](https://input-output-hk.github.io/midnight/)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [Cardano Developer Portal](https://developers.cardano.org/)
