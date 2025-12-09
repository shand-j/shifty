#!/bin/bash
# End-to-End Test Script for Reporter & Dashboard
# Tests the complete flow: Playwright → Results Service → Dashboard

set -e

echo "🚀 Shifty Reporter & Dashboard E2E Test"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SHIFTY_ROOT="/Users/home/Projects/shifty"
TEST_DIR="$SHIFTY_ROOT/test-e2e-reporter"
RUN_ID="run-e2e-$(date +%s)"

# Step 1: Verify services are running
echo -e "${BLUE}Step 1: Checking services...${NC}"

check_service() {
  local service=$1
  local port=$2
  
  if curl -sf http://localhost:$port/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $service (port $port) is healthy"
  else
    echo -e "${RED}✗${NC} $service (port $port) is NOT running"
    echo "   Run: ./scripts/start-mvp.sh"
    exit 1
  fi
}

check_service "API Gateway" 3000
check_service "Orchestrator" 3022
check_service "Results Service" 3023
echo ""

# Step 2: Create test project
echo -e "${BLUE}Step 2: Creating test project...${NC}"
rm -rf "$TEST_DIR"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Initialize package.json
cat > package.json <<'EOF'
{
  "name": "shifty-reporter-e2e-test",
  "version": "1.0.0",
  "scripts": {
    "test": "playwright test"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0"
  }
}
EOF

echo -e "${GREEN}✓${NC} Created package.json"

# Step 3: Install dependencies
echo -e "${BLUE}Step 3: Installing dependencies...${NC}"
npm install > /dev/null 2>&1
npm install ../../packages/sdk-reporter > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Step 4: Create Playwright config
echo -e "${BLUE}Step 4: Creating Playwright config...${NC}"
cat > playwright.config.ts <<EOF
import { defineConfig } from '@playwright/test';
import { ShiftyReporter } from '@shifty/sdk-reporter';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  workers: 1,
  
  reporter: [
    ['list'],
    [
      '@shifty/sdk-reporter',
      {
        apiKey: 'test-key',
        tenantId: 'tenant-test',
        resultsServiceUrl: 'ws://localhost:3023/ws',
        runId: '${RUN_ID}',
        uploadArtifacts: false, // Disable for E2E test
        batchSize: 5,
      }
    ]
  ],
  
  use: {
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
});
EOF

echo -e "${GREEN}✓${NC} Created playwright.config.ts"
echo ""

# Step 5: Create test files
echo -e "${BLUE}Step 5: Creating test files...${NC}"
mkdir -p tests

cat > tests/example-1.spec.ts <<'EOF'
import { test, expect } from '@playwright/test';

test.describe('Example Tests - Group 1', () => {
  test('test 1: should pass', async ({ page }) => {
    await page.waitForTimeout(100);
    expect(1 + 1).toBe(2);
  });

  test('test 2: should pass', async ({ page }) => {
    await page.waitForTimeout(200);
    expect(2 + 2).toBe(4);
  });

  test('test 3: should pass', async ({ page }) => {
    await page.waitForTimeout(150);
    expect(3 + 3).toBe(6);
  });
});
EOF

cat > tests/example-2.spec.ts <<'EOF'
import { test, expect } from '@playwright/test';

test.describe('Example Tests - Group 2', () => {
  test('test 4: should pass', async ({ page }) => {
    await page.waitForTimeout(180);
    expect(4 + 4).toBe(8);
  });

  test('test 5: should fail', async ({ page }) => {
    await page.waitForTimeout(100);
    expect(5 + 5).toBe(11); // Intentional failure
  });

  test('test 6: should pass', async ({ page }) => {
    await page.waitForTimeout(120);
    expect(6 + 6).toBe(12);
  });
});
EOF

echo -e "${GREEN}✓${NC} Created 6 test cases (5 pass, 1 fail)"
echo ""

# Step 6: Run tests
echo -e "${BLUE}Step 6: Running tests with Shifty reporter...${NC}"
echo "   Run ID: ${RUN_ID}"
echo "   Dashboard URL: http://localhost:3001/runs/${RUN_ID}"
echo ""

# Run in background and capture output
npx playwright test --reporter=list 2>&1 | tee test-output.log &
TEST_PID=$!

# Wait a moment for tests to start
sleep 2

# Step 7: Query results via API
echo ""
echo -e "${BLUE}Step 7: Querying results via API...${NC}"
sleep 3 # Wait for first batch

RESULTS=$(curl -s "http://localhost:3023/api/v1/runs/${RUN_ID}")
if [ -z "$RESULTS" ]; then
  echo -e "${RED}✗${NC} No results found in database"
  kill $TEST_PID 2>/dev/null || true
  exit 1
fi

echo -e "${GREEN}✓${NC} Results found in database:"
echo "$RESULTS" | jq '{
  run_id: .run.id,
  status: .run.status,
  total_tests: .run.total_tests,
  passed_tests: .run.passed_tests,
  failed_tests: .run.failed_tests,
  results_count: (.results | length)
}' 2>/dev/null || echo "$RESULTS"
echo ""

# Wait for tests to complete
wait $TEST_PID || true

# Step 8: Verify final results
echo ""
echo -e "${BLUE}Step 8: Verifying final results...${NC}"
sleep 2 # Wait for final batch

FINAL_RESULTS=$(curl -s "http://localhost:3023/api/v1/runs/${RUN_ID}")
PASSED=$(echo "$FINAL_RESULTS" | jq -r '.run.passed_tests' 2>/dev/null || echo "0")
FAILED=$(echo "$FINAL_RESULTS" | jq -r '.run.failed_tests' 2>/dev/null || echo "0")
STATUS=$(echo "$FINAL_RESULTS" | jq -r '.run.status' 2>/dev/null || echo "unknown")

echo "   Final Status: $STATUS"
echo "   Passed: $PASSED / Failed: $FAILED"

if [ "$PASSED" -eq 5 ] && [ "$FAILED" -eq 1 ]; then
  echo -e "${GREEN}✓${NC} Test results match expected (5 passed, 1 failed)"
else
  echo -e "${RED}✗${NC} Test results do NOT match expected"
  echo "   Expected: 5 passed, 1 failed"
  echo "   Got: $PASSED passed, $FAILED failed"
  exit 1
fi
echo ""

# Step 9: Test WebSocket connection (optional)
echo -e "${BLUE}Step 9: Testing WebSocket connection...${NC}"
echo "   WebSocket URL: ws://localhost:3023/ws"
echo "   (Requires wscat: npm install -g wscat)"
echo ""
echo "   To test manually:"
echo "   wscat -c 'ws://localhost:3023/ws' \\"
echo "     -H 'Authorization: Bearer test-key' \\"
echo "     -H 'X-Tenant-ID: tenant-test' \\"
echo "     -H 'X-Run-ID: ${RUN_ID}'"
echo ""

# Step 10: Cleanup
echo -e "${BLUE}Step 10: Cleanup...${NC}"
cd "$SHIFTY_ROOT"
# Uncomment to remove test directory
# rm -rf "$TEST_DIR"
echo -e "${GREEN}✓${NC} Test directory preserved at: $TEST_DIR"
echo ""

# Final summary
echo "=========================================="
echo -e "${GREEN}✅ E2E Test PASSED${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Open dashboard: http://localhost:3001/runs/${RUN_ID}"
echo "2. Check test results table"
echo "3. Verify 5 passed, 1 failed"
echo ""
echo "Database queries:"
echo "  SELECT * FROM test_runs WHERE id = '${RUN_ID}';"
echo "  SELECT * FROM test_results WHERE run_id = '${RUN_ID}';"
echo ""
