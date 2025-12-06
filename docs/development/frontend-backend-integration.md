# Frontend-Backend Integration Guide

This guide explains how the Shifty Hub frontend (`apps/web`) integrates with the backend services through the API Gateway.

## Architecture Overview

```
┌─────────────────┐
│   Web UI        │  React SPA (Port 5173 in dev)
│  (apps/web)     │  Built with Vite + React + TypeScript
└────────┬────────┘
         │ HTTP/WebSocket
         ▼
┌─────────────────┐
│  API Gateway    │  Fastify (Port 3000)
│ (api-gateway)   │  Routes, Auth, Rate Limiting
└────────┬────────┘
         │
    ┌────┴────┬─────────┬─────────┬─────────┬─────────┐
    ▼         ▼         ▼         ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Tenant │ │  Auth  │ │   AI   │ │  Test  │ │Healing │ │  ROI   │
│Manager │ │Service │ │Orchestr│ │  Gen   │ │Engine  │ │Service │
│ :3001  │ │ :3002  │ │ :3003  │ │ :3004  │ │ :3005  │ │ :3015  │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘

... and more services (Performance, Security, Accessibility, Manual Session Hub, etc.)
```

## Service Endpoints

The API Gateway routes requests from the frontend to the appropriate backend services:

| Frontend Route | API Endpoint | Backend Service | Port | Auth Required |
|----------------|--------------|-----------------|------|---------------|
| `/login` | `/api/v1/auth/login` | auth-service | 3002 | No |
| `/dashboard` | `/api/v1/tenants` | tenant-manager | 3001 | Yes |
| `/tests` | `/api/v1/tests` | test-generator | 3004 | Yes |
| `/healing` | `/api/v1/healing` | healing-engine | 3005 | Yes |
| `/sessions` | `/api/v1/sessions/manual` | manual-session-hub | 3019 | Yes |
| `/pipelines` | `/api/v1/ci` | cicd-governor | 3012 | Yes |
| `/insights/roi` | `/api/v1/roi` | roi-service | 3015 | Yes |
| `/arcade` | `/api/v1/hitl` | hitl-arcade | 3011 | Yes |
| Performance Tests | `/api/v1/performance` | performance-testing | 3016 | Yes |
| Security Tests | `/api/v1/security` | security-testing | 3017 | Yes |
| Accessibility Tests | `/api/v1/accessibility` | accessibility-testing | 3018 | Yes |

## Development Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and configure service URLs:

```bash
cp .env.example .env
```

Key variables:
```bash
# Service URLs (for API Gateway)
AUTH_SERVICE_URL=http://localhost:3002
TENANT_MANAGER_URL=http://localhost:3001
AI_ORCHESTRATOR_URL=http://localhost:3003
TEST_GENERATOR_URL=http://localhost:3004
HEALING_ENGINE_URL=http://localhost:3005
ROI_SERVICE_URL=http://localhost:3015
PERFORMANCE_TESTING_URL=http://localhost:3016
SECURITY_TESTING_URL=http://localhost:3017
ACCESSIBILITY_TESTING_URL=http://localhost:3018
MANUAL_SESSION_HUB_URL=http://localhost:3019
HITL_ARCADE_URL=http://localhost:3011
CICD_GOVERNOR_URL=http://localhost:3012

# Security
JWT_SECRET=dev-secret-key-change-in-production-use-at-least-32-chars

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 2. Start Backend Services

#### Option A: Using Docker Compose (Recommended)

Start all services with one command:

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Ollama AI service (port 11434)
- All microservices (ports 3001-3020)
- API Gateway (port 3000)

#### Option B: Manual Start (for development)

Start services individually:

```bash
# Start infrastructure
docker-compose up -d platform-db redis ollama

# Start core services
npm run dev --workspace=@shifty/auth-service
npm run dev --workspace=@shifty/tenant-manager
npm run dev --workspace=@shifty/api-gateway

# Start additional services as needed
npm run dev --workspace=@shifty/test-generator
npm run dev --workspace=@shifty/healing-engine
npm run dev --workspace=@shifty/roi-service
# ... etc
```

### 3. Start Frontend

In a new terminal:

```bash
cd apps/web
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Proxy Configuration

The Vite dev server is configured to proxy API requests to the API Gateway:

```typescript
// apps/web/vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // API Gateway
        changeOrigin: true,
      },
    },
  },
});
```

This means:
- Frontend request: `fetch('/api/v1/auth/login')`
- Proxied to: `http://localhost:3000/api/v1/auth/login`
- API Gateway routes to: `http://localhost:3002/api/v1/auth/login` (auth-service)

## Authentication Flow

1. **User Login** (`LoginPage.tsx`)
   ```typescript
   const res = await fetch('/api/v1/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password }),
   });
   ```

