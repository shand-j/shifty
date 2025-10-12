# 🚀 Deployment Guide

Complete guide for deploying the Shifty AI Testing Platform across all environments.

## 🎯 Quick Deployment

| Environment           | Command                                       | Access                 |
| --------------------- | --------------------------------------------- | ---------------------- |
| **Local Development** | `./scripts/start-mvp.sh`                      | http://localhost:3000  |
| **Docker Compose**    | `docker-compose up`                           | http://localhost:3000  |
| **Kubernetes**        | `kubectl apply -k infrastructure/kubernetes/` | Configured via ingress |

---

## 🏠 Local Development

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 13+
- **Redis** 6+
- **Docker** (optional)

### Setup Steps

1. **Clone and Install:**

   ```bash
   git clone <repo-url>
   cd shifty
   npm install
   ```

2. **Database Setup:**

   ```bash
   # Start PostgreSQL (macOS with Homebrew)
   brew services start postgresql

   # Create database
   createdb shifty_platform

   # Run migrations (when available)
   npm run db:migrate
   ```

3. **Redis Setup:**

   ```bash
   # Start Redis
   brew services start redis
   # OR with Docker
   docker run -d -p 6379:6379 redis:alpine
   ```

4. **Environment Configuration:**

   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

5. **Start Development:**

   ```bash
   # Start all services
   ./scripts/start-mvp.sh

   # OR start individually
   npm run dev:gateway    # Port 3000
   npm run dev:tenant     # Port 3001
   npm run dev:auth       # Port 3002
   npm run dev:ai         # Port 3003
   npm run dev:generator  # Port 3004
   npm run dev:healing    # Port 3005
   ```

6. **Verify Installation:**
   ```bash
   ./scripts/validate-mvp.sh
   ```

---

## 🐳 Docker Development

### Full Stack with Docker Compose

```bash
# Start everything
docker-compose up

# With rebuild
docker-compose up --build

# Start specific services
docker-compose up api-gateway auth-service

# View logs
docker-compose logs -f api-gateway

# Stop all
docker-compose down
```

### Docker Compose Services

```yaml
# docker-compose.yml structure
services:
  postgres: # Database
  redis: # Cache
  api-gateway: # Port 3000
  auth-service: # Port 3002
  tenant-manager: # Port 3001
  ai-orchestrator: # Port 3003
  test-generator: # Port 3004
  healing-engine: # Port 3005
```

### Individual Service Containers

```bash
# Build specific service
docker build -f services/auth-service/Dockerfile -t shifty/auth-service .

# Run with environment
docker run -p 3002:3002 --env-file .env shifty/auth-service
```

---

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Ingress controller (nginx, traefik)
- Cert-manager for TLS (optional)

### Quick Deployment

```bash
# Apply all manifests
kubectl apply -k infrastructure/kubernetes/

# Check deployment status
kubectl get pods -n shifty

# Get ingress URL
kubectl get ingress -n shifty
```

### Manual Steps

1. **Create Namespace:**

   ```bash
   kubectl create namespace shifty
   ```

2. **Deploy Database:**

   ```bash
   kubectl apply -f infrastructure/kubernetes/postgres.yaml
   kubectl apply -f infrastructure/kubernetes/redis.yaml
   ```

3. **Deploy Services:**

   ```bash
   kubectl apply -f infrastructure/kubernetes/api-gateway.yaml
   kubectl apply -f infrastructure/kubernetes/auth-service.yaml
   kubectl apply -f infrastructure/kubernetes/tenant-manager.yaml
   kubectl apply -f infrastructure/kubernetes/ai-orchestrator.yaml
   ```

4. **Configure Ingress:**
   ```bash
   kubectl apply -f infrastructure/kubernetes/ingress.yaml
   ```

### Kubernetes Configuration Files

```
infrastructure/kubernetes/
├── kustomization.yaml     # Main kustomize file
├── namespace.yaml         # Shifty namespace
├── postgres.yaml          # PostgreSQL StatefulSet
├── redis.yaml            # Redis Deployment
├── api-gateway.yaml      # Gateway deployment & service
├── auth-service.yaml     # Auth deployment & service
├── tenant-manager.yaml   # Tenant deployment & service
├── ai-orchestrator.yaml  # AI deployment & service
├── test-generator.yaml   # Test Gen deployment & service
├── healing-engine.yaml   # Healing deployment & service
├── ingress.yaml          # Ingress configuration
└── secrets.yaml          # Secret templates
```

### Scaling Services

```bash
# Scale specific service
kubectl scale deployment auth-service --replicas=3 -n shifty

# Auto-scaling (HPA)
kubectl autoscale deployment auth-service --cpu-percent=70 --min=2 --max=10 -n shifty
```

---

## 🌩️ Cloud Provider Deployment

### AWS EKS

```bash
# Create EKS cluster
eksctl create cluster --name shifty-prod --region us-west-2

# Configure kubectl
aws eks update-kubeconfig --region us-west-2 --name shifty-prod

# Deploy
kubectl apply -k infrastructure/kubernetes/
```

### Google GKE

```bash
# Create GKE cluster
gcloud container clusters create shifty-prod --zone us-central1-a

# Get credentials
gcloud container clusters get-credentials shifty-prod --zone us-central1-a

# Deploy
kubectl apply -k infrastructure/kubernetes/
```

