#!/bin/bash

# Shifty Platform - Local Development Setup
# This script sets up all required dependencies for running Shifty locally

set -e  # Exit on any error

echo "🚀 Setting up Shifty Platform for Local Development"
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Homebrew is installed
check_homebrew() {
    if ! command -v brew &> /dev/null; then
        print_error "Homebrew is not installed. Please install it first:"
        echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    print_success "Homebrew is installed"
}

# Install Node.js and npm
setup_nodejs() {
    print_status "Setting up Node.js..."
    
    if ! command -v node &> /dev/null; then
        print_status "Installing Node.js..."
        brew install node
    fi
    
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    print_success "Node.js $NODE_VERSION and npm $NPM_VERSION are ready"
}

# Install and configure PostgreSQL
setup_postgresql() {
    print_status "Setting up PostgreSQL..."
    
    # Install PostgreSQL if not present
    if ! brew services list | grep -q postgresql@14; then
        print_status "Installing PostgreSQL 14..."
        brew install postgresql@14
    fi
    
    # Start PostgreSQL service
    print_status "Starting PostgreSQL service..."
    brew services start postgresql@14
    
    # Wait a moment for service to start
    sleep 3
    
    # Create postgres user if it doesn't exist
    print_status "Creating postgres user..."
    createuser -s postgres 2>/dev/null || print_warning "postgres user already exists"
    
    # Set password for postgres user
    psql postgres -c "ALTER USER postgres PASSWORD 'postgres';" 2>/dev/null || true
    
    # Create databases
    print_status "Creating Shifty databases..."
    createdb shifty_platform 2>/dev/null || print_warning "shifty_platform database already exists"
    createdb shifty 2>/dev/null || print_warning "shifty database already exists"
    
    # Initialize database schema
    print_status "Initializing database schema..."
    if [ -f "infrastructure/docker/init-platform-db.sql" ]; then
        psql shifty_platform -f infrastructure/docker/init-platform-db.sql > /dev/null
        print_success "Database schema initialized"
    else
        print_warning "Database initialization script not found"
    fi
}

# Install and start Redis
setup_redis() {
    print_status "Setting up Redis..."
    
    # Install Redis if not present
    if ! command -v redis-server &> /dev/null; then
        print_status "Installing Redis..."
        brew install redis
    fi
    
    # Start Redis service
    print_status "Starting Redis service..."
    brew services start redis
    
    print_success "Redis is running on port 6379"
}

# Install and setup Ollama for AI features
setup_ollama() {
    print_status "Setting up Ollama for AI features..."
    
    # Install Ollama if not present
    if ! command -v ollama &> /dev/null; then
        print_status "Installing Ollama..."
        brew install ollama
    fi
    
    # Start Ollama service
    print_status "Starting Ollama service..."
    brew services start ollama || ollama serve &
    
    # Wait for Ollama to start
    sleep 5
    
    # Pull required models
    print_status "Pulling AI models (this may take a while)..."
    ollama pull llama3.1:8b
    ollama pull codellama:7b
    
    print_success "Ollama is ready with AI models"
}

# Install project dependencies
setup_project_dependencies() {
    print_status "Installing project dependencies..."
    
    # Install root dependencies
    npm install
    
    # Build shared packages
    print_status "Building shared packages..."
    npm run build
    
    print_success "Project dependencies installed and built"
}

# Verify system setup
verify_setup() {
    print_status "Verifying system setup..."
    
    # Check PostgreSQL
    if psql shifty_platform -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "PostgreSQL connection: OK"
    else
        print_error "PostgreSQL connection: FAILED"
        return 1
    fi
    
    # Check Redis
    if redis-cli ping > /dev/null 2>&1; then
        print_success "Redis connection: OK"  
    else
        print_error "Redis connection: FAILED"
        return 1
    fi
    
    # Check Ollama
    if ollama list > /dev/null 2>&1; then
        print_success "Ollama service: OK"
    else
        print_error "Ollama service: FAILED"
        return 1
    fi
    
    # Check Node.js build
    if [ -d "node_modules" ]; then
        print_success "Node.js dependencies: OK"
    else
        print_error "Node.js dependencies: FAILED"
        return 1
    fi
    
    return 0
}

# Create environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    cat > .env.local << EOF
# Shifty Platform - Local Development Environment
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shifty_platform
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=shifty_platform

# Redis Configuration  
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=dev-secret-change-in-production-$(openssl rand -hex 32)

# Service Ports
API_GATEWAY_PORT=3000
TENANT_MANAGER_PORT=3001
AUTH_SERVICE_PORT=3002
AI_ORCHESTRATOR_PORT=3003
TEST_GENERATOR_PORT=3004
HEALING_ENGINE_PORT=3005

# AI Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Development Settings
NODE_ENV=development
LOG_LEVEL=info
EOF

    print_success "Environment configuration created (.env.local)"
}

# Main setup function
main() {
    echo
    print_status "Starting Shifty Platform setup..."
    echo
    
    # Run setup steps
    check_homebrew
    setup_nodejs
    setup_postgresql
    setup_redis  
    setup_ollama
    setup_project_dependencies
    setup_environment
    
    echo
    print_status "Verifying installation..."
    if verify_setup; then
        echo
        print_success "🎉 Shifty Platform setup completed successfully!"
        echo
        echo "Next steps:"
        echo "  1. Run 'npm run dev' to start all services"
        echo "  2. Visit http://localhost:3000/health to verify API Gateway"
        echo "  3. Test user registration: curl -X POST http://localhost:3002/api/v1/auth/register ..."
        echo
        echo "Service URLs:"
        echo "  • API Gateway:     http://localhost:3000"
        echo "  • Tenant Manager:  http://localhost:3001" 
        echo "  • Auth Service:    http://localhost:3002"
        echo "  • AI Orchestrator: http://localhost:3003"
        echo "  • Test Generator:  http://localhost:3004"
        echo "  • Healing Engine:  http://localhost:3005"
        echo
    else
        print_error "Setup verification failed. Please check the errors above."
        exit 1
    fi
}

# Run main function
main "$@"