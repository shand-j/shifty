// Enterprise-scale mock notifications
export interface MockNotification {
  id: string;
  type: 'ci_failure' | 'healing_required' | 'roi_alert' | 'hitl_prompt' | 'mention' | 'mission_complete' | 'badge_earned';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

const notificationTemplates = [
  {
    type: 'ci_failure' as const,
    priority: 'high' as const,
    templates: [
      { title: 'Pipeline Failed', message: 'main branch build failed on {repo}', link: '/pipelines/{id}' },
      { title: 'Tests Failing', message: '{count} tests failed in {repo}', link: '/projects/{projectId}' },
      { title: 'Build Error', message: 'Build failed for {branch} in {repo}', link: '/pipelines/{id}' }
    ]
  },
  {
    type: 'healing_required' as const,
    priority: 'medium' as const,
    templates: [
      { title: 'Selector Healing Required', message: '{count} selectors need review (confidence < 70%)', link: '/healing' },
      { title: 'Low Confidence Healing', message: 'Healing suggestion for {testName} needs verification', link: '/healing/{id}' },
      { title: 'Batch Healing Complete', message: '{count} selectors healed, please review', link: '/healing' }
    ]
  },
  {
    type: 'roi_alert' as const,
    priority: 'low' as const,
    templates: [
      { title: 'ROI Milestone', message: 'You saved {hours} hours this month!', link: '/insights/roi' },
      { title: 'Time Saved Alert', message: 'Team {team} reached {hours}hr time savings', link: '/insights/roi' },
      { title: 'Cost Savings', message: 'Prevented ${amount} in potential incident costs', link: '/insights/roi' }
    ]
  },
  {
    type: 'hitl_prompt' as const,
    priority: 'medium' as const,
    templates: [
      { title: 'New HITL Task', message: 'Verify healing results for {testName}', link: '/hitl/{id}' },
      { title: 'Labeling Needed', message: 'Help label {count} new test scenarios', link: '/hitl' },
      { title: 'Triage Request', message: 'Triage {count} failed tests from recent run', link: '/hitl' }
    ]
  },
  {
    type: 'mention' as const,
    priority: 'medium' as const,
    templates: [
      { title: 'You were mentioned', message: '{user} mentioned you in {context}', link: '/{contextLink}' },
      { title: 'Comment Reply', message: '{user} replied to your comment', link: '/{contextLink}' },
      { title: 'Review Request', message: '{user} requested your review on {item}', link: '/{contextLink}' }
    ]
  },
  {
    type: 'mission_complete' as const,
    priority: 'low' as const,
    templates: [
      { title: 'Mission Complete!', message: 'You earned {xp} XP for completing {mission}', link: '/arcade' },
      { title: 'Level Up!', message: 'Congratulations! You reached Level {level}', link: '/arcade/profile' }
    ]
  },
  {
    type: 'badge_earned' as const,
    priority: 'low' as const,
    templates: [
      { title: 'Badge Unlocked!', message: 'You earned the {badge} badge!', link: '/arcade/badges' }
    ]
  }
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

function interpolate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] || `{${key}}`);
}

export function generateMockNotifications(count: number = 50, userId: string = 'user-1'): MockNotification[] {
  const notifications: MockNotification[] = [];
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const templateGroup = randomElement(notificationTemplates);
    const template = randomElement(templateGroup.templates);
    const read = Math.random() < 0.4; // 40% read
    const createdAt = randomDate(oneWeekAgo, now);

    // Generate interpolation values
    const values: Record<string, string> = {
      repo: `acme/project-${randomInt(1, 20)}`,
      count: randomInt(1, 15).toString(),
      branch: randomElement(['main', 'develop', 'staging']),
      hours: randomInt(10, 200).toString(),
      team: `Team ${randomInt(1, 10)}`,
      amount: randomInt(10000, 100000).toString(),
      testName: `Test ${randomInt(1, 100)}`,
      user: `User ${randomInt(1, 50)}`,
      context: randomElement(['a comment', 'a PR', 'a test review']),
      contextLink: `context/${randomInt(1, 100)}`,
      xp: randomInt(10, 150).toString(),
      mission: randomElement(['Label Tests', 'Verify Healings', 'Triage Failures']),
      level: randomInt(1, 30).toString(),
      badge: randomElement(['Test Champion', 'Healer', 'Bug Hunter']),
      id: randomInt(1, 500).toString(),
      projectId: randomInt(1, 100).toString()
    };

    notifications.push({
      id: `notif-${i + 1}`,
      type: templateGroup.type,
      title: interpolate(template.title, values),
      message: interpolate(template.message, values),
      read,
      createdAt,
      link: template.link ? interpolate(template.link, values) : undefined,
      priority: templateGroup.priority,
      metadata: {
        userId,
        ...values
      }
    });
  }

  return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Helper to get unread notifications
export function getUnreadNotifications(notifications: MockNotification[]): MockNotification[] {
  return notifications.filter(n => !n.read);
}

// Helper to get notifications by type
export function getNotificationsByType(notifications: MockNotification[], type: string): MockNotification[] {
  return notifications.filter(n => n.type === type);
}

// Helper to get notifications by priority
export function getNotificationsByPriority(notifications: MockNotification[], priority: string): MockNotification[] {
  return notifications.filter(n => n.priority === priority);
}
