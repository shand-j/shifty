# Environment Variables Reference

This document describes all environment variables used by the Shifty platform.

## Table of Contents
- [Database Configuration](#database-configuration)
- [Authentication & Security](#authentication--security)
- [Service URLs](#service-urls)
- [Infrastructure Services](#infrastructure-services)
- [Application Settings](#application-settings)
- [Development Settings](#development-settings)

---

## Database Configuration

### `DATABASE_URL`
**Required:** Yes (Production)  
**Default:** `postgresql://postgres:postgres@localhost:5432/shifty_platform` (Development)  
**Description:** Primary PostgreSQL connection string for platform database.  
**Format:** `postgresql://[user]:[password]@[host]:[port]/[database]`

```bash
# Development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shifty_platform

# Production
DATABASE_URL=postgresql://prod_user:secure_password@db.example.com:5432/shifty_platform
```

### `TENANT_DB_HOST`
**Required:** Yes (Production)  
**Default:** `localhost`  
**Description:** Hostname for tenant-specific databases.  
**Usage:** Used to construct tenant database URLs.

### `TENANT_DB_PASSWORD`
**Required:** Yes (Production)  
**Default:** None  
**Description:** Password for tenant database connections.  
**Security:** Must be strong and unique in production.

---

## Authentication & Security

### `JWT_SECRET`
**Required:** Yes  
**Default:** `dev-secret-key-change-in-production` (Development only)  
**Description:** Secret key for signing JWT tokens.  
**Security:** 
- Must be at least 32 characters in production
- Must be cryptographically random
- Never commit to version control

```bash
# Generate secure secret (Linux/macOS)
openssl rand -base64 32

# Example (do not use this value!)
JWT_SECRET=YourSecure32CharacterOrLongerRandomStringHere123456789
```

### `JWT_EXPIRES_IN`
**Required:** No  
**Default:** `24h`  
**Description:** JWT token expiration time.  
**Format:** Zeit/ms format (e.g., `2h`, `7d`, `60s`)

---

## Service URLs

All service URLs support both localhost (development) and Docker service names (containerized).

### `API_GATEWAY_URL`
**Required:** No  
**Default:** `http://localhost:3000`  
**Description:** API Gateway endpoint for external clients.

### `TENANT_MANAGER_URL`
**Required:** No  
**Default:** `http://localhost:3001` (dev) / `http://tenant-manager:3001` (Docker)  
**Description:** Internal URL for tenant management service.

### `AUTH_SERVICE_URL`
**Required:** No  
**Default:** `http://localhost:3002` (dev) / `http://auth-service:3002` (Docker)  
**Description:** Internal URL for authentication service.

### `AI_ORCHESTRATOR_URL`
**Required:** No  
**Default:** `http://localhost:3003` (dev) / `http://ai-orchestrator:3003` (Docker)  
**Description:** Internal URL for AI orchestration service.

### `TEST_GENERATOR_URL`
**Required:** No  
**Default:** `http://localhost:3004` (dev) / `http://test-generator:3004` (Docker)  
**Description:** Internal URL for test generation service.

### `HEALING_ENGINE_URL`
**Required:** No  
**Default:** `http://localhost:3005` (dev) / `http://healing-engine:3005` (Docker)  
**Description:** Internal URL for selector healing service.

### `ORCHESTRATOR_SERVICE_URL`
**Required:** No  
**Default:** `http://localhost:3022` (dev) / `http://orchestrator-service:3022` (Docker)  
**Description:** Internal URL for test orchestration service.

### `RESULTS_SERVICE_URL`
**Required:** No  
**Default:** `http://localhost:3023` (dev) / `http://results-service:3023` (Docker)  
**Description:** Internal URL for test results service.

### `ARTIFACT_STORAGE_URL`
**Required:** No  
**Default:** `http://localhost:3024` (dev) / `http://artifact-storage:3024` (Docker)  
**Description:** Internal URL for artifact storage service.

### `FLAKINESS_TRACKER_URL`
**Required:** No  
**Default:** `http://localhost:3025` (dev) / `http://flakiness-tracker:3025` (Docker)  
**Description:** Internal URL for flakiness tracking service.

---

## Infrastructure Services

### `REDIS_URL`
**Required:** No  
**Default:** `redis://localhost:6379` (dev) / `redis://redis:6379` (Docker)  
**Description:** Redis connection URL for caching and queues.  
**Format:** `redis://[host]:[port]`

### `OLLAMA_ENDPOINT`
**Required:** No  
**Default:** `http://localhost:11434` (dev) / `http://ollama:11434` (Docker)  
**Description:** Ollama AI service endpoint for LLM inference.

### `MINIO_ENDPOINT`
**Required:** No  
**Default:** `localhost` (dev) / `minio` (Docker)  
**Description:** MinIO object storage endpoint (hostname only).

### `MINIO_PORT`
**Required:** No  
**Default:** `9000`  
**Description:** MinIO API port.

### `MINIO_ACCESS_KEY`
**Required:** No  
**Default:** `minioadmin`  
**Description:** MinIO access key for authentication.  
**Security:** Change in production.

### `MINIO_SECRET_KEY`
**Required:** No  
**Default:** `minioadmin`  
**Description:** MinIO secret key for authentication.  
**Security:** Change in production.

---

## Application Settings

### `NODE_ENV`
**Required:** No  
**Default:** `development`  
**Options:** `development`, `production`, `test`  
**Description:** Node.js environment mode.  
**Effects:**
- `development`: Verbose logging, mock data allowed
- `production`: Strict validation, production optimizations
- `test`: Test-specific behavior, mock services enabled

### `PORT`
**Required:** No  
**Default:** Service-specific (see below)  
**Description:** HTTP port for the service to listen on.

**Default Ports by Service:**
- API Gateway: `3000`
- Tenant Manager: `3001`
- Auth Service: `3002`
- AI Orchestrator: `3003`
- Test Generator: `3004`
- Healing Engine: `3005`
- Orchestrator: `3022`
- Results Service: `3023`
- Artifact Storage: `3024`
- Flakiness Tracker: `3025`

### `LOG_LEVEL`
**Required:** No  
**Default:** `info`  
**Options:** `trace`, `debug`, `info`, `warn`, `error`, `fatal`  
**Description:** Logging verbosity level.

---

## Development Settings

### `MOCK_MODE`
**Required:** No  
**Default:** `false`  
**Options:** `true`, `false`  
**Description:** Enable mock data responses for development/testing.  
**Usage:** Used by API Gateway mock interceptor.

### `FRONTEND_URL`
**Required:** No  
**Default:** `http://localhost:3006`  
**Description:** Frontend application URL for CORS and testing.

### `NEXT_PUBLIC_API_URL`
**Required:** No (Frontend)  
**Default:** `http://localhost:3000`  
**Description:** API Gateway URL accessible from browser.  
**Note:** `NEXT_PUBLIC_` prefix exposes variable to browser.

### `NEXT_PUBLIC_MOCK_MODE`
**Required:** No (Frontend)  
**Default:** `true` (Development)  
**Description:** Enable frontend mock mode for development.

---

## Testing Configuration

### `SHIFTY_API_URL`
**Required:** Yes (for tests)  
**Default:** `http://localhost:3000`  
**Description:** API Gateway URL for test orchestration.

### `SHIFTY_TENANT_ID`
**Required:** Yes (for tests)  
**Default:** None  
**Description:** Tenant ID for test execution.  
**Example:** `4110ccd1-ec6b-47f1-b194-0975639f673f`

### `SHIFTY_TOKEN`
**Required:** No (for tests)  
**Default:** None  
**Description:** JWT token for authenticated test execution.  
**Usage:** Tests will auto-login if not provided.

---

## Docker Compose Variables

### `COMPOSE_PROFILES`
**Required:** No  
**Default:** None  
**Options:** `gpu`  
**Description:** Enable GPU profile for Ollama service.  
**Requirements:** NVIDIA GPU + NVIDIA Container Toolkit

```bash
# Enable GPU acceleration (Linux only)
COMPOSE_PROFILES=gpu docker-compose up -d
```

### `DOCKER_BUILDKIT`
**Required:** No  
**Default:** `1`  
**Description:** Enable BuildKit for faster Docker builds.

---

## Complete Example

### Development `.env`
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shifty_platform
TENANT_DB_HOST=localhost
TENANT_DB_PASSWORD=postgres

# Security (development only!)
JWT_SECRET=dev-secret-key-change-in-production-use-at-least-32-chars
JWT_EXPIRES_IN=24h

# Services (localhost for development)
API_GATEWAY_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
OLLAMA_ENDPOINT=http://localhost:11434

# Application
NODE_ENV=development
LOG_LEVEL=debug
MOCK_MODE=true

# Frontend
FRONTEND_URL=http://localhost:3006
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_MOCK_MODE=true
```

### Production `.env` (Docker Compose)
```bash
# Database
DATABASE_URL=postgresql://shifty_user:${DB_PASSWORD}@platform-db:5432/shifty_platform
TENANT_DB_HOST=tenant-db
TENANT_DB_PASSWORD=${TENANT_DB_PASSWORD}

# Security (NEVER use these values!)
JWT_SECRET=${JWT_SECRET}  # From secrets manager
JWT_EXPIRES_IN=2h

# Services (Docker service names)
TENANT_MANAGER_URL=http://tenant-manager:3001
AUTH_SERVICE_URL=http://auth-service:3002
AI_ORCHESTRATOR_URL=http://ai-orchestrator:3003
TEST_GENERATOR_URL=http://test-generator:3004
HEALING_ENGINE_URL=http://healing-engine:3005
ORCHESTRATOR_SERVICE_URL=http://orchestrator-service:3022
RESULTS_SERVICE_URL=http://results-service:3023
ARTIFACT_STORAGE_URL=http://artifact-storage:3024
FLAKINESS_TRACKER_URL=http://flakiness-tracker:3025

# Infrastructure
REDIS_URL=redis://redis:6379
OLLAMA_ENDPOINT=http://ollama:11434
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
MINIO_SECRET_KEY=${MINIO_SECRET_KEY}

# Application
NODE_ENV=production
LOG_LEVEL=info
MOCK_MODE=false

# Frontend
NEXT_PUBLIC_API_URL=https://api.shifty.example.com
NEXT_PUBLIC_MOCK_MODE=false
```

---

## Security Best Practices

1. **Never commit secrets to version control**
   - Use `.env.example` for templates
   - Add `.env` to `.gitignore`

2. **Use secrets managers in production**
   ```bash
   # AWS Secrets Manager
   JWT_SECRET=$(aws secretsmanager get-secret-value --secret-id shifty/jwt-secret --query SecretString --output text)
   
   # Kubernetes Secrets
   JWT_SECRET=$(kubectl get secret shifty-secrets -o jsonpath='{.data.jwt-secret}' | base64 -d)
   ```

3. **Rotate secrets regularly**
   - JWT secrets: Every 90 days
   - Database passwords: Every 90 days
   - API keys: Every 30 days

4. **Validate configuration on startup**
   - All services use `validateProductionConfig()` from `@shifty/shared`
   - Fails fast if critical variables are missing or insecure

---

## Troubleshooting

### "Configuration validation failed"
**Cause:** Missing or invalid environment variables in production.  
**Solution:** Check logs for specific variable, ensure all required vars are set.

### "Invalid JWT secret"
**Cause:** JWT_SECRET is too short or using dev default in production.  
**Solution:** Set JWT_SECRET to 32+ character random string.

### "Database connection failed"
**Cause:** DATABASE_URL is incorrect or database is not accessible.  
**Solution:** Verify connection string, check database is running.

### Service can't connect to other services
**Cause:** Wrong service URL (localhost vs Docker service name).  
**Solution:** 
- Development: Use `localhost` URLs
- Docker Compose: Use service names (e.g., `http://auth-service:3002`)
- Kubernetes: Use FQDN (e.g., `http://auth-service.shifty.svc.cluster.local:3002`)

---

For more help, see [Troubleshooting Guide](./TROUBLESHOOTING.md).
