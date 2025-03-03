### 🇪🇹 Ethiopian Identity Wallet – Midnight Hackathon 2025
🚀 A real-world showcase of Self-Sovereign Identity (SSI) for verifying crypto wallet eligibility for National Stablecoin holding.

### 📌 Overview
This project demonstrates how Self-Sovereign Identity (SSI) can be used to verify an individual's eligibility to hold a National Stablecoin in Ethiopia. By leveraging Verifiable Credentials (VCs), Zero-Knowledge Proofs (ZKPs), and the Midnight blockchain, we provide a privacy-preserving solution for on-chain KYC compliance without revealing sensitive user data.

### 🔹 Key Features:
✅ Zero-Knowledge Proofs (ZKPs): Confirm eligibility without exposing private data  
✅ Decentralized Identity (DID): Users control their credentials   
✅ Midnight & Cardano Integration: Secure blockchain verification   
✅ Use Case: Ethiopian citizenship verification for stablecoin access  

📍 Official Hackathon Submission: Midnight ZK-Identity Hackathon

### Project Location
The Ethiopian National Identity Wallet project can be found in the [examples/identity-wallet](./examples/identity-wallet) directory.

### 🧩 How It Works
User Requests Verification

The user submits their Verifiable Presentation (VP) from an SSI Wallet (e.g., Fairway Wallet).
Identity Verification via ZKP

The system verifies signatures, and ensures credentials are not revoked.
A Zero-Knowledge Proof (ZKP) is generated to confirm:
✅ The user is Ethiopian

### Blockchain Proof Generation

The proof is stored on Midnight and linked to the user's crypto wallet by minting Soul Bound Token.

### Stablecoin Eligibility Confirmation

The user can now hold and transact with the Ethiopian National Stablecoin without revealing personal information on-chain.

### Getting Started
Please refer to the project's [dedicated README](./examples/identity-wallet/README.md) for setup instructions and detailed documentation.

## Other Examples

This repository also contains various other examples demonstrating Midnight's capabilities:

- [Counter Example](./examples/counter/README.md) - A simple counter application
- [BBoard Example](./examples/bboard/README.md) - A decentralized bulletin board application
- [Welcome Example](./examples/welcome/README.md) - An introductory application to Midnight

## License

This repository is licensed under [Apache License 2.0](LICENSE).
