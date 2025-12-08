# Playwright Healing - Python Package

This directory contains the Python implementation of the autonomous healing engine for Playwright.

## Why Python?

As noted by @shand-j: **"AI tooling should absolutely use Python"**

Python is the de facto standard for:
- 🤖 AI/ML development and integration
- 🧪 Data science and analysis
- 📊 Scientific computing
- 🔬 Research and experimentation

While TypeScript is ideal for UI and backend services, Python is the natural choice for AI-powered tooling like this healing engine.

## Package Structure

```
playwright-healing-python/
├── playwright_healing/          # Main package
│   ├── __init__.py             # Package exports
│   ├── config.py               # Configuration
│   ├── engine.py               # Core healing engine
│   ├── types.py                # Type definitions
│   ├── strategies.py           # Healing strategies
│   └── page.py                 # Page wrapper
├── tests/                      # Test suite
├── examples/                   # Usage examples
├── docs/                       # Documentation
├── pyproject.toml              # Package metadata
├── LICENSE                     # MIT license
└── README.md                   # Package documentation
```

## Installation

```bash
pip install playwright-healing
```

## Quick Start

```python
from playwright.sync_api import sync_playwright
from playwright_healing import HealingPage

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    
    healing_page = HealingPage(page)
    healing_page.goto('https://example.com')
    healing_page.click('#submit-button')  # Auto-heals if broken
```

## Key Features

- ✅ **Pure Python** - Idiomatic Python with type hints
- ✅ **Async/Await Support** - Both sync and async APIs
- ✅ **Pytest Integration** - Works seamlessly with pytest
- ✅ **AI-Powered** - Ollama integration for intelligent healing
- ✅ **Zero External Backend** - Works completely offline
- ✅ **Levenshtein Distance** - Real fuzzy matching algorithms

## Differences from TypeScript Version

| Feature | TypeScript | Python |
|---------|-----------|--------|
| Language | TypeScript | Python |
| Runtime | Node.js | CPython |
| Testing Framework | Playwright Test | Pytest |
| Async Support | async/await | async/await |
| Type Safety | TypeScript types | Type hints (mypy) |
| Package Manager | npm | pip/poetry |
| AI Libraries | Limited | Rich ecosystem |

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest tests/

# Type checking
mypy playwright_healing/

# Code formatting
black playwright_healing/
isort playwright_healing/

# Linting
flake8 playwright_healing/
```

## Publishing

```bash
# Build package
python -m build

# Upload to PyPI
python -m twine upload dist/*
```

## Why Both TypeScript and Python?

1. **TypeScript** - For developers working in Node.js/JavaScript ecosystems
2. **Python** - For data scientists, ML engineers, and Python-first teams

Both packages share the same core healing strategies but are optimized for their respective ecosystems.
