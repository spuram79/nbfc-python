# API Design Documentation

## Overview

This document describes the API design for the NBFC-Python Multi-Loan Lending Application. All APIs are RESTful, versioned under `/api/v1`, and use JSON over HTTPS.

## API Gateway

All requests pass through an API Gateway that handles:
- TLS termination
- Authentication (JWT validation)
- Rate limiting
- Request routing

## Authentication Flow

```
POST /api/v1/auth/login
→ Validate credentials
→ Generate JWT (15 min expiry) + Refresh Token
→ Return tokens
```

## Core Endpoints

### Customer Management

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `POST` | `/api/v1/customers` | Register new customer | Optional |
| `GET` | `/api/v1/customers` | List customers (paginated) | Admin |
| `GET` | `/api/v1/customers/{id}` | Get customer details | Admin/Customer |
| `PUT` | `/api/v1/customers/{id}` | Update customer info | Admin/Customer |
| `POST` | `/api/v1/customers/{id}/kyc` | Upload KYC documents | Customer |

### Loan Management

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `POST` | `/api/v1/loans` | Submit loan application | Customer |
| `GET` | `/api/v1/loans` | List loans (filtered) | Admin/Customer |
| `GET` | `/api/v1/loans/{id}` | Get loan details | Admin/Customer |
| `PUT` | `/api/v1/loans/{id}` | Update loan status | Admin |
| `POST` | `/api/v1/loans/{id}/underwrite` | Trigger underwriting | Admin |
| `POST` | `/api/v1/loans/{id}/disburse` | Initiate disbursement | Admin |
| `GET` | `/api/v1/loans/{id}/schedule` | Get repayment schedule | Admin/Customer |

### Payment Management

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `POST` | `/api/v1/payments` | Record payment | Admin/Customer |
| `GET` | `/api/v1/payments` | List payments (by loan) | Admin |
| `GET` | `/api/v1/payments/{id}` | Get payment details | Admin |
| `DELETE` | `/api/v1/payments/{id}` | Refund payment | Admin |

### Reports

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| `GET` | `/api/v1/reports/regulatory` | Generate RBI returns | Admin |
| `GET` | `/api/v1/reports/portfolio` | Portfolio metrics | Admin |

## Request/Response Schemas

### Customer Registration

**Request:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "mobile": "+919876543210",
  "dob": "1990-01-15",
  "address": "123 Main St, Mumbai"
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

### Loan Application

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

## Error Responses

All errors follow this format:

```json
{
  "code": "ERR_VALIDATION",
  "message": "Invalid request payload",
  "details": {
    "field": "amount",
    "reason": "must be between 50000 and 1500000"
  },
  "timestamp": "2026-06-08T00:00:00Z",
  "request_id": "req-123"
}
```

## Rate Limiting

- Default: 100 requests/minute per user
- Burst: 200 requests/minute
- Headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Versioning Strategy

- URL version: `/api/v1/`
- Header version: `Accept: application/vnd.nbfc.v1+json`
- Breaking changes require new version endpoint