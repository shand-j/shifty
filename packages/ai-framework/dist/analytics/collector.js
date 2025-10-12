"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsCollector = void 0;
class AnalyticsCollector {
    constructor() {
        this.events = [];
        this.sessionId = this.generateSessionId();
    }
    track(eventType, data = {}) {
        const event = {
            type: eventType,
            data,
            timestamp: new Date(),
            sessionId: this.sessionId
        };
        this.events.push(event);
        this.sendEvent(event);
    }
    trackTestStart(testId, testName) {
        this.track('test.started', {
            testId,
            testName,
            startTime: Date.now()
        });
    }
    trackTestEnd(testId, status, duration, error) {
        this.track('test.completed', {
            testId,
            status,
            duration,
            error,
            endTime: Date.now()
        });
    }
    trackSelectorHealing(originalSelector, healedSelector, success, strategy) {
        this.track('selector.healing', {
            originalSelector,
            healedSelector,
            success,
            strategy,
            timestamp: Date.now()
        });
    }
    trackAIGeneration(prompt, generatedCode, confidence, model) {
        this.track('ai.generation', {
            promptLength: prompt.length,
            codeLength: generatedCode.length,
            confidence,
            model,
            timestamp: Date.now()
        });
    }
    getEvents() {
        return [...this.events];
    }
    getEventsByType(type) {
        return this.events.filter(event => event.type === type);
    }
    clearEvents() {
        this.events = [];
    }
    generateReport() {
        const testEvents = this.getEventsByType('test.completed');
        const healingEvents = this.getEventsByType('selector.healing');
        const aiEvents = this.getEventsByType('ai.generation');
        return {
            sessionId: this.sessionId,
            summary: {
                totalTests: testEvents.length,
                passedTests: testEvents.filter(e => e.data.status === 'passed').length,
                failedTests: testEvents.filter(e => e.data.status === 'failed').length,
                totalHealingAttempts: healingEvents.length,
                successfulHealings: healingEvents.filter(e => e.data.success).length,
                aiGenerations: aiEvents.length
            },
            performance: {
                avgTestDuration: this.calculateAverageTestDuration(testEvents),
                avgHealingTime: this.calculateAverageHealingTime(healingEvents),
                healingSuccessRate: this.calculateHealingSuccessRate(healingEvents)
            },
            events: this.events,
            generatedAt: new Date()
        };
    }
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    async sendEvent(event) {
        // In a real implementation, send to analytics service
        // For now, just log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`📊 Analytics Event:`, event);
        }
    }
    calculateAverageTestDuration(testEvents) {
        if (testEvents.length === 0)
            return 0;
        const totalDuration = testEvents.reduce((sum, event) => sum + (event.data.duration || 0), 0);
        return Math.round(totalDuration / testEvents.length);
    }
    calculateAverageHealingTime(healingEvents) {
        if (healingEvents.length === 0)
            return 0;
        // In a real implementation, track healing duration
        // For now, return estimated average
        return 1500; // 1.5 seconds average
    }
    calculateHealingSuccessRate(healingEvents) {
        if (healingEvents.length === 0)
            return 0;
        const successfulHealings = healingEvents.filter(e => e.data.success).length;
        return Math.round((successfulHealings / healingEvents.length) * 100) / 100;
    }
}
exports.AnalyticsCollector = AnalyticsCollector;
//# sourceMappingURL=collector.js.map