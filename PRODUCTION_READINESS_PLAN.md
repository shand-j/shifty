# 🎯 Production Readiness Plan - Todo Tree Task Breakdown

**Generated:** 2025-12-09  
**Purpose:** Comprehensive task list for achieving full Shifty platform operational status  
**Tracking:** Use Todo Tree extension in VS Code to navigate all TODO/FIXME/HACK/MOCK comments

---

## 📊 Executive Summary

**Total Tasks Identified:** 24 critical items blocking production readiness  
**Categories:** Infrastructure (8) | Code Quality (6) | Configuration (5) | Testing (5)  
**Estimated Effort:** 20-30 hours for infrastructure + 3-5 days for full CI/CD integration

### Critical Path (Must Fix Immediately)
1. ✅ Start orchestration services (orchestrator, results, artifacts, flakiness-tracker, minio)
2. ✅ Execute database migration 015_test_orchestration.sql
3. ✅ Add seed user test@shifty.com to database
4. ✅ Start frontend dev server on port 3006
5. ✅ Create CI/CD workflow for end-to-end validation

---

## 🔴 CRITICAL Priority Tasks

### INFRA-001: Start Orchestration Services
**File:** `scripts/start-mvp.sh:70`  
**Pattern:** `TODO: CRITICAL`  
**Issue:** Only 15/23 services are started by startup script  
**Impact:** Test orchestration completely non-functional  

**Missing Services:**
- orchestrator-service (3022) - Test sharding and job distribution
- results-service (3023) - Test results collection  
- artifact-storage (3024) - Screenshot/video/trace storage
- flakiness-tracker (3025) - Flakiness analytics
- minio (9000-9001) - Object storage for artifacts

**Fix:**
```bash
# Add to scripts/start-mvp.sh after line 70:
echo -e "${GREEN}🚀 Starting orchestration services...${NC}"
docker-compose up -d minio orchestrator-service results-service artifact-storage flakiness-tracker

echo -e "${GREEN}⏳ Waiting for orchestration services...${NC}"
sleep 15

# Add health checks
check_service "Orchestrator Service" "http://localhost:3022"
check_service "Results Service" "http://localhost:3023"
check_service "Artifact Storage" "http://localhost:3024"
check_service "Flakiness Tracker" "http://localhost:3025"
```

**Verification:**
```bash
docker-compose ps | grep -E "(orchestrator|results|artifact|flakiness|minio)"
curl http://localhost:3022/health
curl http://localhost:3023/health
curl http://localhost:3024/health
curl http://localhost:3025/health
```

---

### DB-001: Execute Test Orchestration Migration
**File:** `infrastructure/docker/init-platform-db.sql:117`  
**Pattern:** `TODO: CRITICAL`  
**Issue:** Migration 015_test_orchestration.sql never executed  
**Impact:** Orchestrator service crashes with "relation 'test_runs' does not exist"

**Missing Tables:**
- test_runs - Orchestrated test executions
- test_shards - Parallel test distribution
- test_results - Individual test outcomes
- test_history - Historical results
- healing_events - AI healing attempts
- healing_prs - Pull request creation
- test_flakiness - Flakiness tracking
- test_artifacts - Stored artifacts

**Fix:**
```bash
# Execute migration manually
docker exec -it shifty-platform-db psql -U postgres -d shifty_platform \
  -f /docker-entrypoint-initdb.d/015_test_orchestration.sql

# Verify tables exist
docker exec -it shifty-platform-db psql -U postgres -d shifty_platform \
  -c "\dt test_*"
```

**Alternative Fix (Automated):**
Add to `infrastructure/docker/init-platform-db.sql:117`:
```sql
-- Execute test orchestration migration
\i /docker-entrypoint-initdb.d/015_test_orchestration.sql
```

Then rebuild platform-db:
```bash
docker-compose down platform-db
docker volume rm shifty_platform_db_data
docker-compose up -d platform-db
```

---

### DB-002: Add Seed User for Tests
**File:** `infrastructure/docker/init-platform-db.sql:94`  
**Pattern:** `TODO: CRITICAL` + `FIXME: CRITICAL`  
**Issue:** Test user test@shifty.com does not exist  
**Impact:** All login tests fail with 401 Unauthorized

