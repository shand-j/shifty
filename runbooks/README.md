# Shifty Platform Runbooks

Operational runbooks for the Shifty Quality Engineering Platform.

## Contents

### Incident Response
- [Security Hotfix Pipeline](./security-hotfix.md) - Emergency security patch deployment
- [CI Failure Triage](./ci-failure-triage.md) - Diagnosing and resolving pipeline failures
- [Service Outage Response](./service-outage.md) - Responding to service unavailability

### Operations
- [Manual Session Moderation](./manual-session.md) - Managing manual testing sessions
- [Telemetry Outage](./telemetry-outage.md) - Handling telemetry collection failures
- [Database Operations](./database-ops.md) - Database maintenance and recovery

### Chaos Engineering
- [Chaos Drills](./chaos-drills.md) - Scheduled reliability testing
- [Failure Injection](./failure-injection.md) - Controlled failure scenarios

### Maintenance
- [Model Retraining](./model-retraining.md) - AI model update procedures
- [Data Lifecycle](./data-lifecycle.md) - Data retention and archival
- [Deployment Procedures](./deployment.md) - Service deployment runbook

## Quick Reference

| Scenario | Runbook | Severity |
|----------|---------|----------|
| Critical security vulnerability | [security-hotfix.md](./security-hotfix.md) | Critical |
| CI pipeline failure | [ci-failure-triage.md](./ci-failure-triage.md) | High |
| Service unavailable | [service-outage.md](./service-outage.md) | Critical |
| Telemetry gap | [telemetry-outage.md](./telemetry-outage.md) | High |
| ROI reporting blocked | [telemetry-outage.md](./telemetry-outage.md) | Medium |
| Model degradation | [model-retraining.md](./model-retraining.md) | Medium |

## Incident Severity Levels

| Level | Response Time | Examples |
|-------|--------------|----------|
| Sev-1 Critical | 15 minutes | Service down, data breach, security vulnerability |
| Sev-2 High | 1 hour | Major feature degraded, CI blocked, telemetry gap |
| Sev-3 Medium | 4 hours | Minor degradation, single tenant impact |
| Sev-4 Low | 24 hours | Cosmetic issues, documentation fixes |

## On-Call Rotation

Contact the on-call engineer via PagerDuty for Sev-1 and Sev-2 incidents.
- Primary: Platform Engineering
- Secondary: Site Reliability Engineering
- Escalation: Engineering Management
