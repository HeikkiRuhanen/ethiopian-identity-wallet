"use client";

import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Divider,
  Button,
  Container,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import BugReportIcon from '@mui/icons-material/BugReport';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CodeIcon from '@mui/icons-material/Code';
import { LaceWalletService } from '../services/LaceWalletService';

const drawerWidth = 280;

interface Page {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const pages: Page[] = [
  { id: 'home', title: 'Home', icon: <HomeIcon /> },
  { id: 'credentials', title: 'My Credentials', icon: <VerifiedUserIcon /> },
  { id: 'proof', title: 'Generate Proof', icon: <SecurityIcon /> },
  { id: 'contract-deployment', title: 'Smart Contracts', icon: <CodeIcon /> },
  { id: 'info', title: 'About', icon: <InfoIcon /> },
  { id: 'wallet-debug', title: 'Wallet Debug', icon: <BugReportIcon /> },
];

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (pageId: string) => void;
}

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handlePageClick = (pageId: string) => {
    onPageChange(pageId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const connectWallet = async () => {
    const connected = await LaceWalletService.connectWallet();
    
    if (connected) {
      const addresses = await LaceWalletService.getWalletAddresses();
      if (addresses.length > 0) {
        setWalletAddress(addresses[0].address);
      }
    }
    
    setWalletConnected(connected);
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" noWrap component="div">
          Ethiopian ID Wallet
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem key={page.id} disablePadding>
            <ListItemButton
              selected={currentPage === page.id}
              onClick={() => handlePageClick(page.id)}
            >
              <ListItemIcon>{page.icon}</ListItemIcon>
              <ListItemText primary={page.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Wallet Status
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: walletConnected ? 'success.main' : 'error.main',
              mr: 1,
            }}
          />
          <Typography variant="body2">
            {walletConnected ? 'Connected' : 'Not Connected'}
          </Typography>
        </Box>
        {walletAddress && (
          <Typography variant="caption" sx={{ 
            display: 'block', 
            wordBreak: 'break-all',
            mb: 2
          }}>
            {`${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`}
          </Typography>
        )}
        <Button
          variant="outlined"
          startIcon={<AccountBalanceWalletIcon />}
          onClick={connectWallet}
          fullWidth
        >
          {walletConnected ? 'Change Wallet' : 'Connect Wallet'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {pages.find(p => p.id === currentPage)?.title || 'Ethiopian Identity Wallet'}
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {!walletConnected && (
              <Button color="inherit" startIcon={<AccountBalanceWalletIcon />} onClick={connectWallet}>
                Connect Wallet
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* This adds the space below the AppBar */}
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
} 