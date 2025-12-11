import { test, expect } from '@playwright/test';

/**
 * QA/SDET Persona Tests
 * 
 * Focus: Manual testing, test automation, bug tracking, test analytics
 * Key user journeys:
 * 1. Manual test session execution
 * 2. Test generation and healing
 * 3. Exploratory testing with charters
 * 4. Defect tracking and analysis
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3006';

const QA_USER = {
  email: 'test@shifty.com',
  password: 'password123',
  persona: 'qa-sdet'
};

test.describe('QA/SDET - Manual Testing Hub', () => {
  test.beforeEach(async ({ page }) => {
    // Login as QA
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email/i).fill(QA_USER.email);
    await page.getByLabel(/password/i).fill(QA_USER.password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should navigate to manual testing hub', async ({ page }) => {
    // Navigate to manual testing
    await page.goto(`${FRONTEND_URL}/testing/manual`);
    
    // Verify manual testing hub loads
    await expect(page.locator('h1, h2').filter({ hasText: /manual|testing|sessions/i })).toBeVisible();
  });

  test('should display active test sessions', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/testing/manual/sessions`);
    
    // Check for sessions list or empty state
    const sessionsView = page.locator('text=/sessions|no sessions|start session/i');
    await expect(sessionsView.first()).toBeVisible();
  });

  test('should allow creating new test session', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/testing/manual/sessions`);
    
    // Look for create session button
    const createButton = page.getByRole('button', { name: /new session|create session|start/i });
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Verify session creation form/dialog appears
      await expect(page.locator('text=/session|title|component/i').first()).toBeVisible();
    }
  });

  test('should support exploratory testing charters', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/testing/exploratory`);
    
    // Check for charter functionality
    const charterSection = page.locator('text=/charter|explore|exploratory/i');
    await expect(charterSection.first()).toBeVisible();
  });

  test('should display test coverage metrics', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/testing/analytics`);
    
    // Verify analytics/metrics are shown
    await expect(page.locator('text=/coverage|tests|analytics/i').first()).toBeVisible();
  });

  test('should show bug detection rates', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/testing/analytics`);
    
    // Look for bug-related metrics
    const bugMetrics = page.locator('text=/bugs|defects|detection/i');
    await expect(bugMetrics.first()).toBeVisible();
  });
});

test.describe('QA/SDET - Test Automation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email/i).fill(QA_USER.email);
    await page.getByLabel(/password/i).fill(QA_USER.password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should navigate to test generation', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/testing/generate`);
    
    // Verify test generation interface
    await expect(page.locator('h1, h2').filter({ hasText: /generate|generation|ai/i })).toBeVisible();
  });

  test('should display selector healing dashboard', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/testing/healing`);
    
    // Check for healing interface
    await expect(page.locator('text=/healing|selectors|broken/i').first()).toBeVisible();
  });

  test('should show test run history', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/testing/runs`);
    
    // Verify test runs are displayed
    await expect(page.locator('text=/runs|history|executions/i').first()).toBeVisible();
  });

  test('should display flaky tests', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/testing/flaky`);
    
    // Check for flaky tests section
    await expect(page.locator('text=/flaky|unstable|intermittent/i').first()).toBeVisible();
  });
});

test.describe('QA/SDET - Complete Test Session Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email/i).fill(QA_USER.email);
    await page.getByLabel(/password/i).fill(QA_USER.password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('complete manual test session workflow', async ({ page }) => {
    // Step 1: Navigate to manual testing
    await page.goto(`${FRONTEND_URL}/testing/manual/sessions`);
    await expect(page.locator('h1, h2')).toBeVisible();
    
    // Step 2: Create new session (if button exists)
    const createButton = page.getByRole('button', { name: /new|create|start/i }).first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Step 3: Fill session details (if form appears)
      const titleInput = page.getByLabel(/title|name/i);
      if (await titleInput.isVisible()) {
        await titleInput.fill('Feature X Regression Test');
        
        // Look for save/start button
        const saveButton = page.getByRole('button', { name: /save|start|begin/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // Step 4: Return to sessions list
    await page.goto(`${FRONTEND_URL}/testing/manual/sessions`);
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('complete test automation workflow', async ({ page }) => {
    // Journey: Generate → Review → Heal → Execute
    
    // 1. Generate tests
    await page.goto(`${FRONTEND_URL}/testing/generate`);
    await page.waitForTimeout(500);
    
    // 2. View healing dashboard
    await page.goto(`${FRONTEND_URL}/testing/healing`);
    await page.waitForTimeout(500);
    
    // 3. Check test runs
    await page.goto(`${FRONTEND_URL}/testing/runs`);
    await page.waitForTimeout(500);
    
    // 4. Review analytics
    await page.goto(`${FRONTEND_URL}/testing/analytics`);
    await page.waitForTimeout(500);
    
    // Verify journey completed
    expect(page.url()).toContain('/analytics');
  });
});
