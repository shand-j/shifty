# shifty-copilot-agent.md

A comprehensive definition for the **Shifty Unified Copilot & CI Fabric** agent tailored for GitHub Copilot (and compatible assistants). This file embeds all key contracts (`api-reference.md`, `system-assessment.md`, `project-status.md`) so the agent always works from the latest source of truth.

---

## 1. Mission & Vision
- **Mission:** Deliver a JS/TS-first copilot that unifies SDK integrations, CI automation, manual testing, telemetry, and ROI analytics inside a single React workspace.
- **Vision Statement:** “A seamlessly integrated quality management and insights platform that surfaces the most relevant data per persona and prompts the most valuable actions.”

---

## 2. Personas & Expected Outcomes

| Persona | Core Need | Copilot Outcome |
| --- | --- | --- |
| **Product Owner / Manager** | Fast delivery of the best customer outcomes | Release readiness intel, ROI metrics, incident prevention summaries |
| **Designer** | High-fidelity products executing design vision flawlessly (no bugs) | Visual quality checks, regression alerts, collaboration nudges |
| **QA / SDET** | Team-owned best-in-class quality | Manual testing hub, Playwright orchestration, defect insights |
| **Developer** | Effortless testing, hyper-fast feedback | SDK hooks, test generation/healing, CI pipeline health |
| **Engineering Manager** | Justify Shifty spend, showcase maturity | DORA/SPACE dashboards, ROI analytics, telemetry completeness |

---

## 3. Workspace UX Principles
1. Persona-aware dashboards (contextual KPIs + next-best action prompts).
2. Embedded manual testing hub with in-app browser, session recording, and Jira issue flow.
3. Playful HITL prompts (micro-tasks) to distribute human-in-the-loop load.
4. React-based SPA backed by OpenTelemetry/Prometheus, real-time updates via WebSockets/SSE.

---

## 4. Core Capabilities
1. **JS/TS SDK & Playwright Kit**
   - Auth client, hooks, telemetry helpers, Playwright bootstrap, production monitors.
   - Typed events enabling AI training and automated healing/orchestration.
2. **CI Fabric (GitHub-first)**
   - `cicd-governor` ingestion of pipeline events.
   - Reusable GitHub Actions for test generation, test healing, quality insights.
   - Deployment docs under `deployment.md`; roadmap for GitLab/Circle.
3. **Telemetry & ROI Pipeline**
   - OpenTelemetry traces/metrics, Prometheus scraping.
   - ROI aggregation service exposing pace of delivery, incidents prevented, bugs found, DORA, SPACE, operational cost/efficiency.
4. **Manual Session & Collaboration**
   - Manual test plan loading/creation, exploratory (James Bach) mode.
   - In-app browser, step recording (training + automation gap analysis), notes, Jira export.
   - Persistent collaboration route + random micro-prompts via HITL Arcade & Product Feedback APIs.
5. **Data Aggregation & Retraining**
   - Quality session data (human or automation) captured end-to-end.
   - Stored until session closure, funneled to data-lifecycle, curated for training.
   - Retraining triggers: weekly cron + threshold breaches (quality metrics).

---

## 5. Data Flow (Quality Session Lifecycle)
1. **Action Initiated:** User or automation performs a quality-impact action (code, PR, manual test, CI run).
2. **AI Augmentation:** Copilot monitors, augments, or completes tasks to accelerate outcome.
3. **Session Capture:** Entire session recorded with traces, metrics, logs until closure (idle timeout or pipeline end).
4. **Storage & Aggregation:** Data ingested into telemetry store and session DB; summarized for ROI.
5. **Training Pipeline:** Datasets curated, validated; models retrained on schedule + threshold triggers.
6. **Feedback Loop:** Insights and automations fed back into workspace dashboards, HITL prompts, SDK hints.

---

