# Autonomous Healing Engine - Language Support

## Overview

The autonomous healing engine is now available in **two languages**:

1. **TypeScript** (`@shifty/playwright-healing`) - For Node.js/JavaScript ecosystems
2. **Python** (`playwright-healing`) - For Python/AI/ML ecosystems

## Why Two Implementations?

As noted by @shand-j: **"AI tooling should absolutely use Python"**

### TypeScript Version
- ✅ Best for TypeScript/JavaScript developers
- ✅ Integrates with Node.js build tools
- ✅ Works with Playwright Test framework
- ✅ Strict type checking with TypeScript
- 📦 Package: `@shifty/playwright-healing`
- 📍 Location: `packages/playwright-healing/`

### Python Version
- ✅ Best for AI/ML practitioners and data scientists
- ✅ Native Python with type hints
- ✅ Works with pytest
- ✅ Access to rich Python AI/ML ecosystem
- ✅ Async/await support
- 📦 Package: `playwright-healing`
- 📍 Location: `packages/playwright-healing-python/`

## Feature Comparison

| Feature | TypeScript | Python |
|---------|-----------|--------|
| **Core Healing Strategies** | ✅ | ✅ |
| Data-testid Recovery | ✅ | ✅ |
| Text Content Matching | ✅ | ✅ |
| CSS Hierarchy Analysis | ✅ | ✅ |
| AI-Powered (Ollama) | ✅ | ✅ |
| **Integration** | | |
| Testing Framework | Playwright Test | pytest |
| Async Support | async/await | async/await |
| Type Safety | TypeScript | Type hints |
| **Installation** | | |
| Package Manager | npm/yarn | pip/poetry |
| Installation | `npm install @shifty/playwright-healing` | `pip install playwright-healing` |

## Installation

### TypeScript/Node.js

```bash
npm install @shifty/playwright-healing
```

### Python

```bash
pip install playwright-healing
```

## Quick Start Examples

### TypeScript

```typescript
import { healingTest, expect } from '@shifty/playwright-healing';

healingTest('login flow', async ({ healingPage }) => {
  await healingPage.goto('https://example.com/login');
  await healingPage.fill('#username', 'user@test.com');
  await healingPage.click('button[type="submit"]');
  
  await expect(healingPage.locator('.welcome-message')).toBeVisible();
});
```

### Python

```python
from playwright.sync_api import Page
from playwright_healing import HealingPage

def test_login_flow(page: Page):
    healing_page = HealingPage(page)
    healing_page.goto('https://example.com/login')
    healing_page.fill('#username', 'user@test.com')
    healing_page.click('button[type="submit"]')
    
    assert healing_page.locator('.welcome-message').is_visible()
```

## Core Healing Strategies (Shared)

Both implementations share the same healing strategies:

1. **Data-testid Recovery**
   - Uses Levenshtein distance for fuzzy matching
   - Handles kebab-case, snake_case, camelCase variations
   - Scans for data-testid, data-test-id, data-cy attributes

2. **Text Content Matching**
   - Fuzzy text matching with 80%+ similarity threshold
   - Word overlap analysis
   - Considers element type and role

3. **CSS Hierarchy Analysis**
   - 10 alternative selector generators
   - DOM structure analysis
   - Parent-child relationship matching

4. **AI-Powered Analysis**
   - Ollama integration (llama3.1:8b)
   - Page context extraction
   - Intelligent selector suggestions

## When to Use Which?

### Use TypeScript Version If:
- You're building a Node.js/JavaScript application
- Your team primarily works in TypeScript
- You use npm/yarn for package management
- You're already using Playwright Test framework

### Use Python Version If:
- You're working on AI/ML projects
- Your team primarily works in Python
- You use pytest for testing
- You need integration with Python's rich AI/ML ecosystem
- You're a data scientist or ML engineer

## Documentation

- **TypeScript**: See `packages/playwright-healing/README.md`
- **Python**: See `packages/playwright-healing-python/README.md`

## Contributing

Both packages are open source under MIT license. Contributions welcome!

- TypeScript contributions: See `packages/playwright-healing/`
- Python contributions: See `packages/playwright-healing-python/`

## License

Both packages are licensed under MIT License.

Copyright (c) 2024 Shifty AI

---

**Made with ❤️ by Shifty AI** | TypeScript for the web, Python for AI 🚀
