import { healingTest as test, expect } from '../src/index';

/**
 * Example test demonstrating @shifty/playwright-healing capabilities
 * 
 * This test shows how healing automatically fixes broken selectors
 * without requiring code changes.
 */

test.describe('Healing Example Tests', () => {
  test('login flow with auto-healing', async ({ healingPage }) => {
    // Navigate to login page
    await healingPage.goto('https://demo.playwright.dev/todomvc');

    // These selectors will automatically heal if they break
    // For example, if data-testid changes from "new-todo" to "todo-input"
    // the healing engine will find it using multiple strategies
    
    // Add a todo item
    await healingPage.fill('.new-todo', 'Buy groceries');
    await healingPage.locator('.new-todo').press('Enter');

    // Add another todo
    await healingPage.fill('.new-todo', 'Walk the dog');
    await healingPage.locator('.new-todo').press('Enter');

    // Verify todos were added
    const todoCount = await healingPage.locator('.todo-list li').count();
    expect(todoCount).toBe(2);

    // Complete first todo
    await healingPage.click('.todo-list li:first-child .toggle');

    // Verify completion
    const completedTodos = await healingPage.locator('.todo-list li.completed').count();
    expect(completedTodos).toBe(1);

    // Get healing statistics
    const stats = healingPage.getHealingStats();
    console.log('\n=== Healing Statistics ===');
    console.log(`Total healing attempts: ${stats.totalAttempts}`);
    console.log(`Successful heals: ${stats.successfulHeals}`);
    console.log(`Failed heals: ${stats.failedHeals}`);
    console.log(`Cache hits: ${stats.cacheHits}`);
    
    if (stats.totalAttempts > 0) {
      const successRate = (stats.successfulHeals / stats.totalAttempts) * 100;
      console.log(`Success rate: ${successRate.toFixed(1)}%`);
      console.log(`Average confidence: ${stats.averageConfidence.toFixed(1)}%`);
      console.log(`Average heal time: ${stats.averageHealTime.toFixed(0)}ms`);
    }

    if (stats.strategyUsage.size > 0) {
      console.log('\nStrategy usage:');
      stats.strategyUsage.forEach((count, strategy) => {
        console.log(`  - ${strategy}: ${count} times`);
      });
    }
  });

  test('dynamic selector handling', async ({ healingPage }) => {
    await healingPage.goto('https://demo.playwright.dev/todomvc');

    // Simulate a scenario where selectors might be dynamic or change
    // The healing engine will track and adapt to these changes
    
    const selectors = [
      '.new-todo',
      'input.new-todo',
      '[placeholder="What needs to be done?"]'
    ];

    // Try each selector - healing will find the right one
    for (const selector of selectors) {
      try {
        await healingPage.fill(selector, `Test with ${selector}`);
        await healingPage.locator(selector).press('Enter');
        console.log(`✓ Selector worked: ${selector}`);
      } catch (error) {
        console.log(`✗ Selector failed (healing attempted): ${selector}`);
      }
    }

    // Check if any selectors were marked as flaky
    for (const selector of selectors) {
      const isFlaky = healingPage.healingEngine.isFlaky(selector);
      if (isFlaky) {
        console.log(`⚠️  Flaky selector detected: ${selector}`);
      }
    }
  });

  test('healing with text content', async ({ healingPage }) => {
    await healingPage.goto('https://demo.playwright.dev/todomvc');

    // Add some todos
    await healingPage.fill('.new-todo', 'First task');
    await healingPage.locator('.new-todo').press('Enter');
    
    await healingPage.fill('.new-todo', 'Second task');
    await healingPage.locator('.new-todo').press('Enter');

    // Text-based selectors are very resilient to structure changes
    // The healing engine will use text-content-matching strategy
    const firstTodo = healingPage.locator('text=First task');
    await expect(firstTodo).toBeVisible();

    const secondTodo = healingPage.locator('text=Second task');
    await expect(secondTodo).toBeVisible();

    console.log('✓ Text-based selectors handled successfully');
  });

  test('healing cache demonstration', async ({ healingPage }) => {
    await healingPage.goto('https://demo.playwright.dev/todomvc');

    const selector = '.new-todo';

    // First use - may trigger healing
    await healingPage.fill(selector, 'First use');
    await healingPage.locator(selector).press('Enter');

    // Second use - should use cached result if healing occurred
    await healingPage.fill(selector, 'Second use (cached)');
    await healingPage.locator(selector).press('Enter');

    // Third use - cache hit
    await healingPage.fill(selector, 'Third use (cached)');
    await healingPage.locator(selector).press('Enter');

    const stats = healingPage.getHealingStats();
    console.log(`\nCache efficiency: ${stats.cacheHits} cache hits`);
  });

  test('complex selector healing', async ({ healingPage }) => {
    await healingPage.goto('https://demo.playwright.dev/todomvc');

    // Add a todo
    await healingPage.fill('.new-todo', 'Complex selector test');
    await healingPage.locator('.new-todo').press('Enter');

    // Try various complex selectors
    // The CSS hierarchy analysis strategy will help with these
    const complexSelectors = [
      '.todoapp .main .todo-list li:first-child',
      'section.main > ul.todo-list > li:nth-child(1)',
      '.todo-list li:first-of-type'
    ];

    for (const selector of complexSelectors) {
      const element = healingPage.locator(selector);
      const isVisible = await element.isVisible().catch(() => false);
      console.log(`Selector: ${selector} - Visible: ${isVisible}`);
    }
  });

  test.afterAll(async ({ healingPage }) => {
    // Final statistics report
    const stats = healingPage.getHealingStats();
    
    console.log('\n=== Final Healing Report ===');
    console.log(`Total attempts: ${stats.totalAttempts}`);
    console.log(`Success rate: ${stats.totalAttempts > 0 ? ((stats.successfulHeals / stats.totalAttempts) * 100).toFixed(1) : 0}%`);
    
    if (stats.strategyUsage.size > 0) {
      console.log('\nMost effective strategies:');
      const sorted = Array.from(stats.strategyUsage.entries())
        .sort((a, b) => b[1] - a[1]);
      
      sorted.forEach(([strategy, count]) => {
        console.log(`  ${count}x - ${strategy}`);
      });
    }
  });
});
