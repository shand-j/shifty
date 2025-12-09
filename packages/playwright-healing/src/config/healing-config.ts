import { HealingConfig } from '../core/healer';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Healing Configuration Manager
 * 
 * Supports configuration from:
 * 1. Environment variables
 * 2. Configuration file (healing.config.js)
 * 3. Programmatic API
 * 
 * Priority: Programmatic > Environment > Config File > Defaults
 */

/**
 * Default configuration
 */
const DEFAULT_CONFIG: HealingConfig = {
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

/**
 * Load configuration from environment variables
 */
function loadFromEnvironment(): Partial<HealingConfig> {
  const config: Partial<HealingConfig> = {};

  // HEALING_ENABLED
  if (process.env.HEALING_ENABLED !== undefined) {
    config.enabled = process.env.HEALING_ENABLED === 'true';
  }

  // HEALING_STRATEGIES
  if (process.env.HEALING_STRATEGIES) {
    config.strategies = process.env.HEALING_STRATEGIES.split(',').map(s => s.trim());
  }

  // HEALING_MAX_ATTEMPTS
  if (process.env.HEALING_MAX_ATTEMPTS) {
    const maxAttempts = parseInt(process.env.HEALING_MAX_ATTEMPTS, 10);
    if (!isNaN(maxAttempts) && maxAttempts > 0) {
      config.maxAttempts = maxAttempts;
    }
  }

  // HEALING_CACHE_ENABLED
  if (process.env.HEALING_CACHE_ENABLED !== undefined) {
    config.cacheHealing = process.env.HEALING_CACHE_ENABLED === 'true';
  }

  // OLLAMA_URL
  if (process.env.OLLAMA_URL) {
    config.ollama = {
      ...(config.ollama || DEFAULT_CONFIG.ollama!),
      url: process.env.OLLAMA_URL
    };
  }

  // OLLAMA_MODEL
  if (process.env.OLLAMA_MODEL) {
    config.ollama = {
      ...(config.ollama || DEFAULT_CONFIG.ollama!),
      model: process.env.OLLAMA_MODEL
    };
  }

  // OLLAMA_TIMEOUT
  if (process.env.OLLAMA_TIMEOUT) {
    const timeout = parseInt(process.env.OLLAMA_TIMEOUT, 10);
    if (!isNaN(timeout) && timeout > 0) {
      config.ollama = {
        ...(config.ollama || DEFAULT_CONFIG.ollama!),
        timeout
      };
    }
  }

  // HEALING_RETRY_ON_TIMEOUT
  if (process.env.HEALING_RETRY_ON_TIMEOUT !== undefined) {
    config.retry = {
      ...(config.retry || DEFAULT_CONFIG.retry!),
      onTimeout: process.env.HEALING_RETRY_ON_TIMEOUT === 'true'
    };
  }

  // HEALING_RETRY_ON_FLAKINESS
  if (process.env.HEALING_RETRY_ON_FLAKINESS !== undefined) {
    config.retry = {
      ...(config.retry || DEFAULT_CONFIG.retry!),
      onFlakiness: process.env.HEALING_RETRY_ON_FLAKINESS === 'true'
    };
  }

  // HEALING_MAX_RETRIES
  if (process.env.HEALING_MAX_RETRIES) {
    const maxRetries = parseInt(process.env.HEALING_MAX_RETRIES, 10);
    if (!isNaN(maxRetries) && maxRetries >= 0) {
      config.retry = {
        ...(config.retry || DEFAULT_CONFIG.retry!),
        maxRetries
      };
    }
  }

  // HEALING_INITIAL_BACKOFF
  if (process.env.HEALING_INITIAL_BACKOFF) {
    const backoff = parseInt(process.env.HEALING_INITIAL_BACKOFF, 10);
    if (!isNaN(backoff) && backoff > 0) {
      config.retry = {
        ...(config.retry || DEFAULT_CONFIG.retry!),
        initialBackoff: backoff
      };
    }
  }

  // HEALING_TELEMETRY_ENABLED
  if (process.env.HEALING_TELEMETRY_ENABLED !== undefined) {
    config.telemetry = {
      ...(config.telemetry || DEFAULT_CONFIG.telemetry!),
      enabled: process.env.HEALING_TELEMETRY_ENABLED === 'true'
    };
  }

  // HEALING_LOG_LEVEL
  if (process.env.HEALING_LOG_LEVEL) {
    const level = process.env.HEALING_LOG_LEVEL.toLowerCase();
    if (['debug', 'info', 'warn', 'error'].includes(level)) {
      config.telemetry = {
        ...(config.telemetry || DEFAULT_CONFIG.telemetry!),
        logLevel: level as 'debug' | 'info' | 'warn' | 'error'
      };
    }
  }

  return config;
}

/**
 * Load configuration from file
 */
function loadFromFile(configPath?: string): Partial<HealingConfig> {
  // Try to find config file
  const possiblePaths = [
    configPath,
    path.join(process.cwd(), 'healing.config.js'),
    path.join(process.cwd(), 'healing.config.json'),
    path.join(process.cwd(), '.healingrc.js'),
    path.join(process.cwd(), '.healingrc.json')
  ].filter(Boolean) as string[];

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        console.log(`[HealingConfig] Loading configuration from: ${filePath}`);
        
        if (filePath.endsWith('.json')) {
          const content = fs.readFileSync(filePath, 'utf-8');
          return JSON.parse(content);
        } else if (filePath.endsWith('.js')) {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const config = require(filePath);
          return config.default || config;
        }
      }
    } catch (error) {
      console.warn(`[HealingConfig] Failed to load config from ${filePath}:`, error);
    }
  }

  return {};
}

