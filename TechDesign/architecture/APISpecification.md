# API Design Specification

## Overview

This document details the RESTful API design for the NBFC SaaS Platform following microservices architecture principles.

---

## API Gateway Configuration

### Base URL Structure
```
Production: https://api.nbfc-platform.in/v1
Staging: https://staging-api.nbfc-platform.in/v1
Development: https://dev-api.nbfc-platform.in/v1
```

### Authentication
```
Header: Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
X-Request-ID: <uuid>
X-Tenant-ID: <tenant_identifier>
```

---

## Service APIs

### 1. Authentication Service (`/auth`)

#### POST /auth/login
```json
// Request
{
  "username": "branch.manager@company.com",
  "password": "secure_password",
  "tenant_id": "branch_001"
}

// Response (200)
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "dGhpcyBpcyBy...",
  "expires_in": 3600,
  "user": {
    "id": "usr_001",
    "name": "John Doe",
    "role": "branch_manager",
    "branch_id": "branch_001"
  }
}
```

#### POST /auth/refresh
```json
// Request
{
  "refresh_token": "dGhpcyBpcyBy..."
}

// Response (200)
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}
```

#### POST /auth/logout
```json
// Response (200)
{
  "message": "Successfully logged out"
}
```

---

### 2. Customer Service (`/customers`)

#### POST /customers
```json
// Request
{
  "personal": {
    "first_name": "Rajesh",
    "last_name": "Kumar",
    "mobile": "+919876543210",
    "email": "rajesh@example.com",
    "date_of_birth": "1985-06-15",
    "address": {
      "line1": "123 Main Street",
      "line2": "Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  },
  "kyc": {
    "aadhaar": "123456789012",
    "pan": "ABCDE1234F",
    "proof_type": "Aadhaar"
  }
}

// Response (201)
{
  "customer_id": "cust_001",
  "application_id": "app_001",
  "status": "kyc_pending",
  "created_at": "2026-06-08T09:30:00Z"
}
```

#### GET /customers/{customer_id}
```json
// Response (200)
{
  "customer_id": "cust_001",
  "name": "Rajesh Kumar",
  "mobile": "+919876543210",
  "email": "rajesh@example.com",
  "kyc_status": "verified",
  "addresses": [...],
  "created_at": "2026-06-08T09:30:00Z",
  "updated_at": "2026-06-08T10:00:00Z"
}
```

#### PUT /customers/{customer_id}/kyc-status
```json
// Request
{
  "status": "rejected",
  "reason": "Document expired"
}

// Response (200)
{
  "message": "KYC status updated"
}
```

---

### 3. Loan Service (`/loans`)

#### POST /loans
```json
// Request
{
  "customer_id": "cust_001",
  "product_id": "personal_loan",
  "loan_amount": 500000,
  "tenure_months": 24,
  "repayment_frequency": "monthly"
}

// Response (201)
{
  "application_id": "app_002",
  "status": "submitted",
  "application_number": "LN20260608001",
  "created_at": "2026-06-08T10:30:00Z"
}
```

#### GET /loans/applications?customer_id={customer_id}
```json
// Response (200)
[
  {
    "application_id": "app_002",
    "product_name": "Personal Loan",
    "requested_amount": 500000,
    "status": "under_review",
    "created_at": "2026-06-08T10:30:00Z"
  }
]
```

#### PUT /loans/{application_id}/status
```json
// Request
{
  "status": "approved",
  "sanction_amount": 450000,
  "interest_rate": 12.5
}

// Response (200)
{
  "message": "Loan sanctioned",
  "sanction_letter_id": "sl_001"
}
```

---

### 4. Disbursement Service (`/disbursement`)

#### POST /disbursement/initiate
```json
// Request
{
  "loan_id": "loan_001",
  "amount": 450000,
  "bank_account": {
    "account_number": "9876543210",
    "ifsc": "HDFC0001234",
    "account_type": "savings"
  }
}

// Response (200)
{
  "disbursement_id": "disp_001",
  "status": "initiated",
  "transaction_id": "txn_001",
  "estimated_completion": "2026-06-08T12:00:00Z"
}
```

#### GET /disbursement/{disbursement_id}/status
```json
// Response (200)
{
  "disbursement_id": "disp_001",
  "loan_id": "loan_001",
  "amount": 450000,
  "status": "completed",
  "completed_at": "2026-06-08T11:30:00Z",
  "reference_number": "HDFC123456789"
}
```

---

### 5. Collections Service (`/collections`)

#### GET /collections/overdue
```json
// Query Params: branch_id=branch_001, page=1, size=50

// Response (200)
{
  "items": [
    {
      "loan_id": "loan_001",
      "customer_name": "Rajesh Kumar",
      "outstanding_amount": 45000,
      "due_date": "2026-06-05",
      "days_past_due": 3,
      "priority_score": 85
    }
  ],
  "total": 150,
  "page": 1,
  "size": 50
}
```

#### POST /collections/attempt
```json
// Request
{
  "loan_id": "loan_001",
  "attempt_type": "call",
  "notes": "Customer promised to pay tomorrow"
}

// Response (200)
{
  "attempt_id": "coll_001",
  "status": "scheduled"
}
```

---

### 6. Reporting Service (`/reports`)

#### POST /reports/generate
```json
// Request
{
  "report_type": "daily_disbursement",
  "branch_id": "branch_001",
  "date_from": "2026-06-01",
  "date_to": "2026-06-08",
  "format": "xlsx"
}

// Response (200)
{
  "report_id": "rpt_001",
  "status": "generating",
  "download_url": null
}
```

#### GET /reports/{report_id}
```json
// Response (200)
{
  "report_id": "rpt_001",
  "report_type": "daily_disbursement",
  "status": "completed",
  "download_url": "https://storage...report.xlsx",
  "generated_at": "2026-06-08T12:00:00Z"
}
```

---

### 7. Compliance Service (`/compliance`)

#### POST /compliance/kyc-verify
```json
// Request
{
  "customer_id": "cust_001",
  "documents": [
    {
      "type": "aadhaar",
      "file_id": "file_001"
    }
  ]
}

// Response (200)
{
  "verification_id": "vrf_001",
  "status": "completed",
  "confidence": 0.95,
  "flags": []
}
```

#### POST /compliance/aml-screen
```json
// Request
{
  "customer_id": "cust_001"
}

// Response (200)
{
  "screening_id": "aml_001",
  "status": "passed",
  "matches": []
}
```

---

## Webhooks

### Supported Webhooks
```
customer.kyc.completed
loan.status.changed
disbursement.completed
payment.received
collection.escalated
compliance.alert
```

### Webhook Payload Format
```json
{
  "event": "loan.status.changed",
  "timestamp": "2026-06-08T12:00:00Z",
  "data": {
    "loan_id": "loan_001",
    "old_status": "submitted",
    "new_status": "approved"
  },
  "signature": "sha256_signature"
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "mobile",
        "issue": "Invalid mobile number format"
      }
    ],
    "request_id": "req_001"
  }
}
```

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## Rate Limiting

```
Standard: 1000 requests/minute
Authenticated: 5000 requests/minute
Burst: 2x limit for 30 seconds
Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
```

---

## Pagination

```json
// Standard pagination format
{
  "data": [...],
  "pagination": {
    "page": 1,
    "size": 50,
    "total": 150,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```