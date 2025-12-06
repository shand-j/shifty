# Shifty Hub UI Requirements

## Vision

A persona-aware React/TypeScript SPA that consolidates every QE workflow—test generation, selector healing, manual sessions, CI insights, ROI dashboards, and HITL collaboration—into a single workspace where each role (PO, Dev, QA, Designer, Manager, GTM) lands on a tailored view and is nudged toward the highest-value action.

---

## 1. Global Shell & Navigation

| Element | Requirement |
|---------|-------------|
| **Top bar** | Tenant/org switcher, global search (tests, sessions, incidents), notification bell (HITL prompts, CI failures, ROI alerts), user avatar + settings dropdown. |
| **Side nav** | Collapsible rail with icons + labels: Dashboard, Tests, Healing, Sessions, CI Pipelines, Insights, Settings. Persona-aware ordering (e.g., QA sees Sessions first, Dev sees Tests first). |
| **Breadcrumb** | Context trail for deep links (Tenant → Project → Test Suite → Test Case). |
| **Command palette** | `Cmd+K` launcher for quick actions: "Generate test", "Start session", "View ROI", "Search logs". |
| **Theme** | Light/dark toggle; tenant-level branding (logo, accent colour). |

---

## 2. Persona Dashboards

Each persona lands on a default dashboard; widgets are drag-and-drop rearrangeable.

### 2.1 Product Owner / PM Dashboard

| Widget | Data | Actions |
|--------|------|---------|
| **Release Readiness Gauge** | % tests passing, open blockers, predicted risk score. | Drill into failing suites. |
| **Quality Constraints** | AI-generated summary of risky changes in current sprint. | Approve/flag for review. |
| **Manual Session Queue** | Pending exploratory sessions awaiting scheduling. | Schedule, assign, or self-claim. |
| **Customer Feedback Heatmap** | Aggregated production errors mapped to features. | Link to Jira, request test coverage. |

### 2.2 Developer Dashboard

| Widget | Data | Actions |
|--------|------|---------|
| **My PRs Quality Status** | Per-PR test results, healing events, coverage delta. | Re-run tests, view healed selectors. |
| **Fast Feedback Panel** | Latest CI run summary (<30 s refresh). | Jump to logs, request AI fix suggestion. |
| **Test Generation Prompt** | Inline input: paste requirement or code diff → generate test. | Copy to clipboard, commit via GitHub Action. |
| **Flakiness Radar** | Top 5 flaky tests in repos I own. | Auto-quarantine toggle, view history. |

### 2.3 QA Dashboard

| Widget | Data | Actions |
|--------|------|---------|
| **Active Sessions** | Live manual/exploratory sessions with status. | Join, observe, take over. |
| **Healing Queue** | Selectors awaiting human review (confidence < threshold). | Approve, reject, retrain. |
| **Quality Scorecard** | Pass rate, mean-time-to-heal, coverage trend. | Export PDF, share to Slack. |
| **Predictive Degradation Alerts** | AI flags likely regressions before release. | Create Jira, block pipeline. |

### 2.4 Designer Dashboard

| Widget | Data | Actions |
|--------|------|---------|
| **Design-to-Test Mapper** | Figma/Sketch links → generated test plans. | Edit mapping, request coverage. |
| **Accessibility Audit** | Latest axe/lighthouse scores per component. | View violations, auto-generate a11y tests. |
| **UX Outcome Tracker** | User journey completion rates from production telemetry. | Annotate, link to design iteration. |

### 2.5 Manager Dashboard

| Widget | Data | Actions |
|--------|------|---------|
| **ROI Summary** | Time saved, cost avoided, incidents prevented (last 30 d). | Drill into per-team breakdown. |
| **DORA Metrics** | Deployment frequency, lead time, MTTR, change failure rate. | Compare to org benchmarks. |
| **SPACE Health** | Satisfaction, performance, activity, collaboration, efficiency. | View survey results, set targets. |
| **Team Leaderboard** | Gamified quality contributions (tests authored, heals approved). | Recognize top contributors. |

### 2.6 GTM Dashboard

| Widget | Data | Actions |
|--------|------|---------|
| **Upcoming Releases** | Timeline of features with quality confidence %. | Add market feedback, request demo env. |
| **Customer Issue Tracker** | Production incidents linked to product areas. | Escalate, request hotfix. |
| **Feature Flag Status** | Flags in rollout with error-rate overlay. | Pause rollout, notify engineering. |

---

## 3. Test Management Views

### 3.1 Test Explorer

- **Tree view** of projects → suites → cases; filterable by tag, status, framework.
- **Bulk actions:** run selected, delete, move, tag.
- **Inline preview:** code diff, last run result, coverage lines.

### 3.2 Test Case Detail

