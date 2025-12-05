FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json turbo.json ./
COPY services/auth-service/package.json ./services/auth-service/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY services/auth-service ./services/auth-service
COPY packages ./packages

# Build the application
RUN npm run build --workspace=@shifty/auth-service

# Expose port
EXPOSE 3002

# Set working directory to auth-service
WORKDIR /app/services/auth-service

# Start the service
CMD ["npm", "start"]