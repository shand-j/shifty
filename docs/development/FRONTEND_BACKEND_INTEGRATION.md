# Frontend-Backend Integration

This document describes the complete frontend-backend integration with enterprise-scale mock data.

## Overview

The Shifty frontend (Next.js) is now fully integrated with the backend services through:

1. **API Client Layer** - Axios-based HTTP client with JWT auth, token refresh, and interceptors
2. **Mock Data System** - Comprehensive enterprise-scale mock data for demos and testing
3. **Mock Interceptor** - API Gateway middleware that intercepts requests in mock mode
4. **Environment Configuration** - Proper env var setup for all deployment modes
5. **Docker Integration** - Full containerization with docker-compose

## Architecture

```
┌─────────────────────────────────────────────┐
│   Frontend (Next.js) - Port 3010           │
│   - API Client (axios)                     │
│   - Zustand State Management               │
│   - WebSocket Client                       │
└──────────────┬──────────────────────────────┘
               │ HTTP/WS
               ▼
┌─────────────────────────────────────────────┐
│   API Gateway - Port 3000                  │
│   - Mock Interceptor (if MOCK_MODE=true)  │
│   - Circuit Breaker                        │
│   - JWT Validation                         │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
   Mock Store      Real Services
   (in-memory)     (microservices)
```

## Environment Variables

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_MOCK_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_ENV=development
```

### API Gateway

```bash
MOCK_MODE=true  # Enables mock interceptor
PORT=3000
NODE_ENV=development
```

## Mock Data

The system includes comprehensive enterprise-scale mock data:

- **200 Users** - Various personas (Developer, QA, Product, Manager)
- **50 Teams** - Cross-functional teams with metrics
- **100 Projects** - Active, maintenance, and archived projects
- **5000 Tests** - With status, tags, and execution history
- **500 Healing Suggestions** - Pending, approved, and rejected
- **30 Pipelines** - Recent CI/CD runs with results
- **1000 Knowledge Entries** - Best practices and troubleshooting
- **50 Arcade Missions** - Gamification challenges
- **12 Months ROI Metrics** - Time/cost savings trends
- **90 Days DORA Metrics** - DevOps performance indicators

### Demo Personas

Use these emails to log in (any password works in mock mode):

- `dev@shifty.ai` - Developer persona
- `qa@shifty.ai` - QA Engineer persona (most features)
- `po@shifty.ai` - Product Owner persona
- `manager@shifty.ai` - Manager persona (dashboards/insights)

## API Client Usage

### Basic Example

```typescript
import { getAPIClient } from "@/lib/api-client"

const apiClient = getAPIClient()

// Login
const response = await apiClient.login({
  email: "dev@shifty.ai",
  password: "any"
})

// Authenticated requests (token is auto-added)
const projects = await apiClient.getProjects()
const tests = await apiClient.getTests({ projectId: "project-1" })
```

### In Components

```typescript
"use client"

import { useEffect, useState } from "react"
import { getAPIClient } from "@/lib/api-client"

export function ProjectList() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const apiClient = getAPIClient()
        const response = await apiClient.getProjects()
        if (response.success) {
          setProjects(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) return <div>Loading...</div>
  
  return <div>{/* Render projects */}</div>
}
```

## State Management (Zustand)

The global app store handles user state, tenant info, and notifications:

```typescript
import { useAppStore } from "@/lib/store"

