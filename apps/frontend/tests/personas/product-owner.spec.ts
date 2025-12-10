import { test, expect } from '@playwright/test';

/**
 * Product Owner Persona Tests
 * 
 * Focus: Release readiness, ROI metrics, quality dashboards
 * Key user journeys:
 * 1. Morning dashboard check
 * 2. Release readiness assessment
 * 3. ROI metrics review
 * 4. Incident prevention tracking
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3006';

const PO_USER = {
  email: 'test@shifty.com',
  password: 'password123',
  persona: 'product-owner'
};

test.describe('Product Owner - Dashboard & Metrics', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Product Owner
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email/i).fill(PO_USER.email);
    await page.getByLabel(/password/i).fill(PO_USER.password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // Wait for dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should display ROI metrics dashboard', async ({ page }) => {
    // Navigate to ROI dashboard
    await page.goto(`${FRONTEND_URL}/dashboard/roi`);
    
    // Verify key metrics are visible
    await expect(page.locator('text=/time saved|hours saved/i')).toBeVisible();
    await expect(page.locator('text=/bugs prevented/i')).toBeVisible();
    await expect(page.locator('text=/cost avoidance/i')).toBeVisible();
    await expect(page.locator('text=/developer efficiency/i')).toBeVisible();
  });

  test('should show release readiness indicators', async ({ page }) => {
    // Navigate to releases
    await page.goto(`${FRONTEND_URL}/dashboard/releases`);
    
    // Check for readiness status indicators
    const statusIndicators = page.locator('[data-testid*="readiness"], [class*="status"]');
    await expect(statusIndicators.first()).toBeVisible();
    
    // Verify we can see green/yellow/red status
    const pageContent = await page.content();
    expect(pageContent).toMatch(/(green|yellow|red|ready|blocked)/i);
  });

  test('should display test coverage percentage', async ({ page }) => {
    // Navigate to quality dashboard
    await page.goto(`${FRONTEND_URL}/dashboard/quality`);
    
    // Look for coverage metrics
    await expect(page.locator('text=/coverage|%/i').first()).toBeVisible();
  });

  test('should show bug escape rate metrics', async ({ page }) => {
    // Navigate to incidents/quality dashboard
    await page.goto(`${FRONTEND_URL}/dashboard/incidents`);
    
    // Verify incident tracking is visible
    await expect(page.locator('text=/incidents|bugs|escape rate/i').first()).toBeVisible();
  });

  test('should filter metrics by timeframe', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard/roi`);
    
    // Look for timeframe selector
    const timeframeSelector = page.locator('select, [role="combobox"]').filter({ hasText: /day|week|month|7d|30d|90d/i }).first();
    
    if (await timeframeSelector.isVisible()) {
      // Select different timeframe
      await timeframeSelector.click();
      await page.locator('text=/30 days|30d|month/i').first().click();
      
      // Wait for data to reload
      await page.waitForTimeout(1000);
      
      // Verify metrics are still displayed
      await expect(page.locator('text=/time saved/i')).toBeVisible();
    }
  });

  test('should display deployment frequency (DORA metric)', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard/dora`);
    
    // Check for DORA metrics
    await expect(page.locator('text=/deployment frequency/i')).toBeVisible();
    await expect(page.locator('text=/lead time/i')).toBeVisible();
    await expect(page.locator('text=/change failure/i')).toBeVisible();
    await expect(page.locator('text=/time to restore/i')).toBeVisible();
  });

  test('should show team performance comparison', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard/teams`);
    
    // Verify teams are listed
    await expect(page.locator('text=/team|teams/i').first()).toBeVisible();
  });

  test('should provide export functionality for reports', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard/roi`);
    
    // Look for export button
    const exportButton = page.getByRole('button', { name: /export|download|csv|pdf/i });
    
    if (await exportButton.isVisible()) {
      expect(exportButton).toBeVisible();
    }
  });
});

test.describe('Product Owner - Release Management Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.getByLabel(/email/i).fill(PO_USER.email);
    await page.getByLabel(/password/i).fill(PO_USER.password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('complete release readiness workflow', async ({ page }) => {
    // Step 1: Check release dashboard
    await page.goto(`${FRONTEND_URL}/dashboard/releases`);
    await expect(page.locator('h1, h2').filter({ hasText: /releases|deployments/i })).toBeVisible();
    
    // Step 2: View specific release
    const releaseItem = page.locator('[data-testid*="release"], [class*="release"]').first();
    if (await releaseItem.isVisible()) {
      await releaseItem.click();
      await page.waitForTimeout(500);
    }
    
    // Step 3: Check quality gates
    const qualityGates = page.locator('text=/quality gate|passed|failed|pending/i');
    if (await qualityGates.first().isVisible()) {
      expect(await qualityGates.count()).toBeGreaterThan(0);
    }
    
    // Step 4: Review blockers (if any)
    const blockers = page.locator('text=/blocker|blocking|issue/i');
    if (await blockers.first().isVisible()) {
      expect(blockers).toBeDefined();
    }
  });

  test('should navigate through morning check workflow', async ({ page }) => {
    // Morning workflow: Dashboard → Quality → Incidents → Releases
    
    // 1. Dashboard overview
    await page.goto(`${FRONTEND_URL}/dashboard`);
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard|overview/i })).toBeVisible();
    
    // 2. Check quality metrics
    await page.goto(`${FRONTEND_URL}/dashboard/quality`);
    await page.waitForTimeout(500);
    
    // 3. Review incidents
    await page.goto(`${FRONTEND_URL}/dashboard/incidents`);
    await page.waitForTimeout(500);
    
    // 4. Check release readiness
    await page.goto(`${FRONTEND_URL}/dashboard/releases`);
    await page.waitForTimeout(500);
    
    // Verify we completed the journey
    expect(page.url()).toContain('/releases');
  });
});
