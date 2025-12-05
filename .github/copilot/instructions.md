# Shifty Platform - GitHub Copilot Agent Instructions

## Project Overview

Shifty is an AI-powered multi-tenant testing platform built with TypeScript/Node.js. It uses a microservices architecture with the following core components:

- **API Gateway** (Port 3000) - Central routing, JWT auth, rate limiting
- **Auth Service** (Port 3002) - User authentication and JWT management  
- **Tenant Manager** (Port 3001) - Multi-tenant provisioning
- **AI Orchestrator** (Port 3003) - AI model coordination
- **Test Generator** (Port 3004) - AI-powered test generation
- **Healing Engine** (Port 3005) - Intelligent selector healing
- **Test Runner** (Port 3006) - Test execution

## Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript (strict mode)
- **Framework**: Fastify (API Gateway), Express (Tenant Manager)
- **Database**: PostgreSQL 15 with multi-tenant isolation
- **Cache**: Redis 7
- **AI**: Ollama (local LLM - llama3.1)
- **Testing**: Jest + Playwright
- **Build**: Turbo (monorepo)
- **Containers**: Docker Compose

## Project Structure

```
shifty/
├── apps/api-gateway/           # Central API gateway
├── packages/
│   ├── shared/                 # Common types, utils, config
│   ├── ai-framework/           # AI testing framework
│   └── database/               # Database manager
├── services/
│   ├── auth-service/           # Authentication
│   ├── tenant-manager/         # Multi-tenancy
│   ├── ai-orchestrator/        # AI coordination
│   ├── test-generator/         # Test generation
│   ├── healing-engine/         # Selector healing
│   └── ...                     # Other services
└── tests/
    ├── api/                    # API tests
    └── integration/            # Integration tests
```

## Development Commands

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Start development servers
npm run dev

# Lint code
npm run lint

# Type check
npm run type-check
```

## Code Style Guidelines

1. **TypeScript Strict Mode**: All code must pass strict type checking
2. **Zod Validation**: Use Zod for all request/response validation
3. **Error Handling**: Use centralized error utilities from @shifty/shared
4. **Configuration**: Use centralized config from @shifty/shared/config
5. **Logging**: Use Fastify/Express built-in loggers with appropriate levels
6. **Comments**: Document complex business logic and security-sensitive code

## Security Guidelines

1. **Never hardcode secrets** - Use environment variables and validateProductionConfig()
2. **Validate all inputs** - Use Zod schemas for request validation
3. **Use centralized JWT config** - Import getJwtConfig() from @shifty/shared
4. **Database credentials** - Use getDatabaseConfig() from @shifty/shared
5. **Production checks** - All services should call validateProductionConfig() on startup

## Testing Guidelines

1. Tests are in the `/tests` directory
2. API tests use the shared `APIClient` from `tests/utils/api-client.ts`
3. Tests require running Docker services for integration testing
4. Coverage threshold is 70% for all metrics

## Important Files

- `packages/shared/src/config/index.ts` - Centralized configuration
- `docker-compose.yml` - Service orchestration
- `.env.example` - Environment variable template
- `docs/project-management/system-assessment.md` - System analysis

## MCP Server Configuration

This project uses the following MCP servers for enhanced development:

### Playwright MCP
For browser automation and testing:
- Navigate to pages and capture screenshots
- Interact with web elements
- Run E2E tests against the platform

### Git MCP
For version control operations:
- Commit changes with proper messages
- View diffs and history
- Manage branches

### Filesystem MCP
For file operations:
- Read and write files
- Search code patterns
- Navigate project structure

## Common Tasks

### Adding a New Service

1. Create service directory under `services/`
2. Add package.json with @shifty/shared dependency
3. Import validateProductionConfig() and call on startup
4. Use getJwtConfig() for authentication
5. Add Dockerfile and update docker-compose.yml
6. Add workspace reference to root package.json

### Fixing Security Issues

1. Never use hardcoded credentials
2. Import config from @shifty/shared/config
3. Call validateProductionConfig() at service startup
4. Use getTenantDatabaseUrl() for tenant databases
5. Run npm audit and fix vulnerabilities

### Running Tests

```bash
# All tests
npm test

# API tests only
npm run test:api

# Integration tests
npm run test:integration

# With coverage
npm run test:coverage
```

## Environment Variables

Required for production:
- `JWT_SECRET` - Strong random secret (32+ chars)
- `DATABASE_URL` - PostgreSQL connection string
- `TENANT_DB_HOST` - Tenant database host
- `TENANT_DB_PASSWORD` - Tenant database password

Optional:
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (info/debug/error)
- `REDIS_URL` - Redis connection string

## Getting Help

- Documentation: `/docs/README.md`
- System Assessment: `/docs/project-management/system-assessment.md`
- Tech Debt: `/docs/project-management/tech-debt-backlog.md`
