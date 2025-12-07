// Enterprise-scale mock knowledge base data
export interface MockKnowledgeEntry {
  id: string;
  type: 'architecture' | 'domain' | 'expert' | 'decision' | 'requirement' | 'insight' | 'risk' | 'cost';
  title: string;
  content: string;
  summary: string;
  source: 'agent' | 'manual' | 'pipeline' | 'session';
  sourceAgent?: string;
  tags: string[];
  relatedEntities: string[];
  confidence: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  upvotes: number;
  views: number;
}

const architectureTopics = [
  'Microservices architecture pattern',
  'Event-driven system design',
  'Database sharding strategy',
  'API Gateway implementation',
  'Service mesh with Istio',
  'CQRS and Event Sourcing',
  'GraphQL federation approach',
  'Rate limiting algorithms',
  'Caching layer architecture',
  'Distributed tracing setup'
];

const domainKnowledge = [
  'User authentication flow',
  'Payment processing workflow',
  'Order fulfillment pipeline',
  'Inventory management rules',
  'Pricing calculation logic',
  'Subscription billing cycles',
  'Refund and cancellation policy',
  'Tax calculation requirements',
  'Shipping cost determination',
  'Discount and promotion rules'
];

const expertKnowledge = [
  'PostgreSQL performance tuning',
  'React optimization techniques',
  'Kubernetes pod autoscaling',
  'Redis caching strategies',
  'Playwright best practices',
  'TypeScript advanced patterns',
  'Docker multi-stage builds',
  'Git workflow recommendations',
  'Code review guidelines',
  'Security vulnerability prevention'
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

export function generateMockKnowledge(count: number = 1000): MockKnowledgeEntry[] {
  const entries: MockKnowledgeEntry[] = [];
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  
  const types: Array<'architecture' | 'domain' | 'expert' | 'decision' | 'requirement' | 'insight' | 'risk' | 'cost'> = 
    ['architecture', 'domain', 'expert', 'decision', 'requirement', 'insight', 'risk', 'cost'];
  const sources: Array<'agent' | 'manual' | 'pipeline' | 'session'> = ['agent', 'manual', 'pipeline', 'session'];
  const sourceAgents = ['test-generator', 'healing-engine', 'roi-service', 'ai-orchestrator'];
  const tags = ['critical', 'performance', 'security', 'scalability', 'testing', 'deployment', 'monitoring', 'documentation'];

  for (let i = 0; i < count; i++) {
    const type = randomElement(types);
    const source = randomElement(sources);
    const createdAt = randomDate(sixMonthsAgo, now);
    const updatedAt = randomDate(new Date(createdAt), now);

    let title: string;
    let content: string;
    let summary: string;

    if (type === 'architecture') {
      title = randomElement(architectureTopics);
      summary = `Architectural pattern and implementation details for ${title.toLowerCase()}`;
      content = `${summary}. This approach provides scalability, maintainability, and performance benefits. Key considerations include: service boundaries, data consistency, communication patterns, and failure handling.`;
    } else if (type === 'domain') {
      title = randomElement(domainKnowledge);
      summary = `Business logic and domain rules for ${title.toLowerCase()}`;
      content = `${summary}. Includes validation rules, state transitions, edge cases, and integration points with other domain areas.`;
    } else if (type === 'expert') {
      title = randomElement(expertKnowledge);
      summary = `Expert guidance on ${title.toLowerCase()}`;
      content = `${summary}. Best practices, common pitfalls to avoid, performance considerations, and recommended tooling.`;
    } else {
      title = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${randomElement(['Critical', 'Important', 'Standard'])} item ${i}`;
      summary = `${type} entry with relevant context and recommendations`;
      content = `Detailed ${type} information with background, analysis, and actionable recommendations for the team.`;
    }

    entries.push({
      id: `knowledge-${i + 1}`,
      type,
      title,
      content,
      summary,
      source,
      sourceAgent: source === 'agent' ? randomElement(sourceAgents) : undefined,
      tags: Array.from({ length: randomInt(2, 5) }, () => randomElement(tags)),
      relatedEntities: Array.from({ length: randomInt(1, 4) }, () => `entity-${randomInt(1, 100)}`),
      confidence: randomInt(70, 99),
      createdAt,
      updatedAt,
      createdBy: `user-${randomInt(1, 200)}`,
      upvotes: randomInt(0, 50),
      views: randomInt(10, 500)
    });
  }

  return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Helpers
export function getKnowledgeByType(entries: MockKnowledgeEntry[], type: string): MockKnowledgeEntry[] {
  return entries.filter(e => e.type === type);
}

export function searchKnowledge(entries: MockKnowledgeEntry[], query: string): MockKnowledgeEntry[] {
  const lowerQuery = query.toLowerCase();
  return entries.filter(e => 
    e.title.toLowerCase().includes(lowerQuery) || 
    e.content.toLowerCase().includes(lowerQuery) ||
    e.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
