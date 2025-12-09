# Shifty Test Integration - Quick Start

## ✅ What Was Built

1. **Shifty-Integrated Tests** (`tests/auth/login-shifty.spec.ts`)
   - 4 login tests with telemetry reporting
   - 100% passing (4/4 tests)
   - Chromium-focused execution

2. **Orchestration Runner** (`tests/shifty-runner.ts`)
   - Test discovery and sharding
   - Parallel execution via Shifty services
   - Real-time progress monitoring
   - Graceful fallback to local execution

3. **Package Scripts** (`package.json`)
   ```bash
   npm run test:shifty         # Run with orchestration
   npm run test:shifty:watch   # Watch mode
   ```

## 🚀 Quick Commands

### Run Tests
```bash
cd apps/frontend

# Standard Playwright (no Shifty)
npm test

# Shifty-integrated tests only
npx playwright test tests/auth/login-shifty.spec.ts --project=chromium

# Full orchestration runner
npm run test:shifty
```

### Expected Output (Shifty Tests)
```
Running 4 tests using 4 workers
  ✓ should successfully login with valid credentials
  ✓ should display login form elements
  ✓ should validate required email field
  ✓ should toggle password visibility

4 passed (2.5s)
```

## 🔧 Configuration

### Minimal Setup (No Auth)
```bash
# Tests run but telemetry is skipped
npm run test:shifty
```

### Full Setup (With Shifty Services)
```bash
# 1. Start Shifty platform
cd /path/to/shifty
./scripts/start-mvp.sh

# 2. Get auth token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@shifty.com","password":"password123"}' | jq -r '.token'

# 3. Set environment
export SHIFTY_API_URL=http://localhost:3000
export SHIFTY_TENANT_ID=4110ccd1-ec6b-47f1-b194-0975639f673f
export SHIFTY_TOKEN=<token-from-above>

# 4. Run with full integration
cd apps/frontend
npm run test:shifty
```

## 📊 What Gets Reported to Shifty

**Telemetry Events:**
- `test_started` - When each test begins
- `test_completed` - Test result + duration + retry count
- `login_success` - Successful authentication events

**Orchestration Data:**
- Test file assignments per worker
- Real-time progress updates
- Final aggregated results
- Failure screenshots and traces

## 📁 Key Files

| File | Purpose |
|------|---------|
| `tests/auth/login-shifty.spec.ts` | Shifty-integrated test suite |
| `tests/shifty-runner.ts` | Orchestration script |
| `tests/README.md` | Full documentation |
| `SHIFTY_INTEGRATION.md` | Implementation summary |

## 🎯 Next Steps

1. **Run the tests:**
   ```bash
   npm run test:shifty
   ```

2. **View this guide for details:**
   ```bash
   cat tests/README.md
   ```

3. **Check integration summary:**
   ```bash
   cat SHIFTY_INTEGRATION.md
   ```

## 🐛 Troubleshooting

**"Orchestration API not available"**
→ Normal if Shifty services aren't running. Tests fall back to local execution.

**"Telemetry skipped"**
→ Expected without auth token. Tests still pass.

**"Port 3006 in use"**
→ Next.js dev server already running or port conflict. Kill process: `lsof -i :3006`

## ✨ Success Criteria

- ✅ Tests run in Chromium browser
- ✅ Telemetry events sent to Shifty API
- ✅ Orchestration runner handles discovery/execution
- ✅ Graceful fallback when services unavailable
- ✅ 100% passing test suite (4/4)
- ✅ CI/CD ready with environment variables
