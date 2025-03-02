// W3C Verifiable Credential types based on the W3C VC Data Model v2.0

export interface CredentialSubject {
  id?: string;
  [key: string]: any;
}

export interface Issuer {
  id: string;
  name?: string;
  [key: string]: any;
}

export interface Proof {
  type: string;
  created?: string;
  verificationMethod: string;
  proofPurpose: string;
  proofValue: string;
  cryptosuite?: string;
  [key: string]: any;
}

export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  validFrom: string;
  validUntil?: string;
  credentialSubject: {
    id: string;
    [key: string]: any;
  };
  proof?: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws?: string;
  };
}

// Ethiopian Nationality Credential specific types
export interface EthiopianNationalitySubject extends CredentialSubject {
  nationality: string;
  nationalIdNumber?: string;
  fullName?: string;
  birthDate?: string;
  birthPlace?: string;
  // Additional fields specific to Ethiopian nationality verification
  region?: string;
  kebele?: string;
}

export interface EthiopianNationalityCredential extends VerifiableCredential {
  type: string[];
  credentialSubject: {
    id: string;
    fullName: string;
    birthDate: string;
    birthPlace: string;
    nationalIdNumber: string;
    region: string;
    kebele: string;
    nationality: 'Ethiopian';
  };
}

export interface CredentialProof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  publicInputs: string[];
  publicOutput: string;
}

export interface ProofResult {
  success: boolean;
  proof?: CredentialProof;
  error?: string;
} 