# playwright-healing

> Autonomous selector healing engine for Playwright Python tests with AI-powered analysis

[![PyPI version](https://badge.fury.io/py/playwright-healing.svg)](https://badge.fury.io/py/playwright-healing)
[![Python](https://img.shields.io/badge/python-%3E%3D3.8-blue.svg)](https://www.python.org)
[![Playwright](https://img.shields.io/badge/playwright-%3E%3D1.40.0-green.svg)](https://playwright.dev/python)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Features

- **🔧 Automatic Selector Healing**: Automatically fixes broken selectors without manual intervention
- **🤖 AI-Powered Analysis**: Uses Ollama LLM for intelligent selector suggestions  
- **📊 Multiple Healing Strategies**:
  - Data-testid recovery (scans for test ID attributes)
  - Text content matching (fuzzy text search with 80%+ similarity)
  - CSS hierarchy analysis (structural DOM analysis)
  - AI-powered analysis (Ollama integration)
- **⚡ Smart Retry Logic**: Handles timeouts and flaky tests automatically
- **💾 Healing Cache**: Caches successful healing to speed up subsequent runs
- **📈 Flakiness Detection**: Tracks and reports selector stability
- **🔌 Zero Dependencies**: Works standalone without external backend
- **⚙️ Flexible Configuration**: Environment variables, config files, or programmatic API
- **🐍 Python-Native**: Idiomatic Python with type hints and async/await support

## 📦 Installation

```bash
pip install playwright-healing
```

## 🎯 Quick Start

### Basic Usage with Pytest

```python
import pytest
from playwright.sync_api import Page
from playwright_healing import HealingPage

def test_login_flow(page: Page):
    healing_page = HealingPage(page)
    healing_page.goto('https://example.com/login')
    
    # These selectors will auto-heal if they break
    healing_page.fill('#username', 'user@test.com')
    healing_page.fill('#password', 'SecurePass123!')
    healing_page.click('button[type="submit"]')
    
    # Verify success
    assert healing_page.locator('.welcome-message').is_visible()
```

### Async Usage

```python
import pytest
from playwright.async_api import Page
from playwright_healing import AsyncHealingPage

@pytest.mark.asyncio
async def test_login_flow_async(page: Page):
    healing_page = AsyncHealingPage(page)
    await healing_page.goto('https://example.com/login')
    
    await healing_page.fill('#username', 'user@test.com')
    await healing_page.fill('#password', 'SecurePass123!')
    await healing_page.click('button[type="submit"]')
    
    assert await healing_page.locator('.welcome-message').is_visible()
```

## 🛠️ Configuration

```python
from playwright_healing import HealingConfig, configure_healing

configure_healing(
    strategies=['data-testid-recovery', 'ai-powered-analysis'],
    max_attempts=3,
    ollama_url='http://localhost:11434'
)
```

## 📚 Documentation

- [Full Documentation](./docs/)
- [API Reference](./docs/api.md)
- [Examples](./examples/)
- [TypeScript Version](../playwright-healing/) - For Node.js/TypeScript users

## 📝 License

MIT License - Copyright (c) 2024 Shifty AI

---

**Made with ❤️ by Shifty AI** | **Python is the perfect language for AI tooling** 🐍