## 6. Risks & Mitigation
| Risk | Mitigation |
| --- | --- |
| High infra cost / data loss | Tenant isolation, encryption, retention policies, hosting decision framework |
| Telemetry hosting choice delayed | Default to managed OSS, fall back to self-managed for sovereignty mandates |
| CI provider sprawl | GitHub-first rollout, abstractions for other providers |
| Manual hub complexity | Progressive disclosure UX, persona-specific defaults |
| Retraining drift | Automated validation, rollback routines, quality threshold alerts |

---

## 7. Success Metrics
- **Primary KPI:** Shifty can target any repo and deliver value immediately (time-to-first insight < defined SLA).
- **Supporting Metrics:** SDK adoption %, CI automation coverage, manual session engagement, telemetry completeness, ROI accuracy, retraining cycle time.

---

## 8. Implementation Phases (P0–P5)
1. **P0 – Contracts & Assessments:** Update all MDs, finalize telemetry schemas & hosting.
2. **P1 – SDK & Telemetry Core:** JS/TS SDK, Playwright kit, instrumentation.
3. **P2 – CI Fabric:** GitHub action suite, cicd-governor enhancements, docs.
4. **P3 – UI Expansion:** Manual testing hub, persona dashboards, collaboration widgets.
5. **P4 – ROI & Data Ops:** ROI service, data-lifecycle wiring, retraining automation.
6. **P5 – Hardening & Rollout:** Multi-tenant tests, runbooks, enablement.

---

## Appendix A — `api-reference.md`

### A1. Personas & Scopes
persona.pm – release intel, ROI endpoints
persona.designer – design quality dashboards
persona.qa – manual sessions, Playwright kits
persona.dev – SDK, CI, telemetry ingestion
persona.manager – org-wide telemetry & ROI
### A2. Authentication
- `POST /auth/token` – API key + persona scope.
- Headers: `X-Tenant-ID`, `X-Persona-Scope`.

### A3. SDK/Telemetry Endpoints
| Endpoint | Method | Description |
| --- | --- | --- |
| `/telemetry/events` | POST | Typed SDK events (JSON, strict schema) |
| `/telemetry/traces` | OTLP/gRPC + HTTP | Span ingestion |
| `/sessions/manual` | CRUD | Start/stop manual sessions, attach steps, evidence |
| `/manual/steps` | POST | Append steps with `step_id`, `session_id`, `action`, `expected`, `actual`, `evidence_url` |
| `/hitl/tasks` | GET/POST | Retrieve/submit micro HITL prompts |

### A4. CI Actions
| Endpoint | Payload | Notes |
| --- | --- | --- |
| `/ci/actions/test-gen` | repo, commit SHA, coverage gaps | Generates JS/TS Playwright tests |
| `/ci/actions/test-heal` | failing test IDs, logs | Suggests patches |
| `/ci/actions/quality-insights` | pipeline metadata | Returns insights + gating decisions |

### A5. Telemetry Schemas
#### Traces
- `quality.session`
  - attrs: `persona`, `session_id`, `session_type`, `repo`, `branch`, `component`, `risk_level`
- `ci.pipeline`
  - attrs: `pipeline_id`, `provider`, `stage`, `status`, `duration_ms`, `tests_total`, `tests_failed`
- `sdk.event`
  - attrs: `event_type`, `tenant_id`, `sdk_version`, `latency_ms`

#### Metrics
- `quality_sessions_active{persona,repo}`
- `tests_generated_total{repo}`
- `tests_healed_total{repo}`
- `ci_pipeline_duration_seconds{provider,stage}`
- `roi_time_saved_seconds{team}`
- `incidents_prevented_total{team}`

#### Logs
- Manual steps (`step_id`, `session_id`, `action`, `expected`, `actual`, `evidence_url`)
- HITL prompts (`task_id`, `persona`, `time_to_complete`)

