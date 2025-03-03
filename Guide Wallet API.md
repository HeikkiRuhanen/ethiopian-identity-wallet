Introduction
The Midnight Wallet API provides a comprehensive interface for wallet operations within the Midnight Network ecosystem. This guide will walk you through the key components and operations of the Wallet API based on the official documentation.
Key Concepts
The Wallet API is structured around several core concepts:
Wallet Interface: The primary interface that provides methods for transaction management and state tracking
Transaction Flow: The lifecycle of transactions (preparation, balancing, proving, submission)
Wallet State: The data structure that holds information about the wallet's current state
Setting Up a Wallet
A wallet in the Midnight ecosystem is a data structure that holds state and provides methods for transaction management. The core interface is defined as follows:
}
Wallet Identifiers
A Midnight wallet is identified by several key pieces of information:
Address: A concatenated hex-encoded string consisting of:
CoinPublicKey (32-byte hex string)
EncryptionPublicKey (35-byte hex string)
The format is: [CoinPublicKey]|[EncryptionPublicKey]
The CoinPublicKey is particularly important as it's used to identify the wallet and is required for many operations.
Transaction Flow
The typical flow for transactions involves several steps:
1. Create a Transaction
To create a transfer transaction:
;
The TokenTransfer type defines where assets are sent and in what amount.
2. Balance the Transaction
Balancing a transaction means selecting inputs (coins) to cover the outputs and fees:
;
The result will be either a BalanceTransactionToProve (needs proving) or NothingToProve (already balanced and proven).
3. Prove the Transaction
Proving generates the cryptographic proofs needed for a valid transaction:
;
This step can be resource-intensive. The ProvingRecipe type can be one of:
TransactionToProve
BalanceTransactionToProve
NothingToProve
4. Submit the Transaction
Finally, submit the transaction to the network:
;
The returned value is a TransactionIdentifier (transaction hash).
Monitoring Wallet State
The wallet state can be monitored through an observable:
;
The WalletState includes:
ZSwap local state
Transaction history
Current blockchain offset
Protocol version
Network ID
Transaction Status
Transaction status is tracked using the ApplyStage type alias:
FailEntirely: Transaction failed completely
FailFallible: The fallible part failed, but the guaranteed part succeeded
SucceedEntirely: Transaction succeeded completely
Handling Transaction History
Each transaction is recorded in the wallet's history as a TransactionHistoryEntry, which includes:
Transaction hash
Status (ApplyStage)
Timestamp
Transaction details
Best Practices
Error Handling: Always implement proper error handling for wallet operations
State Management: Keep track of wallet state to ensure accurate balance information
Transaction Monitoring: Monitor transaction status after submission
Resource Management: Be aware that proving transactions can be resource-intensive
Integration Example
Here's a simplified example of how to integrate the Midnight Wallet API into a DApp:
}
Conclusion
The Midnight Wallet API provides a robust foundation for building wallet functionality into Midnight Network applications. By understanding the core concepts and transaction flow, developers can effectively integrate wallet operations into their DApps while maintaining privacy and security.