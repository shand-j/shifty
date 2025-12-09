# @shifty/playwright-healing

🔧 **Autonomous selector healing for Playwright tests** - Never let a changed selector break your tests again.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Playwright](https://img.shields.io/badge/playwright-%3E%3D1.40.0-green)](https://playwright.dev)

## 🎯 Features

- **🤖 AI-Powered Analysis** - Uses Ollama (llama3.1:8b) for intelligent selector suggestions
- **🔍 Multiple Healing Strategies** - 4 complementary strategies for maximum success rate
- **⚡ Smart Caching** - Remembers healed selectors to speed up subsequent runs
- **📊 Flakiness Detection** - Automatically identifies and handles flaky selectors
- **🔄 Intelligent Retry Logic** - Exponential backoff with configurable retry policies
- **🎨 Zero Dependencies** - Only requires Playwright as a peer dependency
- **📈 Detailed Statistics** - Track healing success rates and strategy effectiveness
- **⚙️ Flexible Configuration** - Environment variables, config files, or programmatic API

## 📦 Installation

```bash
npm install @shifty/playwright-healing
```

### Prerequisites

- Node.js >= 18.0.0
- Playwright >= 1.40.0
- (Optional) Ollama with llama3.1:8b model for AI-powered healing

## 🚀 Quick Start

### Basic Usage

Replace Playwright's `test` with `healingTest`:

```typescript
import { healingTest as test, expect } from '@shifty/playwright-healing';

test('login flow with auto-healing', async ({ healingPage }) => {
  await healingPage.goto('https://example.com/login');
  
  // These selectors will automatically heal if they break
  await healingPage.fill('[data-testid="username"]', 'user@example.com');
  await healingPage.fill('[data-testid="password"]', 'SecurePass123!');
  await healingPage.click('button[type="submit"]');
  
  // Verify login
  await expect(healingPage.locator('.welcome-message')).toBeVisible();
  
  // Get healing statistics
  const stats = healingPage.getHealingStats();
  console.log('Healing stats:', stats);
});
```

### Using HealingPage Directly

```typescript
import { test } from '@playwright/test';
import { createHealingPage } from '@shifty/playwright-healing';

test('my test', async ({ page }) => {
  const healingPage = createHealingPage(page, {
    strategies: ['data-testid-recovery', 'text-content-matching']
  });
  
  await healingPage.goto('https://example.com');
  await healingPage.click('#submit-btn');
});
```

## ⚙️ Configuration

### Method 1: Environment Variables

```bash
# Enable/disable healing
export HEALING_ENABLED=true

# Select strategies (comma-separated)
export HEALING_STRATEGIES=data-testid-recovery,text-content-matching,css-hierarchy-analysis,ai-powered-analysis

# Healing settings
export HEALING_MAX_ATTEMPTS=3
export HEALING_CACHE_ENABLED=true

# Ollama configuration
export OLLAMA_URL=http://localhost:11434
export OLLAMA_MODEL=llama3.1:8b
export OLLAMA_TIMEOUT=30000

# Retry configuration
export HEALING_RETRY_ON_TIMEOUT=true
export HEALING_RETRY_ON_FLAKINESS=true
export HEALING_MAX_RETRIES=2
export HEALING_INITIAL_BACKOFF=1000

# Telemetry
export HEALING_TELEMETRY_ENABLED=true
export HEALING_LOG_LEVEL=info
```

### Method 2: Configuration File

Create `healing.config.js` in your project root:

```javascript
module.exports = {
  enabled: true,
  strategies: [
    'data-testid-recovery',
    'text-content-matching',
    'css-hierarchy-analysis',
    'ai-powered-analysis'
  ],
  maxAttempts: 3,
  cacheHealing: true,
  ollama: {
    url: 'http://localhost:11434',
    model: 'llama3.1:8b',
    timeout: 30000
  },
  retry: {
    onTimeout: true,
    onFlakiness: true,
    maxRetries: 2,
    initialBackoff: 1000
  },
  telemetry: {
    enabled: true,
    logLevel: 'info'
  }
};
```

Generate a sample config:

```typescript
import { createSampleConfig } from '@shifty/playwright-healing';

createSampleConfig('./healing.config.js');
```

### Method 3: Programmatic API

```typescript
import { createHealingPage } from '@shifty/playwright-healing';

const healingPage = createHealingPage(page, {
  enabled: true,
  strategies: ['data-testid-recovery', 'text-content-matching'],
  maxAttempts: 5,
  cacheHealing: true,
  ollama: {
    url: 'http://localhost:11434',
    model: 'llama3.1:8b',
    timeout: 30000
  },
  retry: {
    onTimeout: true,
    onFlakiness: true,
    maxRetries: 3,
    initialBackoff: 500
  },
  telemetry: {
    enabled: true,
    logLevel: 'debug'
  }
});
```

## 🎯 Healing Strategies

### 1. Data Test ID Recovery

Finds similar `data-testid` attributes using Levenshtein distance and handles different naming conventions.

**Best for:** Test-specific attributes that may have been renamed
**Confidence:** 70-100%

```typescript
// Original: [data-testid="submit-btn"]
// Healed to: [data-testid="submit-button"] (95% confidence)
```

### 2. Text Content Matching

Matches elements by visible text using fuzzy matching (80%+ similarity threshold).

**Best for:** Buttons, links, and labels with consistent text
**Confidence:** 80-100%

```typescript
// Original: text="Submit Form"
// Healed to: button:has-text("Submit Form") (92% confidence)
```

### 3. CSS Hierarchy Analysis

Generates 10 different alternative selectors based on DOM structure and CSS classes.

**Best for:** Complex selectors that rely on document structure
**Confidence:** 60-100%

```typescript
// Original: .form-container .submit-btn
// Healed to: #main-form > button.btn-primary (85% confidence)
```

### 4. AI-Powered Analysis

Uses Ollama's llama3.1:8b model for semantic understanding and intelligent suggestions.

**Best for:** Complex scenarios requiring contextual understanding
**Confidence:** 60-95%

```typescript
// AI analyzes page context and suggests semantically equivalent selectors
// Original: .old-class-name
// Healed to: [role="button"][aria-label="Submit"] (88% confidence)
```

## 📚 Examples

### Example 1: E-commerce Checkout Flow

```typescript
import { healingTest as test, expect } from '@shifty/playwright-healing';

test('complete checkout', async ({ healingPage }) => {
  await healingPage.goto('https://shop.example.com');
  
  // Add item to cart
  await healingPage.click('[data-testid="add-to-cart"]');
  await healingPage.click('[data-testid="cart-icon"]');
  
  // Proceed to checkout
  await healingPage.click('text="Proceed to Checkout"');
  
  // Fill shipping info
  await healingPage.fill('#shipping-name', 'John Doe');
  await healingPage.fill('#shipping-address', '123 Main St');
  await healingPage.fill('#shipping-city', 'Boston');
  
  // Submit order
  await healingPage.click('button[type="submit"]');
  
  // Verify success
  await expect(healingPage.locator('.success-message')).toBeVisible();
});
```

### Example 2: Dynamic Content

```typescript
import { healingTest as test, expect } from '@shifty/playwright-healing';

test('handle dynamic selectors', async ({ healingPage }) => {
  await healingPage.goto('https://app.example.com/dashboard');
  
  // These selectors might have dynamic IDs or classes
  await healingPage.click('[data-testid="user-menu"]');
  await healingPage.click('text="Settings"');
  
  // Healing will find the correct element even if structure changes
  await healingPage.fill('.email-input', 'newemail@example.com');
  await healingPage.click('.save-button');
  
  // Get flakiness report
  const isFlaky = healingPage.healingEngine.isFlaky('.save-button');
  console.log('Is save button flaky?', isFlaky);
});
```

### Example 3: Custom Strategy Configuration

```typescript
import { healingTest as test } from '@shifty/playwright-healing';

test.use({
  healingConfig: {
    enabled: true,
    strategies: ['data-testid-recovery', 'ai-powered-analysis'], // Only use 2 strategies
    maxAttempts: 5,
    cacheHealing: true
  }
});

test('with custom config', async ({ healingPage }) => {
  await healingPage.goto('https://example.com');
  await healingPage.click('#dynamic-button');
});
```

### Example 4: Healing Statistics

```typescript
import { healingTest as test } from '@shifty/playwright-healing';

test('view healing statistics', async ({ healingPage }) => {
  await healingPage.goto('https://example.com');
  
  await healingPage.click('[data-testid="button1"]');
  await healingPage.click('[data-testid="button2"]');
  await healingPage.click('[data-testid="button3"]');
  
  // Get detailed statistics
  const stats = healingPage.getHealingStats();
  
  console.log('Total attempts:', stats.totalAttempts);
  console.log('Successful heals:', stats.successfulHeals);
  console.log('Success rate:', (stats.successfulHeals / stats.totalAttempts * 100).toFixed(1) + '%');
  console.log('Average confidence:', stats.averageConfidence.toFixed(1) + '%');
  console.log('Average heal time:', stats.averageHealTime.toFixed(0) + 'ms');
  console.log('Strategy usage:', Array.from(stats.strategyUsage.entries()));
});
```

## 🔧 API Reference

### HealingPage

```typescript
class HealingPage {
  // Create locator with auto-healing
  locator(selector: string): Locator;
  
  // Navigation
  goto(url: string, options?: any): Promise<any>;
  
  // Interactions with auto-healing
  click(selector: string, options?: any): Promise<void>;
  fill(selector: string, value: string, options?: any): Promise<void>;
  type(selector: string, text: string, options?: any): Promise<void>;
  
  // Queries with auto-healing
  textContent(selector: string, options?: any): Promise<string | null>;
  isVisible(selector: string, options?: any): Promise<boolean>;
  waitForSelector(selector: string, options?: any): Promise<any>;
  
  // Statistics and management
  getHealingStats(): HealingStats;
  clearSelectorCache(): void;
  
  // Access to underlying objects
  get underlyingPage(): Page;
  get healingEngine(): HealingEngine;
}
```

### HealingEngine

```typescript
class HealingEngine {
  constructor(config?: Partial<HealingConfig>);
  
  // Main healing method
  heal(page: Page, selector: string): Promise<HealingResult>;
  
  // Management
  runHealthChecks(page: Page): Promise<Map<string, boolean>>;
  isFlaky(selector: string): boolean;
  getStats(): HealingStats;
  resetStats(): void;
  clearCache(): void;
  clearFlakinessRecords(): void;
  
  // Configuration
  getConfig(): HealingConfig;
  updateConfig(config: Partial<HealingConfig>): void;
}
```

### Configuration Types

```typescript
interface HealingConfig {
  enabled: boolean;
  strategies: string[];
  maxAttempts: number;
  cacheHealing: boolean;
  ollama?: {
    url: string;
    model: string;
    timeout: number;
  };
  retry?: {
    onTimeout: boolean;
    onFlakiness: boolean;
    maxRetries: number;
    initialBackoff: number;
  };
  telemetry?: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

interface HealingResult {
  success: boolean;
  selector: string;
  confidence: number;
  strategy: string;
  reasoning?: string;
  alternatives?: Array<{ selector: string; confidence: number }>;
  timestamp: number;
}

interface HealingStats {
  totalAttempts: number;
  successfulHeals: number;
  failedHeals: number;
  cacheHits: number;
  strategyUsage: Map<string, number>;
  averageConfidence: number;
  averageHealTime: number;
}
```

## 🐛 Troubleshooting

### Ollama Not Available

If AI-powered healing isn't working:

1. Install Ollama: https://ollama.ai
2. Pull the model: `ollama pull llama3.1:8b`
3. Ensure Ollama is running: `ollama serve`
4. Check the URL in config: default is `http://localhost:11434`

### Healing Not Working

1. Check if healing is enabled: `HEALING_ENABLED=true`
2. Verify strategies are configured
3. Enable debug logging: `HEALING_LOG_LEVEL=debug`
4. Check health status: `healingPage.healingEngine.runHealthChecks(page)`

### Performance Issues

1. Disable AI strategy if Ollama is slow: `strategies: ['data-testid-recovery', 'text-content-matching', 'css-hierarchy-analysis']`
2. Reduce max attempts: `maxAttempts: 2`
3. Enable caching: `cacheHealing: true`
4. Lower retry count: `maxRetries: 1`

## 📊 Best Practices

1. **Use stable selectors first** - `data-testid` attributes are most reliable
2. **Enable caching** - Speeds up tests significantly for repeated selectors
3. **Monitor statistics** - Track healing success rates to identify problematic selectors
4. **Configure for your environment** - Adjust strategies based on your app's structure
5. **Use AI sparingly** - AI healing is powerful but slower; use as fallback
6. **Set appropriate timeouts** - Allow enough time for healing to complete

## 🤝 Contributing

Contributions are welcome! This package is part of the Shifty platform.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## 📄 License

MIT License - see the LICENSE file for details.

## 🔗 Links

- **GitHub**: https://github.com/shifty-ai/shifty
- **Issues**: https://github.com/shifty-ai/shifty/issues
- **Playwright**: https://playwright.dev
- **Ollama**: https://ollama.ai

## 🙏 Acknowledgments

Built with ❤️ by the Shifty team as part of the Shifty AI-powered testing platform.

---

**Need help?** Open an issue on GitHub or check our documentation.
