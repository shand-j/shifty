# GitHub Actions Workflows - CI/CD for GTM Readiness

This directory contains GitHub Actions workflows that automatically run all tests on every PR to ensure production readiness.

## Workflows Overview

### 1. GTM Readiness - All Tests (`gtm-readiness-all-tests.yml`)
**Main workflow for PR checks** - Runs all 125+ tests across API, Frontend, and Integration suites.

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`
- Manual dispatch

**Jobs:**
- Pre-flight checks (lint, type-check, critical TODO scan)
- API tests (65+ tests with coverage)
- Frontend tests (45+ Playwright tests)
- Integration tests (15+ E2E tests)
- Final status report

**Duration:** ~30-45 minutes

### 2. CI - API Tests (`ci-api-tests.yml`)
Runs backend API tests with coverage reporting.

**Coverage:**
- Auth service tests
- Tenant manager tests
- AI orchestrator tests
- Test generator tests
- Healing engine tests
- Orchestrator service tests (NEW)
- ROI service tests (NEW)

**Includes:**
- Lint and type checking
- Security scanning (npm audit)
- Coverage threshold validation (70%+)

### 3. Frontend Tests (`frontend-tests.yml`)
Runs Playwright tests across multiple browsers.

**Coverage:**
- Product Owner persona workflows
- QA/SDET persona workflows
- Developer persona workflows
- Authentication flows

**Browsers:**
- Chromium
- Firefox
- WebKit

**Features:**
- Parallel browser testing
- Visual test reports
- Artifact uploads

### 4. Integration Tests (`integration-tests.yml`)
Runs end-to-end workflow tests across all services.

**Coverage:**
- Complete user journeys (registration → execution → results)
- Multi-persona workflows
- Cross-service communication
- Database migrations

**Infrastructure:**
- All 14 services running
- PostgreSQL + Redis
- MinIO for artifacts
- Ollama for AI

## Required Secrets

None required for basic operation. All tests run with test credentials.

**Optional secrets for production:**
- `SHIFTY_API_KEY` - For Shifty Quality Insights integration
- `SONAR_TOKEN` - For SonarQube integration

## Required Services

Workflows automatically provision:
- PostgreSQL 15
- Redis 7
- Ollama (AI models)
- MinIO (object storage)

## Test Execution Flow

```
PR Created/Updated
       ↓
GTM Readiness Workflow Triggered
       ↓
┌──────────────────────────────┐
│   Pre-flight Checks          │
│   - Lint                     │
│   - Type check               │
│   - Critical TODO scan       │
└──────────────────────────────┘
       ↓
┌──────────────────────────────┐
│   Parallel Test Execution    │
├──────────────────────────────┤
│ API Tests    │ Frontend Tests│
│ (65+ tests)  │ (45+ tests)   │
│              │               │
│ Integration Tests            │
│ (15+ tests)                  │
└──────────────────────────────┘
       ↓
┌──────────────────────────────┐
│   Final Status Report        │
│   - All tests passed ✅      │
│   - Coverage meets 70%+ ✅   │
│   - Zero critical TODOs ✅   │
└──────────────────────────────┘
       ↓
PR Check Status Updated
```

## Status Checks

Each PR must pass:
1. ✅ Pre-flight checks
2. ✅ API tests (65+ tests)
3. ✅ Frontend tests (45+ tests)
4. ✅ Integration tests (15+ tests)
5. ✅ Coverage threshold (70%+)
6. ✅ No critical TODOs

## Artifacts

Workflows upload:
- Test results (JSON/HTML)
- Coverage reports
- Playwright reports (screenshots, videos, traces)
- Test execution logs

**Retention:** 30 days

## Viewing Results

### In PR Comments
Each workflow posts a summary comment with:
- Test execution status
- Pass/fail counts
- Coverage percentages
- Links to detailed reports

### In Actions Tab
Navigate to: `https://github.com/[org]/[repo]/actions`
- View detailed logs
- Download artifacts
- See test history

### In PR Checks
Status checks appear at bottom of PR:
- ✅ Green = All tests passed
- ❌ Red = Tests failed (click for details)
- 🟡 Yellow = In progress

## Local Testing

Run the same tests locally before pushing:

```bash
# All tests (same as CI)
npm test                  # API tests
cd apps/frontend && npm test  # Frontend tests
npm run test:integration  # Integration tests

# With coverage
npm run test:coverage

# Quick validation
npm run lint
npm run type-check
grep -r "TODO: CRITICAL" services/ apps/ packages/
```

## Troubleshooting

### Tests Failing in CI but Passing Locally

1. **Check service dependencies:**
   ```bash
   ./scripts/health-check.sh
   ```

2. **Verify database state:**
   - CI uses fresh database each run
   - Check migrations are applied

3. **Review logs:**
   - Click on failed job in Actions tab
   - Download artifacts for detailed reports

### Slow Test Execution

Tests run in parallel but may take 30-45 minutes total:
- API tests: ~10 minutes
- Frontend tests: ~15 minutes
- Integration tests: ~20 minutes

### Coverage Below Threshold

If coverage drops below 70%:
1. Add tests for new code
2. Check coverage report in artifacts
3. Identify untested branches/functions

## Maintenance

### Adding New Tests

1. Add test files to appropriate directory:
   - API: `tests/api/[service]/`
   - Frontend: `apps/frontend/tests/personas/`
   - Integration: `tests/integration/`

2. Tests automatically included in CI runs

3. Update test counts in workflow files if needed

### Updating Node Version

Update `NODE_VERSION` in all workflow files:
```yaml
env:
  NODE_VERSION: '20.18'  # Update this
```

### Modifying Test Timeouts

Adjust `timeout-minutes` in workflow jobs:
```yaml
jobs:
  api-tests:
    timeout-minutes: 30  # Increase if needed
```

## Best Practices

1. **Keep tests fast:** Optimize slow tests to maintain CI speed
2. **Run locally first:** Catch issues before pushing
3. **Monitor coverage:** Maintain 70%+ threshold
4. **Review failures:** Don't ignore flaky tests
5. **Update docs:** Keep README and test docs in sync

## Support

For issues with workflows:
1. Check workflow logs in Actions tab
2. Review troubleshooting guide: `docs/TROUBLESHOOTING.md`
3. See test documentation: `GTM_READINESS_TESTS.md`

---

**Last Updated:** December 10, 2025  
**Maintained By:** Development Team
