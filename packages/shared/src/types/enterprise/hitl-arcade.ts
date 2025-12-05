import { z } from 'zod';

// Mission Types for HITL Arcade
export const MissionTypeSchema = z.enum([
  'label_test_output',      // Review and label AI-generated test results
  'validate_selector',      // Validate healed selectors
  'rate_test_quality',      // Rate quality of generated tests
  'verify_fix',             // Verify that a suggested fix is correct
  'classify_error',         // Classify error types
  'annotate_ui_element',    // Annotate UI elements for training
  'review_model_output',    // Review model inference outputs
  'approve_deployment',     // Approve model for deployment
]);

export type MissionType = z.infer<typeof MissionTypeSchema>;

// Mission Difficulty
export const MissionDifficultySchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

export type MissionDifficulty = z.infer<typeof MissionDifficultySchema>;

// Mission Status
export const MissionStatusSchema = z.enum([
  'available',
  'assigned',
  'in_progress',
  'completed',
  'expired',
  'cancelled',
]);

export type MissionStatus = z.infer<typeof MissionStatusSchema>;

// Mission Definition
export const MissionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  type: MissionTypeSchema,
  difficulty: MissionDifficultySchema,
  status: MissionStatusSchema,
  title: z.string().min(1).max(255),
  description: z.string(),
  instructions: z.string(),
  xpReward: z.number().min(1).max(1000),
  coinReward: z.number().min(0).max(100),
  timeEstimateMinutes: z.number().min(1).max(60),
  expiresAt: z.date().optional(),
  requiredSkillLevel: z.number().min(1).max(100).default(1),
  payload: z.record(z.unknown()), // Mission-specific data
  assignedTo: z.string().uuid().optional(),
  assignedAt: z.date().optional(),
  completedBy: z.string().uuid().optional(),
  completedAt: z.date().optional(),
  result: z.record(z.unknown()).optional(), // Completion result
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Mission = z.infer<typeof MissionSchema>;

// User Profile in Arcade
export const ArcadeUserProfileSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  displayName: z.string().min(1).max(50),
  avatarUrl: z.string().url().optional(),
  level: z.number().min(1).default(1),
  xp: z.number().min(0).default(0),
  xpToNextLevel: z.number(),
  coins: z.number().min(0).default(0),
  streakDays: z.number().min(0).default(0),
  longestStreak: z.number().min(0).default(0),
  lastActiveAt: z.date(),
  totalMissionsCompleted: z.number().min(0).default(0),
  totalXpEarned: z.number().min(0).default(0),
  accuracy: z.number().min(0).max(1).default(0), // Agreement with consensus
  expertiseAreas: z.array(MissionTypeSchema).default([]),
  badges: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ArcadeUserProfile = z.infer<typeof ArcadeUserProfileSchema>;

// Badge Definitions
export const BadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  iconUrl: z.string().url(),
  category: z.enum(['achievement', 'milestone', 'special', 'seasonal']),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  criteria: z.object({
    type: z.enum(['missions_completed', 'streak_days', 'accuracy', 'xp_earned', 'level', 'special']),
    threshold: z.number().optional(),
    missionType: MissionTypeSchema.optional(),
  }),
});

export type Badge = z.infer<typeof BadgeSchema>;

// Leaderboard Entry
export const LeaderboardEntrySchema = z.object({
  rank: z.number().min(1),
  userId: z.string().uuid(),
  displayName: z.string(),
  avatarUrl: z.string().url().optional(),
  level: z.number(),
  score: z.number(), // Depends on leaderboard type (XP, missions, accuracy)
  badges: z.array(z.string()),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

// Leaderboard Types
export const LeaderboardTypeSchema = z.enum([
  'xp_all_time',
  'xp_weekly',
  'xp_monthly',
  'missions_all_time',
  'missions_weekly',
  'accuracy',
  'streak',
]);

export type LeaderboardType = z.infer<typeof LeaderboardTypeSchema>;

// Reward Types
export const RewardTypeSchema = z.enum([
  'xp_boost',       // Temporary XP multiplier
  'coin_pack',      // Coin bundle
  'custom_avatar',  // Custom avatar options
  'badge',          // Special badge
  'early_access',   // Early access to features
]);

export type RewardType = z.infer<typeof RewardTypeSchema>;

// Shop Item
export const ShopItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  type: RewardTypeSchema,
  coinCost: z.number().min(0),
  realMoneyCost: z.number().min(0).optional(), // USD
  payload: z.record(z.unknown()), // Item-specific data
  available: z.boolean().default(true),
  limitedQuantity: z.number().optional(),
  expiresAt: z.date().optional(),
});

export type ShopItem = z.infer<typeof ShopItemSchema>;

// Mission Feedback for Model Training
export const MissionFeedbackSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  missionId: z.string().uuid(),
  userId: z.string().uuid(),
  type: MissionTypeSchema,
  input: z.record(z.unknown()), // Original input shown to user
  output: z.record(z.unknown()), // AI-generated output
  userResponse: z.record(z.unknown()), // User's feedback/annotation
  agreementScore: z.number().min(0).max(1).optional(), // Agreement with other reviewers
  usedForTraining: z.boolean().default(false),
  datasetId: z.string().uuid().optional(), // If added to training dataset
  createdAt: z.date(),
});

export type MissionFeedback = z.infer<typeof MissionFeedbackSchema>;

// Training Dataset from HITL
export const HITLDatasetSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  missionType: MissionTypeSchema,
  sampleCount: z.number().min(0).default(0),
  qualityScore: z.number().min(0).max(1).optional(),
  status: z.enum(['collecting', 'ready', 'training', 'archived']),
  minAgreementThreshold: z.number().min(0).max(1).default(0.8),
  reviewsPerSample: z.number().min(1).max(10).default(3),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type HITLDataset = z.infer<typeof HITLDatasetSchema>;

// Daily Challenge
export const DailyChallengeSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  date: z.date(),
  missions: z.array(z.object({
    missionId: z.string().uuid(),
    bonusXp: z.number(),
  })),
  completionBonus: z.object({
    xp: z.number(),
    coins: z.number(),
    badge: z.string().optional(),
  }),
});

export type DailyChallenge = z.infer<typeof DailyChallengeSchema>;

// Arcade Statistics
export const ArcadeStatsSchema = z.object({
  tenantId: z.string().uuid(),
  periodStart: z.date(),
  periodEnd: z.date(),
  totalUsers: z.number(),
  activeUsers: z.number(),
  missionsCompleted: z.number(),
  missionsAvailable: z.number(),
  samplesGenerated: z.number(), // Training samples from feedback
  averageAccuracy: z.number(),
  topContributors: z.array(z.object({
    userId: z.string().uuid(),
    displayName: z.string(),
    contributions: z.number(),
  })),
});

export type ArcadeStats = z.infer<typeof ArcadeStatsSchema>;
