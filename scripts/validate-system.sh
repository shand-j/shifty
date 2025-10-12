#!/bin/bash

# Shifty Platform - System Validation Script
# Tests all services and core functionality

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Test service health endpoints
test_service_health() {
    print_status "Testing service health endpoints..."
    
    local services=(
        "3000:API Gateway"
        "3001:Tenant Manager" 
        "3002:Auth Service"
        "3003:AI Orchestrator"
        "3004:Test Generator"
        "3005:Healing Engine"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r port name <<< "$service"
        if curl -s "http://localhost:$port/health" > /dev/null; then
            print_success "$name (port $port) is healthy"
        else
            print_error "$name (port $port) is not responding"
            return 1
        fi
    done
}

# Test database connectivity
test_database() {
    print_status "Testing database connectivity..."
    
    if psql shifty_platform -c "SELECT COUNT(*) FROM tenants;" > /dev/null 2>&1; then
        print_success "Database connection and schema are working"
    else
        print_error "Database connection failed"
        return 1
    fi
}

# Test Redis connectivity
test_redis() {
    print_status "Testing Redis connectivity..."
    
    if redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is responding"
    else
        print_error "Redis connection failed"
        return 1
    fi
}

# Test Ollama AI models
test_ollama() {
    print_status "Testing Ollama AI models..."
    
    if ollama list | grep -q "llama3.1"; then
        print_success "Ollama llama3.1 model is available"
    else
        print_error "Ollama llama3.1 model not found"
        return 1
    fi
}

# Test user registration flow
test_user_registration() {
    print_status "Testing user registration..."
    
    local test_email="test-$(date +%s)@shifty.com"
    local response=$(curl -s -X POST http://localhost:3002/api/v1/auth/register \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$test_email\",
            \"password\": \"password123\",
            \"firstName\": \"Test\",
            \"lastName\": \"User\",
            \"tenantName\": \"Test Company $(date +%s)\"
        }")
    
    if echo "$response" | grep -q "token"; then
        print_success "User registration is working"
        
        # Extract token for further testing
        export TEST_TOKEN=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null || echo "")
        if [ -n "$TEST_TOKEN" ]; then
            print_success "JWT token generation is working"
        fi
    else
        print_error "User registration failed: $response"
        return 1
    fi
}

# Test API Gateway service discovery
test_api_gateway() {
    print_status "Testing API Gateway service discovery..."
    
    local response=$(curl -s http://localhost:3000/health)
    if echo "$response" | grep -q "api-gateway" && echo "$response" | grep -q "services"; then
        print_success "API Gateway service discovery is working"
    else
        print_error "API Gateway service discovery failed"
        return 1
    fi
}

# Test AI service capabilities
test_ai_services() {
    print_status "Testing AI service capabilities..."
    
    # Test Test Generator AI status
    local test_gen_response=$(curl -s http://localhost:3004/health)
    if echo "$test_gen_response" | grep -q "llama3.1"; then
        print_success "Test Generator AI integration is working"
    else
        print_error "Test Generator AI integration failed"
        return 1
    fi
    
    # Test Healing Engine strategies
    local healing_response=$(curl -s http://localhost:3005/health)  
    if echo "$healing_response" | grep -q "ai-powered-analysis"; then
        print_success "Healing Engine AI strategies are available"
    else
        print_error "Healing Engine AI strategies failed"
        return 1
    fi
}

# Generate test report
generate_report() {
    print_status "Generating system validation report..."
    
    echo
    echo "========================================"
    echo "Shifty Platform Validation Report"
    echo "Generated: $(date)"
    echo "========================================"
    echo
    
    # Service status
    echo "Service Health Status:"
    curl -s http://localhost:3000/health | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for service in data.get('services', []):
        status = '✅' if service['status'] == 'healthy' else '❌'
        print(f\"  {status} {service['service']} -> {service['target']}\")
except:
    print('  ❌ Could not parse API Gateway response')
" 2>/dev/null || echo "  ❌ API Gateway not responding"
    
    echo
    
    # Database status  
    echo "Database Status:"
    local user_count=$(psql shifty_platform -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs)
    local tenant_count=$(psql shifty_platform -t -c "SELECT COUNT(*) FROM tenants;" 2>/dev/null | xargs)
    echo "  ✅ Users: $user_count"
    echo "  ✅ Tenants: $tenant_count"
    
    echo
    
    # AI Models status
    echo "AI Models Status:"
    ollama list 2>/dev/null | grep -E "(llama3.1|codellama)" | while read -r line; do
        echo "  ✅ $line"
    done || echo "  ❌ Ollama models not available"
    
    echo
    echo "System is ready for development! 🚀"
}

# Main validation function
main() {
    echo "🔍 Shifty Platform System Validation"
    echo "====================================="
    echo
    
    local failed_tests=0
    
    # Run all tests
    test_service_health || ((failed_tests++))
    test_database || ((failed_tests++))
    test_redis || ((failed_tests++))
    test_ollama || ((failed_tests++))
    test_user_registration || ((failed_tests++))
    test_api_gateway || ((failed_tests++))
    test_ai_services || ((failed_tests++))
    
    echo
    
    if [ $failed_tests -eq 0 ]; then
        print_success "All tests passed! System is fully operational."
        generate_report
        exit 0
    else
        print_error "$failed_tests tests failed. Please check the system setup."
        echo
        echo "To fix issues, try:"
        echo "  1. Run './scripts/setup-local-development.sh' to reinstall dependencies"
        echo "  2. Restart services: 'npm run dev'"  
        echo "  3. Check service logs for specific error messages"
        exit 1
    fi
}

main "$@"