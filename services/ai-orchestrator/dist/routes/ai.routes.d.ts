import { FastifyInstance } from 'fastify';
import { TestGenerationService } from '../services/test-generation.service.js';
import { SelectorHealingService } from '../services/selector-healing.service.js';
import { OllamaService } from '../services/ollama.service.js';
export declare function aiRoutes(fastify: FastifyInstance, options: {
    testGenerationService: TestGenerationService;
    healingService: SelectorHealingService;
    ollamaService: OllamaService;
}): Promise<void>;
//# sourceMappingURL=ai.routes.d.ts.map