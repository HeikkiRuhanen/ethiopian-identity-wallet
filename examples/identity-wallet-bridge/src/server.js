// Identity Wallet Bridge Server - Simplified version
// This server connects the Identity Wallet DApp with the Identity Wallet CLI

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Server configuration
const PORT = process.env.PORT || 3500;

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
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
};

// Handle requests
const handleRequest = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Health check endpoint
  if (pathname === '/health' && req.method === 'GET') {
    sendJsonResponse(res, { status: 'ok', message: 'Identity Wallet Bridge is running' });
    return;
  }
  
  // API endpoints
  if (pathname === '/api/health' && req.method === 'GET') {
    sendJsonResponse(res, { status: 'ok', message: 'Identity Wallet Bridge API is running' });
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

  // Default 404 for unknown routes
  res.writeHead(404);
  res.end('404 - Not Found');
};

// Create and start the server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Identity Wallet Bridge running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Proof generation: http://localhost:${PORT}/api/prove`);
  console.log(`Proof verification: http://localhost:${PORT}/api/verify`);
}); 