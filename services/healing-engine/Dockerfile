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
COPY services/healing-engine/package.json ./services/healing-engine/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY services/healing-engine ./services/healing-engine
COPY packages ./packages

# Build the application
RUN npm run build --workspace=@shifty/healing-engine

# Expose port
EXPOSE 3005

# Set working directory to healing-engine
WORKDIR /app/services/healing-engine

# Start the service
CMD ["npm", "start"]