import { generateId, randomInt, randomDate } from './faker-utils';

// ROI Metrics for 12 months
export interface MockROIMetrics {
  timeSaved: {
    total: number; // hours
    byActivity: {
      testGeneration: number;
      testHealing: number;
      manualTesting: number;
      debugging: number;
      ciOptimization: number;
    };
    trend: Array<{ month: string; hours: number }>;
  };
  costsAvoided: {
    total: number; // USD
    byCategory: {
      incidentPrevention: number;
      productionBugs: number;
      rework: number;
      downtime: number;
    };
    trend: Array<{ month: string; amount: number }>;
  };
  qualityImprovements: {
    testCoverageIncrease: number; // percentage points
    flakyTestReduction: number; // percentage points
    bugDetectionRate: number; // percentage improvement
    cycleTimeReduction: number; // percentage improvement
  };
  incidentsPrevented: number;
  bugsFoundPreProduction: number;
}

export function generateMockROIMetrics(): MockROIMetrics {
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push(date.toISOString().substring(0, 7));
  }
  
  let cumulativeHours = 0;
  let cumulativeCost = 0;
  
  const timeSavedTrend = months.map(month => {
    cumulativeHours += randomInt(80, 200);
    return { month, hours: cumulativeHours };
  });
  
  const costsAvoidedTrend = months.map(month => {
    cumulativeCost += randomInt(15000, 40000);
    return { month, amount: cumulativeCost };
  });
  
  return {
    timeSaved: {
      total: cumulativeHours,
      byActivity: {
        testGeneration: Math.floor(cumulativeHours * 0.35),
        testHealing: Math.floor(cumulativeHours * 0.25),
        manualTesting: Math.floor(cumulativeHours * 0.20),
        debugging: Math.floor(cumulativeHours * 0.15),
        ciOptimization: Math.floor(cumulativeHours * 0.05),
      },
      trend: timeSavedTrend,
    },
    costsAvoided: {
      total: cumulativeCost,
      byCategory: {
        incidentPrevention: Math.floor(cumulativeCost * 0.40),
        productionBugs: Math.floor(cumulativeCost * 0.30),
        rework: Math.floor(cumulativeCost * 0.20),
        downtime: Math.floor(cumulativeCost * 0.10),
      },
      trend: costsAvoidedTrend,
    },
    qualityImprovements: {
      testCoverageIncrease: randomInt(15, 35),
      flakyTestReduction: randomInt(40, 70),
      bugDetectionRate: randomInt(50, 85),
      cycleTimeReduction: randomInt(25, 45),
    },
    incidentsPrevented: randomInt(15, 50),
    bugsFoundPreProduction: randomInt(150, 400),
  };
}

export const mockROIMetrics = generateMockROIMetrics();
