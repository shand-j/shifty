export interface AnalyticsEvent {
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  testId?: string;
}

export class AnalyticsCollector {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  track(eventType: string, data: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      type: eventType,
      data,
      timestamp: new Date(),
      sessionId: this.sessionId
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  trackTestStart(testId: string, testName: string) {
    this.track('test.started', {
      testId,
      testName,
      startTime: Date.now()
    });
  }

  trackTestEnd(testId: string, status: 'passed' | 'failed', duration: number, error?: string) {
    this.track('test.completed', {
      testId,
      status,
      duration,
      error,
      endTime: Date.now()
    });
  }

  trackSelectorHealing(originalSelector: string, healedSelector: string | null, success: boolean, strategy?: string) {
    this.track('selector.healing', {
      originalSelector,
      healedSelector,
      success,
      strategy,
      timestamp: Date.now()
    });
  }

  trackAIGeneration(prompt: string, generatedCode: string, confidence: number, model: string) {
    this.track('ai.generation', {
      promptLength: prompt.length,
      codeLength: generatedCode.length,
      confidence,
      model,
      timestamp: Date.now()
    });
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getEventsByType(type: string): AnalyticsEvent[] {
    return this.events.filter(event => event.type === type);
  }

  clearEvents() {
    this.events = [];
  }

  generateReport(): AnalyticsReport {
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

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendEvent(event: AnalyticsEvent) {
    // In a real implementation, send to analytics service
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Analytics Event:`, event);
    }
  }

  private calculateAverageTestDuration(testEvents: AnalyticsEvent[]): number {
    if (testEvents.length === 0) return 0;
    
    const totalDuration = testEvents.reduce((sum, event) => sum + (event.data.duration || 0), 0);
    return Math.round(totalDuration / testEvents.length);
  }

  private calculateAverageHealingTime(healingEvents: AnalyticsEvent[]): number {
    if (healingEvents.length === 0) return 0;
    
    // In a real implementation, track healing duration
    // For now, return estimated average
    return 1500; // 1.5 seconds average
  }

  private calculateHealingSuccessRate(healingEvents: AnalyticsEvent[]): number {
    if (healingEvents.length === 0) return 0;
    
    const successfulHealings = healingEvents.filter(e => e.data.success).length;
    return Math.round((successfulHealings / healingEvents.length) * 100) / 100;
  }
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