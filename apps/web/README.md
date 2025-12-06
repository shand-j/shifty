# Shifty Hub - Web Frontend

Modern React/TypeScript SPA for the Shifty quality engineering platform with persona-aware dashboards and comprehensive testing workflows.

## 🎯 Features

- **Persona-Aware Dashboards** - Tailored views for PO, Developer, QA, Designer, Manager, and GTM roles
- **Test Management** - Browse, generate, and manage automated tests
- **Selector Healing** - Review and approve AI-powered selector fixes
- **Manual Testing Hub** - Scripted and exploratory testing sessions
- **CI Pipeline Monitoring** - Real-time pipeline status and insights
- **ROI Analytics** - DORA metrics, SPACE framework, and cost analysis
- **HITL Arcade** - Gamified human-in-the-loop quality tasks

## 🏗️ Tech Stack

- **Framework:** React 18 with TypeScript 5
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS
- **State Management:** Zustand with persistence
- **Routing:** React Router v6
- **Icons:** Lucide React
- **API Client:** Native Fetch API with JWT auth

## 📦 Installation

```bash
# From the monorepo root
npm install

# Or in this directory
cd apps/web
npm install
```

## 🚀 Development

### Start Backend Services

First, ensure backend services are running:

```bash
# From monorepo root
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- API Gateway (port 3000)
- All microservices (ports 3001-3020)

### Start Dev Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## 🔐 Authentication

The app uses JWT authentication managed through Zustand:

1. **Login** at `/login` with email/password
2. **JWT token** stored in localStorage (key: `shifty-auth`)
3. **Auto-logout** after 7 days (token expiration)
4. **Protected routes** redirect to login if unauthenticated

### Test Credentials

In development mode, you can register a new user or use seeded credentials (check with backend team).

## 🎨 Theming

The app supports light and dark modes:

- Toggle via sidebar button
- Preference persisted in localStorage
- Respects system preference on first load

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── components/
│   │   └── layout/
│   │       └── Shell.tsx          # Main app shell with nav
│   ├── pages/
│   │   ├── LoginPage.tsx          # Authentication
│   │   ├── DashboardPage.tsx      # Persona dashboards
│   │   ├── TestsPage.tsx          # Test explorer
│   │   ├── TestDetailPage.tsx     # Individual test view
│   │   ├── TestGeneratePage.tsx   # AI test generation
│   │   ├── HealingPage.tsx        # Selector healing queue
│   │   ├── SessionsPage.tsx       # Manual testing hub
│   │   ├── SessionWorkspacePage.tsx # Session detail
│   │   ├── PipelinesPage.tsx      # CI pipeline list
│   │   ├── PipelineDetailPage.tsx # Pipeline detail
│   │   ├── InsightsPage.tsx       # Quality insights
│   │   ├── RoiPage.tsx            # ROI dashboard
│   │   ├── ArcadePage.tsx         # HITL tasks
│   │   └── SettingsPage.tsx       # User settings
│   ├── stores/
│   │   ├── auth.ts                # Auth state
│   │   └── theme.ts               # Theme state
│   ├── App.tsx                    # Root component & routing
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── public/                        # Static assets
├── index.html                     # HTML template
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind configuration
└── package.json
```

## 🌐 API Integration

All API requests are proxied through the API Gateway:

```typescript
// Frontend makes request to /api/v1/tests
fetch('/api/v1/tests', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// Vite proxies to http://localhost:3000/api/v1/tests
// API Gateway routes to test-generator service at http://localhost:3004
```

See [Frontend-Backend Integration Guide](../../docs/development/frontend-backend-integration.md) for details.

## 🧭 Routing

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | LoginPage | User authentication |
| `/` | Redirect | → `/dashboard` |
| `/dashboard` | DashboardPage | Persona dashboard |
| `/tests` | TestsPage | Test explorer |
| `/tests/:id` | TestDetailPage | Test details |
| `/tests/generate` | TestGeneratePage | Generate new test |
| `/healing` | HealingPage | Healing queue |
| `/healing/:id` | HealingPage | Healing detail |
| `/sessions` | SessionsPage | Session list |
| `/sessions/:id` | SessionWorkspacePage | Session workspace |
| `/pipelines` | PipelinesPage | Pipeline list |
| `/pipelines/:id` | PipelineDetailPage | Pipeline detail |
| `/insights` | InsightsPage | Quality insights |
| `/insights/roi` | RoiPage | ROI dashboard |
| `/arcade` | ArcadePage | HITL arcade |
| `/settings/*` | SettingsPage | Settings |

## 👤 Personas

The app adapts based on user persona:

- **po** (Product Owner) - Release readiness, constraints, feedback
- **dev** (Developer) - PR status, CI runs, test generation
- **qa** (QA Engineer) - Sessions, healing queue, quality scorecard
- **designer** - Design-to-test mapping, accessibility, UX metrics
- **manager** (Engineering Manager) - ROI, DORA/SPACE, team metrics
- **gtm** (Go-to-Market) - Releases, customer issues, feature flags

Navigation order and dashboard widgets adapt to the selected persona.

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests with Playwright
npm run test:e2e
```

## 📊 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |

## 🎯 Environment Variables

Configure via `.env` in monorepo root:

```bash
# API Gateway URL (development)
VITE_API_URL=http://localhost:3000

# Feature flags
VITE_FEATURE_AI_GENERATION=true
VITE_FEATURE_SELECTOR_HEALING=true
```

## 🐛 Troubleshooting

### API Requests Fail

1. Ensure backend services are running: `docker-compose ps`
2. Check API Gateway health: `curl http://localhost:3000/health`
3. Verify proxy config in `vite.config.ts`

### Authentication Issues

1. Clear localStorage: `localStorage.clear()`
2. Check JWT_SECRET matches between frontend and backend
3. Verify token hasn't expired

### Hot Reload Not Working

1. Restart Vite dev server
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Check file watcher limits on Linux

## 🔗 Related Documentation

- [API Reference](../../docs/architecture/api-reference.md)
- [Hub UI Requirements](../../docs/architecture/hub-ui-requirements.md)
- [Frontend-Backend Integration](../../docs/development/frontend-backend-integration.md)
- [Developer Guide](../../docs/development/developer-guide.md)

## 📝 Contributing

1. Create feature branch from `main`
2. Make changes following TypeScript/React best practices
3. Test locally with `npm run dev`
4. Run type checking: `npm run type-check`
5. Build to verify: `npm run build`
6. Submit PR with description

## 📜 License

Copyright © 2025 Shifty Development Team
