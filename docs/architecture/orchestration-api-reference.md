# Test Orchestration API Reference

## Overview

Shifty's test orchestration platform provides Currents.dev-style distributed test execution with autonomous AI healing. This document covers the orchestration-specific APIs.

## Base URL

```
https://api.shifty.ai/api/v1
```

All requests require:
- `Authorization: Bearer <api_key>` header
- `X-Tenant-ID: <tenant_id>` header

---

## Orchestration Endpoints

### Start Orchestrated Test Run

Initiate a new test orchestration with smart sharding.

```http
POST /orchestrate
```

**Request Body:**

```json
{
  "testFiles": ["tests/login.spec.ts", "tests/checkout.spec.ts"],
  "workerCount": 5,
  "project": "my-app",
  "branch": "main",
  "commitSha": "abc123",
  "metadata": {
    "pr_number": 42,
    "actor": "username"
  }
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `testFiles` | array | Yes | List of test file paths to execute |
| `workerCount` | number | No | Number of parallel workers (1-20, default: 5) |
| `project` | string | No | Project identifier |
| `branch` | string | No | Git branch name |
| `commitSha` | string | No | Git commit SHA |
| `metadata` | object | No | Custom metadata |

**Response:**

```json
{
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "workerCount": 5,
  "totalTests": 150,
  "shards": [
    {
      "index": 0,
      "testCount": 30,
      "estimatedDuration": 45000
    },
    {
      "index": 1,
      "testCount": 30,
      "estimatedDuration": 44500
    }
  ]
}
```

**Sharding Algorithm:**

Shifty uses **greedy bin-packing** with historical duration data:

1. Fetches p50 duration for each test from `test_history` table
2. Sorts tests by duration (descending)
3. Assigns each test to the shard with minimum total duration
4. Results in ~40% faster execution vs round-robin (like Currents)

---

### Get Run Progress (SSE)

Stream real-time progress updates for a running test orchestration.

```http
GET /orchestrate/{runId}/progress
```

**Response (Server-Sent Events):**

```
data: {"id":"550e8400-...","status":"running","passedTests":45,"failedTests":2}

data: {"id":"550e8400-...","status":"running","passedTests":90,"failedTests":5}

data: {"id":"550e8400-...","status":"completed","passedTests":148,"failedTests":2}
```

**Events:**
- Sent every 2 seconds
- Includes updated test counts and shard statuses
- Connection closes when run completes or fails

---

### Cancel Orchestration

Cancel a running test orchestration.

```http
DELETE /orchestrate/{runId}
```

**Response:**

```json
{
  "success": true,
  "message": "Orchestration cancelled"
}
```

**Behavior:**
- Updates run status to `cancelled`
- Removes pending jobs from queue
- Allows currently running tests to complete

---

### Get Queue Stats

Get current orchestration queue statistics.

```http
GET /orchestrate/queue/stats
```

**Response:**

```json
{
  "waiting": 12,
  "active": 5,
  "completed": 342,
  "failed": 8
}
```

---

## Results Endpoints

### Get Test Runs

Retrieve test run history with filtering.

```http
GET /runs?tenant={id}&branch={name}&status={all|passed|failed}
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `tenant` | string | Filter by tenant ID |
| `project` | string | Filter by project ID |
| `branch` | string | Filter by branch name |
| `status` | string | Filter by status (all, pending, running, completed, failed) |
| `limit` | number | Results per page (default: 50) |
| `offset` | number | Pagination offset (default: 0) |

**Response:**

```json
{
  "runs": [
    {
      "id": "550e8400-...",
      "status": "completed",
      "totalTests": 150,
      "passedTests": 148,
      "failedTests": 2,
      "durationMs": 125000,
      "branch": "main",
      "commitSha": "abc123",
      "createdAt": "2024-12-09T10:00:00Z",
      "completedAt": "2024-12-09T10:02:05Z"
    }
  ]
}
```

---

### Get Run Details

Get detailed information about a specific test run.

```http
GET /runs/{runId}
```

**Response:**

```json
{
  "run": {
    "id": "550e8400-...",
    "status": "completed",
    "totalTests": 150,
    "passedTests": 148,
    "failedTests": 2,
    "flakyTests": 3,
    "durationMs": 125000,
    "workerCount": 5,
    "shardStrategy": "duration-aware",
    "branch": "main",
    "commitSha": "abc123",
    "metadata": {}
  },
  "results": [
    {
      "id": "result-1",
      "testFile": "tests/login.spec.ts",
      "testName": "should login successfully",
      "status": "passed",
      "durationMs": 1250,
      "retryCount": 0,
      "healingAttempted": false,
      "traceUrl": "https://artifacts.shifty.ai/..."
    }
  ]
}
```

---

### Get Failed Tests

Get list of failed tests from a run (for rerun functionality).

```http
GET /runs/{runId}/failed-tests
```

**Response:**

```json
{
  "failedTests": [
    {
      "testFile": "tests/checkout.spec.ts",
      "testName": "should complete purchase",
      "errorMessage": "Timeout 30000ms exceeded"
    }
  ]
}
```

**Use Case:**

Feed this into the `@shifty/actions/rerun-failed` GitHub Action to rerun only failed tests.

---

## Artifact Endpoints

### Upload Artifact

Upload test artifact (trace, screenshot, video).

```http
POST /artifacts/upload
```

**Headers:**

```
Content-Type: application/octet-stream
X-Run-ID: {runId}
X-Artifact-Type: trace|screenshot|video|log
X-Artifact-Name: {filename}
```

**Response:**

```json
{
  "success": true,
  "url": "https://artifacts.shifty.ai/tenant/run/trace/1733742000-trace.zip",
  "storageKey": "tenant-id/run-id/trace/1733742000-trace.zip",
  "sizeBytes": 1048576,
  "expiresAt": "2025-01-08T10:00:00Z"
}
```

