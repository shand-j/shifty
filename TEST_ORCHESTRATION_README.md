# Shifty Test Orchestration Platform

> Transform Shifty from an AI-powered API into a comprehensive test orchestration platform competing with Currents.dev.

## Overview

Shifty Test Orchestration provides **managed cloud execution** with **smart parallelization**, **centralized dashboard**, and **flakiness tracking**—bundled free for AI users. The platform's unique advantage: **autonomous AI healing** where tests self-heal during orchestrated runs and automatically commit fixes via PR, no manual intervention required.

## Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (3000)                       │
│              JWT Auth, Rate Limiting, Routing               │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬──────────────┬─────────────┐
    │             │             │              │             │
┌───▼───┐   ┌────▼────┐   ┌────▼─────┐   ┌───▼────┐   ┌────▼────┐
│Orch   │   │Results  │   │Artifacts │   │Healing │   │Flakiness│
│:3022  │   │:3023    │   │:3024     │   │:3005   │   │:3025    │
└───┬───┘   └────┬────┘   └────┬─────┘   └───┬────┘   └─────────┘
    │            │             │             │
    │       ┌────▼────┐   ┌────▼────┐       │
    │       │WebSocket│   │MinIO    │       │
    │       │Streaming│   │Storage  │       │
    │       └─────────┘   └─────────┘       │
    │                                        │
┌───▼────────────────────────────────────────▼────┐
│     BullMQ Queue (Redis) - Test Jobs            │
└──────────┬────────┬────────┬────────┬───────────┘
           │        │        │        │
      ┌────▼───┐ ┌─▼────┐ ┌─▼────┐ ┌▼─────┐
      │Worker 1│ │Worker│ │Worker│ │Worker│  ← Scale to N
      │        │ │  2   │ │  3   │ │ ...  │
      └────────┘ └──────┘ └──────┘ └──────┘
        Playwright + Shifty SDK + Auto-Healing
```

## Key Components

### 1. Playwright Reporter (`@shifty/sdk-reporter`)

Custom Playwright reporter that streams test results in real-time.

**Features:**
- Real-time WebSocket streaming to results service
- Batch result processing (configurable batch size)
- Automatic artifact uploads (traces, screenshots, videos)
- Seamless Playwright integration

**Usage:**

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['@shifty/sdk-reporter', {
      apiUrl: 'https://api.shifty.ai',
      apiKey: process.env.SHIFTY_API_KEY,
      tenantId: process.env.SHIFTY_TENANT_ID,
      runId: process.env.SHIFTY_RUN_ID,
      uploadArtifacts: true,
    }],
  ],
});
```

### 2. Orchestrator Service (Port 3022)

Manages test distribution with **greedy bin-packing** algorithm.

**Features:**
- Duration-aware sharding (40% faster than round-robin)
- BullMQ job queue for worker distribution
- Real-time progress via SSE
- Post-run healing PR creation hook

**Algorithm:**

1. Fetch p50 duration for each test from `test_history`
2. Sort tests by duration (descending)
3. Assign each test to shard with minimum total duration
4. Result: Balanced load across workers

**Example:**

```bash
curl -X POST https://api.shifty.ai/api/v1/orchestrate \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-Tenant-ID: $TENANT_ID" \
  -d '{
    "testFiles": ["tests/login.spec.ts", "tests/checkout.spec.ts"],
    "workerCount": 5,
    "branch": "main",
    "commitSha": "abc123"
  }'
```

### 3. Results Service (Port 3023)

Collects and stores test results with real-time streaming.

**Features:**
- WebSocket endpoint for live test result ingestion
- SSE endpoint for progress monitoring
- Automatic test history aggregation
- Failed test extraction for reruns

**Endpoints:**
- `WS /ws` - Real-time result streaming
- `GET /api/v1/runs` - Query run history
- `GET /api/v1/runs/:id` - Get run details
- `GET /api/v1/runs/:id/failed-tests` - Get failed tests for rerun

### 4. Artifact Storage (Port 3024)

MinIO-based object storage for test artifacts.

**Features:**
- Pre-signed URL generation for uploads/downloads
- Configurable retention (30/60/90 days by plan)
- Automatic lifecycle management
- S3-compatible API

**Storage Structure:**

```
shifty-artifacts/
├── {tenant-id}/
│   ├── {run-id}/
│   │   ├── trace/
│   │   │   └── 1733742000-trace.zip
│   │   ├── screenshot/
│   │   │   └── 1733742000-failure.png
│   │   └── video/
│   │       └── 1733742000-replay.webm
```

