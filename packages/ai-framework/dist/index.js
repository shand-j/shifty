"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expect = exports.AILocator = exports.test = exports.AnalyticsCollector = exports.TestGenerator = exports.AITestGenerator = exports.SelectorHealer = void 0;
const test_1 = require("@playwright/test");
const selector_healer_1 = require("./healing/selector-healer");
const test_generator_1 = require("./generation/test-generator");
const collector_1 = require("./analytics/collector");
// Export classes for service usage
var selector_healer_2 = require("./healing/selector-healer");
Object.defineProperty(exports, "SelectorHealer", { enumerable: true, get: function () { return selector_healer_2.SelectorHealer; } });
var test_generator_2 = require("./generation/test-generator");
Object.defineProperty(exports, "AITestGenerator", { enumerable: true, get: function () { return test_generator_2.AITestGenerator; } });
var test_generator_3 = require("./generation/test-generator");
Object.defineProperty(exports, "TestGenerator", { enumerable: true, get: function () { return test_generator_3.AITestGenerator; } });
var collector_2 = require("./analytics/collector");
Object.defineProperty(exports, "AnalyticsCollector", { enumerable: true, get: function () { return collector_2.AnalyticsCollector; } });
// Extend Playwright test with AI capabilities
exports.test = test_1.test.extend({
    aiPage: async ({ page }, use) => {
        const healer = new selector_healer_1.SelectorHealer();
        const analytics = new collector_1.AnalyticsCollector();
        const aiPage = Object.assign(page, {
            locatorWithHealing: (selector) => new AILocator(page, selector, healer),
            generateTest: (options) => new test_generator_1.AITestGenerator().generate(options),
            trackAnalytics: (event, data) => analytics.track(event, data)
        });
        await use(aiPage);
    },
    healer: async ({}, use) => {
        await use(new selector_healer_1.SelectorHealer());
    },
    generator: async ({}, use) => {
        await use(new test_generator_1.AITestGenerator());
    },
    analytics: async ({}, use) => {
        await use(new collector_1.AnalyticsCollector());
    }
});
// AI-Enhanced Locator class
class AILocator {
    constructor(page, selector, healer) {
        this.page = page;
        this.selector = selector;
        this.healer = healer;
    }
    async click(options) {
        try {
            const locator = this.page.locator(this.selector);
            await locator.click(options);
        }
        catch (error) {
            console.log(`🔧 Selector failed: ${this.selector}, attempting AI healing...`);
            const healedSelector = await this.healer.heal(this.page, this.selector);
            if (healedSelector) {
                console.log(`✅ Healed to: ${healedSelector}`);
                await this.page.locator(healedSelector).click(options);
            }
            else {
                throw error;
            }
        }
    }
    async fill(value, options) {
        try {
            const locator = this.page.locator(this.selector);
            await locator.fill(value, options);
        }
        catch (error) {
            console.log(`🔧 Selector failed: ${this.selector}, attempting AI healing...`);
            const healedSelector = await this.healer.heal(this.page, this.selector);
            if (healedSelector) {
                console.log(`✅ Healed to: ${healedSelector}`);
                await this.page.locator(healedSelector).fill(value, options);
            }
            else {
                throw error;
            }
        }
    }
    async isVisible() {
        try {
            return await this.page.locator(this.selector).isVisible();
        }
        catch (error) {
            const healedSelector = await this.healer.heal(this.page, this.selector);
            if (healedSelector) {
                return await this.page.locator(healedSelector).isVisible();
            }
            return false;
        }
    }
    async textContent() {
        try {
            return await this.page.locator(this.selector).textContent();
        }
        catch (error) {
            const healedSelector = await this.healer.heal(this.page, this.selector);
            if (healedSelector) {
                return await this.page.locator(healedSelector).textContent();
            }
            throw error;
        }
    }
    // Proxy other Locator methods as needed
    async waitFor(options) {
        try {
            return await this.page.locator(this.selector).waitFor(options);
        }
        catch (error) {
            const healedSelector = await this.healer.heal(this.page, this.selector);
            if (healedSelector) {
                return await this.page.locator(healedSelector).waitFor(options);
            }
            throw error;
        }
    }
}
exports.AILocator = AILocator;
var test_2 = require("@playwright/test");
Object.defineProperty(exports, "expect", { enumerable: true, get: function () { return test_2.expect; } });
//# sourceMappingURL=index.js.map