---

### Get Pre-signed Upload URL

Get pre-signed URL for direct artifact upload (faster for large files).

```http
POST /artifacts/presigned-upload
```

**Request Body:**

```json
{
  "runId": "550e8400-...",
  "artifactType": "trace",
  "filename": "trace.zip",
  "contentType": "application/zip"
}
```

**Response:**

```json
{
  "uploadUrl": "https://minio.shifty.ai/...",
  "storageKey": "tenant-id/run-id/trace/...",
  "expiresIn": 3600
}
```

---

### Get Run Artifacts

Get all artifacts for a specific run.

```http
GET /runs/{runId}/artifacts
```

**Response:**

```json
{
  "artifacts": [
    {
      "id": "artifact-1",
      "artifactType": "trace",
      "storageKey": "...",
      "url": "https://artifacts.shifty.ai/...",
      "sizeBytes": 1048576,
      "createdAt": "2024-12-09T10:01:30Z",
      "expiresAt": "2025-01-08T10:01:30Z"
    }
  ]
}
```

---

## Healing Endpoints

### Get Healing Events

Get healing events from a test run.

```http
GET /healing/events?runId={runId}&minConfidence=0.7
```

**Response:**

```json
{
  "events": [
    {
      "id": "event-1",
      "runId": "550e8400-...",
      "testFile": "tests/login.spec.ts",
      "testName": "should login",
      "originalSelector": "#username",
      "healedSelector": "[data-testid='username-input']",
      "confidence": 0.95,
      "strategy": "data-testid-recovery",
      "success": true,
      "executionTimeMs": 120
    }
  ]
}
```

---

### Get Healing PRs

Get automated healing pull requests for a run.

```http
GET /healing/prs?runId={runId}
```

**Response:**

```json
{
  "prs": [
    {
      "id": "pr-1",
      "runId": "550e8400-...",
      "repository": "owner/repo",
      "branchName": "shifty/heal-selectors-550e8400",
      "prNumber": 123,
      "prUrl": "https://github.com/owner/repo/pull/123",
      "prStatus": "open",
      "healingCount": 5,
      "avgConfidence": 0.87,
      "createdAt": "2024-12-09T10:05:00Z"
    }
  ]
}
```

---

## Flakiness Endpoints

### Get Flaky Tests

Get list of flaky tests with flakiness rates.

```http
GET /analytics/flaky-tests?project={id}&minRate=10
```

**Response:**

```json
{
  "flakyTests": [
    {
      "testFile": "tests/checkout.spec.ts",
      "testName": "should handle network errors",
      "flakinessRate": 45.5,
      "flakyRuns": 10,
      "totalRuns": 22,
      "lastFlakyAt": "2024-12-08T15:30:00Z"
    }
  ]
}
```

---

### Get Flakiness Trends

Get flakiness trends over time.

```http
GET /analytics/flakiness-trends?project={id}&days=30
```

**Response:**

```json
{
  "trends": [
    {
      "detectionDate": "2024-12-09",
      "flakyTestCount": 12,
      "avgFlakinessRate": 23.4
    },
    {
      "detectionDate": "2024-12-08",
      "flakyTestCount": 15,
      "avgFlakinessRate": 25.1
    }
  ]
}
```

---

### Get Flaky Recommendations

Get actionable recommendations for fixing flaky tests.

```http
GET /analytics/flaky-recommendations
```

**Response:**

```json
{
  "recommendations": [
    {
      "test": {
        "file": "tests/checkout.spec.ts",
        "name": "should handle network errors",
        "flakinessRate": 52.3
      },
      "severity": "high",
      "recommendation": "Consider quarantining this test or rewriting it",
      "impact": "Failing 23 out of 44 runs"
    }
  ]
}
```

---

## WebSocket Endpoints

### Real-Time Results Streaming

Connect to receive real-time test results during execution.

```
ws://api.shifty.ai/ws
```

**Connection Headers:**

```
Authorization: Bearer <api_key>
X-Tenant-ID: <tenant_id>
X-Run-ID: <run_id>
```

**Message Types:**

#### `run:start`
```json
{
  "type": "run:start",
  "payload": {
    "runId": "550e8400-...",
    "totalTests": 150,
    "shardIndex": 0,
    "totalShards": 5
  }
}
```

#### `test:start`
```json
{
  "type": "test:start",
  "payload": {
    "runId": "550e8400-...",
    "testFile": "tests/login.spec.ts",
    "testName": "should login successfully"
  }
}
```

#### `test:batch`
```json
{
  "type": "test:batch",
  "payload": {
    "runId": "550e8400-...",
    "results": [...]
  }
}
```

#### `run:end`
```json
{
  "type": "run:end",
  "payload": {
    "runId": "550e8400-...",
    "status": "completed",
    "totalTests": 150,
    "passedTests": 148,
    "failedTests": 2
  }
}
```

---

## Rate Limits

- Default: 500 requests/minute per tenant
- Burst: 2× for CI ingestion windows
- WebSocket connections: 10 concurrent per tenant

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common Error Codes:**

- `UNAUTHORIZED`: Invalid or missing API key
- `INVALID_TENANT`: Invalid tenant ID
- `RUN_NOT_FOUND`: Test run does not exist
- `QUEUE_FULL`: Job queue is at capacity
- `INVALID_PARAMETERS`: Request validation failed

---

## Next Steps

- [GitHub Actions Examples](../examples/github-actions-orchestration.md)
- [Worker Configuration](../development/worker-configuration.md)
- [Healing Strategies](../architecture/healing-strategies.md)
- [Pricing & Quotas](../architecture/pricing-strategy.md)
