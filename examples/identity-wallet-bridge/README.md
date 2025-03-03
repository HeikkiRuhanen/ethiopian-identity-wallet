# Identity Wallet Bridge

A bridge between the Identity Wallet DApp and the Identity Wallet CLI, enabling easy interaction with the Midnight Network through a web interface.

## Overview

The Identity Wallet Bridge acts as a connector between a web-based UI and the Identity Wallet CLI. It provides an API that allows the web application to:

1. Connect to the Midnight Lace Wallet
2. Retrieve wallet information
3. Simulate contract deployment
4. (Potentially) Execute actual contract operations on the Midnight Network

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Web Interface  │ ◄─────► │  Bridge Server  │ ◄─────► │  CLI Tool       │
│  (Browser)      │   HTTP  │  (Express)      │   Exec  │  (Node.js)      │
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

## Prerequisites

- Node.js (v16 or higher)
- The Identity Wallet CLI (located in `examples/identity-wallet/identity-wallet-cli`)
- Midnight Lace Wallet (Chrome extension)

## Installation

1. Clone the repository (if you haven't already)
2. Navigate to the bridge directory:
   ```
   cd examples/identity-wallet-bridge
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Start the bridge server:
   ```
   npm start
   ```
   
2. Open your browser and navigate to:
   ```
   http://localhost:3500
   ```

3. Use the web interface to connect to your Midnight Lace Wallet and interact with the Identity Wallet contract.

## API Endpoints

The bridge server exposes the following API endpoints:

- `GET /api/health` - Check if the bridge server is running
- `POST /api/wallet/connect` - Connect to the Midnight Lace Wallet
- `GET /api/wallet/info` - Get information about the connected wallet
- `POST /api/contract/simulate-deploy` - Simulate deploying an Identity Wallet contract

## Development

To run the server in development mode with automatic reloading:

```
npm run dev
```

## Troubleshooting

- **CLI Not Found Error**: Make sure the Identity Wallet CLI is properly built. Navigate to the CLI directory and run `yarn build`.
- **Wallet Connection Issues**: Ensure the Midnight Lace Wallet extension is installed in Chrome and is on version 1.2.5 or higher.
- **CORS Errors**: If you experience CORS issues, make sure the bridge server is running and properly configured to allow cross-origin requests.

## License

This project is part of the Midnight Network examples and is subject to the same licensing terms.

## Acknowledgments

- The Midnight Network team
- Contributors to the Identity Wallet CLI 