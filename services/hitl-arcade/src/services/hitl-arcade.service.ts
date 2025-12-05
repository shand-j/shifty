import { v4 as uuidv4 } from 'uuid';
import { DatabaseManager } from '@shifty/database';
import {
  Mission,
  MissionType,
  MissionDifficulty,
  MissionStatus,
  ArcadeUserProfile,
  Badge,
  LeaderboardEntry,
  LeaderboardType,
  MissionFeedback,
  HITLDataset,
  DailyChallenge,
  ArcadeStats,
} from '@shifty/shared';

// XP requirements per level
const XP_PER_LEVEL = [
  0, 100, 250, 500, 1000, 1500, 2500, 4000, 6000, 9000, 13000, 18000, 25000, 35000, 50000
];

// Badge definitions
const BADGES: Badge[] = [
  { id: 'first_mission', name: 'First Steps', description: 'Complete your first mission', iconUrl: '/badges/first.png', category: 'achievement', rarity: 'common', criteria: { type: 'missions_completed', threshold: 1 } },
  { id: 'ten_missions', name: 'Mission Master', description: 'Complete 10 missions', iconUrl: '/badges/ten.png', category: 'achievement', rarity: 'uncommon', criteria: { type: 'missions_completed', threshold: 10 } },
  { id: 'hundred_missions', name: 'Legend', description: 'Complete 100 missions', iconUrl: '/badges/hundred.png', category: 'achievement', rarity: 'epic', criteria: { type: 'missions_completed', threshold: 100 } },
  { id: 'week_streak', name: 'Consistent', description: 'Maintain a 7-day streak', iconUrl: '/badges/streak7.png', category: 'milestone', rarity: 'uncommon', criteria: { type: 'streak_days', threshold: 7 } },
  { id: 'month_streak', name: 'Dedicated', description: 'Maintain a 30-day streak', iconUrl: '/badges/streak30.png', category: 'milestone', rarity: 'rare', criteria: { type: 'streak_days', threshold: 30 } },
  { id: 'high_accuracy', name: 'Sharp Eye', description: 'Achieve 95% accuracy', iconUrl: '/badges/accuracy.png', category: 'achievement', rarity: 'rare', criteria: { type: 'accuracy', threshold: 0.95 } },
  { id: 'level_10', name: 'Rising Star', description: 'Reach level 10', iconUrl: '/badges/level10.png', category: 'milestone', rarity: 'uncommon', criteria: { type: 'level', threshold: 10 } },
];

export class HITLArcadeService {
  private dbManager: DatabaseManager;

  constructor(dbManager: DatabaseManager) {
    this.dbManager = dbManager;
  }

  // ==================== User Profile ====================