**Required User:**
- Email: test@shifty.com
- Password: password123 (bcrypt hash provided)
- Role: owner
- Tenant: First tenant in database

**Fix:**
Add to end of `infrastructure/docker/init-platform-db.sql`:
```sql
-- Create default tenant if not exists
INSERT INTO tenants (id, name, slug, plan, status)
VALUES (
  '4110ccd1-ec6b-47f1-b194-0975639f673f',
  'Test Organization',
  'test-org',
  'enterprise',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Create test user for development/CI
INSERT INTO users (id, tenant_id, email, password, first_name, last_name, role)
VALUES (
  '06313bcd-0995-4e3a-8f15-df7eb47fe7ef',
  '4110ccd1-ec6b-47f1-b194-0975639f673f',
  'test@shifty.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7n5cWz.jSq',
  'Test',
  'User',
  'owner'
) ON CONFLICT (email) DO NOTHING;
```

**Verification:**
```bash
docker exec -it shifty-platform-db psql -U postgres -d shifty_platform \
  -c "SELECT email, role FROM users WHERE email = 'test@shifty.com';"
```

---

### INFRA-002: Orchestrator Schema Validation
**File:** `services/orchestrator-service/src/index.ts:447`  
**Pattern:** `FIXME: CRITICAL`  
**Issue:** Service starts without validating database schema exists  
**Impact:** Crashes immediately when receiving orchestration requests

**Fix:**
Add schema validation to `start()` function:
```typescript
async function start() {
  try {
    await dbManager.initialize();
    
    // Verify required tables exist
    const requiredTables = [
      'test_runs', 'test_shards', 'test_results', 
      'healing_events', 'test_artifacts'
    ];
    
    for (const table of requiredTables) {
      try {
        await dbManager.query(`SELECT 1 FROM ${table} LIMIT 1`);
      } catch (error) {
        console.error(`❌ Required table '${table}' does not exist`);
        console.error('Run migration: database/migrations/015_test_orchestration.sql');
        process.exit(1);
      }
    }
    
    console.log('✅ Database schema validated');
    
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`[Orchestrator] Server listening on port ${PORT}`);
  } catch (err) {
    console.error('[Orchestrator] Error starting server:', err);
    process.exit(1);
  }
}
```

---

### TEST-001: Frontend Dev Server Not Running
**File:** `apps/frontend/tests/auth/login.spec.ts:3`  
**Pattern:** `TODO: HIGH`  
**Issue:** Tests expect frontend on port 3006 but dev server never started  
**Impact:** All Playwright tests fail with connection timeout

**Fix:**
```bash
# Terminal 1 - Start frontend
cd apps/frontend
npm run dev

# Terminal 2 - Wait for ready, then run tests
sleep 10
npm test
```

**Automated Fix (package.json):**
```json
{
  "scripts": {
    "test:ci": "run-p dev test:wait-and-run",
    "test:wait-and-run": "wait-on http://localhost:3006 && playwright test"
  },
  "devDependencies": {
    "npm-run-all": "^4.1.5",
    "wait-on": "^7.2.0"
  }
}
```

---

## 🟡 HIGH Priority Tasks

### CODE-001: BullMQ Worker Implementation Missing
**File:** `services/orchestrator-service/src/index.ts:56`  
**Pattern:** `TODO: HIGH`  
**Issue:** Jobs enqueued but no worker consuming them  
**Impact:** Tests never execute, queue fills up indefinitely

**Required Implementation:**
Create `services/test-worker/` with:
1. BullMQ worker that consumes 'test-execution' queue
2. Playwright execution logic for assigned test shard
3. Results reporting to results-service
4. Healing trigger on failures
5. Artifact upload to artifact-storage

**Reference Architecture:**
```typescript
// services/test-worker/src/index.ts
import { Worker } from 'bullmq';
import { chromium } from 'playwright';
import axios from 'axios';

const worker = new Worker('test-execution', async (job) => {
  const { runId, shardIndex, testFiles, tenantId } = job.data;
  
  console.log(`[Worker] Processing shard ${shardIndex} for run ${runId}`);
  
  const browser = await chromium.launch();
  const results = [];
  
  for (const testFile of testFiles) {
    // Execute test with Playwright
    // Report results to results-service
    // Trigger healing on failures
  }
  
  await browser.close();
  return { shardIndex, results };
}, {
  connection: redis,
  concurrency: 5,
});
```

