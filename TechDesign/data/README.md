# Data Model Documentation

## Overview

This document describes the data model for the NBFC-Python application. The system uses PostgreSQL as the primary database with MongoDB for document storage.

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
| `kyc_status` | ENUM | DEFAULT 'pending' | KYC verification status |
| `risk_score` | INTEGER | - | Calculated risk score |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

#### 2. `loan_products` Table

Stores available loan product configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `product_id` | VARCHAR(20) | PK | Product identifier |
| `name` | VARCHAR(100) | NOT NULL | Product name |
| `description` | TEXT | - | Product description |
| `interest_type` | ENUM | NOT NULL | flat, reducing_balance, annuity |
| `min_amount` | BIGINT | NOT NULL | Minimum loan amount |
| `max_amount` | BIGINT | NOT NULL | Maximum loan amount |
| `min_tenure` | INTEGER | NOT NULL | Minimum tenure (months) |
| `max_tenure` | INTEGER | NOT NULL | Maximum tenure (months) |
| `is_active` | BOOLEAN | DEFAULT true | Product status |

#### 3. `loan_applications` Table

Stores loan application records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `application_id` | UUID | PK | Unique identifier |
| `customer_id` | UUID | FK(customers.customer_id) | Applicant reference |
| `product_id` | VARCHAR(20) | FK(loan_products.product_id) | Product reference |
| `requested_amount` | BIGINT | NOT NULL | Requested loan amount |
| `tenure_months` | INTEGER | NOT NULL | Loan tenure |
| `status` | ENUM | DEFAULT 'draft' | Application status |
| `underwriting_status` | ENUM | - | approved/rejected/pending |
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
| `status` | ENUM | - | active/closed/defaulted |

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
| `status` | ENUM | DEFAULT 'pending' | paid/pending/overdue |

#### 6. `payments` Table

Stores repayment records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `payment_id` | UUID | PK | Unique identifier |
| `loan_id` | UUID | FK(loans.loan_id) | Loan reference |
| `schedule_id` | UUID | FK(loan_schedules.schedule_id) | Schedule reference |
| `amount` | BIGINT | NOT NULL | Payment amount |
| `method` | VARCHAR(20) | NOT NULL | manual/auto_debit/upi/neft |
| `status` | ENUM | DEFAULT 'success' | success/failed/refunded |
| `transaction_date` | TIMESTAMP | DEFAULT NOW() | Payment timestamp |
| `reference_number` | VARCHAR(50) | UNIQUE | Gateway reference |

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_customers_mobile ON customers(mobile);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_loans_customer ON loans(application_id);
CREATE INDEX idx_schedules_loan ON loan_schedules(loan_id, installment_no);
CREATE INDEX idx_payments_loan ON payments(loan_id, transaction_date);
```

## MongoDB Collections

### 1. `kyc_documents` Collection

Stores KYC document metadata and S3 references.

```javascript
{
  "_id": ObjectId("..."),
  "customer_id": "uuid",
  "type": "ID_PROOF",  // ID_PROOF, ADDRESS_PROOF, INCOME_PROOF
  "s3_url": "s3://nbfc-kyc/customer-id/doc-type.pdf",
  "uploaded_at": ISODate("2026-06-08T00:00:00Z"),
  "verified": true,
  "verification_result": {
    "aadhaar_valid": true,
    "pan_valid": true,
    "score": 95
  }
}
```

### 2. `esignatures` Collection

Stores e-signature records.

```javascript
{
  "_id": ObjectId("..."),
  "customer_id": "uuid",
  "document_type": "LOAN_APPLICATION",
  "document_id": "loan-application-uuid",
  "signed_at": ISODate("2026-06-08T00:00:00Z"),
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "signature_data": "base64-encoded-signature"
}
```

## Redis Cache Structure

### Session Store
- Key: `session:{session_id}`
- Value: JSON with user_id, expires_at

### Rate Limiting
- Key: `ratelimit:{endpoint}:{user_id}`
- Value: Counter (incrementing)

### Temporary Data
- Key: `otp:{mobile}`
- Value: OTP code with expiry

## Entity Relationship Diagram

```
customers
    │
    └──< loan_applications (customer_id)
              │
              └──< loans (application_id)
                        │
                        └──< loan_schedules (loan_id)
                                  │
                                  └──< payments (schedule_id)

loan_products
    │
    └──< loan_applications (product_id)

MongoDB: kyc_documents, esignatures (by customer_id reference)
```

## Data Flow

1. **Customer Registration** → `customers` table
2. **Loan Application** → `loan_applications` table
3. **Approval** → `loans` table
4. **Disbursement** → Schedule generation → `loan_schedules`
5. **Repayments** → `payments` table + schedule updates