// Identity Wallet Bridge Server
// This server connects the Identity Wallet DApp with the Identity Wallet CLI

import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server configuration
const PORT = process.env.PORT || 3500;

// Path to the CLI executable (relative to this file)
const CLI_DIR = path.resolve(__dirname, '../../identity-wallet/identity-wallet-cli');
const CLI_DIST = path.join(CLI_DIR, 'dist/cli.js');
const WALLET_CONFIG_PATH = path.join(CLI_DIR, '.wallet-credentials.json');
const PUBLIC_DIR = path.join(__dirname, '../public');

// MIME types for serving static files
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Utility to run CLI commands
const runCLI = (command, args = []) => {
  return new Promise((resolve, reject) => {
    console.log(`Running CLI command: ${command} ${args.join(' ')}`);
    const cmd = `node ${CLI_DIST} ${command} ${args.join(' ')}`;
    
    exec(cmd, { cwd: CLI_DIR }, (error, stdout, stderr) => {
      if (error) {
        console.error(`CLI Error: ${error.message}`);
        return reject({ error: error.message, stderr, stdout });
      }
      
      console.log(`CLI Output: ${stdout}`);
      
      if (stderr) {
        console.warn(`CLI Warning: ${stderr}`);
      }
      
      resolve({ stdout, stderr });
    });
  });
};

// Serve static files
const serveStaticFile = (filePath, res) => {
  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404 - File Not Found');
      } else {
        res.writeHead(500);
        res.end('500 - Internal Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
};

// Parse JSON from request body
const parseJsonBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        if (body) {
          resolve(JSON.parse(body));
        } else {
          resolve({});
        }
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
};

