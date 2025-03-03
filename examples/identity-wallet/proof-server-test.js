// Simple script to test the proof server connection
import fetch from 'node-fetch';
import pino from 'pino';

// Setup logging
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty'
  }
});

// Configuration
const config = {
  proofServer: 'http://localhost:6300',
};

// Test the proof server connection
async function testProofServer() {
  logger.info('Testing connection to proof server at: ' + config.proofServer);
  
  try {
    // Try to get the health endpoint
    const healthResponse = await fetch(`${config.proofServer}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      logger.info('Proof server health check successful:', healthData);
    } else {
      logger.warn(`Health endpoint returned status: ${healthResponse.status}`);
      logger.warn('Response:', await healthResponse.text());
    }
    
    // Try to get the API endpoints
    logger.info('Checking available API endpoints...');
    
    // Common endpoints to check
    const endpointsToCheck = [
      '/api',
      '/api/v1',
      '/api/v1/prove',
      '/api/v1/circuits',
      '/api/v1/status',
      '/docs',
      '/swagger'
    ];
    
    for (const endpoint of endpointsToCheck) {
      try {
        const response = await fetch(`${config.proofServer}${endpoint}`);
        logger.info(`Endpoint ${endpoint}: Status ${response.status}`);
        
        if (response.ok) {
          try {
            const data = await response.json();
            logger.info(`Response from ${endpoint}:`, data);
          } catch (e) {
            logger.info(`Response from ${endpoint} (not JSON):`, await response.text());
          }
        }
      } catch (error) {
        logger.error(`Error checking endpoint ${endpoint}:`, error.message);
      }
    }
    
    return { success: true };
  } catch (error) {
    logger.error('Error connecting to proof server:', error);
    return { success: false, error: error.message };
  }
}

// Execute the test
testProofServer()
  .then(result => {
    if (result.success) {
      logger.info('Proof server test completed successfully');
    } else {
      logger.error('Proof server test failed:', result.error);
    }
  })
  .catch(error => {
    logger.error('Unexpected error during test:', error);
  }); 