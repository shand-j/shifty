import { v4 as uuidv4 } from 'uuid';
import { DatabaseManager } from '@shifty/database';
import {
  DORAMetrics,
  SPACEMetrics,
  ROICalculation,
  TelemetryCompleteness,
  OperationalMetrics,
  IncidentPrevention,
  ROIReport,
  MetricTimeframe,
  QualitySession,
  ManualTestStep,
} from '@shifty/shared';

export class ROIService {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  // ============================================================
  // DORA METRICS
  // ============================================================

  /**
   * Calculate DORA metrics for a tenant/team
   */
  async calculateDORAMetrics(
    tenantId: string,
    teamId?: string,
    timeframe: MetricTimeframe = 'monthly',
    periodStart?: Date,
    periodEnd?: Date
  ): Promise<DORAMetrics> {
    const end = periodEnd || new Date();
    const start = periodStart || this.getStartDate(timeframe, end);

    // Get deployment data
    const deploymentsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'deployed') as successful,
        COUNT(*) FILTER (WHERE status IN ('failed', 'rolled_back')) as failed,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60) as avg_duration_min
      FROM deployments
      WHERE tenant_id = $1 
        AND target = 'production'
        AND created_at BETWEEN $2 AND $3
    `;
    const deployments = await this.dbManager.query(deploymentsQuery, [tenantId, start, end]);
    const deployData = deployments.rows[0] || { total: 0, successful: 0, failed: 0 };

    // Get lead time data from pipeline evaluations
    const leadTimeQuery = `
      SELECT 
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - started_at)) / 60) as p50,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - started_at)) / 60) as p90,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - started_at)) / 60) as p95
      FROM policy_evaluations
      WHERE tenant_id = $1 
        AND status = 'passed'
        AND created_at BETWEEN $2 AND $3
    `;
    const leadTimeResult = await this.dbManager.query(leadTimeQuery, [tenantId, start, end]);
    const leadTime = leadTimeResult.rows[0] || { p50: 0, p90: 0, p95: 0 };

    // Get incident/recovery data from error clusters
    const incidentQuery = `
      SELECT 
        COUNT(*) as incident_count,
        AVG(EXTRACT(EPOCH FROM (resolved_at - first_occurrence)) / 60) as avg_mttr_min,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (resolved_at - first_occurrence)) / 60) as mttr_p50,
        PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (resolved_at - first_occurrence)) / 60) as mttr_p90
      FROM error_clusters
      WHERE tenant_id = $1 
        AND severity IN ('critical', 'high')
        AND resolved_at IS NOT NULL
        AND created_at BETWEEN $2 AND $3
    `;
    const incidentResult = await this.dbManager.query(incidentQuery, [tenantId, start, end]);
    const incidents = incidentResult.rows[0] || { incident_count: 0, avg_mttr_min: 0 };

    // Calculate metrics
    const daysInPeriod = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const deploymentFrequency = parseFloat(deployData.total) / daysInPeriod;
    const totalDeployments = parseInt(deployData.total) || 0;
    const failedDeployments = parseInt(deployData.failed) || 0;
    const changeFailureRate = totalDeployments > 0 ? (failedDeployments / totalDeployments) * 100 : 0;

    // Benchmarking (based on DORA State of DevOps research)
    const deployBenchmark = this.getDORABenchmark('deployment_frequency', deploymentFrequency);
    const leadTimeBenchmark = this.getDORABenchmark('lead_time', parseFloat(leadTime.p50) || 0);
    const mttrBenchmark = this.getDORABenchmark('mttr', parseFloat(incidents.mttr_p50) || 0);
    const cfrBenchmark = this.getDORABenchmark('change_failure_rate', changeFailureRate);

    const metrics: DORAMetrics = {
      tenantId,
      teamId,
      timeframe,
      periodStart: start,
      periodEnd: end,
      deploymentFrequency: {
        count: totalDeployments,
        averagePerDay: deploymentFrequency,
        trend: 'stable', // Would calculate from historical data
        benchmark: deployBenchmark,
      },
      leadTimeForChanges: {
        median: parseFloat(leadTime.p50) || 0,
        p50: parseFloat(leadTime.p50) || 0,
        p90: parseFloat(leadTime.p90) || 0,
        p95: parseFloat(leadTime.p95) || 0,
        trend: 'stable',
        benchmark: leadTimeBenchmark,
      },
      meanTimeToRecovery: {
        median: parseFloat(incidents.mttr_p50) || 0,
        p50: parseFloat(incidents.mttr_p50) || 0,
        p90: parseFloat(incidents.mttr_p90) || 0,
        incidents: parseInt(incidents.incident_count) || 0,
        trend: 'stable',
        benchmark: mttrBenchmark,
      },
      changeFailureRate: {
        rate: changeFailureRate,
        failedDeployments,
        totalDeployments,
        trend: 'stable',
        benchmark: cfrBenchmark,
      },
      overallLevel: this.calculateOverallDORALevel([deployBenchmark, leadTimeBenchmark, mttrBenchmark, cfrBenchmark]),
      calculatedAt: new Date(),
    };

    // Store the metrics
    await this.storeDORAMetrics(metrics);

    return metrics;
  }

  private getDORABenchmark(
    metric: string,
    value: number
  ): 'elite' | 'high' | 'medium' | 'low' {
    // Based on DORA State of DevOps research benchmarks
    switch (metric) {
      case 'deployment_frequency':
        // Elite: multiple per day, High: weekly to monthly, Medium: monthly, Low: > monthly
        if (value >= 1) return 'elite';
        if (value >= 0.14) return 'high'; // ~1 per week
        if (value >= 0.03) return 'medium'; // ~1 per month
        return 'low';
      
      case 'lead_time':
        // Elite: < 1 hour, High: < 1 day, Medium: < 1 week, Low: > 1 week
        if (value <= 60) return 'elite';
        if (value <= 1440) return 'high'; // 24 hours
        if (value <= 10080) return 'medium'; // 1 week
        return 'low';
      
      case 'mttr':
        // Elite: < 1 hour, High: < 24 hours, Medium: < 1 week, Low: > 1 week
        if (value <= 60) return 'elite';
        if (value <= 1440) return 'high';
        if (value <= 10080) return 'medium';
        return 'low';
      
      case 'change_failure_rate':
        // Elite: < 5%, High: < 10%, Medium: < 15%, Low: > 15%
        if (value <= 5) return 'elite';
        if (value <= 10) return 'high';
        if (value <= 15) return 'medium';
        return 'low';
      
      default:
        return 'medium';
    }
  }

  private calculateOverallDORALevel(
    benchmarks: ('elite' | 'high' | 'medium' | 'low')[]
  ): 'elite' | 'high' | 'medium' | 'low' {
    const scores = benchmarks.map(b => {
      switch (b) {
        case 'elite': return 4;
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
      }
    });
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg >= 3.5) return 'elite';
    if (avg >= 2.5) return 'high';
    if (avg >= 1.5) return 'medium';
    return 'low';
  }

  private async storeDORAMetrics(metrics: DORAMetrics): Promise<void> {
    await this.dbManager.query(
      `INSERT INTO dora_metrics (
        id, tenant_id, team_id, timeframe, period_start, period_end,
        deployment_frequency, lead_time_for_changes, mean_time_to_recovery,
        change_failure_rate, overall_level, calculated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        uuidv4(),
        metrics.tenantId,
        metrics.teamId || null,
        metrics.timeframe,
        metrics.periodStart,
        metrics.periodEnd,
        JSON.stringify(metrics.deploymentFrequency),
        JSON.stringify(metrics.leadTimeForChanges),
        JSON.stringify(metrics.meanTimeToRecovery),
        JSON.stringify(metrics.changeFailureRate),
        metrics.overallLevel,
        metrics.calculatedAt,
      ]
    );
  }

  // ============================================================
  // SPACE METRICS
  // ============================================================

  /**
   * Calculate SPACE metrics for a tenant/team
   */
  async calculateSPACEMetrics(
    tenantId: string,
    teamId?: string,
    timeframe: MetricTimeframe = 'monthly',
    periodStart?: Date,
    periodEnd?: Date
  ): Promise<SPACEMetrics> {
    const end = periodEnd || new Date();
    const start = periodStart || this.getStartDate(timeframe, end);

    // Activity metrics from various sources
    const activityQuery = `
      SELECT 
        COUNT(*) as total_commits,
        COUNT(DISTINCT DATE(created_at)) as active_days
      FROM deployments
      WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
    `;
    const activityResult = await this.dbManager.query(activityQuery, [tenantId, start, end]);
    const activity = activityResult.rows[0] || { total_commits: 0, active_days: 1 };

    // Performance metrics
    const performanceQuery = `
      SELECT 
        AVG(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) * 100 as pass_rate
      FROM policy_evaluations
      WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
    `;
    const performanceResult = await this.dbManager.query(performanceQuery, [tenantId, start, end]);
    const performance = performanceResult.rows[0] || { pass_rate: 0 };

    // Efficiency metrics
    const efficiencyQuery = `
      SELECT 
        AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 3600) as avg_cycle_time_hours
      FROM policy_evaluations
      WHERE tenant_id = $1 
        AND completed_at IS NOT NULL
        AND created_at BETWEEN $2 AND $3
    `;
    const efficiencyResult = await this.dbManager.query(efficiencyQuery, [tenantId, start, end]);
    const efficiency = efficiencyResult.rows[0] || { avg_cycle_time_hours: 0 };

    const daysInPeriod = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const metrics: SPACEMetrics = {
      tenantId,
      teamId,
      timeframe,
      periodStart: start,
      periodEnd: end,
      satisfaction: {
        developerSatisfactionScore: 7.5, // Would come from surveys
        burnoutRisk: 'low',
        workLifeBalance: 7.0,
        toolingSatisfaction: 8.0,
      },
      performance: {
        codeReviewCycleTime: 4, // hours
        prMergeRate: 85, // percentage
        codeQualityScore: parseFloat(performance.pass_rate) || 75,
        testPassRate: parseFloat(performance.pass_rate) || 80,
      },
      activity: {
        commitsPerDeveloperPerDay: parseInt(activity.total_commits) / daysInPeriod / 5, // Assuming 5 devs
        prsOpenedPerDeveloperPerWeek: 3.5,
        codeReviewsPerDeveloperPerWeek: 5,
        meetingsHoursPerWeek: 8,
      },
      communication: {
        prCommentResponseTime: 2, // hours
        crossTeamCollaborationScore: 7.5,
        documentationCompleteness: 70,
        knowledgeSharingIndex: 6.5,
      },
      efficiency: {
        focusTimePercentage: 65,
        contextSwitches: 5,
        cycleTimeP50: parseFloat(efficiency.avg_cycle_time_hours) || 8,
        wipLimit: 3,
        flowEfficiency: 40,
      },
      overallScore: 72,
      calculatedAt: new Date(),
    };

    // Store metrics
    await this.storeSPACEMetrics(metrics);

    return metrics;
  }

  private async storeSPACEMetrics(metrics: SPACEMetrics): Promise<void> {
    await this.dbManager.query(
      `INSERT INTO space_metrics (
        id, tenant_id, team_id, timeframe, period_start, period_end,
        satisfaction, performance, activity, communication, efficiency,
        overall_score, calculated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        uuidv4(),
        metrics.tenantId,
        metrics.teamId || null,
        metrics.timeframe,
        metrics.periodStart,
        metrics.periodEnd,
        JSON.stringify(metrics.satisfaction),
        JSON.stringify(metrics.performance),
        JSON.stringify(metrics.activity),
        JSON.stringify(metrics.communication),
        JSON.stringify(metrics.efficiency),
        metrics.overallScore,
        metrics.calculatedAt,
      ]
    );
  }

  // ============================================================
  // ROI CALCULATIONS
  // ============================================================

  /**
   * Calculate ROI for a tenant
   */
  async calculateROI(
    tenantId: string,
    teamId?: string,
    periodStart?: Date,
    periodEnd?: Date,
    dollarsPerHour: number = 75 // Average developer hourly rate
  ): Promise<ROICalculation> {
    const end = periodEnd || new Date();
    const start = periodStart || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days

    // Get test generation stats
    const testGenQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        AVG(execution_time) / 1000 / 60 as avg_time_min
      FROM tenant_data.test_generation_requests
      WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
    `;
    const testGenResult = await this.dbManager.query(testGenQuery, [tenantId, start, end]);
    const testGen = testGenResult.rows[0] || { total: 0, completed: 0, avg_time_min: 0 };

    // Get healing stats
    const healingQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE success = true) as successful,
        AVG(execution_time) as avg_time_ms
      FROM tenant_data.healing_attempts
      WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
    `;
    const healingResult = await this.dbManager.query(healingQuery, [tenantId, start, end]);
    const healing = healingResult.rows[0] || { total: 0, successful: 0, avg_time_ms: 0 };

    // Get incidents prevented (from regression tests catching issues)
    const incidentQuery = `
      SELECT COUNT(*) as count
      FROM incident_preventions
      WHERE tenant_id = $1 AND prevented_at BETWEEN $2 AND $3
    `;
    const incidentResult = await this.dbManager.query(incidentQuery, [tenantId, start, end]);
    const incidents = incidentResult.rows[0] || { count: 0 };

    // Calculate time savings
    const testsGenerated = parseInt(testGen.completed) || 0;
    const testGenerationHoursSaved = testsGenerated * 2; // 2 hours saved per test
    const healingsSuccessful = parseInt(healing.successful) || 0;
    const selectorHealingHoursSaved = healingsSuccessful * 0.5; // 30 min saved per healing
    const incidentsPreventedCount = parseInt(incidents.count) || 0;
    const incidentPreventionHoursSaved = incidentsPreventedCount * 8; // 8 hours saved per incident
    const manualTestingHoursReduced = testsGenerated * 1.5; // Manual test equiv
    const codeReviewHoursReduced = testsGenerated * 0.5; // Less review needed

    const totalHoursSaved = 
      testGenerationHoursSaved + 
      selectorHealingHoursSaved + 
      incidentPreventionHoursSaved + 
      manualTestingHoursReduced + 
      codeReviewHoursReduced;

    const totalDollarsSaved = totalHoursSaved * dollarsPerHour;

    // Quality impact
    const averageCostPerIncident = 5000; // Industry average
    const incidentCostAvoided = incidentsPreventedCount * averageCostPerIncident;

    // Platform cost (would be actual subscription cost)
    const daysInPeriod = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    const platformCost = (daysInPeriod / 30) * 1000; // $1000/month estimate

    const totalValue = totalDollarsSaved + incidentCostAvoided;
    const netROI = totalValue - platformCost;
    const roiPercentage = platformCost > 0 ? (netROI / platformCost) * 100 : 0;

    const calculation: ROICalculation = {
      id: uuidv4(),
      tenantId,
      teamId,
      periodStart: start,
      periodEnd: end,
      timeSavings: {
        testGenerationHoursSaved,
        selectorHealingHoursSaved,
        incidentPreventionHoursSaved,
        manualTestingHoursReduced,
        codeReviewHoursReduced,
        totalHoursSaved,
        dollarsPerHour,
        totalDollarsSaved,
      },
      qualityImpact: {
        bugsPreventedInProduction: Math.round(testsGenerated * 0.3),
        incidentsPreventedCount,
        averageCostPerIncident,
        incidentCostAvoided,
        regressionsCaught: healingsSuccessful,
        testCoverageIncrease: Math.min(30, testsGenerated * 0.5),
      },
      velocityGains: {
        deploymentFrequencyIncrease: 25, // Would calculate from historical
        leadTimeReduction: 40,
        cycleTimeReduction: 35,
        velocityIndex: 135,
      },
      costAnalysis: {
        platformCost,
        timeSavingsValue: totalDollarsSaved,
        qualityValue: incidentCostAvoided,
        velocityValue: totalDollarsSaved * 0.2, // 20% velocity premium
        totalValue: totalValue + (totalDollarsSaved * 0.2),
        netROI: netROI + (totalDollarsSaved * 0.2),
        roiPercentage: platformCost > 0 ? ((netROI + (totalDollarsSaved * 0.2)) / platformCost) * 100 : 0,
        paybackPeriodMonths: totalValue > 0 ? platformCost / (totalValue / (daysInPeriod / 30)) : 0,
      },
      trends: {
        roiTrend: 'improving',
        projectedAnnualValue: totalValue * (365 / daysInPeriod),
      },
      calculatedAt: new Date(),
    };

    // Store the calculation
    await this.storeROICalculation(calculation);

    return calculation;
  }

  private async storeROICalculation(calc: ROICalculation): Promise<void> {
    await this.dbManager.query(
      `INSERT INTO roi_calculations (
        id, tenant_id, team_id, period_start, period_end,
        time_savings, quality_impact, velocity_gains, cost_analysis,
        trends, calculated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        calc.id,
        calc.tenantId,
        calc.teamId || null,
        calc.periodStart,
        calc.periodEnd,
        JSON.stringify(calc.timeSavings),
        JSON.stringify(calc.qualityImpact),
        JSON.stringify(calc.velocityGains),
        JSON.stringify(calc.costAnalysis),
        JSON.stringify(calc.trends),
        calc.calculatedAt,
      ]
    );
  }

  // ============================================================
  // TELEMETRY COMPLETENESS
  // ============================================================

  /**
   * Check telemetry completeness for a tenant
   */
  async checkTelemetryCompleteness(
    tenantId: string,
    signal: 'traces' | 'metrics' | 'logs' = 'traces',
    threshold: number = 0.95
  ): Promise<TelemetryCompleteness> {
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    // Check for required attributes in spans
    const requiredAttrs = [
      'session_id', 'tenant_id', 'persona', 'repo', 'branch', 'component'
    ];

    // Query telemetry samples from the database
    const samplesQuery = `
      SELECT COUNT(*) as total FROM policy_evaluations
      WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
    `;
    const samplesResult = await this.dbManager.query(samplesQuery, [tenantId, periodStart, periodEnd]);
    const samplesAnalyzed = parseInt(samplesResult.rows[0]?.total) || 0;

    // Calculate actual completeness from telemetry_completeness_samples table
    // or fall back to configured default for testing
    let completenessRatio: number;
    const completenessSampleQuery = `
      SELECT AVG(completeness_ratio) as avg_ratio FROM telemetry_completeness
      WHERE tenant_id = $1 AND signal = $2 AND calculated_at > NOW() - INTERVAL '1 hour'
    `;
    const completenessSample = await this.dbManager.query(completenessSampleQuery, [tenantId, signal]);
    
    if (completenessSample.rows[0]?.avg_ratio) {
      completenessRatio = parseFloat(completenessSample.rows[0].avg_ratio);
    } else {
      // Use configurable default for initial setup or testing environments
      const configuredDefault = parseFloat(process.env.TELEMETRY_DEFAULT_COMPLETENESS || '0.85');
      completenessRatio = Math.min(1, configuredDefault);
      console.warn(`Using default completeness ratio (${completenessRatio}) - configure TELEMETRY_DEFAULT_COMPLETENESS or ensure telemetry data is flowing`);
    }

    const missingAttributes = completenessRatio < threshold 
      ? requiredAttrs.slice(0, Math.ceil((1 - completenessRatio) * requiredAttrs.length))
      : [];

    const result: TelemetryCompleteness = {
      tenantId,
      signal,
      completenessRatio,
      missingAttributes,
      samplesAnalyzed,
      periodStart,
      periodEnd,
      meetsThreshold: completenessRatio >= threshold,
      threshold,
      calculatedAt: new Date(),
    };

    // Store the result
    await this.dbManager.query(
      `INSERT INTO telemetry_completeness (
        id, tenant_id, signal, completeness_ratio, missing_attributes,
        samples_analyzed, period_start, period_end, meets_threshold,
        threshold, calculated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        uuidv4(),
        tenantId,
        signal,
        completenessRatio,
        JSON.stringify(missingAttributes),
        samplesAnalyzed,
        periodStart,
        periodEnd,
        result.meetsThreshold,
        threshold,
        result.calculatedAt,
      ]
    );

    return result;
  }

  // ============================================================
  // OPERATIONAL METRICS
  // ============================================================

  /**
   * Get operational metrics for a tenant
   */
  async getOperationalMetrics(
    tenantId: string,
    periodStart?: Date,
    periodEnd?: Date
  ): Promise<OperationalMetrics> {
    const end = periodEnd || new Date();
    const start = periodStart || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Test generation metrics
    const testGenQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        AVG(execution_time) as avg_time_ms
      FROM tenant_data.test_generation_requests
      WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
    `;
    const testGenResult = await this.dbManager.query(testGenQuery, [tenantId, start, end]);
    const testGen = testGenResult.rows[0] || {};

    // Healing metrics
    const healingQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE success = true) as successful,
        AVG(execution_time) as avg_time_ms
      FROM tenant_data.healing_attempts
      WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
    `;
    const healingResult = await this.dbManager.query(healingQuery, [tenantId, start, end]);
    const healing = healingResult.rows[0] || {};

    // Pipeline metrics
    const pipelineQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'passed') as passed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60) as avg_time_min
      FROM policy_evaluations
      WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
    `;
    const pipelineResult = await this.dbManager.query(pipelineQuery, [tenantId, start, end]);
    const pipeline = pipelineResult.rows[0] || {};

    // HITL metrics
    const hitlQuery = `
      SELECT 
        COUNT(*) as missions_completed,
        COUNT(DISTINCT user_id) as contributors
      FROM mission_feedback
      WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
    `;
    const hitlResult = await this.dbManager.query(hitlQuery, [tenantId, start, end]);
    const hitl = hitlResult.rows[0] || {};

    const totalHealing = parseInt(healing.total) || 0;
    const successfulHealing = parseInt(healing.successful) || 0;

    return {
      tenantId,
      periodStart: start,
      periodEnd: end,
      testsGenerated: parseInt(testGen.total) || 0,
      testsApproved: parseInt(testGen.completed) || 0,
      testsRejected: parseInt(testGen.failed) || 0,
      averageGenerationTime: parseFloat(testGen.avg_time_ms) / 1000 || 0,
      healingAttempts: totalHealing,
      healingSuccesses: successfulHealing,
      healingSuccessRate: totalHealing > 0 ? (successfulHealing / totalHealing) * 100 : 0,
      averageHealingTime: parseFloat(healing.avg_time_ms) || 0,
      pipelinesRun: parseInt(pipeline.total) || 0,
      pipelinesPassed: parseInt(pipeline.passed) || 0,
      pipelinesFailed: parseInt(pipeline.failed) || 0,
      averagePipelineTime: parseFloat(pipeline.avg_time_min) || 0,
      manualSessionsCompleted: 0, // Would query quality_sessions table
      manualTestStepsExecuted: 0,
      bugsFoundManually: 0,
      missionsCompleted: parseInt(hitl.missions_completed) || 0,
      trainingSamplesGenerated: parseInt(hitl.missions_completed) || 0,
      activeContributors: parseInt(hitl.contributors) || 0,
      calculatedAt: new Date(),
    };
  }

  // ============================================================
  // INCIDENT PREVENTION TRACKING
  // ============================================================

  /**
   * Record an incident prevention
   */
  async recordIncidentPrevention(
    tenantId: string,
    prevention: Omit<IncidentPrevention, 'id' | 'tenantId' | 'createdAt'>
  ): Promise<IncidentPrevention> {
    const id = uuidv4();
    
    const record: IncidentPrevention = {
      id,
      tenantId,
      ...prevention,
      createdAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO incident_preventions (
        id, tenant_id, detection_source, severity, description,
        potential_impact, estimated_cost_avoided, test_id, pipeline_id,
        error_cluster_id, prevented_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        tenantId,
        prevention.detectionSource,
        prevention.severity,
        prevention.description,
        prevention.potentialImpact,
        prevention.estimatedCostAvoided || null,
        prevention.testId || null,
        prevention.pipelineId || null,
        prevention.errorClusterId || null,
        prevention.preventedAt,
        record.createdAt,
      ]
    );

    console.log(`🛡️ Recorded incident prevention: ${id}`);
    return record;
  }

  /**
   * Get incident preventions for a tenant
   */
  async getIncidentPreventions(
    tenantId: string,
    periodStart?: Date,
    periodEnd?: Date,
    limit: number = 50
  ): Promise<IncidentPrevention[]> {
    const end = periodEnd || new Date();
    const start = periodStart || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const result = await this.dbManager.query(
      `SELECT * FROM incident_preventions
       WHERE tenant_id = $1 AND prevented_at BETWEEN $2 AND $3
       ORDER BY prevented_at DESC LIMIT $4`,
      [tenantId, start, end, limit]
    );

    return result.rows.map(row => ({
      id: row.id,
      tenantId: row.tenant_id,
      detectionSource: row.detection_source,
      severity: row.severity,
      description: row.description,
      potentialImpact: row.potential_impact,
      estimatedCostAvoided: row.estimated_cost_avoided,
      testId: row.test_id,
      pipelineId: row.pipeline_id,
      errorClusterId: row.error_cluster_id,
      preventedAt: row.prevented_at,
      createdAt: row.created_at,
    }));
  }

  // ============================================================
  // ROI REPORTS
  // ============================================================

  /**
   * Generate comprehensive ROI report
   */
  async generateROIReport(
    tenantId: string,
    teamId?: string,
    reportType: 'executive_summary' | 'detailed' | 'team_breakdown' | 'trend_analysis' = 'detailed',
    periodStart?: Date,
    periodEnd?: Date
  ): Promise<ROIReport> {
    const end = periodEnd || new Date();
    const start = periodStart || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate all metrics
    const doraMetrics = await this.calculateDORAMetrics(tenantId, teamId, 'custom', start, end);
    const spaceMetrics = await this.calculateSPACEMetrics(tenantId, teamId, 'custom', start, end);
    const roiCalculation = await this.calculateROI(tenantId, teamId, start, end);
    const operationalMetrics = await this.getOperationalMetrics(tenantId, start, end);

    // Check telemetry completeness for all signals
    const telemetryCompleteness = await Promise.all([
      this.checkTelemetryCompleteness(tenantId, 'traces'),
      this.checkTelemetryCompleteness(tenantId, 'metrics'),
      this.checkTelemetryCompleteness(tenantId, 'logs'),
    ]);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      doraMetrics,
      spaceMetrics,
      roiCalculation,
      operationalMetrics,
      telemetryCompleteness
    );

    const report: ROIReport = {
      id: uuidv4(),
      tenantId,
      reportType,
      periodStart: start,
      periodEnd: end,
      doraMetrics,
      spaceMetrics,
      roiCalculation,
      operationalMetrics,
      telemetryCompleteness,
      recommendations,
      generatedAt: new Date(),
    };

    // Store the report
    await this.dbManager.query(
      `INSERT INTO roi_reports (
        id, tenant_id, report_type, period_start, period_end,
        dora_metrics, space_metrics, roi_calculation, operational_metrics,
        telemetry_completeness, recommendations, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        report.id,
        tenantId,
        reportType,
        start,
        end,
        JSON.stringify(doraMetrics),
        JSON.stringify(spaceMetrics),
        JSON.stringify(roiCalculation),
        JSON.stringify(operationalMetrics),
        JSON.stringify(telemetryCompleteness),
        JSON.stringify(recommendations),
        report.generatedAt,
      ]
    );

    return report;
  }

  private generateRecommendations(
    dora: DORAMetrics,
    space: SPACEMetrics,
    roi: ROICalculation,
    ops: OperationalMetrics,
    telemetry: TelemetryCompleteness[]
  ): ROIReport['recommendations'] {
    const recommendations: ROIReport['recommendations'] = [];
    let priority = 1;

    // Check DORA metrics
    if (dora.deploymentFrequency.benchmark === 'low') {
      recommendations.push({
        priority: priority++,
        category: 'Deployment',
        title: 'Increase Deployment Frequency',
        description: 'Your deployment frequency is below industry standards. Consider implementing trunk-based development and smaller batch sizes.',
        expectedImpact: 'Could reduce lead time by 50% and improve developer productivity',
        effort: 'medium',
      });
    }

    if (dora.changeFailureRate.rate > 15) {
      recommendations.push({
        priority: priority++,
        category: 'Quality',
        title: 'Reduce Change Failure Rate',
        description: 'High change failure rate indicates quality issues. Expand test coverage and implement stricter quality gates.',
        expectedImpact: 'Could prevent 3-5 incidents per month',
        effort: 'high',
      });
    }

    // Check telemetry completeness
    const incompleteTelemetry = telemetry.filter(t => !t.meetsThreshold);
    if (incompleteTelemetry.length > 0) {
      recommendations.push({
        priority: priority++,
        category: 'Observability',
        title: 'Improve Telemetry Coverage',
        description: `Telemetry completeness is below threshold for: ${incompleteTelemetry.map(t => t.signal).join(', ')}. Add missing instrumentation.`,
        expectedImpact: 'Enable more accurate ROI calculations and faster incident resolution',
        effort: 'low',
      });
    }

    // Check healing rate
    if (ops.healingSuccessRate < 70) {
      recommendations.push({
        priority: priority++,
        category: 'Automation',
        title: 'Improve Selector Healing',
        description: 'Selector healing success rate is below optimal. Consider adding more training data via HITL missions.',
        expectedImpact: 'Could reduce test maintenance by additional 20%',
        effort: 'medium',
      });
    }

    // Check test generation adoption
    if (ops.testsGenerated < 10) {
      recommendations.push({
        priority: priority++,
        category: 'Adoption',
        title: 'Increase Test Generation Usage',
        description: 'Low test generation usage limits ROI. Onboard more teams and integrate into CI/CD pipelines.',
        expectedImpact: 'Each generated test saves ~2 hours of developer time',
        effort: 'low',
      });
    }

    // SPACE-based recommendations
    if (space.efficiency.focusTimePercentage < 50) {
      recommendations.push({
        priority: priority++,
        category: 'Developer Experience',
        title: 'Improve Focus Time',
        description: 'Low focus time indicates too many interruptions. Consider implementing no-meeting days and async communication.',
        expectedImpact: 'Could increase productivity by 25%',
        effort: 'medium',
      });
    }

    return recommendations;
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  private getStartDate(timeframe: MetricTimeframe, end: Date): Date {
    const start = new Date(end);
    switch (timeframe) {
      case 'hourly':
        start.setHours(start.getHours() - 1);
        break;
      case 'daily':
        start.setDate(start.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'yearly':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
    }
    return start;
  }
}
