# Rundler Server

An Express server that proxies JSON-RPC requests to an ERC-4337 bundler and provides paymaster signing capabilities.

## Features

- JSON-RPC proxy to Rundler bundler
- Paymaster signing service
- Health check endpoint

## API Endpoints

### JSON-RPC Proxy
- `POST /` - Proxies all JSON-RPC requests to the Rundler bundler
  - Supports all standard ERC-4337 bundler methods (eth_sendUserOperation, eth_estimateUserOperationGas, etc.)

### Paymaster Service
- `POST /paymaster/sign` - Signs data with the paymaster's private key
  - Request body: `{ data: string }`
  - Response: `{ paymaster: string, signature: string }`

### Health Check
- `GET /health` - Health check endpoint that verifies connection to Rundler

## Environment Variables

- `PORT` - Port for the Express server (default: 3000)
- `RUNDLER_URL` - URL of the Rundler bundler (default: http://localhost:8545)
- `PAYMASTER_VERIFYING_SIGNER_PRIVATE_KEY` - Private key for signing paymaster data
- `PAYMASTER_ADDRESS` - Address of the paymaster contract
- `NODE_HTTP` - HTTP RPC URL for the Ethereum network

## Development

### Prerequisites

- Node.js (v18+)
- Yarn
- Docker (for containerization)

### Local Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

The Express server will run on http://localhost:3000.

## Docker Setup

### Using Docker Compose

```bash
# Start the services
docker-compose up
```

This will start both the Express server and Rundler components. 
- The Express server will be accessible at http://localhost:3000
- The Rundler RPC service will be accessible at http://localhost:8545

### Environment Variables

Make sure to set the following environment variables in your `.env` file:
- `RUNDLER_URL` - URL of the Rundler bundler (default: http://localhost:8545)
- `PAYMASTER_VERIFYING_SIGNER_PRIVATE_KEY` - Private key for signing paymaster data
- `PAYMASTER_ADDRESS` - Address of the paymaster contract
- `NODE_HTTP` - HTTP RPC URL for the Ethereum network

## Testing

The project includes a comprehensive test suite using Vitest:

```bash
# Run tests
yarn test
```

Tests cover:
- JSON-RPC proxy functionality
- Paymaster signing service
- Error handling
- Invalid request handling

## Example Usage

### JSON-RPC Request

```bash
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "eth_supportedEntryPoints",
    "params": []
  }'
```

### Paymaster Signing

```bash
curl -X POST http://localhost:3000/paymaster/sign \
  -H "Content-Type: application/json" \
  -d '{
    "data": "0x1234567890abcdef"
  }'
```

## Architecture

The server consists of two main components:

1. **Express Server (Port 3000)**: 
   - Proxies JSON-RPC requests to Rundler
   - Provides paymaster signing service
   - Implements health checks

2. **Rundler (Port 8545)**:
   - ERC-4337 bundler that processes UserOperations
   - Handles all standard bundler JSON-RPC methods