**Files to Create:**
- services/test-worker/package.json
- services/test-worker/src/index.ts
- services/test-worker/tsconfig.json
- infrastructure/docker/Dockerfile.worker

---

### AUTH-001: Token Refresh Logic Missing
**File:** `apps/frontend/tests/shifty-runner.ts:30`  
**Pattern:** `TODO: HIGH`  
**Issue:** Hardcoded JWT tokens expire after 24 hours  
**Impact:** Orchestration fails with 401 errors in CI/CD

**Fix:**
```typescript
class ShiftyClient {
  private token?: string;
  private tokenExpiry?: number;
  
  async ensureValidToken() {
    if (!this.token || Date.now() > (this.tokenExpiry || 0)) {
      console.log('🔄 Refreshing authentication token...');
      const response = await axios.post(`${this.baseUrl}/api/v1/auth/login`, {
        email: process.env.SHIFTY_EMAIL || 'test@shifty.com',
        password: process.env.SHIFTY_PASSWORD || 'password123',
      });
      
      this.token = response.data.token;
      // JWT exp is in seconds, convert to milliseconds
      const decoded = JSON.parse(atob(this.token.split('.')[1]));
      this.tokenExpiry = decoded.exp * 1000;
      this.headers['Authorization'] = `Bearer ${this.token}`;
    }
  }
  
  async orchestrate(testFiles: string[], workerCount: number, metadata: any) {
    await this.ensureValidToken();
    
    // Add retry logic for 401 errors
    try {
      const response = await axios.post(/* ... */);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        this.token = undefined; // Force refresh
        await this.ensureValidToken();
        return this.orchestrate(testFiles, workerCount, metadata); // Retry
      }
      throw error;
    }
  }
}
```

---

### VAL-001: Service Availability Check Missing
**File:** `apps/frontend/tests/shifty-runner.ts:67`  
**Pattern:** `FIXME: CRITICAL`  
**Issue:** No validation before orchestration starts  
**Impact:** Confusing error messages when dependencies missing

**Fix:**
```typescript
async function validateDependencies(): Promise<void> {
  const checks = [
    { name: 'API Gateway', url: `${config.apiUrl}/health` },
    { name: 'Orchestrator', url: `${config.apiUrl}/api/v1/orchestrate/health` },
    { name: 'Auth Service', url: `${config.apiUrl}/api/v1/auth/health` },
  ];
  
  console.log('🔍 Validating service dependencies...\n');
  
  for (const check of checks) {
    try {
      await axios.get(check.url, { timeout: 3000 });
      console.log(`  ✅ ${check.name}`);
    } catch (error) {
      console.error(`  ❌ ${check.name} - UNAVAILABLE`);
      throw new Error(`Dependency check failed: ${check.name}`);
    }
  }
  
  // Validate authentication
  if (config.token) {
    try {
      const decoded = JSON.parse(atob(config.token.split('.')[1]));
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }
      console.log(`  ✅ Authentication (expires ${new Date(decoded.exp * 1000).toISOString()})`);
    } catch (error) {
      console.error(`  ❌ Authentication - INVALID TOKEN`);
      throw error;
    }
  }
  
  console.log('\n✨ All dependencies validated\n');
}

async function main() {
  await validateDependencies(); // Run before orchestration
  // ... rest of orchestration logic
}
```

---

### INFRA-003: Worker Dockerfile Missing
**File:** `docker-compose.yml:708`  
**Pattern:** `TODO: CRITICAL`  
**Issue:** infrastructure/docker/Dockerfile.worker does not exist  
**Impact:** test-worker service cannot build

**Fix:**
Create `infrastructure/docker/Dockerfile.worker`:
```dockerfile
FROM mcr.microsoft.com/playwright:v1.49.0-jammy

WORKDIR /app

# Copy workspace dependencies
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copy test-worker service
COPY services/test-worker ./services/test-worker
COPY packages ./packages

# Install dependencies
RUN npm ci

# Build worker
RUN npx turbo run build --filter="@shifty/test-worker"

WORKDIR /app/services/test-worker

CMD ["node", "dist/index.js"]
```

---

## 🟢 MEDIUM Priority Tasks

