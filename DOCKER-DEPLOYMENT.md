# Docker Deployment Guide for NBFC-Python Application

This guide provides comprehensive instructions for containerizing and deploying the NBFC (Non-Banking Financial Company) SaaS application using Docker.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start (Development)](#quick-start-development)
- [Production Deployment](#production-deployment)
- [Environment Variables](#environment-variables)
- [Docker Images](#docker-images)
- [Monitoring & Logging](#monitoring--logging)
- [Security Considerations](#security-considerations)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

The NBFC application follows a multi-container architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx)                     │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                        │
│                  (Next.js 16.x, React 19.x)                │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                         │
│                  (Citus for multi-tenant)                   │
└─────────────────────────────────────────────────────────────┘
```

### Services

| Service | Container | Purpose |
|---------|-----------|---------|
| `nbfc-app` | `nbfc-python:latest` | Next.js frontend and API |
| `nbfc-db` | `postgres:16-alpine` | PostgreSQL database |
| `nbfc-redis` | `redis:7-alpine` | Session caching, rate limiting |
| `nbfc-minio` | `minio/minio:latest` | S3-compatible document storage |
| `nbfc-nginx` | `nginx:alpine` | Reverse proxy, TLS termination |

---

## Prerequisites

- Docker Engine 24.x or later
- Docker Compose v2.27 or later
- PostgreSQL client (optional, for database operations)
- Domain name with DNS configured (production)
- SSL/TLS certificates (production)

---

## Quick Start (Development)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd nbfc-python

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your development values
```

### 2. Start Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Initialize database
docker-compose exec app npm run db:init
```

### 3. Access the Application

- Application: http://localhost:3000
- Database: localhost:5432 (PostgreSQL)
- MinIO Console: http://localhost:9001 (admin/admin123)

### 4. Development Commands

```bash
# Run Next.js dev server with hot reload
docker-compose exec app npm run dev

# Run linting
docker-compose exec app npm run lint

# Access database shell
docker-compose exec db psql -U postgres -d nbfc_dev

# Stop services
docker-compose down

# Clean up (including volumes)
docker-compose down -v
```

---

## Production Deployment

### 1. Environment Setup

Create the production environment file:

```bash
# Create production .env file
cp .env.production.example .env.production

# Edit with production values
nano .env.production
```

### 2. SSL Certificate Setup (Let's Encrypt)

```bash
# Create certificate directory
mkdir -p nginx/certs

# Obtain certificates (requires domain DNS pointing to server)
certbot certonly --standalone -d your-domain.com

# Copy certificates
cp /etc/letsencrypt/live/your-domain.com/* nginx/certs/
```

### 3. Deploy with Production Compose

```bash
# Deploy production stack
docker-compose -f docker-compose.prod.yml up -d

# Check all services are running
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Initialize Production Database

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec app npm run db:init

# Create initial admin user (if applicable)
docker-compose -f docker-compose.prod.yml exec app node scripts/create-admin.js
```

---

## Environment Variables

### Required Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | - | Yes |
| `NEXTAUTH_URL` | NextAuth callback URL | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `COMPANY_ID` | Default company identifier | `default` | Yes |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Application port | `3000` |
| `RAZORPAY_KEY_ID` | Razorpay API key | - |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | - |
| `AWS_ACCESS_KEY_ID` | AWS S3 access key | - |
| `AWS_SECRET_ACCESS_KEY` | AWS S3 secret key | - |
| `AWS_REGION` | AWS region | `ap-south-1` |
| `S3_BUCKET_NAME` | S3 bucket for KYC docs | `nbfc-kyc` |

### Rate Limiting

| Variable | Description | Default |
|----------|-------------|---------|
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

---

## Docker Images

### Building Images

```bash
# Build development image
docker build -t nbfc-python:dev .

# Build production image
docker build -f Dockerfile.prod -t nbfc-python:prod .

# Build with specific version tag
docker build -t nbfc-python:v1.0.0 --build-arg VERSION=1.0.0 .
```

### Pushing to Registry

```bash
# Login to registry
docker login registry.example.com

# Tag and push
docker tag nbfc-python:prod registry.example.com/nbfc-python:latest
docker push registry.example.com/nbfc-python:latest
```

### Image Optimization

The production Dockerfile includes:
- Multi-stage build to reduce image size
- Non-root user for security
- Alpine Linux base for minimal footprint
- Layer caching optimization

---

## Monitoring & Logging

### Health Check Endpoint

The application exposes a health check at `/api/health`:

```bash
# Check application health
curl http://localhost:3000/api/health

# Response
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### Container Health Checks

Each service has health checks configured:

```yaml
# View container health status
docker-compose ps

# Health check commands
docker inspect --format='{{.State.Health.Status}}' nbfc-app
docker inspect --format='{{.State.Health.Status}}' nbfc-db
```

### Logging Configuration

```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f db

# Export logs to file
docker-compose logs app > logs/app-$(date +%Y%m%d).log 2>&1
```

### Prometheus Metrics Endpoint

The application exposes metrics at `/api/metrics` for Prometheus scraping:

```
GET /api/metrics
```

---

## Security Considerations

### 1. Container Security

```bash
# Run security scan
docker scan nbfc-python:prod

# Update base images regularly
docker pull postgres:16-alpine
docker pull redis:7-alpine
docker pull nginx:alpine
```

### 2. Network Security

```bash
# Create isolated network
docker network create nbfc-network

# Restrict container capabilities
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE ...
```

### 3. Secrets Management

Never commit secrets to the repository. Use:

```bash
# Docker secrets (Swarm mode)
echo "secret_value" | docker secret create db_password -

# Environment file (development only)
.env.local  # Keep in .gitignore

# Production secrets
AWS Secrets Manager / HashiCorp Vault
```

### 4. PostgreSQL Security

```sql
-- Enable row-level security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy for company isolation
CREATE POLICY company_isolation_policy ON customers
  FOR ALL TO PUBLIC
  USING (company_id = current_setting('app.company_id'));
```

---

## Backup & Recovery

### Automated Backups

```bash
# Create backup script
./scripts/backup-db.sh

# Schedule with cron
0 2 * * * /app/scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

### Manual Backup

```bash
# Create database backup
docker-compose exec db pg_dump -U postgres nbfc_dev > backup/db-$(date +%Y%m%d).sql

# Restore from backup
docker-compose exec -T db psql -U postgres nbfc_dev < backup/db-20250115.sql
```

---

## Troubleshooting

### Common Issues

#### Application won't start

```bash
# Check logs
docker-compose logs app

# Verify environment variables
docker-compose exec app env | grep DATABASE

# Check database connection
docker-compose exec app node -e "require('./lib/db').db.query('SELECT 1').then(console.log)"
```

#### Database connection failed

```bash
# Check if database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify credentials
docker-compose exec db psql -U postgres -c "\du"
```

#### Out of memory

```bash
# Check container memory usage
docker stats

# Increase container memory limit
docker-compose -f docker-compose.prod.yml up -d --scale app=2
```

#### Port conflicts

```bash
# Find conflicting processes
lsof -i :3000
lsof -i :5432

# Change ports in .env
echo "PORT=3001" >> .env.local
```

### Debug Mode

```bash
# Start with debug logging
LOG_LEVEL=debug docker-compose up

# Access container shell
docker-compose exec app sh
```

---

## Scaling

### Horizontal Scaling (Production)

```bash
# Scale application instances
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Scale with load balancer
# Configure nginx upstream block for multiple app instances
```

### Database Scaling

For production workloads, consider:
- PostgreSQL Citus for sharding
- Read replicas for reporting
- Connection pooling with PgBouncer

---

## CI/CD Integration

### GitHub Actions Example

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
      - uses: actions/checkout@v4
      - name: Build and push
        run: |
          docker build -t registry.example.com/nbfc-python:latest .
          docker push registry.example.com/nbfc-python:latest
      - name: Deploy
        run: ssh production-server "cd /app && docker-compose pull && docker-compose up -d"
```

---

## Support

For issues and questions:
- Check the logs: `docker-compose logs -f`
- Review the Tech Design document: `TechDesign.md`
- Contact the development team