| Section | Content |
|---------|---------|
| **Metadata** | Name, tags, owner, created/updated timestamps. |
| **Code editor** | Monaco editor with syntax highlighting; read-only for generated tests until "Edit" clicked. |
| **Run history** | Timeline of executions with pass/fail/flaky badges, duration, screenshots. |
| **Healing history** | List of selector changes with before/after, confidence score, approval status. |
| **Linked artifacts** | Jira tickets, Figma frames, Slack threads. |

### 3.3 Test Generation Wizard

1. **Input** – paste requirement, upload spec, or connect Jira epic.
2. **AI Preview** – streaming code generation with progress indicator.
3. **Review** – side-by-side diff against existing tests; lint/type-check inline.
4. **Commit** – choose branch, PR title, reviewers; triggers GitHub Action.

---

## 4. Selector Healing Views

### 4.1 Healing Queue

| Column | Data |
|--------|------|
| **Selector** | Original vs healed selector with diff highlight. |
| **Confidence** | AI confidence %; colour-coded (green >90, amber 70-90, red <70). |
| **Test** | Link to affected test case. |
| **Actions** | Approve, reject, request re-analysis, view DOM snapshot. |

### 4.2 DOM Snapshot Viewer

- **Split pane:** original DOM tree (left) vs current DOM tree (right).
- **Highlight mode:** show added/removed/changed nodes.
- **Selector playground:** type selector, see matched elements live.

---

## 5. Manual Session Hub

### 5.1 Session List

| Column | Data |
|--------|------|
| **Name** | Session title + status badge (Draft, Active, Completed, Archived). |
| **Type** | Scripted, Exploratory, Accessibility, Performance. |
| **Owner** | Avatar + name. |
| **Progress** | Steps completed / total (or time elapsed for exploratory). |
| **Actions** | Resume, Observe, Export, Delete. |

### 5.2 Session Workspace

| Pane | Content |
|------|---------|
| **Browser viewport** | Embedded browser (Playwright cloud or self-hosted) with URL bar, back/forward, refresh. |
| **Step rail** | Ordered list of steps; each shows action type icon, description, status (pending/pass/fail/skipped). Click to jump. |
| **Execution log** | Real-time log stream (network, console, assertions) with search + level filter. |
| **Notes panel** | Rich-text editor for observations; auto-saves. |
| **Artifacts drawer** | Screenshots, videos, HAR files attached to current step. |
| **Jira sidebar** | Create/link tickets inline; pre-fills repro steps from session. |

### 5.3 Exploratory Mode (James Bach Style)

- **Charter input:** free-form mission statement.
- **Timer:** session time-box with pause/resume.
- **Heuristic prompts:** AI-generated "What if…" suggestions based on page context.
- **Session debrief:** structured form (bugs found, areas covered, notes) auto-generates report.

---

## 6. CI Pipeline Views

### 6.1 Pipeline List

| Column | Data |
|--------|------|
| **Repo / Branch** | GitHub org/repo + branch name. |
| **Status** | Pass/Fail/Running with duration. |
| **Tests** | Pass / Fail / Skipped counts. |
| **Heals** | # of selectors auto-healed this run. |
| **Actions** | View logs, re-run, cancel, configure. |

### 6.2 Pipeline Detail

- **Stage graph:** visual DAG of jobs with status icons.
- **Log viewer:** streaming logs with ANSI colour, search, download.
- **Test results tab:** expandable tree mirroring Test Explorer, inline failure screenshots.
- **Healing tab:** list of selectors healed during run with approve/reject actions.
- **Artifacts tab:** downloadable reports, coverage files, Playwright traces.

### 6.3 Pipeline Configuration

- **YAML editor:** edit `.github/workflows` in-app with lint + preview.
- **Shifty Action wizard:** drag-and-drop to insert `shifty/test-generate`, `shifty/heal`, `shifty/insights` steps.
- **Secrets manager:** mask/rotate `SHIFTY_API_KEY` per repo.

---

## 7. Insights & ROI Views

### 7.1 Insights Dashboard

| Widget | Data |
|--------|------|
| **Quality Trend** | Line chart of pass rate over time (daily/weekly/monthly). |
| **Coverage Heatmap** | Treemap of code areas by coverage %; click to drill. |
| **Flakiness Index** | Top 10 flaky tests with trend sparklines. |
| **Incident Correlation** | Scatter plot of production incidents vs test failures. |

### 7.2 ROI Dashboard

| Widget | Metric | Source |
|--------|--------|--------|
| **Time Saved** | Hours of manual test authoring avoided. | `sum(roi_time_saved_seconds)` converted to hours. |
| **Cost Avoided** | $ saved vs external QE consultancy rates. | Time saved × blended hourly rate. |
| **Incidents Prevented** | Count of regressions caught before prod. | `increase(incidents_prevented_total[30d])`. |
| **MTTR Reduction** | Mean-time-to-recover delta vs baseline. | DORA metric comparison. |
| **Automation Coverage** | % of user journeys covered by tests. | Coverage data from CI runs. |

