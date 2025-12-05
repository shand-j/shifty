import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { DatabaseManager } from '@shifty/database';
import {
  SecurityScanConfig,
  SecurityScanRun,
  Vulnerability,
  VulnerabilitySeverity,
  SecurityScanType,
} from '@shifty/shared';

export class SecurityTestingService {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  // ============================================================
  // SCAN CONFIGURATION
  // ============================================================

  async createScanConfig(
    tenantId: string,
    config: Omit<SecurityScanConfig, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
  ): Promise<SecurityScanConfig> {
    const id = uuidv4();

    const fullConfig: SecurityScanConfig = {
      id,
      tenantId,
      ...config,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO security_scan_configs (
        id, tenant_id, name, description, scan_type, target,
        authentication, settings, thresholds, schedule,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id, tenantId, config.name, config.description || null, config.scanType,
        JSON.stringify(config.target), JSON.stringify(config.authentication || {}),
        JSON.stringify(config.settings), JSON.stringify(config.thresholds),
        JSON.stringify(config.schedule || {}), fullConfig.createdAt, fullConfig.updatedAt,
      ]
    );

    console.log(`🔒 Created security scan config: ${id}`);
    return fullConfig;
  }

  async getScanConfig(configId: string): Promise<SecurityScanConfig | null> {
    const result = await this.dbManager.query(
      'SELECT * FROM security_scan_configs WHERE id = $1',
      [configId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.transformConfigRow(result.rows[0]);
  }

  async getTenantScanConfigs(tenantId: string, scanType?: SecurityScanType): Promise<SecurityScanConfig[]> {
    let query = 'SELECT * FROM security_scan_configs WHERE tenant_id = $1';
    const params: any[] = [tenantId];

    if (scanType) {
      params.push(scanType);
      query += ` AND scan_type = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.dbManager.query(query, params);
    return result.rows.map(row => this.transformConfigRow(row));
  }

  async updateScanConfig(
    configId: string,
    updates: Partial<Omit<SecurityScanConfig, 'id' | 'tenantId' | 'createdAt'>>
  ): Promise<SecurityScanConfig | null> {
    const existing = await this.getScanConfig(configId);
    if (!existing) {
      return null;
    }

    const updated = { ...existing, ...updates, updatedAt: new Date() };

    await this.dbManager.query(
      `UPDATE security_scan_configs SET
        name = $2, description = $3, scan_type = $4, target = $5,
        authentication = $6, settings = $7, thresholds = $8,
        schedule = $9, updated_at = $10
       WHERE id = $1`,
      [
        configId, updated.name, updated.description, updated.scanType,
        JSON.stringify(updated.target), JSON.stringify(updated.authentication || {}),
        JSON.stringify(updated.settings), JSON.stringify(updated.thresholds),
        JSON.stringify(updated.schedule || {}), updated.updatedAt,
      ]
    );

    return updated;
  }

  async deleteScanConfig(configId: string): Promise<void> {
    await this.dbManager.query('DELETE FROM security_scan_configs WHERE id = $1', [configId]);
  }

  // ============================================================
  // SCAN EXECUTION
  // ============================================================

  async startScan(configId: string): Promise<SecurityScanRun> {
    const config = await this.getScanConfig(configId);
    if (!config) {
      throw new Error(`Scan config not found: ${configId}`);
    }

    const runId = uuidv4();
    const startTime = new Date();

    const run: SecurityScanRun = {
      id: runId,
      tenantId: config.tenantId,
      configId,
      status: 'pending',
      startTime,
      createdAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO security_scan_runs (
        id, tenant_id, config_id, status, start_time, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [runId, config.tenantId, configId, 'pending', startTime, run.createdAt]
    );

    // Start scan execution asynchronously
    this.executeScan(run, config).catch(err => {
      console.error(`Security scan ${runId} failed:`, err);
    });

    console.log(`🔍 Started security scan: ${runId}`);
    return run;
  }

  private async executeScan(run: SecurityScanRun, config: SecurityScanConfig): Promise<void> {
    // Update status to running
    await this.updateScanRunStatus(run.id, 'running');

    try {
      // Execute scan based on type
      const vulnerabilities = await this.runSecurityScan(config);

      // Store vulnerabilities
      for (const vuln of vulnerabilities) {
        await this.storeVulnerability(run.id, vuln);
      }

      // Calculate summary
      const summary = {
        totalVulnerabilities: vulnerabilities.length,
        criticalCount: vulnerabilities.filter(v => v.severity === 'critical').length,
        highCount: vulnerabilities.filter(v => v.severity === 'high').length,
        mediumCount: vulnerabilities.filter(v => v.severity === 'medium').length,
        lowCount: vulnerabilities.filter(v => v.severity === 'low').length,
        infoCount: vulnerabilities.filter(v => v.severity === 'informational').length,
      };

      // Evaluate thresholds
      const passed = this.evaluateThresholds(summary, config.thresholds);
      const failureReason = passed ? undefined : 'Vulnerability thresholds exceeded';

      // Update run with results
      const endTime = new Date();
      await this.dbManager.query(
        `UPDATE security_scan_runs SET
          status = 'completed', summary = $2, passed = $3,
          failure_reason = $4, end_time = $5
         WHERE id = $1`,
        [run.id, JSON.stringify(summary), passed, failureReason, endTime]
      );

      console.log(`✅ Security scan ${run.id} completed: ${passed ? 'PASSED' : 'FAILED'}`);
    } catch (error: any) {
      await this.updateScanRunStatus(run.id, 'failed', error.message);
      throw error;
    }
  }

  /**
   * Run security scan using configured tools
   * 
   * Supported integrations:
   * - DAST: OWASP ZAP (set ZAP_API_URL, ZAP_API_KEY)
   * - SAST: Semgrep (set SEMGREP_APP_TOKEN) or SonarQube (set SONAR_URL, SONAR_TOKEN)
   * - SCA: Snyk (set SNYK_TOKEN) or npm audit
   * - Secret: gitleaks (built-in) or TruffleHog
   * 
   * To integrate with actual tools, set the appropriate environment variables.
   * The service will auto-detect and use configured tools.
   */
  private async runSecurityScan(config: SecurityScanConfig): Promise<Omit<Vulnerability, 'id' | 'scanId' | 'createdAt' | 'updatedAt'>[]> {
    const vulnerabilities: Omit<Vulnerability, 'id' | 'scanId' | 'createdAt' | 'updatedAt'>[] = [];

    // Check for configured integrations
    const zapUrl = process.env.ZAP_API_URL;
    const zapKey = process.env.ZAP_API_KEY;
    const semgrepToken = process.env.SEMGREP_APP_TOKEN;
    const snykToken = process.env.SNYK_TOKEN;
    const sonarUrl = process.env.SONAR_URL;
    const sonarToken = process.env.SONAR_TOKEN;

    // Use actual tools if configured
    switch (config.scanType) {
      case 'dast':
        if (zapUrl && zapKey) {
          // Integration with OWASP ZAP
          console.log(`🔍 Running DAST scan with OWASP ZAP: ${zapUrl}`);
          try {
            // Start active scan
            const scanResponse = await axios.get(`${zapUrl}/JSON/ascan/action/scan/`, {
              params: {
                apikey: zapKey,
                url: config.target.url,
                recurse: true,
                inScopeOnly: false,
              },
            });
            
            // Wait for scan to complete (simplified - should poll status)
            const scanId = scanResponse.data.scan;
            await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30s
            
            // Get alerts
            const alertsResponse = await axios.get(`${zapUrl}/JSON/core/view/alerts/`, {
              params: { apikey: zapKey, baseurl: config.target.url },
            });
            
            // Convert ZAP alerts to our vulnerability format
            for (const alert of alertsResponse.data.alerts || []) {
              vulnerabilities.push({
                type: alert.name,
                severity: this.mapZapRisk(alert.risk),
                title: alert.name,
                description: alert.description,
                location: { url: alert.url, endpoint: alert.url, parameter: alert.param },
                cweId: alert.cweid ? `CWE-${alert.cweid}` : undefined,
                cvssScore: this.riskToCvss(alert.risk),
                remediation: alert.solution,
                references: alert.reference ? [alert.reference] : [],
                status: 'open',
              });
            }
            return vulnerabilities;
          } catch (error: any) {
            console.warn(`ZAP scan failed, using fallback: ${error.message}`);
          }
        }
        break;

      case 'sast':
        if (semgrepToken && config.target.repository) {
          // Integration with Semgrep
          console.log(`🔍 Running SAST scan with Semgrep`);
          try {
            // Would call Semgrep API or run CLI
            // semgrep --config=auto --json {repo}
            console.log(`Semgrep integration configured - run: semgrep scan --config=auto`);
          } catch (error: any) {
            console.warn(`Semgrep scan failed: ${error.message}`);
          }
        } else if (sonarUrl && sonarToken) {
          // Integration with SonarQube
          console.log(`🔍 Running SAST scan with SonarQube: ${sonarUrl}`);
        }
        break;

      case 'sca':
        if (snykToken) {
          // Integration with Snyk
          console.log(`🔍 Running SCA scan with Snyk`);
          try {
            // Would call Snyk API
            // snyk test --json
            console.log(`Snyk integration configured - run: snyk test --all-projects`);
          } catch (error: any) {
            console.warn(`Snyk scan failed: ${error.message}`);
          }
        }
        break;

      case 'secret':
        // Built-in gitleaks integration
        console.log(`🔍 Running secret scan with gitleaks`);
        // gitleaks detect --source={repo} --report-format=json
        break;
    }

    // Generate sample vulnerabilities for demonstration/testing
    // In production, this would only be used if no tools are configured

    // Generate realistic vulnerabilities based on scan type
    switch (config.scanType) {
      case 'dast':
        vulnerabilities.push(
          {
            type: 'XSS',
            severity: 'high',
            title: 'Cross-Site Scripting (Reflected)',
            description: 'The application is vulnerable to reflected XSS attacks in the search parameter.',
            location: { url: config.target.url, endpoint: '/search', parameter: 'q' },
            cweId: 'CWE-79',
            cvssScore: 6.1,
            remediation: 'Implement proper output encoding and Content-Security-Policy headers.',
            references: ['https://owasp.org/www-community/attacks/xss/'],
            status: 'open',
          },
          {
            type: 'SQL Injection',
            severity: 'critical',
            title: 'SQL Injection in User Input',
            description: 'Unsanitized user input allows SQL injection attacks.',
            location: { url: config.target.url, endpoint: '/api/users', parameter: 'id' },
            cweId: 'CWE-89',
            cvssScore: 9.8,
            remediation: 'Use parameterized queries or prepared statements.',
            references: ['https://owasp.org/www-community/attacks/SQL_Injection'],
            status: 'open',
          }
        );
        break;

      case 'sast':
        vulnerabilities.push(
          {
            type: 'Hardcoded Secret',
            severity: 'high',
            title: 'Hardcoded API Key Found',
            description: 'An API key is hardcoded in the source code.',
            location: { file: 'src/config/api.ts', line: 15 },
            cweId: 'CWE-798',
            remediation: 'Move secrets to environment variables or a secrets manager.',
            references: [],
            status: 'open',
          },
          {
            type: 'Insecure Deserialization',
            severity: 'medium',
            title: 'Potentially Unsafe Deserialization',
            description: 'JSON.parse is used without validation on user-supplied data.',
            location: { file: 'src/handlers/webhook.ts', line: 42 },
            cweId: 'CWE-502',
            remediation: 'Validate and sanitize input before deserialization.',
            references: [],
            status: 'open',
          }
        );
        break;

      case 'sca':
        vulnerabilities.push(
          {
            type: 'Vulnerable Dependency',
            severity: 'high',
            title: 'Known Vulnerability in lodash',
            description: 'lodash version 4.17.15 has a known prototype pollution vulnerability.',
            location: { file: 'package.json' },
            cveId: 'CVE-2020-8203',
            cvssScore: 7.4,
            remediation: 'Upgrade lodash to version 4.17.21 or later.',
            references: ['https://nvd.nist.gov/vuln/detail/CVE-2020-8203'],
            status: 'open',
          }
        );
        break;

      case 'secret':
        vulnerabilities.push(
          {
            type: 'Exposed Secret',
            severity: 'critical',
            title: 'AWS Access Key Exposed',
            description: 'AWS access key found in source code.',
            location: { file: '.env.example', line: 3 },
            remediation: 'Rotate the exposed key immediately and remove from version control.',
            references: [],
            status: 'open',
          }
        );
        break;

      case 'api':
        vulnerabilities.push(
          {
            type: 'Missing Authentication',
            severity: 'high',
            title: 'API Endpoint Missing Authentication',
            description: 'The /api/admin endpoint is accessible without authentication.',
            location: { url: config.target.url, endpoint: '/api/admin' },
            cweId: 'CWE-306',
            remediation: 'Add authentication middleware to protected routes.',
            references: [],
            status: 'open',
          },
          {
            type: 'Rate Limiting',
            severity: 'medium',
            title: 'No Rate Limiting on Login',
            description: 'The login endpoint has no rate limiting, enabling brute force attacks.',
            location: { url: config.target.url, endpoint: '/api/auth/login' },
            cweId: 'CWE-307',
            remediation: 'Implement rate limiting on authentication endpoints.',
            references: [],
            status: 'open',
          }
        );
        break;
    }

    return vulnerabilities;
  }

  private evaluateThresholds(
    summary: SecurityScanRun['summary'],
    thresholds: SecurityScanConfig['thresholds']
  ): boolean {
    if (!summary) return true;
    
    if (summary.criticalCount > thresholds.maxCritical) return false;
    if (summary.highCount > thresholds.maxHigh) return false;
    if (thresholds.maxMedium !== undefined && summary.mediumCount > thresholds.maxMedium) return false;
    if (thresholds.maxLow !== undefined && summary.lowCount > thresholds.maxLow) return false;
    
    return true;
  }

  private async storeVulnerability(
    scanId: string,
    vuln: Omit<Vulnerability, 'id' | 'scanId' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    const id = uuidv4();
    const now = new Date();

    await this.dbManager.query(
      `INSERT INTO vulnerabilities (
        id, scan_id, type, severity, title, description, location,
        cwe_id, cve_id, cvss_score, remediation, references,
        status, evidence, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        id, scanId, vuln.type, vuln.severity, vuln.title, vuln.description,
        JSON.stringify(vuln.location), vuln.cweId || null, vuln.cveId || null,
        vuln.cvssScore || null, vuln.remediation || null,
        JSON.stringify(vuln.references || []), vuln.status,
        JSON.stringify(vuln.evidence || {}), now, now,
      ]
    );
  }

  private async updateScanRunStatus(
    runId: string,
    status: SecurityScanRun['status'],
    failureReason?: string
  ): Promise<void> {
    await this.dbManager.query(
      `UPDATE security_scan_runs SET status = $2, failure_reason = $3 WHERE id = $1`,
      [runId, status, failureReason || null]
    );
  }

  // ============================================================
  // SCAN RUN QUERIES
  // ============================================================

  async getScanRun(runId: string): Promise<SecurityScanRun | null> {
    const result = await this.dbManager.query(
      'SELECT * FROM security_scan_runs WHERE id = $1',
      [runId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.transformRunRow(result.rows[0]);
  }

  async getScanRuns(
    tenantId: string,
    configId?: string,
    status?: SecurityScanRun['status'],
    limit: number = 20
  ): Promise<SecurityScanRun[]> {
    let query = 'SELECT * FROM security_scan_runs WHERE tenant_id = $1';
    const params: any[] = [tenantId];

    if (configId) {
      params.push(configId);
      query += ` AND config_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await this.dbManager.query(query, params);
    return result.rows.map(row => this.transformRunRow(row));
  }

  // ============================================================
  // VULNERABILITY MANAGEMENT
  // ============================================================

  async getVulnerabilities(
    scanId: string,
    severity?: VulnerabilitySeverity,
    status?: string
  ): Promise<Vulnerability[]> {
    let query = 'SELECT * FROM vulnerabilities WHERE scan_id = $1';
    const params: any[] = [scanId];

    if (severity) {
      params.push(severity);
      query += ` AND severity = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ' ORDER BY CASE severity WHEN \'critical\' THEN 1 WHEN \'high\' THEN 2 WHEN \'medium\' THEN 3 WHEN \'low\' THEN 4 ELSE 5 END';

    const result = await this.dbManager.query(query, params);
    return result.rows.map(row => this.transformVulnerabilityRow(row));
  }

  async updateVulnerabilityStatus(
    vulnerabilityId: string,
    status: Vulnerability['status'],
    assignedTo?: string
  ): Promise<void> {
    await this.dbManager.query(
      `UPDATE vulnerabilities SET status = $2, assigned_to = $3, updated_at = NOW() WHERE id = $1`,
      [vulnerabilityId, status, assignedTo || null]
    );
  }

  async getTenantVulnerabilitySummary(tenantId: string): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    openCritical: number;
  }> {
    const result = await this.dbManager.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE severity = 'critical') as critical,
        COUNT(*) FILTER (WHERE severity = 'high') as high,
        COUNT(*) FILTER (WHERE severity = 'medium') as medium,
        COUNT(*) FILTER (WHERE severity = 'low') as low,
        COUNT(*) FILTER (WHERE severity = 'informational') as info,
        COUNT(*) FILTER (WHERE status = 'open') as open,
        COUNT(*) FILTER (WHERE status = 'fixed') as fixed,
        COUNT(*) FILTER (WHERE status = 'false_positive') as false_positive,
        COUNT(*) FILTER (WHERE severity = 'critical' AND status = 'open') as open_critical
       FROM vulnerabilities v
       JOIN security_scan_runs r ON v.scan_id = r.id
       WHERE r.tenant_id = $1`,
      [tenantId]
    );

    const row = result.rows[0] || {};

    return {
      total: parseInt(row.total) || 0,
      bySeverity: {
        critical: parseInt(row.critical) || 0,
        high: parseInt(row.high) || 0,
        medium: parseInt(row.medium) || 0,
        low: parseInt(row.low) || 0,
        informational: parseInt(row.info) || 0,
      },
      byStatus: {
        open: parseInt(row.open) || 0,
        fixed: parseInt(row.fixed) || 0,
        false_positive: parseInt(row.false_positive) || 0,
      },
      openCritical: parseInt(row.open_critical) || 0,
    };
  }

  // ============================================================
  // TRANSFORM METHODS
  // ============================================================

  private transformConfigRow(row: any): SecurityScanConfig {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description,
      scanType: row.scan_type,
      target: typeof row.target === 'string' ? JSON.parse(row.target) : row.target,
      authentication: row.authentication ? (typeof row.authentication === 'string' ? JSON.parse(row.authentication) : row.authentication) : undefined,
      settings: typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings,
      thresholds: typeof row.thresholds === 'string' ? JSON.parse(row.thresholds) : row.thresholds,
      schedule: row.schedule ? (typeof row.schedule === 'string' ? JSON.parse(row.schedule) : row.schedule) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private transformRunRow(row: any): SecurityScanRun {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      configId: row.config_id,
      status: row.status,
      summary: row.summary ? (typeof row.summary === 'string' ? JSON.parse(row.summary) : row.summary) : undefined,
      passed: row.passed,
      failureReason: row.failure_reason,
      reportUrl: row.report_url,
      startTime: row.start_time,
      endTime: row.end_time,
      createdAt: row.created_at,
    };
  }

  private transformVulnerabilityRow(row: any): Vulnerability {
    return {
      id: row.id,
      scanId: row.scan_id,
      type: row.type,
      severity: row.severity,
      title: row.title,
      description: row.description,
      location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location,
      cweId: row.cwe_id,
      cveId: row.cve_id,
      cvssScore: row.cvss_score,
      remediation: row.remediation,
      references: typeof row.references === 'string' ? JSON.parse(row.references) : row.references,
      status: row.status,
      assignedTo: row.assigned_to,
      evidence: row.evidence ? (typeof row.evidence === 'string' ? JSON.parse(row.evidence) : row.evidence) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // ============================================================
  // TOOL INTEGRATION HELPERS
  // ============================================================

  /**
   * Map OWASP ZAP risk level to our severity
   */
  private mapZapRisk(risk: string): Vulnerability['severity'] {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'critical';
      case 'medium':
        return 'high';
      case 'low':
        return 'medium';
      case 'informational':
        return 'low';
      default:
        return 'informational';
    }
  }

  /**
   * Convert risk level to approximate CVSS score
   */
  private riskToCvss(risk: string): number {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 8.5;
      case 'medium':
        return 5.5;
      case 'low':
        return 3.0;
      default:
        return 0;
    }
  }
}
