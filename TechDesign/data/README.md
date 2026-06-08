# Data Model Documentation

## Overview

This document describes the data model for the NBFC-Python application. The system uses PostgreSQL as the primary database with MongoDB for document storage and Redis for caching.

## Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        PostgreSQL                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  Core Transactional Data              │  │
│  │                                                         │  │
│  │  customers, loan_applications, loans,                 │  │
│  │  loan_schedules, payments, loan_products                │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  Multi-Tenant Isolation                │  │
│  │                                                         │  │
│  │  Row-level security or separate schemas per company     │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌───────────────────┐     ┌─────────────────────────────────────┐
│    MongoDB        │     │           Redis                     │
│  (DocumentStore)  │     │         (Cache/Sessions)              │
│                   │     │                                     │
│ kyc_documents     │     │ session:{id}                        │
│ esignatures       │     │ otp:{mobile}                        │
│ audit_logs        │     │ ratelimit:{endpoint}:{user_id}      │
└───────────────────┘     └─────────────────────────────────────┘
```

## PostgreSQL Schema

### Core Tables

#### 1. `customers` Table

Stores borrower information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `customer_id` | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| `first_name` | VARCHAR(50) | NOT NULL | Customer's first name |
| `last_name` | VARCHAR(50) | NOT NULL | Customer's last name |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Email address |
| `mobile` | VARCHAR(20) | UNIQUE, NOT NULL | Mobile number |
| `dob` | DATE | - | Date of birth |
| `address` | TEXT | - | Full address |
| `city` | VARCHAR(50) | - | City |
| `state` | VARCHAR(50) | - | State |
| `pincode` | VARCHAR(10) | - | Postal code |
| `kyc_status` | ENUM | DEFAULT 'pending' | KYC verification status: `pending`, `verified`, `rejected` |
| `risk_score` | INTEGER | - | Calculated risk score |
| `company_id` | VARCHAR(50) | FK(companies.id) | Tenant identifier for multi-tenancy |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

#### 2. `loan_products` Table

Stores available loan product configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `product_id` | VARCHAR(20) | PK | Product identifier: `personal`, `vehicle-2w`, `vehicle-4w`, `vehicle-ev`, `gold`, `msme`, `home`, `mortgage`, `topup` |
| `name` | VARCHAR(100) | NOT NULL | Product name |
| `type` | VARCHAR(20) | NOT NULL | Loan type for product-specific forms |
| `description` | TEXT | - | Product description |
| `interest_type` | ENUM | NOT NULL | `flat`, `reduced_balance`, `annuity` |
| `min_amount` | BIGINT | NOT NULL | Minimum loan amount |
| `max_amount` | BIGINT | NOT NULL | Maximum loan amount |
| `min_tenure` | INTEGER | NOT NULL | Minimum tenure (months) |
| `max_tenure` | INTEGER | NOT NULL | Maximum tenure (months) |
| `interest_rate_min` | DECIMAL | - | Minimum interest rate |
| `interest_rate_max` | DECIMAL | - | Maximum interest rate |
| `processing_fee` | DECIMAL | - | Processing fee amount |
| `processing_fee_type` | ENUM | - | `fixed` or `percentage` |
| `prepayment_penalty` | BOOLEAN | DEFAULT false | Whether prepayment is penalized |
| `is_active` | BOOLEAN | DEFAULT true | Product status |
| `company_id` | VARCHAR(50) | FK(companies.id) | Tenant identifier |

#### 3. `loan_applications` Table

Stores loan application records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `application_id` | UUID | PK | Unique identifier |
| `customer_id` | UUID | FK(customers.customer_id) | Applicant reference |
| `product_id` | VARCHAR(20) | FK(loan_products.product_id) | Product reference |
| `requested_amount` | BIGINT | NOT NULL | Requested loan amount |
| `tenure_months` | INTEGER | NOT NULL | Loan tenure |
| `interest_rate` | DECIMAL | - | Applied interest rate |
| `status` | ENUM | DEFAULT 'draft' | `draft`, `submitted`, `under_review`, `approved`, `rejected`, `disbursed`, `closed` |
| `underwriting_status` | ENUM | - | `pending`, `processing`, `approved`, `rejected` |
| `underwriting_score` | INTEGER | - | Risk score from underwriting |
| `rejection_reason` | TEXT | - | Reason for rejection if applicable |
| `company_id` | VARCHAR(50) | FK(companies.id) | Tenant identifier |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Submission time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

#### 4. `loans` Table

Stores approved and disbursed loans.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `loan_id` | UUID | PK | Unique identifier |
| `application_id` | UUID | FK(loan_applications.application_id) | Application reference |
| `disbursement_date` | TIMESTAMP | - | Date of disbursement |
| `actual_amount` | BIGINT | - | Disbursed amount |
| `status` | ENUM | - | `active`, `closed`, `defaulted`, `npa` |
| `closed_date` | TIMESTAMP | - | Date when loan was closed |
| `company_id` | VARCHAR(50) | FK(companies.id) | Tenant identifier |

#### 5. `loan_schedules` Table

Stores repayment schedules.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `schedule_id` | UUID | PK | Unique identifier |
| `loan_id` | UUID | FK(loans.loan_id) | Loan reference |
| `installment_no` | INTEGER | NOT NULL | Installment number |
| `due_date` | DATE | NOT NULL | Due date |
| `principal` | BIGINT | NOT NULL | Principal amount |
| `interest` | BIGINT | NOT NULL | Interest amount |
| `total_payment` | BIGINT | NOT NULL | Total payment |
| `paid_amount` | BIGINT | - | Amount paid |
| `status` | ENUM | DEFAULT 'pending' | `paid`, `pending`, `overdue`, `partial` |
| `payment_date` | TIMESTAMP | - | Actual payment date |

#### 6. `payments` Table

Stores repayment records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `payment_id` | UUID | PK | Unique identifier |
| `loan_id` | UUID | FK(loans.loan_id) | Loan reference |
| `schedule_id` | UUID | FK(loan_schedules.schedule_id) | Schedule reference |
| `amount` | BIGINT | NOT NULL | Payment amount |
| `method` | VARCHAR(20) | NOT NULL | `manual`, `auto_debit`, `upi`, `neft`, `cash` |
| `status` | ENUM | DEFAULT 'success' | `success`, `failed`, `refunded` |
| `transaction_date` | TIMESTAMP | DEFAULT NOW() | Payment timestamp |
| `reference_number` | VARCHAR(50) | UNIQUE | Gateway reference |
| `company_id` | VARCHAR(50) | FK(companies.id) | Tenant identifier |

#### 7. `companies` Table

Stores company/tenant configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(50) | PK | Company identifier (subdomain) |
| `name` | VARCHAR(100) | NOT NULL | Company short name |
| `full_name` | VARCHAR(200) | NOT NULL | Company legal name |
| `tagline` | VARCHAR(200) | - | Company tagline |
| `logo_config` | JSONB | - | Logo configuration |
| `contact` | JSONB | - | Contact information |
| `theme` | JSONB | - | Theme colors |
| `registration` | JSONB | - | License information |
| `social` | JSONB | - | Social media links |
| `currency` | JSONB | - | Currency settings |
| `application` | JSONB | - | Application settings |
| `saas` | JSONB | - | SaaS configuration |
| `is_active` | BOOLEAN | DEFAULT true | Company status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

### Indexes

```sql
-- Customer indexes
CREATE INDEX idx_customers_mobile ON customers(mobile);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_company ON customers(company_id);

