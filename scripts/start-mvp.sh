#!/bin/bash

# Shifty Platform MVP Startup Script
# This script starts the backend services for development

set -e

echo "🚀 Starting Shifty Platform MVP Backend Services"
echo "=================================================="

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop and try again.${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not available. Please install Docker Compose.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building and starting services...${NC}"

# Start the platform services
echo -e "${GREEN}🔧 Starting core infrastructure (PostgreSQL, Redis, Ollama)...${NC}"
docker-compose up -d platform-db redis ollama

echo -e "${GREEN}⏳ Waiting for database to be ready...${NC}"
sleep 10

# Check if database is ready
while ! docker-compose exec -T platform-db pg_isready -U postgres >/dev/null 2>&1; do
    echo "Waiting for database..."
    sleep 2
done

echo -e "${GREEN}✅ Database is ready${NC}"

# Start AI services
echo -e "${GREEN}🤖 Starting AI services...${NC}"
docker-compose up -d ollama

echo -e "${GREEN}⏳ Waiting for Ollama to be ready...${NC}"
sleep 15

# Pull AI models
echo -e "${GREEN}📥 Pulling AI models (this may take a few minutes on first run)...${NC}"
docker-compose exec ollama ollama pull llama3.1 || echo "Model pull failed, continuing..."

# Start backend services
echo -e "${GREEN}🏗️ Starting backend services...${NC}"
docker-compose up -d auth-service tenant-manager ai-orchestrator test-generator healing-engine

echo -e "${GREEN}⏳ Waiting for services to be ready...${NC}"
sleep 20

# Start API Gateway
echo -e "${GREEN}🌐 Starting API Gateway...${NC}"
docker-compose up -d api-gateway

echo -e "${GREEN}⏳ Final startup check...${NC}"
sleep 10

# Health check function
check_service() {
    local service_name=$1
    local service_url=$2
    local max_attempts=30
    local attempt=1

    echo -e "${YELLOW}🔍 Checking ${service_name}...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "${service_url}/health" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ ${service_name} is healthy${NC}"
            return 0
        fi
        
        echo "Attempt ${attempt}/${max_attempts} - ${service_name} not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ ${service_name} failed to start properly${NC}"
    return 1
}

# Check all services
echo -e "${YELLOW}🏥 Running health checks...${NC}"

# API Gateway (main entry point)
check_service "API Gateway" "http://localhost:3000"

# Individual services
check_service "Auth Service" "http://localhost:3002"  
check_service "Tenant Manager" "http://localhost:3001"
check_service "AI Orchestrator" "http://localhost:3003"
check_service "Test Generator" "http://localhost:3004"
check_service "Healing Engine" "http://localhost:3005"

# Display service status
echo ""
echo -e "${GREEN}🎉 Shifty Platform MVP Backend is ready!${NC}"
echo "============================================="
echo ""
echo -e "${YELLOW}📋 Service Endpoints:${NC}"
echo "• API Gateway:      http://localhost:3000"
echo "  - Health:         http://localhost:3000/health"
echo "  - API Docs:       http://localhost:3000/api/docs"
echo ""
echo "• Auth Service:     http://localhost:3002"
echo "• Tenant Manager:   http://localhost:3001" 
echo "• AI Orchestrator:  http://localhost:3003"
echo "• Test Generator:   http://localhost:3004"
echo "• Healing Engine:   http://localhost:3005"
echo ""
echo -e "${YELLOW}🔧 Development URLs:${NC}"
echo "• PostgreSQL:       localhost:5432 (postgres/postgres)"
echo "• Redis:            localhost:6379"
echo "• Ollama AI:        localhost:11434"
echo ""
echo -e "${YELLOW}📚 Quick Start API Examples:${NC}"
echo ""
echo "# Register a new tenant:"
echo "curl -X POST http://localhost:3000/api/v1/auth/register \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"admin@example.com\",\"password\":\"password123\",\"firstName\":\"Admin\",\"lastName\":\"User\",\"tenantName\":\"Example Corp\"}'"
echo ""
echo "# Generate a test:"
echo "curl -X POST http://localhost:3000/api/v1/tests/generate \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\"
echo "  -d '{\"url\":\"https://example.com\",\"requirements\":\"Test the login functionality\",\"testType\":\"e2e\"}'"
echo ""
echo "# Heal a broken selector:"
echo "curl -X POST http://localhost:3000/api/v1/healing/heal-selector \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\"
echo "  -d '{\"url\":\"https://example.com\",\"brokenSelector\":\"#old-button-id\"}'"
echo ""

# Show logs command
echo -e "${YELLOW}📜 To view logs:${NC}"
echo "docker-compose logs -f [service-name]"
echo ""
echo -e "${YELLOW}🛑 To stop all services:${NC}"
echo "docker-compose down"
echo ""

echo -e "${GREEN}✨ Happy testing with AI! ✨${NC}"