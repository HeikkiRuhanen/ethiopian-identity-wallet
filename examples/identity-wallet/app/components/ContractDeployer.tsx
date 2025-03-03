"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  TextField, 
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';

import { MidnightAPI, MIDNIGHT_CONFIG } from '../services/MidnightAPI';
import { LaceWalletService } from '../services/LaceWalletService';

interface ContractDeployerProps {
  onContractDeployed?: (address: string) => void;
}

export default function ContractDeployer({ onContractDeployed }: ContractDeployerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [contractName, setContractName] = useState('ethiopian_nationality_verification');
  const [contractAddress, setContractAddress] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [proofServerAvailable, setProofServerAvailable] = useState<boolean | null>(null);

  // Check if the wallet is connected on component mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      // If bridge is enabled, check bridge wallet connection
      if (MIDNIGHT_CONFIG.useBridge) {
        const bridgeWalletInfo = await MidnightAPI.getBridgeWalletInfo();
        setWalletConnected(bridgeWalletInfo.success);
      } else {
        // Otherwise use Lace Wallet
        const isAvailable = await LaceWalletService.isWalletAvailable();
        setWalletConnected(isAvailable);
      }
    };

    const checkProofServer = async () => {
      try {
        const isAlive = await MidnightAPI.isProofServerAlive();
        setProofServerAvailable(isAlive);
      } catch (err) {
        setProofServerAvailable(false);
      }
    };

    checkWalletConnection();
    checkProofServer();
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // If bridge is enabled, use bridge to connect wallet
      if (MIDNIGHT_CONFIG.useBridge) {
        const result = await MidnightAPI.connectToBridgeWallet();
        if (result.success) {
          setWalletConnected(true);
        } else {
          setError(result.error || 'Failed to connect wallet through bridge');
        }
      } else {
        // Otherwise use Lace Wallet
        const connected = await LaceWalletService.connectWallet();
        setWalletConnected(connected);
        if (!connected) {
          setError('Failed to connect to wallet. Please make sure Lace Wallet is installed and unlocked.');
        }
      }
    } catch (err: any) {
      setError(`Error connecting to wallet: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Check proof server
  const checkProofServer = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Checking proof server availability...');
      
      const isAlive = await MidnightAPI.isProofServerAlive();
      console.log('Proof server check result:', isAlive);
      
      setProofServerAvailable(isAlive);
      if (!isAlive) {
        setError('Proof server is not available');
      }
    } catch (err) {
      console.error('Error checking proof server:', err);
      setProofServerAvailable(false);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const deployContract = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log(`Deploying contract ${contractName}...`);
      
      // Check if wallet is connected
      if (!walletConnected) {
        if (MIDNIGHT_CONFIG.useBridge) {
          const result = await MidnightAPI.connectToBridgeWallet();
          if (!result.success) {
            throw new Error('Wallet is not connected. Please connect your wallet first.');
          }
        } else if (!await LaceWalletService.isWalletAvailable()) {
          throw new Error('Wallet is not connected. Please connect your wallet first.');
        }
      }
      
      // Compile and deploy contract
      const deployResult = await MidnightAPI.deployContract(contractName);
      
      if (deployResult.success && deployResult.contractAddress) {
        console.log(`Contract deployed successfully at ${deployResult.contractAddress}`);
        setResult({
          success: true,
          message: `Contract deployed successfully at ${deployResult.contractAddress}`,
          contractAddress: deployResult.contractAddress
        });
        
        // Store contract address and notify parent component
        setContractAddress(deployResult.contractAddress);
        if (onContractDeployed) {
          onContractDeployed(deployResult.contractAddress);
        }
      } else {
        setError(deployResult.error || 'Unknown error deploying contract');
      }
    } catch (err: any) {
      console.error('Error deploying contract:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Compile contract
  const compileContract = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const compilation = await MidnightAPI.compileContract(contractName);
      setResult(compilation);
      if (!compilation.success) {
        setError(compilation.error || 'Unknown error compiling contract');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle contract name change
  const handleContractNameChange = (event: SelectChangeEvent) => {
    setContractName(event.target.value);
  };

  // Handle contract address change
  const handleContractAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContractAddress(event.target.value);
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Contract Deployer
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
          >
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
      
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Contract Selection
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Contract</InputLabel>
                <Select
                  value={contractName}
                  onChange={handleContractNameChange}
                  label="Contract"
                >
                  <MenuItem value="ethiopian_nationality_verification">Ethiopian Nationality Verification</MenuItem>
                  <MenuItem value="age_verification">Age Verification</MenuItem>
                  <MenuItem value="ethiopia_service_eligibility">Ethiopian Service Eligibility</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contract Address"
                value={contractAddress}
                onChange={handleContractAddressChange}
                helperText="The address where the contract is deployed (filled automatically after deployment)"
                placeholder="Will be generated after deployment"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Contract Actions
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={compileContract}
              disabled={!contractName || loading}
            >
              Compile Contract
            </Button>
            
            <Button 
              variant="contained" 
              color="secondary"
              onClick={deployContract}
              disabled={!contractName || !proofServerAvailable || loading}
            >
              Deploy Contract
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