### MOCK-001: Production Mock Code in Healing Engine
**File:** `services/healing-engine/src/index.ts:250` and `services/healing-engine/src/index.ts:697`  
**Pattern:** `MOCK: CRITICAL`  
**Issue:** Mock healing results embedded in production service code  
**Impact:** Fake responses in dev environment, confusion about real functionality

**Refactor Strategy:**
1. Extract `getMockHealingResult()` to separate package: `@shifty/test-utilities`
2. Use dependency injection for healing strategy
3. Only import mock in test environment via conditional imports

**Fix:**
```typescript
// packages/test-utilities/src/mock-healing.ts
export class MockHealingEngine {
  getMockHealingResult(selector: string, strategy?: string): CoreHealingResult {
    // Existing mock logic here
  }
}

// services/healing-engine/src/index.ts
import type { SelectorHealer } from './core/selector-healer';

class HealingService {
  private healer: SelectorHealer;
  
  constructor(healer: SelectorHealer) {
    this.healer = healer; // Dependency injection
  }
  
  async healSelector(url: string, selector: string, strategy?: string) {
    // No environment checks - use injected healer
    return this.healer.healSelector(url, selector, strategy);
  }
}

// Production: use real healer
const service = new HealingService(new RealSelectorHealer());

// Test: use mock healer (in test files only)
const testService = new HealingService(new MockHealingEngine());
```

---

### CONFIG-001: Hardcoded Localhost Service URLs
**File:** `apps/api-gateway/src/index.ts:260`  
**Pattern:** `HACK: HIGH`  
**Issue:** Service URLs hardcoded to localhost as fallback  
**Impact:** Breaks in containerized environments, requires manual env var setup

**Fix:**
Use service discovery or fail fast in production:
```typescript
private getServiceUrl(envVar: string, defaultPort: number): string {
  // Production: require explicit configuration
  if (process.env.NODE_ENV === 'production' && !process.env[envVar]) {
    throw new Error(`${envVar} must be set in production`);
  }
  
  // Docker Compose: use container names
  if (process.env.DOCKER_COMPOSE === 'true') {
    const serviceName = envVar.replace('_URL', '').toLowerCase().replace(/_/g, '-');
    return `http://${serviceName}:${defaultPort}`;
  }
  
  // Development: use localhost
  return process.env[envVar] || `http://localhost:${defaultPort}`;
}

private services: ServiceRoute[] = [
  {
    prefix: '/api/v1/orchestrate',
    target: this.getServiceUrl('ORCHESTRATOR_SERVICE_URL', 3022),
    requiresAuth: true,
  },
  // ... other services
];
```

---

### TEST-002: Pre-Test Validation Missing
**File:** `apps/frontend/tests/auth/login.spec.ts:3`  
**Pattern:** `TODO: HIGH`  
**Issue:** Tests start without checking dependencies  
**Impact:** Cryptic timeout errors instead of clear prerequisite failures

**Fix:**
Add global setup in `playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test';
import axios from 'axios';

async function globalSetup() {
  console.log('🔍 Validating test dependencies...\n');
  
  const checks = [
    { name: 'Frontend', url: 'http://localhost:3006' },
    { name: 'API Gateway', url: 'http://localhost:3000/health' },
    { name: 'Auth Service', url: 'http://localhost:3002/health' },
  ];
  
  for (const check of checks) {
    try {
      await axios.get(check.url, { timeout: 3000 });
      console.log(`  ✅ ${check.name}`);
    } catch (error) {
      console.error(`  ❌ ${check.name} - NOT AVAILABLE`);
      console.error(`\n💡 Tip: Run 'npm run dev' in apps/frontend and './scripts/start-mvp.sh'\n`);
      throw new Error(`Dependency check failed: ${check.name}`);
    }
  }
  
  // Verify test user exists
  try {
    const response = await axios.post('http://localhost:3002/api/v1/auth/login', {
      email: 'test@shifty.com',
      password: 'password123',
    });
    console.log(`  ✅ Test user authenticated`);
  } catch (error) {
    console.error(`  ❌ Test user test@shifty.com does not exist`);
    console.error(`\n💡 Tip: Add seed data to init-platform-db.sql\n`);
    throw new Error('Test user not found');
  }
  
  console.log('\n✨ All dependencies validated\n');
}

