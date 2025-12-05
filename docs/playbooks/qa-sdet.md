# QA/SDET QE Playbook

## Overview

As a QA Engineer or SDET, your mission is team-owned best-in-class quality. This playbook guides you through using Shifty's manual testing hub, Playwright orchestration, and defect insights.

## Key Tools

### Manual Testing Hub
- Session recording
- Exploratory testing charters
- Step-by-step documentation
- Jira integration

### Automation Framework
- @shifty/sdk-playwright
- Test generation
- Selector healing
- Visual regression

### Analytics
- Test coverage metrics
- Bug detection rates
- Automation ROI

## Manual Testing Workflow

### Starting a Test Session

```http
POST /api/v1/sessions/manual
{
  "tenantId": "{tenant}",
  "userId": "{qa_id}",
  "persona": "qa",
  "sessionType": "scripted",
  "riskLevel": "high",
  "title": "Feature X Regression Testing",
  "component": "checkout",
  "testStepsTotal": 25
}
```

### Exploratory Testing with Charters

Use James Bach's exploratory testing approach:

```http
POST /api/v1/sessions/manual/{sessionId}/charter
{
  "explore": "the checkout payment flow",
  "with": "various payment methods and edge cases",
  "toDiscover": "potential payment failures and UX issues",
  "timeBox": 45
}
```

### Recording Test Steps

```http
POST /api/v1/sessions/manual/{sessionId}/steps
{
  "sequence": 1,
  "action": "Click 'Add to Cart' button",
  "expectedResult": "Product added, cart count increases",
  "actualResult": "Product added, cart count updated correctly",
  "status": "passed",
  "confidence": 1,
  "attachments": ["screenshot-url"]
}
```

### Bug Reporting

When a bug is found:

```http
POST /api/v1/sessions/manual/{sessionId}/export/jira
{
  "stepId": "{failing_step_id}",
  "summary": "Cart count not updating after removing item",
  "description": "When removing the last item from cart, count shows -1",
  "issueType": "Bug",
  "priority": "High",
  "labels": ["regression", "checkout"],
  "components": ["shopping-cart"]
}
```

### Session Completion

```http
POST /api/v1/sessions/manual/{sessionId}/complete
{
  "notes": "Found 2 bugs, 23/25 tests passed",
  "bugsFound": 2,
  "testStepsCompleted": 25,
  "automationCoverage": 60
}
```

## Automation Workflow

### SDK Installation

```bash
npm install @shifty/sdk-playwright @shifty/sdk-core
```

### Test Configuration

```typescript
// playwright.config.ts
import { shiftyConfig } from '@shifty/sdk-playwright';

export default shiftyConfig({
  tenantId: process.env.SHIFTY_TENANT_ID,
  apiKey: process.env.SHIFTY_API_KEY,
  testDir: './tests',
  use: {
    baseURL: process.env.TEST_URL,
    screenshot: 'on-failure',
    trace: 'retain-on-failure',
  },
  healing: {
    enabled: true,
    confidence: 0.8,
    fallbackStrategies: ['visual', 'structural', 'semantic'],
  },
  telemetry: {
    enabled: true,
    serviceName: 'qa-automation',
  },
});
```

### Writing Tests with Auto-Healing

```typescript
import { shiftyTest } from '@shifty/sdk-playwright';

shiftyTest.describe('Checkout Flow', () => {
  shiftyTest('should complete purchase', async ({ page, shifty }) => {
    await page.goto('/products');
    
    // Selectors auto-heal if they break
    await shifty.click('[data-testid="add-to-cart"]');
    await shifty.click('[data-testid="checkout-button"]');
    
    await page.fill('#email', 'test@example.com');
    await shifty.click('[data-testid="pay-button"]');
    
    await expect(page).toHaveURL('/confirmation');
  });
});
```

### Test Generation

Request test generation for uncovered areas:

```http
POST /api/v1/ci/actions/test-gen
{
  "repo": "org/repo",
  "commitSha": "{sha}",
  "coverageGaps": [
    {"file": "src/components/Cart.tsx", "coverage": 45},
    {"file": "src/pages/Checkout.tsx", "coverage": 30}
  ],
  "options": {
    "framework": "playwright",
    "language": "typescript",
    "style": "page-object"
  }
}
```

