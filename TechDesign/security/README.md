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

- **API Gateway (Kong)**: TLS termination, rate limiting, JWT validation
- **WAF**: OWASP Top 10 protection, SQL injection prevention
- **DDoS Protection**: Cloudflare/AWS Shield

### 2. Authentication

#### JWT Token Structure
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "roles": ["customer"],
    "scope": "loan:read loan:create",
    "iat": 1516239022,
    "exp": 1516242622
  }
}
```

#### OAuth2 Flow
1. User authenticates via Auth0/Keycloak
2. ID Token + Access Token returned
3. Access token used for API calls
4. Token expires in 15 minutes
5. Refresh token used to get new access token

### 3. Authorization (RBAC)

#### Roles
| Role | Permissions |
|------|-------------|
| `admin` | Full system access |
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
```python
# Example
def mask_sensitive_data(data):
    sensitive_fields = ['pan', 'aadhaar', 'mobile']
    for field in sensitive_fields:
        if field in data:
            data[field] = '***MASKED***'
    return data
```

### 5. API Security

#### Rate Limiting
- **Default**: 100 requests/minute per IP
- **Authenticated**: 500 requests/minute per user
- **Headers**:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1623045600
  ```

#### Input Validation
```typescript
// Example validation
const loanSchema = Joi.object({
  amount: Joi.number().min(50000).max(1500000).required(),
  tenure_months: Joi.number().min(6).max(60).required(),
  product_id: Joi.string().valid('personal', 'vehicle', 'home').required()
});
```

### 6. Compliance

#### RBI Guidelines
- **Data Localization**: All data stored in India (ap-south-1)
- **Audit Trail**: Immutable logs with 7-year retention
- **Consent Management**: Explicit consent for data processing
- **Privacy**: GDPR-style data subject rights

#### Compliance Checklist
- [x] Data stored in Indian data centers
- [x] Regular security audits
- [x] Pen-testing quarterly
- [x] Vulnerability scanning (Snyk)
- [x] SOC2 Type II compliance (target)

### 7. Incident Response

| Severity | Response Time | Notification |
|----------|---------------|--------------|
| Critical | 30 minutes | 24/7 Security Team |
| High | 2 hours | Security Team |
| Medium | 24 hours | Product Team |
| Low | 72 hours | Team Lead |

### 8. secrets Management

```bash
# HashiCorp Vault integration
VAULT_ADDR=https://vault.nbfc.internal
VAULT_TOKEN=$(cat /var/run/secrets/vault-token)

# Fetch database credentials
DB_PASSWORD=$(vault kv get -field=password secret/nbfc/database)
```

### 9. Security Testing

| Test Type | Frequency | Tool |
|-----------|-----------|------|
| SAST | Pre-commit | Snyk Code |
| DAST | CI | OWASP ZAP |
| Dependency | Daily | Dependabot |
| Pen Test | Quarterly | External Vendor |

### 10. Monitoring & Alerting

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