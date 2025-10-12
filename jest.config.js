/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Test file discovery
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],

  // TypeScript configuration
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.json",
      },
    ],
  },

  // Module resolution
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@tests/(.*)$": "<rootDir>/tests/$1",
    "^@services/(.*)$": "<rootDir>/services/$1",
    "^@apps/(.*)$": "<rootDir>/apps/$1",
    "^@packages/(.*)$": "<rootDir>/packages/$1",
  },

  // Coverage configuration
  collectCoverageFrom: [
    "services/**/*.{ts,js}",
    "apps/**/*.{ts,js}",
    "packages/**/*.{ts,js}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/*.test.ts",
    "!**/*.spec.ts",
    "!**/tests/**",
  ],

  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "html", "lcov", "clover", "json"],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Test setup
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

  // Test execution
  testTimeout: 30000,
  maxWorkers: 1,
  forceExit: true,
  detectOpenHandles: true,

  // Watch mode configuration
  watchPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/coverage/",
    "<rootDir>/test-results/",
  ],

  // Verbose output for better debugging
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Error handling
  errorOnDeprecated: true,

  // Reporters for better test output
  reporters: ["default"],
};
