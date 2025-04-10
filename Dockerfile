# Use a single-stage build for simplicity
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Expose Express server port
EXPOSE 3000

# Set environment variables with defaults
# Note: These will be overridden by docker-compose
ENV RUNDLER_URL=http://localhost:8545

# Start the Express server
CMD ["yarn", "start"]