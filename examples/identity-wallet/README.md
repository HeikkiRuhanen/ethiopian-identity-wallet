# Ethiopian National Identity Wallet

## Midnight ZK Identity Hackathon Project

This project demonstrates a zero-knowledge proof-based identity wallet system for Ethiopian citizens. It leverages Midnight's ZK capabilities to allow users to verify their identity attributes without revealing personal data.

## Key Features

- **ZK Identity Verification**: Prove Ethiopian nationality without revealing personal details
- **Age Verification**: Zero-knowledge proofs for age verification (18+)
- **Service Eligibility**: Determine eligibility for various services based on attributes
- **Digital Credential Management**: Store and manage digital identity credentials
- **Privacy-Preserving Verification**: Share only what's necessary for verification

## Architecture

The system consists of:

1. **Frontend DApp** - Identity wallet user interface
2. **Bridge Server** - Handles proof generation and verification 
3. **Smart Contracts** - Ethiopian nationality verification, age verification, and service eligibility

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn

### Installation

```bash
# Install dependencies
cd examples/identity-wallet
yarn install

# Start the application
yarn dev
```

### Bridge Server Setup

```bash
# In a separate terminal
cd examples/identity-wallet-bridge
yarn install
node src/server.js
```

## Project Structure

- `/app` - Next.js application (UI)
- `/app/components` - React components 
- `/app/services` - API services and wallet connectivity
- `/contracts` - Compact language smart contracts
- `/compiled-contracts` - Compiled contract files

## Technical Implementation

The project implements several Midnight-specific technologies:

- **Compact Language Contracts**: Used to implement the verification logic
- **Midnight ZK Proofs**: For privacy-preserving identity verification
- **Lace Wallet Integration**: For user authentication and credential management

## Security Considerations

This wallet implementation ensures:
- Personal data never leaves the user's device
- Verification happens through zero-knowledge proofs
- Identity attributes are cryptographically secured

## Future Enhancements

- Mobile application integration
- Integration with additional Ethiopian government services
- Multi-credential support for comprehensive identity management
- Biometric authentication

## Project Overview

The Ethiopian National Identity Wallet is a demonstration of Self-Sovereign Identity (SSI) principles applied to national identity verification on the Midnight blockchain. This project showcases a crucial aspect of an SSI wallet containing identity credentials that verify cryptocurrency wallet providers as eligible participants for a National stablecoin system.

### Key Concept

This application demonstrates how zero-knowledge proofs can enable citizens to:
- Prove their nationality without revealing personal information
- Validate eligibility for national financial services
- Connect their verified identity to their Midnight Lace wallet
- Interact with smart contracts that maintain privacy

While designed as a demonstration, this project illustrates the building blocks for a privacy-preserving national identity system that could support a sovereign digital currency.

## Features

- **Lace Wallet Integration**: Connect seamlessly with the Midnight Lace wallet
- **Identity Credential Management**: Store and manage verifiable Ethiopian nationality credentials
- **Zero-Knowledge Proofs**: Generate ZK proofs that verify nationality without revealing personal data
- **Contract Deployment**: Deploy identity verification contracts to the Midnight testnet
- **Proof Verification**: Test and verify identity proofs against deployed contracts
- **Bridge Architecture**: Connects DApp frontend with CLI tools for a complete solution
- **Soul Bound Token Creation**: Generate non-transferable tokens that prove nationality verification
- **Smart Contract Integration**: Uses Compact language smart contract for secure, on-chain verification

## Technical Architecture

The project is structured in three main components:

1. **Identity Wallet DApp**: A Next.js web application providing the user interface
2. **Identity Wallet CLI**: Command-line tools for interacting with the Midnight blockchain
3. **Identity Bridge**: A connector service that enables the DApp to leverage CLI capabilities

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Web Interface  │ ◄─────► │  Bridge Server  │ ◄─────► │  CLI Tool       │
│  (Next.js)      │   HTTP  │  (Node.js)      │   Exec  │  (TypeScript)   │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                                               │
                                                               ▼
                                                        ┌─────────────────┐
                                                        │                 │
                                                        │  Midnight Lace  │
                                                        │  Wallet         │
                                                        │                 │
                                                        └─────────────────┘
                                                               │
                                                               ▼
                                                        ┌─────────────────┐
                                                        │                 │
                                                        │  Midnight       │
                                                        │  Network        │
                                                        │                 │
                                                        └─────────────────┘
```

## Smart Contract Implementation

The core of the application is the `ethiopian_nationality_verification` contract written in Midnight's Compact language. This contract:

- Provides ZK circuits for nationality verification
- Stores verification results while preserving privacy
- Enables services to check eligibility without revealing personal data
- Serves as a trust anchor for the national stablecoin system

## Prerequisites

- Node.js 16+
- npm 8+
- Compactc 0.21.0+ (Compact language compiler)
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
   NEXT_PUBLIC_NETWORK_ID=testnet
   NEXT_PUBLIC_LACE_ENABLED=true
   NEXT_PUBLIC_USE_REAL_PROOFS=true
   ```

## Getting Started

### Setup

1. Start the bridge server:
   ```
   cd examples/identity-wallet-bridge
   node src/server.js
   ```

2. In a new terminal, start the DApp:
   ```
   cd examples/identity-wallet
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. **Connect Lace Wallet**: Click "Connect Wallet" to establish a connection with your Midnight Lace wallet.
2. **Manage Credentials**: View and manage your Ethiopian nationality credentials.
3. **Deploy Contract**: Deploy the identity verification contract to the Midnight testnet.
4. **Generate Proofs**: Create zero-knowledge proofs of your nationality without revealing personal information.
5. **Verify Eligibility**: Test your eligibility for the national stablecoin using your identity proofs.

## How It Meets Hackathon Requirements

This project fulfills all the requirements of the Midnight ZK Identity Hackathon:

- ✅ Connects to a Lace Wallet through our bridge implementation
- ✅ Uses Midnight's Compact language for smart contracts that generate ZK proofs
- ✅ Includes a complete UI built with Next.js and Material-UI
- ✅ Implements mock off-chain data for demonstration purposes
- ✅ Verifies aspects of digital identity (specifically, Ethiopian nationality)

## Troubleshooting Wallet Connection

If you encounter issues connecting to the wallet:

1. **Check Wallet Extension**:
   - Ensure the Midnight Lace wallet is properly installed
   - Verify the extension is enabled in Chrome
   - Check the wallet is configured for the correct network

2. **Check Bridge Service**:
   - Verify the bridge server is running
   - Check the console output for any error messages

3. **Use the Diagnostic Tools**:
   - The WalletDebug component shows detailed wallet state
   - Check browser console for any error messages

## Future Extensions

While this demonstration focuses on nationality verification, the framework could be extended to:

1. **Full Identity Verification**: Include additional aspects like age, region, and other personal attributes
2. **Multi-Party Credential Issuance**: Support for multiple government departments to issue and verify credentials
3. **Stablecoin Integration**: Direct integration with a national digital currency system
4. **Offline Verification**: Support for areas with limited connectivity
5. **Mobile Application**: Extend to a mobile-first experience for greater accessibility

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- The Midnight Network team for providing the blockchain platform and developer tools
- The Midnight ZK Identity Hackathon organizers for the opportunity to build this demonstration
- All contributors to the project
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [Cardano Developer Portal](https://developers.cardano.org/)
