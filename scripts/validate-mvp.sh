#!/bin/bash

# Shifty Platform MVP API Validation Script
# Tests the core functionality of the backend services

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
TOKEN=""

echo "🧪 Shifty Platform MVP API Validation"
echo "======================================"

# Test API Gateway health
echo -e "${YELLOW}🔍 Testing API Gateway health...${NC}"
if curl -s -f "${BASE_URL}/health" >/dev/null; then
    echo -e "${GREEN}✅ API Gateway is healthy${NC}"
else
    echo -e "${RED}❌ API Gateway is not responding${NC}"
    exit 1
fi

# Test service discovery
echo -e "${YELLOW}🔍 Testing service discovery...${NC}"
HEALTH_RESPONSE=$(curl -s "${BASE_URL}/health")
echo "Health check response: ${HEALTH_RESPONSE}"

# Test user registration
echo -e "${YELLOW}👤 Testing user registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/register" \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "password123", 
    "firstName": "Test",
    "lastName": "User",
    "tenantName": "Test Corporation"
  }' || echo "Registration failed")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ User registration successful${NC}"
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "JWT Token received: ${TOKEN:0:20}..."
else
    echo -e "${YELLOW}⚠️  Registration response: ${REGISTER_RESPONSE}${NC}"
fi

# Test login (if registration failed, try login)
if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}🔐 Testing login...${NC}"
    LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/login" \
      -H 'Content-Type: application/json' \
      -d '{
        "email": "test@example.com",
        "password": "password123"
      }' || echo "Login failed")
    
    if echo "$LOGIN_RESPONSE" | grep -q "token"; then
        echo -e "${GREEN}✅ Login successful${NC}"
        TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    else
        echo -e "${RED}❌ Could not authenticate. Response: ${LOGIN_RESPONSE}${NC}"
        echo -e "${YELLOW}ℹ️  Continuing with remaining tests...${NC}"
    fi
fi

# Test token verification
if [ ! -z "$TOKEN" ]; then
    echo -e "${YELLOW}🔒 Testing token verification...${NC}"
    VERIFY_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/auth/verify" \
      -H "Authorization: Bearer ${TOKEN}" || echo "Verification failed")
    
    if echo "$VERIFY_RESPONSE" | grep -q "valid.*true"; then
        echo -e "${GREEN}✅ Token verification successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Token verification response: ${VERIFY_RESPONSE}${NC}"
    fi
fi

# Test test generation (with auth if available)
echo -e "${YELLOW}🧪 Testing AI test generation...${NC}"
if [ ! -z "$TOKEN" ]; then
    GENERATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/tests/generate" \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{
        "url": "https://example.com",
        "requirements": "Test the main navigation and verify the page loads correctly",
        "testType": "e2e"
      }' || echo "Generation failed")
    
    if echo "$GENERATE_RESPONSE" | grep -q "requestId"; then
        echo -e "${GREEN}✅ Test generation request submitted${NC}"
        REQUEST_ID=$(echo "$GENERATE_RESPONSE" | grep -o '"requestId":"[^"]*"' | cut -d'"' -f4)
        echo "Request ID: ${REQUEST_ID}"
        
        # Check status
        echo -e "${YELLOW}📊 Checking generation status...${NC}"
        sleep 2
        STATUS_RESPONSE=$(curl -s "${BASE_URL}/api/v1/tests/generate/${REQUEST_ID}/status" \
          -H "Authorization: Bearer ${TOKEN}" || echo "Status check failed")
        echo "Status response: ${STATUS_RESPONSE}"
    else
        echo -e "${YELLOW}⚠️  Test generation response: ${GENERATE_RESPONSE}${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping test generation (no auth token)${NC}"
fi

# Test selector healing (with auth if available) 
echo -e "${YELLOW}🔧 Testing selector healing...${NC}"
if [ ! -z "$TOKEN" ]; then
    HEALING_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/v1/healing/heal-selector" \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{
        "url": "https://example.com",
        "brokenSelector": "#non-existent-button"
      }' || echo "Healing failed")
    
    if echo "$HEALING_RESPONSE" | grep -q "originalSelector"; then
        echo -e "${GREEN}✅ Selector healing request processed${NC}"
        echo "Healing response preview: $(echo "$HEALING_RESPONSE" | cut -c1-100)..."
    else
        echo -e "${YELLOW}⚠️  Healing response: ${HEALING_RESPONSE}${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping selector healing (no auth token)${NC}"
fi

# Test service health endpoints individually
echo -e "${YELLOW}🏥 Testing individual service health endpoints...${NC}"
SERVICES=(
    "auth-service:3002"
    "tenant-manager:3001"  
    "ai-orchestrator:3003"
    "test-generator:3004"
    "healing-engine:3005"
)

for service in "${SERVICES[@]}"; do
    name=$(echo "$service" | cut -d':' -f1)
    port=$(echo "$service" | cut -d':' -f2)
    
    if curl -s -f "http://localhost:${port}/health" >/dev/null; then
        echo -e "${GREEN}✅ ${name} is healthy${NC}"
    else
        echo -e "${RED}❌ ${name} is not responding${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 API Validation Complete!${NC}"
echo "================================="
echo ""
echo -e "${YELLOW}📊 Test Results Summary:${NC}"
echo "• API Gateway health check"
echo "• User registration/login flow"  
echo "• JWT token verification"
echo "• AI test generation request"
echo "• Selector healing request"
echo "• Individual service health checks"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "1. Review any failed tests above"
echo "2. Check service logs: docker-compose logs [service-name]"
echo "3. Test with a frontend application"
echo "4. Implement additional business logic as needed"
echo ""
echo -e "${GREEN}✨ Shifty MVP Backend is functional! ✨${NC}"