-- Loan indexes
CREATE INDEX idx_loans_customer ON loans(application_id);
CREATE INDEX idx_loans_company ON loans(company_id);
CREATE INDEX idx_loans_status ON loans(status);

-- Schedule indexes
CREATE INDEX idx_schedules_loan ON loan_schedules(loan_id, installment_no);
CREATE INDEX idx_schedules_due_date ON loan_schedules(due_date);

-- Payment indexes
CREATE INDEX idx_payments_loan ON payments(loan_id, transaction_date);
CREATE INDEX idx_payments_company ON payments(company_id);

-- Company indexes
CREATE INDEX idx_companies_active ON companies(is_active);
```

## MongoDB Collections

### 1. `kyc_documents` Collection

Stores KYC document metadata and S3 references.

**Schema:**
```javascript
{
  "_id": ObjectId("..."),
  "customer_id": "uuid",           // Reference to customer
  "company_id": "fintrust",        // Multi-tenant support
  "type": "ID_PROOF",              // ID_PROOF, ADDRESS_PROOF, INCOME_PROOF, PAN
  "document_name": "Aadhaar Card", // Human-readable name
  "s3_url": "s3://nbfc-kyc/company/customer-id/doc-type.pdf",
  "uploaded_at": ISODate("2026-06-08T00:00:00Z"),
  "verified": true,                // Verification status
  "verification_result": {
    "aadhaar_valid": true,
    "pan_valid": true,
    "score": 95,
    "verified_by": "automated" | "manual",
    "verified_at": ISODate("2026-06-08T00:05:00Z")
  },
  "expiry": ISODate("2030-12-31"),  // Document expiry date
  "metadata": {
    "file_size": 102400,
    "mime_type": "application/pdf",
    "page_count": 2
  }
}
```

### 2. `esignatures` Collection

Stores e-signature records.

**Schema:**
```javascript
{
  "_id": ObjectId("..."),
  "customer_id": "uuid",
  "document_type": "LOAN_APPLICATION",  // LOAN_APPLICATION, KYC, etc.
  "document_id": "loan-application-uuid",
  "agreement_type": "electronic",        // electronic, physical
  "signed_at": ISODate("2026-06-08T00:00:00Z"),
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "signature_data": "base64-encoded-signature",
  "hash": "sha256-hash-of-document",
  "consent_given": true,
  "consent_text": "I agree to the terms...",
  "metadata": {
    "browser": "Chrome",
    "os": "Windows",
    "location": "Mumbai, India"
  }
}
```

### 3. `audit_logs` Collection

Immutable audit trail stored separately for compliance.

**Schema:**
```javascript
{
  "_id": ObjectId("..."),
  "event_id": "uuid",
  "entity_type": "loan",               // loan, customer, payment, etc.
  "entity_id": "loan-uuid",
  "action": "CREATE",                  // CREATE, UPDATE, DELETE
  "performed_by": "user-uuid",
  "performed_by_role": "admin",
  "company_id": "fintrust",
  "timestamp": ISODate("2026-06-08T00:00:00Z"),
  "ip_address": "192.168.1.1",
  "before_data": { ... },              // State before change
  "after_data": { ... },               // State after change
  "change_summary": ["field1:new_value", "field2:old_value->new_value"],
  "request_id": "req-123"
}
```

## Redis Cache Structure

### Session Store
- **Key:** `session:{session_id}`
- **Value:** JSON with user_id, expires_at, company_id

### Rate Limiting
- **Key:** `ratelimit:{endpoint}:{user_id}`
- **Value:** Counter (incrementing)
- **TTL:** 60 seconds (rolling window)

### Temporary Data
- **OTP Storage:**
  - Key: `otp:{mobile}`
  - Value: `{code: "123456", expires_at: timestamp, attempts: 3}`

- **Password Reset:**
  - Key: `password_reset:{user_id}`
  - Value: `{token: "uuid", expires_at: timestamp}`

### Company Configuration Cache
- **Key:** `company:{subdomain}`
- **Value:** Serialized company configuration
- **TTL:** 1 hour

## Entity Relationship Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                           PostgreSQL                                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   customers ◄── customers_applications                                  │
│       │                                                                    │
│       └──< loan_applications                                              │
│                 │                                                          │
│                 └──< loans                                                 │
│                         │                                                    │
│                         └──< loan_schedules                                   │
│                                 │                                              │
│                                 └──< payments                                    │
│                                                                        │
│   loan_products                                                          │
│       │                                                                    │
│       └──< loan_applications                                              │
│                                                                        │
│   companies (multi-tenant)                                               │
│       │                                                                    │
│       └── all tables have company_id for isolation                       │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌───────────────────┐     ┌─────────────────────────────────────┐
│    MongoDB        │     │           Redis                      │
│  (DocumentStore)  │     │         (Cache/Sessions)             │
│                   │     │                                      │
│ kyc_documents ◄───┼─────┼── customer_id reference               │
│ esignatures   ◄───┼─────┼── customer_id reference               │
│ audit_logs      ◄─┼─────┼── entity references                 │
└───────────────────┘     └─────────────────────────────────────┘
```

