import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { DatabaseManager } from '@shifty/database';
import {
  QualitySession,
  ManualTestStep,
} from '@shifty/shared';

export interface SessionRecording {
  id: string;
  sessionId: string;
  tenantId: string;
  startTime: Date;
  endTime?: Date;
  streamUrl?: string;
  storageUrl?: string;
  browserInfo: {
    browser: string;
    version: string;
    viewport: { width: number; height: number };
    deviceProfile?: string;
  };
  status: 'recording' | 'processing' | 'completed' | 'failed';
}

export interface SessionCollaborator {
  userId: string;
  displayName: string;
  role: 'owner' | 'collaborator' | 'viewer';
  joinedAt: Date;
  lastActiveAt: Date;
}

export interface ExploratoryCharter {
  id: string;
  sessionId: string;
  explore: string;
  with: string;
  toDiscover: string;
  timeBox: number; // minutes
  notes: string[];
  debrief?: {
    summary: string;
    blockers: string[];
    questions: string[];
    bugs: string[];
  };
}

export class ManualSessionHubService {
  private dbManager: DatabaseManager;
  private jiraBaseUrl: string;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
    this.jiraBaseUrl = process.env.JIRA_BASE_URL || 'https://jira.example.com';
  }

  // ============================================================
  // QUALITY SESSIONS
  // ============================================================

  async createSession(
    tenantId: string,
    session: Omit<QualitySession, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'bugsFound' | 'issuesLogged' | 'testStepsCompleted' | 'recordings' | 'screenshots' | 'automationGaps'>
  ): Promise<QualitySession> {
    const id = uuidv4();

    const fullSession: QualitySession = {
      id,
      tenantId,
      ...session,
      bugsFound: 0,
      issuesLogged: [],
      testStepsCompleted: 0,
      automationGaps: [],
      recordings: [],
      screenshots: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO quality_sessions (
        id, tenant_id, user_id, persona, session_type, repo, branch,
        component, risk_level, status, start_ts, title, description,
        charter, bugs_found, issues_logged, test_steps_completed,
        test_steps_total, automation_coverage, automation_gaps,
        recordings, screenshots, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
      [
        id, tenantId, session.userId, session.persona, session.sessionType,
        session.repo || null, session.branch || null, session.component || null,
        session.riskLevel, session.status, session.startTs, session.title,
        session.description || null, session.charter || null, 0, '[]', 0,
        session.testStepsTotal || null, null, '[]', '[]', '[]',
        fullSession.createdAt, fullSession.updatedAt,
      ]
    );

    console.log(`📋 Created quality session: ${id} (${session.sessionType})`);
    return fullSession;
  }

  async getSession(sessionId: string): Promise<QualitySession | null> {
    const result = await this.dbManager.query(
      'SELECT * FROM quality_sessions WHERE id = $1',
      [sessionId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.transformSessionRow(result.rows[0]);
  }

  async updateSession(
    sessionId: string,
    updates: Partial<Omit<QualitySession, 'id' | 'tenantId' | 'createdAt'>>
  ): Promise<QualitySession | null> {
    const existing = await this.getSession(sessionId);
    if (!existing) {
      return null;
    }

    const updated = { ...existing, ...updates, updatedAt: new Date() };

    await this.dbManager.query(
      `UPDATE quality_sessions SET
        status = $2, end_ts = $3, notes = $4, bugs_found = $5,
        issues_logged = $6, test_steps_completed = $7,
        automation_coverage = $8, automation_gaps = $9,
        recordings = $10, screenshots = $11, updated_at = $12
       WHERE id = $1`,
      [
        sessionId, updated.status, updated.endTs || null,
        updated.notes || null, updated.bugsFound,
        JSON.stringify(updated.issuesLogged), updated.testStepsCompleted,
        updated.automationCoverage || null, JSON.stringify(updated.automationGaps),
        JSON.stringify(updated.recordings), JSON.stringify(updated.screenshots),
        updated.updatedAt,
      ]
    );

    return updated;
  }

  async completeSession(
    sessionId: string,
    summary: {
      notes?: string;
      bugsFound?: number;
      testStepsCompleted?: number;
      automationCoverage?: number;
    }
  ): Promise<QualitySession | null> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return null;
    }

    return this.updateSession(sessionId, {
      status: 'completed',
      endTs: new Date(),
      ...summary,
    });
  }

  async abandonSession(sessionId: string, reason?: string): Promise<void> {
    await this.updateSession(sessionId, {
      status: 'abandoned',
      endTs: new Date(),
      notes: reason,
    });
  }

  async getUserActiveSessions(userId: string, tenantId: string): Promise<QualitySession[]> {
    const result = await this.dbManager.query(
      `SELECT * FROM quality_sessions 
       WHERE user_id = $1 AND tenant_id = $2 AND status IN ('active', 'paused')
       ORDER BY start_ts DESC`,
      [userId, tenantId]
    );

    return result.rows.map(row => this.transformSessionRow(row));
  }

  async getTenantSessions(
    tenantId: string,
    filters?: {
      persona?: string;
      sessionType?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 50
  ): Promise<QualitySession[]> {
    let query = 'SELECT * FROM quality_sessions WHERE tenant_id = $1';
    const params: any[] = [tenantId];

    if (filters?.persona) {
      params.push(filters.persona);
      query += ` AND persona = $${params.length}`;
    }

    if (filters?.sessionType) {
      params.push(filters.sessionType);
      query += ` AND session_type = $${params.length}`;
    }

    if (filters?.status) {
      params.push(filters.status);
      query += ` AND status = $${params.length}`;
    }

    if (filters?.startDate) {
      params.push(filters.startDate);
      query += ` AND start_ts >= $${params.length}`;
    }

    if (filters?.endDate) {
      params.push(filters.endDate);
      query += ` AND start_ts <= $${params.length}`;
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await this.dbManager.query(query, params);
    return result.rows.map(row => this.transformSessionRow(row));
  }

  // ============================================================
  // TEST STEPS
  // ============================================================

  async addTestStep(
    sessionId: string,
    step: Omit<ManualTestStep, 'id' | 'sessionId' | 'tenantId' | 'createdAt' | 'updatedAt' | 'comments'>
  ): Promise<ManualTestStep> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const id = uuidv4();

    const fullStep: ManualTestStep = {
      id,
      sessionId,
      tenantId: session.tenantId,
      ...step,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO manual_test_steps (
        id, session_id, tenant_id, sequence, action, expected_result,
        actual_result, status, attachments, jira_issue_id, confidence,
        notes, comments, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        id, sessionId, session.tenantId, step.sequence, step.action,
        step.expectedResult || null, step.actualResult || null,
        step.status, JSON.stringify(step.attachments),
        step.jiraIssueId || null, step.confidence,
        step.notes || null, '[]', fullStep.createdAt, fullStep.updatedAt,
      ]
    );

    // Update session step count
    await this.dbManager.query(
      `UPDATE quality_sessions SET test_steps_completed = test_steps_completed + 1 WHERE id = $1`,
      [sessionId]
    );

    return fullStep;
  }

  async updateTestStep(
    stepId: string,
    updates: Partial<Omit<ManualTestStep, 'id' | 'sessionId' | 'tenantId' | 'createdAt'>>
  ): Promise<ManualTestStep | null> {
    const existing = await this.getTestStep(stepId);
    if (!existing) {
      return null;
    }

    const updated = { ...existing, ...updates, updatedAt: new Date() };

    await this.dbManager.query(
      `UPDATE manual_test_steps SET
        actual_result = $2, status = $3, attachments = $4,
        jira_issue_id = $5, confidence = $6, notes = $7,
        comments = $8, updated_at = $9
       WHERE id = $1`,
      [
        stepId, updated.actualResult, updated.status,
        JSON.stringify(updated.attachments), updated.jiraIssueId,
        updated.confidence, updated.notes,
        JSON.stringify(updated.comments), updated.updatedAt,
      ]
    );

    return updated;
  }

  async getTestStep(stepId: string): Promise<ManualTestStep | null> {
    const result = await this.dbManager.query(
      'SELECT * FROM manual_test_steps WHERE id = $1',
      [stepId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.transformStepRow(result.rows[0]);
  }

  async getSessionSteps(sessionId: string): Promise<ManualTestStep[]> {
    const result = await this.dbManager.query(
      'SELECT * FROM manual_test_steps WHERE session_id = $1 ORDER BY sequence',
      [sessionId]
    );

    return result.rows.map(row => this.transformStepRow(row));
  }

  async addStepComment(
    stepId: string,
    userId: string,
    text: string
  ): Promise<void> {
    const step = await this.getTestStep(stepId);
    if (!step) {
      throw new Error(`Step not found: ${stepId}`);
    }

    const comments = [...step.comments, { userId, text, timestamp: new Date() }];

    await this.dbManager.query(
      `UPDATE manual_test_steps SET comments = $2, updated_at = NOW() WHERE id = $1`,
      [stepId, JSON.stringify(comments)]
    );
  }

  // ============================================================
  // SESSION RECORDINGS
  // ============================================================

  async startRecording(sessionId: string, browserInfo: SessionRecording['browserInfo']): Promise<SessionRecording> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const id = uuidv4();
    const recording: SessionRecording = {
      id,
      sessionId,
      tenantId: session.tenantId,
      startTime: new Date(),
      browserInfo,
      status: 'recording',
    };

    await this.dbManager.query(
      `INSERT INTO session_recordings (
        id, session_id, tenant_id, start_time, browser_info, status
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, sessionId, session.tenantId, recording.startTime, JSON.stringify(browserInfo), 'recording']
    );

    // Update session recordings
    const recordings = [...session.recordings, id];
    await this.dbManager.query(
      `UPDATE quality_sessions SET recordings = $2 WHERE id = $1`,
      [sessionId, JSON.stringify(recordings)]
    );

    console.log(`🎥 Started recording for session: ${sessionId}`);
    return recording;
  }

  async stopRecording(recordingId: string, storageUrl?: string): Promise<void> {
    await this.dbManager.query(
      `UPDATE session_recordings SET 
        end_time = NOW(), storage_url = $2, status = 'completed' 
       WHERE id = $1`,
      [recordingId, storageUrl || null]
    );
  }

  async getSessionRecordings(sessionId: string): Promise<SessionRecording[]> {
    const result = await this.dbManager.query(
      'SELECT * FROM session_recordings WHERE session_id = $1 ORDER BY start_time',
      [sessionId]
    );

    return result.rows.map(row => ({
      id: row.id,
      sessionId: row.session_id,
      tenantId: row.tenant_id,
      startTime: row.start_time,
      endTime: row.end_time,
      streamUrl: row.stream_url,
      storageUrl: row.storage_url,
      browserInfo: typeof row.browser_info === 'string' ? JSON.parse(row.browser_info) : row.browser_info,
      status: row.status,
    }));
  }

  // ============================================================
  // EXPLORATORY TESTING
  // ============================================================

  async createExploratoryCharter(
    sessionId: string,
    charter: Omit<ExploratoryCharter, 'id' | 'sessionId' | 'notes' | 'debrief'>
  ): Promise<ExploratoryCharter> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const id = uuidv4();
    const fullCharter: ExploratoryCharter = {
      id,
      sessionId,
      ...charter,
      notes: [],
    };

    await this.dbManager.query(
      `INSERT INTO exploratory_charters (
        id, session_id, explore, with_resources, to_discover, time_box, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, sessionId, charter.explore, charter.with, charter.toDiscover, charter.timeBox, '[]']
    );

    // Update session charter
    await this.dbManager.query(
      `UPDATE quality_sessions SET charter = $2 WHERE id = $1`,
      [sessionId, `Explore ${charter.explore} with ${charter.with} to discover ${charter.toDiscover}`]
    );

    return fullCharter;
  }

  async addCharterNote(charterId: string, note: string): Promise<void> {
    const result = await this.dbManager.query(
      'SELECT notes FROM exploratory_charters WHERE id = $1',
      [charterId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Charter not found: ${charterId}`);
    }

    const notes = typeof result.rows[0].notes === 'string' 
      ? JSON.parse(result.rows[0].notes) 
      : result.rows[0].notes;
    
    notes.push(note);

    await this.dbManager.query(
      'UPDATE exploratory_charters SET notes = $2 WHERE id = $1',
      [charterId, JSON.stringify(notes)]
    );
  }

  async completeCharter(charterId: string, debrief: ExploratoryCharter['debrief']): Promise<void> {
    await this.dbManager.query(
      'UPDATE exploratory_charters SET debrief = $2 WHERE id = $1',
      [charterId, JSON.stringify(debrief)]
    );
  }

  // ============================================================
  // JIRA INTEGRATION
  // ============================================================

  async exportToJira(
    sessionId: string,
    stepId?: string,
    issueDetails?: {
      summary: string;
      description: string;
      issueType: string;
      priority: string;
      labels?: string[];
      components?: string[];
    }
  ): Promise<{ jiraKey: string; url: string }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Generate issue details from session if not provided
    const summary = issueDetails?.summary || `Bug found in ${session.component || 'application'}`;
    const description = issueDetails?.description || this.generateJiraDescription(session, stepId);

    let jiraKey: string;
    let jiraUrl: string;

    // Check if Jira integration is enabled
    const jiraEnabled = process.env.JIRA_ENABLED === 'true';
    const jiraApiToken = process.env.JIRA_API_TOKEN;
    const jiraProjectKey = process.env.JIRA_PROJECT_KEY || 'QE';

    if (jiraEnabled && jiraApiToken && this.jiraBaseUrl) {
      try {
        // Create issue via Jira REST API
        const response = await axios.post(
          `${this.jiraBaseUrl}/rest/api/3/issue`,
          {
            fields: {
              project: { key: jiraProjectKey },
              summary,
              description: {
                type: 'doc',
                version: 1,
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: description }],
                  },
                ],
              },
              issuetype: { name: issueDetails?.issueType || 'Bug' },
              priority: { name: issueDetails?.priority || 'Medium' },
              labels: issueDetails?.labels || ['shifty-qa'],
            },
          },
          {
            headers: {
              'Authorization': `Basic ${jiraApiToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        jiraKey = response.data.key;
        jiraUrl = `${this.jiraBaseUrl}/browse/${jiraKey}`;
        console.log(`🎫 Created Jira issue: ${jiraKey}`);
      } catch (error: any) {
        console.error('Failed to create Jira issue:', error.message);
        // Fall back to local tracking
        jiraKey = `LOCAL-${Date.now()}`;
        jiraUrl = `local://${jiraKey}`;
      }
    } else {
      // Local tracking mode when Jira is not configured
      jiraKey = `LOCAL-${Date.now()}`;
      jiraUrl = `local://${jiraKey}`;
      console.warn('Jira integration not configured. Using local issue tracking. Set JIRA_ENABLED=true, JIRA_BASE_URL, and JIRA_API_TOKEN to enable.');
    }

    // Update session with issue
    const issuesLogged = [...session.issuesLogged, jiraKey];
    await this.dbManager.query(
      `UPDATE quality_sessions SET 
        issues_logged = $2, bugs_found = bugs_found + 1 
       WHERE id = $1`,
      [sessionId, JSON.stringify(issuesLogged)]
    );

    // Update step if provided
    if (stepId) {
      await this.dbManager.query(
        'UPDATE manual_test_steps SET jira_issue_id = $2 WHERE id = $1',
        [stepId, jiraKey]
      );
    }

    return {
      jiraKey,
      url: jiraUrl,
    };
  }

  private generateJiraDescription(session: QualitySession, stepId?: string): string {
    let description = `*Session Details*\n`;
    description += `- Type: ${session.sessionType}\n`;
    description += `- Component: ${session.component || 'N/A'}\n`;
    description += `- Risk Level: ${session.riskLevel}\n`;
    description += `- Repo: ${session.repo || 'N/A'}\n`;
    description += `- Branch: ${session.branch || 'N/A'}\n\n`;

    if (session.charter) {
      description += `*Charter*\n${session.charter}\n\n`;
    }

    description += `*Notes*\n${session.notes || 'No notes provided'}\n`;

    return description;
  }

  // ============================================================
  // AUTOMATION GAP ANALYSIS
  // ============================================================

  async addAutomationGap(
    sessionId: string,
    gap: {
      description: string;
      priority: 'high' | 'medium' | 'low';
      estimatedEffort: string;
    }
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const gaps = [...session.automationGaps, gap];

    await this.dbManager.query(
      `UPDATE quality_sessions SET automation_gaps = $2, updated_at = NOW() WHERE id = $1`,
      [sessionId, JSON.stringify(gaps)]
    );
  }

  async getAutomationGapReport(tenantId: string): Promise<{
    totalGaps: number;
    byPriority: Record<string, number>;
    estimatedEffort: string;
    topGaps: Array<{ description: string; count: number; priority: string }>;
  }> {
    const result = await this.dbManager.query(
      `SELECT automation_gaps FROM quality_sessions 
       WHERE tenant_id = $1 AND automation_gaps != '[]'`,
      [tenantId]
    );

    const allGaps: any[] = [];
    for (const row of result.rows) {
      const gaps = typeof row.automation_gaps === 'string' 
        ? JSON.parse(row.automation_gaps) 
        : row.automation_gaps;
      allGaps.push(...gaps);
    }

    const byPriority = {
      high: allGaps.filter(g => g.priority === 'high').length,
      medium: allGaps.filter(g => g.priority === 'medium').length,
      low: allGaps.filter(g => g.priority === 'low').length,
    };

    // Count gaps by description
    const gapCounts = new Map<string, { count: number; priority: string }>();
    for (const gap of allGaps) {
      const key = gap.description.toLowerCase();
      const existing = gapCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        gapCounts.set(key, { count: 1, priority: gap.priority });
      }
    }

    const topGaps = Array.from(gapCounts.entries())
      .map(([description, data]) => ({ description, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalGaps: allGaps.length,
      byPriority,
      estimatedEffort: `${allGaps.length * 2} hours`, // rough estimate
      topGaps,
    };
  }

  // ============================================================
  // SESSION SUMMARY
  // ============================================================

  async getSessionSummary(sessionId: string): Promise<{
    session: QualitySession;
    steps: ManualTestStep[];
    recordings: SessionRecording[];
    metrics: {
      duration: number;
      passRate: number;
      bugsPerHour: number;
      automationGapCount: number;
    };
    recommendations: string[];
  }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const steps = await this.getSessionSteps(sessionId);
    const recordings = await this.getSessionRecordings(sessionId);

    const duration = session.endTs
      ? (session.endTs.getTime() - session.startTs.getTime()) / (1000 * 60) // minutes
      : (Date.now() - session.startTs.getTime()) / (1000 * 60);

    const passedSteps = steps.filter(s => s.status === 'passed').length;
    const passRate = steps.length > 0 ? (passedSteps / steps.length) * 100 : 0;
    const bugsPerHour = duration > 0 ? (session.bugsFound / (duration / 60)) : 0;

    const recommendations: string[] = [];

    if (passRate < 80) {
      recommendations.push('Consider investigating the failed test steps for potential issues');
    }

    if (session.automationGaps.length > 0) {
      recommendations.push(`${session.automationGaps.length} automation gaps identified - consider creating automated tests`);
    }

    if (bugsPerHour > 2) {
      recommendations.push('High bug discovery rate - this area may need additional testing');
    }

    if (session.sessionType === 'exploratory' && !session.charter) {
      recommendations.push('Consider defining a charter for focused exploratory testing');
    }

    return {
      session,
      steps,
      recordings,
      metrics: {
        duration,
        passRate,
        bugsPerHour,
        automationGapCount: session.automationGaps.length,
      },
      recommendations,
    };
  }

  // ============================================================
  // TRANSFORM METHODS
  // ============================================================

  private transformSessionRow(row: any): QualitySession {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      userId: row.user_id,
      persona: row.persona,
      sessionType: row.session_type,
      repo: row.repo,
      branch: row.branch,
      component: row.component,
      riskLevel: row.risk_level,
      status: row.status,
      startTs: row.start_ts,
      endTs: row.end_ts,
      title: row.title,
      description: row.description,
      charter: row.charter,
      notes: row.notes,
      bugsFound: row.bugs_found || 0,
      issuesLogged: typeof row.issues_logged === 'string' ? JSON.parse(row.issues_logged) : (row.issues_logged || []),
      testStepsCompleted: row.test_steps_completed || 0,
      testStepsTotal: row.test_steps_total,
      automationCoverage: row.automation_coverage,
      automationGaps: typeof row.automation_gaps === 'string' ? JSON.parse(row.automation_gaps) : (row.automation_gaps || []),
      recordings: typeof row.recordings === 'string' ? JSON.parse(row.recordings) : (row.recordings || []),
      screenshots: typeof row.screenshots === 'string' ? JSON.parse(row.screenshots) : (row.screenshots || []),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private transformStepRow(row: any): ManualTestStep {
    return {
      id: row.id,
      sessionId: row.session_id,
      tenantId: row.tenant_id,
      sequence: row.sequence,
      action: row.action,
      expectedResult: row.expected_result,
      actualResult: row.actual_result,
      status: row.status,
      attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments) : (row.attachments || []),
      jiraIssueId: row.jira_issue_id,
      confidence: row.confidence,
      notes: row.notes,
      comments: typeof row.comments === 'string' ? JSON.parse(row.comments) : (row.comments || []),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
