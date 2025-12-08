#!/bin/bash

# Test Integration Endpoints
# This script verifies all third-party integration mock endpoints are working

set -e

API_URL="http://localhost:3000"
RETRY_COUNT=0
MAX_RETRIES=30

echo "🔍 Testing Shifty Integration Endpoints..."
echo ""

# Wait for API Gateway to be ready
echo "⏳ Waiting for API Gateway to be ready..."
while ! curl -sf "$API_URL/health" > /dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ API Gateway did not start in time"
    exit 1
  fi
  echo "  Attempt $RETRY_COUNT/$MAX_RETRIES..."
  sleep 2
done

echo "✅ API Gateway is ready!"
echo ""

# Function to test an endpoint
test_endpoint() {
  local name=$1
  local url=$2
  local expected_field=$3
  
  echo -n "Testing $name... "
  
  response=$(curl -sf "$API_URL$url" || echo "FAILED")
  
  if [ "$response" = "FAILED" ]; then
    echo "❌ FAILED (connection error)"
    return 1
  fi
  
  # Check if response has success field
  if echo "$response" | jq -e '.success == true' > /dev/null 2>&1; then
    # Check if data field exists and has content
    if echo "$response" | jq -e ".data | length > 0" > /dev/null 2>&1; then
      count=$(echo "$response" | jq '.data | length')
      echo "✅ OK ($count items)"
      return 0
    else
      echo "⚠️  OK (empty data)"
      return 0
    fi
  else
    echo "❌ FAILED (no success response)"
    return 1
  fi
}

# Test GitHub endpoints
echo "📦 GitHub Integration"
test_endpoint "  Repositories" "/api/v1/github/repos"
test_endpoint "  Pull Requests" "/api/v1/github/repos/acme-corp/web-app/pulls"
test_endpoint "  Commits" "/api/v1/github/repos/acme-corp/web-app/commits"
echo ""

# Test Jira endpoints
echo "📋 Jira Integration"
test_endpoint "  Issues" "/api/v1/jira/issues"
test_endpoint "  Specific Issue" "/api/v1/jira/issues/ACME-1"
echo ""

# Test Slack endpoints
echo "💬 Slack Integration"
test_endpoint "  Channels" "/api/v1/slack/channels"
echo ""

# Test Sentry endpoints
echo "🐛 Sentry Integration"
test_endpoint "  Errors" "/api/v1/sentry/errors"
echo ""

# Test New Relic endpoints
echo "📊 New Relic Integration"
test_endpoint "  Alerts" "/api/v1/newrelic/alerts"
echo ""

# Test Datadog endpoints
echo "📈 Datadog Integration"
test_endpoint "  Metrics" "/api/v1/datadog/metrics"
echo ""

# Test Jenkins endpoints
echo "🔧 Jenkins Integration"
test_endpoint "  Builds" "/api/v1/jenkins/builds"
test_endpoint "  Specific Build" "/api/v1/jenkins/builds/1"
echo ""

# Test CircleCI endpoints
echo "🔄 CircleCI Integration"
test_endpoint "  Pipelines" "/api/v1/circleci/pipelines"
echo ""

# Test Notion endpoints
echo "📝 Notion Integration"
test_endpoint "  Documents" "/api/v1/notion/documents"
echo ""

# Test GitLab endpoints
echo "🦊 GitLab Integration"
test_endpoint "  Projects" "/api/v1/gitlab/projects"
echo ""

# Test Production Logs
echo "📜 Production Logs"
test_endpoint "  Recent Logs" "/api/v1/logs/production"
test_endpoint "  Error Logs" "/api/v1/logs/production?level=error"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ All integration endpoints tested successfully!"
echo ""
echo "📊 Summary:"
echo "  - 12 third-party integrations mocked"
echo "  - 15+ API endpoints working"
echo "  - Ready for investor demo!"
echo ""
echo "📚 Demo guides available at:"
echo "  - docs/demos/INVESTOR_DEMO_INTEGRATIONS.md"
echo "  - docs/demos/QUICK_REFERENCE.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
