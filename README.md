# Rundler Server

A simple Express server with Docker support.

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a task by ID
- `POST /api/tasks` - Create a new task (requires a JSON body with a `name` field)

## Development

### Prerequisites

- Node.js (v14+)
- Yarn
- Docker (for containerization)

### Local Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

The server will run on http://localhost:3000.

## Docker

### Build the Docker Image

```bash
docker build -t rundler-server .
```

### Run the Docker Container

```bash
docker run -p 3000:3000 rundler-server
```

The server will be accessible at http://localhost:3000.

### Running in Detached Mode

```bash
docker run -d -p 3000:3000 --name rundler rundler-server
```

### Stop the Container

```bash
docker stop rundler
```

## Testing the API

You can test the API using curl:

```bash
# Get all tasks
curl http://localhost:3000/api/tasks

# Create a new task
curl -X POST -H "Content-Type: application/json" -d '{"name":"New Task"}' http://localhost:3000/api/tasks
```