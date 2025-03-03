# Identity Wallet CLI

A command-line interface for interacting with the Identity Wallet contract on the Midnight Network.

## Overview

This CLI tool demonstrates how to connect to the Midnight Lace wallet and simulate interactions with the Identity Wallet contract. It provides a simplified implementation that focuses on wallet connectivity rather than actual contract deployment.

## Features

- Connect to the Midnight Lace wallet
- Retrieve wallet information (address, coin public key)
- Simulate contract deployment (without actual deployment)

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- Midnight Lace wallet (Chrome extension)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/midnight-network/midnight-examples.git
   cd midnight-examples/examples/identity-wallet/identity-wallet-cli
   ```

2. Install dependencies:
   ```
   yarn install
   ```

3. Build the project:
   ```
   yarn build
   ```

## Usage

### Connect to Wallet

Connect to the Midnight Lace wallet and save credentials:

```
yarn start wallet-connect
```

This command will:
1. Check for existing wallet credentials
2. If none exist, it will open a browser to connect to your wallet
3. Save the wallet information for future use

### View Wallet Information

Display information about the connected wallet:

```
yarn start wallet-info
```

This command will show:
- Wallet address
- Coin public key
- Network ID

### Simulate Contract Deployment

Simulate deploying the Identity Wallet contract (without actual deployment):

```
yarn start simulate-deploy
```

This command will:
1. Check for wallet information
2. Simulate the contract deployment process
3. Generate a mock contract address

## Wallet Integration

The CLI integrates with the Midnight Lace wallet through a browser-based connector. This connector:

1. Starts a local HTTP server
2. Opens a browser window to connect to the wallet
3. Retrieves wallet information (address, coin public key)
4. Saves this information for future use

## Development

### Project Structure

- `src/cli.ts` - Main CLI entry point
- `src/wallet-connect.ts` - Wallet connection functionality
- `src/common-types.ts` - Type definitions
- `src/middleware.ts` - Provider implementations

### Building

```
yarn build
```

### Running

```
yarn start <command>
```

## License

MIT

## Acknowledgments

- Midnight Network team
- Contributors to the Identity Wallet contract 