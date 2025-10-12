# 🌐 API Reference

Complete API documentation for all Shifty services.

## 🏗️ Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (Port 3000)                │
│                   All requests start here                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐    ┌───▼───┐    ┌───▼────┐
│ Auth  │    │Tenant │    │   AI   │
│:3002  │    │ :3001 │    │ :3003  │
└───┬───┘    └───┬───┘    └───┬────┘
    │             │            │
┌───▼────┐   ┌───▼────┐   ┌───▼────┐
│ Test   │   │Healing │   │Project │
│ Gen    │   │Engine  │   │Manager │
│ :3004  │   │ :3005  │   │ :3006  │
└────────┘   └────────┘   └────────┘
```

## 🔗 Base URLs

| Environment | Base URL | Gateway Port |
|-------------|----------|--------------|
| **Development** | `http://localhost:3000` | 3000 |
| **Staging** | `https://api-staging.shifty.dev` | 443 |
| **Production** | `https://api.shifty.dev` | 443 |

## 🔐 Authentication

All API endpoints (except public health checks) require JWT authentication:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -X GET "http://localhost:3000/api/v1/tenants"
```

### Auth Flow
1. **Register:** `POST /api/v1/auth/register`
2. **Login:** `POST /api/v1/auth/login` → Returns JWT
3. **Use JWT** in `Authorization: Bearer {token}` header

---

## 🏢 Tenant Management API

### Base Route: `/api/v1/tenants`

#### List Tenants
```http
GET /api/v1/tenants
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "tenants": [
    {
      "id": "uuid",
      "name": "My Company",
      "slug": "my-company",
      "createdAt": "2025-01-11T10:00:00Z",
      "limits": {
        "maxUsers": 100,
        "maxProjects": 50
      }
    }
  ]
}
```

#### Create Tenant
```http
POST /api/v1/tenants
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "name": "My New Company",
  "slug": "my-new-company"
}
```

#### Get Tenant Details
```http
GET /api/v1/tenants/{tenantId}
Authorization: Bearer {jwt_token}
```

#### Update Tenant
```http
PUT /api/v1/tenants/{tenantId}
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "name": "Updated Company Name"
}
```

#### Delete Tenant (Soft Delete)
```http
DELETE /api/v1/tenants/{tenantId}
Authorization: Bearer {jwt_token}
```

---

## 🔐 Authentication API

### Base Route: `/api/v1/auth`

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "tenant": {
    "id": "uuid",
    "name": "John Doe's Workspace",
    "slug": "john-does-workspace"
  },
  "token": "jwt_token_here"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Verify Token
```http
POST /api/v1/auth/verify
Authorization: Bearer {jwt_token}
```

---

## 🤖 AI Orchestrator API

### Base Route: `/api/v1/ai`

#### AI Status
```http
GET /api/v1/ai/status
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "status": "healthy",
  "models": {
    "available": ["llama3.1", "codellama", "mistral"],
    "loaded": ["llama3.1"]
  },
  "services": {
    "ollama": "connected",
    "testGenerator": "healthy",
    "healingEngine": "healthy"
  }
}
```

#### Available Models
```http
GET /api/v1/ai/models
Authorization: Bearer {jwt_token}
```

#### Load Model
```http
POST /api/v1/ai/models/load
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "model": "llama3.1",
  "priority": "high"
}
```

---

## 🧪 Test Generator API

### Base Route: `/api/v1/tests`

#### Generate Test
```http
POST /api/v1/tests/generate
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "tenantId": "uuid",
  "requirements": "Create a login test that verifies user authentication",
  "framework": "playwright",
  "targetUrl": "https://app.example.com",
  "options": {
    "language": "typescript",
    "includeAssertions": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "uuid",
  "status": "queued",
  "estimatedTime": "30-60 seconds"
}
```

#### Check Generation Status
```http
GET /api/v1/tests/generate/{jobId}/status
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "jobId": "uuid",
  "status": "completed",
  "result": {
    "testCode": "import { test, expect } from '@playwright/test'...",
    "filename": "login-test.spec.ts",
    "framework": "playwright"
  }
}
```

#### Validate Test Code
```http
POST /api/v1/tests/validate
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "testCode": "import { test } from '@playwright/test'...",
  "framework": "playwright"
}
```

---

## 🔧 Healing Engine API

### Base Route: `/api/v1/healing`

#### Heal Selector
```http
POST /api/v1/healing/heal-selector
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "brokenSelector": "#old-button-id",
  "pageUrl": "https://app.example.com/login",
  "elementType": "button",
  "strategy": "ai-powered-analysis"
}
```

**Response:**
```json
{
  "success": true,
  "healingResult": {
    "healedSelector": "[data-testid='submit-btn']",
    "confidence": 0.95,
    "strategy": "ai-powered-analysis",
    "alternatives": [
      "button:has-text('Submit')",
      "[role='button'][aria-label='Submit']"
    ]
  }
}
```

#### Available Healing Strategies
```http
GET /api/v1/healing/strategies
Authorization: Bearer {jwt_token}
```

#### Batch Heal Multiple Selectors
```http
POST /api/v1/healing/batch-heal
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "selectors": [
    {
      "selector": "#old-button",
      "pageUrl": "https://app.example.com/page1"
    },
    {
      "selector": ".deprecated-class",
      "pageUrl": "https://app.example.com/page2"
    }
  ]
}
```

---

## 🏥 Health Checks

All services provide health endpoints:

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "auth-service",
  "timestamp": "2025-01-11T10:00:00Z",
  "dependencies": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Service Health URLs (Development)
- **API Gateway:** `http://localhost:3000/health`
- **Auth Service:** `http://localhost:3002/health` 
- **Tenant Manager:** `http://localhost:3001/health`
- **AI Orchestrator:** `http://localhost:3003/health`
- **Test Generator:** `http://localhost:3004/health`
- **Healing Engine:** `http://localhost:3005/health`

---

## ❌ Error Responses

All APIs use consistent error formatting:

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
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Missing or invalid JWT token
- `FORBIDDEN` - User lacks required permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## 🔄 Rate Limits

| Service | Limit | Window |
|---------|--------|--------|
| **Auth Service** | 1000 requests | 1 minute |
| **AI Orchestrator** | 1000 requests | 1 minute |
| **Test Generator** | 1000 requests | 1 minute |
| **Healing Engine** | 1000 requests | 1 minute |

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1641916800
```

---

## 📝 Testing the API

### Using cURL
```bash
# Register and get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}' \
  | jq -r '.token')

# Use token for authenticated requests
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:3000/api/v1/tenants
```

### Using Postman
1. Import the [Postman Collection](../testing/shifty-api.postman_collection.json)
2. Set environment variables for base URL and tokens
3. Run the authentication flow to get JWT tokens

### Using VS Code REST Client
Install the "REST Client" extension and use the [API test file](../testing/api-tests.http).

---

**Last Updated:** 2025-01-11  
**API Version:** 1.0  
**Maintained by:** Shifty Development Team