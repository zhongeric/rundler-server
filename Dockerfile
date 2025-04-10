# Use a single-stage build for simplicity
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source files
COPY . .

# Build TypeScript
RUN yarn build

# Expose port
EXPOSE 3000

# Set environment variables with defaults
# Note: These will be overridden by docker-compose
ENV RUNDLER_URL=http://localhost:8545

# Start the application
CMD ["yarn", "start"]