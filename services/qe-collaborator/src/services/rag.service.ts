import axios from 'axios';
import { KnowledgeDocument, Source } from '../types';

export class RAGService {
  private ollamaUrl: string;
  private embeddingModel: string;

  constructor() {
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.embeddingModel = process.env.EMBEDDING_MODEL || 'nomic-embed-text';
  }

  /**
   * Generate embeddings for text using Ollama
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(`${this.ollamaUrl}/api/embeddings`, {
        model: this.embeddingModel,
        prompt: text
      });
      return response.data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Search knowledge base using semantic similarity
   */
  async searchKnowledge(
    query: string,
    documents: KnowledgeDocument[],
    topK: number = 5
  ): Promise<Source[]> {
    // Generate embedding for query
    const queryEmbedding = await this.generateEmbedding(query);

    // Calculate similarities
    const similarities = documents.map(doc => ({
      doc,
      similarity: doc.embedding 
        ? this.cosineSimilarity(queryEmbedding, doc.embedding)
        : 0
    }));

    // Sort by similarity and take top K
    const topResults = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    // Convert to Source format
    return topResults.map(result => ({
      type: result.doc.type as any,
      id: result.doc.id,
      title: result.doc.title,
      excerpt: result.doc.content.substring(0, 200),
      relevance: result.similarity,
      url: result.doc.metadata.url
    }));
  }

  /**
   * Build context from sources for LLM prompt
   */
  buildContext(sources: Source[], documents: KnowledgeDocument[]): string {
    const contextParts: string[] = [];

    for (const source of sources) {
      const doc = documents.find(d => d.id === source.id);
      if (doc) {
        contextParts.push(`
[${source.type.toUpperCase()}] ${doc.title}
${doc.content}
---
        `);
      }
    }

    return contextParts.join('\n');
  }

  /**
   * Index a document by generating its embedding
   */
  async indexDocument(doc: KnowledgeDocument): Promise<KnowledgeDocument> {
    const textToEmbed = `${doc.title}\n\n${doc.content}`;
    const embedding = await this.generateEmbedding(textToEmbed);
    
    return {
      ...doc,
      embedding
    };
  }
}