// Send JSON response
const sendJsonResponse = (res, data, status = 200) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// Allow CORS (Cross-Origin Resource Sharing)
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// Handle API requests
const handleApiRequest = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  // Set CORS headers for all API requests
  setCorsHeaders(res);
  
  // Handle OPTIONS requests (preflight CORS)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  try {
    // Health check endpoint
    if (pathname === '/api/health' && req.method === 'GET') {
      sendJsonResponse(res, { status: 'ok', message: 'Identity Wallet Bridge is running' });
      return;
    }
    
    // Proof generation endpoint
    if (pathname === '/api/prove' && req.method === 'POST') {
      try {
        // Parse request body
        const requestData = await parseJsonBody(req);
        const { contractName, functionName, inputs } = requestData;
        
        console.log(`Generating proof for ${contractName}.${functionName} with inputs:`, inputs);
        
        // For Ethiopian nationality verification
        if (contractName === 'ethiopian_nationality_verification') {
          if (functionName === 'verify_and_record_nationality') {
            const credential = inputs.credential;
            
            // Basic validation
            if (!credential || !credential.nationality) {
              sendJsonResponse(res, {
                success: false,
                error: 'Invalid credential data'
              });
              return;
            }

            const isEthiopian = credential.nationality.toLowerCase() === 'ethiopian';
            const notExpired = credential.expiresAt > Date.now() / 1000;
            const isValid = isEthiopian && notExpired;

            // Create mock proof data
            const mockProof = {
              pi_a: ["123456789", "987654321", "1"],
              pi_b: [["123456789", "987654321"], ["123456789", "987654321"], ["1", "0"]],
              pi_c: ["123456789", "987654321", "1"],
              protocol: "groth16",
              publicInputs: [isValid ? "1" : "0", "0", "1"],
              publicOutput: isValid ? "1" : "0"
            };

            sendJsonResponse(res, {
              success: true,
              publicOutput: isValid ? "1" : "0",
              proof: mockProof
            });
            return;
          }
        }
        
        // Default fallback for unsupported contracts/functions
        sendJsonResponse(res, {
          success: false,
          error: `Unsupported contract or function: ${contractName}.${functionName}`,
        });
      } catch (error) {
        console.error('Error generating proof:', error);
        sendJsonResponse(res, { 
          success: false, 
          error: error.message || 'Unknown error during proof generation'
        }, 500);
      }
      return;
    }
    
    // Proof verification endpoint
    if (pathname === '/api/verify' && req.method === 'POST') {
      try {
        // Parse request body
        const requestData = await parseJsonBody(req);
        const { contractName, functionName, proof } = requestData;
        
        console.log(`Verifying proof for ${contractName}.${functionName}`);
        
        // Always return success for mock verification
        sendJsonResponse(res, {
          success: true,
          verified: true
        });
      } catch (error) {
        console.error('Error verifying proof:', error);
        sendJsonResponse(res, { 
          success: false, 
          error: error.message || 'Unknown error during proof verification'
        }, 500);
      }
      return;
    }
    
    // Connect to wallet
    if (pathname === '/api/wallet/connect' && req.method === 'POST') {
      console.log('Initiating wallet connection...');
      
      try {
        const result = await runCLI('wallet-connect');
        
        // Check if wallet credentials file exists after connection
        if (fs.existsSync(WALLET_CONFIG_PATH)) {
          const walletInfo = JSON.parse(fs.readFileSync(WALLET_CONFIG_PATH, 'utf8'));
          sendJsonResponse(res, { 
            success: true, 
            message: 'Wallet connected successfully', 
            walletInfo,
            output: result.stdout
          });
        } else {
          sendJsonResponse(res, { 
            success: false, 
            message: 'Wallet connection process completed but no credentials were saved',
            output: result.stdout
          });
        }
      } catch (error) {
        console.error('Error connecting to wallet:', error);
        sendJsonResponse(res, { 
          success: false, 
          error: error.error || 'Unknown error',
          output: error.stdout
        }, 500);
      }
      
      return;
    }
    
    // Get wallet info
    if (pathname === '/api/wallet/info' && req.method === 'GET') {
      try {
        // First check if the wallet credentials file exists
        if (fs.existsSync(WALLET_CONFIG_PATH)) {
          const walletInfo = JSON.parse(fs.readFileSync(WALLET_CONFIG_PATH, 'utf8'));
          
          // Run the CLI command to get wallet info
          const result = await runCLI('wallet-info');
          
          sendJsonResponse(res, {
            success: true,
            walletInfo,
            output: result.stdout
          });
        } else {
          sendJsonResponse(res, { 
            success: false, 
            message: 'No wallet credentials found. Please connect to a wallet first.' 
          });
        }
      } catch (error) {
        console.error('Error getting wallet info:', error);
        sendJsonResponse(res, { 
          success: false, 
          error: error.error || 'Unknown error',
          output: error.stdout 
        }, 500);
      }
      
      return;
    }
    
    // Simulate deploy contract
    if (pathname === '/api/contract/simulate-deploy' && req.method === 'POST') {
      try {
        const result = await runCLI('simulate-deploy');
        
        // Try to extract contract address from output
        const addressMatch = result.stdout.match(/contract would be at address: ([^\n]+)/);
        const contractAddress = addressMatch ? addressMatch[1].trim() : null;
        
        sendJsonResponse(res, {
          success: true,
          contractAddress,
          output: result.stdout
        });
      } catch (error) {
        console.error('Error simulating contract deployment:', error);
        sendJsonResponse(res, { 
          success: false, 
          error: error.error || 'Unknown error',
          output: error.stdout 
        }, 500);
      }
      
      return;
    }
    
    // API endpoint not found
    sendJsonResponse(res, { error: 'Endpoint not found' }, 404);
    
  } catch (error) {
    console.error('Server error:', error);
    sendJsonResponse(res, { error: 'Internal server error' }, 500);
  }
};

// Create HTTP server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  // Handle API requests
  if (pathname.startsWith('/api/')) {
    handleApiRequest(req, res);
    return;
  }
  
  // Serve static files from public directory
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If the file doesn't exist, try to serve index.html
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
    
    serveStaticFile(filePath, res);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Identity Wallet Bridge server running on port ${PORT}`);
  console.log(`API is available at http://localhost:${PORT}/api`);
  console.log(`Web interface available at http://localhost:${PORT}`);
  console.log(`CLI path: ${CLI_DIST}`);
  
  // Check if CLI exists
  if (fs.existsSync(CLI_DIST)) {
    console.log('✅ CLI executable found');
  } else {
    console.error('❌ CLI executable not found at', CLI_DIST);
  }
}); 