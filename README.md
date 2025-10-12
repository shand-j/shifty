# 🚀 Shifty - AI-Powered Testing Platform

**Intelligent, multi-tenant testing platform that revolutionizes how teams create, manage, and maintain automated tests.**

[![Build Status](https://github.com/shifty-platform/shifty/workflows/CI/badge.svg)](https://github.com/shifty-platform/shifty/actions)
[![Test Coverage](https://codecov.io/gh/shifty-platform/shifty/branch/main/graph/badge.svg)](https://codecov.io/gh/shifty-platform/shifty)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ⚡ Quick Start

```bash
# Clone and setup
git clone <repo-url> && cd shifty
npm install

# Start the platform (all services)
./scripts/start-mvp.sh

# Verify everything works
./scripts/validate-mvp.sh

# Access the platform
open http://localhost:3000
```

## 🎯 What is Shifty?

Shifty is an AI-augmented testing platform that automatically:
- **Generates intelligent test cases** from user requirements
- **Heals broken selectors** when UI changes occur  
- **Optimizes test performance** and reduces flakiness
- **Provides actionable insights** through advanced analytics
- **Scales across multiple tenants** with isolated environments

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  🌐 API Gateway (3000)                      │
│              Single entry point for all requests            │
└─────────────────┬───────────────────────────────────────────┘
                  │
     ┌────────────┼────────────┐
     │            │            │
┌────▼───┐   ┌───▼───┐    ┌───▼────┐
│🔐 Auth │   │🏢 Tenant│    │🤖 AI   │
│ (3002) │   │ (3001) │    │ (3003) │
└────────┘   └────────┘    └───┬────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
               ┌────▼───┐ ┌───▼────┐ ┌───▼────┐
               │🧪 Test │ │🔧 Heal │ │📊 Proj │
               │ (3004) │ │ (3005) │ │ (3006) │
               └────────┘ └────────┘ └────────┘
```

## 📚 **[Complete Documentation →](./docs/README.md)**

| **Getting Started** | **Development** | **Architecture** |
|---------------------|-----------------|------------------|
| [Quick Setup](./docs/getting-started/README.md) | [Developer Guide](./docs/development/developer-guide.md) | [System Design](./docs/architecture/system-overview.md) |
| [Installation](./docs/getting-started/installation.md) | [API Testing](./docs/testing/api-test-implementation.md) | [API Reference](./docs/architecture/api-reference.md) |
| [First Steps](./docs/getting-started/first-steps.md) | [Deployment](./docs/development/deployment.md) | [Database Schema](./docs/architecture/database-schema.md) |

| **Project Management** | **Testing** | **Operations** |
|------------------------|-------------|----------------|
| [Tech Debt Backlog](./docs/project-management/tech-debt-backlog.md) | [Test Strategy](./docs/testing/test-strategy.md) | [Monitoring](./docs/development/monitoring.md) |
| [Project Status](./docs/project-management/project-status.md) | [Test Progress](./docs/project-management/test-progress-report.md) | [Troubleshooting](./docs/development/troubleshooting.md) |
| [Progress Tracking](./docs/project-management/progress-tracking.md) | [Performance Testing](./docs/testing/performance-testing.md) | [Security](./docs/development/security.md) |

---

## 🚀 Core Features

### 🤖 **AI-Powered Test Generation**
```typescript
// Natural language → Working test code
const testRequest = {
  requirement: "Test user login with invalid credentials",
  framework: "playwright",
  target: "https://app.example.com"
};

// AI generates complete, executable test
const generatedTest = await aiTestGenerator.create(testRequest);
```

### 🔧 **Intelligent Selector Healing** 
```typescript
// Automatically fixes broken selectors
const healedSelector = await healingEngine.heal({
  brokenSelector: "#old-submit-btn", 
  pageUrl: "https://app.example.com/login",
  strategy: "ai-powered-analysis"
});
// Returns: "[data-testid='submit-button']"
```

### 📊 **Advanced Analytics & Insights**
- Real-time test stability monitoring
- Performance bottleneck identification  
- Flakiness reduction recommendations
- Cross-browser compatibility insights

### 🏢 **Multi-Tenant Architecture**
- Complete tenant isolation (data, tests, config)
- Per-tenant resource limits and monitoring
- Scalable microservices design

---

## 🛠️ Technology Stack

| **Layer** | **Technology** | **Purpose** |
|-----------|----------------|-------------|
| **Frontend** | React + TypeScript | User interface |
| **Backend** | Node.js + TypeScript | Microservices |
| **Database** | PostgreSQL + Redis | Data & caching |
| **AI/ML** | Ollama (local LLM) | Test generation & healing |
| **Testing** | Playwright + Jest | E2E & unit testing |
| **Deployment** | Docker + Kubernetes | Containerization & orchestration |

---

## 🎯 Development Commands

| **Command** | **Purpose** | **Usage** |
|-------------|-------------|-----------|
| `npm run dev` | Start development servers | All services in watch mode |
| `npm test` | Run test suites | Unit + integration tests |
| `npm run build` | Build for production | Compile TypeScript |
| `./scripts/start-mvp.sh` | Launch MVP stack | Quick platform startup |
| `./scripts/validate-mvp.sh` | Verify deployment | Health checks + validation |

### 🔍 **VS Code Integration** (Ctrl+Shift+P → "Run Task")
- **🚀 Start MVP Stack** - Launch all services
- **🔍 Search Tech Debt** - Find TODO/FIXME items  
- **🧪 Run All Tests** - Execute test suites
- **📊 System Status Check** - Health monitoring

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)  
5. **Open** a Pull Request

See our [Contributing Guide](./docs/development/contributing.md) for detailed guidelines.

---

## 📊 Project Status

| **Component** | **Status** | **Coverage** | **Last Updated** |
|---------------|------------|--------------|------------------|
| **API Gateway** | ✅ Stable | 85% | 2025-01-11 |
| **Auth Service** | ✅ Stable | 92% | 2025-01-11 |  
| **Tenant Manager** | ✅ Stable | 78% | 2025-01-11 |
| **AI Orchestrator** | 🔄 Active Development | 65% | 2025-01-11 |
| **Test Generator** | 🔄 Active Development | 58% | 2025-01-11 |
| **Healing Engine** | ⚠️ Early Stage | 43% | 2025-01-11 |

**Tech Debt Items:** [34 tracked issues](./docs/project-management/tech-debt-backlog.md) | **Test Coverage:** 71.2% | **Last Release:** v0.8.0

---

## 📞 Support & Community

- **📖 Documentation:** [Complete Docs](./docs/README.md)
- **🐛 Bug Reports:** [GitHub Issues](https://github.com/shifty-platform/shifty/issues)
- **💬 Discussions:** [GitHub Discussions](https://github.com/shifty-platform/shifty/discussions)
- **📧 Email:** support@shifty.dev
- **💼 Enterprise:** enterprise@shifty.dev

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with ❤️ by the Shifty Team</strong><br>
  <em>Making testing intelligent, one AI-powered test at a time</em>
</div>