export default defineConfig({
  globalSetup: './global-setup.ts',
  // ... rest of config
});
```

---

### CI-001: End-to-End CI Workflow Missing
**Status:** Not yet created  
**Pattern:** `TODO: CRITICAL` (implicit)  
**Issue:** No GitHub Actions workflow for full platform validation  
**Impact:** Cannot prove production readiness in automated environment

**Required Workflow:**
Create `.github/workflows/e2e-orchestration.yml`:
```yaml
name: E2E Orchestration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  test-orchestration:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: shifty_platform
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build workspace
        run: npm run build
      
      - name: Initialize database
        run: |
          cat infrastructure/docker/init-platform-db.sql | \
            docker exec -i postgres_container psql -U postgres -d shifty_platform
          cat database/migrations/015_test_orchestration.sql | \
            docker exec -i postgres_container psql -U postgres -d shifty_platform
      
      - name: Start services
        run: |
          docker-compose up -d minio orchestrator-service results-service \
            artifact-storage flakiness-tracker
          sleep 20
      
      - name: Start frontend
        run: |
          cd apps/frontend
          npm run dev &
          npx wait-on http://localhost:3006
      
      - name: Run Playwright tests
        run: |
          cd apps/frontend
          npm test
      
      - name: Run Shifty orchestration
        env:
          SHIFTY_API_URL: http://localhost:3000
          SHIFTY_TENANT_ID: 4110ccd1-ec6b-47f1-b194-0975639f673f
        run: |
          cd apps/frontend
          npm run test:shifty
      
      - name: Upload test artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: |
            apps/frontend/playwright-report/
            apps/frontend/test-results/
