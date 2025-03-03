// wallet-connector.ts
// Connect to Midnight Lace Wallet and retrieve wallet information

/**
 * Creates an HTML page for connecting to the wallet
 * This is designed to be opened in a browser where the wallet extension is available
 */
export function createWalletConnectorHtml(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Midnight Wallet Connector</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
    }
    button {
      background-color: #4CAF50;
      color: white;
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin: 10px 0;
    }
    button:hover {
      background-color: #45a049;
    }
    pre {
      background-color: #f8f8f8;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    .status {
      margin: 20px 0;
      padding: 10px;
      border-radius: 4px;
    }
    .success {
      background-color: #dff0d8;
      color: #3c763d;
    }
    .error {
      background-color: #f2dede;
      color: #a94442;
    }
    .info {
      background-color: #d9edf7;
      color: #31708f;
    }
    #consoleOutput {
      height: 200px;
      overflow-y: auto;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Midnight Wallet Connector</h1>
    <p>This tool connects to your Midnight Lace wallet to retrieve necessary information for the CLI.</p>
    
    <div class="status info" id="walletStatus">Checking for Midnight Lace wallet...</div>
    
    <button id="connectWallet">Connect Wallet</button>
    <button id="detectWallet">Detect Wallet</button>
    <button id="sendToCLI">Send Details to CLI</button>
    <button id="copyDetails">Copy Details to Clipboard</button>
    
    <div id="walletDetails" style="display: none;">
      <h3>Wallet Details</h3>
      <p><strong>Address:</strong> <span id="walletAddress">-</span></p>
      <p><strong>Coin Public Key:</strong> <span id="coinPublicKey">-</span></p>
      <p><strong>Network:</strong> <span id="networkId">-</span></p>
      <p><strong>Wallet Object:</strong> <code id="walletObject">-</code></p>
    </div>
    
    <div id="consoleOutput">
      <h3>Console Log</h3>
      <pre id="consoleLog"></pre>
    </div>
  </div>

  <script>
    // Override console.log to also display in the UI
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const consoleLogElement = document.getElementById('consoleLog');
    
    console.log = function() {
      originalConsoleLog.apply(console, arguments);
      const args = Array.from(arguments).map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      );
      consoleLogElement.innerHTML += args.join(' ') + '\\n';
      consoleLogElement.scrollTop = consoleLogElement.scrollHeight;
    };
    
    console.error = function() {
      originalConsoleError.apply(console, arguments);
      const args = Array.from(arguments).map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      );
      consoleLogElement.innerHTML += 'ERROR: ' + args.join(' ') + '\\n';
      consoleLogElement.scrollTop = consoleLogElement.scrollHeight;
    };
    
    // Elements
    const walletStatus = document.getElementById('walletStatus');
    const walletDetails = document.getElementById('walletDetails');
    const connectWalletBtn = document.getElementById('connectWallet');
    const detectWalletBtn = document.getElementById('detectWallet');
    const sendToCLIBtn = document.getElementById('sendToCLI');
    const copyDetailsBtn = document.getElementById('copyDetails');
    
    // Wallet information
    let walletInfo = null;
    
    // Detect wallet availability
    function detectWallet() {
      console.log("Checking for wallet...");
      walletStatus.textContent = "Checking for Midnight Lace wallet...";
      walletStatus.className = "status info";
      
      // Check for window.midnight
      if (window.midnight) {
        console.log("window.midnight exists:", window.midnight);
        document.getElementById('walletObject').textContent = "window.midnight found";
        
        if (window.midnight.mnLace) {
          console.log("window.midnight.mnLace exists:", Object.keys(window.midnight.mnLace));
          document.getElementById('walletObject').textContent = "window.midnight.mnLace found: " + 
            Object.keys(window.midnight.mnLace).join(", ");
          
          walletStatus.textContent = "Midnight Lace wallet detected!";
          walletStatus.className = "status success";
          return true;
        } else {
          walletStatus.textContent = "window.midnight exists but mnLace is not found";
          walletStatus.className = "status error";
        }
      } 
      // Check alternative locations
      else if (window.midnightLace) {
        console.log("window.midnightLace exists:", Object.keys(window.midnightLace));
        document.getElementById('walletObject').textContent = "window.midnightLace found: " + 
          Object.keys(window.midnightLace).join(", ");
        
        walletStatus.textContent = "Midnight Lace wallet detected via window.midnightLace!";
        walletStatus.className = "status success";
        return true;
      } else {
        console.log("Midnight Lace wallet not detected");
        walletStatus.textContent = "Midnight Lace wallet not found. Please install and enable it in your browser.";
        walletStatus.className = "status error";
        return false;
      }
    }
    
    // Connect to wallet and get information
    async function connectWallet() {
      console.log("Attempting to connect to wallet...");
      walletStatus.textContent = "Connecting to wallet...";
      walletStatus.className = "status info";
      
      try {
        // First try window.midnight
        if (window.midnight && window.midnight.mnLace) {
          console.log("Connecting via window.midnight.mnLace");
          const mnLace = window.midnight.mnLace;
          
          // Try to enable the wallet if needed
          if (typeof mnLace.enable === 'function') {
            const enabled = await mnLace.enable();
            console.log("Wallet enabled:", enabled);
          }
          
          // Get accounts/addresses
          let addresses = [];
          if (typeof mnLace.getAccounts === 'function') {
            addresses = await mnLace.getAccounts();
          } else if (typeof mnLace.getUsedAddresses === 'function') {
            addresses = await mnLace.getUsedAddresses();
          } else if (typeof mnLace.getRewardAddresses === 'function') {
            addresses = await mnLace.getRewardAddresses();
          }
          
          if (addresses.length === 0) {
            throw new Error("No addresses found in wallet");
          }
          
          console.log("Addresses found:", addresses);
          const walletAddress = addresses[0];
          
          // Try to get coin public key
          let coinPublicKey;
          if (typeof mnLace.getCoinPublicKey === 'function') {
            coinPublicKey = await mnLace.getCoinPublicKey();
          } else {
            console.log("getCoinPublicKey method not found, trying alternatives");
            
            // Check for other possible methods or properties
            if (mnLace.coinPublicKey) {
              coinPublicKey = mnLace.coinPublicKey;
            } else if (mnLace.publicKey) {
              coinPublicKey = mnLace.publicKey;
            }
          }
          
          // Get network ID
          let networkId;
          if (typeof mnLace.getNetworkId === 'function') {
            networkId = await mnLace.getNetworkId();
          }
          
          walletInfo = {
            address: walletAddress,
            coinPublicKey: coinPublicKey || "Not available",
            networkId: networkId || "Unknown"
          };
        } 
        // Try alternative access via window.midnightLace
        else if (window.midnightLace) {
          console.log("Connecting via window.midnightLace");
          const midnightLace = window.midnightLace;
          
          // Try to enable the wallet if needed
          if (typeof midnightLace.enable === 'function') {
            const enabled = await midnightLace.enable();
            console.log("Wallet enabled:", enabled);
          }
          
          // Get addresses
          let addresses = [];
          if (typeof midnightLace.getUsedAddresses === 'function') {
            addresses = await midnightLace.getUsedAddresses();
          } else if (typeof midnightLace.getRewardAddresses === 'function') {
            addresses = await midnightLace.getRewardAddresses();
          }
          
          if (addresses.length === 0) {
            throw new Error("No addresses found in wallet");
          }
          
          console.log("Addresses found:", addresses);
          const walletAddress = addresses[0];
          
          // Try to get coin public key
          let coinPublicKey;
          if (typeof midnightLace.getCoinPublicKey === 'function') {
            coinPublicKey = await midnightLace.getCoinPublicKey();
          } else {
            console.log("getCoinPublicKey method not found");
            
            // Check for other possible properties
            if (midnightLace.coinPublicKey) {
              coinPublicKey = midnightLace.coinPublicKey;
            } else if (midnightLace.publicKey) {
              coinPublicKey = midnightLace.publicKey;
            }
          }
          
          // Get network ID
          let networkId;
          if (typeof midnightLace.getNetworkId === 'function') {
            networkId = await midnightLace.getNetworkId();
          }
          
          walletInfo = {
            address: walletAddress,
            coinPublicKey: coinPublicKey || "Not available",
            networkId: networkId || "Unknown"
          };
        } else {
          throw new Error("Midnight Lace wallet not found");
        }
        
        // Update UI with wallet info
        if (walletInfo) {
          document.getElementById('walletAddress').textContent = walletInfo.address;
          document.getElementById('coinPublicKey').textContent = walletInfo.coinPublicKey;
          document.getElementById('networkId').textContent = walletInfo.networkId;
          walletDetails.style.display = 'block';
          
          walletStatus.textContent = "Successfully connected to wallet!";
          walletStatus.className = "status success";
          
          console.log("Wallet info:", walletInfo);
        } else {
          throw new Error("Failed to retrieve wallet information");
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error);
        walletStatus.textContent = "Error connecting to wallet: " + error.message;
        walletStatus.className = "status error";
      }
    }
    
    // Send wallet details to CLI server
    async function sendToCLI() {
      if (!walletInfo) {
        walletStatus.textContent = "No wallet information available to send";
        walletStatus.className = "status error";
        return;
      }
      
      try {
        // Send to the CLI server API endpoint
        const response = await fetch('/api/wallet-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(walletInfo)
        });
        
        const result = await response.json();
        
        if (result.success) {
          walletStatus.textContent = "Wallet details sent to CLI successfully! You can close this window.";
          walletStatus.className = "status success";
        } else {
          walletStatus.textContent = "Failed to send details: " + result.message;
          walletStatus.className = "status error";
        }
      } catch (error) {
        console.error("Error sending details to CLI:", error);
        walletStatus.textContent = "Error sending details to CLI: " + error.message;
        walletStatus.className = "status error";
      }
    }
    
    // Copy wallet details to clipboard
    function copyDetails() {
      if (!walletInfo) {
        walletStatus.textContent = "No wallet information available to copy";
        walletStatus.className = "status error";
        return;
      }
      
      const text = JSON.stringify(walletInfo, null, 2);
      
      // Create a temporary textarea to copy text
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        walletStatus.textContent = "Wallet details copied to clipboard!";
        walletStatus.className = "status success";
      } catch (err) {
        walletStatus.textContent = "Failed to copy: " + err;
        walletStatus.className = "status error";
      }
      
      document.body.removeChild(textarea);
    }
    
    // Event listeners
    detectWalletBtn.addEventListener('click', detectWallet);
    connectWalletBtn.addEventListener('click', connectWallet);
    sendToCLIBtn.addEventListener('click', sendToCLI);
    copyDetailsBtn.addEventListener('click', copyDetails);
    
    // Initialize
    window.addEventListener('load', () => {
      detectWallet();
      console.log("Wallet connector loaded.");
    });
  </script>
</body>
</html>
  `;
} 