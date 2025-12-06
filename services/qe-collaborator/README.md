# QE Collaborator Service

AI-powered QE collaborator that serves as a subject matter expert across the entire Shifty platform dataset. Provides intelligent assistance for Product, Design, QA, and Dev teams through natural language interactions backed by RAG (Retrieval-Augmented Generation).

## Features

### Core Capabilities
- **Multi-Persona Support**: Tailored responses for Product Owners, Designers, QA/SDET, Developers, and Managers
- **RAG-Powered Context**: Semantic search across all platform data (CI/CD, test results, manual sessions, telemetry)
- **Real-time Chat**: WebSocket support for interactive conversations
- **Intelligent Escalation**: Automatically identifies when human expertise is needed
- **Continuous Learning**: Training pipeline integration for model improvement

### Data Sources
- CI/CD pipeline data (via cicd-governor)
- Test execution results (via test-generator)
- Manual testing sessions (via manual-session-hub)
- Quality metrics and ROI data (via roi-service)
- SDK telemetry and events

## API Endpoints

### Query API
```http
POST /api/v1/qe/query
Content-Type: application/json

{
  "question": "What are the requirements for the password reset flow?",
  "persona": "dev",
  "context": {
    "featureId": "JIRA-4567",
    "repo": "my-app",
    "component": "auth"
  },
  "tenantId": "tenant-123",
  "userId": "user-456"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "answer": "Based on the requirements in JIRA-4567...",
    "confidence": 85,
    "sources": [
      {
        "type": "jira",
        "id": "JIRA-4567",
        "title": "Password Reset Flow",
        "excerpt": "User enters email, receives reset link...",
        "relevance": 0.95,
        "url": "https://jira.example.com/JIRA-4567"
      }
    ],
    "recommendations": [
      "Add automated test coverage for email delivery",
      "Review design specifications for error states"
    ],
    "escalation": null
  }
}
```

### Chat Session API

#### Create Session
```http
POST /api/v1/qe/chat/session
Content-Type: application/json

{
  "tenantId": "tenant-123",
  "userId": "user-456",
  "persona": "qa"
}
```

#### Send Message
```http
POST /api/v1/qe/chat/:sessionId/message
Content-Type: application/json

{
  "message": "What tests are missing for the checkout flow?"
}
```

#### Get Chat History
```http
GET /api/v1/qe/chat/:sessionId/messages
```

### Knowledge Base API

#### Index Knowledge
```http
POST /api/v1/qe/knowledge/index
Content-Type: application/json

{
  "tenantId": "tenant-123"
}
```

#### Get Stats
```http
GET /api/v1/qe/knowledge/stats/:tenantId
```

### WebSocket API

Connect to real-time chat:
```javascript
const ws = new WebSocket('ws://localhost:3010/api/v1/qe/chat/ws?tenantId=tenant-123&userId=user-456&persona=qa');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'connected') {
    console.log('Session ID:', data.sessionId);
  } else if (data.type === 'response') {
    console.log('Answer:', data.content);
    console.log('Confidence:', data.confidence);
    console.log('Sources:', data.sources);
  }
};

// Send message
ws.send(JSON.stringify({
  type: 'message',
  content: 'Is Feature X ready for release?'
}));
```

## Persona-Specific Behaviors

### Product Owner
- **Focus**: Release readiness, risk assessment, ROI
- **Language**: Business outcomes, customer value
- **Context**: Requirements, test coverage, incidents

### Designer
- **Focus**: Testability, accessibility, visual quality
- **Language**: UX, design fidelity, WCAG compliance
- **Context**: Design specs, visual regression, component states

### QA/SDET
- **Focus**: Test strategy, gap analysis, automation
- **Language**: Testing terminology, quality metrics
- **Context**: Test execution, coverage, manual sessions

### Developer
- **Focus**: Implementation guidance, testability
- **Language**: Technical, code examples
- **Context**: Requirements, design specs, test data

### Manager
- **Focus**: Team metrics, ROI, process improvement
- **Language**: Management, outcomes, trends
- **Context**: DORA metrics, quality trends, team health

## Architecture

### RAG Pipeline
1. **Data Ingestion**: Pull data from multiple services
2. **Embedding Generation**: Convert documents to vectors using Ollama
3. **Semantic Search**: Find relevant context using cosine similarity
4. **LLM Generation**: Generate response with persona-specific prompt
5. **Response Enhancement**: Add sources, recommendations, escalation

