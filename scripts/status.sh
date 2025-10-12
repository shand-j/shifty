#!/bin/bash

# Shifty Platform - Project Status Checker
# Shows current development environment status

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "📊 Shifty Platform Development Status"
echo "====================================="
echo

# Check if services are running
echo "🌐 Service Status:"

services=(
    "3000:API Gateway"
    "3001:Tenant Manager"
    "3002:Auth Service"  
    "3003:AI Orchestrator"
    "3004:Test Generator"
    "3005:Healing Engine"
)

for service in "${services[@]}"; do
    IFS=':' read -r port name <<< "$service"
    if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅${NC} $name (port $port)"
    else
        echo -e "  ${RED}❌${NC} $name (port $port)"
    fi
done

echo

# Check dependencies
echo "🔧 Dependencies:"

# PostgreSQL
if psql shifty_platform -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅${NC} PostgreSQL"
else
    echo -e "  ${RED}❌${NC} PostgreSQL"
fi

# Redis
if redis-cli ping > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅${NC} Redis"
else
    echo -e "  ${RED}❌${NC} Redis"
fi

# Ollama
if ollama list > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅${NC} Ollama"
else
    echo -e "  ${RED}❌${NC} Ollama"
fi

echo

# Database stats
echo "📊 Database Stats:"
if psql shifty_platform -c "SELECT 1;" > /dev/null 2>&1; then
    user_count=$(psql shifty_platform -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs)
    tenant_count=$(psql shifty_platform -t -c "SELECT COUNT(*) FROM tenants;" 2>/dev/null | xargs)
    echo "  👥 Users: $user_count"
    echo "  🏢 Tenants: $tenant_count"
else
    echo -e "  ${RED}❌${NC} Cannot connect to database"
fi

echo

# AI Model stats  
echo "🤖 AI Models:"
if ollama list > /dev/null 2>&1; then
    ollama list 2>/dev/null | grep -E "(llama3.1|codellama)" | while read -r line; do
        echo "  🧠 $line"
    done
else
    echo -e "  ${RED}❌${NC} Ollama not available"
fi

echo

# Quick actions
echo "🚀 Quick Actions:"
echo "  npm start           - Start development environment"
echo "  npm run validate    - Run comprehensive system tests" 
echo "  npm run setup       - Reinstall all dependencies"
echo "  ./scripts/dev.sh    - Quick development startup"
echo

# System health summary
running_services=0
for service in "${services[@]}"; do
    IFS=':' read -r port name <<< "$service"
    if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
        ((running_services++))
    fi
done

if [ $running_services -eq 6 ]; then
    echo -e "${GREEN}🎉 System Status: FULLY OPERATIONAL${NC}"
    echo "All services running - ready for development!"
elif [ $running_services -gt 3 ]; then
    echo -e "${YELLOW}⚡ System Status: PARTIALLY RUNNING${NC}"
    echo "Some services running - use 'npm start' to start all"
else
    echo -e "${RED}🔴 System Status: MOSTLY DOWN${NC}"
    echo "Most services offline - run 'npm run setup' if needed"
fi

echo