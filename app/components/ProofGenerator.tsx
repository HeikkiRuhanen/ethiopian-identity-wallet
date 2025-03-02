"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Grid, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  CircularProgress,
  Paper,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { MidnightAPI, ProofData, ProofResult } from '../services/MidnightAPI';
import { VerifiableCredentialService } from '../services/VerifiableCredentialService';
import { EthiopianNationalityCredential } from '../types/VerifiableCredential';
import { LaceWalletService } from '../services/LaceWalletService';

export default function ProofGenerator() {
  const [loading, setLoading] = useState(false);
  const [proofServerAvailable, setProofServerAvailable] = useState<boolean | null>(null);
  const [credentials, setCredentials] = useState<EthiopianNationalityCredential[]>([]);
  const [selectedCredential, setSelectedCredential] = useState<string>('');
  const [contractName, setContractName] = useState('ethiopian_nationality_verification');
  const [functionName, setFunctionName] = useState('verify_and_record_nationality');
  const [ageThreshold, setAgeThreshold] = useState<number>(18);
  const [contractAddress, setContractAddress] = useState('addr1q8w3e5r7t9y0u2i1o3p4a6s7d8f9g0h');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    // Check proof server availability when component mounts
    checkProofServer();
    // Load credentials
    loadCredentials();
  }, []);

  const checkProofServer = async () => {
    setLoading(true);
    try {
      const available = await MidnightAPI.checkProofServer();
      setProofServerAvailable(available);
    } catch (err) {
      console.error('Error checking proof server:', err);
      setProofServerAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const loadCredentials = () => {
    try {
      const creds = VerifiableCredentialService.getEthiopianNationalityCredentials();
      setCredentials(creds);
      if (creds.length > 0) {
        setSelectedCredential(creds[0].id);
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  };

  const handleCredentialChange = (event: SelectChangeEvent) => {
    setSelectedCredential(event.target.value as string);
  };

  const handleContractNameChange = (event: SelectChangeEvent) => {
    const selectedContract = event.target.value;
    setContractName(selectedContract);
    
    // Set a default function based on the selected contract
    switch (selectedContract) {
      case 'ethiopian_nationality_verification':
        setFunctionName('verify_and_record_nationality');
        break;
      case 'age_verification':
        setFunctionName('verify_and_record_age');
        break;
      case 'ethiopia_service_eligibility':
        setFunctionName('verify_and_record_eligibility');
        break;
      default:
        setFunctionName('');
    }
  };

  const handleFunctionNameChange = (event: SelectChangeEvent) => {
    setFunctionName(event.target.value);
  };

  const handleAgeThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAgeThreshold(parseInt(event.target.value) || 18);
  };

  const handleContractAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContractAddress(event.target.value);
  };

  const resetState = () => {
    setResult(null);
    setError(null);
  };

  const connectWallet = async () => {
    setLoading(true);
    resetState();
    try {
      const connected = await LaceWalletService.connectWallet();
      setWalletConnected(connected);
      if (connected) {
        setResult({ message: 'Wallet connected successfully!' });
      } else {
        setError('Failed to connect to wallet.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const generateProof = async () => {
    setLoading(true);
    resetState();
    try {
      const credential = credentials.find(c => c.id === selectedCredential);
      if (!credential) {
        throw new Error('No credential selected');
      }

      // Prepare inputs based on the selected contract and function
      let inputs: any = {};
      
      if (contractName === 'ethiopian_nationality_verification') {
        // Create an Ethiopian nationality credential from the selected credential
        inputs = {
          credential: {
            id: credential.id,
            issuer: '0x7382619ab34c51def9012ae5b7290abd8f1c47e2d45637d39f28c5a', // Authorized issuer from the contract
            issuedAt: Math.floor(new Date(credential.validFrom).getTime() / 1000),
            expiresAt: Math.floor(new Date(credential.validUntil || credential.validFrom).getTime() / 1000),
            subject: credential.credentialSubject.id,
            nationality: credential.credentialSubject.nationality,
            signature: ['0x123456789abcdef', '0x987654321fedcba'] // Mock signature
          },
          currentTime: Math.floor(Date.now() / 1000)
        };
      } 
      else if (contractName === 'age_verification') {
        // Extract birth date and convert to days since epoch
        // We know birthDate exists in EthiopianNationalityCredential as per the interface
        const birthDate = new Date(credential.credentialSubject.birthDate);
        const birthDateInDays = Math.floor(birthDate.getTime() / (1000 * 86400));
        const currentDateInDays = Math.floor(Date.now() / (1000 * 86400));
        
        inputs = {
          credential: {
            id: credential.id,
            issuer: '0x7382619ab34c51def9012ae5b7290abd8f1c47e2d45637d39f28c5a',
            issuedAt: Math.floor(new Date(credential.validFrom).getTime() / 1000),
            expiresAt: Math.floor(new Date(credential.validUntil || credential.validFrom).getTime() / 1000),
            subject: credential.credentialSubject.id,
            birthDateInDays: birthDateInDays,
            nationality: credential.credentialSubject.nationality,
            signature: ['0x123456789abcdef', '0x987654321fedcba']
          },
          currentDateDays: currentDateInDays,
          currentTime: Math.floor(Date.now() / 1000),
          ageThreshold: ageThreshold
        };
      }
      else if (contractName === 'ethiopia_service_eligibility') {
        // Extract birth date and create a full identity credential
        const birthDate = new Date(credential.credentialSubject.birthDate);
        const birthDateInDays = Math.floor(birthDate.getTime() / (1000 * 86400));
        const currentDateInDays = Math.floor(Date.now() / (1000 * 86400));
        
        inputs = {
          credential: {
            id: credential.id,
            issuer: '0x7382619ab34c51def9012ae5b7290abd8f1c47e2d45637d39f28c5a',
            issuedAt: Math.floor(new Date(credential.validFrom).getTime() / 1000),
            expiresAt: Math.floor(new Date(credential.validUntil || credential.validFrom).getTime() / 1000),
            subject: credential.credentialSubject.id,
            fullName: credential.credentialSubject.fullName,
            birthDateInDays: birthDateInDays,
            nationality: credential.credentialSubject.nationality,
            region: credential.credentialSubject.region,
            kebele: credential.credentialSubject.kebele,
            nationalIdNumber: credential.credentialSubject.nationalIdNumber,
            signature: ['0x123456789abcdef', '0x987654321fedcba']
          },
          service: {
            id: '1',
            minimumAge: ageThreshold,
            requiresEthiopianNationality: true,
            requiredRegion: '0' // Any region
          },
          currentDateDays: currentDateInDays,
          currentTime: Math.floor(Date.now() / 1000)
        };
      }
      
      // Generate the proof using the MidnightAPI
      const proofResult = await MidnightAPI.generateProof(
        contractName,
        functionName,
        inputs
      );

      setResult(proofResult);
      if (!proofResult.success) {
        setError(proofResult.error || 'Unknown error generating proof');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const verifyProof = async () => {
    setLoading(true);
    resetState();
    try {
      if (!result || !result.proof) {
        throw new Error('No proof to verify. Generate a proof first.');
      }

      const isVerified = await MidnightAPI.verifyProof(
        'nationality_verification',
        'verify_nationality',
        result.proof
      );

      setResult({ ...result, verified: isVerified });
      if (!isVerified) {
        setError('Proof verification failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const submitProofToContract = async () => {
    setLoading(true);
    resetState();
    try {
      if (!result || !result.proof) {
        throw new Error('No proof to submit. Generate a proof first.');
      }

      if (!walletConnected) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      const submission = await LaceWalletService.submitProofToContract(
        contractAddress,
        result.proof
      );

      setResult(submission);
      if (!submission.success) {
        setError(submission.error || 'Unknown error submitting proof');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Proof Generator
      </Typography>
      
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Proof Server Status
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: proofServerAvailable === null
                      ? 'grey.400'
                      : proofServerAvailable
                        ? 'success.main'
                        : 'error.main',
                  }}
                />
              )}
            </Box>
            <Typography variant="body1">
              {loading
                ? 'Checking proof server...'
                : proofServerAvailable === null
                  ? 'Not checked'
                  : proofServerAvailable
                    ? 'Proof server is available'
                    : 'Proof server is not available'}
            </Typography>
          </Box>
          
          <Button 
            variant="outlined" 
            onClick={checkProofServer}
            disabled={loading}
          >
            Check Server
          </Button>
        </CardContent>
      </Card>
      
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lace Wallet Connection
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: walletConnected ? 'success.main' : 'grey.400',
                }}
              />
            </Box>
            <Typography variant="body1">
              {walletConnected
                ? 'Wallet connected'
                : 'Wallet not connected'}
            </Typography>
          </Box>
          
          <Button 
            variant="outlined" 
            onClick={connectWallet}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
      
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Contract and Function Selection
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Contract</InputLabel>
                <Select
                  value={contractName}
                  onChange={handleContractNameChange}
                  label="Contract"
                >
                  <MenuItem value="ethiopian_nationality_verification">Ethiopian Nationality Verification</MenuItem>
                  <MenuItem value="age_verification">Age Verification</MenuItem>
                  <MenuItem value="ethiopia_service_eligibility">Service Eligibility</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Function</InputLabel>
                <Select
                  value={functionName}
                  onChange={handleFunctionNameChange}
                  label="Function"
                  disabled={!contractName}
                >
                  {contractName === 'ethiopian_nationality_verification' && (
                    <MenuItem value="verify_and_record_nationality">Verify and Record Nationality</MenuItem>
                  )}
                  {contractName === 'age_verification' && (
                    <>
                      <MenuItem value="verify_and_record_age">Verify and Record Age</MenuItem>
                      <MenuItem value="create_age_verification_proof">Create Age Verification Proof</MenuItem>
                    </>
                  )}
                  {contractName === 'ethiopia_service_eligibility' && (
                    <>
                      <MenuItem value="verify_and_record_eligibility">Verify and Record Eligibility</MenuItem>
                      <MenuItem value="verify_service_eligibility">Verify Service Eligibility</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            {(contractName === 'age_verification' || contractName === 'ethiopia_service_eligibility') && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Age Threshold"
                  type="number"
                  value={ageThreshold}
                  onChange={handleAgeThresholdChange}
                  InputProps={{ inputProps: { min: 0, max: 120 } }}
                  sx={{ mb: 2 }}
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Proof Generation
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="credential-select-label">Select Credential</InputLabel>
                <Select
                  labelId="credential-select-label"
                  value={selectedCredential}
                  label="Select Credential"
                  onChange={handleCredentialChange}
                  disabled={credentials.length === 0 || loading}
                >
                  {credentials.map((cred) => (
                    <MenuItem key={cred.id} value={cred.id}>
                      {(cred.credentialSubject as any).fullName || cred.id} - Ethiopian Nationality
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cardano Contract Address"
                value={contractAddress}
                onChange={handleContractAddressChange}
                helperText="The Cardano smart contract address where the proof will be submitted"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={generateProof}
              disabled={!selectedCredential || loading}
            >
              Generate Proof
            </Button>
            
            <Button 
              variant="contained" 
              onClick={verifyProof}
              disabled={!result || !result.proof || loading}
            >
              Verify Proof
            </Button>
            
            <Button 
              variant="contained" 
              color="secondary"
              onClick={submitProofToContract}
              disabled={!result || !result.proof || !walletConnected || loading}
            >
              Submit to Contract
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {result && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Result:
          </Typography>
          <Box sx={{ 
            bgcolor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1, 
            overflowX: 'auto',
            maxHeight: '400px',
            '& pre': {
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }
          }}>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </Box>
        </Paper>
      )}
    </Box>
  );
} 