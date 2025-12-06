# CI Failure Triage Runbook

## Overview
This runbook describes the procedure for diagnosing and resolving CI/CD pipeline failures.

## When to Use
- CI pipeline fails unexpectedly
- Multiple consecutive failures
- Build/test blocking issues

## Prerequisites
- Access to CI/CD Governor
- Repository read permissions
- Telemetry query access

## Procedure

### 1. Identify the Failing Pipeline
```bash
# Get recent pipeline runs
curl -X GET "https://api.shifty.dev/api/v1/ci/runs?status=failed&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

Note:
- Pipeline ID
- Failure stage
- Commit SHA
- Error message

### 2. Pull Failure Details
```bash
# Get detailed pipeline status
curl -X GET "https://api.shifty.dev/api/v1/ci/runs/$PIPELINE_ID" \
  -H "Authorization: Bearer $TOKEN"

# Get job logs
curl -X GET "https://api.shifty.dev/api/v1/ci/runs/$PIPELINE_ID/logs?failed=true" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Query Telemetry for Correlated Regressions
```bash
# Check for correlated errors
curl -X GET "https://api.shifty.dev/api/v1/telemetry/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "ci.pipeline{pipeline_id=\"$PIPELINE_ID\"}",
    "timeRange": "1h"
  }'
```

### 4. Classify the Failure

| Category | Indicators | Action |
|----------|------------|--------|
| Test Failure | Test assertion failed | Investigate test or code |
| Build Failure | Compilation error | Fix code or dependencies |
| Infrastructure | Timeout, OOM | Scale resources or retry |
| Flaky Test | Intermittent failures | Mark flaky or fix test |
| Dependency | Package resolution | Update dependencies |
| Configuration | Invalid config | Fix configuration |

### 5. Test Failure Investigation
```bash
# Get test results
curl -X GET "https://api.shifty.dev/api/v1/tests/results/$PIPELINE_ID" \
  -H "Authorization: Bearer $TOKEN"

# Attempt auto-healing for selector issues
curl -X POST "https://api.shifty.dev/api/v1/healing/batch-heal" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "selectors": [
      {"selector": "$BROKEN_SELECTOR", "pageUrl": "$URL"}
    ]
  }'
```

### 6. Build Failure Investigation
```bash
# Check build logs
curl -X GET "https://api.shifty.dev/api/v1/ci/runs/$PIPELINE_ID/logs?stage=build" \
  -H "Authorization: Bearer $TOKEN"

# Common fixes:
# - Clear build cache
# - Update dependencies
# - Fix TypeScript errors
# - Resolve merge conflicts
```

### 7. Infrastructure Issue Resolution
```bash
# Check service health
curl -X GET "https://api.shifty.dev/api/v1/services/health" \
  -H "Authorization: Bearer $TOKEN"

# Retry the pipeline
curl -X POST "https://api.shifty.dev/api/v1/ci/runs/$PIPELINE_ID/retry" \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Document Outcome
```bash
# Create Jira ticket if needed
curl -X POST "https://api.shifty.dev/api/v1/integrations/jira/issues" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "CI Failure: $PIPELINE_ID",
    "description": "$FAILURE_DETAILS",
    "issueType": "Bug",
    "priority": "High",
    "labels": ["ci-failure", "$FAILURE_CATEGORY"]
  }'
```

## Common Failure Patterns

### Selector Not Found
```
Error: locator.click: Error: Unable to find element with selector "#old-button"
```
Resolution: Use healing engine to fix selector

### Test Timeout
```
Error: Test exceeded timeout of 30000ms
```
Resolution: Increase timeout or optimize test

### Build OOM
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```
Resolution: Increase Node memory limit or optimize build

### Dependency Conflict
```
npm ERR! ERESOLVE unable to resolve dependency tree
```
Resolution: Fix package versions or use --legacy-peer-deps

## Escalation

If unable to resolve within:
- 30 minutes (Critical path) → Escalate to Platform Team
- 2 hours (Non-critical) → Create tracking ticket
- 4 hours (Any) → Engage Engineering Manager

## Contacts

- Platform Team: platform@shifty.dev
- DevOps On-Call: via PagerDuty
