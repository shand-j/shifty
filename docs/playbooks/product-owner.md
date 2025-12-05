# Product Owner / Product Manager QE Playbook

## Overview

As a Product Owner or Product Manager, your primary focus is fast delivery of the best customer outcomes. This playbook guides you through using Shifty to gain release readiness intelligence, track ROI metrics, and prevent incidents.

## Key Metrics Dashboard

### Release Readiness

```http
GET /api/v1/roi/insights?repo={repo}&team={team}&timeframe=7d
```

Monitor these key indicators:
- **Test Coverage**: Percentage of features with automated tests
- **Quality Score**: AI-calculated quality assessment (0-100)
- **Bug Escape Rate**: Bugs found in production vs. pre-release
- **Deployment Readiness**: Green/yellow/red status

### ROI Metrics

```http
GET /api/v1/roi/operational-cost?tenant={tenant}&team={team}
```

Track:
- **Time Saved**: Hours saved through automation
- **Bugs Prevented**: Estimated bugs caught early
- **Developer Efficiency**: Time to first green test
- **Cost Avoidance**: Estimated cost savings

## Daily Workflow

### Morning Check (5 minutes)

1. **Review Quality Dashboard**
   - Check overnight test runs
   - Review any new bugs or failures
   - Verify deployment readiness

2. **Incident Prevention Summary**
   ```http
   GET /api/v1/roi/incidents?repo={repo}&team={team}
   ```
   - Review prevented incidents
   - Check risk assessment for pending releases

### Sprint Planning Integration

1. **Quality Debt Assessment**
   ```http
   GET /api/v1/quality/debt?repo={repo}
   ```
   - Review automation gaps
   - Prioritize quality improvements

2. **Risk Assessment**
   - Use Shifty's risk scoring for features
   - Allocate QA resources based on complexity

### Release Decision

1. **Pre-Release Checklist**
   - [ ] All critical tests passing
   - [ ] Quality score > 80
   - [ ] No critical security vulnerabilities
   - [ ] Performance baselines met
   - [ ] Accessibility score > 90

2. **Go/No-Go Query**
   ```http
   GET /api/v1/ci/actions/quality-insights
   ```

## Reporting

### Weekly Quality Report

Use the ROI service to generate automated reports:

```http
GET /api/v1/roi/reports?type=weekly&team={team}
```

Key sections:
- Quality trend analysis
- Automation coverage progress
- Time savings breakdown
- Incident prevention metrics

### Stakeholder Communication

Template for stakeholder updates:

```markdown
## Quality Status Report - Week {N}

**Quality Score**: {score}/100 ({trend} from last week)

**Key Highlights**:
- {bugs_prevented} potential bugs prevented
- {hours_saved} hours saved through automation
- {coverage}% test coverage (+{delta}%)

**Risks**:
- {list of identified risks}

**Recommendations**:
- {action items}
```

## Escalation Criteria

Escalate to Engineering Manager when:
- Quality score drops below 60
- Critical test failures persist > 24h
- Security vulnerabilities rated HIGH or CRITICAL
- Production incidents increase 50%+

## Tools Integration

### Jira Integration

Configure automatic issue creation:
```json
{
  "integration": "jira",
  "triggers": {
    "quality_gate_failure": true,
    "security_vulnerability": "HIGH+",
    "accessibility_violation": "critical"
  }
}
```

### Slack Notifications

Set up alerts for:
- Daily quality summary
- Critical test failures
- Release readiness changes

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Release Success Rate | > 95% | Deployments without rollback |
| Bug Escape Rate | < 5% | Production bugs vs. total |
| Time to Release | -20% | Compared to baseline |
| ROI | 3:1 | Value delivered vs. cost |
