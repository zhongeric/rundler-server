import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import axios from 'axios'
import { spawn } from 'child_process'
import { createWalletClient, http, verifyMessage } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import * as dotenv from 'dotenv'
import path from 'path'

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '.env.test') })

const BUNDLER_URL = 'http://localhost:3000'
let serverProcess: any

describe('Bundler JSON-RPC Tests', () => {
  beforeAll(async () => {
    // Start the Express server with test environment
    serverProcess = spawn('yarn', ['dev'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        PAYMASTER_VERIFYING_SIGNER_PRIVATE_KEY: process.env.PAYMASTER_VERIFYING_SIGNER_PRIVATE_KEY,
        PAYMASTER_ADDRESS: process.env.PAYMASTER_ADDRESS,
        NODE_HTTP: process.env.NODE_HTTP
      }
    })

    // Simple wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000))
  })

  afterAll(() => {
    // Stop the Express server
    if (serverProcess) {
      serverProcess.kill()
    }
  })

  it('should get supported entry points', async () => {
    const response = await axios.post(BUNDLER_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_supportedEntryPoints',
      params: []
    })
    
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('result')
    expect(Array.isArray(response.data.result)).toBe(true)
  })

  it('should handle gas estimation for invalid user operation', async () => {
    const userOp = {
      sender: '0x0000000000000000000000000000000000000000',
      nonce: '0x0',
      initCode: '0x',
      callData: '0x',
      callGasLimit: '0x0',
      verificationGasLimit: '0x0',
      preVerificationGas: '0x0',
      maxFeePerGas: '0x0',
      maxPriorityFeePerGas: '0x0',
      paymasterAndData: '0x',
      signature: '0x'
    }

    const response = await axios.post(BUNDLER_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_estimateUserOperationGas',
      params: [userOp, '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'] // EntryPoint v0.6
    })
    
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('error')
    expect(response.data.error).toHaveProperty('code')
    expect(response.data.error).toHaveProperty('message')
  })

  it('should handle invalid user operation', async () => {
    const response = await axios.post(BUNDLER_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_estimateUserOperationGas',
      params: [{}, '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789']
    })
    
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('error')
    expect(response.data.error).toHaveProperty('code')
    expect(response.data.error).toHaveProperty('message')
  })

  it('should handle invalid method', async () => {
    const response = await axios.post(BUNDLER_URL, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_invalidMethod',
      params: []
    })
    
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('error')
    expect(response.data.error).toHaveProperty('code')
    expect(response.data.error).toHaveProperty('message')
  })

  it('should sign data with paymaster key', async () => {
    const testData = '0x1234567890abcdef'
    const response = await axios.post(`${BUNDLER_URL}/paymaster/sign`, {
      data: testData
    })
    
    expect(response.status).toBe(200)
    expect(response.data).toHaveProperty('paymaster')
    expect(response.data).toHaveProperty('signature')
    
    // Verify the signature is valid
    const account = privateKeyToAccount(process.env.PAYMASTER_VERIFYING_SIGNER_PRIVATE_KEY as `0x${string}`)
    const walletClient = createWalletClient({
      account,
      transport: http(process.env.NODE_HTTP)
    })
    const recoveredAddress = await verifyMessage({
      address: account.address,
      message: testData,
      signature: response.data.signature
    })
    expect(recoveredAddress).toBe(true)
  })

  it('should handle missing data parameter', async () => {
    try {
      await axios.post(`${BUNDLER_URL}/paymaster/sign`, {})
    } catch (error) {
      if (axios.isAxiosError(error)) {
        expect(error.response?.status).toBe(400)
        expect(error.response?.data).toEqual({ error: 'data parameter is required' })
      } else {
        throw error
      }
    }
  })
}) 