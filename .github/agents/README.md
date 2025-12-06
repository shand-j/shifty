# Shifty Custom GitHub Copilot Agents

This directory contains custom agent definitions for GitHub Copilot that provide specialized capabilities for the Shifty platform.

## Available Agents

### 1. shifty-dev
**Purpose:** Primary development agent for the Shifty Unified Copilot & CI Fabric

**Description:** A comprehensive agent that unifies SDK integrations, CI automation, manual testing, telemetry, and ROI analytics inside a single React workspace. This is the main development agent for working on the Shifty platform itself.

**Key Capabilities:**
- JS/TS SDK & Playwright Kit development
- CI Fabric (GitHub-first) automation
- Telemetry & ROI Pipeline implementation
- Manual Session & Collaboration features
- Data Aggregation & Retraining workflows

**File:** [shifty-dev.agent.md](./shifty-dev.agent.md)

---

### 2. shifty
**Purpose:** General-purpose Shifty platform agent

**Description:** The base agent definition containing all key contracts (api-reference.md, system-assessment.md, project-status.md) for working with the Shifty platform. This agent serves as the foundational reference for all Shifty-related operations.

**Key Capabilities:**
- Platform architecture understanding
- API reference and contracts
- System assessment and status tracking
- Multi-persona support (Product, Design, QA, Dev, Manager)

**File:** [shifty.agent.md](./shifty.agent.md)

---

### 3. qe-collaborator ⭐ NEW
**Purpose:** Cross-functional QE collaboration agent

**Description:** A specialized agent that bridges Product, Design, QA, and Dev teams to build quality into the product development lifecycle. This agent facilitates seamless collaboration by providing fast context delivery, validating AI outputs, identifying gaps and risks, and ensuring all teams have the information they need.

**Key Capabilities:**
- **Fast Context Delivery:** Rapidly surface product requirements, design specs, test coverage, and implementation details
- **Cross-Persona Knowledge Sharing:** Translate information between Product, Design, QA, and Dev perspectives
- **Gap & Risk Identification:** Proactively detect missing requirements, untestable designs, and coverage gaps
- **AI Output Validation:** Verify test generation, healing, and automation suggestions
- **Collaboration Facilitation:** Guide synchronous and asynchronous collaboration with contextual prompts

**Interaction Patterns:**
- **Product Owners:** Release readiness assessments, testability validation, risk-based priorities
- **Designers:** Testability checklists, accessibility requirements, visual regression guidance
- **QA/SDET:** AI test validation, context delivery, gap analysis, manual test strategy
- **Developers:** Requirements clarification, design intent, testability guidance, blocker resolution

**File:** [qe-collaborator.agent.md](./qe-collaborator.agent.md)

---

## Using Custom Agents

Custom agents are automatically available when using GitHub Copilot in this repository. To invoke a specific agent:

1. **In Chat:** Mention the agent by name: `@qe-collaborator help me validate these AI-generated tests`
2. **In Comments:** Reference the agent: `// @qe-collaborator: Are these requirements testable?`
3. **In Copilot Workspace:** Select the agent from the agent picker

## Agent Selection Guide

| **Use Case** | **Recommended Agent** |
|--------------|----------------------|
| Building Shifty platform features | `shifty-dev` |
| Understanding Shifty architecture | `shifty` |
| Validating product requirements | `qe-collaborator` |
| Reviewing AI-generated tests | `qe-collaborator` |
| Clarifying design specifications | `qe-collaborator` |
| Getting fast context on features | `qe-collaborator` |
| Cross-team collaboration | `qe-collaborator` |
| Test gap identification | `qe-collaborator` |
| Risk assessment | `qe-collaborator` |

## QE Collaborator Examples

### Example 1: Validating AI-Generated Tests
```
You: @qe-collaborator The AI generated 12 tests for the search feature. Are they valid?

QE Collaborator: [Provides detailed validation against product requirements, 
design specs, and technical quality, with specific recommendations for 
acceptance, enhancement, or rejection]
```

### Example 2: Checking Feature Testability
```
You: @qe-collaborator I'm designing a new modal dialog. What should I include?

QE Collaborator: [Provides comprehensive checklist covering component states,
interactive elements, test identifiers, accessibility requirements, responsive
design, and common pitfalls to avoid]
```

### Example 3: Getting Product Context
```
You: @qe-collaborator What are the exact requirements for the password reset flow?

QE Collaborator: [Delivers complete context including product requirements,
design specifications, testability considerations, implementation risks,
and recommended test coverage]
```

## Creating New Agents

To create a new custom agent:

1. Create a new `.agent.md` file in this directory
2. Follow the format specified at: https://gh.io/customagents/config
3. Include the YAML frontmatter with `name` and `description`
4. Define the agent's capabilities, interaction patterns, and usage guidelines
5. Merge the file to the default branch to make it available

## Related Documentation

- **QE Playbooks:** [/docs/playbooks/](../../docs/playbooks/) - Persona-specific QE playbooks (Product, Design, QA, Dev, Manager)
- **Architecture:** [/docs/architecture/](../../docs/architecture/) - System architecture and API reference
- **Development:** [/docs/development/](../../docs/development/) - Developer guides and best practices

## Support

For questions or issues with custom agents:
- Check agent documentation in this directory
- Review related playbooks in `/docs/playbooks/`
- Open an issue with the `agent` label
