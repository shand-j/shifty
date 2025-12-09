# Quick Start: Frontend-Backend Integration

This guide helps you quickly test the newly integrated frontend-backend system with mock data.

## Prerequisites

- Node.js 20.18+
- Docker & Docker Compose
- 8GB+ RAM (for Ollama LLM)

## Quick Start (5 minutes)

### Option 1: Docker (Recommended for Testing)

```bash
# 1. Clone and navigate
cd /path/to/shifty

# 2. Install dependencies
npm install

# 3. Build packages
npm run build

# 4. Start everything with Docker
docker-compose up

# 5. Open browser
open http://localhost:3010/login
```

**Login with:**

- Email: `qa@shifty.ai`
- Password: any (mock mode)

### Option 2: Local Development

```bash
# 1. Install and build
npm install
npm run build

# 2. Start infrastructure only
docker-compose up postgres redis

# 3. Start API Gateway (in new terminal)
cd apps/api-gateway
MOCK_MODE=true npm run dev

# 4. Start Frontend (in new terminal)
cd apps/frontend
npm run dev

# 5. Open browser
open http://localhost:3000/login
```

## What You'll See

After logging in, you'll have access to:

### Dashboard

- **Total Tests:** 5,000 mock tests
- **Pass Rate:** Realistic test execution stats
- **Pending Healings:** 500+ selector healing suggestions
- **Active Projects:** 100 projects across different frameworks

### Projects Page

- Browse 100 mock projects
- Different frameworks (Playwright, Cypress, Selenium, Jest)
- Test counts and pass rates
- Recent execution history

### Tests Page

- 5,000 mock tests paginated
- Filter by project, status, tags
- View test details and history
- See healing suggestions

### Healing Page

- 500+ healing suggestions
- Confidence scores (60-99%)
- Different healing strategies
- Approve/reject with one click

### Pipelines

- 30 recent CI/CD runs
- Success/failure status
- Tests run and pass rates
- Healings applied per run

### Insights/ROI

- 12 months of ROI metrics
- Time saved trends
- Cost savings calculations
- Tests automated over time

### Knowledge Base

- 1,000+ entries
- Categories: best practices, troubleshooting, etc.
- Searchable and filterable
- View counts and ratings

### Arcade

- 50 missions across difficulty levels
- Leaderboard with 200 users
- Points and rankings
- Challenge descriptions

## Demo Personas

Each persona shows different views and metrics:

| Email               | Persona       | Focus                    |
| ------------------- | ------------- | ------------------------ |
| `dev@shifty.ai`     | Developer     | Tests, healings, PRs     |
| `qa@shifty.ai`      | QA Engineer   | All testing features     |
| `po@shifty.ai`      | Product Owner | ROI, insights, metrics   |
| `manager@shifty.ai` | Manager       | Dashboards, team metrics |

## Features to Test

### 1. Authentication

- [x] Login with demo personas
- [x] JWT token storage
- [x] Auto-redirect to dashboard
- [x] Logout clears session

### 2. API Integration

- [x] All API calls go through API client
- [x] Token auto-added to requests
- [x] Mock mode intercepts requests
- [x] Realistic response delays (50-300ms)

### 3. Mock Data Quality

- [x] 200 users with realistic profiles
- [x] 5,000 tests with varied status
- [x] 500 healing suggestions with DOM snapshots
- [x] Projects across frameworks
- [x] Realistic metrics and trends

### 4. State Management

- [x] User state persists across refresh
- [x] Notifications load from API
- [x] Tenant information displayed
- [x] Logout clears all state

### 5. Real-Time Updates (Mock)

- [x] WebSocket client connects
- [x] Simulated test completion events
- [x] Healing detection notifications
- [x] Pipeline status updates

## Verify Mock Mode

### Check API Gateway Logs

```bash
docker-compose logs api-gateway | grep Mock
```

Should see:

```
shifty-api-gateway    | 🎭 Mock mode enabled - intercepting API calls
shifty-api-gateway    | [MockDataStore] Seeding enterprise mock data...
shifty-api-gateway    | [MockDataStore] Seeded: { users: 200, teams: 50, projects: 100, ... }
shifty-api-gateway    | [MockInterceptor] POST /api/v1/auth/login
```

### Check Frontend Network Tab

1. Open DevTools → Network
2. Login
3. Navigate to Projects
4. Look for:
   - `POST /api/v1/auth/login` - 200 OK
   - `GET /api/v1/projects` - 200 OK with mock data
   - Response times: 50-300ms

### Check Mock Data Response

```bash
curl -H "X-Mock-Mode: true" http://localhost:3000/api/v1/tenants

# Should return:
# {
#   "success": true,
#   "data": [{
#     "id": "tenant-1",
#     "name": "Acme Corp",
#     "slug": "acme",
#     "plan": "enterprise"
#   }]
# }
```

## Switch to Live Mode

To use real backend services instead of mocks:

1. **Update docker-compose.yml:**

```yaml
api-gateway:
  environment:
    - MOCK_MODE=false # Change from true

frontend:
  environment:
    - NEXT_PUBLIC_MOCK_MODE=false # Change from true
```

2. **Ensure all services are running:**

```bash
docker-compose ps
# Should show all 20+ services as "Up"
```

3. **Restart:**

```bash
docker-compose restart api-gateway frontend
```

## Troubleshooting

### "Cannot find module '@shifty/shared'"

```bash
cd packages/shared
npm run build
```

### Port 3000 already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in docker-compose.yml
```

### Frontend build fails

```bash
cd apps/frontend
rm -rf .next node_modules
npm install
npm run build
```

### Mock data not loading

1. Check API Gateway logs for `[MockInterceptor]`
2. Verify `MOCK_MODE=true` environment variable
3. Rebuild shared package: `cd packages/shared && npm run build`

### CORS errors

- Ensure API Gateway CORS includes `http://localhost:3010`
- Check browser console for specific error
- Verify API_URL env var in frontend

## Performance Notes

- **Initial Seed:** ~500ms to generate all mock data
- **API Response:** 50-300ms simulated network delay
- **Memory Usage:** ~50MB for mock store
- **Docker Startup:** 2-3 minutes first time (downloads images)
- **Page Load:** <2s with mock data
- **Navigation:** Instant (data in memory)

## Next Steps

1. **Explore the UI** - Navigate through all pages
2. **Try Different Personas** - Login as dev, qa, po, manager
3. **Test API Calls** - Use DevTools Network tab
4. **Check Mock Data** - Inspect response payloads
5. **Read Integration Docs** - See `docs/development/FRONTEND_BACKEND_INTEGRATION.md`
6. **Build Features** - Start wiring real dashboard components

## Resources

- **Integration Docs:** `docs/development/FRONTEND_BACKEND_INTEGRATION.md`
- **Implementation Summary:** `INTEGRATION_IMPLEMENTATION_SUMMARY.md`
- **API Reference:** `docs/architecture/api-reference.md`
- **Developer Guide:** `docs/development/developer-guide.md`

## Support

If you encounter issues:

1. Check logs: `docker-compose logs -f api-gateway frontend`
2. Verify build: `npm run build`
3. Clear caches: `npm run clean && npm install`
4. Review docs in `docs/development/`

Enjoy the integrated Shifty platform! 🚀
