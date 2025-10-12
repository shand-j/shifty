#!/bin/bash

# Shifty Platform - Quick Start for Development
# Starts all required services and validates the system

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo "🚀 Starting Shifty Platform Development Environment"
echo "================================================="
echo

# Start required services
print_status "Starting required services..."

# Start PostgreSQL
print_status "Ensuring PostgreSQL is running..."
brew services start postgresql@14 > /dev/null 2>&1 || print_warning "PostgreSQL may already be running"

# Start Redis
print_status "Ensuring Redis is running..."
brew services start redis > /dev/null 2>&1 || print_warning "Redis may already be running"

# Start Ollama
print_status "Ensuring Ollama is running..."
brew services start ollama > /dev/null 2>&1 || print_warning "Ollama may already be running"

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 3

# Verify services are running
print_status "Verifying services..."

# Check PostgreSQL
if psql shifty_platform -c "SELECT 1;" > /dev/null 2>&1; then
    print_success "PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready. Run setup script: ./scripts/setup-local-development.sh"
    exit 1
fi

# Check Redis
if redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is ready"
else
    echo "❌ Redis is not ready. Check if it's installed: brew install redis"
    exit 1
fi

# Check Ollama
if ollama list > /dev/null 2>&1; then
    print_success "Ollama is ready"
else
    echo "❌ Ollama is not ready. Check if it's installed: brew install ollama"
    exit 1
fi

echo
print_success "All dependencies are ready!"
echo

# Start the development servers
print_status "Starting Shifty Platform services..."
echo
echo "This will start all 6 microservices:"
echo "  • API Gateway     (port 3000)"
echo "  • Tenant Manager  (port 3001)" 
echo "  • Auth Service    (port 3002)"
echo "  • AI Orchestrator (port 3003)"
echo "  • Test Generator  (port 3004)"
echo "  • Healing Engine  (port 3005)"
echo
echo "Press Ctrl+C to stop all services"
echo

# Change to project directory and start development
npm run dev