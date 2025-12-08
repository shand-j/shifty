// Enterprise-scale mock ROI and analytics data
export interface MockROIInsights {
  timeSaved: {
    total: number; // hours
    byActivity: {
      testGeneration: number;
      testHealing: number;
      manualTesting: number;
      debugging: number;
      ciOptimization: number;
    };
    trend: Array<{ date: string; hours: number }>;
  };
  incidentsPrevented: {
    total: number;
    severity: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    estimatedCostSaved: number; // USD
  };
  bugsFound: {
    total: number;
    byPhase: {
      development: number;
      preProduction: number;
      production: number;
    };
    costToFixRatio: number; // cost multiplier if found in prod
  };
  testAutomation: {
    testsGenerated: number;
    testsHealed: number;
    automationRate: number; // percentage
    manualEffortSaved: number; // hours
  };
  operationalMetrics: {
    totalCost: number; // monthly platform cost
    costPerTest: number;
    costPerHeal: number;
    roi: number; // return on investment multiplier
    breakEvenDate: string;
  };
  adoption: {
    activeUsers: number;
    totalUsers: number;
    adoptionRate: number; // percentage
    engagementScore: number; // 0-100
  };
}

export interface MockDORAMetrics {
  deploymentFrequency: {
    current: number; // deploys per day
    previous: number;
    change: number; // percentage
    rating: 'elite' | 'high' | 'medium' | 'low';
    trend: Array<{ date: string; count: number }>;
  };
  leadTimeForChanges: {
    current: number; // hours
    previous: number;
    change: number; // percentage
    rating: 'elite' | 'high' | 'medium' | 'low';
    trend: Array<{ date: string; hours: number }>;
  };
  meanTimeToRestore: {
    current: number; // hours
    previous: number;
    change: number; // percentage
    rating: 'elite' | 'high' | 'medium' | 'low';
    trend: Array<{ date: string; hours: number }>;
  };
  changeFailureRate: {
    current: number; // percentage
    previous: number;
    change: number; // percentage change
    rating: 'elite' | 'high' | 'medium' | 'low';
    trend: Array<{ date: string; rate: number }>;
  };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTimeSeries(days: number, baseValue: number, variance: number): Array<{ date: string; value: number }> {
  const now = new Date();
  const series: Array<{ date: string; value: number }> = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const value = Math.max(0, baseValue + randomInt(-variance, variance));
    series.push({
      date: date.toISOString().split('T')[0],
      value
    });
  }
  
  return series;
}

export function generateMockROIInsights(): MockROIInsights {
  const timeSavedTotal = randomInt(800, 2000);
  const timeSeries = generateTimeSeries(90, timeSavedTotal / 90, 10);
  const activeUsers = randomInt(150, 200);
  const totalUsers = 200;
  const operationalCost = randomInt(5000, 15000);

  return {
    timeSaved: {
      total: timeSavedTotal,
      byActivity: {
        testGeneration: Math.floor(timeSavedTotal * 0.35),
        testHealing: Math.floor(timeSavedTotal * 0.25),
        manualTesting: Math.floor(timeSavedTotal * 0.20),
        debugging: Math.floor(timeSavedTotal * 0.15),
        ciOptimization: Math.floor(timeSavedTotal * 0.05)
      },
      trend: timeSeries.map(t => ({ date: t.date, hours: t.value }))
    },
    incidentsPrevented: {
      total: randomInt(50, 150),
      severity: {
        critical: randomInt(5, 15),
        high: randomInt(15, 30),
        medium: randomInt(20, 50),
        low: randomInt(30, 80)
      },
      estimatedCostSaved: randomInt(100000, 500000)
    },
    bugsFound: {
      total: randomInt(200, 500),
      byPhase: {
        development: randomInt(100, 250),
        preProduction: randomInt(50, 150),
        production: randomInt(10, 50)
      },
      costToFixRatio: 15 // 15x more expensive to fix in production
    },
    testAutomation: {
      testsGenerated: randomInt(3000, 7000),
      testsHealed: randomInt(500, 1500),
      automationRate: randomInt(60, 90),
      manualEffortSaved: Math.floor(timeSavedTotal * 0.5)
    },
    operationalMetrics: {
      totalCost: operationalCost,
      costPerTest: Number((operationalCost / 5000).toFixed(2)),
      costPerHeal: Number((operationalCost / 1000).toFixed(2)),
      roi: Number((timeSavedTotal * 100 / operationalCost).toFixed(2)),
      breakEvenDate: new Date(Date.now() - randomInt(30, 180) * 24 * 60 * 60 * 1000).toISOString()
    },
    adoption: {
      activeUsers,
      totalUsers,
      adoptionRate: Math.floor((activeUsers / totalUsers) * 100),
      engagementScore: randomInt(70, 95)
    }
  };
}

export function generateMockDORAMetrics(): MockDORAMetrics {
  const deploysPerDay = Number((randomInt(5, 20) / 1).toFixed(1));
  const leadTimeHours = randomInt(1, 24);
  const mttrHours = randomInt(0.5, 4);
  const changeFailureRate = randomInt(1, 15);

  function getRating(metric: 'deploy' | 'leadtime' | 'mttr' | 'cfr', value: number): 'elite' | 'high' | 'medium' | 'low' {
    if (metric === 'deploy') {
      if (value >= 7) return 'elite';
      if (value >= 1) return 'high';
      if (value >= 0.25) return 'medium';
      return 'low';
    } else if (metric === 'leadtime') {
      if (value <= 24) return 'elite';
      if (value <= 168) return 'high';
      if (value <= 720) return 'medium';
      return 'low';
    } else if (metric === 'mttr') {
      if (value <= 1) return 'elite';
      if (value <= 24) return 'high';
      if (value <= 168) return 'medium';
      return 'low';
    } else { // cfr
      if (value <= 5) return 'elite';
      if (value <= 10) return 'high';
      if (value <= 15) return 'medium';
      return 'low';
    }
  }

  return {
    deploymentFrequency: {
      current: deploysPerDay,
      previous: deploysPerDay - randomInt(-2, 3),
      change: randomInt(-20, 40),
      rating: getRating('deploy', deploysPerDay),
      trend: generateTimeSeries(30, deploysPerDay, 3).map(t => ({ date: t.date, count: t.value }))
    },
    leadTimeForChanges: {
      current: leadTimeHours,
      previous: leadTimeHours + randomInt(-5, 10),
      change: randomInt(-30, 20),
      rating: getRating('leadtime', leadTimeHours),
      trend: generateTimeSeries(30, leadTimeHours, 5).map(t => ({ date: t.date, hours: t.value }))
    },
    meanTimeToRestore: {
      current: mttrHours,
      previous: mttrHours + randomInt(-1, 2),
      change: randomInt(-40, 10),
      rating: getRating('mttr', mttrHours),
      trend: generateTimeSeries(30, mttrHours, 1).map(t => ({ date: t.date, hours: t.value }))
    },
    changeFailureRate: {
      current: changeFailureRate,
      previous: changeFailureRate + randomInt(-3, 5),
      change: randomInt(-30, 15),
      rating: getRating('cfr', changeFailureRate),
      trend: generateTimeSeries(30, changeFailureRate, 2).map(t => ({ date: t.date, rate: t.value }))
    }
  };
}
