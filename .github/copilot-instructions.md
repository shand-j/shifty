# Shifty Platform - AI Agent Instructions

## Project Overview

Shifty is an **AI-powered multi-tenant testing platform** built with TypeScript in a Turbo monorepo. The architecture separates microservices, frontend apps, shared packages, and SDK modules for AI-driven test generation, selector healing, and comprehensive test execution.

### Core Architecture

```
┌─────────────────────────────────────────┐
│     API Gateway (3000) - Fastify       │  ← Single entry point, JWT auth, circuit breakers
└────────┬────────────────────────────────┘
         │ Routes to:
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
┌───▼───┐ ┌──▼──┐   ┌───▼────┐ ┌──▼──┐
│Auth   │ │Tenant│   │AI Orch │ │Test │  ← Microservices (Fastify)
│:3002  │ │:3001 │   │:3003   │ │Gen  │
└───────┘ └──────┘   └────────┘ │:3004│
                                 └─────┘
                     Healing Engine :3005
                     +15 other services
```

**Key Services:** auth-service, tenant-manager, ai-orchestrator, test-generator, healing-engine, qe-collaborator, roi-service, performance-testing, security-testing, accessibility-testing, manual-session-hub, hitl-arcade, cicd-governor, production-feedback, integrations, gpu-provisioner, model-registry, data-lifecycle

**Frontend Apps:**

- `apps/web` - React + Vite + Zustand (main user interface)
- `apps/frontend` - Next.js (alternative UI, uses shadcn/ui)

**Packages:**

- `@shifty/shared` - **CRITICAL**: Centralized config, security validation, error handling
- `@shifty/database` - PostgreSQL connection pooling, multi-tenant DB management
- `@shifty/ai-framework` - AI model orchestration primitives
- `@shifty/sdk-*` - Core SDK, Playwright fixtures, observability (OpenTelemetry)

## Technology Stack

| Layer          | Technology           | Notes                                                  |
| -------------- | -------------------- | ------------------------------------------------------ |
| **Runtime**    | Node.js 20.18+       | Strict requirement                                     |
| **Language**   | TypeScript 5.2+      | Strict mode enforced                                   |
| **Backend**    | Fastify              | Most services use Fastify; tenant-manager uses Express |
| **Database**   | PostgreSQL 15        | Multi-tenant isolation per tenant                      |
| **Cache**      | Redis 7              | Session storage, rate limiting                         |
| **AI**         | Ollama (llama3.1:8b) | Local LLM for test generation                          |
| **Testing**    | Jest + Playwright    | 70% coverage threshold                                 |
| **Build**      | Turbo                | Monorepo task orchestration                            |
| **Containers** | Docker Compose       | Local dev environment                                  |
| **Frontend**   | React 18 + Zustand   | Vite build, React Query for API                        |

## Critical Development Patterns

### 1. Configuration & Security (MANDATORY)

**Every service MUST:**

```typescript
import {
  validateProductionConfig,
  getJwtConfig,
  getDatabaseConfig,
} from "@shifty/shared";

// At service startup (before any routes)
try {
  validateProductionConfig(); // Throws in prod if JWT_SECRET/DATABASE_URL missing/insecure
} catch (error) {
  console.error("Configuration validation failed:", error);
  if (process.env.NODE_ENV === "production") process.exit(1);
}

// Use centralized config getters
const jwtConfig = getJwtConfig(); // Never hardcode JWT secrets
const dbConfig = getDatabaseConfig();
```

**Why:** `packages/shared/src/config/index.ts` validates:

- JWT secrets are 32+ chars and not dev defaults in production
- Database URLs don't contain localhost/default creds in production
- All services fail fast on misconfiguration

### 2. Service Structure Pattern

```typescript
// services/[service-name]/src/index.ts
import Fastify from "fastify";
import { validateProductionConfig, RequestLimits } from "@shifty/shared";

validateProductionConfig();

const fastify = Fastify({
  logger: { level: process.env.LOG_LEVEL || "info" },
  bodyLimit: RequestLimits.bodyLimit, // 1MB
  requestTimeout: RequestLimits.requestTimeout, // 30s
});

// Register plugins: @fastify/cors, @fastify/rate-limit, @fastify/helmet
// Define routes with Zod validation schemas
// Error handling via centralized utilities

const PORT = process.env.PORT || 3002;
fastify.listen({ port: PORT, host: "0.0.0.0" });
```

