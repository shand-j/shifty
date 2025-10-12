# 📊 SonarQube Test Coverage Configuration

Complete guide for configuring SonarQube to analyze test coverage for the Shifty AI Testing Platform.

## 🎯 Overview

SonarQube is now configured to:

- ✅ **Analyze JavaScript/TypeScript coverage** using LCOV reports
- ✅ **Track code quality metrics** across all microservices
- ✅ **Monitor tech debt** with quality gates
- ✅ **Integrate with CI/CD** via GitHub Actions
- ✅ **Provide VS Code tasks** for local analysis

---

## 🚀 Quick Setup

### 1. **Run the Setup Script**

```bash
./scripts/setup-sonarqube.sh
```

### 2. **Generate Coverage Report**

```bash
# Generate coverage with LCOV format for SonarQube
npm run test:coverage:sonar

# Open coverage report
open coverage/lcov-report/index.html
```

### 3. **Run SonarQube Analysis**

```bash
# Local analysis (requires SonarQube server setup)
npm run sonar:local

# Just run quality checks
npm run quality:check
```

---

## ⚙️ Configuration Files

### **Jest Configuration** (`package.json`)

```json
{
  "jest": {
    "coverageDirectory": "coverage",
    "coverageReporters": [
      "text",
      "text-summary",
      "html",
      "lcov", // ← Required for SonarQube
      "clover",
      "json"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    },
    "collectCoverageFrom": [
      "services/**/*.{ts,js}",
      "apps/**/*.{ts,js}",
      "packages/**/*.{ts,js}",
      "!**/*.d.ts",
      "!**/node_modules/**",
      "!**/dist/**",
      "!**/*.test.ts", // ← Exclude test files
      "!**/*.spec.ts", // ← Exclude spec files
      "!**/tests/**" // ← Exclude test directories
    ]
  }
}
```

### **SonarQube Properties** (`sonar-project.properties`)

```properties
# Project Configuration
sonar.projectKey=shand-j_shifty
sonar.organization=shand-j
sonar.projectName=Shifty AI Testing Platform

# Coverage Configuration
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# Source and Test Directories
sonar.sources=apps,services,packages
sonar.tests=tests

# Exclusions
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/*.d.ts
sonar.coverage.exclusions=**/*.test.ts,**/*.spec.ts,**/tests/**
```

---

## 🔗 SonarCloud Integration

### **1. Setup SonarCloud Account**

```bash
# 1. Visit https://sonarcloud.io
# 2. Login with GitHub account: shand-j
# 3. Import repository: shand-j/shifty
# 4. Get project token from Project Settings
```

### **2. Environment Variables**

```bash
# Add to your .env or export in shell
export SONAR_HOST_URL=https://sonarcloud.io
export SONAR_TOKEN=your_sonarcloud_token_here

# For GitHub Actions, add as repository secrets:
# SONAR_TOKEN, SONAR_HOST_URL
```

### **3. Local Analysis**

```bash
# With environment variables set
npm run sonar:local

# Or specify inline
SONAR_TOKEN=your_token npm run sonar:local
```

---

## 🤖 CI/CD Integration

### **GitHub Actions Workflow** (`.github/workflows/sonarqube.yml`)

The workflow automatically:

1. **Runs tests** with coverage on every push/PR
2. **Generates LCOV reports** for SonarQube analysis
3. **Uploads results** to SonarCloud
4. **Enforces quality gates** to prevent regressions

