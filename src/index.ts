import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const app = express();
const PORT = process.env.PORT || 3000;
const RUNDLER_URL = process.env.RUNDLER_URL || 'http://localhost:8545';
const PAYMASTER_VERIFYING_SIGNER_PRIVATE_KEY = process.env.PAYMASTER_VERIFYING_SIGNER_PRIVATE_KEY;
const PAYMASTER_ADDRESS = process.env.PAYMASTER_ADDRESS;
const NODE_HTTP = process.env.NODE_HTTP;

if (!PAYMASTER_VERIFYING_SIGNER_PRIVATE_KEY) {
  throw new Error('PAYMASTER_VERIFYING_SIGNER_PRIVATE_KEY not set in environment');
}

if (!PAYMASTER_ADDRESS) {
  throw new Error('PAYMASTER_ADDRESS not set in environment');
}

if (!NODE_HTTP) {
  throw new Error('NODE_HTTP not set in environment');
}

// Create signer from private key
const account = privateKeyToAccount(PAYMASTER_VERIFYING_SIGNER_PRIVATE_KEY as `0x${string}`);
const walletClient = createWalletClient({
  account,
  transport: http(NODE_HTTP)
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Proxy all JSON-RPC requests to Rundler
app.post('/', async (req: Request, res: Response) => {
  try {
    const response = await axios.post(RUNDLER_URL, req.body);
    res.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
    } else {
      res.status(500).json({ error: (error as Error).message });
    }
  }
});

// Get paymaster info and sign data
app.post('/paymaster/sign', async (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'data parameter is required' });
    }

    // Sign the data
    const signature = await walletClient.signMessage({
      message: data
    });

    res.json({
      paymaster: PAYMASTER_ADDRESS,
      signature
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check if Rundler is accessible
    await axios.post(RUNDLER_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_supportedEntryPoints',
      params: []
    });
    res.json({ status: 'healthy', rundler: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', rundler: 'disconnected', error: (error as Error).message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
  console.log(`Connected to Rundler at ${RUNDLER_URL}`);
});