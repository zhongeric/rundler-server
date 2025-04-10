import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios, { AxiosError } from 'axios';

interface UserOperation {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}

interface RPCResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

const app = express();
const PORT = process.env.PORT || 3000;
const RUNDLER_URL = process.env.RUNDLER_URL || 'http://localhost:8545';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helper function to call Rundler's JSON-RPC API
async function callRundlerRPC(method: string, params: any[] = []): Promise<RPCResponse> {
  try {
    const response = await axios.post(RUNDLER_URL, {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    });
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(`Error calling Rundler RPC ${method}:`, axiosError.message);
    throw new Error(`Rundler RPC error: ${axiosError.message}`);
  }
}

// ERC-4337 ENDPOINTS

// Get supported entry points
app.get('/api/bundler/entrypoints', async (req: Request, res: Response) => {
  try {
    const result = await callRundlerRPC('eth_supportedEntryPoints');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Send user operation
app.post('/api/bundler/user-operation', async (req: Request, res: Response) => {
  try {
    const { userOp, entryPoint } = req.body as { userOp: UserOperation; entryPoint: string };
    
    if (!userOp || !entryPoint) {
      return res.status(400).json({ error: 'userOp and entryPoint are required' });
    }
    
    const result = await callRundlerRPC('eth_sendUserOperation', [userOp, entryPoint]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get user operation receipt
app.get('/api/bundler/receipt/:hash', async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;
    
    if (!hash) {
      return res.status(400).json({ error: 'Operation hash is required' });
    }
    
    const result = await callRundlerRPC('eth_getUserOperationReceipt', [hash]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get user operation by hash
app.get('/api/bundler/operation/:hash', async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;
    
    if (!hash) {
      return res.status(400).json({ error: 'Operation hash is required' });
    }
    
    const result = await callRundlerRPC('eth_getUserOperationByHash', [hash]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Estimate user operation gas
app.post('/api/bundler/estimate-gas', async (req: Request, res: Response) => {
  try {
    const { userOp, entryPoint } = req.body as { userOp: UserOperation; entryPoint: string };
    
    if (!userOp || !entryPoint) {
      return res.status(400).json({ error: 'userOp and entryPoint are required' });
    }
    
    const result = await callRundlerRPC('eth_estimateUserOperationGas', [userOp, entryPoint]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check if Rundler is accessible
    await callRundlerRPC('eth_supportedEntryPoints');
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