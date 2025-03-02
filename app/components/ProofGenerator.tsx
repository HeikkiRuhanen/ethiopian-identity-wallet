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
import { EthiopianNationalityCredential, Issuer } from '../types/VerifiableCredential';
import { LaceWalletService } from '../services/LaceWalletService';

export default function ProofGenerator() {
  const [loading, setLoading] = useState(false);
  const [proofServerAvailable, setProofServerAvailable] = useState<boolean | null>(null);
  const [credentials, setCredentials] = useState<EthiopianNationalityCredential[]>([]);
  const [selectedCredential, setSelectedCredential] = useState<string>('');
  const [contractName, setContractName] = useState('ethiopian_nationality_verification');
  const [functionName, setFunctionName] = useState('verify_and_record_nationality');
  const [tokenId, setTokenId] = useState('sbt_ethiopian_nationality_001');
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
    setContractName('ethiopian_nationality_verification');
    setFunctionName('verify_and_record_nationality');
  };

  const handleFunctionNameChange = (event: SelectChangeEvent) => {
    setFunctionName('verify_and_record_nationality');
  };

  const handleTokenIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTokenId(event.target.value);
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
    setResult(null);
    setError(null);

    try {
      const credential = credentials.find(c => c.id === selectedCredential);
      
      if (!credential) {
        throw new Error('No credential selected');
      }

      // Get expiration timestamp, using the validFrom date as fallback if validUntil is not defined
      const expirationTimestamp = credential.validUntil 
        ? new Date(credential.validUntil).getTime() / 1000
        : new Date(credential.validFrom).getTime() / 1000 + (365 * 24 * 60 * 60); // Default to 1 year from validFrom

      // Only prepare inputs for the Ethiopian nationality verification contract
      const inputs = {
        credential: {
          subjectId: credential.credentialSubject.id,
          nationality: credential.credentialSubject.nationality,
          expiresAt: expirationTimestamp,
          // Mock signature for demonstration
          issuerSignature: "0x1234567890"
        }
      };

      const result = await MidnightAPI.generateProof(
        contractName,
        functionName,
        inputs
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate proof');
      }

      setResult(result);
    } catch (err) {
      console.error('Error generating proof:', err);
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

  const createSoulBoundToken = async () => {
    setLoading(true);
    resetState();
    try {
      if (!result || !result.proof) {
        throw new Error('No proof to submit. Generate a proof first.');
      }

      if (!walletConnected) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      // Get the selected credential to extract metadata
      const credential = credentials.find(c => c.id === selectedCredential);
      
      if (!credential) {
        throw new Error('Credential data not found');
      }
      
      // In our mock data, we know the credential structure
      // Using any to bypass TypeScript limitations with the current interface
      const credentialAny = credential as any;
      
      const credentialData = {
        id: credential.id,
        issuerPublicKey: `${credentialAny.issuer.id}#key1`,
        issuerDID: credentialAny.issuer.id,
        subjectDID: credential.credentialSubject.id,
        type: credential.type.find(t => t !== 'VerifiableCredential') || "EthiopianNationalityCredential"
      };

      const submission = await LaceWalletService.createSoulBoundToken(
        tokenId,
        result.proof,
        credentialData
      );

      setResult(submission);
      if (!submission.success) {
        setError(submission.error || 'Unknown error creating Soul Bound Token');
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
                  disabled={true}
                >
                  <MenuItem value="ethiopian_nationality_verification">Ethiopian Nationality Verification</MenuItem>
                </Select>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                  Only Ethiopian Nationality Verification is currently available
                </Typography>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Function</InputLabel>
                <Select
                  value={functionName}
                  onChange={handleFunctionNameChange}
                  label="Function"
                  disabled={true}
                >
                  <MenuItem value="verify_and_record_nationality">Verify and Record Nationality</MenuItem>
                </Select>
              </FormControl>
            </Grid>
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
                label="Soul Bound Token ID"
                value={tokenId}
                onChange={handleTokenIdChange}
                helperText="The unique identifier for the Soul Bound Token to be created"
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
              onClick={createSoulBoundToken}
              disabled={!result || !result.proof || !walletConnected || loading}
            >
              Create Soul Bound Token
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