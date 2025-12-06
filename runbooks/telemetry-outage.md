# Telemetry Outage Runbook

## Overview
This runbook describes procedures for handling telemetry collection failures and the impact on ROI reporting.

## When to Use
- Telemetry completeness falls below 95%
- OTLP collector unavailable
- Prometheus scraping failures
- ROI reports blocked due to incomplete data

## Prerequisites
- Access to telemetry infrastructure
- Platform monitoring access
- Prometheus/OTLP admin permissions

## Detection

### Automated Alerts
- `telemetry_completeness_ratio < 0.95` triggers alert
- OTLP collector health check failures
- Prometheus target down alerts

### Manual Check
```bash
# Check telemetry completeness
curl -X GET "https://api.shifty.dev/api/v1/roi/telemetry-completeness?tenantId=$TENANT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

## Procedure

### 1. Assess Impact
```bash
# Check which signals are affected
curl -X GET "https://api.shifty.dev/api/v1/roi/telemetry-completeness?tenantId=$TENANT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "traces": { "completenessRatio": 0.85, "meetsThreshold": false },
  "metrics": { "completenessRatio": 0.92, "meetsThreshold": false },
  "logs": { "completenessRatio": 0.97, "meetsThreshold": true },
  "overallComplete": false,
  "canReportROI": false
}
```

### 2. Check Collector Health
```bash
# OTLP Collector health
kubectl get pods -l app=otel-collector -n observability
kubectl logs -l app=otel-collector -n observability --tail=100

# Prometheus health
kubectl get pods -l app=prometheus -n observability
curl -s http://prometheus:9090/-/healthy
```

### 3. Switch to Cached Data Mode
If collector is down:
```bash
# Enable cache fallback
curl -X POST "https://api.shifty.dev/api/v1/telemetry/mode" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "cached",
    "reason": "OTLP collector unavailable"
  }'
```

### 4. Investigate Root Cause

| Symptom | Likely Cause | Resolution |
|---------|--------------|------------|
| All signals down | Collector crash | Restart collector |
| Traces only | OTLP endpoint issue | Check endpoint config |
| Metrics only | Prometheus scrape failure | Check targets |
| Single tenant | SDK misconfiguration | Check tenant SDK setup |
| Gradual degradation | Resource exhaustion | Scale collector |

### 5. Restart Collector (if needed)
```bash
# Restart OTLP collector
kubectl rollout restart deployment/otel-collector -n observability

# Wait for healthy state
kubectl rollout status deployment/otel-collector -n observability
```

### 6. Verify Recovery
```bash
# Check collector metrics
curl -s http://otel-collector:8888/metrics | grep otelcol_receiver_accepted_spans

# Verify telemetry completeness improving
for i in {1..5}; do
  curl -X GET "https://api.shifty.dev/api/v1/roi/telemetry-completeness?tenantId=$TENANT_ID&signal=traces" \
    -H "Authorization: Bearer $TOKEN"
  sleep 60
done
```

### 7. Notify Stakeholders
If outage > 1 hour:
```bash
# Alert via platform responders
curl -X POST "https://api.shifty.dev/api/v1/alerts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "telemetry_outage",
    "severity": "high",
    "message": "Telemetry completeness below threshold",
    "impactedTenants": ["*"],
    "duration": "$DURATION_MINUTES"
  }'
```

### 8. Postpone ROI Reporting
```bash
# Mark ROI data as incomplete
curl -X PATCH "https://api.shifty.dev/api/v1/roi/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "$TENANT_ID",
    "status": "incomplete",
    "reason": "Telemetry gap from $START_TIME to $END_TIME",
    "estimatedRecovery": "2024-01-15T12:00:00Z"
  }'
```

## Recovery Verification

1. Telemetry completeness > 95% for all signals
2. ROI calculations produce valid results
3. No gaps in dashboard data
4. All tenants receiving data

```bash
# Verify full recovery
curl -X GET "https://api.shifty.dev/api/v1/roi/telemetry-completeness?tenantId=$TENANT_ID" \
  -H "Authorization: Bearer $TOKEN"

# Should return:
# { "overallComplete": true, "canReportROI": true }
```

## Post-Incident

1. Document gap period
2. Notify affected tenants
3. Schedule data backfill if possible
4. Update alerting thresholds if needed
5. Root cause analysis

## Preventive Measures

- Multi-region collector deployment
- Automatic failover configuration
- Regular health check monitoring
- Capacity planning for peak loads

## Contacts

- Platform SRE: sre@shifty.dev
- Observability Team: observability@shifty.dev
- On-Call: via PagerDuty