### 5. Test Workers

Playwright-based Docker workers with autonomous healing.

**Features:**
- Playwright v1.50.0 pre-installed
- Shifty SDK integration
- Synchronous healing during test execution
- Automatic healing event logging

**Healing Flow:**

```
1. Test executes → Selector fails
2. Worker calls healing-engine:3005/heal
3. Healing engine analyzes page and returns healed selector
4. Worker retries with healed selector
5. Logs healing event to database
6. Test continues or fails
```

**Scaling:**

```bash
# Docker Compose
docker-compose up --scale test-worker=10

# Kubernetes (HPA)
kubectl autoscale deployment test-worker --min=3 --max=20 --cpu-percent=70
```

### 6. Flakiness Tracker (Port 3025)

Detects and tracks flaky tests with recommendations.

**Features:**
- Nightly cron job for flakiness calculation
- Flakiness rate = (flaky_runs / total_runs) * 100
- Trends over time
- Actionable recommendations

**Detection:**

A test is flaky if it:
- Passed after one or more retries (`retry_count > 0 && status = 'passed'`)
- Has inconsistent results across runs

**API:**

```bash
# Get flaky tests
GET /api/v1/analytics/flaky-tests?minRate=20

# Get trends
GET /api/v1/analytics/flakiness-trends?days=30

# Get recommendations
GET /api/v1/analytics/flaky-recommendations
```

## Autonomous Healing

### How It Works

1. **During Test Execution:**
   - Worker detects selector failure
   - Synchronously calls healing engine
   - Healing engine analyzes page using 4 strategies:
     - `data-testid-recovery`: Levenshtein distance matching
     - `text-content-matching`: Fuzzy text matching (80%+)
     - `css-hierarchy-analysis`: 10 alternative selector patterns
     - `ai-powered-analysis`: Ollama AI inference
   - Returns healed selector with confidence score

2. **Healing Event Logging:**
   - Worker saves event to `healing_events` table
   - Includes: original/healed selector, confidence, strategy, success

3. **Post-Run PR Creation:**
   - Orchestrator checks healing events (confidence >= 0.7)
   - Aggregates healed selectors per test file
   - Calls production-feedback service to create PR
   - PR includes: healing details, confidence scores, trace links

### Healing Event Example

```json
{
  "id": "event-123",
  "runId": "run-456",
  "testFile": "tests/login.spec.ts",
  "testName": "should login successfully",
  "originalSelector": "#username",
  "healedSelector": "[data-testid='username-input']",
  "confidence": 0.95,
  "strategy": "data-testid-recovery",
  "success": true,
  "executionTimeMs": 120,
  "pageUrl": "https://app.example.com/login"
}
```

## GitHub Actions Integration

### Basic Orchestration

```yaml
- name: Run Shifty orchestrated tests
  run: |
    test_files=$(find tests -name "*.spec.ts" | jq -R -s -c 'split("\n")[:-1]')
    
    curl -X POST "${{ secrets.SHIFTY_API_URL }}/api/v1/orchestrate" \
      -H "Authorization: Bearer ${{ secrets.SHIFTY_API_KEY }}" \
      -H "X-Tenant-ID: ${{ secrets.SHIFTY_TENANT_ID }}" \
      -d "{\"testFiles\": $test_files, \"workerCount\": 5}"
```

### Rerun Failed Tests

```yaml
- uses: ./.github/actions/shifty-rerun-failed
  with:
    shifty-api-url: ${{ secrets.SHIFTY_API_URL }}
    shifty-api-key: ${{ secrets.SHIFTY_API_KEY }}
    run-id: ${{ inputs.previous_run_id }}

- name: Run failed tests
  run: |
    test_files=$(cat failed-tests-grep.txt | jq -R -s -c 'split("\n")[:-1]')
    # Start new orchestration with only failed tests
```

See [complete examples](./docs/examples/github-actions-orchestration.md).

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `test_runs` | Orchestrated test execution metadata |
| `test_results` | Individual test execution results |
| `test_history` | Aggregated test performance (p50, p95, p99 durations) |
| `healing_events` | Autonomous healing attempts during execution |
| `healing_prs` | Automated PR tracking for healed selectors |
| `test_flakiness` | Flakiness detection and rate tracking |
| `test_shards` | Shard assignment and execution tracking |
| `test_artifacts` | Artifact storage metadata and URLs |

### Key Indexes

