# Enterprise Features Documentation

## Overview

Shifty Enterprise provides advanced AI model management capabilities with per-tenant isolation, secure data lifecycle management, and gamified human-in-the-loop validation. All AI inference and training runs on self-hosted infrastructure using Hugging Face models, Ollama deployments, or custom checkpoints - **no external LLM APIs (e.g., ChatGPT) are used**.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Enterprise Control Plane                          │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ GPU         │  │ Model       │  │ Data        │  │ HITL        │    │
│  │ Provisioner │  │ Registry    │  │ Lifecycle   │  │ Arcade      │    │
│  │ (3006)      │  │ (3007)      │  │ (3008)      │  │ (3009)      │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │                │           │
│  ┌──────▼────────────────▼────────────────▼────────────────▼──────┐    │
│  │                    Tenant Isolation Layer                       │    │
│  │    Per-tenant: GPU instances, models, datasets, workspaces     │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
             ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
             │ Vast.ai GPU │ │ Hugging Face│ │ Ollama      │
             │ Instances   │ │ Hub         │ │ Self-hosted │
             └─────────────┘ └─────────────┘ └─────────────┘
```

## Services

### 1. GPU Provisioner Service (Port 3006)

Manages per-tenant GPU instances on vast.ai for isolated AI workloads.

#### Key Features
- **Per-Tenant Isolation**: Each tenant gets dedicated GPU instances
- **Cost Management**: Real-time cost tracking with budget guardrails
- **Auto-scaling**: Optional auto-scaling based on utilization
- **Health Monitoring**: Continuous health checks for model endpoints

#### API Endpoints

```bash
# Provision a new GPU instance
POST /api/v1/instances
{
  "tenantId": "uuid",
  "config": {
    "instanceType": "A100_40GB",
    "gpuCount": 1,
    "diskSize": 100,
    "region": "us-east",
    "maxBudgetPerHour": 5.00
  },
  "modelCheckpoint": "meta-llama/Llama-2-7b-chat-hf"
}

# Get instance status
GET /api/v1/instances/:instanceId

# Get tenant instances
GET /api/v1/tenants/:tenantId/instances

# Get cost summary
GET /api/v1/tenants/:tenantId/costs?start=2024-01-01&end=2024-01-31

# Terminate instance
DELETE /api/v1/instances/:instanceId
```

#### Supported GPU Types
- RTX_3090
- RTX_4090
- A100_40GB
- A100_80GB
- H100

---

### 2. Model Registry Service (Port 3007)

Manages per-tenant AI models from various sources with full lifecycle control.

#### Key Features
- **Multi-Source Support**: Hugging Face, Ollama, custom checkpoints, S3
- **Training Pipeline**: Fine-tuning with progress tracking
- **Evaluation Framework**: Automated and human evaluation
- **Version Control**: Model versioning and rollback

#### Model Sources

| Source | Description | Example |
|--------|-------------|---------|
| `huggingface` | Models from Hugging Face Hub | `meta-llama/Llama-2-7b-chat-hf` |
| `ollama` | Locally hosted Ollama models | `llama3.1:8b` |
| `custom` | Custom fine-tuned checkpoints | Training job outputs |
| `s3` | S3-stored model weights | `s3://bucket/model.bin` |

#### API Endpoints

```bash
# Register a model
POST /api/v1/models
{
  "tenantId": "uuid",
  "name": "Test Generator Model",
  "source": "huggingface",
  "sourceId": "codellama/CodeLlama-7b-Instruct-hf",
  "config": {
    "temperature": 0.3,
    "maxTokens": 2048
  }
}

# Get model status
GET /api/v1/models/:modelId

# Deploy model to GPU instance
POST /api/v1/models/:modelId/deploy
{
  "instanceId": "uuid",
  "replicas": 1
}

# Start training job
POST /api/v1/tenants/:tenantId/training-jobs
{
  "baseModelId": "uuid",
  "datasetId": "uuid",
  "hyperparameters": {
    "learningRate": 2e-5,
    "batchSize": 4,
    "epochs": 3
  }
}

# Create evaluation
POST /api/v1/models/:modelId/evaluations
{
  "tenantId": "uuid",
  "evaluationType": "automated",
  "metrics": {
    "accuracy": 0.92,
    "f1Score": 0.89
  }
}
```

---

### 3. Data Lifecycle Service (Port 3008)

