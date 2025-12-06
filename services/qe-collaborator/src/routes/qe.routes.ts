import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { QECollaboratorService } from '../services/qe-collaborator.service';
import { DataIngestionService } from '../services/data-ingestion.service';
import { ChatMessage, ChatSession } from '../types';

// Validation schemas
const QuerySchema = z.object({
  question: z.string().min(1),
  persona: z.enum(['product', 'design', 'qa', 'dev', 'manager']),
  context: z.object({
    featureId: z.string().optional(),
    repo: z.string().optional(),
    component: z.string().optional(),
    sessionId: z.string().optional()
  }).optional(),
  tenantId: z.string(),
  userId: z.string()
});

const IndexKnowledgeSchema = z.object({
  tenantId: z.string()
});

export async function qeRoutes(
  fastify: FastifyInstance,
  options: {
    qeService: QECollaboratorService;
    dataIngestionService: DataIngestionService;
  }
) {
  const { qeService, dataIngestionService } = options;

  // Store active chat sessions in memory (in production, use Redis)
  const chatSessions = new Map<string, ChatSession>();
  const chatMessages = new Map<string, ChatMessage[]>();

  /**
   * POST /api/v1/qe/query
   * Ask a question to the QE Collaborator
   */
  fastify.post('/api/v1/qe/query', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = QuerySchema.parse(request.body);
      
      const response = await qeService.processQuery(query);
      
      return reply.send({
        success: true,
        data: response
      });
    } catch (error: any) {
      fastify.log.error('Error processing query:', error);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to process query'
      });
    }
  });

  /**
   * POST /api/v1/qe/chat/session
   * Create a new chat session
   */
  fastify.post('/api/v1/qe/chat/session', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId, userId, persona } = request.body as any;

      const sessionId = uuidv4();
      const session: ChatSession = {
        id: sessionId,
        tenantId,
        userId,
        persona,
        startTime: new Date(),
        lastActivity: new Date(),
        messageCount: 0
      };

      chatSessions.set(sessionId, session);
      chatMessages.set(sessionId, []);

      return reply.send({
        success: true,
        data: { sessionId, session }
      });
    } catch (error: any) {
      fastify.log.error('Error creating chat session:', error);
      return reply.status(500).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/v1/qe/chat/:sessionId/message
   * Send a message in a chat session
   */
  fastify.post('/api/v1/qe/chat/:sessionId/message', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { sessionId } = request.params as any;
      const { message } = request.body as any;

      const session = chatSessions.get(sessionId);
      if (!session) {
        return reply.status(404).send({
          success: false,
          error: 'Session not found'
        });
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: uuidv4(),
        sessionId,
        role: 'user',
        content: message,
        timestamp: new Date(),
        metadata: { persona: session.persona }
      };

      const messages = chatMessages.get(sessionId) || [];
      messages.push(userMessage);

      // Generate response
      const qeResponse = await qeService.processQuery({
        question: message,
        persona: session.persona as any,
        tenantId: session.tenantId,
        userId: session.userId
      });

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        sessionId,
        role: 'assistant',
        content: qeResponse.answer,
        timestamp: new Date(),
        metadata: {
          persona: session.persona,
          sources: qeResponse.sources,
          confidence: qeResponse.confidence
        }
      };

      messages.push(assistantMessage);
      chatMessages.set(sessionId, messages);

      // Update session
      session.lastActivity = new Date();
      session.messageCount = messages.length;
      chatSessions.set(sessionId, session);

      return reply.send({
        success: true,
        data: {
          userMessage,
          assistantMessage,
          sources: qeResponse.sources,
          confidence: qeResponse.confidence,
          recommendations: qeResponse.recommendations,
          escalation: qeResponse.escalation
        }
      });
    } catch (error: any) {
      fastify.log.error('Error processing chat message:', error);
      return reply.status(500).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/v1/qe/chat/:sessionId/messages
   * Get chat history for a session
   */
  fastify.get('/api/v1/qe/chat/:sessionId/messages', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { sessionId } = request.params as any;

      const session = chatSessions.get(sessionId);
      if (!session) {
        return reply.status(404).send({
          success: false,
          error: 'Session not found'
        });
      }

      const messages = chatMessages.get(sessionId) || [];

      return reply.send({
        success: true,
        data: { session, messages }
      });
    } catch (error: any) {
      fastify.log.error('Error fetching messages:', error);
      return reply.status(500).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/v1/qe/knowledge/index
   * Trigger knowledge base indexing for a tenant
   */
  fastify.post('/api/v1/qe/knowledge/index', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId } = IndexKnowledgeSchema.parse(request.body);

      // Ingest data from all sources
      const documents = await dataIngestionService.ingestTenantData(tenantId);

      // Index in QE service
      await qeService.indexKnowledge(tenantId, documents);

      const stats = qeService.getKnowledgeStats(tenantId);

      return reply.send({
        success: true,
        data: {
          indexed: documents.length,
          stats
        }
      });
    } catch (error: any) {
      fastify.log.error('Error indexing knowledge:', error);
      return reply.status(500).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/v1/qe/knowledge/stats/:tenantId
   * Get knowledge base statistics
   */
  fastify.get('/api/v1/qe/knowledge/stats/:tenantId', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { tenantId } = request.params as any;
      const stats = qeService.getKnowledgeStats(tenantId);

      return reply.send({
        success: true,
        data: stats
      });
    } catch (error: any) {
      fastify.log.error('Error getting knowledge stats:', error);
      return reply.status(500).send({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * WebSocket endpoint for real-time chat
   */
  fastify.get('/api/v1/qe/chat/ws', { websocket: true }, (connection, request) => {
    const { tenantId, userId, persona, sessionId: existingSessionId } = request.query as any;

    let sessionId = existingSessionId;
    
    // Create or get session
    if (!sessionId) {
      sessionId = uuidv4();
      const session: ChatSession = {
        id: sessionId,
        tenantId,
        userId,
        persona,
        startTime: new Date(),
        lastActivity: new Date(),
        messageCount: 0
      };
      chatSessions.set(sessionId, session);
      chatMessages.set(sessionId, []);
    }

    connection.socket.send(JSON.stringify({
      type: 'connected',
      sessionId
    }));

    connection.socket.on('message', async (rawMessage: any) => {
      try {
        const data = JSON.parse(rawMessage.toString());
        
        if (data.type === 'message') {
          const session = chatSessions.get(sessionId);
          if (!session) {
            connection.socket.send(JSON.stringify({
              type: 'error',
              error: 'Session not found'
            }));
            return;
          }

          // Process message
          const qeResponse = await qeService.processQuery({
            question: data.content,
            persona: session.persona as any,
            tenantId: session.tenantId,
            userId: session.userId
          });

          // Send response
          connection.socket.send(JSON.stringify({
            type: 'response',
            content: qeResponse.answer,
            sources: qeResponse.sources,
            confidence: qeResponse.confidence,
            recommendations: qeResponse.recommendations,
            escalation: qeResponse.escalation
          }));

          // Update session
          session.lastActivity = new Date();
          session.messageCount += 2;
          chatSessions.set(sessionId, session);
        }
      } catch (error: any) {
        connection.socket.send(JSON.stringify({
          type: 'error',
          error: error.message
        }));
      }
    });

    connection.socket.on('close', () => {
      fastify.log.info(`WebSocket closed for session ${sessionId}`);
    });
  });
}
