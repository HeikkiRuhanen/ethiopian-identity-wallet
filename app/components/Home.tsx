"use client";

import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InfoIcon from '@mui/icons-material/Info';
import WalletStatus from './WalletStatus';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <Box>
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        p: 4, 
        borderRadius: 2, 
        mb: 4,
        backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
      }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Ethiopian Identity Wallet
        </Typography>
        <Typography variant="h6" component="div" sx={{ mb: 3 }}>
          Securely verify your Ethiopian nationality using zero-knowledge proofs
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          size="large"
          onClick={() => onNavigate('credentials')}
          sx={{ mr: 2 }}
        >
          Manage My Credentials
        </Button>
        <Button 
          variant="outlined" 
          sx={{ color: 'white', borderColor: 'white' }}
          size="large"
          onClick={() => onNavigate('proof')}
        >
          Generate Proof
        </Button>
      </Box>

      <WalletStatus />

      <Typography variant="h4" component="h2" gutterBottom>
        How It Works
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: '100%', p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Zero-Knowledge Proofs
            </Typography>
            <Typography variant="body1" paragraph>
              This wallet uses Midnight blockchain's zero-knowledge technology to prove your Ethiopian 
              nationality to third-party applications without revealing your personal data.
            </Typography>
            <Typography variant="body1">
              A zero-knowledge proof allows you to prove that you possess certain information 
              (like being an Ethiopian national) without revealing any additional details 
              about yourself.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: '100%', p: 3 }}>
            <Typography variant="h5" gutterBottom>
              W3C Verifiable Credentials
            </Typography>
            <Typography variant="body1" paragraph>
              Your identity information is stored as W3C Verifiable Credentials, which are 
              tamper-proof digital credentials that can be cryptographically verified.
            </Typography>
            <Typography variant="body1">
              These credentials are fully owned and controlled by you, and you decide 
              when and how to share proofs derived from them.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h4" component="h2" gutterBottom>
        Features
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <VerifiedUserIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="div">
                Manage Credentials
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Store and manage your Ethiopian identity credentials securely.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => onNavigate('credentials')}>
                View Credentials
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <SecurityIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="div">
                Generate Proofs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create zero-knowledge proofs of your nationality for third-party apps.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => onNavigate('proof')}>
                Generate Proof
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="div">
                Lace Wallet Integration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connect to the Lace wallet to submit proofs to Cardano smart contracts.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => onNavigate('proof')}>
                Connect Wallet
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <InfoIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="div">
                About Midnight
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Learn more about the Midnight blockchain and its privacy features.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => onNavigate('info')}>
                Learn More
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" component="h2" gutterBottom>
        Protecting Your Privacy
      </Typography>
      
      <List>
        <ListItem>
          <ListItemIcon>
            <VerifiedUserIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Full Control of Your Data" 
            secondary="Your credentials never leave your device without your explicit consent."
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <SecurityIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Zero-Knowledge Technology" 
            secondary="Prove facts about your identity without revealing sensitive personal information."
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <AccountBalanceWalletIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Blockchain Security" 
            secondary="Proofs are verified on the secure Midnight blockchain infrastructure."
          />
        </ListItem>
      </List>
    </Box>
  );
} 