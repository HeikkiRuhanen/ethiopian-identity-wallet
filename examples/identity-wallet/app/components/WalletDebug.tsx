"use client";

import React, { useEffect, useState } from 'react';
import { LaceWalletService } from '../services/LaceWalletService';

const WalletDebug = () => {
  const [walletInfo, setWalletInfo] = useState({
    isPresent: false,
    structure: {} as any,
    debugInfo: "",
    walletApi: null as any,
    connectAttempt: "",
    addressAttempt: "",
    walletState: {} as any,
  });

  useEffect(() => {
    const checkWallet = async () => {
      try {
        // Check for various possible wallet structures
        const windowWallet = {
          hasMidnight: !!window.midnight,
          hasMidnightLace: !!window.midnightLace,
          midnightKeys: window.midnight ? Object.keys(window.midnight) : [],
          midnightLaceKeys: window.midnightLace ? Object.keys(window.midnightLace) : [],
          midnightMnLace: window.midnight?.mnLace ? Object.keys(window.midnight.mnLace) : [],
          midnightLaceMnLace: window.midnightLace?.mnLace ? Object.keys(window.midnightLace.mnLace) : [],
        };

        // Get the wallet API (either from midnight.mnLace or midnightLace.mnLace)
        let walletApi = null;
        if (window.midnight?.mnLace) {
          walletApi = window.midnight.mnLace;
        } else if (window.midnightLace?.mnLace) {
          walletApi = window.midnightLace.mnLace;
        }

        // Get wallet state information
        const walletState = LaceWalletService.getWalletState();

        setWalletInfo(prev => ({
          ...prev,
          isPresent: !!(window.midnight || window.midnightLace),
          structure: windowWallet,
          walletState,
          walletApi: walletApi ? {
            isObject: typeof walletApi === 'object',
            keys: walletApi ? Object.keys(walletApi) : [],
            hasEnable: typeof walletApi?.enable === 'function',
            hasIsEnabled: typeof walletApi?.isEnabled === 'function',
            hasExperimental: !!walletApi?.experimental,
          } : null
        }));
      } catch (error) {
        setWalletInfo(prev => ({
          ...prev,
          debugInfo: `Error checking wallet: ${error instanceof Error ? error.message : String(error)}`
        }));
      }
    };

    // Run immediately and set up interval
    checkWallet();
    const interval = setInterval(checkWallet, 2000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  const testWalletConnect = async () => {
    try {
      setWalletInfo(prev => ({ ...prev, connectAttempt: "Attempting to connect..." }));
      const result = await LaceWalletService.connectWallet();
      setWalletInfo(prev => ({ 
        ...prev, 
        connectAttempt: `Connection result: ${result ? "Connected successfully" : "Connection failed"}` 
      }));
    } catch (error) {
      setWalletInfo(prev => ({ 
        ...prev, 
        connectAttempt: `Error connecting: ${error instanceof Error ? error.message : String(error)}` 
      }));
    }
  };

  const testGetAddresses = async () => {
    try {
      setWalletInfo(prev => ({ ...prev, addressAttempt: "Fetching addresses..." }));
      const addresses = await LaceWalletService.getWalletAddresses();
      setWalletInfo(prev => ({ 
        ...prev, 
        addressAttempt: `Found ${addresses.length} addresses: ${JSON.stringify(addresses, null, 2)}` 
      }));
    } catch (error) {
      setWalletInfo(prev => ({ 
        ...prev, 
        addressAttempt: `Error getting addresses: ${error instanceof Error ? error.message : String(error)}` 
      }));
    }
  };

  // Helper function to display nested object structure
  const renderObjectStructure = (obj: any, level = 0): JSX.Element => {
    if (!obj || typeof obj !== 'object') {
      return <span>{String(obj)}</span>;
    }

    return (
      <ul style={{ listStyleType: 'none', paddingLeft: level * 20 + 'px', margin: '0' }}>
        {Object.entries(obj).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong>{' '}
            {typeof value === 'object' ? (
              renderObjectStructure(value, level + 1)
            ) : (
              String(value)
            )}
          </li>
        ))}
      </ul>
    );
  };

  // Function to test health endpoints
  const [healthResults, setHealthResults] = useState({
    proofServer: '',
    testing: false
  });

  const testEndpoints = async () => {
    setHealthResults({ ...healthResults, testing: true });
    
    try {
      const proofServerUrl = process.env.NEXT_PUBLIC_PROOF_SERVER_URL || 'http://localhost:59115';
      const proofResponse = await fetch(`${proofServerUrl}/health`);
      const proofText = await proofResponse.text();
      setHealthResults({
        proofServer: proofText,
        testing: false
      });
    } catch (error) {
      setHealthResults({
        proofServer: `Error: ${error instanceof Error ? error.message : String(error)}`,
        testing: false
      });
    }
  };

  return (
    <div className="bg-slate-100 p-4 rounded-md text-sm my-4">
      <h2 className="text-lg font-semibold mb-2">Wallet Debug Information</h2>
      
      <div className="mb-4">
        <h3 className="font-medium text-md">Wallet Object Present:</h3>
        <p className="my-1">{walletInfo.isPresent ? "Yes - Wallet object detected" : "No - Wallet not found"}</p>
        {walletInfo.isPresent && (
          <div className="my-2 p-2 bg-white rounded">
            <pre className="text-xs overflow-auto">{JSON.stringify(walletInfo.structure, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-md">Wallet API (mnLace):</h3>
        {walletInfo.walletApi ? (
          <div className="my-2 p-2 bg-white rounded">
            <pre className="text-xs overflow-auto">{JSON.stringify(walletInfo.walletApi, null, 2)}</pre>
          </div>
        ) : (
          <p className="my-1 text-red-500">No mnLace API object found</p>
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-md">Wallet State:</h3>
        <div className="my-2 p-2 bg-white rounded">
          <pre className="text-xs overflow-auto">{JSON.stringify(walletInfo.walletState, null, 2)}</pre>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-medium text-md">Debug Information:</h3>
        <p className="my-1">{walletInfo.debugInfo || "No issues detected"}</p>
      </div>

      <div className="mb-4 flex gap-4">
        <button 
          onClick={testWalletConnect}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Test Connect
        </button>
        <button 
          onClick={testGetAddresses}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          Test Get Addresses
        </button>
        <button 
          onClick={testEndpoints}
          className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          disabled={healthResults.testing}
        >
          Test Endpoints
        </button>
      </div>

      {walletInfo.connectAttempt && (
        <div className="mb-4">
          <h3 className="font-medium text-md">Connect Test:</h3>
          <p className="my-1">{walletInfo.connectAttempt}</p>
        </div>
      )}

      {walletInfo.addressAttempt && (
        <div className="mb-4">
          <h3 className="font-medium text-md">Address Test:</h3>
          <pre className="my-1 whitespace-pre-wrap">{walletInfo.addressAttempt}</pre>
        </div>
      )}

      {healthResults.proofServer && (
        <div className="mb-4">
          <h3 className="font-medium text-md">Endpoint Test:</h3>
          <p className="my-1">Proof Server: {healthResults.proofServer}</p>
        </div>
      )}
    </div>
  );
};

export default WalletDebug; 