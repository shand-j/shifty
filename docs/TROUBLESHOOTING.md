# Shifty Platform Troubleshooting Guide

## Quick Health Check

Run this command to check all services:
```bash
./scripts/validate-mvp.sh
```

If this script doesn't exist or you need manual verification, see below.

---

## Common Issues and Solutions

### 1. Services Won't Start

**Symptom:** `docker-compose up` fails or services exit immediately

**Possible Causes:**
- Port conflicts (another service using the same port)
- Missing environment variables
- Database not initialized
- Missing Docker images

**Solutions:**

```bash
# Check for port conflicts
sudo lsof -i :3000  # API Gateway
sudo lsof -i :5432  # PostgreSQL
sudo lsof -i :6379  # Redis
sudo lsof -i :11434 # Ollama

# Rebuild all services
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Check logs for specific service
docker logs shifty-api-gateway
docker logs shifty-platform-db
```

---

### 2. Database Migration Failed

**Symptom:** Orchestrator service crashes with "relation 'test_runs' does not exist"

**Cause:** Migration 015_test_orchestration.sql was not executed

**Solution:**

```bash
# Option 1: Recreate database container (DESTROYS DATA)
docker-compose down platform-db
docker volume rm shifty_platform_db_data
docker-compose up -d platform-db

# Option 2: Execute migration manually
docker exec -i shifty-platform-db psql -U postgres -d shifty_platform < database/migrations/015_test_orchestration.sql

# Verify tables exist
docker exec -it shifty-platform-db psql -U postgres -d shifty_platform -c "\dt test_*"
```

**Expected Output:**
```
               List of relations
 Schema |       Name        | Type  |  Owner   
--------+-------------------+-------+----------
 public | test_artifacts    | table | postgres
 public | test_flakiness    | table | postgres
 public | test_history      | table | postgres
 public | test_results      | table | postgres
 public | test_runs         | table | postgres
 public | test_shards       | table | postgres
```

---

### 3. Test User Doesn't Exist

**Symptom:** Frontend tests fail with 401 Unauthorized, login fails with test@shifty.com

**Cause:** Seed data not loaded in database

**Solution:**

```bash
# Check if user exists
docker exec -it shifty-platform-db psql -U postgres -d shifty_platform \
  -c "SELECT email, role FROM users WHERE email = 'test@shifty.com';"

# If no results, add seed user
docker exec -it shifty-platform-db psql -U postgres -d shifty_platform <<EOF
INSERT INTO users (id, tenant_id, email, password, first_name, last_name, role)
VALUES (
  '06313bcd-0995-4e3a-8f15-df7eb47fe7ef',
  (SELECT id FROM tenants LIMIT 1),
  'test@shifty.com',
  '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7n5cWz.jSq',
  'Test',
  'User',
  'owner'
) ON CONFLICT (email) DO NOTHING;
EOF

# Verify
docker exec -it shifty-platform-db psql -U postgres -d shifty_platform \
  -c "SELECT email, role FROM users WHERE email = 'test@shifty.com';"
```

**Test Credentials:**
- Email: `test@shifty.com`
- Password: `password123`

---

### 4. Orchestration Services Not Running

**Symptom:** Health checks fail for ports 3022-3025

**Cause:** Services not started by start-mvp.sh

**Solution:**

```bash
# Start orchestration services manually
docker-compose up -d minio orchestrator-service results-service artifact-storage flakiness-tracker

# Wait for startup
sleep 15

# Check health
curl http://localhost:3022/health  # Orchestrator
curl http://localhost:3023/health  # Results
curl http://localhost:3024/health  # Artifact Storage
curl http://localhost:3025/health  # Flakiness Tracker

# Check MinIO
curl http://localhost:9000/minio/health/live
```

---

### 5. Frontend Tests Timeout

**Symptom:** Playwright tests hang at "Waiting for frontend..."

**Cause:** Frontend dev server not running or wrong port

**Solution:**

```bash
# Check if frontend is running
curl http://localhost:3006

# If not, start it
cd apps/frontend
npm run dev

# In another terminal, run tests
npm test
```

**Alternative:** Playwright should auto-start the server via `webServer` config, but it may fail if:
- Port 3006 is already in use
- `npm run dev` script is missing
- Node modules not installed

```bash
# Fix port conflict
sudo lsof -i :3006
kill -9 <PID>

# Reinstall dependencies
cd apps/frontend
rm -rf node_modules package-lock.json
npm install
```

---

### 6. Token Expired Errors

**Symptom:** API requests return 401 with "Token expired" or "Invalid token"

**Cause:** JWT tokens expire after 24 hours (default)

**Solution:**