Comprehensive data governance with retention policies, secure deletion, and compliance reporting.

#### Key Features
- **Retention Policies**: Configurable per data classification
- **Secure Deletion**: Multiple methods including DoD 5220.22-M, NIST 800-88
- **Deletion Certificates**: Cryptographic proof of data destruction
- **Disposable Workspaces**: Auto-destroying training environments
- **Audit Logging**: Complete access trail for compliance

#### Data Classification Levels
- `public`
- `internal`
- `confidential`
- `restricted`
- `pii` (Personally Identifiable Information)
- `phi` (Protected Health Information)

#### Deletion Methods

| Method | Description | Compliance |
|--------|-------------|------------|
| `standard` | Basic file deletion | Internal Policy |
| `secure_overwrite` | 3-pass overwrite | GDPR, SOC2 |
| `cryptographic_erase` | Key destruction | GDPR, SOC2, PCI-DSS |
| `dod_5220` | DoD 5220.22-M (7 pass) | GDPR, SOC2, HIPAA |
| `nist_800_88` | NIST 800-88 Clear + Purge | GDPR, SOC2, HIPAA |

#### API Endpoints

```bash
# Create retention policy
POST /api/v1/tenants/:tenantId/retention-policies
{
  "name": "Training Data Policy",
  "dataClassifications": ["confidential", "pii"],
  "retentionDays": 90,
  "autoDelete": true,
  "archiveBeforeDelete": true,
  "notifyBeforeDeletion": true,
  "notificationDaysBeforeDeletion": 7
}

# Register data asset
POST /api/v1/tenants/:tenantId/assets
{
  "type": "dataset",
  "name": "Customer Feedback Dataset",
  "classification": "confidential",
  "storageLocation": "s3://tenant-bucket/datasets/feedback.json",
  "sizeBytes": 1048576,
  "retentionPolicyId": "uuid",
  "createdBy": "user-uuid"
}

# Request secure deletion
POST /api/v1/tenants/:tenantId/deletion-jobs
{
  "assetIds": ["uuid1", "uuid2"],
  "method": "nist_800_88",
  "reason": "End of retention period",
  "requestedBy": "user-uuid"
}

# Execute deletion (with approval)
POST /api/v1/deletion-jobs/:jobId/execute
{
  "approvedBy": "admin-uuid"
}

# Create disposable workspace
POST /api/v1/tenants/:tenantId/workspaces
{
  "type": "training",
  "sizeAllocatedBytes": 107374182400,
  "autoDestroyAfterMinutes": 120
}

# Generate compliance report
POST /api/v1/tenants/:tenantId/compliance-reports
{
  "reportType": "deletion_audit",
  "periodStart": "2024-01-01T00:00:00Z",
  "periodEnd": "2024-01-31T23:59:59Z",
  "generatedBy": "admin-uuid"
}
```

---

### 4. HITL Arcade Service (Port 3009)

Gamified human-in-the-loop validation system for generating high-quality training data.

#### Key Features
- **Mission System**: Various validation tasks with rewards
- **Gamification**: XP, levels, coins, badges, streaks
- **Leaderboards**: Multiple ranking categories
- **Training Pipeline**: Feedback directly feeds tenant models

#### Mission Types

| Type | Description | Typical Reward |
|------|-------------|----------------|
| `label_test_output` | Review AI-generated test results | 50-100 XP |
| `validate_selector` | Validate healed selectors | 30-50 XP |
| `rate_test_quality` | Rate quality of generated tests | 40-80 XP |
| `verify_fix` | Verify suggested fixes | 60-120 XP |
| `classify_error` | Classify error types | 40-60 XP |
| `annotate_ui_element` | Annotate UI elements | 50-100 XP |
| `review_model_output` | Review model inference | 70-150 XP |
| `approve_deployment` | Approve model for deployment | 200-500 XP |

#### Gamification Elements

**Levels & XP**
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 250 XP
- Level 5: 1,000 XP
- Level 10: 9,000 XP
- Level 15: 50,000 XP

**Badges**
- `first_mission` - Complete your first mission
- `ten_missions` - Complete 10 missions
- `hundred_missions` - Complete 100 missions
- `week_streak` - 7-day streak
- `month_streak` - 30-day streak
- `high_accuracy` - 95% accuracy

#### API Endpoints

