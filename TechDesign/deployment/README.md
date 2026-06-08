# Deployment Architecture Documentation

## Overview

This document describes the deployment architecture, CI/CD pipeline, and infrastructure for the NBFC-Python application.

## Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud (ap-south-1)                 │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    VPC                                │ │
│  │                                                         │ │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐ │ │
│  │  │   Public    │   │   Private   │   │  Database   │ │ │
│  │  │    Subnet   │   │    Subnet   │   │   Subnet    │ │ │
│  │  │             │   │             │   │             │ │
│  │  │ NAT Gateway │   │  ECS/Fargate│   │  RDS/Aurora │ │ │
│  │  │             │   │             │   │             │ │
│  │  └─────────────┘   └─────────────┘   └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              CI/CD & Developer Tools                    │ │
│  │  - GitHub (source control)                             │ │
│  │  - GitHub Actions (CI/CD)                              │ │
│  │  - ECR (container registry)                            │ │
│  │  - ArgoCD (GitOps)                                     │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Build and Deploy
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Security scan
        uses: snyk/actions/node@master
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        run: |
          # Deploy to ECS/Fargate
          aws ecs update-service ...
```

### Deployment Stages

1. **Develop** → Deploy to staging environment
2. **Beta** → Manual approval → Deploy to pre-prod
3. **Main** → Deploy to production (blue-green)

## Environment Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://nbfc:pass@db.cluster.local/nbfc
MONGO_URL=mongodb://mongo.cluster.local:27017/nbfc
REDIS_URL=redis://redis.cluster.local:6379

# External Services
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxxx

# Security
JWT_SECRET=your-secret-key
ENCRYPTION_KEY_PATH=/run/secrets/encryption-key

# Feature Flags
FEATURE_NEW_DASHBOARD=true
```

### Secrets Management

```yaml
# AWS Secrets Manager
DB_PASSWORD: ${ssm:/nbfc/db-password}
JWT_SECRET: ${ssm:/nbfc/jwt-secret}
RAZORPAY_SECRET: ${ssm:/nbfc/razorpay-secret}

# Next.js .env file (server-side)
DATABASE_URL=postgresql://user:${DB_PASSWORD}@db.cluster.local/nbfc
JWT_SECRET=${JWT_SECRET}
```

## Container Architecture

### Docker Configuration

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build
COPY . .
RUN npm run build

# Runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=base /app .
EXPOSE 3000
CMD ["npm", "start"]
```

### Container Registry

| Environment | Registry | Tag Strategy |
|-------------|----------|--------------|
| Development | ECR | `dev-{commit-sha}` |
| Staging | ECR | `staging-{branch}` |
| Production | ECR | `prod-{git-tag}` |

## Kubernetes Configuration (ECS Fargate Equivalent)

### Service Definition

| Component | CPU | Memory | Replicas | Autoscaling |
|-----------|-----|--------|----------|-------------|
| web-ui | 512 | 1024 MB | 3 | Yes (CPU > 70%) |
| api-server | 1024 | 2048 MB | 4 | Yes (CPU > 70%) |
| worker | 1024 | 2048 MB | 2 | Yes (Queue > 100) |

### Persistent Volumes

| Component | Storage Class | Size | Backup |
|-----------|---------------|------|--------|
| PostgreSQL | gp3-encrypted | 100 Gi | Daily RDS Snapshot |
| MongoDB | gp3-encrypted | 50 Gi | Daily |
| Redis | gp3-encrypted | 10 Gi | Every 6 hours |

## Monitoring Stack

### Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `http_request_duration_seconds` | API latency | > 2s avg |
| `http_requests_total` | Request count | - |
| `active_loans` | Active loan count | - |
| `npa_ratio` | Non-performing assets | > 5% |

### Dashboard Structure

1. **API Dashboard**
   - Request rate
   - Latency distribution
   - Error rates
   - Status codes breakdown

2. **Database Dashboard**
   - Connections
   - Queries/sec
   - Latency
   - Cache hit ratio

3. **Business Dashboard**
   - Loans originated
   - Collections
   - NPAs
   - Conversion rates

### Logging Pipeline

```
Application Logs → CloudWatch → Lambda → Elasticsearch → Kibana
Error Logs → Sentry → Slack/PagerDuty
Audit Logs → MongoDB → Compliance Reports
```

## Backup & Disaster Recovery

### Backup Schedule

| Component | Frequency | Retention |
|-----------|-----------|-----------|
| RDS PostgreSQL | Daily | 35 days |
| MongoDB | Daily | 30 days |
| S3 Documents | Continuous | 7 years (WORM) |
| Redis | Every 6 hours | 7 days |

### DR Plan

| Scenario | RTO | RPO | Recovery Steps |
|----------|-----|-----|----------------|
| Single AZ failure | 30 min | 5 min | Failover to standby |
| Region failure | 2 hours | 1 hour | Cross-region restore |
| Data corruption | 4 hours | 24 hours | Point-in-time recovery |

## Scaling Strategy

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-server
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Database Scaling

- **Vertical:** RDS instance upgrade
- **Horizontal:** Read replicas, connection pooling
- **Sharding:** Citus extension (future)

## Multi-Tenant Deployment

### Tenant Isolation Strategy

1. **Database:** Row-level security with company_id
2. **Cache:** Separate Redis keys per company
3. **Storage:** S3 prefixes per company
4. **Monitoring:** Company-specific metrics

### Onboarding New Company

1. Add company to `lib/company-store.ts`
2. Create database schema (if not shared)
3. Set up monitoring alerts
4. Configure DNS/CNAME
5. Send onboarding email

## Health Checks

### Liveness Probe
```
GET /api/health
Response: 200 OK
Content: {"status": "healthy"}
```

### Readiness Probe
```
GET /api/health/ready
Response: 200 OK
Content: {"database": "connected", "redis": "connected"}
```

## Rollback Strategy

1. **Automated:** Health check failures trigger rollback
2. **Manual:** `helm rollback` command
3. **Database:** Point-in-time recovery to last snapshot

## Cost Optimization

| Resource | Optimization |
|----------|--------------|
| Compute | Spot instances for workers |
| Storage | S3 Intelligent Tiering |
| Database | Aurora Serverless for variable load |
| Cache | Redis with TTL for ephemeral data |