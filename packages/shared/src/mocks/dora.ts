import { randomInt } from './faker-utils';

// DORA Metrics (DevOps Research and Assessment)
export interface MockDORAMetrics {
  deploymentFrequency: {
    current: number; // deploys per week
    previous: number;
    trend: 'up' | 'down' | 'stable';
    rating: 'elite' | 'high' | 'medium' | 'low';
    timeSeries: Array<{ date: string; value: number }>;
  };
  leadTimeForChanges: {
    current: number; // hours
    previous: number;
    trend: 'up' | 'down' | 'stable';
    rating: 'elite' | 'high' | 'medium' | 'low';
    timeSeries: Array<{ date: string; value: number }>;
  };
  changeFailureRate: {
    current: number; // percentage
    previous: number;
    trend: 'up' | 'down' | 'stable';
    rating: 'elite' | 'high' | 'medium' | 'low';
    timeSeries: Array<{ date: string; value: number }>;
  };
  timeToRestoreService: {
    current: number; // hours
    previous: number;
    trend: 'up' | 'down' | 'stable';
    rating: 'elite' | 'high' | 'medium' | 'low';
    timeSeries: Array<{ date: string; value: number }>;
  };
}

export function generateMockDORAMetrics(): MockDORAMetrics {
  const dates: string[] = [];
  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().substring(0, 10));
  }
  
  // Deployment Frequency (elite: >1/day, high: 1/week-1/month, medium: 1/month-1/6months, low: <1/6months)
  const deployFreq = randomInt(10, 30); // deploys per week
  const deployTrend = dates.map(date => ({
    date,
    value: Math.max(1, deployFreq + randomInt(-5, 5))
  }));
  
  // Lead Time (elite: <1 hour, high: 1 day-1 week, medium: 1 week-1 month, low: >1 month)
  const leadTime = randomInt(2, 12); // hours
  const leadTimeTrend = dates.map(date => ({
    date,
    value: Math.max(1, leadTime + randomInt(-2, 2))
  }));
  
  // Change Failure Rate (elite: <15%, high: 16-30%, medium: 31-45%, low: >45%)
  const failureRate = randomInt(5, 20); // percentage
  const failureTrend = dates.map(date => ({
    date,
    value: Math.max(0, Math.min(100, failureRate + randomInt(-3, 3)))
  }));
  
  // Time to Restore (elite: <1 hour, high: <1 day, medium: <1 week, low: >1 week)
  const restoreTime = randomInt(1, 8); // hours
  const restoreTrend = dates.map(date => ({
    date,
    value: Math.max(0.5, restoreTime + randomInt(-2, 2))
  }));
  
  return {
    deploymentFrequency: {
      current: deployFreq,
      previous: deployFreq + randomInt(-3, 3),
      trend: 'up',
      rating: deployFreq > 20 ? 'elite' : deployFreq > 10 ? 'high' : 'medium',
      timeSeries: deployTrend,
    },
    leadTimeForChanges: {
      current: leadTime,
      previous: leadTime + randomInt(-2, 2),
      trend: 'down',
      rating: leadTime < 4 ? 'elite' : leadTime < 24 ? 'high' : 'medium',
      timeSeries: leadTimeTrend,
    },
    changeFailureRate: {
      current: failureRate,
      previous: failureRate + randomInt(-2, 2),
      trend: 'down',
      rating: failureRate < 15 ? 'elite' : failureRate < 30 ? 'high' : 'medium',
      timeSeries: failureTrend,
    },
    timeToRestoreService: {
      current: restoreTime,
      previous: restoreTime + randomInt(-1, 2),
      trend: 'down',
      rating: restoreTime < 1 ? 'elite' : restoreTime < 24 ? 'high' : 'medium',
      timeSeries: restoreTrend,
    },
  };
}

export const mockDORAMetrics = generateMockDORAMetrics();
