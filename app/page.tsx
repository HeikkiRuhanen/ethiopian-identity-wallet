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

export default function Page() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <Layout currentPage={currentPage} onPageChange={handleNavigate}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
        {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
        {currentPage === 'credentials' && <CredentialManager />}
        {currentPage === 'proof' && <ProofGenerator />}
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