### Knowledge Base
- In-memory vector store (production: use Qdrant/Pinecone)
- Document types: requirements, design, test, code, telemetry, incidents
- Embeddings: Generated using nomic-embed-text model
- Update frequency: Hourly scheduled ingestion

### Training Pipeline
- Captures query/response pairs with user feedback
- Stores training data in data-lifecycle service
- Feeds into model retraining workflow
- Continuous improvement based on usage patterns

## Environment Variables

```bash
# Server
PORT=3010
LOG_LEVEL=info
CORS_ORIGIN=*

# Ollama
OLLAMA_URL=http://localhost:11434
QE_MODEL=llama2
EMBEDDING_MODEL=nomic-embed-text

# Service URLs
CICD_GOVERNOR_URL=http://localhost:3007
ROI_SERVICE_URL=http://localhost:3008
MANUAL_SESSION_HUB_URL=http://localhost:3009

# Data Ingestion
INGESTION_INTERVAL_MS=3600000  # 1 hour
```

## Development

### Prerequisites
- Node.js 20+
- Ollama running locally with llama2 and nomic-embed-text models

### Setup
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Start production
npm start
```

### Testing the Service
```bash
# Create a chat session
curl -X POST http://localhost:3010/api/v1/qe/chat/session \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"test","userId":"user1","persona":"dev"}'

# Send a message (use sessionId from above)
curl -X POST http://localhost:3010/api/v1/qe/chat/{sessionId}/message \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the test requirements?"}'

# Index knowledge base
curl -X POST http://localhost:3010/api/v1/qe/knowledge/index \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"test"}'
```

## Integration with Shifty Platform

### API Gateway
Add to API Gateway routing:
```typescript
'/qe/*': {
  target: 'http://qe-collaborator:3010',
  rewrite: (path) => path.replace(/^\/qe/, '')
}
```

### Frontend Integration
```typescript
import { QECollaborator } from '@shifty/sdk-core';

const qe = new QECollaborator({
  apiUrl: 'https://api.shifty.dev',
  tenantId: 'my-tenant',
  userId: 'current-user'
});

// Ask a question
const response = await qe.query({
  question: 'Is Feature X ready for release?',
  persona: 'product',
  context: { featureId: 'FEAT-123' }
});

console.log(response.answer);
console.log('Confidence:', response.confidence);
console.log('Sources:', response.sources);
```

## Future Enhancements

### High Priority (MVP Limitations to Address)
- [ ] **Persistent vector database** (Qdrant/Pinecone) - Currently in-memory, data lost on restart
- [ ] **Redis for session storage** - Currently in-memory Map, not scalable
- [ ] **Configurable thresholds** - Hard-coded confidence and timeout values
- [ ] **Active scheduled ingestion** - Currently disabled, knowledge base doesn't auto-update
- [ ] **Workspace protocol dependencies** - Replace wildcard (*) with workspace:* for stability

### Medium Priority
- [ ] React UI components for chat interface
- [ ] Direct Jira/Figma API integration
- [ ] Voice interface
- [ ] RLHF training pipeline
- [ ] Usage analytics dashboard
- [ ] Custom persona creation
- [ ] Multi-modal support (images, diagrams)
- [ ] Proactive insights and recommendations

## Known Limitations (MVP)

1. **In-Memory Storage**: Knowledge base and chat sessions stored in memory
   - Data lost on service restart
   - Not suitable for production scale
   - Recommend: Implement Redis + Qdrant for production

2. **No Persistence**: Vector embeddings regenerated on restart
   - Expensive and time-consuming for large datasets
   - Recommend: Use persistent vector database

3. **Scheduled Ingestion Disabled**: Knowledge base won't auto-update
   - Requires manual trigger via `/api/v1/qe/knowledge/index`
   - Recommend: Enable scheduled ingestion with proper tenant management

4. **Hard-Coded Configuration**: Thresholds and timeouts not configurable
   - Confidence threshold: 30%
   - HTTP timeouts: 5000ms
   - Recommend: Move to environment variables

5. **No Session Cleanup**: Old chat sessions never expire
   - Memory leak potential
   - Recommend: Implement TTL-based cleanup