```bash
# Get new token via login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@shifty.com","password":"password123"}'

# Use token in requests
export SHIFTY_TOKEN="<token from above>"

# Or use in tests
export SHIFTY_TOKEN="<token>"
cd apps/frontend
npm run test:shifty
```

---

### 7. Redis Connection Failed

**Symptom:** Services log "Redis connection failed" or "ECONNREFUSED 6379"

**Cause:** Redis not running or wrong host

**Solution:**

```bash
# Check Redis is running
docker ps | grep redis

# If not running, start it
docker-compose up -d redis

# Test connection
docker exec -it shifty-redis redis-cli ping
# Expected: PONG

# Check Redis logs
docker logs shifty-redis
```

---

### 8. Ollama Model Not Found

**Symptom:** AI test generation fails with "model not found: llama3.1"

**Cause:** Model not pulled yet (first time setup)

**Solution:**

```bash
# Pull model manually
docker-compose exec ollama ollama pull llama3.1

# This downloads ~4GB and may take several minutes

# Verify model exists
docker-compose exec ollama ollama list
```

---

### 9. Build Failures

**Symptom:** `npm run build` fails with TypeScript errors

**Cause:** Stale cache, missing dependencies, or type errors

**Solution:**

```bash
# Clean and rebuild
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build

# If still failing, check specific service
cd services/orchestrator-service
npm run build

# Or rebuild Docker images
docker-compose build --no-cache orchestrator-service
```

---

## Environment Variables Checklist

Required for production:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/shifty_platform
TENANT_DB_HOST=tenant-db-host
TENANT_DB_PASSWORD=strong-password

# Security
JWT_SECRET=<32+ character random string>

# Services (Docker Compose uses container names)
TENANT_MANAGER_URL=http://tenant-manager:3001
AUTH_SERVICE_URL=http://auth-service:3002
AI_ORCHESTRATOR_URL=http://ai-orchestrator:3003
TEST_GENERATOR_URL=http://test-generator:3004
HEALING_ENGINE_URL=http://healing-engine:3005
ORCHESTRATOR_SERVICE_URL=http://orchestrator-service:3022
RESULTS_SERVICE_URL=http://results-service:3023
ARTIFACT_STORAGE_URL=http://artifact-storage:3024
FLAKINESS_TRACKER_URL=http://flakiness-tracker:3025

# Optional
REDIS_URL=redis://redis:6379
OLLAMA_ENDPOINT=http://ollama:11434
LOG_LEVEL=info
NODE_ENV=production
```

---

## Health Check URLs

| Service | Port | Health Check URL |
|---------|------|------------------|
| API Gateway | 3000 | http://localhost:3000/health |
| Tenant Manager | 3001 | http://localhost:3001/health |
| Auth Service | 3002 | http://localhost:3002/health |
| AI Orchestrator | 3003 | http://localhost:3003/health |
| Test Generator | 3004 | http://localhost:3004/health |
| Healing Engine | 3005 | http://localhost:3005/health |
| Orchestrator | 3022 | http://localhost:3022/health |
| Results Service | 3023 | http://localhost:3023/health |
| Artifact Storage | 3024 | http://localhost:3024/health |
| Flakiness Tracker | 3025 | http://localhost:3025/health |
| PostgreSQL | 5432 | `pg_isready -U postgres` |
| Redis | 6379 | `redis-cli ping` |
| MinIO | 9000 | http://localhost:9000/minio/health/live |
| Ollama | 11434 | http://localhost:11434/api/version |

---

## Complete Reset Procedure

If all else fails, perform a complete reset:

```bash
# Stop all containers
docker-compose down -v

# Remove all volumes (DESTROYS ALL DATA)
docker volume rm shifty_platform_db_data shifty_redis_data shifty_ollama_models shifty_minio_data

# Clean npm
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/package-lock.json
rm -rf services/*/node_modules services/*/package-lock.json
rm -rf packages/*/node_modules packages/*/package-lock.json

# Reinstall
npm install

# Rebuild base image
docker build -f Dockerfile.base -t shifty-workspace:node20-20251205 .

# Start everything
./scripts/start-mvp.sh

# Wait for all services (2-3 minutes)
sleep 120

# Verify
./scripts/validate-mvp.sh
```

---

## Getting Help

1. **Check logs:** `docker logs <container-name>`
2. **Check service status:** `docker-compose ps`
3. **Check disk space:** `df -h`
4. **Check memory:** `free -h`
5. **Check Docker:** `docker info`

**For more help:**
- Review `docs/getting-started/README.md`
- Check `docs/architecture/api-reference.md`
- See `PRODUCTION_READINESS_PLAN.md` for detailed setup