- `idx_test_runs_tenant_id`, `idx_test_runs_status`
- `idx_test_results_run_id`, `idx_test_results_status`
- `idx_test_history_flakiness_rate` (DESC)
- `idx_healing_events_confidence` (DESC)

## API Reference

### Orchestration

```
POST   /api/v1/orchestrate              Start orchestrated run
GET    /api/v1/orchestrate/:id/progress SSE progress stream
DELETE /api/v1/orchestrate/:id          Cancel orchestration
GET    /api/v1/orchestrate/queue/stats  Queue statistics
```

### Results

```
GET /api/v1/runs                    Query run history
GET /api/v1/runs/:id                Get run details
GET /api/v1/runs/:id/failed-tests   Get failed tests
```

### Artifacts

```
POST /api/v1/artifacts/upload           Direct upload
POST /api/v1/artifacts/presigned-upload Get pre-signed URL
GET  /api/v1/artifacts/:key             Get artifact
GET  /api/v1/runs/:id/artifacts         Get run artifacts
```

### Flakiness

```
GET /api/v1/analytics/flaky-tests          List flaky tests
GET /api/v1/analytics/flakiness-trends     Trends over time
GET /api/v1/analytics/flaky-recommendations Actionable recommendations
```

See [full API documentation](./docs/architecture/orchestration-api-reference.md).

## Deployment

### Docker Compose (Development)

```bash
# Start all services (including 3 workers)
docker-compose up -d

# Scale workers
docker-compose up --scale test-worker=10
```

### Kubernetes (Production)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-worker
spec:
  replicas: 5
  template:
    spec:
      containers:
      - name: worker
        image: shifty/test-worker:latest
        resources:
          limits:
            cpu: "2"
            memory: "2Gi"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: test-worker-hpa
spec:
  scaleTargetRef:
    name: test-worker
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Pricing Strategy

### Option 1: Bundled Free (Recommended)

- Free orchestrated execution for paid AI users
- Quota: 1000 test minutes/month
- Increases AI platform value proposition
- Undercuts Currents.dev ($0.10/min)

### Option 2: Separate Pricing

- $0.05/minute (30% below Currents)
- Tiered plans:
  - Starter: 1000 min/month
  - Pro: 5000 min/month
  - Enterprise: Unlimited

### Option 3: Self-Hosted

- Helm charts available
- Run on your own Kubernetes cluster
- No vendor lock-in
- Free for unlimited usage

## Differentiators vs Currents.dev

| Feature | Shifty | Currents.dev |
|---------|--------|--------------|
| **Autonomous Healing** | ✅ Built-in, auto-PR | ❌ No healing |
| **AI Integration** | ✅ 4 strategies + Ollama | ❌ None |
| **Smart Sharding** | ✅ Greedy bin-packing | ✅ Duration-aware |
| **Real-time Streaming** | ✅ WebSocket | ✅ WebSocket |
| **Flakiness Detection** | ✅ Nightly analysis | ✅ Similar |
| **Artifact Storage** | ✅ MinIO (S3-compatible) | ✅ Cloud storage |
| **Pricing** | 🎁 Free for AI users | 💰 $0.10/min |
| **MCP Integration** | ✅ Planned | ✅ Read-only |

## Next Steps

### Remaining Work

1. **Frontend Dashboard**
   - `RunDetails.tsx` page with test tree
   - Run history list with filtering
   - Embedded Playwright trace viewer
   - Zustand store for run state

2. **PR Creation Integration**
   - Complete production-feedback service integration
   - PR comment templates with healing details
   - GitHub status checks per project

3. **Testing**
   - Integration tests for orchestration flow
   - Worker auto-healing validation
   - PR creation workflow tests

4. **Documentation**
   - Pricing strategy details
   - Self-hosted deployment guide
   - Kubernetes configuration examples

### Future Enhancements

- GitLab/CircleCI support
- Multi-region worker pools
- Cost optimization dashboard
- Custom sharding strategies
- MCP server for autonomous healing
- Trace viewer enhancements

## Resources

- [API Reference](./docs/architecture/orchestration-api-reference.md)
- [GitHub Actions Examples](./docs/examples/github-actions-orchestration.md)
- [Architecture Diagrams](./docs/architecture/)
- [Database Migration](./database/migrations/015_test_orchestration.sql)

## Support

- Email: support@shifty.ai
- Slack: shifty-community.slack.com
- GitHub Issues: github.com/shifty-ai/shifty/issues
- Documentation: docs.shifty.ai

---

**Built with ❤️ by the Shifty team**
