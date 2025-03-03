"use client";

import React, { useEffect, useState } from 'react';

export default function ExtensionDiagnostic() {
  const [windowProperties, setWindowProperties] = useState<string[]>([]);
  const [walletProperties, setWalletProperties] = useState<string[]>([]);
  const [extensionLog, setExtensionLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const logMessage = (message: string) => {
    setExtensionLog(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };

  useEffect(() => {
    // Catalog what's available on window
    try {
      setIsLoading(true);
      logMessage("Starting extension diagnostic...");
      
      // Check window object directly
      const windowProps = Object.getOwnPropertyNames(window)
        .filter(prop => prop.toLowerCase().includes('midnight') || prop.toLowerCase().includes('lace'))
        .sort();
      setWindowProperties(windowProps);
      logMessage(`Found ${windowProps.length} wallet-related window properties: ${windowProps.join(', ')}`);
      
      // Check for the specific wallet object
      if (typeof window.midnightLace !== 'undefined') {
        logMessage("midnightLace object found on window");
        
        // Get properties of the wallet object
        const walletProps = Object.getOwnPropertyNames(window.midnightLace as object)
          .sort();
        setWalletProperties(walletProps);
        logMessage(`Found ${walletProps.length} properties on midnightLace: ${walletProps.join(', ')}`);
        
        // Try to check if the wallet is enabled
        if (typeof window.midnightLace.isEnabled === 'function') {
          logMessage("Calling midnightLace.isEnabled()...");
          window.midnightLace.isEnabled()
            .then(isEnabled => {
              logMessage(`isEnabled() returned: ${isEnabled}`);
            })
            .catch(error => {
              logMessage(`Error in isEnabled(): ${error.message}`);
            });
        } else {
          logMessage("ERROR: midnightLace.isEnabled is not a function!");
        }
      } else {
        logMessage("ERROR: midnightLace object NOT found on window!");
        
        // Check if there's anything else that might be the wallet
        const possibleWalletObjs = Object.getOwnPropertyNames(window)
          .filter(prop => {
            try {
              const value = (window as any)[prop];
              return value && typeof value === 'object' && 
                     (typeof value.enable === 'function' || 
                      typeof value.isEnabled === 'function');
            } catch (e) {
              return false;
            }
          });
        
        if (possibleWalletObjs.length > 0) {
          logMessage(`Found ${possibleWalletObjs.length} possible wallet objects: ${possibleWalletObjs.join(', ')}`);
          possibleWalletObjs.forEach(prop => {
            try {
              const obj = (window as any)[prop];
              const methods = Object.getOwnPropertyNames(obj)
                .filter(name => typeof obj[name] === 'function')
                .join(', ');
              logMessage(`${prop} methods: ${methods}`);
            } catch (e) {
              logMessage(`Error inspecting ${prop}: ${e}`);
            }
          });
        } else {
          logMessage("No alternative wallet objects found");
        }
      }
    } catch (error) {
      logMessage(`Diagnostic error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rerunDiagnostic = () => {
    setExtensionLog([]);
    setWindowProperties([]);
    setWalletProperties([]);
    setIsLoading(true);
    
    // Re-run the diagnostic after a short delay
    setTimeout(() => {
      try {
        logMessage("Re-running extension diagnostic...");
        
        // Check window object directly
        const windowProps = Object.getOwnPropertyNames(window)
          .filter(prop => prop.toLowerCase().includes('midnight') || prop.toLowerCase().includes('lace'))
          .sort();
        setWindowProperties(windowProps);
        logMessage(`Found ${windowProps.length} wallet-related window properties: ${windowProps.join(', ')}`);
        
        if (typeof window.midnightLace !== 'undefined') {
          logMessage("midnightLace object found on window");
          
          // Get properties of the wallet object
          const walletProps = Object.getOwnPropertyNames(window.midnightLace as object).sort();
          setWalletProperties(walletProps);
          logMessage(`Found ${walletProps.length} properties on midnightLace: ${walletProps.join(', ')}`);
          
          // Try to connect to the wallet
          if (typeof window.midnightLace.enable === 'function') {
            logMessage("Attempting to connect with midnightLace.enable()...");
            window.midnightLace.enable()
              .then(result => {
                logMessage(`enable() returned: ${result}`);
                
                // If successfully connected, try to get network ID
                if (result && typeof window.midnightLace?.getNetworkId === 'function') {
                  return window.midnightLace.getNetworkId();
                }
                return null;
              })
              .then(networkId => {
                if (networkId) {
                  logMessage(`Connected to network: ${networkId}`);
                }
              })
              .catch(error => {
                logMessage(`Error connecting to wallet: ${error.message}`);
              });
          }
        } else {
          logMessage("ERROR: midnightLace object NOT found on window!");
        }
      } catch (error) {
        logMessage(`Diagnostic error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    }, 100);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Extension Connection Diagnostic</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Wallet on Window Object</h3>
          <div className="mb-2">
            <span className="font-medium">Status: </span>
            {isLoading ? (
              <span className="text-blue-500">Checking...</span>
            ) : windowProperties.includes('midnightLace') ? (
              <span className="text-green-600">Found</span>
            ) : (
              <span className="text-red-600">Not Found</span>
            )}
          </div>
          
          <div className="bg-gray-100 p-3 rounded">
            <p className="font-medium mb-1">Wallet-related window properties:</p>
            {windowProperties.length > 0 ? (
              <code className="block whitespace-pre-wrap">{windowProperties.join(', ')}</code>
            ) : (
              <p className="text-gray-500 italic">None found</p>
            )}
          </div>
        </div>
        
        {walletProperties.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Wallet API Methods</h3>
            <div className="bg-gray-100 p-3 rounded">
              <code className="block whitespace-pre-wrap">{walletProperties.join(', ')}</code>
            </div>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-medium mb-2">Diagnostic Log</h3>
          <div className="bg-black text-green-400 p-3 rounded font-mono text-sm h-60 overflow-y-auto">
            {extensionLog.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
            {isLoading && <div className="animate-pulse">Running diagnostic...</div>}
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={rerunDiagnostic}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Running...' : 'Run Diagnostic Again'}
          </button>
          
          <div className="text-sm text-gray-500">
            This tool attempts to connect directly to the Lace wallet extension
          </div>
        </div>
      </div>
    </div>
  );
} 