2. **API Gateway** receives request, forwards to auth-service

3. **Auth Service** validates credentials, returns JWT token

4. **Frontend** stores token in Zustand store (persisted in localStorage)
   ```typescript
   setAuth(data.token, {
     id: data.user.id,
     email: data.user.email,
     name: data.user.name,
     tenantId: data.user.tenantId,
     role: data.user.role,
     persona: data.user.persona,
   });
   ```

5. **Subsequent Requests** include JWT in Authorization header
   ```typescript
   const token = useAuthStore.getState().token;
   fetch('/api/v1/tenants', {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json',
     },
   });
   ```

6. **API Gateway** validates JWT, adds tenant headers, forwards to service

## State Management

The frontend uses Zustand for state management:

### Auth Store (`stores/auth.ts`)

```typescript
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}
```

Persisted to localStorage as `shifty-auth`.

### Theme Store (`stores/theme.ts`)

```typescript
interface ThemeState {
  dark: boolean;
  toggle: () => void;
}
```

## Adding New API Endpoints

### 1. Create Service Endpoint

In the service (e.g., `services/roi-service/src/index.ts`):

```typescript
fastify.get('/api/v1/roi/insights', async (request, reply) => {
  // Implementation
});
```

### 2. Register Route in API Gateway

In `apps/api-gateway/src/index.ts`:

```typescript
private services: ServiceRoute[] = [
  // ... existing routes
  {
    prefix: '/api/v1/roi',
    target: process.env.ROI_SERVICE_URL || 'http://localhost:3015',
    requiresAuth: true
  }
];
```

### 3. Add Environment Variable

In `.env.example` and docker-compose.yml:

```bash
ROI_SERVICE_URL=http://localhost:3015
```

### 4. Call from Frontend

Create a hook or component:

```typescript
const fetchROIData = async () => {
  const token = useAuthStore.getState().token;
  const res = await fetch('/api/v1/roi/insights', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.json();
};
```

## Testing Integration

### Manual Testing

1. Start all services
2. Open browser to `http://localhost:5173`
3. Check browser DevTools Network tab
4. Login and verify JWT token in requests
5. Navigate to different pages and verify API calls

### Health Checks

Check all services are running:

```bash
# API Gateway health
curl http://localhost:3000/health

# Service health aggregation
curl http://localhost:3000/api/v1/services/health
```

### API Testing

Use the test suite:

```bash
# Run API integration tests
npm run test:api

# Test specific service
npm test -- tests/api/auth-service
```

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. Check `ALLOWED_ORIGINS` in `.env` includes `http://localhost:5173`
2. Restart API Gateway
3. Clear browser cache

### 401 Unauthorized

If authenticated requests fail:

1. Check JWT token in localStorage: `localStorage.getItem('shifty-auth')`
2. Verify token hasn't expired (default 7 days)
3. Check JWT_SECRET matches between services
4. Try logging out and back in

### Service Unavailable (503)

If requests fail with 503:

1. Check service is running: `docker-compose ps`
2. Check service logs: `docker-compose logs [service-name]`
3. Verify port configuration in docker-compose.yml
4. Check API Gateway service URLs match running services

### Proxy Issues

If API requests aren't being proxied:

1. Verify Vite dev server is running on port 5173
2. Check `vite.config.ts` proxy configuration
3. Try accessing API Gateway directly: `http://localhost:3000/health`
4. Restart Vite dev server

## Production Deployment

### Build Frontend

```bash
cd apps/web
npm run build
```

Output in `dist/` folder.

### Environment Configuration

Update environment variables for production:

```bash
# Production URLs
API_GATEWAY_URL=https://api.shifty.dev
ALLOWED_ORIGINS=https://app.shifty.dev

# Strong JWT secret (min 32 chars)
JWT_SECRET=<strong-random-secret>

# Production database
DATABASE_URL=postgresql://user:pass@prod-db:5432/shifty
```

### Serve Frontend

Serve static files with nginx, Caddy, or similar:

```nginx
server {
  listen 80;
  server_name app.shifty.dev;
  
  root /var/www/shifty/dist;
  index index.html;
  
  # SPA routing
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  # Proxy API requests
  location /api {
    proxy_pass http://api-gateway:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## API Reference

For complete API documentation, see:
- [API Reference](../architecture/api-reference.md)
- [Hub UI Requirements](../architecture/hub-ui-requirements.md)

## Contributing

When adding new features:

1. ✅ Update API Gateway routes
2. ✅ Add service to docker-compose.yml
3. ✅ Update environment variables
4. ✅ Add frontend components/pages
5. ✅ Update this documentation
6. ✅ Add API tests
7. ✅ Update API reference docs

---

**Last Updated:** 2025-12-06  
**Maintained by:** Shifty Development Team