### 3. API Gateway Circuit Breaker

`apps/api-gateway/src/index.ts` implements a **custom circuit breaker** for downstream services:

- **Closed** → Normal proxying
- **Open** (after 5 failures) → Fast-fail for 30s, return 503
- **Half-Open** → Test recovery after timeout

When adding routes to API Gateway, ensure they're registered in the `serviceRoutes` array with proper `prefix` and `target` URLs.

### 4. Database Management

```typescript
import { DatabaseManager } from "@shifty/database";

const dbManager = new DatabaseManager();
await dbManager.initialize(); // Uses getDatabaseConfig() internally

// Platform DB (shared)
const result = await dbManager.query("SELECT * FROM tenants WHERE id = $1", [
  tenantId,
]);

// Tenant-specific DB
const tenantPool = await dbManager.getTenantPool(tenantId, databaseUrl);
```

**Multi-Tenancy:** Each tenant gets an isolated PostgreSQL database. Use `getTenantDatabaseUrl()` from `@shifty/shared` to construct tenant DB connection strings.

### 5. Testing with APIClient

```typescript
// tests/api/*.test.ts or tests/integration/*.test.ts
import { APIClient } from "../utils/api-client";

const client = new APIClient("http://localhost:3000");

// Register/login
const registerRes = await client.register({
  email: "test@example.com",
  password: "SecurePass123!",
  firstName: "Test",
  lastName: "User",
});

// Authenticated requests
client.setAuthToken(registerRes.data.token);
const tenantsRes = await client.getTenants();
```

**Integration tests require Docker services running.** Always start with `./scripts/start-mvp.sh` before running tests.

### 6. Frontend State Management (Zustand)

```typescript
// apps/web/src/stores/auth.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    { name: "shifty-auth" }
  )
);
```

**Pattern:** Zustand stores are in `apps/web/src/stores/`. Use React Query (`@tanstack/react-query`) for server state.

### 7. SDK Usage (Playwright Auto-Healing)

```typescript
// External test projects using Shifty SDK
import { shiftyTest, ShiftyPage } from "@shifty/sdk-playwright";

shiftyTest("login flow", async ({ shiftyPage }) => {
  await shiftyPage.locator("#username").fill("user@example.com"); // Auto-heals if selector breaks
  await shiftyPage.locator('button[type="submit"]').click();
});
```

**Healing strategies:** data-testid-recovery, text-content-matching, css-hierarchy-analysis, ai-powered-analysis

## Development Workflow

### Quick Start

```bash
# Initial setup (one time)
npm install
npm run build  # Builds all workspace packages via Turbo

# Start all services (Docker + dev servers)
./scripts/start-mvp.sh  # Builds shifty-workspace:node20-20251205 base image

# Validate system health
./scripts/validate-mvp.sh

# Run tests (requires services running)
npm test                  # All tests
npm run test:api          # API tests only
npm run test:integration  # Integration tests
npm run test:coverage     # With coverage report
```

### VS Code Tasks

Press `Ctrl+Shift+P` → "Tasks: Run Task":

- **🚀 Start MVP Stack** - Launches Docker Compose services
- **✅ Validate MVP** - Runs health checks
- **🧪 Run All Tests** - Jest test suite
- **🔍 Search Tech Debt** - Finds TODO/FIXME/HACK comments
- **📊 System Status Check** - Service health dashboard

### Docker Build Pattern

**Shared base image:** `Dockerfile.base` creates `shifty-workspace:node20-20251205` with all dependencies pre-installed (`npm ci`). This is **reused by all services** to avoid repeated npm installs.

**Service Dockerfile:** `services/Dockerfile.service` uses build args:

```dockerfile
ARG SERVICE_PATH=services/auth-service
ARG PACKAGE_NAME="@shifty/auth-service"
FROM shifty-workspace:node20-20251205 AS builder
# Turbo builds only the service + dependencies
RUN npx turbo run build --filter="...${PACKAGE_NAME}"
```

**Important:** If you modify `package.json` in any workspace, rebuild the base image: `docker build -f Dockerfile.base -t shifty-workspace:node20-20251205 .`

### Environment Variables

**Development defaults** (see `.env.example`):

- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shifty_platform`
- `JWT_SECRET=dev-secret-key-change-in-production-use-at-least-32-chars`
- `REDIS_URL=redis://localhost:6379`
- `OLLAMA_ENDPOINT=http://localhost:11434`