### Azure AKS

```bash
# Create AKS cluster
az aks create --resource-group shifty --name shifty-prod --node-count 3

# Get credentials
az aks get-credentials --resource-group shifty --name shifty-prod

# Deploy
kubectl apply -k infrastructure/kubernetes/
```

---

## 🏗️ Terraform Infrastructure

### AWS Infrastructure

```bash
cd infrastructure/terraform/aws
terraform init
terraform plan
terraform apply
```

### Multi-Cloud with Terraform

```
infrastructure/terraform/
├── modules/
│   ├── database/      # RDS/CloudSQL setup
│   ├── kubernetes/    # EKS/GKE/AKS cluster
│   ├── networking/    # VPC/subnets/security groups
│   └── monitoring/    # CloudWatch/Prometheus setup
├── environments/
│   ├── dev/          # Development environment
│   ├── staging/      # Staging environment
│   └── prod/         # Production environment
└── providers/
    ├── aws/          # AWS-specific configurations
    ├── gcp/          # Google Cloud configurations
    └── azure/        # Azure configurations
```

---

## 🔒 Environment Configuration

### Environment Variables

#### Required for All Services

```bash
NODE_ENV=production
LOG_LEVEL=info
DATABASE_URL=postgresql://user:pass@localhost:5432/shifty
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
```

#### Service-Specific Variables

**API Gateway (Port 3000)**

```bash
PORT=3000
AUTH_SERVICE_URL=http://auth-service:3002
TENANT_SERVICE_URL=http://tenant-manager:3001
AI_SERVICE_URL=http://ai-orchestrator:3003
```

**Auth Service (Port 3002)**

```bash
PORT=3002
JWT_EXPIRY=24h
BCRYPT_ROUNDS=12
```

**AI Orchestrator (Port 3003)**

```bash
PORT=3003
OLLAMA_HOST=http://localhost:11434
DEFAULT_MODEL=llama3.1
TEST_GENERATOR_URL=http://test-generator:3004
HEALING_ENGINE_URL=http://healing-engine:3005
```

### Secret Management

#### Kubernetes Secrets

```bash
# Create secrets
kubectl create secret generic shifty-secrets \
  --from-literal=jwt-secret=your-jwt-secret \
  --from-literal=db-password=your-db-password \
  -n shifty
```

#### Docker Secrets

```bash
# Create secret files
echo "your-jwt-secret" | docker secret create jwt_secret -
echo "your-db-password" | docker secret create db_password -
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoints

```bash
# Check all services
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Tenant Manager
curl http://localhost:3002/health  # Auth Service
curl http://localhost:3003/health  # AI Orchestrator
curl http://localhost:3004/health  # Test Generator
curl http://localhost:3005/health  # Healing Engine
```

### Kubernetes Health Monitoring

```bash
# Check pod health
kubectl get pods -n shifty

# Check service endpoints
kubectl get endpoints -n shifty

# View pod logs
kubectl logs -f deployment/api-gateway -n shifty
```

### Docker Health Monitoring

```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# View service logs
docker-compose logs -f api-gateway
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build Docker images
        run: docker-compose build

      - name: Deploy to Kubernetes
        run: |
          kubectl apply -k infrastructure/kubernetes/
          kubectl rollout status deployment/api-gateway -n shifty
```

### Automated Deployment Scripts

```bash
# Quick deployment script
./scripts/deploy-production.sh

# Staging deployment
./scripts/deploy-staging.sh

# Rollback deployment
./scripts/rollback-deployment.sh
```

---

## 🚨 Troubleshooting

### Common Issues

#### Port Conflicts

```bash
# Check what's using ports
lsof -i :3000  # API Gateway
lsof -i :3001  # Tenant Manager
lsof -i :3002  # Auth Service

# Kill processes
kill -9 $(lsof -t -i:3000)
```

#### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -p 5432 -U postgres -d shifty_platform

# Check Redis connection
redis-cli ping
```

#### Docker Issues

```bash
# Clean Docker system
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check Docker logs
docker-compose logs --tail=100 api-gateway
```

#### Kubernetes Issues

```bash
# Check pod status
kubectl describe pod <pod-name> -n shifty

# Check service endpoints
kubectl get endpoints -n shifty

# View recent events
kubectl get events -n shifty --sort-by=.metadata.creationTimestamp
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Kubernetes resource monitoring
kubectl top pods -n shifty
kubectl top nodes
```

### Logging

```bash
# Aggregate logs (development)
./scripts/collect-logs.sh

# Kubernetes logs
kubectl logs -f -l app=api-gateway -n shifty

# Docker Compose logs
docker-compose logs -f --tail=100
```

---

## 🔐 Security Checklist

- [ ] **Environment Variables:** No secrets in source code
- [ ] **JWT Secrets:** Strong, unique keys per environment
- [ ] **Database:** Secure credentials and network access
- [ ] **HTTPS:** SSL/TLS certificates configured
- [ ] **Firewall:** Only required ports exposed
- [ ] **Updates:** Keep dependencies and base images current
- [ ] **Monitoring:** Security scanning and log monitoring enabled

---

**Next Steps:** After deployment, see [Monitoring Guide](monitoring.md) for observability setup.

**Last Updated:** 2025-01-11
**Maintained by:** Shifty DevOps Team
