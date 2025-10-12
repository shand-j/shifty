import { Page } from '@playwright/test';
export interface HealingStrategy {
    name: string;
    priority: number;
    heal(page: Page, originalSelector: string): Promise<string | null>;
}
export declare class SelectorHealer {
    private strategies;
    constructor();
    private initializeStrategies;
    heal(page: Page, originalSelector: string): Promise<string | null>;
}
//# sourceMappingURL=selector-healer.d.ts.map