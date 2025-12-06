# Manual Session Moderation Runbook

## Overview
This runbook describes the procedure for managing manual testing sessions using the Manual Session Hub.

## When to Use
- Starting new manual/exploratory testing sessions
- Moderating ongoing sessions
- Closing sessions and generating ROI summaries

## Prerequisites
- Access to Manual Sessions API
- QA persona permissions
- Jira integration (optional)

## Procedure

### 1. Start a Manual Session
```bash
# Create a new quality session
curl -X POST "https://api.shifty.dev/api/v1/sessions/manual" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "$TENANT_ID",
    "userId": "$USER_ID",
    "persona": "qa",
    "sessionType": "exploratory",
    "title": "Exploratory Testing: Login Flow",
    "description": "Testing edge cases in authentication",
    "charter": "Explore login functionality focusing on error handling",
    "repo": "shifty/frontend",
    "branch": "feature/new-login",
    "component": "auth",
    "riskLevel": "high"
  }'
```

### 2. Configure Session Environment
- Open the in-app browser
- Set viewport/device profile
- Enable session recording if needed

### 3. Ensure Step Logging
```bash
# Add a test step
curl -X POST "https://api.shifty.dev/api/v1/sessions/manual/$SESSION_ID/steps" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sequence": 1,
    "action": "Navigate to login page",
    "expectedResult": "Login form displayed",
    "status": "pending"
  }'
```

### 4. Execute Test Steps
For each step:
1. Perform the action
2. Observe the result
3. Update step status
4. Attach screenshots if needed

```bash
# Update step with results
curl -X PATCH "https://api.shifty.dev/api/v1/sessions/manual/$SESSION_ID/steps/$STEP_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actualResult": "Login form displayed correctly",
    "status": "passed",
    "confidence": 0.95
  }'
```

### 5. Log Bugs Found
```bash
# Export to Jira when bug found
curl -X POST "https://api.shifty.dev/api/v1/integrations/jira/issues" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Bug: Invalid password error message unclear",
    "description": "When entering invalid password, the error message...",
    "issueType": "Bug",
    "priority": "Medium",
    "labels": ["manual-testing", "auth"],
    "sessionId": "$SESSION_ID",
    "stepId": "$STEP_ID"
  }'
```

### 6. Record Automation Gaps
Note features that should have automated tests:
```bash
# Update session with automation gaps
curl -X PATCH "https://api.shifty.dev/api/v1/sessions/manual/$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "automationGaps": [
      {
        "description": "Password reset flow not covered by automation",
        "priority": "high",
        "estimatedEffort": "2 hours"
      }
    ]
  }'
```

### 7. Close Session
Sessions auto-close after 15 minutes idle or explicitly:
```bash
# Complete session
curl -X POST "https://api.shifty.dev/api/v1/sessions/manual/$SESSION_ID/complete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Completed exploratory testing. Found 2 bugs.",
    "bugsFound": 2,
    "testStepsCompleted": 15,
    "automationCoverage": 60
  }'
```

### 8. Generate ROI Summary
```bash
# Get session summary
curl -X GET "https://api.shifty.dev/api/v1/sessions/manual/$SESSION_ID/summary" \
  -H "Authorization: Bearer $TOKEN"
```

Expected output:
```json
{
  "sessionId": "...",
  "duration": "45 minutes",
  "stepsExecuted": 15,
  "bugsFound": 2,
  "jiraIssuesCreated": 2,
  "automationGapsIdentified": 3,
  "estimatedValueGenerated": "$250",
  "recommendations": [
    "Consider automating password reset flow",
    "Add visual regression tests for login form"
  ]
}
```

## Session Types

| Type | Description | Use Case |
|------|-------------|----------|
| exploratory | James Bach style exploration | New features, risk areas |
| scripted | Following test script | Regression, compliance |
| regression | Verifying fixes | Post-deployment |
| smoke | Quick health check | Pre-release |
| uat | User acceptance | Before release |
| accessibility | WCAG compliance | Accessibility testing |
| performance | Manual perf check | Performance validation |
| security | Security review | Security assessment |

## Best Practices

1. **Charter-based exploration**: Always define a clear charter
2. **Time-boxed sessions**: 30-90 minutes maximum
3. **Note-taking**: Record observations immediately
4. **Screenshots**: Capture evidence for bugs
5. **Collaboration**: Use comments for team discussion

## Contacts

- QA Lead: qa-lead@shifty.dev
- Manual Testing Hub: hub@shifty.dev
