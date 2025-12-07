// Enterprise-scale mock healing data
export interface MockHealingItem {
  id: string;
  testId: string;
  testName: string;
  projectId: string;
  projectName: string;
  originalSelector: string;
  healedSelector: string;
  strategy: 'data-testid-recovery' | 'text-content-matching' | 'css-hierarchy-analysis' | 'ai-powered-analysis';
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'auto-applied';
  reason: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  context: {
    pageUrl: string;
    elementType: string;
    surroundingContext: string;
  };
}

const selectorPrefixes = ['#', '.', '[data-testid="', '[aria-label="', 'button', 'input', 'a'];
const selectorNames = ['submit', 'login', 'signup', 'search', 'profile', 'settings', 'menu', 'close', 'save', 'cancel'];
const elementTypes = ['button', 'input', 'link', 'div', 'span', 'form', 'select', 'textarea'];
const pageUrls = [
  'https://app.acme.com/login',
  'https://app.acme.com/dashboard',
  'https://app.acme.com/settings',
  'https://app.acme.com/profile',
  'https://app.acme.com/checkout',
  'https://app.acme.com/search',
  'https://admin.acme.com/users',
  'https://admin.acme.com/reports'
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

export function generateMockHealingItems(count: number = 500, projectIds: string[]): MockHealingItem[] {
  const healingItems: MockHealingItem[] = [];
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const strategies: Array<'data-testid-recovery' | 'text-content-matching' | 'css-hierarchy-analysis' | 'ai-powered-analysis'> = 
    ['data-testid-recovery', 'text-content-matching', 'css-hierarchy-analysis', 'ai-powered-analysis'];

  for (let i = 0; i < count; i++) {
    const projectId = randomElement(projectIds);
    const prefix = randomElement(selectorPrefixes);
    const name = randomElement(selectorNames);
    const confidence = randomInt(40, 99);
    const createdAt = randomDate(oneMonthAgo, now);
    const strategy = randomElement(strategies);
    
    // Status distribution: 60% pending, 25% approved, 10% rejected, 5% auto-applied
    let status: 'pending' | 'approved' | 'rejected' | 'auto-applied';
    const statusRand = Math.random();
    if (statusRand < 0.60) status = 'pending';
    else if (statusRand < 0.85) status = 'approved';
    else if (statusRand < 0.95) status = 'rejected';
    else status = 'auto-applied';

    const originalSelector = prefix.includes('[') 
      ? `${prefix}${name}"]`
      : prefix.includes('#') || prefix.includes('.')
      ? `${prefix}${name}-btn`
      : `${prefix}.${name}-button`;

    const healedSelector = prefix.includes('[')
      ? `[data-testid="${name}-button"]`
      : `${prefix}${name}-button-v2`;

    healingItems.push({
      id: `healing-${i + 1}`,
      testId: `test-suite-${projectId}-${randomInt(1, 5)}-${randomInt(1, 20)}`,
      testName: `Test ${name} functionality`,
      projectId,
      projectName: `Project ${projectId.split('-')[1]}`,
      originalSelector,
      healedSelector,
      strategy,
      confidence,
      status,
      reason: `Selector failed due to DOM restructure, ${strategy} suggested alternative`,
      createdAt,
      reviewedAt: status !== 'pending' ? randomDate(new Date(createdAt), now) : undefined,
      reviewedBy: status !== 'pending' ? `user-${randomInt(1, 200)}` : undefined,
      context: {
        pageUrl: randomElement(pageUrls),
        elementType: randomElement(elementTypes),
        surroundingContext: `<div class="container"><${randomElement(elementTypes)} /></div>`
      }
    });
  }

  return healingItems;
}

// Helper to get pending healing items
export function getPendingHealingItems(items: MockHealingItem[]): MockHealingItem[] {
  return items.filter(item => item.status === 'pending');
}

// Helper to get healing items by confidence threshold
export function getHealingItemsByConfidence(items: MockHealingItem[], minConfidence: number): MockHealingItem[] {
  return items.filter(item => item.confidence >= minConfidence);
}
