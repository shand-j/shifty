import axios from 'axios';

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
  };
}

export interface OllamaGenerateResponse {
  response: string;
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
    this.timeout = parseInt(process.env.OLLAMA_TIMEOUT || '60000', 10);
  }

  async healthCheck(): Promise<{ status: string; models?: string[] }> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });
      
      return {
        status: 'healthy',
        models: response.data.models?.map((m: OllamaModel) => m.name) || []
      };
    } catch (error) {
      console.error('Ollama health check failed:', error);
      return {
        status: 'unhealthy'
      };
    }
  }

  async generate(request: OllamaGenerateRequest): Promise<OllamaGenerateResponse> {
    try {
      console.log(`🤖 Generating with Ollama model: ${request.model}`);
      
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          ...request,
          stream: false // Always use non-streaming for now
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Ollama generation completed in ${response.data.total_duration}ms`);
      return response.data;
    } catch (error) {
      console.error('Ollama generation failed:', error);
      throw new Error(`Ollama generation failed: ${error}`);
    }
  }

  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, {
        timeout: 5000
      });
      
      return response.data.models || [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      throw new Error(`Failed to list models: ${error}`);
    }
  }

  async pullModel(modelName: string): Promise<void> {
    try {
      console.log(`📥 Pulling Ollama model: ${modelName}`);
      
      await axios.post(
        `${this.baseUrl}/api/pull`,
        { name: modelName },
        { timeout: 600000 } // 10 minutes for model downloads
      );

      console.log(`✅ Model pulled successfully: ${modelName}`);
    } catch (error) {
      console.error(`Failed to pull model ${modelName}:`, error);
      throw new Error(`Failed to pull model: ${error}`);
    }
  }

  async deleteModel(modelName: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting Ollama model: ${modelName}`);
      
      await axios.delete(`${this.baseUrl}/api/delete`, {
        data: { name: modelName },
        timeout: 10000
      });

      console.log(`✅ Model deleted successfully: ${modelName}`);
    } catch (error) {
      console.error(`Failed to delete model ${modelName}:`, error);
      throw new Error(`Failed to delete model: ${error}`);
    }
  }

  async generateTestCode(
    prompt: string,
    model: string = 'llama3.1:8b',
    options?: { temperature?: number; max_tokens?: number }
  ): Promise<string> {
    const request: OllamaGenerateRequest = {
      model,
      prompt: this.buildTestGenerationPrompt(prompt),
      options: {
        temperature: options?.temperature || 0.3,
        max_tokens: options?.max_tokens || 2000,
        ...options
      }
    };

    const response = await this.generate(request);
    return this.extractCodeFromResponse(response.response);
  }

  async healSelector(
    originalSelector: string,
    pageContext: string,
    model: string = 'phi3:mini'
  ): Promise<string[]> {
    const prompt = this.buildSelectorHealingPrompt(originalSelector, pageContext);
    
    const request: OllamaGenerateRequest = {
      model,
      prompt,
      options: {
        temperature: 0.1, // Low temperature for consistent selector suggestions
        max_tokens: 500
      }
    };

    const response = await this.generate(request);
    return this.extractSelectorsFromResponse(response.response);
  }

  private buildTestGenerationPrompt(userPrompt: string): string {
    return `You are an expert Playwright test automation engineer. Generate a complete, robust Playwright test based on the following requirements:

${userPrompt}

Requirements:
1. Use @playwright/test framework
2. Prefer data-test attributes and semantic selectors
3. Include proper error handling and assertions
4. Make the test maintainable and readable
5. Include comments explaining the test logic
6. Use modern async/await syntax

Generate ONLY the test code, no explanations or markdown. Start with the import statements.`;
  }

  private buildSelectorHealingPrompt(originalSelector: string, pageContext: string): string {
    return `You are a selector healing expert. A Playwright selector has broken and needs alternatives.

Original broken selector: ${originalSelector}

Page context:
${pageContext}

Suggest 3-5 alternative selectors in order of reliability:
1. Data attributes (data-test, data-testid, data-cy)
2. ARIA attributes (aria-label, role, etc.)
3. Semantic HTML elements
4. Text-based selectors
5. CSS selectors (as last resort)

Return only the selector strings, one per line, no explanations.`;
  }

  private extractCodeFromResponse(response: string): string {
    // Remove code block markers if present
    const codeBlockRegex = /```(?:typescript|javascript|ts|js)?\n?([\s\S]*?)```/;
    const match = response.match(codeBlockRegex);
    
    if (match) {
      return match[1].trim();
    }
    
    // If no code blocks, return the response cleaned up
    return response
      .split('\n')
      .filter(line => !line.trim().startsWith('//') || line.includes('import') || line.includes('test'))
      .join('\n')
      .trim();
  }

  private extractSelectorsFromResponse(response: string): string[] {
    return response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('//'))
      .slice(0, 5); // Limit to 5 suggestions
  }
}