```

---

## 📋 Task Summary by File

### Scripts
- `scripts/start-mvp.sh` - Add orchestration services to startup (TODO: CRITICAL)

### Database
- `infrastructure/docker/init-platform-db.sql` - Add seed user (TODO: CRITICAL)
- `infrastructure/docker/init-platform-db.sql` - Execute migration 015 (TODO: CRITICAL)

### Services
- `services/orchestrator-service/src/index.ts` - Schema validation (FIXME: CRITICAL)
- `services/orchestrator-service/src/index.ts` - Worker implementation (TODO: HIGH)
- `services/healing-engine/src/index.ts` - Remove production mocks (MOCK: CRITICAL)

### Frontend
- `apps/frontend/tests/auth/login.spec.ts` - Pre-test validation (TODO: HIGH)
- `apps/frontend/tests/auth/login.spec.ts` - Test user creation (FIXME: CRITICAL)
- `apps/frontend/tests/shifty-runner.ts` - Token refresh (TODO: HIGH)
- `apps/frontend/tests/shifty-runner.ts` - Service availability check (FIXME: CRITICAL)
- `apps/frontend/package.json` - Test scripts and dependencies (TODO: HIGH)

### Infrastructure
- `docker-compose.yml` - Service startup documentation (TODO: CRITICAL × 5)
- `infrastructure/docker/Dockerfile.worker` - Create worker Dockerfile (TODO: CRITICAL)
- `.github/workflows/e2e-orchestration.yml` - CI workflow (TODO: CRITICAL)

### Gateway
- `apps/api-gateway/src/index.ts` - Service URL configuration (HACK: HIGH)

---

## 🎯 Implementation Roadmap

### Phase 1: Infrastructure (4-6 hours)
**Goal:** Get all services running and connected
1. Add orchestration services to start-mvp.sh
2. Execute database migration 015
3. Add seed user to database
4. Create Dockerfile.worker
5. Start all services and verify health checks

**Validation:**
```bash
./scripts/start-mvp.sh
docker-compose ps  # All services should be "Up"
curl http://localhost:3022/health  # {"status":"healthy"}
```

### Phase 2: Code Quality (6-8 hours)
**Goal:** Remove mocks and hardcoded values
1. Extract mock healing to @shifty/test-utilities
2. Implement service URL discovery in API Gateway
3. Add database schema validation to orchestrator
4. Implement BullMQ worker basic structure

**Validation:**
```bash
npm run build  # Should compile without errors
npm run lint   # No critical issues
```

### Phase 3: Testing (4-6 hours)
**Goal:** Make tests reliable and repeatable
1. Add pre-test validation to Playwright config
2. Implement token refresh in shifty-runner
3. Start frontend dev server automatically
4. Add service availability checks

**Validation:**
```bash
cd apps/frontend
npm test  # All tests should pass
npm run test:shifty  # Orchestration should complete
```

### Phase 4: CI/CD (4-6 hours)
**Goal:** Prove functionality in automated environment
1. Create e2e-orchestration.yml workflow
2. Add database initialization steps
3. Configure service startup in CI
4. Add artifact upload and reporting

**Validation:**
- Push to GitHub → workflow runs → all tests pass
- Green checkmark on PR → ready to merge

### Phase 5: Documentation (2-3 hours)
**Goal:** Update docs to reflect actual state
1. Update README with accurate status
2. Document all environment variables
3. Create troubleshooting guide
4. Add architecture diagrams

---

## 🔍 Todo Tree Configuration

Add to `.vscode/settings.json`:
```json
{
  "todo-tree.general.tags": [
    "TODO",
    "FIXME",
    "HACK",
    "MOCK",
    "BUG",
    "NOTE"
  ],
  "todo-tree.highlights.defaultHighlight": {
    "icon": "alert",
    "type": "text",
    "foreground": "#ffffff",
    "background": "#ffbd2e",
    "opacity": 70
  },
  "todo-tree.highlights.customHighlight": {
    "TODO": {
      "icon": "checklist",
      "foreground": "#000000",
      "background": "#ffbd2e"
    },
    "FIXME": {
      "icon": "tools",
      "foreground": "#ffffff",
      "background": "#f06292"
    },
    "HACK": {
      "icon": "flame",
      "foreground": "#000000",
      "background": "#ffa726"
    },
    "MOCK": {
      "icon": "beaker",
      "foreground": "#ffffff",
      "background": "#9c27b0"
    }
  },
  "todo-tree.regex.regex": "((//|#|<!--|;|/\\*|^)\\s*($TAGS)|^\\s*- \\[ \\])",
  "todo-tree.general.tagGroups": {
    "CRITICAL": ["TODO: CRITICAL", "FIXME: CRITICAL", "MOCK: CRITICAL"],
    "HIGH": ["TODO: HIGH", "FIXME: HIGH", "HACK: HIGH"],
    "MEDIUM": ["TODO: MEDIUM", "FIXME: MEDIUM"]
  }
}
```

---

## 📊 Progress Tracking

Use this checklist to track completion:

### Critical Infrastructure
- [ ] Orchestration services added to start-mvp.sh
- [ ] Database migration 015 executed
- [ ] Seed user test@shifty.com created
- [ ] Dockerfile.worker created
- [ ] All services health checks passing

### Code Quality
- [ ] Mock healing extracted to test-utilities
- [ ] Service URL configuration refactored
- [ ] Database schema validation added
- [ ] BullMQ worker implemented

### Testing
- [ ] Pre-test validation in Playwright
- [ ] Token refresh logic implemented
- [ ] Service availability checks added
- [ ] Frontend auto-start in tests

### CI/CD
- [ ] e2e-orchestration.yml workflow created
- [ ] Workflow runs successfully on push
- [ ] All tests pass in CI environment
- [ ] Artifacts uploaded correctly

### Documentation
- [ ] README updated with actual status
- [ ] Environment variables documented
- [ ] Troubleshooting guide created
- [ ] Architecture diagrams added

---

## 🚀 Quick Start Commands

**View all TODO comments:**
```bash
grep -r "TODO\|FIXME\|HACK\|MOCK" --include="*.ts" --include="*.sh" \
  --include="*.sql" --include="*.yml" --include="*.json" \
  services/ apps/ scripts/ infrastructure/ .github/
```

**Count tasks by priority:**
```bash
grep -roh "TODO: CRITICAL\|FIXME: CRITICAL\|MOCK: CRITICAL" \
  --include="*.ts" --include="*.sh" --include="*.sql" | wc -l
```

**Open Todo Tree in VS Code:**
1. Install "Todo Tree" extension (Gruntfuggly.todo-tree)
2. Click Todo Tree icon in Activity Bar
3. Filter by "CRITICAL", "HIGH", "MEDIUM"
4. Click task to jump to file location

---

**Last Updated:** 2025-12-09  
**Maintained By:** Development Team  
**Review Cadence:** Daily during Phase 1-3, Weekly in Phase 4-5
