"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectorHealer = void 0;
class SelectorHealer {
    constructor() {
        this.strategies = [];
        this.initializeStrategies();
    }
    initializeStrategies() {
        this.strategies = [
            new DataTestStrategy(),
            new AriaLabelStrategy(),
            new TextContentStrategy(),
            new SimilarElementStrategy(),
            new PositionalStrategy()
        ].sort((a, b) => b.priority - a.priority);
    }
    async heal(page, originalSelector) {
        console.log(`🔧 Attempting to heal selector: ${originalSelector}`);
        for (const strategy of this.strategies) {
            try {
                const healedSelector = await strategy.heal(page, originalSelector);
                if (healedSelector) {
                    // Verify the healed selector works
                    const element = page.locator(healedSelector);
                    if (await element.count() > 0) {
                        console.log(`✅ Successfully healed using ${strategy.name}: ${healedSelector}`);
                        return healedSelector;
                    }
                }
            }
            catch (error) {
                console.log(`❌ ${strategy.name} strategy failed:`, error);
            }
        }
        console.log(`💔 All healing strategies failed for: ${originalSelector}`);
        return null;
    }
}
exports.SelectorHealer = SelectorHealer;
// Data-test attribute strategy (highest priority)
class DataTestStrategy {
    constructor() {
        this.name = 'data-test-attribute';
        this.priority = 10;
    }
    async heal(page, originalSelector) {
        // Try to find elements with data-test attributes
        const elements = await page.$$('[data-test], [data-testid], [data-cy]');
        for (const element of elements) {
            const dataTest = await element.getAttribute('data-test') ||
                await element.getAttribute('data-testid') ||
                await element.getAttribute('data-cy');
            if (dataTest) {
                const candidate = `[data-test="${dataTest}"], [data-testid="${dataTest}"], [data-cy="${dataTest}"]`;
                if (this.isSimilarElement(originalSelector, candidate)) {
                    return `[data-test="${dataTest}"]`;
                }
            }
        }
        return null;
    }
    isSimilarElement(original, candidate) {
        // Simple similarity check - in production, use more sophisticated matching
        const originalWords = original.toLowerCase().split(/[-_\s]/);
        const candidateWords = candidate.toLowerCase().split(/[-_\s]/);
        return originalWords.some(word => candidateWords.some(cWord => cWord.includes(word) || word.includes(cWord)));
    }
}
// ARIA label strategy
class AriaLabelStrategy {
    constructor() {
        this.name = 'aria-label';
        this.priority = 8;
    }
    async heal(page, originalSelector) {
        // Extract expected text from original selector
        const expectedText = this.extractTextFromSelector(originalSelector);
        if (!expectedText)
            return null;
        // Try aria-label
        const ariaElement = await page.locator(`[aria-label*="${expectedText}" i]`).first();
        if (await ariaElement.count() > 0) {
            return `[aria-label*="${expectedText}" i]`;
        }
        // Try aria-labelledby
        const labelledByElement = await page.locator(`[aria-labelledby*="${expectedText}" i]`).first();
        if (await labelledByElement.count() > 0) {
            return `[aria-labelledby*="${expectedText}" i]`;
        }
        return null;
    }
    extractTextFromSelector(selector) {
        // Extract text from selectors like 'button:has-text("Login")'
        const textMatch = selector.match(/:has-text\(["'](.+?)["']\)/i);
        if (textMatch)
            return textMatch[1];
        // Extract from class names
        const classMatch = selector.match(/\.([a-z-]+)/i);
        if (classMatch)
            return classMatch[1].replace(/-/g, ' ');
        return null;
    }
}
// Text content strategy
class TextContentStrategy {
    constructor() {
        this.name = 'text-content';
        this.priority = 6;
    }
    async heal(page, originalSelector) {
        const expectedText = this.extractTextFromSelector(originalSelector);
        if (!expectedText)
            return null;
        // Try exact text match
        const exactMatch = await page.locator(`text="${expectedText}"`).first();
        if (await exactMatch.count() > 0) {
            return `text="${expectedText}"`;
        }
        // Try partial text match
        const partialMatch = await page.locator(`text*="${expectedText}"`).first();
        if (await partialMatch.count() > 0) {
            return `text*="${expectedText}"`;
        }
        return null;
    }
    extractTextFromSelector(selector) {
        const textMatch = selector.match(/:has-text\(["'](.+?)["']\)/i);
        return textMatch ? textMatch[1] : null;
    }
}
// Similar element strategy
class SimilarElementStrategy {
    constructor() {
        this.name = 'similar-element';
        this.priority = 4;
    }
    async heal(page, originalSelector) {
        const tagName = this.extractTagName(originalSelector);
        if (!tagName)
            return null;
        // Find elements with the same tag name
        const elements = await page.$$(tagName);
        for (const element of elements) {
            const classList = await element.getAttribute('class');
            const id = await element.getAttribute('id');
            if (classList || id) {
                const candidate = id ? `#${id}` : `.${classList?.split(' ')[0]}`;
                return candidate;
            }
        }
        return null;
    }
    extractTagName(selector) {
        const tagMatch = selector.match(/^([a-z]+)/i);
        return tagMatch ? tagMatch[1] : null;
    }
}
// Positional strategy (last resort)
class PositionalStrategy {
    constructor() {
        this.name = 'positional';
        this.priority = 2;
    }
    async heal(page, originalSelector) {
        const tagName = this.extractTagName(originalSelector);
        if (!tagName)
            return null;
        // Try nth-child selectors
        const elements = await page.$$(tagName);
        if (elements.length > 0) {
            return `${tagName}:nth-child(1)`;
        }
        return null;
    }
    extractTagName(selector) {
        const tagMatch = selector.match(/^([a-z]+)/i);
        return tagMatch ? tagMatch[1] : null;
    }
}
//# sourceMappingURL=selector-healer.js.map