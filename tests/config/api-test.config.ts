export const TEST_CONFIG = {
  // Service ports
  PORTS: {
    API_GATEWAY: 3000,
    TENANT_MANAGER: 3001,
    AUTH_SERVICE: 3002,
    AI_ORCHESTRATOR: 3003,
    TEST_GENERATOR: 3004,
    HEALING_ENGINE: 3005,
  },

  // Service base URLs
  SERVICES: {
    API_GATEWAY: 'http://localhost:3000',
    TENANT_MANAGER: 'http://localhost:3001',
    AUTH_SERVICE: 'http://localhost:3002',
    AI_ORCHESTRATOR: 'http://localhost:3003',
    TEST_GENERATOR: 'http://localhost:3004',
    HEALING_ENGINE: 'http://localhost:3005',
  },

  // Test timeouts
  TIMEOUTS: {
    STANDARD: 10000,
    AI_OPERATION: 30000,
    SERVICE_STARTUP: 60000,
    EXTENDED: 60000,
  },

  // Test data
  DEFAULT_USER: {
    email: 'test@shifty.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    tenantName: 'Test Company',
  },

  // AI model names
  AI_MODELS: {
    LLAMA: 'llama3.1:8b',
    CODELLAMA: 'codellama:7b',
  },

  // Expected service names
  SERVICE_NAMES: {
    API_GATEWAY: 'api-gateway',
    TENANT_MANAGER: 'tenant-manager',
    AUTH_SERVICE: 'auth-service',
    AI_ORCHESTRATOR: 'ai-orchestrator',
    TEST_GENERATOR: 'test-generator',
    HEALING_ENGINE: 'healing-engine',
  },

  // Test scenarios
  TEST_SCENARIOS: {
    VALID_TEST_DESCRIPTION: 'Test login functionality with valid credentials and verify dashboard loads',
    VALID_PAGE_URL: 'https://example.com/login',
    BROKEN_SELECTOR: '#broken-submit-btn',
    HEALING_STRATEGIES: [
      'data-testid-recovery',
      'text-content-matching',
      'css-hierarchy-analysis',
      'ai-powered-analysis',
    ],
  },
};