### 7.3 DORA & SPACE Views

- **DORA Panel:** four gauges (deployment freq, lead time, MTTR, change failure rate) with trend arrows.
- **SPACE Panel:** radar chart of satisfaction, performance, activity, collaboration, efficiency; survey integration.
- **Benchmark comparison:** overlay org data against industry medians.

---

## 8. HITL Arcade & Collaboration

### 8.1 Mission Board

| Column | Data |
|--------|------|
| **Mission** | Title + type (label, verify, triage). |
| **Reward** | XP points + optional badge. |
| **Time** | Estimated duration. |
| **Claim** | Button to self-assign. |

### 8.2 Leaderboard

- **Ranked list** of contributors by XP (weekly/monthly/all-time toggle).
- **Badges showcase:** earned achievements with tooltips.
- **Team view:** aggregate scores per squad.

### 8.3 Collaboration Widgets

- **Threaded comments:** on test cases, sessions, healing items.
- **Reactions:** quick emoji feedback.
- **@mentions:** notify teammates; links to Slack/email.
- **Activity feed:** chronological stream of actions across the tenant.

---

## 9. Settings & Administration

### 9.1 Tenant Settings

| Section | Options |
|---------|---------|
| **General** | Name, slug, logo, accent colour. |
| **Members** | Invite, roles (Admin, Member, Viewer), SSO config. |
| **Integrations** | GitHub, Jira, Slack, Figma, Sentry webhooks. |
| **Billing** | Plan, usage, invoices (if SaaS). |

### 9.2 User Settings

- **Profile:** avatar, display name, email, password.
- **Notifications:** per-channel toggles (email, in-app, Slack).
- **Preferences:** default dashboard, theme, timezone.

### 9.3 API Keys & Webhooks

- **API keys:** generate, rotate, revoke; scoped by permission.
- **Webhooks:** configure outbound events (test.completed, healing.approved, etc.).

---

## 10. Technical Requirements

| Requirement | Specification |
|-------------|---------------|
| **Framework** | React 18 + TypeScript 5; Vite for dev/build. |
| **State** | Zustand or Redux Toolkit; React Query for server state. |
| **Routing** | React Router v6 with lazy-loaded routes. |
| **Styling** | Tailwind CSS + shadcn/ui component library. |
| **Editor** | Monaco Editor for code views. |
| **Charts** | Recharts or Victory for dashboards. |
| **Real-time** | WebSocket (Socket.IO) for logs, sessions, notifications. |
| **Auth** | JWT via `@shifty/sdk-core`; SSO via OIDC. |
| **A11y** | WCAG 2.1 AA; keyboard nav, screen-reader labels. |
| **i18n** | react-i18next; initial locales: en, es, de, ja. |
| **Testing** | Vitest + React Testing Library; Playwright for E2E. |
| **CI** | GitHub Actions; Chromatic for visual regression. |

---

## 11. Information Architecture

```
/                         → Redirect to persona dashboard
/dashboard                → Persona dashboard (widgets)
/tests                    → Test Explorer
/tests/:id                → Test Case Detail
/tests/generate           → Test Generation Wizard
/healing                  → Healing Queue
/healing/:id              → DOM Snapshot Viewer
/sessions                 → Session List
/sessions/:id             → Session Workspace
/pipelines                → Pipeline List
/pipelines/:id            → Pipeline Detail
/insights                 → Insights Dashboard
/insights/roi             → ROI Dashboard
/insights/dora            → DORA Metrics
/arcade                   → HITL Mission Board
/arcade/leaderboard       → Leaderboard
/settings                 → Tenant Settings
/settings/user            → User Settings
/settings/integrations    → Integration Config
/settings/api             → API Keys & Webhooks
```

---

## 12. Milestones

| Phase | Scope | Target |
|-------|-------|--------|
| **P1** | Global shell, auth, Test Explorer, Test Case Detail, basic Healing Queue. | +4 weeks |
| **P2** | Persona dashboards (Dev, QA), Test Generation Wizard, Pipeline views. | +4 weeks |
| **P3** | Manual Session Hub (scripted + exploratory), Jira sidebar. | +4 weeks |
| **P4** | Insights/ROI dashboards, DORA/SPACE panels. | +3 weeks |
| **P5** | HITL Arcade, collaboration widgets, remaining persona dashboards. | +3 weeks |
| **P6** | Settings/admin, i18n, a11y audit, performance tuning. | +2 weeks |

---

*Last Updated: December 6, 2025*