/**
 * Merge configurations with proper precedence
 */
function mergeConfigs(...configs: Array<Partial<HealingConfig>>): HealingConfig {
  const merged = { ...DEFAULT_CONFIG };

  for (const config of configs) {
    if (config.enabled !== undefined) merged.enabled = config.enabled;
    if (config.strategies) merged.strategies = config.strategies;
    if (config.maxAttempts !== undefined) merged.maxAttempts = config.maxAttempts;
    if (config.cacheHealing !== undefined) merged.cacheHealing = config.cacheHealing;

    if (config.ollama) {
      merged.ollama = { ...merged.ollama!, ...config.ollama };
    }

    if (config.retry) {
      merged.retry = { ...merged.retry!, ...config.retry };
    }

    if (config.telemetry) {
      merged.telemetry = { ...merged.telemetry!, ...config.telemetry };
    }
  }

  return merged;
}

/**
 * Load complete configuration
 * 
 * @param configPath - Optional path to config file
 * @returns Complete HealingConfig with all sources merged
 */
export function loadConfig(configPath?: string): HealingConfig {
  const fileConfig = loadFromFile(configPath);
  const envConfig = loadFromEnvironment();

  // Merge: Default < File < Environment
  return mergeConfigs(DEFAULT_CONFIG, fileConfig, envConfig);
}

/**
 * Validate configuration
 */
export function validateConfig(config: HealingConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate strategies
  const validStrategies = [
    'data-testid-recovery',
    'text-content-matching',
    'css-hierarchy-analysis',
    'ai-powered-analysis'
  ];

  for (const strategy of config.strategies) {
    if (!validStrategies.includes(strategy)) {
      errors.push(`Invalid strategy: ${strategy}`);
    }
  }

  // Validate maxAttempts
  if (config.maxAttempts < 1 || config.maxAttempts > 10) {
    errors.push('maxAttempts must be between 1 and 10');
  }

  // Validate Ollama config
  if (config.ollama) {
    if (!config.ollama.url.startsWith('http')) {
      errors.push('Ollama URL must start with http:// or https://');
    }

    if (config.ollama.timeout < 1000 || config.ollama.timeout > 120000) {
      errors.push('Ollama timeout must be between 1000ms and 120000ms');
    }
  }

  // Validate retry config
  if (config.retry) {
    if (config.retry.maxRetries < 0 || config.retry.maxRetries > 10) {
      errors.push('maxRetries must be between 0 and 10');
    }

    if (config.retry.initialBackoff < 100 || config.retry.initialBackoff > 10000) {
      errors.push('initialBackoff must be between 100ms and 10000ms');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create a sample configuration file
 */
export function createSampleConfig(filePath: string): void {
  const sampleConfig = `module.exports = {
  // Enable/disable healing globally
  enabled: true,

  // Healing strategies to use (in order of priority)
  strategies: [
    'data-testid-recovery',
    'text-content-matching',
    'css-hierarchy-analysis',
    'ai-powered-analysis'
  ],

  // Maximum healing attempts per selector
  maxAttempts: 3,

  // Enable caching of healed selectors
  cacheHealing: true,

  // Ollama AI configuration
  ollama: {
    url: 'http://localhost:11434',
    model: 'llama3.1:8b',
    timeout: 30000
  },

  // Retry configuration
  retry: {
    onTimeout: true,
    onFlakiness: true,
    maxRetries: 2,
    initialBackoff: 1000
  },

  // Telemetry configuration
  telemetry: {
    enabled: true,
    logLevel: 'info' // 'debug' | 'info' | 'warn' | 'error'
  }
};
`;

  fs.writeFileSync(filePath, sampleConfig, 'utf-8');
  console.log(`[HealingConfig] Sample configuration created at: ${filePath}`);
}

/**
 * Environment variable reference
 */
export const ENV_VAR_REFERENCE = {
  HEALING_ENABLED: 'Enable/disable healing (true/false)',
  HEALING_STRATEGIES: 'Comma-separated list of strategies',
  HEALING_MAX_ATTEMPTS: 'Maximum healing attempts (number)',
  HEALING_CACHE_ENABLED: 'Enable selector caching (true/false)',
  OLLAMA_URL: 'Ollama API URL',
  OLLAMA_MODEL: 'Ollama model name',
  OLLAMA_TIMEOUT: 'Ollama request timeout (ms)',
  HEALING_RETRY_ON_TIMEOUT: 'Retry on timeout errors (true/false)',
  HEALING_RETRY_ON_FLAKINESS: 'Retry on flaky tests (true/false)',
  HEALING_MAX_RETRIES: 'Maximum retry attempts (number)',
  HEALING_INITIAL_BACKOFF: 'Initial backoff time (ms)',
  HEALING_TELEMETRY_ENABLED: 'Enable telemetry (true/false)',
  HEALING_LOG_LEVEL: 'Log level (debug/info/warn/error)'
};
