import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { RAGService } from './rag.service';
import { 
  QEQuery, 
  QEResponse, 
  KnowledgeDocument, 
  Source,
  EscalationInfo 
} from '../types';

export class QECollaboratorService {
  private ragService: RAGService;
  private ollamaUrl: string;
  private modelName: string;
  private knowledgeBase: Map<string, KnowledgeDocument[]>;

  constructor() {
    this.ragService = new RAGService();
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.modelName = process.env.QE_MODEL || 'llama2';
    this.knowledgeBase = new Map();
  }

  /**
   * Process a QE query and return a response
   */
  async processQuery(query: QEQuery): Promise<QEResponse> {
    try {
      // Get knowledge documents for tenant
      const documents = this.knowledgeBase.get(query.tenantId) || [];

      // Search for relevant context using RAG
      const sources = await this.ragService.searchKnowledge(
        query.question,
        documents,
        5
      );

      // Build context from sources
      const context = this.ragService.buildContext(sources, documents);

      // Generate response using LLM with persona-specific prompt
      const prompt = this.buildPrompt(query, context);
      const answer = await this.generateResponse(prompt);

      // Parse response and determine if escalation is needed
      const escalation = this.determineEscalation(answer, sources, query);

      // Generate recommendations
      const recommendations = this.generateRecommendations(query, sources);

      return {
        answer,
        confidence: this.calculateConfidence(sources),
        sources,
        recommendations,
        escalation
      };
    } catch (error) {
      console.error('Error processing QE query:', error);
      throw error;
    }
  }

  /**
   * Build persona-specific prompt for LLM
   */
  private buildPrompt(query: QEQuery, context: string): string {
    const personaInstructions = this.getPersonaInstructions(query.persona);

    return `You are a QE Collaborator AI, an expert in quality engineering collaboration across Product, Design, QA, and Dev teams.

PERSONA: ${query.persona.toUpperCase()}

YOUR ROLE:
${personaInstructions}

CONTEXT FROM KNOWLEDGE BASE:
${context}

USER QUESTION:
${query.question}

INSTRUCTIONS:
1. Answer the question based on the provided context
2. If context is insufficient, clearly state what information is missing
3. Provide actionable recommendations when appropriate
4. Use persona-appropriate language and focus
5. Cite sources when referencing specific information
6. Flag if human escalation is needed

RESPONSE:`;
  }

  /**
   * Get persona-specific instructions
   */
  private getPersonaInstructions(persona: string): string {
    const instructions: Record<string, string> = {
      product: `
You're helping Product Owners with:
- Release readiness assessments
- Testability validation of requirements
- Risk-based priority recommendations
- Quality confidence scores
Use business language and focus on customer outcomes.`,
      
      design: `
You're helping Designers with:
- Testability checklists for UI components
- Accessibility requirements (WCAG compliance)
- Visual regression testing guidance
- Component specification validation
Use design language and focus on user experience.`,
      
      qa: `
You're helping QA/SDET with:
- Fast context on features and requirements
- AI test validation and gap analysis
- Test strategy recommendations
- Risk identification and prioritization
Use testing terminology and focus on quality metrics.`,
      
      dev: `
You're helping Developers with:
- Requirements and design clarification
- Testability guidance during implementation
- Test coverage status and gaps
- Blocker resolution with context
Use technical language and provide code examples when helpful.`,
      
      manager: `
You're helping Engineering Managers with:
- Team quality metrics and trends
- ROI and DORA metrics analysis
- Resource allocation recommendations
- Process improvement opportunities
Use management language and focus on team outcomes.`
    };

    return instructions[persona] || instructions.dev;
  }

  /**
   * Generate response using Ollama
   */
  private async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.modelName,
        prompt,
        stream: false
      });

      return response.data.response;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  /**
   * Calculate confidence based on source relevance
   */
  private calculateConfidence(sources: Source[]): number {
    if (sources.length === 0) return 0;

    const avgRelevance = sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length;
    return Math.min(avgRelevance * 100, 100);
  }

  /**
   * Determine if escalation to human is needed
   */
  private determineEscalation(
    answer: string,
    sources: Source[],
    query: QEQuery
  ): EscalationInfo | undefined {
    // Low confidence - not enough information
    if (sources.length === 0 || this.calculateConfidence(sources) < 30) {
      return {
        reason: 'Insufficient information in knowledge base',
        stakeholder: this.getEscalationTarget(query.persona),
        urgency: 'medium',
        suggestedAction: 'Consult with subject matter expert for clarification'
      };
    }

    // Check if answer indicates need for human decision
    const escalationKeywords = [
      'unclear',
      'ambiguous',
      'conflicting',
      'missing',
      'need clarification',
      'should consult'
    ];

    const needsEscalation = escalationKeywords.some(keyword =>
      answer.toLowerCase().includes(keyword)
    );

    if (needsEscalation) {
      return {
        reason: 'Ambiguous or conflicting information requires human judgment',
        stakeholder: this.getEscalationTarget(query.persona),
        urgency: 'medium',
        suggestedAction: 'Schedule sync to resolve ambiguity'
      };
    }

    return undefined;
  }

  /**
   * Get escalation target based on persona
   */
  private getEscalationTarget(persona: string): 'product' | 'design' | 'qa' | 'dev' | 'manager' {
    const targets: Record<string, 'product' | 'design' | 'qa' | 'dev' | 'manager'> = {
      product: 'product',
      design: 'design',
      qa: 'qa',
      dev: 'dev',
      manager: 'manager'
    };
    return targets[persona] || 'manager';
  }

  /**
   * Generate recommendations based on query and sources
   */
  private generateRecommendations(query: QEQuery, sources: Source[]): string[] {
    const recommendations: string[] = [];

    // Recommend based on missing source types
    const sourceTypes = new Set(sources.map(s => s.type));

    if (!sourceTypes.has('test') && query.persona === 'qa') {
      recommendations.push('Consider adding automated test coverage for this area');
    }

    if (!sourceTypes.has('design') && query.persona === 'dev') {
      recommendations.push('Review design specifications before implementation');
    }

    if (!sourceTypes.has('jira') && query.persona === 'product') {
      recommendations.push('Document requirements in Jira for team visibility');
    }

    return recommendations;
  }

  /**
   * Index knowledge documents for a tenant
   */
  async indexKnowledge(tenantId: string, documents: KnowledgeDocument[]): Promise<void> {
    console.log(`Indexing ${documents.length} documents for tenant ${tenantId}`);

    // Generate embeddings for each document
    const indexedDocs = await Promise.all(
      documents.map(doc => this.ragService.indexDocument(doc))
    );

    this.knowledgeBase.set(tenantId, indexedDocs);
    console.log(`Indexed ${indexedDocs.length} documents for tenant ${tenantId}`);
  }

  /**
   * Add a single document to knowledge base
   */
  async addDocument(tenantId: string, document: KnowledgeDocument): Promise<void> {
    const indexedDoc = await this.ragService.indexDocument(document);
    
    const existingDocs = this.knowledgeBase.get(tenantId) || [];
    existingDocs.push(indexedDoc);
    this.knowledgeBase.set(tenantId, existingDocs);
  }

  /**
   * Get knowledge base stats
   */
  getKnowledgeStats(tenantId: string): {
    totalDocuments: number;
    byType: Record<string, number>;
  } {
    const documents = this.knowledgeBase.get(tenantId) || [];
    
    const byType: Record<string, number> = {};
    documents.forEach(doc => {
      byType[doc.type] = (byType[doc.type] || 0) + 1;
    });

    return {
      totalDocuments: documents.length,
      byType
    };
  }
}
