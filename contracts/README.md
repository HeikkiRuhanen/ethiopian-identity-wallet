# Ethiopian Identity Wallet - Compact Smart Contracts

This directory contains the Compact language smart contracts used in the Ethiopian Identity Wallet application for privacy-preserving identity verification.

## Contracts Overview

### 1. `ethiopian_nationality_verification.compact`

**Purpose**: Verify Ethiopian nationality without revealing sensitive personal information.

**Key Features**:
- Verifies the validity of an Ethiopian nationality credential
- Checks if the credential is issued by an authorized issuer
- Verifies the nationality code matches "Ethiopian"
- Records verification results in a ledger for future reference

**Main Functions**:
- `verify_and_record_nationality`: Public function to verify and record nationality status
- `prove_ethiopian_nationality`: Create a proof that someone is Ethiopian without revealing details

### 2. `age_verification.compact`

**Purpose**: Verify age requirements without revealing the actual date of birth.

**Key Features**:
- Calculates age from a birth date (stored as days since epoch)
- Checks if a person meets a minimum age requirement
- Verifies credential validity and issuer authorization
- Preserves privacy by not revealing the exact birth date

**Main Functions**:
- `verify_and_record_age`: Public function to verify a person is above a specified age threshold
- `create_age_verification_proof`: Create a proof that someone is above a certain age

### 3. `ethiopia_service_eligibility.compact`

**Purpose**: Combine nationality and age verification for comprehensive service eligibility checks.

**Key Features**:
- Verifies Ethiopian nationality
- Checks minimum age requirements
- Validates region-specific requirements (if applicable)
- Comprehensive credential verification including expiration and issuer checks

**Main Functions**:
- `verify_and_record_eligibility`: Public function to verify and record service eligibility
- `verify_service_eligibility`: Circuit to check all eligibility criteria

## Compiling Contracts

These contracts can be compiled using the Compactc compiler (version 0.21.0 or higher):

```bash
# Manual compilation
compactc compile ethiopian_nationality_verification.compact --output ../app/compiled-contracts/ethiopian_nationality_verification.json --format json

# Using the project script
npx ts-node ../scripts/compile-contracts.ts
```

## Contract Structure

Each contract follows a similar structure:

1. **Data Structures**: Define credential format and related types
2. **Constants**: Define authorized issuers, nationality codes, etc.
3. **Core Circuits**: Implement verification logic
4. **Public Functions**: Expose functionality for external use
5. **Test Functions**: Include witness functions for testing

## Privacy Considerations

These contracts are designed with privacy as a top priority:

- Only reveal the minimum information necessary (e.g., "above 18" instead of exact age)
- Use zero-knowledge proofs to verify claims without revealing source data
- Support selective disclosure of attributes

## Integration with the Application

The contracts are compiled and loaded by the MidnightAPI service in the application. The service handles:

1. Loading and compiling contracts
2. Preparing witness inputs based on user credentials
3. Generating and verifying proofs
4. Storing verification results for future use 