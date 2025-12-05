// Unit test setup - no service dependencies
import { beforeAll, afterAll, jest } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console output during tests unless DEBUG is set
  if (!process.env.DEBUG) {
    console.log = jest.fn();
    console.warn = jest.fn();
    // Keep console.error for test debugging
    // console.error = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Extend expect with custom matchers
expect.extend({
  toStartWith(received: string, expected: string) {
    const pass = received.startsWith(expected);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to start with ${expected}`
          : `expected ${received} to start with ${expected}`,
    };
  },
  toEndWith(received: string, expected: string) {
    const pass = received.endsWith(expected);
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to end with ${expected}`
          : `expected ${received} to end with ${expected}`,
    };
  },
});

// TypeScript declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toStartWith(expected: string): R;
      toEndWith(expected: string): R;
    }
  }
}

export {};
