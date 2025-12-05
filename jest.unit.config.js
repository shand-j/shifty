/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Test file discovery - only unit tests
  roots: ["<rootDir>/tests/unit"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],

  // TypeScript configuration
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.test.json",
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
    "^@shifty/shared$": "<rootDir>/packages/shared/src",
    "^@shifty/database$": "<rootDir>/packages/database/src",
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

  coverageDirectory: "coverage/unit",
  coverageReporters: ["text", "text-summary", "html", "lcov", "clover", "json"],

  // Test setup - use unit test setup (no service dependencies)
  setupFilesAfterEnv: ["<rootDir>/tests/unit/setup.ts"],

  // Test execution
  testTimeout: 10000,
  maxWorkers: "50%",
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