### A6. ROI Service APIs
| Endpoint | Filters | Returns |
| --- | --- | --- |
| `/roi/insights` | repo/team/timeframe | Aggregated KPI bundle |
| `/roi/dora` | repo/team/timeframe | Lead time, deploy freq, MTTR, change fail |
| `/roi/space` | team/timeframe | SPACE components |
| `/roi/incidents` | repo/team | Prevented incidents, bugs found |
| `/roi/operational-cost` | tenant/team | Time saved vs cost analysis |

### A7. Rate Limits
- Default: 500 requests/min per tenant per persona scope.
- Burst: 2× for CI ingestion windows.

---

## Appendix B — `system-assessment.md`

### B1. Current State
- OTLP collectors partially deployed; need multi-tenant retention guarantees.
- Prometheus instances lack regional redundancy; decision pending on managed vs self-managed.
- GitHub is primary CI; GitLab/Circle adoption minimal but on roadmap.

### B2. Telemetry Hosting Decision
| Option | Pros | Cons | Default |
| --- | --- | --- | --- |
| Managed OSS (Cortex/Mimir SaaS) | Low ops, elastic | Higher cost, residency constraints | ✅ Default |
| Self-managed K8s Prometheus/OTLP | Full control, custom retention | Ops overhead, HA complexity | For sovereignty mandates |

**Considerations:** data sovereignty, low cloud cost, reusable architecture, encryption, tenant isolation.

### B3. Readiness & Gaps
- Need finalized telemetry schema adoption in all services.
- Collector auto-scaling + retention policy enforcement.
- SDK coverage baseline measurement.
- CI GitHub action spec approved.

### B4. Risk Register
| Risk | Impact | Mitigation |
| --- | --- | --- |
| High cost/data loss | SLA breach | Multi-region backups, cost monitoring, compression |
| Delayed telemetry hosting decision | Blocks instrumentation | Preselect default (managed) and fallback |
| Manual hub UX overload | Low adoption | Persona research, progressive feature flags |

### B5. Checklist
- [ ] Telemetry schema implemented in SDK & services
- [ ] Prometheus/OTLP hosting finalized
- [ ] GitHub action spec signed off
- [ ] Manual testing hub requirements baselined
- [ ] ROI metric queries validated

---

## Appendix C — `project-status.md`

### C1. Milestones
| Phase | Owner | Target |
| --- | --- | --- |
| P0 Contracts & Assessment | Platform Lead | Week 1 |
| P1 SDK & Telemetry | SDK Squad | Weeks 2–4 |
| P2 CI Fabric | Dev Productivity | Weeks 4–6 |
| P3 UI Expansion | Apps/Web Team | Weeks 6–9 |
| P4 ROI & Data Ops | Data/AI Team | Weeks 9–11 |
| P5 Hardening & Rollout | Release Eng | Weeks 11–12 |

### C2. Decision Log
- GitHub-first CI rollout ✅
- Telemetry schema (Appendix A5) ✅
- Hosting default = managed OSS (fallback self-managed) ✅
- Manual hub feature set (test plans, exploratory, in-app browser, Jira integration) ✅
- Retraining triggers: weekly cron + quality threshold breaches ✅

### C3. Open Questions
1. Finalize PromQL/SQL snippets for each ROI metric.
2. Confirm tenant-specific retention requirements.
3. UX wireframes for persona dashboards (PM, Designer, Manager).

### C4. KPIs
- Time-to-first insight SLA.
- Repo coverage with SDK instrumentation.
- CI action adoption rate.
- Telemetry completeness (% spans with required attributes).
- ROI accuracy delta vs baseline.

---

## Usage Notes for GitHub Copilot
- Treat this file as the authoritative agent definition.
- When generating code/docs, reference the personas, telemetry schemas, and APIs herein.
- For CI automation suggestions, default to GitHub workflows with actions that expose test generation, healing, and quality insights.
- Always respect telemetry hosting decisions and ROI metric definitions stated above.
- If instructions conflict elsewhere, defer to sections within this file.

---