```yaml
name: SonarQube Analysis
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
      - run: npm ci && npm run install:all
      - run: npm run test:coverage:sonar
      - uses: sonarqube-quality-gate-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

## 🛠️ VS Code Integration

### **Available Tasks** (`Ctrl+Shift+P` → "Run Task")

| **Task**                        | **Purpose**                 | **Command**             |
| ------------------------------- | --------------------------- | ----------------------- |
| **📊 Run SonarQube Analysis**   | Full local analysis         | `npm run sonar:local`   |
| **📈 Generate Coverage Report** | Create HTML coverage report | `npm run test:coverage` |
| **🔍 Quality Check (All)**      | Tests + lint + type-check   | `npm run quality:check` |

### **New npm Scripts**

```json
{
  "scripts": {
    "test:coverage:sonar": "jest --coverage --coverageReporters=lcov --coverageReporters=text",
    "sonar:local": "npm run test:coverage:sonar && sonar-scanner",
    "quality:check": "npm run test:coverage && npm run lint && npm run type-check",
    "clean:coverage": "rm -rf coverage"
  }
}
```

---

## 📈 Coverage Metrics & Quality Gates

### **Current Thresholds**

| **Metric**             | **Threshold** | **Current**         |
| ---------------------- | ------------- | ------------------- |
| **Line Coverage**      | 70%           | TBD after first run |
| **Branch Coverage**    | 70%           | TBD after first run |
| **Function Coverage**  | 70%           | TBD after first run |
| **Statement Coverage** | 70%           | TBD after first run |

### **SonarQube Quality Gates**

- ✅ **Coverage on New Code** > 80%
- ✅ **Maintainability Rating** A or B
- ✅ **Reliability Rating** A
- ✅ **Security Rating** A
- ✅ **Duplicated Lines** < 3%

---

## 🔍 Analyzing Coverage Results

### **1. HTML Report (Detailed)**

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### **2. Terminal Summary**

```bash
npm run test:coverage:sonar
# Shows coverage percentages in terminal
```

### **3. SonarCloud Dashboard**

- Visit your project: https://sonarcloud.io/project/overview?id=shand-j_shifty
- View coverage trends, hotspots, and technical debt
- Download detailed reports

---

## 🎯 Coverage by Service

### **Expected Coverage Areas**

```
services/
├── auth-service/         # Target: 85% (critical security)
├── tenant-manager/       # Target: 80% (data integrity)
├── ai-orchestrator/      # Target: 70% (complex logic)
├── test-generator/       # Target: 75% (core feature)
├── healing-engine/       # Target: 70% (AI complexity)
└── project-manager/      # Target: 80% (business logic)

apps/
└── api-gateway/          # Target: 85% (entry point)

packages/
├── shared/               # Target: 90% (utilities)
├── ai-framework/         # Target: 70% (experimental)
└── database/            # Target: 85% (data layer)
```

### **Exclusions (Not Counted in Coverage)**

- Test files (`*.test.ts`, `*.spec.ts`)
- Type definitions (`*.d.ts`)
- Build artifacts (`dist/`, `build/`)
- Configuration files (`jest.config.js`, etc.)

---

## 🚨 Troubleshooting

### **Issue: No Coverage Data**

```bash
# Check if LCOV report exists
ls -la coverage/lcov.info

# If missing, run:
npm run clean:coverage
npm run test:coverage:sonar
```

### **Issue: SonarQube Scanner Not Found**

```bash
# Install globally
npm install -g sonarqube-scanner

# Or via Homebrew (macOS)
brew install sonar-scanner
```

### **Issue: Low Coverage on New Code**

```bash
# Run coverage on specific directory
npx jest --coverage services/auth-service

# Identify uncovered lines
npm run test:coverage && open coverage/lcov-report/index.html
```

### **Issue: Quality Gate Failure**

1. **Check SonarCloud project dashboard**
2. **Review failed conditions** (coverage, bugs, vulnerabilities)
3. **Fix issues** and re-run analysis
4. **Update thresholds** if needed in `sonar-project.properties`

---

## 📚 Additional Resources

- **[SonarQube TypeScript Documentation](https://docs.sonarsource.com/sonarqube-cloud/enriching/test-coverage/javascript-typescript-test-coverage)**
- **[Jest Coverage Configuration](https://jestjs.io/docs/configuration#collectcoverage-boolean)**
- **[LCOV Format Specification](https://github.com/linux-test-project/lcov)**
- **[SonarCloud Quality Gates](https://docs.sonarsource.com/sonarcloud/improving/quality-gates/)**

---

## 🎊 Success Checklist

After setup, verify:

- [ ] **LCOV report generated** at `coverage/lcov.info`
- [ ] **HTML coverage report** viewable at `coverage/lcov-report/index.html`
- [ ] **SonarQube analysis runs** locally without errors
- [ ] **GitHub Actions workflow** passes on push/PR
- [ ] **Quality gates configured** in SonarCloud project
- [ ] **VS Code tasks working** for coverage generation
- [ ] **Coverage thresholds met** (70%+ for all metrics)

---

**Configuration completed!** Your Shifty platform now has comprehensive test coverage analysis integrated with SonarQube. 🚀

**Next Steps:**

1. Run `./scripts/setup-sonarqube.sh` to verify everything works
2. Set up your SonarCloud project and tokens
3. Push to trigger the first automated analysis

**Last Updated:** 2025-01-12
**Maintained by:** Shifty DevOps Team
