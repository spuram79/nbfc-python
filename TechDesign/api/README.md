# API Design Documentation

## Overview

This document describes the API design for the NBFC-Python Multi-Loan Lending Application. All APIs are RESTful, versioned under `/api/v1`, and use JSON over HTTPS.

## API Gateway

All requests pass through the Next.js API routes with the following responsibilities:
- Authentication (JWT validation)
- Rate limiting
- Request routing
- Error handling

## Authentication Flow

```
POST /api/auth/login
→ Validate credentials
→ Generate JWT (15 min expiry) + Refresh Token
→ Return tokens
```

### JWT Token Structure
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "admin",
  "company_id": "fintrust",
  "scope": "loan:read loan:create",
  "iat": 1516239022,
  "exp": 1516242622
}
```

## Core Endpoints

### Customer Management

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `POST` | `/api/customers` | Register new customer | Optional |
| `GET` | `/api/customers` | List customers (paginated) | Admin |
| `GET` | `/api/customers/{id}` | Get customer details | Admin/Customer |
| `PUT` | `/api/customers/{id}` | Update customer info | Admin/Customer |
| `POST` | `/api/customers/{id}/kyc` | Upload KYC documents | Customer |

#### Customer Registration

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "mobile": "+919876543210",
  "dob": "1990-01-15",
  "address": "123 Main St, Mumbai",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

**Response (201):**
```json
{
  "customer_id": "uuid-v4",
  "kyc_status": "pending",
  "created_at": "2026-06-08T00:00:00Z"
}
```

### Loan Management

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `POST` | `/api/loans` | Submit loan application | Customer |
| `GET` | `/api/loans` | List loans (filtered) | Admin/Customer |
| `GET` | `/api/loans/{id}` | Get loan details | Admin/Customer |
| `PUT` | `/api/loans/{id}` | Update loan status | Admin |
| `POST` | `/api/loans/{id}/underwrite` | Trigger underwriting | Admin |
| `POST` | `/api/loans/{id}/disburse` | Initiate disbursement | Admin |

#### Loan Application

**Request:**
```json
{
  "customer_id": "uuid",
  "product_id": "personal",
  "amount": 500000,
  "tenure_months": 12
}
```

**Response (201):**
```json
{
  "application_id": "uuid-v4",
  "status": "draft",
  "created_at": "2026-06-08T00:00:00Z"
}
```

### Payment Management

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `POST` | `/api/payments` | Record payment | Admin/Customer |
| `GET` | `/api/payments` | List payments (by loan) | Admin |
| `GET` | `/api/payments/{id}` | Get payment details | Admin |

**Payment Record Request:**
```json
{
  "loan_id": "uuid",
  "amount": 5000,
  "method": "upi",
  "transaction_date": "2026-06-08T00:00:00Z"
}
```

### Reports

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `GET` | `/api/reports/regulatory` | Generate RBI returns | Admin |
| `GET` | `/api/metrics/portfolio` | Portfolio metrics | Admin |

## Request/Response Schemas

### Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "amount",
    "reason": "must be between 50000 and 1500000"
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_PRODUCT` | Loan product not found |
| `AMOUNT_OUT_OF_RANGE` | Loan amount outside valid range |
| `TENURE_OUT_OF_RANGE` | Tenure outside valid range |
| `CUSTOMER_NOT_FOUND` | Customer ID not found |
| `LOAN_NOT_FOUND` | Loan ID not found |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `VALIDATION_ERROR` | Request validation failed |

## Rate Limiting

- Default: 100 requests/minute per IP
- Headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Versioning Strategy

- URL version: `/api/`
- Header version: `Accept: application/vnd.nbfc+json`
- Breaking changes require new version endpoint

## API Route Summary

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/auth` | POST | Login/logout |
| `/api/customers` | GET, POST | Customer listing and registration |
| `/api/customers/[id]` | GET, PUT | Customer details and update |
| `/api/customers/[id]/kyc` | POST | KYC document upload |
| `/api/loans` | GET, POST | Loan listing and application |
| `/api/loans/[id]` | GET, PUT | Loan details and update |
| `/api/loans/[id]/underwrite` | POST | Trigger underwriting |
| `/api/loans/[id]/disburse` | POST | Initiate disbursement |
| `/api/payments` | GET, POST | Payment listing and recording |
| `/api/reports/regulatory` | GET | RBI return generation |
| `/api/metrics/portfolio` | GET | Portfolio metrics |

## Multi-Tenant Support

All API requests include company context:

1. **Subdomain Routing:** `company-name.nbfcapp.com`
2. **Header Override:** `X-Company-ID` header for API clients
3. **Context Propagation:** Company ID passed to all services

Example:
```
GET /api/loans?customer_id=uuid
Host: fintrust.nbfcapp.com
X-Company-ID: fintrust
```

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient scope) |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate application) |
| 429 | Too many requests (rate limit) |
| 500 | Internal server error |
| 502/503 | Service unavailable |

## API Examples

### Create Loan Application
```bash
curl -X POST https://app.nbfcapp.com/api/loans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "customer_id": "123e4567-e89b-12d3-a456-426614174000",
    "product_id": "personal",
    "amount": 500000,
    "tenure_months": 12
  }'
```

### List Customer Loans
```bash
curl -X GET "https://app.nbfcapp.com/api/loans?customer_id=123&status=approved" \
  -H "Authorization: Bearer <token>"
```

### Record Payment
```bash
curl -X POST https://app.nbfcapp.com/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "loan_id": "123e4567-e89b-12d3-a456-426614174000",
    "amount": 5000,
    "method": "upi"
  }'
```