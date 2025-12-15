#!/bin/bash
#
# Shifty Platform Health Check Script
# 
# Validates all services are running and accessible.
# Use this after running start-mvp.sh to verify the platform is ready.
#

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Shifty Platform Health Check Validator           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check HTTP service health
check_http_service() {
    local service_name=$1
    local service_url=$2
    local max_attempts=${3:-3}
    local timeout=${4:-3}
    
    ((TOTAL_CHECKS++))
    
    echo -n "Checking ${service_name}... "
    
    for ((i=1; i<=max_attempts; i++)); do
        if curl -sf --max-time "$timeout" "${service_url}" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ Healthy${NC}"
            ((PASSED_CHECKS++))
            return 0
        fi
        
        if [ $i -lt $max_attempts ]; then
            sleep 1
        fi
    done
    
    echo -e "${RED}✗ Failed${NC} (${service_url})"
    ((FAILED_CHECKS++))
    return 1
}

# Function to check Docker container
check_container() {
    local container_name=$1
    
    ((TOTAL_CHECKS++))
    
    echo -n "Checking container ${container_name}... "
    
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        local status=$(docker inspect --format='{{.State.Status}}' "${container_name}")
        if [ "$status" = "running" ]; then
            echo -e "${GREEN}✓ Running${NC}"
            ((PASSED_CHECKS++))
            return 0
        else
            echo -e "${RED}✗ Not running (status: ${status})${NC}"
            ((FAILED_CHECKS++))
            return 1
        fi
    else
        echo -e "${RED}✗ Not found${NC}"
        ((FAILED_CHECKS++))
        return 1
    fi
}

# Function to check database
check_database() {
    ((TOTAL_CHECKS++))
    
    echo -n "Checking PostgreSQL database... "
    
    # Check if container exists first
    if ! docker ps --format '{{.Names}}' | grep -q "^shifty-platform-db$"; then
        echo -e "${RED}✗ Container not found${NC}"
        echo "  ${RED}→ Run: docker-compose up -d platform-db${NC}"
        ((FAILED_CHECKS++))
        return 1
    fi
    
    if docker exec shifty-platform-db pg_isready -U postgres >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Ready${NC}"
        ((PASSED_CHECKS++))
        
        # Check if test user exists
        ((TOTAL_CHECKS++))
        echo -n "Checking test user (test@shifty.com)... "
        
        local user_count=$(docker exec shifty-platform-db psql -U postgres -d shifty_platform -tAc \
            "SELECT COUNT(*) FROM users WHERE email = 'test@shifty.com';" 2>/dev/null || echo "0")
        
        if [ "$user_count" -gt 0 ]; then
            echo -e "${GREEN}✓ Exists${NC}"
            ((PASSED_CHECKS++))
        else
            echo -e "${YELLOW}⚠ Not found${NC}"
            echo "  ${YELLOW}→ Run seed data script or create user manually${NC}"
            ((FAILED_CHECKS++))
        fi
        
        # Check if orchestration tables exist
        ((TOTAL_CHECKS++))
        echo -n "Checking orchestration tables (migration 015)... "
        
        local table_count=$(docker exec shifty-platform-db psql -U postgres -d shifty_platform -tAc \
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('test_runs', 'test_results', 'test_shards');" 2>/dev/null || echo "0")
        
        if [ "$table_count" -eq 3 ]; then
            echo -e "${GREEN}✓ Present${NC}"
            ((PASSED_CHECKS++))
        else
            echo -e "${RED}✗ Missing${NC}"
            echo "  ${RED}→ Run: docker exec -i shifty-platform-db psql -U postgres -d shifty_platform < database/migrations/015_test_orchestration.sql${NC}"
            ((FAILED_CHECKS++))
        fi
        
        return 0
    else
        echo -e "${RED}✗ Not ready${NC}"
        ((FAILED_CHECKS++))
        return 1
    fi
}

# Function to check Redis
check_redis() {
    ((TOTAL_CHECKS++))
    
    echo -n "Checking Redis... "
    
    if docker exec shifty-redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
        echo -e "${GREEN}✓ Responding${NC}"
        ((PASSED_CHECKS++))
        return 0
    else
        echo -e "${RED}✗ Not responding${NC}"
        ((FAILED_CHECKS++))
        return 1
    fi
}

# Function to check Ollama
check_ollama() {
    ((TOTAL_CHECKS++))
    
    echo -n "Checking Ollama... "
    
    if curl -sf --max-time 3 http://localhost:11434/api/version >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Running${NC}"
        ((PASSED_CHECKS++))
        
        # Check if model is available
        ((TOTAL_CHECKS++))
        echo -n "Checking llama3.1 model... "
        
        if docker exec shifty-ollama ollama list 2>/dev/null | grep -q "llama3.1"; then
            echo -e "${GREEN}✓ Available${NC}"
            ((PASSED_CHECKS++))
        else
            echo -e "${YELLOW}⚠ Not found${NC}"
            echo "  ${YELLOW}→ Run: docker-compose exec ollama ollama pull llama3.1${NC}"
            ((FAILED_CHECKS++))
        fi
        
        return 0
    else
        echo -e "${RED}✗ Not responding${NC}"
        ((FAILED_CHECKS++))
        return 1
    fi
}

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Infrastructure Services${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

check_container "shifty-platform-db"
check_database
check_container "shifty-redis"
check_redis
check_container "shifty-ollama"
check_ollama
check_container "shifty-minio"
check_http_service "MinIO" "http://localhost:9000/minio/health/live"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Core Services${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

check_container "shifty-api-gateway"
check_http_service "API Gateway" "http://localhost:3000/health"
check_container "shifty-tenant-manager"
check_http_service "Tenant Manager" "http://localhost:3001/health"
check_container "shifty-auth-service"
check_http_service "Auth Service" "http://localhost:3002/health"
check_container "shifty-ai-orchestrator"
check_http_service "AI Orchestrator" "http://localhost:3003/health"
check_container "shifty-test-generator"
check_http_service "Test Generator" "http://localhost:3004/health"
check_container "shifty-healing-engine"
check_http_service "Healing Engine" "http://localhost:3005/health"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Orchestration Services${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

check_container "shifty-orchestrator-service"
check_http_service "Orchestrator Service" "http://localhost:3022/health"
check_container "shifty-results-service"
check_http_service "Results Service" "http://localhost:3023/health"
check_container "shifty-artifact-storage"
check_http_service "Artifact Storage" "http://localhost:3024/health"
check_container "shifty-flakiness-tracker"
check_http_service "Flakiness Tracker" "http://localhost:3025/health"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Summary${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo "Total Checks:  ${TOTAL_CHECKS}"
echo -e "Passed:        ${GREEN}${PASSED_CHECKS}${NC}"
echo -e "Failed:        ${RED}${FAILED_CHECKS}${NC}"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ All systems operational! Shifty Platform is ready.    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  - Frontend: cd apps/frontend && npm run dev"
    echo "  - Tests:    cd apps/frontend && npm test"
    echo "  - API Docs: http://localhost:3000/docs (when implemented)"
    echo ""
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ Some checks failed. Review errors above.              ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  - Check logs: docker logs <container-name>"
    echo "  - Restart:    docker-compose restart <service-name>"
    echo "  - Full guide: docs/TROUBLESHOOTING.md"
    echo ""
    exit 1
fi
