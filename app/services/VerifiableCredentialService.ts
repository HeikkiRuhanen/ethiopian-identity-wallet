"use client";

import { 
  VerifiableCredential, 
  EthiopianNationalityCredential 
} from '../types/VerifiableCredential';

// Mock data for testing
const MOCK_ETHIOPIAN_CREDENTIALS: EthiopianNationalityCredential[] = [
  {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://www.w3.org/2018/credentials/examples/v1'
    ],
    'id': 'http://ethiopia.gov.et/credentials/3732',
    'type': [
      'VerifiableCredential',
      'EthiopianNationalityCredential'
    ],
    'issuer': {
      'id': 'did:example:ethiopia-ministry-of-immigration',
      'name': 'Ethiopian Ministry of Immigration'
    },
    'validFrom': '2023-01-10T12:30:00Z',
    'validUntil': '2033-01-10T12:30:00Z',
    'credentialSubject': {
      'id': 'did:example:abcd123456789',
      'nationality': 'Ethiopian',
      'fullName': 'Abebe Kebede',
      'birthDate': '1990-05-15',
      'birthPlace': 'Addis Ababa',
      'nationalIdNumber': 'ETH-123456789',
      'region': 'Addis Ababa',
      'kebele': 'Bole'
    },
    'proof': {
      'type': 'DataIntegrityProof',
      'verificationMethod': 'did:example:ethiopia-ministry-of-immigration#key-1',
      'created': '2023-01-10T12:30:00Z',
      'proofPurpose': 'assertionMethod',
      'cryptosuite': 'eddsa-rdfc-2022',
      'proofValue': 'z3511GLeGjZ8yKSVdT7x39XR5GzBKZ2TJ6mkirvLkVkLNeuSeVAA2bsNntPnx3u2NPKUjNCuFsDJ2cm1YNL11Fn6d'
    }
  }
];

export class VerifiableCredentialService {
  // Get all stored credentials
  static getAllCredentials(): VerifiableCredential[] {
    // In a real application, this would fetch from secure storage or blockchain
    return MOCK_ETHIOPIAN_CREDENTIALS;
  }

  // Get Ethiopian nationality credentials
  static getEthiopianNationalityCredentials(): EthiopianNationalityCredential[] {
    // In a real application, this would filter from secure storage or blockchain
    return MOCK_ETHIOPIAN_CREDENTIALS;
  }

  // Verify a credential's cryptographic proof
  static verifyCredential(credential: VerifiableCredential): Promise<boolean> {
    // In a real implementation, this would verify the digital signature
    // For now, we'll just simulate successful verification
    return Promise.resolve(true);
  }

  // Create a new credential (this would be done by an issuer in a real system)
  static createEthiopianNationalityCredential(
    subjectId: string,
    fullName: string,
    birthDate: string,
    birthPlace: string,
    nationalIdNumber: string,
    region: string,
    kebele: string
  ): EthiopianNationalityCredential {
    const now = new Date();
    const tenYearsLater = new Date();
    tenYearsLater.setFullYear(now.getFullYear() + 10);
    
    return {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      'id': `http://ethiopia.gov.et/credentials/${Date.now()}`,
      'type': [
        'VerifiableCredential',
        'EthiopianNationalityCredential'
      ],
      'issuer': {
        'id': 'did:example:ethiopia-ministry-of-immigration',
        'name': 'Ethiopian Ministry of Immigration'
      },
      'validFrom': now.toISOString(),
      'validUntil': tenYearsLater.toISOString(),
      'credentialSubject': {
        'id': subjectId,
        'nationality': 'Ethiopian',
        'fullName': fullName,
        'birthDate': birthDate,
        'birthPlace': birthPlace,
        'nationalIdNumber': nationalIdNumber,
        'region': region,
        'kebele': kebele
      },
      'proof': {
        'type': 'DataIntegrityProof',
        'verificationMethod': 'did:example:ethiopia-ministry-of-immigration#key-1',
        'created': now.toISOString(),
        'proofPurpose': 'assertionMethod',
        'cryptosuite': 'eddsa-rdfc-2022',
        'proofValue': 'z3511GLeGjZ8yKSVdT7x39XR5GzBKZ2TJ6mkirvLkVkLNeuSeVAA2bsNntPnx3u2NPKUjNCuFsDJ2cm1YNL11Fn6d'
      }
    };
  }
} 