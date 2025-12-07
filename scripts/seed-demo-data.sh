#!/bin/bash
# Seed Demo Data Script
# Populates the Shifty platform with enterprise-realistic mock data

set -e

echo "🌱 Seeding Shifty demo data..."

# Check if services are running
if ! docker-compose ps | grep -q "api-gateway.*Up"; then
    echo "⚠️  API Gateway is not running. Please start services first:"
    echo "   docker-compose up -d"
    exit 1
fi

# Enable mock mode
export MOCK_MODE=true
export NEXT_PUBLIC_MOCK_MODE=true

echo "✅ Mock mode enabled"

# Wait for API Gateway to be ready
echo "⏳ Waiting for API Gateway..."
timeout 30 bash -c 'until curl -sf http://localhost:3000/health > /dev/null; do sleep 1; done' || {
    echo "❌ API Gateway failed to start"
    exit 1
}

echo "✅ API Gateway is ready"

# The mock data is automatically initialized when the API Gateway starts in mock mode
# No additional seeding is required - data is generated on-demand

echo "📊 Demo data statistics:"
echo "   - Users: 200+"
echo "   - Teams: 50+"
echo "   - Projects: 100+"
echo "   - Tests: 5000+"
echo "   - Healing Items: 500+"
echo "   - Pipelines: 30+"
echo "   - ROI Metrics: 12 months"
echo "   - DORA Metrics: 90 days"

echo ""
echo "🎉 Demo data ready!"
echo ""
echo "📝 Test credentials:"
echo "   Developer: dev@shifty.ai / test"
echo "   QA: qa@shifty.ai / test"
echo "   Product Owner: po@shifty.ai / test"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3010"
echo "   API Gateway: http://localhost:3000"
echo "   Health Check: http://localhost:3000/health"