### Test Healing

When tests fail due to selector changes:

```http
POST /api/v1/ci/actions/test-heal
{
  "failingTests": [
    {
      "testId": "checkout-flow-001",
      "error": "selector '[data-testid=\"pay\"]' not found",
      "screenshot": "base64-screenshot",
      "currentDOM": "<html>..."
    }
  ]
}
```

## Automation Gap Analysis

### Identify Gaps

```http
GET /api/v1/tenants/{tenantId}/automation-gaps/report
```

Response shows:
- Total automation gaps
- Gaps by priority
- Estimated effort
- Top recurring gaps

### Adding Automation Gaps

During manual testing:

```http
POST /api/v1/sessions/manual/{sessionId}/automation-gaps
{
  "description": "Cart quantity validation needs automation",
  "priority": "high",
  "estimatedEffort": "2 hours"
}
```

## Test Data Management

### HITL Dataset Creation

Create datasets for AI training:

```http
POST /api/v1/tenants/{tenantId}/datasets
{
  "name": "Checkout Flow Patterns",
  "missionType": "selector_validation",
  "description": "Valid checkout scenarios for model training"
}
```

### Contributing to Datasets

```http
POST /api/v1/missions/{missionId}/complete
{
  "userId": "{qa_id}",
  "result": {
    "validated": true,
    "annotations": {
      "selector": "[data-testid='checkout']",
      "alternatives": ["#checkout-btn", ".checkout-action"],
      "confidence": 0.95
    }
  }
}
```

## Metrics & Reporting

### Test Coverage Dashboard

```http
GET /api/v1/roi/insights?persona=qa&repo={repo}
```

Key metrics:
- **Automation Coverage**: % of tests automated
- **Test Stability**: Flaky test rate
- **Bug Detection Rate**: Bugs per testing hour
- **Time to Test**: Average session duration

### Quality Health Check

```http
GET /api/v1/ci/actions/quality-insights
```

### Weekly QA Report

```markdown
## QA Status Report - Week {N}

**Test Execution**:
- Manual Sessions: {count}
- Automated Runs: {count}
- Total Test Cases: {total}

**Quality Metrics**:
- Pass Rate: {rate}%
- Bugs Found: {bugs}
- Critical Bugs: {critical}

**Automation Progress**:
- Coverage: {coverage}%
- New Tests: {new}
- Healed Tests: {healed}

**Recommendations**:
- {items}
```

## Best Practices

### 1. Test Strategy

```
Automation Pyramid:
- 70% Unit Tests (Developers)
- 20% Integration Tests (SDET/Dev)
- 10% E2E Tests (QA/SDET)
+ Manual Exploratory Testing
```

### 2. Session Recording

Always record sessions for:
- Bug reproduction steps
- Training data collection
- Knowledge sharing

### 3. Selector Strategy

```typescript
// Priority order for selectors
const selectorPriority = [
  'data-testid',      // Most stable
  'aria-label',       // Accessibility-friendly
  'unique class',     // Component-specific
  'semantic HTML',    // By role
  // Avoid: nth-child, complex CSS paths
];
```

### 4. Bug Reporting Standards

Every bug report should include:
- [ ] Clear reproduction steps
- [ ] Expected vs actual behavior
- [ ] Screenshots/recordings
- [ ] Environment details
- [ ] Severity assessment
- [ ] Automation potential

### 5. Collaboration

- Use session collaboration features
- Tag developers on technical issues
- Share insights with product team
- Document edge cases for automation

## Certification Levels

### Level 1: QA Practitioner
- Complete 50 manual test sessions
- File 20 validated bugs
- Pass QA fundamentals quiz

### Level 2: Automation Engineer
- Create 100 automated tests
- Achieve 80% pass rate
- Contribute to healing dataset

### Level 3: QE Lead
- Lead 10 test planning sessions
- Train 3 team members
- Improve team metrics by 20%

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Bug Detection Rate | > 2/hour | Bugs found per testing hour |
| Automation Coverage | > 70% | Automated vs. total tests |
| Test Stability | > 95% | Non-flaky test percentage |
| Session Productivity | > 80% | Useful steps per session |
