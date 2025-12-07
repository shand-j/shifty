import { generateId, randomInt, randomChoice, randomDate } from './faker-utils';

export interface MockHealingItem {
  id: string;
  testId: string;
  testName: string;
  projectId: string;
  originalSelector: string;
  healedSelector: string;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  strategy: 'data-testid-recovery' | 'text-content-matching' | 'css-hierarchy-analysis' | 'ai-powered-analysis';
  domSnapshot: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

const selectors = [
  'button.submit', 'input[name="email"]', '#login-form', '.nav-item',
  'div.card-header', 'span.badge', 'a.btn-primary', '.modal-dialog',
  'form > button', 'table tbody tr', 'ul.list li', 'header nav a'
];

const strategies: MockHealingItem['strategy'][] = [
  'data-testid-recovery',
  'text-content-matching',
  'css-hierarchy-analysis',
  'ai-powered-analysis'
];

function generateMockHealingItem(testId: string, testName: string, projectId: string): MockHealingItem {
  const originalSelector = randomChoice(selectors);
  const healedSelector = randomBoolean(0.7) 
    ? `[data-testid="${testName.toLowerCase().replace(/\s+/g, '-')}"]`
    : originalSelector.replace(/\./g, '.new-');
  
  const confidence = randomInt(40, 99);
  const status: MockHealingItem['status'] = 
    confidence > 80 ? (randomBoolean(0.8) ? 'approved' : 'pending') :
    confidence > 60 ? (randomBoolean(0.5) ? 'pending' : 'rejected') :
    'rejected';
  
  return {
    id: generateId('heal'),
    testId,
    testName,
    projectId,
    originalSelector,
    healedSelector,
    confidence,
    status,
    strategy: randomChoice(strategies),
    domSnapshot: `<div class="app-container">\n  <button class="submit">Submit</button>\n</div>`,
    createdAt: randomDate(30, 0).toISOString(),
    reviewedAt: status !== 'pending' ? randomDate(15, 0).toISOString() : undefined,
    reviewedBy: status !== 'pending' ? generateId('user') : undefined,
  };
}

function randomBoolean(probability = 0.5): boolean {
  return Math.random() < probability;
}

// Generate 500+ healing items
export function generateMockHealingItems(count = 500): MockHealingItem[] {
  const items: MockHealingItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push(generateMockHealingItem(
      generateId('test'),
      `Test case ${i + 1}`,
      generateId('project')
    ));
  }
  return items;
}

export const mockHealingItems = generateMockHealingItems();
