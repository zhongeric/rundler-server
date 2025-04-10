const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const RUNDLER_URL = process.env.RUNDLER_URL || 'http://localhost:8545';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helper function to call Rundler's JSON-RPC API
async function callRundlerRPC(method, params = []) {
  try {
    const response = await axios.post(RUNDLER_URL, {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error calling Rundler RPC ${method}:`, error.message);
    throw new Error(`Rundler RPC error: ${error.message}`);
  }
}

// ERC-4337 ENDPOINTS

// Get supported entry points
app.get('/api/bundler/entrypoints', async (req, res) => {
  try {
    const result = await callRundlerRPC('eth_supportedEntryPoints');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send user operation
app.post('/api/bundler/user-operation', async (req, res) => {
  try {
    const { userOp, entryPoint } = req.body;
    
    if (!userOp || !entryPoint) {
      return res.status(400).json({ error: 'userOp and entryPoint are required' });
    }
    
    const result = await callRundlerRPC('eth_sendUserOperation', [userOp, entryPoint]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user operation receipt
app.get('/api/bundler/receipt/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    if (!hash) {
      return res.status(400).json({ error: 'Operation hash is required' });
    }
    
    const result = await callRundlerRPC('eth_getUserOperationReceipt', [hash]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user operation by hash
app.get('/api/bundler/operation/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    if (!hash) {
      return res.status(400).json({ error: 'Operation hash is required' });
    }
    
    const result = await callRundlerRPC('eth_getUserOperationByHash', [hash]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Estimate user operation gas
app.post('/api/bundler/estimate-gas', async (req, res) => {
  try {
    const { userOp, entryPoint } = req.body;
    
    if (!userOp || !entryPoint) {
      return res.status(400).json({ error: 'userOp and entryPoint are required' });
    }
    
    const result = await callRundlerRPC('eth_estimateUserOperationGas', [userOp, entryPoint]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check if Rundler is accessible
    await callRundlerRPC('eth_supportedEntryPoints');
    res.json({ status: 'healthy', rundler: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', rundler: 'disconnected', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
  console.log(`Connected to Rundler at ${RUNDLER_URL}`);
});