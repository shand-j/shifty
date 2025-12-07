# Mock Data Layer

Enterprise-scale mock data for the Shifty platform, providing realistic test data for development and demos.

## Overview

The mock data layer provides:
- **200+ users** across multiple teams with activity histories and skill assessments
- **50+ teams** with maturity assessments and quality culture scores
- **100+ projects** with **5000+ tests** (70% passing, 20% flaky, 10% failing)
- **500+ healing queue items** with confidence scores and DOM snapshots
- **30+ CI/CD pipelines** with execution history
- **ROI metrics** spanning 12 months with time series data
- **DORA metrics** with trend analysis
- **Adoption metrics** and engagement data

## Data Structure

### Users (`users.ts`)
```typescript
{
  id, name, email, avatar, persona, role,
  teamId, xp, level, streak,
  skills: [{ skill, level, trend }],
  stats: { testsWritten, testsHealed, ... },
  attentionFlags: [{ type, severity, reason }]
}
```

**Personas**: `dev`, `qa`, `po`, `designer`, `manager`, `gtm`

**Test Users**:
- `dev@shifty.ai` / `test` (Developer, admin)
- `qa@shifty.ai` / `test` (QA, admin)
- `po@shifty.ai` / `test` (Product Owner, admin)

### Teams (`teams.ts`)
50+ teams with maturity levels (1-5), adoption scores, and quality culture dimensions:
- Shift-left mindset
- Test ownership
- Collaboration culture
- Continuous improvement
- Automation-first
- Data-informed

### Projects (`projects.ts`)
100+ projects with test suites containing 5000+ total tests:
- 70% passing tests
- 20% flaky tests  
- 10% failing tests
- Quality scores, test coverage, flaky test ratios

### Healing Items (`healing.ts`)
500+ selector healing items with:
- Original and healed selectors
- Confidence scores (40-99%)
- Healing strategies (data-testid-recovery, text-content-matching, css-hierarchy-analysis, ai-powered-analysis)
- DOM snapshots
- Status (pending, approved, rejected)

### Pipelines (`pipelines.ts`)
30+ CI/CD pipeline runs with:
- Multiple providers (GitHub, GitLab, Jenkins, CircleCI)
- Test execution results
- Duration and performance metrics
- Commit information

### ROI Metrics (`roi.ts`)
12-month time series data:
- Time saved by activity (test generation, healing, manual testing, debugging, CI optimization)
- Costs avoided by category (incident prevention, production bugs, rework, downtime)
- Quality improvements (coverage increase, flaky test reduction, bug detection rate, cycle time reduction)
- Incidents prevented and bugs found pre-production

### DORA Metrics (`dora.ts`)
DevOps Research and Assessment metrics with 90-day time series:
- **Deployment Frequency** (deploys per week)
- **Lead Time for Changes** (hours)
- **Change Failure Rate** (percentage)
- **Time to Restore Service** (hours)

Each metric includes current/previous values, trends, and performance ratings (elite/high/medium/low).

## Usage

### Import All Mocks
```typescript
import { mockDataStore } from '@shifty/shared/mocks';

console.log(mockDataStore.users.length); // 200+
console.log(mockDataStore.projects.length); // 100+
```

### Import Specific Mocks
```typescript
import { mockUsers, mockTeams, mockProjects } from '@shifty/shared/mocks';
```

### Generate Fresh Data
```typescript
import { 
  generateMockUsers,
  generateMockTeams,
  generateMockProjects
} from '@shifty/shared/mocks';

const teams = generateMockTeams(50);
const users = generateMockUsers(teams.map(t => t.id));
const projects = generateMockProjects(teams.map(t => t.id), 100);
```

## Mock Data Characteristics

### Realistic Patterns
- **Temporal data**: Timestamps span last 12-24 months with business hours weighting
- **Distribution**: Status follows realistic patterns (70% success, 20% flaky, 10% failure)
- **Relationships**: Proper foreign keys linking users → teams → projects
- **Edge cases**: Struggling team members, overloaded developers, stale projects, inactive users

### Attention Flags
10% of users have attention flags:
- **Struggling**: Test quality below average
- **Disengaged**: Activity decreased 60%+
- **Overloaded**: Assigned to 4+ high-priority projects
- **Skill Gap**: Missing required skills
- **Mentorship Opportunity**: High performers ready to mentor

### Quality Culture Dimensions
Teams are scored on 6 dimensions (0-100):
- Shift-left mindset
- Test ownership
- Collaboration culture
- Continuous improvement
- Automation-first approach
- Data-informed decision making

## Integration with API Gateway

The API Gateway mock interceptor (`apps/api-gateway/src/middleware/mock-interceptor.ts`) automatically loads this data when `MOCK_MODE=true`.

### Enabling Mock Mode
```bash
# Environment variable
export MOCK_MODE=true

# Or HTTP header
curl -H "X-Mock-Mode: true" http://localhost:3000/api/v1/users
```

### Mock API Endpoints
All standard API endpoints return mock data when mock mode is enabled:
- `/api/v1/auth/login` - Mock authentication
- `/api/v1/users` - User list
- `/api/v1/teams` - Team list
- `/api/v1/projects` - Project list
- `/api/v1/healing` - Healing queue
- `/api/v1/pipelines` - Pipeline runs
- `/api/v1/roi/insights` - ROI metrics
- `/api/v1/insights/{persona}` - Persona-specific insights

## Extending Mock Data

### Adding New Data Types
1. Create new file in `packages/shared/src/mocks/`
2. Export factory functions
3. Add to `index.ts` exports
4. Update `MockDataStore` interface

### Customizing Data Generation
Modify generator functions to adjust:
- Data volumes (counts)
- Distribution patterns (status ratios)
- Temporal patterns (date ranges)
- Relationship structures

## Performance

Mock data generation is optimized:
- Lazy initialization on first use
- Efficient data structures (Maps for lookups)
- Minimal memory footprint (~10MB for full dataset)
- Fast generation (<1 second for all data)

## Security

Mock data:
- Uses generic names and email addresses
- No real credentials or sensitive data
- All passwords are "test" or "password" in mock mode
- Safe for public demos

## Dependencies

None! The mock data layer uses only built-in Node.js APIs:
- `crypto` for randomization
- No faker.js or external generators
- Lightweight and fast

## Troubleshooting

### Mock data not loading
```bash
# Verify mock mode is enabled
echo $MOCK_MODE

# Check API Gateway logs for initialization
docker-compose logs api-gateway | grep "Mock data"
```

### TypeScript errors
```bash
# Rebuild shared package
cd packages/shared
npm run build
```

### Stale data
```bash
# Restart services to regenerate
docker-compose restart api-gateway
```
