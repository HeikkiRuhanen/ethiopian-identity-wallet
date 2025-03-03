"use client";

import { useEffect, useState } from "react";
import { LaceWalletService } from "../services/LaceWalletService";

// Interface for wallet connection status
interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  addresses: { id: string; address: string; isMock?: boolean }[];
  hasRealAddresses: boolean;
}

// Wallet connection component
export default function WalletConnection() {
  // State for tracking wallet connection status
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    error: null,
    addresses: [],
    hasRealAddresses: false
  });

  // Function to connect to the wallet with error handling
  const connectWallet = async () => {
    try {
      setStatus((prev) => ({ ...prev, connecting: true, error: null }));
      
      // First check if the wallet is available
      const isAvailable = await LaceWalletService.isWalletAvailable();
      if (!isAvailable) {
        setStatus((prev) => ({
          ...prev,
          connecting: false,
          error: "Midnight Lace wallet extension is not available. Please install and enable it in your browser."
        }));
        return;
      }
      
      // Connect to the wallet
      const connected = await LaceWalletService.connectWallet();
      
      if (connected) {
        // Get addresses from the wallet
        const addresses = await LaceWalletService.getWalletAddresses();
        const hasRealAddresses = addresses.length > 0 && !addresses.some(addr => addr.isMock);
        
        // Update status with connection info
        setStatus({
          connected: true,
          connecting: false,
          error: null,
          addresses,
          hasRealAddresses
        });
        
        // Log connection details for debugging
        console.log('Wallet connected successfully');
        console.log('Addresses:', addresses);
      } else {
        const walletState = LaceWalletService.getWalletState();
        setStatus((prev) => ({
          ...prev,
          connecting: false,
          error: `Failed to connect to wallet. ${walletState.lastError ? 'Error: ' + walletState.lastError : 'Please try again.'}`
        }));
      }
    } catch (error) {
      // Handle connection errors
      console.error("Error connecting to wallet:", error);
      setStatus((prev) => ({
        ...prev,
        connecting: false,
        error: `Error connecting to wallet: ${error instanceof Error ? error.message : String(error)}`
      }));
    }
  };

  // Automatically try to connect to the wallet when component mounts
  useEffect(() => {
    const autoConnect = async () => {
      try {
        // Check if the wallet is available before attempting to connect
        const isAvailable = await LaceWalletService.isWalletAvailable();
        if (isAvailable) {
          await connectWallet();
        } else {
          console.log("Wallet not available for auto-connect");
        }
      } catch (error) {
        console.error("Auto-connect error:", error);
      }
    };

    autoConnect();
  }, []);

  // Render the wallet connection UI
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>

      {/* Connection status display */}
      <div className="mb-4">
        <p className="font-medium">Status:</p>
        {status.connecting ? (
          <p className="text-blue-600 mt-1">Connecting to wallet...</p>
        ) : status.connected ? (
          <p className="text-green-600 mt-1">Connected</p>
        ) : (
          <p className="text-red-600 mt-1">Not Connected</p>
        )}
      </div>

      {/* Wallet addresses section */}
      {status.addresses.length > 0 && (
        <div className="mb-4">
          <p className="font-medium">Wallet Addresses:</p>
          <ul className="list-disc list-inside mt-1 ml-2">
            {status.addresses.map((addr) => (
              <li key={addr.id} className={addr.isMock ? "text-orange-600" : "text-green-600"}>
                {addr.address.substring(0, 15)}...{addr.address.substring(addr.address.length - 10)} 
                {addr.isMock && <span className="text-xs text-orange-600 ml-2">(Mock)</span>}
              </li>
            ))}
          </ul>
          {status.addresses.some(addr => addr.isMock) && (
            <p className="text-orange-600 text-sm mt-2">
              Note: Mock addresses are being shown because the wallet is not fully loaded or is unavailable.
            </p>
          )}
        </div>
      )}

      {/* Error message display */}
      {status.error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          <p className="font-medium">Error:</p>
          <p className="mt-1">{status.error}</p>
        </div>
      )}

      {/* Connection button */}
      <button
        onClick={connectWallet}
        disabled={status.connecting}
        className={`w-full px-4 py-2 mt-2 rounded font-medium ${
          status.connecting
            ? "bg-gray-300 cursor-not-allowed"
            : status.connected
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {status.connecting
          ? "Connecting..."
          : status.connected
          ? "Reconnect Wallet"
          : "Connect Wallet"}
      </button>
    </div>
  );
} 