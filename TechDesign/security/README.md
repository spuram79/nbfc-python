# Security Architecture Documentation

## Overview

This document outlines the security architecture for the NBFC-Python application, ensuring compliance with RBI regulations and industry best practices.

## Security Layers

### 1. Network Security

```
Internet → API Gateway → Load Balancer → Kubernetes Services
                    ↓
            WAF + DDoS Protection
```

- **API Gateway (Next.js API Routes):** Request routing with validation
- **WAF:** OWASP Top 10 protection, SQL injection prevention
- **DDoS Protection:** Cloudflare/AWS Shield

### 2. Authentication

#### JWT Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "role": "customer",
    "company_id": "fintrust",
    "scope": "loan:read loan:create",
    "iat": 1516239022,
    "exp": 1516242622
  }
}
```

#### Session Management
- Tokens expire in 15 minutes
- Refresh tokens used to get new access tokens
- Refresh tokens stored securely (httpOnly cookies in production)
- One session per user device

### 3. Authorization (RBAC)

#### Roles & Permissions

| Role | Permissions |
|------|-------------|
| `admin` | Full system access, all CRUD operations |
| `branch_manager` | Customer management, loan approval |
| `loan_officer` | Loan processing, verification |
| `collections` | Payment collection, dunning |
| `customer` | Own data access only |

#### Scopes (per endpoint)

| Endpoint | Required Scope |
|----------|---------------|
| GET /loans | `loan:read` |
| POST /loans | `loan:create` |
| POST /loans/{id}/disburse | `loan:disburse` |
| POST /payments | `payment:create` |
| GET /customers | `customer:read` |
| PUT /customers/{id} | `customer:update` |

### 4. Data Protection

#### At-Rest Encryption

| Data | Protection |
|------|------------|
| Database | AES-256 (PostgreSQL TDE) |
| S3 Documents | SSE-KMS |
| Backups | Encrypted with KMS keys |

#### Sensitive Fields

| Field | Encryption |
|-------|------------|
| PAN Number | Application-level encryption |
| Aadhaar Number | Application-level encryption |
| Mobile Number | Hashed for search |
| Address | Encrypted |

#### Data Masking in Logs

```typescript
function maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['pan', 'aadhaar', 'mobile', 'password'];
  const masked = { ...data };
  for (const field of sensitiveFields) {
    if (field in masked) {
      masked[field] = '***MASKED***';
    }
  }
  return masked;
}
```

### 5. API Security

#### Rate Limiting
- **Default:** 100 requests/minute per IP
- **Authenticated:** 500 requests/minute per user
- **Headers:**
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1623045600
  ```

#### Input Validation

```typescript
// Example validation for loan application
const loanApplicationSchema = {
  customer_id: { type: 'uuid', required: true },
  product_id: { type: 'string', enum: loanProducts },
  amount: { type: 'number', min: 50000, max: 1500000 },
  tenure_months: { type: 'number', min: 6, max: 60 }
};
```

### 6. Compliance (RBI Guidelines)

#### Data Localization
- All data stored in India (ap-south-1)
- No data sent outside India without explicit consent

#### Audit Trail
- Immutable logs with 7-year retention
- Every state change recorded

#### Consent Management
- Explicit consent for data processing
- GDPR-style data subject rights

#### Compliance Checklist
- [x] Data stored in Indian data centers
- [x] Regular security audits
- [x] Pen-testing quarterly
- [x] Vulnerability scanning (Snyk)
- [x] SOC2 Type II compliance target

### 7. Secrets Management

```bash
# Environment variables (Next.js)
DATABASE_URL=postgresql://...
MONGO_URL=mongodb://...
REDIS_URL=redis://...

# API Keys (server-side only)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxxx

# Security
JWT_SECRET=long-random-string
ENCRYPTION_KEY=file:///run/secrets/encryption-key
```

### 8. Security Testing

| Test Type | Frequency | Tool |
|-----------|-----------|------|
| SAST | Pre-commit | Snyk Code |
| DAST | CI | OWASP ZAP |
| Dependency | Daily | Dependabot |
| Pen Test | Quarterly | External Vendor |

### 9. Monitoring & Alerting

#### Security Events to Monitor
- Failed authentication attempts (>5 in 5 min)
- Invalid JWT tokens
- Rate limit breaches
- SQL injection attempts
- Unauthorized API access
- Large data exports

#### Alert Channels
- Slack: #security-alerts
- PagerDuty: Critical incidents
- Email: Daily summary reports

### 10. Incident Response

| Severity | Response Time | Notification |
|----------|---------------|--------------|
| Critical | 30 minutes | 24/7 Security Team |
| High | 2 hours | Security Team |
| Medium | 24 hours | Product Team |
| Low | 72 hours | Team Lead |

## Key Security Features

### 1. Multi-Tenant Isolation
- Company ID in all requests
- Row-level security in database
- Cache separation per tenant

### 2. End-to-End Encryption
- HTTPS everywhere (TLS 1.3)
- Database encryption at rest
- Field-level encryption for PII

### 3. Audit & Compliance
- Immutable audit logs in MongoDB
- 7-year retention policy
- RBI-compliant reporting

### 4. Secure Development
- Pre-commit hooks for security
- Automated vulnerability scanning
- Security-focused code reviews