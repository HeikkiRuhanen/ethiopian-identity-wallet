"use client";

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { VerifiableCredential } from '../types/VerifiableCredential';
import { VerifiableCredentialService } from '../services/VerifiableCredentialService';

export default function CredentialManager() {
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<VerifiableCredential | null>(null);
  
  useEffect(() => {
    // Load credentials when component mounts
    loadCredentials();
  }, []);

  const loadCredentials = () => {
    setLoading(true);
    try {
      const creds = VerifiableCredentialService.getAllCredentials();
      setCredentials(creds);
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOpen = (credential: VerifiableCredential) => {
    setSelectedCredential(credential);
    setOpenViewDialog(true);
  };

  const handleViewClose = () => {
    setOpenViewDialog(false);
    setSelectedCredential(null);
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Ethiopian Nationality Credentials
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : credentials.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ my: 4 }}>
          No credentials found.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {credentials.map((credential) => (
            <Grid item xs={12} md={6} key={credential.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" component="div">
                    {credential.type.includes('EthiopianNationalityCredential') 
                      ? 'Ethiopian Nationality' 
                      : credential.type[1] || 'Credential'}
                  </Typography>
                  
                  <Typography color="text.secondary" gutterBottom>
                    Issued by: {typeof credential.issuer === 'string' 
                      ? credential.issuer 
                      : credential.issuer && 'id' in credential.issuer
                        ? credential.issuer.name || credential.issuer.id
                        : 'Unknown issuer'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    Subject: {(credential.credentialSubject as any).fullName || 'N/A'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Valid from: {new Date(credential.validFrom || '').toLocaleDateString()}
                    {credential.validUntil && ` to ${new Date(credential.validUntil).toLocaleDateString()}`}
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    size="small" 
                    sx={{ mt: 2 }}
                    onClick={() => handleViewOpen(credential)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* View Credential Dialog */}
      <Dialog open={openViewDialog} onClose={handleViewClose} maxWidth="md" fullWidth>
        <DialogTitle>Credential Details</DialogTitle>
        <DialogContent>
          {selectedCredential && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedCredential.type.join(', ')}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1">Issuer Information</Typography>
              <Typography variant="body2" paragraph>
                {typeof selectedCredential.issuer === 'string' 
                  ? selectedCredential.issuer 
                  : JSON.stringify(selectedCredential.issuer, null, 2)}
              </Typography>
              
              <Typography variant="subtitle1">Credential Subject</Typography>
              <List dense>
                {Object.entries(selectedCredential.credentialSubject).map(([key, value]) => (
                  <ListItem key={key}>
                    <ListItemText 
                      primary={`${key}: ${value}`} 
                      secondary={key === 'id' ? 'Decentralized Identifier' : ''} 
                    />
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1">Validity Period</Typography>
              <Typography variant="body2">
                From: {new Date(selectedCredential.validFrom || '').toLocaleString()}
              </Typography>
              {selectedCredential.validUntil && (
                <Typography variant="body2">
                  Until: {new Date(selectedCredential.validUntil).toLocaleString()}
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1">Cryptographic Proof</Typography>
              <Box sx={{ overflow: 'auto', maxHeight: '200px', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <pre>{JSON.stringify(selectedCredential.proof, null, 2)}</pre>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 