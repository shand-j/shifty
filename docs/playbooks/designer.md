# Designer QE Playbook

## Overview

As a Designer, your goal is high-fidelity products that execute design vision flawlessly. This playbook helps you use Shifty for visual quality checks, regression alerts, and collaboration with the QA team.

## Key Capabilities

### Visual Quality Checks

```http
POST /api/v1/accessibility/scans
{
  "configId": "visual-qa-config",
  "target": {
    "urls": ["https://staging.example.com/design-system"]
  }
}
```

### Accessibility Compliance

Ensure designs meet WCAG 2.1 AA standards:
- Color contrast ratios
- Focus indicators
- Alt text completeness
- Navigation patterns

## Daily Workflow

### Design Review Integration

1. **Before Handoff**
   - Run visual regression check
   - Verify accessibility compliance
   - Generate design QA report

2. **During Development**
   - Monitor visual regression alerts
   - Review implementation fidelity
   - Collaborate via session comments

### Visual Regression Setup

Configure visual baselines:

```json
{
  "component": "design-system",
  "viewports": [
    {"width": 375, "height": 812, "device": "mobile"},
    {"width": 768, "height": 1024, "device": "tablet"},
    {"width": 1440, "height": 900, "device": "desktop"}
  ],
  "threshold": 0.01,
  "ignoreAreas": ["dynamic-content", "timestamps"]
}
```

### Accessibility Workflow

1. **Early Design Phase**
   - Use color contrast checkers
   - Plan focus management
   - Design for keyboard navigation

2. **Implementation Phase**
   ```http
   GET /api/v1/accessibility/scans/{scanId}/issues?impact=critical,serious
   ```

3. **Pre-Release**
   - Full accessibility audit
   - WCAG compliance report
   - Remediation tracking

## Manual Session Collaboration

### Starting a Design QA Session

```http
POST /api/v1/sessions/manual
{
  "tenantId": "{tenant}",
  "userId": "{designer_id}",
  "persona": "designer",
  "sessionType": "visual-qa",
  "title": "Design Review - Feature X",
  "component": "design-system/buttons"
}
```

### Logging Design Issues

```http
POST /api/v1/sessions/manual/{sessionId}/steps
{
  "sequence": 1,
  "action": "Review button component spacing",
  "expectedResult": "8px padding as per design spec",
  "actualResult": "12px padding observed",
  "status": "failed",
  "attachments": ["screenshot-url"]
}
```

### Export to Jira

```http
POST /api/v1/sessions/manual/{sessionId}/export/jira
{
  "summary": "Button padding mismatch",
  "description": "Implementation differs from design spec",
  "issueType": "Bug",
  "priority": "Medium",
  "labels": ["design-qa", "visual-regression"],
  "components": ["design-system"]
}
```

## Design System Quality

### Component Testing

Track design system component quality:

| Component | Visual Tests | Accessibility | Coverage |
|-----------|-------------|---------------|----------|
| Buttons | ✅ | ✅ | 100% |
| Forms | ✅ | ⚠️ | 85% |
| Navigation | ✅ | ✅ | 95% |
| Cards | 🔄 | ✅ | 60% |

### Regression Alerts

Configure alerts for design changes:

```json
{
  "alerts": {
    "visual_diff_threshold": 0.05,
    "accessibility_violation": ["critical", "serious"],
    "component_coverage_drop": 10
  },
  "channels": ["slack", "email"]
}
```

## Collaboration Tools

### Design Handoff Checklist

- [ ] All components have visual baselines
- [ ] Accessibility annotations complete
- [ ] Interaction specs documented
- [ ] Responsive breakpoints defined
- [ ] Error states designed
- [ ] Loading states designed

### Review Comments

Add comments to implementation reviews:

```http
POST /api/v1/steps/{stepId}/comments
{
  "userId": "{designer_id}",
  "text": "Hover state color should be #1a73e8, currently #2196f3"
}
```

## Metrics & Reporting

### Design Quality Dashboard

```http
GET /api/v1/roi/insights?persona=designer&component={component}
```

Key metrics:
- **Visual Regression Rate**: Changes flagged vs. approved
- **Accessibility Score**: Overall WCAG compliance
- **Design Debt**: Known design issues pending fix
- **Implementation Fidelity**: % matching design specs

### Weekly Design QA Report

```markdown
## Design Quality Report - Week {N}

**Components Reviewed**: {count}
**Visual Regressions**: {regressions}
**Accessibility Issues**: {issues}

**Highlights**:
- {summary}

**Action Items**:
- {items}
```

## Best Practices

### 1. Early Quality Integration
- Include QA in design reviews
- Test prototypes for accessibility
- Document edge cases

### 2. Visual Regression Hygiene
- Review all flagged changes
- Update baselines intentionally
- Document design decisions

### 3. Accessibility First
- Design with accessibility in mind
- Use semantic color meanings
- Plan for assistive technology

### 4. Collaboration
- Use session recordings for reviews
- Tag issues for developer context
- Maintain design-dev communication

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Visual Regression Catch Rate | > 95% | Regressions caught pre-prod |
| Accessibility Score | > 90 | WCAG 2.1 AA compliance |
| Design Issue Resolution | < 5 days | Time to fix design bugs |
| Component Coverage | > 90% | Components with visual tests |
