# Tenant Manager Service Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY packages/shared packages/shared
COPY packages/database packages/database
COPY services/tenant-manager/package.json services/tenant-manager/

# Install all dependencies
RUN npm ci

# Copy source code
COPY services/tenant-manager services/tenant-manager
COPY packages packages

# Build the service
RUN npm run build --workspace=@shifty/shared
RUN npm run build --workspace=@shifty/database  
RUN npm run build --workspace=@shifty/tenant-manager

# Create non-root user
RUN addgroup --system --gid 1001 shifty
RUN adduser --system --uid 1001 shifty

# Change ownership
RUN chown -R shifty:shifty /app

# Switch to non-root user
USER shifty

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "services/tenant-manager/dist/index.js"]