```bash
# Get/create user profile
GET /api/v1/profiles/:userId?tenantId=uuid

# Get available missions
GET /api/v1/tenants/:tenantId/missions/available?userId=uuid&limit=10

# Assign mission to user
POST /api/v1/missions/:missionId/assign
{
  "userId": "uuid"
}

# Complete mission
POST /api/v1/missions/:missionId/complete
{
  "userId": "uuid",
  "result": {
    "selectedOption": "correct",
    "confidence": 0.95,
    "notes": "Clear test case"
  }
}

# Get leaderboard
GET /api/v1/tenants/:tenantId/leaderboard?type=xp_all_time&limit=10

# Create training dataset from feedback
POST /api/v1/tenants/:tenantId/datasets
{
  "name": "Selector Validation Dataset v1",
  "missionType": "validate_selector",
  "description": "High-quality selector validation samples"
}

# Get arcade statistics
GET /api/v1/tenants/:tenantId/stats?start=2024-01-01&end=2024-01-31
```

---

## Configuration

### Environment Variables

```bash
# GPU Provisioner
VASTAI_API_KEY=your-vastai-api-key
SHIFTY_INTERNAL_API_KEY=internal-service-key

# Model Registry
HUGGINGFACE_API_TOKEN=your-hf-token
OLLAMA_ENDPOINT=http://ollama:11434
GPU_PROVISIONER_URL=http://gpu-provisioner:3006
DATA_LIFECYCLE_URL=http://data-lifecycle:3008

# Data Lifecycle
# No additional configuration required

# HITL Arcade
# No additional configuration required

# Common
DATABASE_URL=postgresql://postgres:postgres@platform-db:5432/shifty_platform
```

### Database Migration

Run the enterprise migration to create required tables:

```bash
psql -d shifty_platform -f infrastructure/docker/enterprise-migration.sql
```

---

## Security Considerations

### Data Isolation
- Each tenant has completely isolated:
  - GPU instances
  - Model weights and checkpoints
  - Training datasets
  - Inference logs
  - HITL feedback data

### No Cross-Tenant Access
- All queries are scoped by `tenant_id`
- Foreign key constraints enforce referential integrity
- API endpoints validate tenant ownership

### Secure Deletion
- Multiple deletion methods for compliance
- Cryptographic verification of destruction
- Deletion certificates for audit trails
- Automatic cleanup of expired data

### Audit Trail
- Complete access logging
- Compliance reports on demand
- SOC2/GDPR/HIPAA ready controls

---

## Compliance Features

### SOC2
- ✅ Access logging
- ✅ Data retention policies
- ✅ Secure deletion with verification
- ✅ Role-based access control

### GDPR
- ✅ Data classification
- ✅ Right to deletion
- ✅ Data portability (export)
- ✅ Retention limits

### HIPAA
- ✅ PHI data classification
- ✅ Secure deletion (NIST 800-88)
- ✅ Audit trails
- ✅ Access controls

---

## Getting Started

1. **Configure vast.ai API key**
   ```bash
   export VASTAI_API_KEY=your-key
   ```

2. **Start enterprise services**
   ```bash
   docker-compose up gpu-provisioner model-registry data-lifecycle hitl-arcade
   ```

3. **Run database migrations**
   ```bash
   docker exec -i shifty-platform-db psql -U postgres -d shifty_platform < infrastructure/docker/enterprise-migration.sql
   ```

4. **Create a retention policy**
   ```bash
   curl -X POST http://localhost:3008/api/v1/tenants/{tenantId}/retention-policies \
     -H "Content-Type: application/json" \
     -d '{"name": "Default", "dataClassifications": ["internal"], "retentionDays": 365}'
   ```

5. **Provision a GPU instance**
   ```bash
   curl -X POST http://localhost:3006/api/v1/instances \
     -H "Content-Type: application/json" \
     -d '{"tenantId": "uuid", "config": {"instanceType": "A100_40GB", "gpuCount": 1, "diskSize": 100, "region": "us-east", "maxBudgetPerHour": 5}}'
   ```

6. **Register a model**
   ```bash
   curl -X POST http://localhost:3007/api/v1/models \
     -H "Content-Type: application/json" \
     -d '{"tenantId": "uuid", "name": "CodeLlama", "source": "huggingface", "sourceId": "codellama/CodeLlama-7b-Instruct-hf"}'
   ```
