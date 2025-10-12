export interface AnalyticsEvent {
    type: string;
    data: Record<string, any>;
    timestamp: Date;
    sessionId?: string;
    testId?: string;
}
export declare class AnalyticsCollector {
    private events;
    private sessionId;
    constructor();
    track(eventType: string, data?: Record<string, any>): void;
    trackTestStart(testId: string, testName: string): void;
    trackTestEnd(testId: string, status: 'passed' | 'failed', duration: number, error?: string): void;
    trackSelectorHealing(originalSelector: string, healedSelector: string | null, success: boolean, strategy?: string): void;
    trackAIGeneration(prompt: string, generatedCode: string, confidence: number, model: string): void;
    getEvents(): AnalyticsEvent[];
    getEventsByType(type: string): AnalyticsEvent[];
    clearEvents(): void;
    generateReport(): AnalyticsReport;
    private generateSessionId;
    private sendEvent;
    private calculateAverageTestDuration;
    private calculateAverageHealingTime;
    private calculateHealingSuccessRate;
}
export interface AnalyticsReport {
    sessionId: string;
    summary: {
        totalTests: number;
        passedTests: number;
        failedTests: number;
        totalHealingAttempts: number;
        successfulHealings: number;
        aiGenerations: number;
    };
    performance: {
        avgTestDuration: number;
        avgHealingTime: number;
        healingSuccessRate: number;
    };
    events: AnalyticsEvent[];
    generatedAt: Date;
}
//# sourceMappingURL=collector.d.ts.map