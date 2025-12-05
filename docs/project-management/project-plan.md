# Shifty Pre-GTM Delivery Plan

_Status: Draft_

This plan turns the CRITICAL/HIGH backlog into focused pull-request tracks. Each PR bundles coherent functionality so we can ship large slices quickly, while still keeping code review manageable.

---

## PR Track 1 — Secret Hygiene & Input Validation

- **Scope:** Replace all hardcoded DB/JWT secrets, enforce startup validation, add Zod schemas for JWT payloads and healing/test requests.
- **Services:** `packages/database`, `apps/api-gateway`, `services/auth-service`, `services/tenant-manager`, `services/healing-engine`, `services/test-generator`.
- **Key Tasks:**
  - Inject secrets via env + secret manager helpers; fail fast if unset.
  - Implement shared validation schemas in `@shifty/shared` and apply in gateway + healing/test endpoints.
  - Add regression tests to guarantee required env vars.
- **Exit Criteria:** Secrets never default to dev values, requests rejected when payloads malformed.

## PR Track 2 — Real Healing & Test Generation

- **Scope:** Remove production mocks, complete selector healing strategies, persist healing + test-generation jobs with tenant isolation.
- **Services:** `services/healing-engine`, `services/test-generator`, `packages/database` (migrations), `services/ai-orchestrator` (integration wiring).
- **Key Tasks:**
  - Implement data-testid/css/text/AI strategies with confidence scoring.
  - Build persistence layer (jobs, statuses, analytics) and tenant-aware queries.
  - Provide real-time status streaming hooks for UI.
- **Exit Criteria:** Healing/test APIs return real results, DB records capture every attempt, dashboards query live data.

## PR Track 3 — Gateway Resilience & Observability

- **Scope:** Harden API Gateway security and monitoring (body limits, Redis rate limiting, circuit breakers, service discovery, real metrics).
- **Services:** `apps/api-gateway`, `packages/shared` (config), `packages/database` (rate limit config storage), `services/cicd-governor` (health signals).
- **Key Tasks:**
  - Configure Fastify `bodyLimit`, `requestTimeout`, CSP, and strict CORS.
  - Integrate Redis-backed `@fastify/rate-limit` with per-tenant quotas.
  - Add service discovery abstraction (DNS/registry) + circuit breaker middleware.
  - Replace mock metrics with OpenTelemetry + Prometheus exporters.
- **Exit Criteria:** Gateway rejects oversized payloads, throttles reliably, degrades gracefully, and exposes real metrics endpoints.

## PR Track 4 — CI Fabric & SDK Foundation

- **Scope:** Launch JS/TS SDK packages and GitHub-first CI actions wired to `cicd-governor`.
- **Components:** `packages/sdk-core`, `packages/sdk-playwright`, `packages/sdk-observability`, `.github/workflows/shifty-*.yml`, `services/cicd-governor`, `services/integrations`.
- **Key Tasks:**
  - Build SDK authentication, telemetry emitters, Playwright helpers.
  - Publish reusable CI actions (test generation, healing, quality insights) requiring `SHIFTY_API_KEY`.
  - Extend cicd-governor ingestion with actionable webhooks + MCP `ci.status` interface.
- **Exit Criteria:** Example repos can adopt SDK + actions to auto-generate/heal tests and report gating signals.

## PR Track 5 — Manual Session Hub & Collaboration

- **Scope:** Extend React workspace with manual testing view (browser stream, steps, logs, Jira links) plus collaboration prompts.
- **Apps/Services:** `apps/web` (or equivalent frontend), `services/hitl-arcade`, `services/production-feedback`, `services/manual-session APIs`.
- **Key Tasks:**
  - Implement session CRUD via `manual.sessions` MCP hooks.
  - Surface HITL prompts, step recording, screenshot uploads, Jira exports.
  - Add persona-aware dashboards (PO, QA, Designer, GTM) with next-best actions.
- **Exit Criteria:** Users can schedule and execute manual sessions entirely inside Shifty, capturing telemetry + collaboration artifacts.

## PR Track 6 — Telemetry, ROI, and Retraining Pipeline

- **Scope:** Stand up OpenTelemetry collectors + Prometheus metrics, build ROI aggregation service, wire data-lifecycle/model-registry retraining triggers.
- **Services:** `services/data-lifecycle`, `services/model-registry`, `services/roi (new)`, `services/ai-orchestrator`, shared infra manifests.
- **Key Tasks:**
  - Instrument all services with OTLP exporters (traces, metrics, logs) and ensure ≥95% telemetry completeness.
  - Implement `/roi/*` APIs (insights, DORA, SPACE, incidents, operational cost) backed by PromQL/SQL queries.
  - Automate weekly retraining + threshold-triggered jobs using curated datasets.
- **Exit Criteria:** Dashboards show real ROI metrics, retraining pipeline runs on schedule, and telemetry SLAs are enforced.

## PR Track 7 — Docs, Runbooks, and Hardening

- **Scope:** Finalize documentation (OpenAPI, deployment, monitoring), add runbooks/playbooks, and execute chaos/resilience tests.
- **Artifacts:** `docs/architecture/api-reference.md`, `docs/development/deployment.md`, `docs/project-management/system-assessment.md`, `runbooks/*`.
- **Key Tasks:**
  - Generate OpenAPI specs for all public services.
  - Document telemetry hosting decisions, MCP fallbacks, and incident response.
  - Run multi-tenant chaos tests; capture learnings in runbooks.
- **Exit Criteria:** Docs align with shipped functionality, on-call playbooks exist, and platform validated under failure modes.

---

### Execution Notes

- Tackle tracks sequentially where dependencies exist (1 → 2 → 3, etc.), but staff multiple in parallel if capacity allows.
- Each PR should include integration tests + telemetry to keep ROI reporting accurate.
- Update `shifty.agent.md` and roadmap docs after each PR merges so Copilot instructions stay current.
