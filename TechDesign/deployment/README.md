# Deployment Architecture Documentation

## Overview

This document describes the deployment architecture, CI/CD pipeline, and infrastructure for the NBFC-Python application.

## Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    VPC (ap-south-1)                      │ │
│  │                                                         │ │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐ │ │
│  │  │   Public    │   │   Private   │   │   Database  │ │ │
│  │  │    Subnet   │   │    Subnet   │   │   Subnet    │ │ │
│  │  │             │   │             │   │             │ │ │
│  │  │ NAT Gateway │   │  EKS Nodes  │   │  RDS/Aurora │ │ │
│  │  │             │   │             │   │             │ │ │
│  │  └─────────────┘   └─────────────┘   └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Developer Tools                                │ │
│  │  - GitHub (source control)                               │ │
│  │  - GitHub Actions (CI/CD)                                │ │
│  │  - ECR (container registry)                              │ │
│  │  - ArgoCD (GitOps)                                       │ │
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
      
      - name: Build Docker image
        run: |
          docker build -t ${{ secrets.ECR_REGISTRY }}/nbfc:${{ github.sha }} .
          docker push ${{ secrets.ECR_REGISTRY }}/nbfc:${{ github.sha }}
      
      - name: Run tests
        run: npm test
      
      - name: Security scan
        uses: snyk/actions/node@master
      
      - name: Deploy to Kubernetes
        run: |
          helm upgrade --install nbfc \
            --set image.tag=${{ github.sha }} \
            ./helm/nbfc
```

### Deployment Stages

1. **Develop** → Deploy to staging environment
2. **Beta** → Manual approval → Deploy to pre-prod
3. **Main** → Deploy to production (blue-green)

## Kubernetes Architecture

### Helm Chart Structure
```
helm/nbfc/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── hpa.yaml
└── charts/
    └── subchart-dependencies
```

### Deployments

| Component | Replicas | Resources | Autoscale |
|-----------|----------|-----------|-----------|
| web-ui | 3 | 512Mi/256m | Yes (CPU > 70%) |
| api-server | 4 | 1Gi/512m | Yes (CPU > 70%) |
| worker | 2 | 1Gi/512m | Yes (Queue > 100) |

### Persistent Volumes

| Component | Storage Class | Size | Backup |
|-----------|---------------|------|--------|
| PostgreSQL | gp3-encrypted | 100Gi | Daily RDS Snapshot |
| MongoDB | gp3-encrypted | 50Gi | Daily |
| Redis | gp3-encrypted | 10Gi | Daily |

## Environment Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@db.cluster.local/nbfc
MONGO_URL=mongodb://mongo.cluster.local:27017/nbfc

# Redis
REDIS_URL=redis://redis.cluster.local:6379

# External Services
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxxx

# Security
JWT_SECRET_KEY_FILE=/run/secrets/jwt-secret
VAULT_ADDR=https://vault.cluster.local

# Feature Flags
FEATURE_NEW_DASHBOARD=true
```

### Secrets Management

```yaml
# Kubernetes Secrets
apiVersion: v1
kind: Secret
metadata:
  name: nbfc-secrets
type: Opaque
data:
  jwt-secret: <base64-encoded>
  db-password: <base64-encoded>
  razorpay-key: <base64-encoded>
```

## Monitoring Stack

### Prometheus Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `http_request_duration_seconds` | API latency | > 2s avg |
| `http_requests_total` | Request count | - |
| `active loans` | Active loan count | - |
| `npa_ratio` | Non-performing assets | > 5% |

### Grafana Dashboards

1. **API Dashboard**: Request rate, latency, errors
2. **Database Dashboard**: Connections, queries/sec, latency
3. **Business Dashboard**: Loans originated, collections, NPAs

### Logging Pipeline

```
Application Logs → Fluent Bit → Loki → Grafana
Error Logs → Sentry → Slack/PagerDuty
Audit Logs → Elasticsearch → Kibana
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

- **Vertical**: RDS instance upgrade (db.t4g.medium → db.t4g.large)
- **Horizontal**: Read replicas, connection pooling
- **Sharding**: Citus extension for PostgreSQL (future)