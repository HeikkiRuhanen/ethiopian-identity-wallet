"use client";

import React, { useEffect, useState } from 'react';
import { LaceWalletService } from '../services/LaceWalletService';

export default function WalletStatus() {
  const [isAvailable, setIsAvailable] = useState<boolean | undefined>(undefined);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkWalletStatus = async () => {
    try {
      setErrorMessage(null);
      
      // Check if wallet is available
      const available = await LaceWalletService.isWalletAvailable();
      setIsAvailable(available);
      
      if (!available) {
        return;
      }
      
      // Try to connect to get status
      const connected = await LaceWalletService.connectWallet();
      setIsConnected(connected);
      
      if (connected) {
        // Get addresses
        const walletAddresses = await LaceWalletService.getWalletAddresses();
        setAddresses(walletAddresses.map(addr => addr.address));
      }
    } catch (error) {
      console.error('Error checking wallet status:', error);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  useEffect(() => {
    checkWalletStatus();
  }, []);

  const handleConnect = async () => {
    try {
      setErrorMessage(null);
      const connected = await LaceWalletService.connectWallet();
      setIsConnected(connected);
      
      if (connected) {
        // Get addresses
        const walletAddresses = await LaceWalletService.getWalletAddresses();
        setAddresses(walletAddresses.map(addr => addr.address));
      } else {
        setErrorMessage('Failed to connect to wallet.');
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Midnight Lace Wallet</h2>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{errorMessage}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <p>
          <span className="font-medium">Wallet Available: </span>
          {isAvailable === undefined ? (
            <span className="text-gray-500">Checking...</span>
          ) : isAvailable ? (
            <span className="text-green-600">Yes</span>
          ) : (
            <span className="text-red-600">No - Please install the Midnight Lace wallet extension</span>
          )}
        </p>
        
        <p>
          <span className="font-medium">Connection Status: </span>
          {isConnected ? (
            <span className="text-green-600">Connected</span>
          ) : (
            <span className="text-yellow-600">Not Connected</span>
          )}
        </p>
        
        {isAvailable && !isConnected && (
          <button
            onClick={handleConnect}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Connect Wallet
          </button>
        )}
        
        {isConnected && addresses.length > 0 && (
          <div>
            <p className="font-medium">Your Addresses:</p>
            <ul className="list-disc list-inside ml-4">
              {addresses.map((addr, index) => (
                <li key={index} className="text-sm break-all">
                  {addr}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <button
          onClick={checkWalletStatus}
          className="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
} 