## Data Flow

```
1. Customer Registration
   └── POST /api/customers
       └── customers table insert
       └── Initial kyc_status = 'pending'

2. KYC Submission
   └── POST /api/customers/[id]/kyc
       └── kyc_documents collection insert (MongoDB)
       └── Update customers.kyc_status

3. Loan Application
   └── POST /api/loans
       └── loan_applications table insert
       └── status = 'draft'

4. Approval & Disbursement
   └── POST /api/loans/[id]/underwrite
       └── Update loan_applications.underwriting_status
   └── POST /api/loans/[id]/disburse
       └── loans table insert
       └── loan_schedules table insert (generated)

5. Repayments
   └── POST /api/payments
       └── payments table insert
       └── Update loan_schedules.status/paid_amount
       └── Update loans.status if fully paid

6. Audit Trail
   └── Each state change
       └── audit_logs collection append (MongoDB)
       └── Immutable record of before/after data
```

## Multi-Tenant Data Isolation

For SaaS operation, data is isolated by `company_id`:

1. **Row-Level Security (RLS):** PostgreSQL policies restrict access
2. **Separate Schemas (Alternative):** Future scaling option
3. **Company Cache:** Redis caches per-company configuration

```sql
-- Example RLS policy
CREATE POLICY "company_isolation" ON loans
FOR ALL TO nbfc_app
USING (company_id = current_company());
```

## Backup & Recovery

| Component | Backup Strategy | Frequency | Retention |
|-----------|-----------------|-----------|-----------|
| PostgreSQL | Automated snapshots + WAL | Every 5 min | 35 days |
| MongoDB | mongodump to S3 | Daily | 30 days |
| Redis | RDB+AOF | Every 6 hours | 7 days |
| Documents | S3 versioning | Continuous | 7 years (WORM) |

## Migration Guidelines

When adding new fields:

1. **Backward Compatible:** Add nullable columns or with defaults
2. **Forward Compatible:** Update API responses with new fields
3. **Data Migration:** Run SQL scripts in production migrations
4. **Type Updates:** Update TypeScript types in `types/` directory

## Performance Considerations

1. **Indexing:** All foreign keys and filter columns are indexed
2. **Partitioning:** Consider partitioning large tables by date/company
3. **Caching:** Frequently accessed data cached in Redis
4. **Connection Pool:** Use connection pooling (pgBouncer)