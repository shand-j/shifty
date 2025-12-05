# Security Hotfix Pipeline Runbook

## Overview
This runbook describes the emergency procedure for deploying security patches.

## When to Use
- Critical security vulnerability discovered
- Active exploitation detected
- Security advisory requires immediate response

## Prerequisites
- Access to CI/CD Governor
- Repository write permissions
- Approval authority or access to approvers

## Procedure

### 1. Assess the Vulnerability
```bash
# Check current security alerts
curl -X GET "https://api.shifty.dev/api/v1/security/summary?tenantId=$TENANT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Verify:
- [ ] Severity level (Critical/High/Medium/Low)
- [ ] Affected services
- [ ] Exposure scope
- [ ] Exploitation status

### 2. Trigger Security Scan
```bash
# Run immediate security scan
curl -X POST "https://api.shifty.dev/api/v1/security/scans" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "configId": "security-hotfix-config-id",
    "priority": "critical"
  }'
```

### 3. Apply Patch
```bash
# Create hotfix branch
git checkout -b security-hotfix/$(date +%Y%m%d)-$CVE_ID main

# Apply patch
git apply $PATCH_FILE

# Commit with security context
git commit -m "security: patch $CVE_ID - $DESCRIPTION"
```

### 4. Run Targeted Tests
```bash
# Run security-focused tests only
npm run test:security
npm run test:affected -- --base=main

# Run regression tests
npm run test:regression
```

### 5. Expedited Review
For Sev-1 vulnerabilities:
- Single approver from Security team required
- Bypass standard review queue
- Document justification in PR

### 6. Deploy with Quality Gate Override
```bash
# Request expedited deployment
curl -X POST "https://api.shifty.dev/api/v1/ci/actions/deploy" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pipelineId": "$PIPELINE_ID",
    "target": "production",
    "securityOverride": true,
    "justification": "Critical CVE remediation",
    "approvedBy": "$APPROVER_ID"
  }'
```

### 7. Verify Deployment
```bash
# Check deployment status
curl -X GET "https://api.shifty.dev/api/v1/deployments/$DEPLOYMENT_ID" \
  -H "Authorization: Bearer $TOKEN"

# Run post-deployment security scan
curl -X POST "https://api.shifty.dev/api/v1/security/scans" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "configId": "post-deployment-scan-config",
    "targetUrl": "https://api.shifty.dev"
  }'
```

### 8. Close the CRITICAL Issue
```bash
# Record incident prevention
curl -X POST "https://api.shifty.dev/api/v1/roi/incidents" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "$TENANT_ID",
    "detectionSource": "security_scan",
    "severity": "critical",
    "description": "Patched $CVE_ID",
    "potentialImpact": "$IMPACT_DESCRIPTION",
    "estimatedCostAvoided": 50000
  }'
```

## Rollback Procedure

If deployment fails:
```bash
# Initiate rollback
curl -X POST "https://api.shifty.dev/api/v1/deployments/rollback" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deploymentId": "$DEPLOYMENT_ID",
    "targetVersion": "$PREVIOUS_VERSION",
    "reason": "Security hotfix deployment failure"
  }'
```

## Post-Incident

1. Update security advisory status
2. Notify affected tenants
3. Schedule post-mortem
4. Update this runbook if needed

## Contacts

- Security Team: security@shifty.dev
- Platform On-Call: via PagerDuty
- Engineering Manager: em@shifty.dev
