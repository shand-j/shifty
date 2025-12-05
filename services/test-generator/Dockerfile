FROM node:20-alpine

# Install Playwright browsers
RUN apk add --no-cache \
    chromium \
    firefox \
    webkit2gtk \
    && rm -rf /var/cache/apk/*

# Set browser paths for Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/bin
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PLAYWRIGHT_FIREFOX_EXECUTABLE_PATH=/usr/bin/firefox

WORKDIR /app

# Copy package files
COPY package.json turbo.json ./
COPY services/test-generator/package.json ./services/test-generator/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY services/test-generator ./services/test-generator
COPY packages ./packages

# Build the application
RUN npm run build --workspace=@shifty/test-generator

# Expose port
EXPOSE 3004

# Set working directory to test-generator
WORKDIR /app/services/test-generator

# Start the service
CMD ["npm", "start"]