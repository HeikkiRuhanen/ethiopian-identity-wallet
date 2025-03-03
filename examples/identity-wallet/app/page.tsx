"use client";

import { useState } from 'react';
import { Box, Container } from '@mui/material';
import Layout from './components/Layout';
import Home from './components/Home';
import CredentialManager from './components/CredentialManager';
import ProofGenerator from './components/ProofGenerator';
import AboutInfo from './components/AboutInfo';
import WalletDebug from './components/WalletDebug';
import ExtensionDiagnostic from './components/ExtensionDiagnostic';
import ContractDeployer from './components/ContractDeployer';

export default function Page() {
  const [currentPage, setCurrentPage] = useState('home');
  const [contractAddress, setContractAddress] = useState<string | undefined>(undefined);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleContractDeployed = (address: string) => {
    setContractAddress(address);
    // Navigate to proof generator after contract deployment
    setCurrentPage('proof');
  };

  return (
    <Layout currentPage={currentPage} onPageChange={handleNavigate}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
        {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
        {currentPage === 'credentials' && <CredentialManager />}
        {currentPage === 'proof' && <ProofGenerator contractAddress={contractAddress} />}
        {currentPage === 'contract-deployment' && <ContractDeployer onContractDeployed={handleContractDeployed} />}
        {currentPage === 'info' && <AboutInfo />}
        {currentPage === 'wallet-debug' && (
          <>
            <ExtensionDiagnostic />
            <WalletDebug />
          </>
        )}
      </Container>
    </Layout>
  );
}
