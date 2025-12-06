export interface QEQuery {
  question: string;
  persona: 'product' | 'design' | 'qa' | 'dev' | 'manager';
  context?: {
    featureId?: string;
    repo?: string;
    component?: string;
    sessionId?: string;
  };
  tenantId: string;
  userId: string;
}

export interface QEResponse {
  answer: string;
  confidence: number;
  sources: Source[];
  relatedContext?: RelatedContext;
  recommendations?: string[];
  escalation?: EscalationInfo;
}

export interface Source {
  type: 'jira' | 'design' | 'test' | 'code' | 'telemetry' | 'documentation';
  id: string;
  title: string;
  excerpt: string;
  relevance: number;
  url?: string;
}

export interface RelatedContext {
  requirements?: any[];
  designSpecs?: any[];
  testCoverage?: any;
  incidents?: any[];
}

export interface EscalationInfo {
  reason: string;
  stakeholder: 'product' | 'design' | 'qa' | 'dev' | 'manager';
  urgency: 'low' | 'medium' | 'high';
  suggestedAction: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    persona?: string;
    sources?: Source[];
    confidence?: number;
  };
}

export interface ChatSession {
  id: string;
  tenantId: string;
  userId: string;
  persona: string;
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  context?: Record<string, any>;
}

export interface KnowledgeDocument {
  id: string;
  type: 'requirement' | 'design' | 'test' | 'code' | 'telemetry' | 'incident';
  tenantId: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
  lastUpdated: Date;
}

export interface TrainingData {
  id: string;
  query: string;
  response: string;
  persona: string;
  feedback?: 'positive' | 'negative' | 'neutral';
  sources: Source[];
  timestamp: Date;
}
