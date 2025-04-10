# Rundler Server

An Express server with Alchemy Rundler ERC-4337 bundler integration.

## API Endpoints

### ERC-4337 Bundler API
- `GET /api/bundler/entrypoints` - Get supported entry points
- `POST /api/bundler/user-operation` - Send user operation
- `GET /api/bundler/receipt/:hash` - Get user operation receipt
- `GET /api/bundler/operation/:hash` - Get user operation by hash
- `POST /api/bundler/estimate-gas` - Estimate user operation gas
- `GET /health` - Health check endpoint

## Development

### Prerequisites

- Node.js (v14+)
- Yarn
- Docker (for containerization)
- Ethereum RPC endpoint

### Local Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

The Express server will run on http://localhost:3000.

## Docker Setup

There are two approaches to run this project: using Docker Compose (recommended) or running the components separately.

### Option 1: Using Docker Compose (Recommended)

This option runs both the Express server and Rundler in Docker containers, properly connected to each other.

#### Setting up the environment

Copy the example environment file and edit it with your values:

```bash
cp .env.example .env
```

Then edit the `.env` file with your specific values:
- `ETH_RPC_URL`: Your Ethereum Sepolia RPC URL (e.g., from Alchemy)
- `BUNDLER_PRIVATE_KEY`: Private key for the bundler account (must have ETH on Sepolia)
- `CHAIN_ID`: Set to 11155111 for Sepolia (already set in the example)

#### Running the services

```bash
# Start the services
docker-compose up
```

This will start both the Express server and Rundler components. 
- The Express server will be accessible at http://localhost:3001 
- The Rundler RPC service will be accessible at http://localhost:8545 and http://localhost:8080 (metrics)

### Option 2: Running Components Separately

#### Run just the Express server:

```bash
docker build -t rundler-server .
docker run -p 3000:3000 \
  -e RUNDLER_URL=http://host.docker.internal:8545 \
  rundler-server
```

In this setup, the Express server expects Rundler to be running separately on port 8545.

#### Run Rundler separately:

You can run Rundler directly using Docker:

```bash
docker pull ghcr.io/alchemyplatform/rundler:latest
docker run -p 8545:8545 \
  ghcr.io/alchemyplatform/rundler:latest \
  node rpc \
  --entry-points 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789 \
  --rpc-url https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY \
  --private-key 0xYOUR_PRIVATE_KEY \
  --pool-size 1 \
  --max-verification 100 \
  --chain-id 11155111
```

#### Running in Detached Mode

```bash
# For Docker Compose
docker-compose up -d

# For individual containers
docker run -d -p 3000:3000 \
  -e RUNDLER_URL=http://YOUR_RUNDLER_HOST:8545 \
  --name rundler-server \
  rundler-server
```

### Stop the Container

```bash
docker stop rundler-server
```

## Testing the API

### API Examples

```bash
# Get supported entry points
curl http://localhost:3000/api/bundler/entrypoints

# Check health
curl http://localhost:3000/health

# Send a user operation
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "userOp": {
      "sender": "0x...",
      "nonce": "0x...",
      "initCode": "0x...",
      "callData": "0x...",
      "callGasLimit": "0x...",
      "verificationGasLimit": "0x...",
      "preVerificationGas": "0x...",
      "maxFeePerGas": "0x...",
      "maxPriorityFeePerGas": "0x...",
      "paymasterAndData": "0x...",
      "signature": "0x..."
    },
    "entryPoint": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
  }' \
  http://localhost:3000/api/bundler/user-operation
```

## Architecture

This server consists of two components:

1. **Express Server (Port 3000)**: Provides a RESTful API that translates to RPC calls for Rundler
2. **Rundler (Port 3001)**: ERC-4337 bundler that processes UserOperations

The Express server acts as a middleware that communicates with the Rundler bundler via JSON-RPC.