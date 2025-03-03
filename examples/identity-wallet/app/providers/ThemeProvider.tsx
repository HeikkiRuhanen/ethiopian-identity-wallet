"use client";

import React, { createContext, useState, useMemo, useContext, ReactNode } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { PaletteMode } from '@mui/material';

type ColorMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ColorMode;
  toggleColorMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ColorMode>('light');

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode as PaletteMode,
          primary: {
            main: '#2563eb', // Blue
            light: '#3b82f6',
            dark: '#1d4ed8',
          },
          secondary: {
            main: '#10b981', // Green
            light: '#34d399',
            dark: '#059669',
          },
          error: {
            main: '#ef4444',
          },
          warning: {
            main: '#f59e0b',
          },
          info: {
            main: '#3b82f6',
          },
          success: {
            main: '#10b981',
          },
          background: {
            default: mode === 'light' ? '#f8fafc' : '#0f172a',
            paper: mode === 'light' ? '#ffffff' : '#1e293b',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 700,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
          button: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
              contained: {
                '&:hover': {
                  boxShadow: 'none',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: mode === 'light' 
                  ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  : '0 1px 3px 0 rgb(0 0 0 / 0.25), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: mode === 'light' 
                  ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  : '0 1px 3px 0 rgb(0 0 0 / 0.25), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light' 
                  ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  : '0 1px 3px 0 rgb(0 0 0 / 0.25), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
                color: mode === 'light' ? '#0f172a' : '#f8fafc',
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
                borderRight: `1px solid ${mode === 'light' ? '#e2e8f0' : '#334155'}`,
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                margin: '4px 8px',
                '&.Mui-selected': {
                  backgroundColor: mode === 'light' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.2)',
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 8,
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={colorMode}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
} 