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
  TextField,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { VerifiableCredential, EthiopianNationalityCredential } from '../types/VerifiableCredential';
import { VerifiableCredentialService } from '../services/VerifiableCredentialService';

export default function CredentialManager() {
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIssueDialog, setOpenIssueDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<VerifiableCredential | null>(null);
  
  // Form state for issuing a new credential
  const [formState, setFormState] = useState({
    subjectId: 'did:example:' + Math.random().toString(36).substring(2, 15),
    fullName: '',
    birthDate: '',
    birthPlace: '',
    nationalIdNumber: '',
    region: '',
    kebele: ''
  });

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

  const handleIssueOpen = () => {
    setOpenIssueDialog(true);
  };

  const handleIssueClose = () => {
    setOpenIssueDialog(false);
  };

  const handleViewOpen = (credential: VerifiableCredential) => {
    setSelectedCredential(credential);
    setOpenViewDialog(true);
  };

  const handleViewClose = () => {
    setOpenViewDialog(false);
    setSelectedCredential(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIssueCredential = () => {
    try {
      const newCredential = VerifiableCredentialService.createEthiopianNationalityCredential(
        formState.subjectId,
        formState.fullName,
        formState.birthDate,
        formState.birthPlace,
        formState.nationalIdNumber,
        formState.region,
        formState.kebele
      );
      
      setCredentials(prev => [...prev, newCredential]);
      handleIssueClose();
      
      // Reset form
      setFormState({
        subjectId: 'did:example:' + Math.random().toString(36).substring(2, 15),
        fullName: '',
        birthDate: '',
        birthPlace: '',
        nationalIdNumber: '',
        region: '',
        kebele: ''
      });
    } catch (error) {
      console.error('Error issuing credential:', error);
    }
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Ethiopian Nationality Credentials
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleIssueOpen}
        sx={{ mb: 3 }}
      >
        Issue New Credential
      </Button>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : credentials.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ my: 4 }}>
          No credentials found. Click "Issue New Credential" to create one.
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
      
      {/* Issue Credential Dialog */}
      <Dialog open={openIssueDialog} onClose={handleIssueClose} maxWidth="md" fullWidth>
        <DialogTitle>Issue Ethiopian Nationality Credential</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject ID"
                name="subjectId"
                value={formState.subjectId}
                onChange={handleFormChange}
                disabled
                helperText="Auto-generated DID for the subject"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formState.fullName}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Birth Date"
                name="birthDate"
                type="date"
                value={formState.birthDate}
                onChange={handleFormChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Birth Place"
                name="birthPlace"
                value={formState.birthPlace}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="National ID Number"
                name="nationalIdNumber"
                value={formState.nationalIdNumber}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Region"
                name="region"
                value={formState.region}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kebele"
                name="kebele"
                value={formState.kebele}
                onChange={handleFormChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleIssueClose}>Cancel</Button>
          <Button 
            onClick={handleIssueCredential} 
            variant="contained" 
            color="primary"
            disabled={!formState.fullName || !formState.birthDate || !formState.nationalIdNumber}
          >
            Issue Credential
          </Button>
        </DialogActions>
      </Dialog>
      
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