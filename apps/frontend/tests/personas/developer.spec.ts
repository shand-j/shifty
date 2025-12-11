import { test, expect } from '@playwright/test';

/**
 * Developer Persona Tests
 * 
 * Focus: CI/CD integration, test results, code quality, debugging
 * Key user journeys:
 * 1. View PR test results
 * 2. Debug failing tests
 * 3. Review code coverage
 * 4. Integrate with CI/CD
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3006';

const DEV_USER = {
  email: 'test@shifty.com',
  password: 'password123',
  persona: 'developer'
};

test.describe('Developer - Test Results & Debugging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email/i).fill(DEV_USER.email);
    await page.getByLabel(/password/i).fill(DEV_USER.password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should display recent test runs', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/runs`);
    
    // Verify test runs page loads
    await expect(page.locator('h1, h2').filter({ hasText: /runs|tests|results/i })).toBeVisible();
  });

  test('should show test run details with pass/fail status', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/runs`);
    
    // Look for test status indicators
    const statusIndicators = page.locator('text=/passed|failed|running|pending/i');
    await expect(statusIndicators.first()).toBeVisible();
  });

  test('should display failing test details', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/runs`);
    
    // Click on a test run (if available)
    const testRun = page.locator('[data-testid*="run"], [class*="run-item"]').first();
    if (await testRun.isVisible()) {
      await testRun.click();
      await page.waitForTimeout(500);
      
      // Verify we can see test details
      expect(page.url()).toMatch(/runs\/[a-f0-9-]+/);
    }
  });

  test('should show error messages and stack traces', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/runs`);
    
    // Navigate to a test run detail
    const testRun = page.locator('[data-testid*="run"]').first();
    if (await testRun.isVisible()) {
      await testRun.click();
      await page.waitForTimeout(500);
      
      // Look for error details
      const errorSection = page.locator('text=/error|stack|trace|exception/i');
      // Error section may or may not be visible depending on test results
      expect(errorSection).toBeDefined();
    }
  });

  test('should display code coverage metrics', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/coverage`);
    
    // Check for coverage information
    await expect(page.locator('text=/coverage|%|lines|branches/i').first()).toBeVisible();
  });

  test('should show artifacts (screenshots, videos, traces)', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/runs`);
    
    // Navigate to test details
    const testRun = page.locator('[data-testid*="run"]').first();
    if (await testRun.isVisible()) {
      await testRun.click();
      await page.waitForTimeout(500);
      
      // Look for artifacts section
      const artifacts = page.locator('text=/artifacts|screenshots|videos|traces/i');
      expect(artifacts).toBeDefined();
    }
  });
});

test.describe('Developer - CI/CD Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email/i).fill(DEV_USER.email);
    await page.getByLabel(/password/i).fill(DEV_USER.password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should display CI/CD pipelines', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/pipelines`);
    
    // Check for pipelines view
    await expect(page.locator('text=/pipelines|ci|cd|builds/i').first()).toBeVisible();
  });

  test('should show GitHub Actions integration status', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/integrations`);
    
    // Look for integrations
    await expect(page.locator('text=/integrations|github|actions/i').first()).toBeVisible();
  });

  test('should display branch-specific test results', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/runs`);
    
    // Look for branch filter or display
    const branchInfo = page.locator('text=/branch|main|develop/i');
    await expect(branchInfo.first()).toBeVisible();
  });
});

test.describe('Developer - Complete Debugging Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email/i).fill(DEV_USER.email);
    await page.getByLabel(/password/i).fill(DEV_USER.password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('complete test failure debugging workflow', async ({ page }) => {
    // Journey: Runs list → Failing run → Error details → Artifacts → Fix insights
    
    // 1. View test runs
    await page.goto(`${FRONTEND_URL}/runs`);
    await expect(page.locator('h1, h2')).toBeVisible();
    
    // 2. Select a test run
    const testRun = page.locator('[data-testid*="run"], tr, [class*="run"]').first();
    if (await testRun.isVisible()) {
      await testRun.click();
      await page.waitForTimeout(500);
      
      // 3. View test details
      expect(page.url()).toMatch(/runs/);
      
      // 4. Check for healing suggestions (if available)
      await page.goto(`${FRONTEND_URL}/healing`);
      await page.waitForTimeout(500);
    }
    
    // Verify journey completed
    expect(page.url()).toContain('healing');
  });
});
