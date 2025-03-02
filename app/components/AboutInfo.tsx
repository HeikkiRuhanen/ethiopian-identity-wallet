"use client";

import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Link, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';

export default function AboutInfo() {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        About Midnight & This Project
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Learn more about the technology behind this Ethiopian Identity Wallet
      </Typography>
      
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              What is Midnight?
            </Typography>
            
            <Typography variant="body1" paragraph>
              Midnight is a privacy-focused sidechain for the Cardano ecosystem that enables confidential smart 
              contracts. It allows developers to build applications that protect sensitive commercial and personal data.
            </Typography>
            
            <Typography variant="body1" paragraph>
              Using zero-knowledge cryptography, Midnight makes it possible to prove certain facts 
              without revealing the underlying data. For example, you can prove you're an Ethiopian 
              national without exposing your personal identification details.
            </Typography>
            
            <Box sx={{ my: 4 }}>
              <Typography variant="h5" gutterBottom>
                Key Features of Midnight
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PrivacyTipIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Privacy-First Architecture" 
                    secondary="Built from the ground up with privacy as a core design principle."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Zero-Knowledge Proofs" 
                    secondary="Allows verification of facts without revealing sensitive information."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Smart Contract Compatibility" 
                    secondary="Integrates with Cardano's smart contract ecosystem."
                  />
                </ListItem>
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Typography variant="h4" gutterBottom>
        About This Identity Wallet
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Project Overview
              </Typography>
              
              <Typography variant="body1" paragraph>
                This Ethiopian Identity Wallet demonstrates how Midnight's zero-knowledge 
                technology can be applied to real-world identity verification challenges.
              </Typography>
              
              <Typography variant="body1" paragraph>
                It allows Ethiopian citizens to:
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Store their identity credentials securely as W3C Verifiable Credentials" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Generate zero-knowledge proofs of nationality" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Submit these proofs to Cardano smart contracts" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Access services that require nationality verification without compromising privacy" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Technical Implementation
              </Typography>
              
              <Typography variant="body1" paragraph>
                This application integrates the following technologies:
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Midnight Blockchain" 
                    secondary="For generating and verifying zero-knowledge proofs"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="W3C Verifiable Credentials" 
                    secondary="For standardized identity credential management"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Lace Wallet Integration" 
                    secondary="For interacting with Cardano smart contracts"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Next.js & React" 
                    secondary="Front-end framework for the user interface"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 6 }} />
      
      <Typography variant="h5" gutterBottom>
        Learn More
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Midnight Documentation
            </Typography>
            <Typography variant="body2" paragraph>
              Explore the official documentation for Midnight blockchain.
            </Typography>
            <Link href="https://input-output-hk.github.io/midnight/" target="_blank" rel="noopener">
              View Documentation →
            </Link>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              W3C Verifiable Credentials
            </Typography>
            <Typography variant="body2" paragraph>
              Learn about the W3C standard for digital credentials.
            </Typography>
            <Link href="https://www.w3.org/TR/vc-data-model/" target="_blank" rel="noopener">
              View Standard →
            </Link>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cardano Developer Portal
            </Typography>
            <Typography variant="body2" paragraph>
              Resources for building on the Cardano blockchain.
            </Typography>
            <Link href="https://developers.cardano.org/" target="_blank" rel="noopener">
              Visit Portal →
            </Link>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 