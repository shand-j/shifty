import { test, expect } from '@playwright/test';

// TODO: HIGH - Add pre-test validation to ensure dependencies are running
// These tests require:
//   1. Frontend dev server on port 3006 (npm run dev)
//   2. Test user test@shifty.com exists in database
//   3. API Gateway proxying to auth-service
// Currently fail silently when dependencies missing
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3006';
// FIXME: CRITICAL - Test user test@shifty.com does not exist in database
// Must add seed data to init-platform-db.sql or create user in beforeAll hook
const TEST_USER = {
  email: 'test@shifty.com',
  password: 'password123'
};

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('networkidle');
  });

  test('should display login form', async ({ page }) => {
    // Verify page title/heading
    await expect(page.locator('h2, h1').filter({ hasText: /Welcome back|Login|Sign in/i })).toBeVisible();
    
    // Verify form elements are present
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /log in|sign in/i })).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Fill in credentials
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill(TEST_USER.password);
    
    // Click login button
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // Wait for navigation to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Verify we're on the dashboard
    expect(page.url()).toContain('/dashboard');
    
    // Verify token is stored (check localStorage - API client stores as 'shifty_token')
    const token = await page.evaluate(() => localStorage.getItem('shifty_token'));
    expect(token).toBeTruthy();
    expect(token).toContain('eyJ'); // JWT tokens start with eyJ
  });

  test('should show error message with invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Click login button
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // Wait for error message
    await expect(page.locator('text=/invalid credentials|email or password/i')).toBeVisible({ timeout: 5000 });
    
    // Verify we're still on login page
    expect(page.url()).toContain('/login');
  });

  test('should show error message when email is missing', async ({ page }) => {
    // Leave email empty, fill password
    await page.getByLabel(/password/i).fill(TEST_USER.password);
    
    // Click login button
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // HTML5 validation or error message should appear
    const emailInput = page.getByLabel(/email/i);
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should show error message when password is missing', async ({ page }) => {
    // Fill email, leave password empty
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    
    // Click login button
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    
    // HTML5 validation or error message should appear
    const passwordInput = page.getByLabel(/password/i);
    const validationMessage = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i);
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click show password button
    const showPasswordBtn = page.locator('[aria-label*="password" i], button:has(svg)').filter({ hasText: /(show|eye)/i }).or(page.locator('button').filter({ has: page.locator('svg.lucide-eye, svg.lucide-eye-off') })).first();
    
    if (await showPasswordBtn.isVisible()) {
      await showPasswordBtn.click();
      
      // Password should now be visible
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click hide password button
      await showPasswordBtn.click();
      
      // Password should be hidden again
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('should show loading state during login', async ({ page }) => {
    // Slow down the network to see loading state
    await page.route('**/api/v1/auth/login', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // Fill in credentials
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill(TEST_USER.password);
    
    // Click login button
    const loginButton = page.getByRole('button', { name: /log in|sign in/i });
    await loginButton.click();
    
    // Verify button shows loading state (disabled or shows spinner)
    await expect(loginButton).toBeDisabled();
  });

  test('should allow navigation to register page', async ({ page }) => {
    // Look for register/sign up link
    const registerLink = page.getByRole('link', { name: /sign up|create account|register/i });
    
    if (await registerLink.isVisible()) {
      await registerLink.click();
      
      // Should navigate to register page
      await page.waitForURL(/\/register|\/signup/, { timeout: 5000 });
      expect(page.url()).toMatch(/\/register|\/signup/);
    }
  });
});