**Production requirements:**

- `JWT_SECRET` (32+ chars, cryptographically random)
- `DATABASE_URL` (no localhost, no default creds)
- `TENANT_DB_HOST`, `TENANT_DB_PASSWORD`

## Adding a New Service

1. **Create service directory:**

   ```bash
   mkdir -p services/my-service/src
   cd services/my-service
   ```

2. **Add `package.json`:**

   ```json
   {
     "name": "@shifty/my-service",
     "version": "1.0.0",
     "main": "dist/index.js",
     "scripts": {
       "build": "tsc",
       "dev": "tsx watch src/index.ts"
     },
     "dependencies": {
       "@shifty/shared": "*",
       "fastify": "^4.0.0"
     }
   }
   ```

3. **Create `src/index.ts`** following the Fastify pattern above with `validateProductionConfig()`.

4. **Add to root `package.json` workspaces array:**

   ```json
   "workspaces": [
     "services/my-service"
   ]
   ```

5. **Add to `docker-compose.yml`:**

   ```yaml
   my-service:
     build:
       context: .
       dockerfile: services/Dockerfile.service
       args:
         SERVICE_PATH: services/my-service
         PACKAGE_NAME: "@shifty/my-service"
     ports:
       - "3021:3021"
     environment:
       - PORT=3021
   ```

6. **Register in API Gateway** (`apps/api-gateway/src/index.ts`):
   ```typescript
   const serviceRoutes: ServiceRoute[] = [
     {
       prefix: "/api/v1/my-service",
       target: "http://my-service:3021",
       requiresAuth: true,
     },
   ];
   ```

## Known Technical Debt

See `docs/project-management/tech-debt-backlog.md` for full list. Key issues:

- **CRITICAL:** Mock healing results in production code (`services/healing-engine/src/index.ts:196-222`)
- **HIGH:** Hardcoded service URLs (localhost) in multiple files → use env vars
- **HIGH:** Mock analytics data in API Gateway endpoints
- **MEDIUM:** No OpenAPI/Swagger documentation (planned)

**When fixing:** Grep for `TODO`, `FIXME`, `mock`, `localhost` to find instances.

## Testing Strategy

- **Unit tests:** None yet (focus on integration/API tests)
- **API tests:** `tests/api/*.test.ts` - Test service endpoints via API Gateway
- **Integration tests:** `tests/integration/*.test.ts` - Multi-service workflows
- **Coverage:** 70% minimum (branches, functions, lines, statements)

**Mocking:** Avoid mocks in production paths. Use environment detection (`process.env.NODE_ENV`) to conditionally enable test stubs.

## Key Files Reference

| File                                  | Purpose                                                   |
| ------------------------------------- | --------------------------------------------------------- |
| `packages/shared/src/config/index.ts` | **Security validation, config getters**                   |
| `apps/api-gateway/src/index.ts`       | Circuit breaker, routing, JWT middleware                  |
| `tests/utils/api-client.ts`           | Reusable HTTP client for tests                            |
| `docker-compose.yml`                  | Service orchestration (postgres, redis, ollama, services) |
| `turbo.json`                          | Build pipeline configuration                              |
| `.env.example`                        | All environment variables with descriptions               |
| `docs/architecture/api-reference.md`  | API endpoint documentation                                |

## Common Gotchas

1. **Port conflicts:** Services use ports 3000-3020. Check `docker-compose ps` if a service won't start.
2. **Database not ready:** `start-mvp.sh` waits 10s for PostgreSQL. If migrations fail, increase the sleep time.
3. **Ollama models:** First run downloads `llama3.1:8b` (~4GB). Requires 8GB+ RAM.
4. **Jest worker errors:** `APIClient` cleans circular references in Axios responses to prevent serialization issues.
5. **Turbo cache:** If builds are stale, run `npm run clean` then `npm run build`.

## Documentation

- **Getting Started:** `docs/getting-started/README.md`
- **Developer Guide:** `docs/development/developer-guide.md`
- **API Reference:** `docs/architecture/api-reference.md`
- **Playbooks:** `docs/playbooks/` (role-specific guides for PO, QA, Dev, Designer, Manager)
- **Runbooks:** `runbooks/` (CI failure triage, security hotfixes, telemetry outages)