  /**
   * Get or create user profile
   */
  async getOrCreateProfile(userId: string, tenantId: string, displayName?: string): Promise<ArcadeUserProfile> {
    // Try to get existing profile
    const existing = await this.getProfile(userId, tenantId);
    if (existing) {
      return existing;
    }

    // Create new profile
    const profile: ArcadeUserProfile = {
      userId,
      tenantId,
      displayName: displayName || `User-${userId.slice(0, 8)}`,
      level: 1,
      xp: 0,
      xpToNextLevel: XP_PER_LEVEL[1],
      coins: 100, // Starting bonus
      streakDays: 0,
      longestStreak: 0,
      lastActiveAt: new Date(),
      totalMissionsCompleted: 0,
      totalXpEarned: 0,
      accuracy: 0,
      expertiseAreas: [],
      badges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO arcade_profiles (
        user_id, tenant_id, display_name, level, xp, xp_to_next_level,
        coins, streak_days, longest_streak, last_active_at, total_missions_completed,
        total_xp_earned, accuracy, expertise_areas, badges, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        userId, tenantId, profile.displayName, 1, 0, XP_PER_LEVEL[1],
        100, 0, 0, new Date(), 0, 0, 0, JSON.stringify([]), JSON.stringify([]),
        profile.createdAt, profile.updatedAt,
      ]
    );

    console.log(`🎮 Created arcade profile for user ${userId}`);
    return profile;
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string, tenantId: string): Promise<ArcadeUserProfile | null> {
    const query = 'SELECT * FROM arcade_profiles WHERE user_id = $1 AND tenant_id = $2';
    const result = await this.dbManager.query(query, [userId, tenantId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformProfileRow(result.rows[0]);
  }

  /**
   * Update user display name
   */
  async updateDisplayName(userId: string, tenantId: string, displayName: string): Promise<void> {
    await this.dbManager.query(
      'UPDATE arcade_profiles SET display_name = $3, updated_at = NOW() WHERE user_id = $1 AND tenant_id = $2',
      [userId, tenantId, displayName]
    );
  }

  // ==================== Missions ====================

  /**
   * Create a new mission
   */
  async createMission(
    tenantId: string,
    missionData: Omit<Mission, 'id' | 'tenantId' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<Mission> {
    const missionId = uuidv4();

    const mission: Mission = {
      id: missionId,
      tenantId,
      ...missionData,
      status: 'available',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO arcade_missions (
        id, tenant_id, type, difficulty, status, title, description, instructions,
        xp_reward, coin_reward, time_estimate_minutes, expires_at, required_skill_level,
        payload, assigned_to, assigned_at, completed_by, completed_at, result,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [
        missionId, tenantId, mission.type, mission.difficulty, 'available',
        mission.title, mission.description, mission.instructions,
        mission.xpReward, mission.coinReward, mission.timeEstimateMinutes,
        mission.expiresAt || null, mission.requiredSkillLevel, JSON.stringify(mission.payload),
        null, null, null, null, null, mission.createdAt, mission.updatedAt,
      ]
    );

    console.log(`🎯 Created mission: ${missionId}`);
    return mission;
  }

  /**
   * Get available missions for a user
   */
  async getAvailableMissions(
    userId: string,
    tenantId: string,
    limit: number = 10
  ): Promise<Mission[]> {
    const profile = await this.getProfile(userId, tenantId);
    const skillLevel = profile?.level || 1;

    const query = `
      SELECT * FROM arcade_missions 
      WHERE tenant_id = $1 
        AND status = 'available'
        AND required_skill_level <= $2
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY xp_reward DESC
      LIMIT $3
    `;
    
    const result = await this.dbManager.query(query, [tenantId, skillLevel, limit]);
    return result.rows.map(row => this.transformMissionRow(row));
  }

  /**
   * Assign mission to user
   */
  async assignMission(missionId: string, userId: string): Promise<Mission> {
    const mission = await this.getMission(missionId);
    if (!mission) {
      throw new Error(`Mission not found: ${missionId}`);
    }

    if (mission.status !== 'available') {
      throw new Error(`Mission not available: ${mission.status}`);
    }

    await this.dbManager.query(
      `UPDATE arcade_missions SET 
        status = 'assigned', assigned_to = $2, assigned_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [missionId, userId]
    );

    mission.status = 'assigned';
    mission.assignedTo = userId;
    mission.assignedAt = new Date();

    console.log(`📌 Assigned mission ${missionId} to user ${userId}`);
    return mission;
  }

  /**
   * Start working on a mission
   */
  async startMission(missionId: string, userId: string): Promise<Mission> {
    const mission = await this.getMission(missionId);
    if (!mission) {
      throw new Error(`Mission not found: ${missionId}`);
    }

    if (mission.assignedTo !== userId) {
      throw new Error('Mission not assigned to this user');
    }

    await this.dbManager.query(
      `UPDATE arcade_missions SET status = 'in_progress', updated_at = NOW() WHERE id = $1`,
      [missionId]
    );

    mission.status = 'in_progress';
    return mission;
  }

  /**
   * Complete a mission
   */
  async completeMission(
    missionId: string,
    userId: string,
    result: Record<string, unknown>
  ): Promise<{ mission: Mission; xpGained: number; coinsGained: number; levelUp: boolean; newBadges: string[] }> {
    const mission = await this.getMission(missionId);
    if (!mission) {
      throw new Error(`Mission not found: ${missionId}`);
    }

    if (mission.assignedTo !== userId) {
      throw new Error('Mission not assigned to this user');
    }

    // Update mission
    await this.dbManager.query(
      `UPDATE arcade_missions SET 
        status = 'completed', completed_by = $2, completed_at = NOW(), result = $3, updated_at = NOW()
       WHERE id = $1`,
      [missionId, userId, JSON.stringify(result)]
    );

    mission.status = 'completed';
    mission.completedBy = userId;
    mission.completedAt = new Date();
    mission.result = result;

    // Get user profile
    const profile = await this.getProfile(userId, mission.tenantId);
    if (!profile) {
      throw new Error(`Profile not found for user: ${userId}`);
    }

    // Calculate rewards
    const xpGained = mission.xpReward;
    const coinsGained = mission.coinReward;

    // Update profile
    const newXp = profile.xp + xpGained;
    const newCoins = profile.coins + coinsGained;
    const newTotalXp = profile.totalXpEarned + xpGained;
    const newMissionsCompleted = profile.totalMissionsCompleted + 1;

    // Check for level up
    let newLevel = profile.level;
    let levelUp = false;
    while (newLevel < XP_PER_LEVEL.length - 1 && newXp >= XP_PER_LEVEL[newLevel]) {
      newLevel++;
      levelUp = true;
    }
    const xpToNextLevel = newLevel < XP_PER_LEVEL.length - 1 ? XP_PER_LEVEL[newLevel] : newXp;

    // Update streak
    const lastActive = profile.lastActiveAt;
    const today = new Date();
    const daysSinceLastActive = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    let newStreakDays = profile.streakDays;
    if (daysSinceLastActive === 0) {
      // Same day, no change
    } else if (daysSinceLastActive === 1) {
      // Consecutive day
      newStreakDays++;
    } else {
      // Streak broken
      newStreakDays = 1;
    }
    const newLongestStreak = Math.max(profile.longestStreak, newStreakDays);

    // Check for new badges
    const newBadges: string[] = [];
    for (const badge of BADGES) {
      if (profile.badges.includes(badge.id)) continue;

      let earned = false;
      switch (badge.criteria.type) {
        case 'missions_completed':
          earned = newMissionsCompleted >= (badge.criteria.threshold || 0);
          break;
        case 'streak_days':
          earned = newStreakDays >= (badge.criteria.threshold || 0);
          break;
        case 'level':
          earned = newLevel >= (badge.criteria.threshold || 0);
          break;
        case 'accuracy':
          earned = profile.accuracy >= (badge.criteria.threshold || 0);
          break;
      }

      if (earned) {
        newBadges.push(badge.id);
      }
    }

    const allBadges = [...profile.badges, ...newBadges];

    // Save profile updates
    await this.dbManager.query(
      `UPDATE arcade_profiles SET 
        xp = $3, coins = $4, level = $5, xp_to_next_level = $6,
        streak_days = $7, longest_streak = $8, last_active_at = NOW(),
        total_missions_completed = $9, total_xp_earned = $10, badges = $11,
        updated_at = NOW()
       WHERE user_id = $1 AND tenant_id = $2`,
      [
        userId, mission.tenantId, newXp, newCoins, newLevel, xpToNextLevel,
        newStreakDays, newLongestStreak, newMissionsCompleted, newTotalXp,
        JSON.stringify(allBadges),
      ]
    );

    // Create mission feedback record for training
    await this.createMissionFeedback(mission, userId, result);

    console.log(`✅ Mission completed: ${missionId} by ${userId} (+${xpGained} XP, +${coinsGained} coins)`);

    return {
      mission,
      xpGained,
      coinsGained,
      levelUp,
      newBadges,
    };
  }

  /**
   * Get mission by ID
   */
  async getMission(missionId: string): Promise<Mission | null> {
    const query = 'SELECT * FROM arcade_missions WHERE id = $1';
    const result = await this.dbManager.query(query, [missionId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformMissionRow(result.rows[0]);
  }

  /**
   * Get user's active missions
   */
  async getUserActiveMissions(userId: string, tenantId: string): Promise<Mission[]> {
    const query = `
      SELECT * FROM arcade_missions 
      WHERE tenant_id = $1 AND assigned_to = $2 AND status IN ('assigned', 'in_progress')
      ORDER BY assigned_at DESC
    `;
    const result = await this.dbManager.query(query, [tenantId, userId]);
    return result.rows.map(row => this.transformMissionRow(row));
  }

  /**
   * Get user's completed missions
   */
  async getUserCompletedMissions(userId: string, tenantId: string, limit: number = 20): Promise<Mission[]> {
    const query = `
      SELECT * FROM arcade_missions 
      WHERE tenant_id = $1 AND completed_by = $2 AND status = 'completed'
      ORDER BY completed_at DESC
      LIMIT $3
    `;
    const result = await this.dbManager.query(query, [tenantId, userId, limit]);
    return result.rows.map(row => this.transformMissionRow(row));
  }

  // ==================== Leaderboards ====================

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    tenantId: string,
    type: LeaderboardType,
    limit: number = 10
  ): Promise<LeaderboardEntry[]> {
    let query: string;
    let orderBy: string;

    switch (type) {
      case 'xp_all_time':
        orderBy = 'total_xp_earned DESC';
        break;
      case 'xp_weekly':
      case 'xp_monthly':
        // Would need additional tracking for time-based XP
        orderBy = 'total_xp_earned DESC';
        break;
      case 'missions_all_time':
      case 'missions_weekly':
        orderBy = 'total_missions_completed DESC';
        break;
      case 'accuracy':
        orderBy = 'accuracy DESC';
        break;
      case 'streak':
        orderBy = 'streak_days DESC';
        break;
      default:
        orderBy = 'total_xp_earned DESC';
    }

    query = `
      SELECT user_id, display_name, avatar_url, level, ${this.getScoreColumn(type)} as score, badges
      FROM arcade_profiles
      WHERE tenant_id = $1
      ORDER BY ${orderBy}
      LIMIT $2
    `;

    const result = await this.dbManager.query(query, [tenantId, limit]);
    
    return result.rows.map((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      level: row.level,
      score: parseFloat(row.score) || 0,
      badges: typeof row.badges === 'string' ? JSON.parse(row.badges) : row.badges,
    }));
  }

  private getScoreColumn(type: LeaderboardType): string {
    switch (type) {
      case 'xp_all_time':
      case 'xp_weekly':
      case 'xp_monthly':
        return 'total_xp_earned';
      case 'missions_all_time':
      case 'missions_weekly':
        return 'total_missions_completed';
      case 'accuracy':
        return 'accuracy';
      case 'streak':
        return 'streak_days';
      default:
        return 'total_xp_earned';
    }
  }

  // ==================== Datasets ====================

  /**
   * Create HITL dataset
   */
  async createDataset(
    tenantId: string,
    name: string,
    missionType: MissionType,
    description?: string
  ): Promise<HITLDataset> {
    const datasetId = uuidv4();

    const dataset: HITLDataset = {
      id: datasetId,
      tenantId,
      name,
      description,
      missionType,
      sampleCount: 0,
      status: 'collecting',
      minAgreementThreshold: 0.8,
      reviewsPerSample: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.dbManager.query(
      `INSERT INTO hitl_datasets (
        id, tenant_id, name, description, mission_type, sample_count, quality_score,
        status, min_agreement_threshold, reviews_per_sample, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        datasetId, tenantId, name, description || null, missionType,
        0, null, 'collecting', 0.8, 3, dataset.createdAt, dataset.updatedAt,
      ]
    );

    console.log(`📊 Created HITL dataset: ${datasetId}`);
    return dataset;
  }

  /**
   * Get dataset
   */
  async getDataset(datasetId: string): Promise<HITLDataset | null> {
    const query = 'SELECT * FROM hitl_datasets WHERE id = $1';
    const result = await this.dbManager.query(query, [datasetId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.transformDatasetRow(result.rows[0]);
  }

  /**
   * Get tenant datasets
   */
  async getTenantDatasets(tenantId: string): Promise<HITLDataset[]> {
    const query = 'SELECT * FROM hitl_datasets WHERE tenant_id = $1 ORDER BY created_at DESC';
    const result = await this.dbManager.query(query, [tenantId]);
    return result.rows.map(row => this.transformDatasetRow(row));
  }

  /**
   * Add feedback to dataset
   */
  async addFeedbackToDataset(datasetId: string, feedbackId: string): Promise<void> {
    // Mark feedback as used for training
    await this.dbManager.query(
      `UPDATE mission_feedback SET used_for_training = true, dataset_id = $2, updated_at = NOW()
       WHERE id = $1`,
      [feedbackId, datasetId]
    );

    // Increment sample count
    await this.dbManager.query(
      `UPDATE hitl_datasets SET sample_count = sample_count + 1, updated_at = NOW()
       WHERE id = $1`,
      [datasetId]
    );
  }

  // ==================== Statistics ====================

  /**
   * Get arcade statistics
   */
  async getArcadeStats(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<ArcadeStats> {
    // Get user counts
    const usersQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE last_active_at >= $2) as active
      FROM arcade_profiles
      WHERE tenant_id = $1
    `;
    const usersResult = await this.dbManager.query(usersQuery, [tenantId, periodStart]);

    // Get mission counts
    const missionsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'available') as available
      FROM arcade_missions
      WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
    `;
    const missionsResult = await this.dbManager.query(missionsQuery, [tenantId, periodStart, periodEnd]);

    // Get feedback/sample count
    const samplesQuery = `
      SELECT COUNT(*) as total FROM mission_feedback
      WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3
    `;
    const samplesResult = await this.dbManager.query(samplesQuery, [tenantId, periodStart, periodEnd]);

    // Get average accuracy
    const accuracyQuery = `
      SELECT AVG(accuracy) as avg_accuracy FROM arcade_profiles
      WHERE tenant_id = $1 AND accuracy > 0
    `;
    const accuracyResult = await this.dbManager.query(accuracyQuery, [tenantId]);

    // Get top contributors
    const topQuery = `
      SELECT user_id, display_name, total_missions_completed as contributions
      FROM arcade_profiles
      WHERE tenant_id = $1
      ORDER BY total_missions_completed DESC
      LIMIT 5
    `;
    const topResult = await this.dbManager.query(topQuery, [tenantId]);

    return {
      tenantId,
      periodStart,
      periodEnd,
      totalUsers: parseInt(usersResult.rows[0]?.total || 0),
      activeUsers: parseInt(usersResult.rows[0]?.active || 0),
      missionsCompleted: parseInt(missionsResult.rows[0]?.completed || 0),
      missionsAvailable: parseInt(missionsResult.rows[0]?.available || 0),
      samplesGenerated: parseInt(samplesResult.rows[0]?.total || 0),
      averageAccuracy: parseFloat(accuracyResult.rows[0]?.avg_accuracy || 0),
      topContributors: topResult.rows.map(row => ({
        userId: row.user_id,
        displayName: row.display_name,
        contributions: parseInt(row.contributions),
      })),
    };
  }

  // ==================== Private Helper Methods ====================

  private async createMissionFeedback(
    mission: Mission,
    userId: string,
    result: Record<string, unknown>
  ): Promise<void> {
    const feedbackId = uuidv4();

    await this.dbManager.query(
      `INSERT INTO mission_feedback (
        id, tenant_id, mission_id, user_id, type, input, output, user_response,
        used_for_training, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        feedbackId, mission.tenantId, mission.id, userId, mission.type,
        JSON.stringify(mission.payload), JSON.stringify({}), JSON.stringify(result),
        false, new Date(),
      ]
    );
  }

  private transformProfileRow(row: any): ArcadeUserProfile {
    return {
      userId: row.user_id,
      tenantId: row.tenant_id,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      level: row.level,
      xp: row.xp,
      xpToNextLevel: row.xp_to_next_level,
      coins: row.coins,
      streakDays: row.streak_days,
      longestStreak: row.longest_streak,
      lastActiveAt: row.last_active_at,
      totalMissionsCompleted: row.total_missions_completed,
      totalXpEarned: row.total_xp_earned,
      accuracy: parseFloat(row.accuracy) || 0,
      expertiseAreas: typeof row.expertise_areas === 'string' ? JSON.parse(row.expertise_areas) : row.expertise_areas,
      badges: typeof row.badges === 'string' ? JSON.parse(row.badges) : row.badges,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private transformMissionRow(row: any): Mission {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      type: row.type,
      difficulty: row.difficulty,
      status: row.status,
      title: row.title,
      description: row.description,
      instructions: row.instructions,
      xpReward: row.xp_reward,
      coinReward: row.coin_reward,
      timeEstimateMinutes: row.time_estimate_minutes,
      expiresAt: row.expires_at,
      requiredSkillLevel: row.required_skill_level,
      payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
      assignedTo: row.assigned_to,
      assignedAt: row.assigned_at,
      completedBy: row.completed_by,
      completedAt: row.completed_at,
      result: row.result ? (typeof row.result === 'string' ? JSON.parse(row.result) : row.result) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private transformDatasetRow(row: any): HITLDataset {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description,
      missionType: row.mission_type,
      sampleCount: row.sample_count,
      qualityScore: row.quality_score ? parseFloat(row.quality_score) : undefined,
      status: row.status,
      minAgreementThreshold: parseFloat(row.min_agreement_threshold),
      reviewsPerSample: row.reviews_per_sample,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
