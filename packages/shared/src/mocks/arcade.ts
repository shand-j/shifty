// Enterprise-scale mock arcade/gamification data
export interface MockMission {
  id: string;
  title: string;
  description: string;
  type: 'label' | 'verify' | 'triage' | 'review' | 'explore';
  xpReward: number;
  badge?: string;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  claimed: boolean;
  claimedBy?: string;
  completedBy?: string[];
  completedAt?: string;
  expiresAt: string;
  tags: string[];
}

export interface MockLeaderboardEntry {
  rank: number;
  previousRank: number;
  userId: string;
  userName: string;
  avatar?: string;
  teamName: string;
  xp: number;
  level: number;
  badges: string[];
  streak: number;
  weeklyGain: number;
  monthlyGain: number;
}

export interface MockBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedBy: string[];
}

const missionTemplates = [
  { type: 'label' as const, title: 'Label Test Scenarios', description: 'Review and label 10 test scenarios by type' },
  { type: 'verify' as const, title: 'Verify Healing Results', description: 'Verify 5 selector healing suggestions' },
  { type: 'triage' as const, title: 'Triage Failed Tests', description: 'Triage 8 failed tests from last CI run' },
  { type: 'review' as const, title: 'Review Test Quality', description: 'Review test quality scores for 3 projects' },
  { type: 'explore' as const, title: 'Exploratory Testing', description: 'Perform 15-minute exploratory testing session' }
];

const badges = [
  { name: 'Test Champion', description: 'Wrote 100 tests', icon: '🏆', rarity: 'epic' as const },
  { name: 'Healer', description: 'Fixed 50 broken selectors', icon: '⚕️', rarity: 'rare' as const },
  { name: 'Streak Master', description: '30-day activity streak', icon: '🔥', rarity: 'legendary' as const },
  { name: 'Team Player', description: 'Helped 10 teammates', icon: '🤝', rarity: 'common' as const },
  { name: 'Bug Hunter', description: 'Found 25 bugs', icon: '🐛', rarity: 'rare' as const },
  { name: 'Speed Demon', description: 'Completed 100 missions', icon: '⚡', rarity: 'epic' as const }
];

function randomDate(start: Date, end: Date): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateMockMissions(count: number = 50): MockMission[] {
  const missions: MockMission[] = [];
  const now = new Date();
  const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const template = randomElement(missionTemplates);
    const difficulty = randomElement(['easy', 'medium', 'hard'] as const);
    const xpReward = difficulty === 'easy' ? randomInt(10, 30) : difficulty === 'medium' ? randomInt(31, 70) : randomInt(71, 150);
    const claimed = Math.random() < 0.3;

    missions.push({
      id: `mission-${i + 1}`,
      title: `${template.title} #${i + 1}`,
      description: template.description,
      type: template.type,
      xpReward,
      badge: Math.random() < 0.1 ? randomElement(badges).name : undefined,
      estimatedTime: difficulty === 'easy' ? '5 min' : difficulty === 'medium' ? '10 min' : '20 min',
      difficulty,
      claimed,
      claimedBy: claimed ? `user-${randomInt(1, 200)}` : undefined,
      completedBy: claimed && Math.random() < 0.5 ? [`user-${randomInt(1, 200)}`] : [],
      completedAt: claimed && Math.random() < 0.5 ? randomDate(now, now) : undefined,
      expiresAt: randomDate(oneDayFromNow, threeDaysFromNow),
      tags: [template.type, difficulty]
    });
  }

  return missions;
}

export function generateMockLeaderboard(userIds: string[], userNames: string[], teamNames: string[]): MockLeaderboardEntry[] {
  const entries: MockLeaderboardEntry[] = [];
  
  // Sort users by XP (we'll generate XP here)
  const leaderboardData = userIds.map((userId, index) => ({
    userId,
    userName: userNames[index] || `User ${index + 1}`,
    teamName: randomElement(teamNames),
    xp: randomInt(5000, 100000),
    level: randomInt(1, 30),
    badges: Array.from({ length: randomInt(1, 6) }, () => randomElement(badges).name),
    streak: randomInt(0, 90),
    weeklyGain: randomInt(100, 2000),
    monthlyGain: randomInt(500, 10000)
  }));

  leaderboardData.sort((a, b) => b.xp - a.xp);

  leaderboardData.forEach((data, index) => {
    const rank = index + 1;
    const previousRank = rank + randomInt(-3, 3);

    entries.push({
      rank,
      previousRank: Math.max(1, previousRank),
      userId: data.userId,
      userName: data.userName,
      avatar: `/avatars/avatar-${(index % 20) + 1}.png`,
      teamName: data.teamName,
      xp: data.xp,
      level: data.level,
      badges: data.badges,
      streak: data.streak,
      weeklyGain: data.weeklyGain,
      monthlyGain: data.monthlyGain
    });
  });

  return entries.slice(0, 100); // Top 100
}

export function generateMockBadges(): MockBadge[] {
  return badges.map((badge, index) => ({
    id: `badge-${index + 1}`,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    rarity: badge.rarity,
    earnedBy: Array.from({ length: randomInt(10, 100) }, () => `user-${randomInt(1, 200)}`)
  }));
}
