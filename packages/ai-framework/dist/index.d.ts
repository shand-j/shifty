import { Page, Locator } from '@playwright/test';
import { SelectorHealer } from './healing/selector-healer';
import { AITestGenerator, TestGenerationOptions, GeneratedTest } from './generation/test-generator';
import { AnalyticsCollector } from './analytics/collector';
export { SelectorHealer } from './healing/selector-healer';
export { AITestGenerator, TestGenerationOptions, GeneratedTest } from './generation/test-generator';
export { AITestGenerator as TestGenerator } from './generation/test-generator';
export { AnalyticsCollector } from './analytics/collector';
export declare const test: import("@playwright/test").TestType<import("@playwright/test").PlaywrightTestArgs & import("@playwright/test").PlaywrightTestOptions & {
    aiPage: Page & AIEnhancedPage;
    healer: SelectorHealer;
    generator: AITestGenerator;
    analytics: AnalyticsCollector;
}, import("@playwright/test").PlaywrightWorkerArgs & import("@playwright/test").PlaywrightWorkerOptions>;
export interface AIEnhancedPage {
    locatorWithHealing(selector: string): AILocator;
    generateTest(options: TestGenerationOptions): Promise<GeneratedTest>;
    trackAnalytics(event: string, data: any): void;
}
export declare class AILocator {
    private page;
    private selector;
    private healer;
    constructor(page: Page, selector: string, healer: SelectorHealer);
    click(options?: Parameters<Locator['click']>[0]): Promise<void>;
    fill(value: string, options?: Parameters<Locator['fill']>[1]): Promise<void>;
    isVisible(): Promise<boolean>;
    textContent(): Promise<string | null>;
    waitFor(options?: Parameters<Locator['waitFor']>[0]): Promise<void>;
}
export { expect } from '@playwright/test';
//# sourceMappingURL=index.d.ts.map