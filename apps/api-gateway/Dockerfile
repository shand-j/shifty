FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json turbo.json ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/api-gateway ./apps/api-gateway
COPY packages ./packages

# Build the application
RUN npm run build --workspace=@shifty/api-gateway

# Expose port
EXPOSE 3000

# Set working directory to api-gateway
WORKDIR /app/apps/api-gateway

# Start the service
CMD ["npm", "start"]