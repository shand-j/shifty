# Shifty Test Orchestration Integration

This directory contains Playwright tests integrated with Shifty's orchestration and reporting services.

## Test Files

### Standard Playwright Tests
- **`auth/login.spec.ts`** - Standard Playwright login tests (8 tests, 5 passing)

### Shifty-Integrated Tests  
- **`auth/login-shifty.spec.ts`** - Enhanced with Shifty telemetry reporting (4 tests)
- **`shifty-runner.ts`** - Orchestration runner script that uses Shifty services

## Running Tests

### Standard Playwright (Local)
```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug

# Run specific test file
npx playwright test tests/auth/login.spec.ts --project=chromium
```

### Shifty Orchestration Runner

The Shifty runner provides:
- ✅ Test sharding and parallel execution
- ✅ Real-time progress reporting via Shifty services
- ✅ Centralized result aggregation  
- ✅ Telemetry capture for analytics
- ✅ Integration with Shifty dashboard

```bash
# Run tests through Shifty orchestration
npm run test:shifty

# Watch mode (re-run on file changes)
npm run test:shifty:watch
```

### Environment Variables

```bash
# Shifty Configuration
SHIFTY_API_URL=http://localhost:3000          # API Gateway endpoint
SHIFTY_TENANT_ID=your-tenant-id               # Your tenant ID
SHIFTY_TOKEN=your-jwt-token                    # Optional: Auth token

# Frontend Configuration  
FRONTEND_URL=http://localhost:3006             # Frontend dev server

# Git/CI Context (optional)
PROJECT_NAME=frontend                          # Project identifier
GIT_BRANCH=main                                # Current branch
GIT_COMMIT=abc123                              # Commit SHA
```

## Shifty Runner Output

```
🚀 Shifty Test Orchestration Runner

📍 API: http://localhost:3000
🏢 Tenant: test-tenant
📦 Project: frontend
🌿 Branch: main

📝 Discovered 1 test files:
   - tests/auth/login.spec.ts

🔄 Starting orchestration with 1 workers...
✓ Created run: 550e8400-e29b-41d4-a716-446655440000
✓ Shards: 1

📋 Executing tests...

  ▶ Running: tests/auth/login.spec.ts
  ✓ tests/auth/login.spec.ts - PASSED

============================================================
📊 FINAL RESULTS
============================================================
Run ID: 550e8400-e29b-41d4-a716-446655440000
Total: 1 tests
✓ Passed: 1
✗ Failed: 0
Success Rate: 100%
============================================================

🔗 View detailed results:
   http://localhost:3000/runs/550e8400-e29b-41d4-a716-446655440000
```

## Shifty Integration Features

### 1. Telemetry Events

The Shifty-integrated tests (`login-shifty.spec.ts`) automatically report:
- `test_started` - When each test begins
- `test_completed` - Test result, duration, retry count
- `login_success` - Successful login events with context

### 2. Orchestration API

The runner interacts with these Shifty services:

**POST `/api/v1/orchestrate`**
- Submits test files for orchestration
- Receives run ID and shard assignments
- Distributes tests across workers

**GET `/api/v1/orchestrate/:runId/progress`**  
- Real-time progress updates via SSE
- Shows completed/passed/failed counts
- Current status of each shard

**GET `/api/v1/runs/:runId`**
- Final aggregated results
- Test execution metrics
- Detailed failure information

### 3. Healing Analytics (Future)

When integrated with `@shifty/sdk-playwright` (requires workspace package build):
- Auto-healing broken selectors
- Confidence scoring on selector changes
- Screenshot uploads on failure
- Selector evolution tracking

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Playwright Tests                              │
│  (tests/auth/login-shifty.spec.ts)              │
└────────────┬────────────────────────────────────┘
             │ Telemetry Events
             ↓
┌─────────────────────────────────────────────────┐
│  Shifty Runner (shifty-runner.ts)               │
│  - Test discovery                               │
│  - Orchestration API calls                      │
│  - Progress monitoring                          │
└────────────┬────────────────────────────────────┘
             │ HTTP/REST
             ↓
┌─────────────────────────────────────────────────┐
│  Shifty Platform Services                       │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ Orchestrator │  │   Results    │            │
│  │   :3022      │  │   Service    │            │
│  │              │  │    :3023     │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Artifact   │  │  Flakiness   │            │
│  │   Storage    │  │   Tracker    │            │
│  │    :3024     │  │    :3025     │            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────┐
│  Platform Database (PostgreSQL)                 │
│  - Test runs, shards, results                   │
│  - Telemetry events, metrics                    │
│  - Healing history, analytics                   │
└─────────────────────────────────────────────────┘
```

## Test Results Storage

Shifty stores test results in:
- **PostgreSQL** - Structured run/result data
- **MinIO** - Test artifacts (screenshots, videos, traces)
- **Redis** - Real-time progress updates

Query results via:
```bash
curl http://localhost:3000/api/v1/runs/:runId \
  -H "X-Tenant-ID: your-tenant-id"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests with Shifty

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
        working-directory: apps/frontend
      
      - name: Install Playwright browsers
        run: npx playwright install chromium
        working-directory: apps/frontend
      
      - name: Run Shifty-orchestrated tests
        env:
          SHIFTY_API_URL: ${{ secrets.SHIFTY_API_URL }}
          SHIFTY_TENANT_ID: ${{ secrets.SHIFTY_TENANT_ID }}
          SHIFTY_TOKEN: ${{ secrets.SHIFTY_TOKEN }}
          GIT_BRANCH: ${{ github.ref_name }}
          GIT_COMMIT: ${{ github.sha }}
        run: npm run test:shifty
        working-directory: apps/frontend
      
      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/frontend/playwright-report/
```

## Troubleshooting

### Orchestration API Not Available

If Shifty services aren't running, the runner falls back to local execution:

```
⚠️  Orchestration API not available or auth failed.
   Running tests locally without orchestration...
```

Start services:
```bash
cd /path/to/shifty
./scripts/start-mvp.sh
```

### Telemetry Events Failing

Tests will continue even if telemetry fails (non-blocking):
```
[Shifty] Telemetry skipped: test_started
```

Check API Gateway and ensure `X-Tenant-ID` header is correct.

### Port Conflicts

If frontend dev server can't start on 3006:
```bash
# Check what's using the port
lsof -i :3006

# Kill the process
kill -9 <PID>
```

## Next Steps

1. **Build SDK Packages** - Enable full healing capabilities:
   ```bash
   npm run build
   ```

2. **Add More Tests** - Expand coverage with Shifty integration:
   ```typescript
   test('my feature', async ({ page }) => {
     await reportToShifty('feature_test_started', { feature: 'my-feature' });
     // ... test logic
   });
   ```

3. **Configure CI** - Set up GitHub Actions with Shifty secrets

4. **View Dashboard** - Access Shifty web UI to see:
   - Test run history
   - Flakiness trends
   - Healing analytics
   - ROI metrics