export function MyComponent() {
  const { user, tenant, fetchNotifications, logout } = useAppStore()

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <p>Organization: {tenant?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

## WebSocket Integration

For real-time updates:

```typescript
import { getWebSocketClient } from "@/lib/websocket-client"

const wsClient = getWebSocketClient()

// Connect to session
wsClient.connect(sessionId)

// Listen for events
wsClient.on("test.completed", (message) => {
  console.log("Test completed:", message.data)
  // Update UI
})

// Send events
wsClient.send({
  type: "session.started",
  data: { sessionId: "123" }
})

// Clean up
wsClient.disconnect()
```

## Protected Routes

Wrap authenticated pages with ProtectedRoute:

```typescript
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected dashboard content</div>
    </ProtectedRoute>
  )
}
```

## Docker Deployment

### Start Everything

```bash
# Start all services with mock mode
docker-compose up

# Or in detached mode
docker-compose up -d
```

### Access Points

- **Frontend:** http://localhost:3010
- **API Gateway:** http://localhost:3000
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### Environment Modes

**Mock Mode (Default):**
- Frontend uses `NEXT_PUBLIC_MOCK_MODE=true`
- API Gateway uses `MOCK_MODE=true`
- All API calls return mock data without hitting real services
- Perfect for demos, frontend development, and testing

**Live Mode:**
- Set `MOCK_MODE=false` in API Gateway
- Set `NEXT_PUBLIC_MOCK_MODE=false` in frontend
- Requests hit real microservices
- Requires all backend services to be running

## Testing the Integration

1. **Start the stack:**
   ```bash
   docker-compose up
   ```

2. **Open frontend:**
   ```bash
   open http://localhost:3010/login
   ```

3. **Login with demo persona:**
   - Email: `qa@shifty.ai`
   - Password: (any)

4. **Explore features:**
   - Dashboard shows metrics from mock data
   - Projects, tests, healing suggestions all populated
   - Notifications in bell icon
   - Real-time WebSocket events (mocked)

## API Endpoints

All endpoints are prefixed with `/api/v1`:

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh access token

### Users
- `GET /users/me` - Get current user
- `PATCH /users/:id` - Update user

### Projects
- `GET /projects` - List projects (paginated)
- `GET /projects/:id` - Get project details
- `POST /projects` - Create project

### Tests
- `GET /tests` - List tests (paginated, filterable)
- `GET /tests/:id` - Get test details
- `POST /ai/generate-tests` - Generate tests with AI

### Healing
- `GET /healing/suggestions` - List healing suggestions
- `POST /healing/:id/approve` - Approve healing
- `POST /healing/:id/reject` - Reject healing

### Pipelines
- `GET /pipelines` - List pipeline runs
- `GET /pipelines/:id` - Get pipeline details

### Insights
- `GET /insights/dashboard` - Dashboard metrics
- `GET /insights/roi` - ROI metrics over time
- `GET /insights/dora` - DORA metrics

### Knowledge
- `GET /knowledge` - List knowledge entries
- `GET /knowledge/:id` - Get knowledge entry

### Arcade
- `GET /arcade/missions` - List missions
- `GET /arcade/leaderboard` - Get leaderboard

## Troubleshooting

### API Calls Fail with 401

The token might be expired or invalid:
```typescript
const apiClient = getAPIClient()
apiClient.clearAuth()
// Navigate to login
```

### CORS Errors

Ensure API Gateway CORS configuration includes your frontend origin:
```typescript
// apps/api-gateway/src/index.ts
origin: ['http://localhost:3010', 'http://localhost:3000']
```

### Mock Data Not Loading

1. Check `MOCK_MODE=true` in API Gateway environment
2. Check mock interceptor is registered in gateway
3. Look for `[MockInterceptor]` logs in gateway console

### Docker Build Fails

Rebuild the base image if you've updated package.json:
```bash
docker build -f Dockerfile.base -t shifty-workspace:node20-20251205 .
docker-compose build --no-cache
```

## Performance Considerations

- Mock data generation happens once at startup
- In-memory store holds ~5000 tests, 500 healings, etc.
- Pagination is implemented for large datasets
- WebSocket events are throttled in mock mode (every 5s)

## Next Steps

1. **Add React Query** - For better server state management
2. **Implement Optimistic Updates** - For better UX on mutations
3. **Add Error Boundaries** - Graceful error handling
4. **Implement Retry Logic** - Auto-retry failed requests
5. **Add Request Deduplication** - Prevent duplicate API calls
6. **Implement Offline Mode** - Cache responses for offline use
7. **Add GraphQL Layer** - For more efficient data fetching
8. **Implement Server-Sent Events** - Alternative to WebSockets

## Related Files

- `apps/frontend/lib/api-client.ts` - API client implementation
- `apps/frontend/lib/store.ts` - Zustand state management
- `apps/frontend/lib/websocket-client.ts` - WebSocket client
- `apps/api-gateway/src/middleware/mock-interceptor.ts` - Mock middleware
- `packages/shared/src/mocks/` - Mock data factories and store
- `services/integrations/src/mocks/` - Third-party integration mocks
