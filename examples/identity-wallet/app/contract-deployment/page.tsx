"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Container
} from '@mui/material';

import ContractDeployer from '../components/ContractDeployer';
import ProofGenerator from '../components/ProofGenerator';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function ContractDeploymentPage() {
  const [value, setValue] = useState(0);
  const [contractAddress, setContractAddress] = useState<string | undefined>(undefined);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Pass contract address from deployer to generator
  const handleContractDeployed = (address: string) => {
    setContractAddress(address);
    // Automatically switch to proof generation tab when contract is deployed
    setValue(1);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Midnight Smart Contract Integration
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom align="center" sx={{ mb: 4 }}>
          Deploy smart contracts and generate ZK proofs for Ethiopian identity verification
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="contract integration tabs" centered>
            <Tab label="Contract Deployment" {...a11yProps(0)} />
            <Tab label="Proof Generation" {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        <TabPanel value={value} index={0}>
          <ContractDeployer onContractDeployed={handleContractDeployed} />
        </TabPanel>
        
        <TabPanel value={value} index={1}>
          <ProofGenerator contractAddress={contractAddress} />
        </TabPanel>
      </Box>
    </Container>
  );
} 