import { DatabaseManager } from '@shifty/database';

export interface AIAnalytics {
  testGeneration: {
    totalGenerated: number;
    successRate: number;
    averageConfidence: number;
    mostUsedTypes: string[];
  };
  selectorHealing: {
    totalAttempts: number;
    healingSuccessRate: number;
    averageConfidence: number;
    mostUsedStrategies: string[];
  };
  modelUsage: {
    totalRequests: number;
    averageResponseTime: number;
    currentModel: string;
  };
}

export class AnalyticsService {
  constructor(private dbManager: DatabaseManager) {}

  async getAnalytics(tenantId: string, databaseUrl: string): Promise<AIAnalytics> {
    // Get test generation analytics
    const testGenResult = await this.dbManager.queryTenant(
      tenantId,
      databaseUrl,
      `SELECT 
        COUNT(*) as total_generated,
        AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::decimal * 100 as success_rate,
        test_type
       FROM tenant_data.test_generation_requests 
       WHERE tenant_id = $1
       GROUP BY test_type
       ORDER BY COUNT(*) DESC`,
      [tenantId]
    );

    const totalGenerated = testGenResult.rows.reduce((sum, row) => sum + parseInt(row.total_generated), 0);
    const overallSuccessRate = testGenResult.rows.length > 0 
      ? testGenResult.rows.reduce((sum, row) => sum + parseFloat(row.success_rate), 0) / testGenResult.rows.length
      : 0;
    const mostUsedTypes = testGenResult.rows.slice(0, 3).map(row => row.test_type);

    // Get average confidence from metadata (if available)
    const confidenceResult = await this.dbManager.queryTenant(
      tenantId,
      databaseUrl,
      `SELECT AVG((metadata->>'confidence')::decimal) as avg_confidence
       FROM tenant_data.test_generation_requests 
       WHERE tenant_id = $1 AND metadata->>'confidence' IS NOT NULL`,
      [tenantId]
    );
    const averageConfidence = confidenceResult.rows[0]?.avg_confidence 
      ? parseFloat(confidenceResult.rows[0].avg_confidence) 
      : 0.75; // Default fallback

    // Get selector healing analytics
    const healingResult = await this.dbManager.queryTenant(
      tenantId,
      databaseUrl,
      `SELECT 
        COUNT(*) as total_attempts,
        AVG(CASE WHEN success THEN 1 ELSE 0 END)::decimal * 100 as success_rate,
        AVG(confidence) as avg_confidence,
        strategy
       FROM tenant_data.healing_attempts 
       WHERE tenant_id = $1
       GROUP BY strategy
       ORDER BY COUNT(*) DESC`,
      [tenantId]
    );

    const totalHealingAttempts = healingResult.rows.reduce((sum, row) => sum + parseInt(row.total_attempts), 0);
    const healingSuccessRate = healingResult.rows.length > 0
      ? healingResult.rows.reduce((sum, row) => sum + parseFloat(row.success_rate), 0) / healingResult.rows.length
      : 0;
    const healingAvgConfidence = healingResult.rows.length > 0
      ? healingResult.rows.reduce((sum, row) => sum + parseFloat(row.avg_confidence || 0), 0) / healingResult.rows.length
      : 0;
    const mostUsedStrategies = healingResult.rows.slice(0, 3).map(row => row.strategy);

    // Get model usage analytics (combined from both tables)
    const totalRequests = totalGenerated + totalHealingAttempts;
    
    const avgResponseTimeResult = await this.dbManager.queryTenant(
      tenantId,
      databaseUrl,
      `SELECT AVG(execution_time) as avg_time FROM (
        SELECT execution_time FROM tenant_data.test_generation_requests WHERE tenant_id = $1 AND execution_time IS NOT NULL
        UNION ALL
        SELECT execution_time FROM tenant_data.healing_attempts WHERE tenant_id = $1 AND execution_time IS NOT NULL
       ) combined`,
      [tenantId]
    );

    const averageResponseTime = avgResponseTimeResult.rows[0]?.avg_time 
      ? parseInt(avgResponseTimeResult.rows[0].avg_time)
      : 2500; // Default fallback

    return {
      testGeneration: {
        totalGenerated,
        successRate: Math.round(overallSuccessRate) / 100,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        mostUsedTypes: mostUsedTypes.length > 0 ? mostUsedTypes : ['e2e', 'smoke', 'integration']
      },
      selectorHealing: {
        totalAttempts: totalHealingAttempts,
        healingSuccessRate: Math.round(healingSuccessRate) / 100,
        averageConfidence: Math.round(healingAvgConfidence * 100) / 100,
        mostUsedStrategies: mostUsedStrategies.length > 0 ? mostUsedStrategies : ['data-testid-recovery', 'text-content-matching', 'css-hierarchy-analysis']
      },
      modelUsage: {
        totalRequests,
        averageResponseTime,
        currentModel: process.env.AI_MODEL || 'llama3.1'
      }
    };
  }
}
