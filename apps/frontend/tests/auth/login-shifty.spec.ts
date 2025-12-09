/**
 * Shifty-powered Login Tests
 * 
 * Integrates with Shifty platform for:
 * - Test result reporting
 * - Telemetry capture  
 * - Healing analytics
 */

import { test, expect, Page } from '@playwright/test';
import axios from 'axios';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3006';
const SHIFTY_API_URL = process.env.SHIFTY_API_URL || 'http://localhost:3000';
const SHIFTY_RUN_ID = process.env.SHIFTY_RUN_ID || 'local-dev';
const SHIFTY_TENANT_ID = process.env.SHIFTY_TENANT_ID || 'test-tenant';

const TEST_USER = {
  email: 'test@shifty.com',
  password: 'password123'
};

// Helper to report test events to Shifty
async function reportToShifty(event: string, data: any) {
  try {
    await axios.post(`${SHIFTY_API_URL}/api/v1/telemetry/events`, {
      eventType: event,
      runId: SHIFTY_RUN_ID,
      tenantId: SHIFTY_TENANT_ID,
      timestamp: new Date().toISOString(),
      attributes: data,
    }, {
      headers: { 'X-Tenant-ID': SHIFTY_TENANT_ID },
      timeout: 1000,
    });
  } catch (error) {
    // Silently fail telemetry to not block tests
    console.log(`[Shifty] Telemetry skipped: ${event}`);
  }
}

test.describe('Login Flow (Shifty-Integrated)', () => {
  let testStartTime: number;

  test.beforeEach(async ({ page }) => {
    testStartTime = Date.now();
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    await reportToShifty('test_started', {
      testName: test.info().title,
      url: page.url(),
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    const duration = Date.now() - testStartTime;
    const status = testInfo.status;
    
    // Take screenshot on failure
    if (status === 'failed' || status === 'timedOut') {
      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach('screenshot', {
        body: screenshot,
        contentType: 'image/png',
      });
    }

    await reportToShifty('test_completed', {
      testName: test.info().title,
      status,
      duration,
      retries: testInfo.retry,
    });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Fill credentials
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill(TEST_USER.password);
    
    // Click login
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // Wait for navigation
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Verify dashboard
    expect(page.url()).toContain('/dashboard');
    
    // Verify token
    const token = await page.evaluate(() => localStorage.getItem('shifty_token'));
    expect(token).toBeTruthy();
    expect(token).toContain('eyJ');
    
    await reportToShifty('login_success', {
      method: 'email_password',
      redirectUrl: page.url(),
    });
  });

  test('should display login form elements', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /log in|sign in/i })).toBeVisible();
  });

  test('should validate required email field', async ({ page }) => {
    // Try to submit without email
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // HTML5 validation should trigger
    const emailInput = page.getByLabel(/email/i);
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i);
    
    // Initially hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Find and click eye icon button
    const eyeButton = page.locator('button').filter({ has: page.locator('svg.lucide-eye, svg.lucide-eye-off') }).first();
    
    if (await eyeButton.isVisible()) {
      await eyeButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      await eyeButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });
});
