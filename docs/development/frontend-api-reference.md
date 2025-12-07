# Frontend API Quick Reference

Quick reference for API endpoints used by the Shifty Hub frontend.

## Base URL

Development: `http://localhost:3000/api/v1`  
Production: `https://api.shifty.dev/api/v1`

All requests except `/auth/*` require `Authorization: Bearer {jwt_token}` header.

## Authentication

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "tenantId": "uuid",
    "role": "admin",
    "persona": "dev"
  }
}
```

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Verify Token
```http
POST /api/v1/auth/verify
Authorization: Bearer {token}
```

## Tenants

### List Tenants
```http
GET /api/v1/tenants
Authorization: Bearer {token}
```

### Get Tenant Details
```http
GET /api/v1/tenants/{tenantId}
Authorization: Bearer {token}
```

## Tests

### List Tests
```http
GET /api/v1/tests
Authorization: Bearer {token}
```

### Generate Test
```http
POST /api/v1/tests/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenantId": "uuid",
  "requirements": "Test login functionality",
  "framework": "playwright",
  "targetUrl": "https://app.example.com"
}
```

### Get Generation Status
```http
GET /api/v1/tests/generate/{jobId}/status
Authorization: Bearer {token}
```

## Healing

### Heal Selector
```http
POST /api/v1/healing/heal-selector
Authorization: Bearer {token}
Content-Type: application/json

{
  "brokenSelector": "#old-button-id",
  "pageUrl": "https://app.example.com",
  "elementType": "button",
  "strategy": "ai-powered-analysis"
}
```

### Batch Heal
```http
POST /api/v1/healing/batch-heal
Authorization: Bearer {token}
Content-Type: application/json

{
  "selectors": [
    {
      "selector": "#old-button",
      "pageUrl": "https://app.example.com/page1"
    }
  ]
}
```

## Manual Sessions

### Create Session
```http
POST /api/v1/sessions/manual
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenantId": "uuid",
  "userId": "uuid",
  "persona": "qa",
  "sessionType": "exploratory",
  "title": "Login Flow Testing"
}
```

### Add Test Step
```http
POST /api/v1/sessions/manual/{sessionId}/steps
Authorization: Bearer {token}
Content-Type: application/json

{
  "sequence": 1,
  "action": "Navigate to login page",
  "expectedResult": "Login form displayed",
  "status": "pending"
}
```

### List Sessions
```http
GET /api/v1/sessions/manual
Authorization: Bearer {token}
```

### Get Session Details
```http
GET /api/v1/sessions/manual/{sessionId}
Authorization: Bearer {token}
```

## CI Pipelines

### List Pipelines
```http
GET /api/v1/ci/pipelines
Authorization: Bearer {token}
```

### Get Pipeline Details
```http
GET /api/v1/ci/pipelines/{pipelineId}
Authorization: Bearer {token}
```

### Trigger Pipeline
```http
POST /api/v1/ci/pipelines/{pipelineId}/trigger
Authorization: Bearer {token}
```

## ROI & Insights

### Get ROI Insights
```http
GET /api/v1/roi/insights?tenantId={uuid}&timeframe=monthly
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roi": {
      "timeSavings": { "totalHoursSaved": 150 },
      "qualityImpact": { "incidentsPreventedCount": 5 },
      "velocityGains": { "velocityIndex": 135 }
    }
  }
}
```

### Get DORA Metrics
```http
GET /api/v1/roi/dora?tenantId={uuid}&timeframe=monthly
Authorization: Bearer {token}
```

### Get SPACE Metrics
```http
GET /api/v1/roi/space?tenantId={uuid}&timeframe=monthly
Authorization: Bearer {token}
```

## Performance Testing

### Create Performance Test Config
```http
POST /api/v1/performance/configs
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenantId": "uuid",
  "name": "Load Test - Login",
  "testType": "load",
  "targetUrl": "https://app.example.com",
  "virtualUsers": 100,
  "durationSeconds": 300
}
```

### Start Performance Test
```http
POST /api/v1/performance/runs
Authorization: Bearer {token}
Content-Type: application/json

{
  "configId": "uuid"
}
```

## Security Testing

### Create Security Scan Config
```http
POST /api/v1/security/configs
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenantId": "uuid",
  "name": "DAST Scan",
  "scanType": "dast",
  "target": { "url": "https://app.example.com" }
}
```

### Start Security Scan
```http
POST /api/v1/security/scans
Authorization: Bearer {token}
Content-Type: application/json

{
  "configId": "uuid"
}
```

## Accessibility Testing

### Create Accessibility Scan Config
```http
POST /api/v1/accessibility/configs
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenantId": "uuid",
  "name": "WCAG 2.1 AA Scan",
  "targetUrls": ["https://app.example.com"],
  "standard": "WCAG21AA"
}
```

### Start Accessibility Scan
```http
POST /api/v1/accessibility/scans
Authorization: Bearer {token}
Content-Type: application/json

{
  "configId": "uuid"
}
```

## HITL Arcade

### Get Available Tasks
```http
GET /api/v1/hitl/tasks
Authorization: Bearer {token}
```

### Claim Task
```http
POST /api/v1/hitl/tasks/{taskId}/claim
Authorization: Bearer {token}
```

### Submit Task Result
```http
POST /api/v1/hitl/tasks/{taskId}/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "result": "approved",
  "notes": "Looks good"
}
```

### Get Leaderboard
```http
GET /api/v1/hitl/leaderboard?timeframe=weekly
Authorization: Bearer {token}
```

## AI Orchestrator

### Get AI Status
```http
GET /api/v1/ai/status
Authorization: Bearer {token}
```

### List Available Models
```http
GET /api/v1/ai/models
Authorization: Bearer {token}
```

### Load Model
```http
POST /api/v1/ai/models/load
Authorization: Bearer {token}
Content-Type: application/json

{
  "model": "llama3.1",
  "priority": "high"
}
```

## Health & Monitoring

### API Gateway Health
```http
GET /health
```

### Service Health Aggregation
```http
GET /api/v1/services/health
```

### Gateway Metrics
```http
GET /api/v1/metrics
```

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email",
      "value": ""
    }
  },
  "timestamp": "2025-01-11T10:00:00Z"
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Invalid input
- `UNAUTHORIZED` - Missing/invalid token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Rate Limits

Default: 500 requests/minute per tenant  
Headers included in responses:
```
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 499
X-RateLimit-Reset: 1641916800
```

## Frontend Usage Examples

### Login Example
```typescript
const handleLogin = async (email: string, password: string) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message ?? 'Login failed');
  }
  
  const data = await response.json();
  setAuth(data.token, data.user);
};
```

### Authenticated Request Example
```typescript
const fetchTests = async () => {
  const token = useAuthStore.getState().token;
  
  const response = await fetch('/api/v1/tests', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
};
```

### Error Handling Example
```typescript
try {
  const data = await fetchTests();
  setTests(data.tests);
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired, logout
    logout();
    navigate('/login');
  } else {
    setError('Failed to fetch tests');
  }
}
```

---

**Last Updated:** 2025-12-06  
**Maintained by:** Shifty Development Team
