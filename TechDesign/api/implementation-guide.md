# Implementation Guide: Business Process Flow

This document describes the implementation of all processes defined in the BusinessProcessFlow.md for the NBFC-Python application.

## Implemented Processes

### 1. Personal Loan Business Process Flow

#### Phase 1: Customer Acquisition & Onboarding
- **Customer Registration**: `/api/customers` (POST)
- **KYC Verification**: `/api/kyc` (POST) - Handles document upload and verification
- **Risk Scoring**: Implemented in underwriting engine

#### Phase 2: Loan Processing
- **Product Selection**: Pre-configured in `loan-products.ts`
- **Application Submission**: `/api/loans` (POST)
- **Pre-assessment**: Credit score check integrated
- **Underwriting**: `/api/underwriting` (POST) - Risk assessment and decision
- **Sanction**: Status updates to 'approved' after underwriting

#### Phase 3: Disbursement
- **Approval Confirmation**: Automated after approval
- **Fund Transfer**: `/api/loans/[id]/disburse` (POST)
- **AMC Generation**: Automated schedule creation

#### Phase 4: Repayment
- **EMI Generation**: Automated via disbursement endpoint
- **Collection**: `/api/collections` - Overdue loan tracking

#### Phase 5: Resolution
- **Completion**: Final payment triggers closure
- **Post-Closure**: Feedback collection via audit logs

### 2. Loan Disposal Process

Implemented in `/api/loans/[id]/close`:
- **Natural Closure**: Status update to 'closed'
- **Pre-closure**: With processing fee calculation
- **Foreclosure**: Zero-interest option support
- **Write-off**: NPA classification via `/api/loans/[id]/writeoff`
- **Legal Recovery**: Collections escalation

### 3. Collections Process

Implemented in `/api/collections`:
- **Tiered Collections**: Days-past-due based routing
- **Dunning (Tiers 1-2)**: Automated SMS/email via service
- **Field Collection (Tier 3)**: Manual assignment
- **External Agency (Tier 4)**: Recovery agent integration point
- **Legal Notice (Tier 5)**: Legal team escalation
- **Legal Suit (Tier 6)**: Court proceedings tracking

### 4. Reporting Process

#### Monthly Reports
- **Portfolio Summary**: `/api/reports` (portfolio type)
- **NPA Report**: `/api/reports` (npa_status type)
- **Collections Report**: `/api/collections/report`
- **Disbursement Report**: `/api/reports` (sardi type)

#### RBI Returns
| Form | Endpoint | Frequency |
|------|----------|-----------|
| SARDI | `/api/reports/regulatory` | Monthly |
| Schedule III | `/api/reports/regulatory` | Quarterly |
| Schedule IV | `/api/reports/regulatory` | Quarterly |
| CSR Returns | `/api/reports/regulatory` | Annual |

### 5. Compliance Process

#### KYC Compliance
- **Initial KYC**: `/api/kyc` (POST) - Document verification
- **Ongoing KYC**: Annual review via `/api/kyc` (GET)

#### AML Compliance
- **Transaction Monitoring**: Integration point for FinCEN reporting
- **Sanctions Screening**: PEP screening integration point

#### Internal Audit
- **Process Audit**: Monthly review logs in audit_logs
- **System Audit**: Access logs via `/api/reports/regulatory`
- **Security Assessment**: Security module in TechDesign

## API Endpoints Summary

### Core Endpoints

| Endpoint | Method | Purpose | Process |
|----------|--------|---------|---------|
| `/api/customers` | GET, POST | Customer management | Onboarding |
| `/api/customers/[id]/kyc` | GET, POST | KYC documents | Onboarding |
| `/api/kyc` | GET, POST | KYC verification | Compliance |
| `/api/loans` | GET, POST | Loan applications | Processing |
| `/api/loans/[id]` | GET, PUT | Loan details | Processing |
| `/api/loans/[id]/underwrite` | POST | Underwriting | Processing |
| `/api/loans/[id]/disburse` | POST | Disbursement | Disbursement |
| `/api/loans/[id]/close` | POST | Loan closure | Disposal |
| `/api/loans/[id]/writeoff` | POST, GET | NPA write-off | Collections |
| `/api/payments` | GET, POST | Payment recording | Repayment |
| `/api/collections` | GET, POST | Collections workflow | Collections |
| `/api/reports` | GET, POST | Report generation | Reporting |
| `/api/reports/regulatory` | GET, POST | RBI returns | Compliance |
| `/api/underwriting` | GET, POST | Risk assessment | Processing |

### Multi-Tenant Support

Each endpoint supports multi-company configuration via:
- `X-Company-ID` header
- Subdomain routing
- Company context propagation

## Database Schema

### Tables Implemented
1. **companies** - Company configuration
2. **customers** - Customer records
3. **loan_products** - Product definitions
4. **loan_applications** - Application records
5. **loans** - Active loans
6. **loan_schedules** - Repayment schedules
7. **payments** - Payment records
8. **audit_logs** - Compliance audit trail

## Security Implementation

- JWT-based authentication
- Role-based access control (Admin, Customer)
- Multi-tenant data isolation
- Audit logging for all operations

## Deployment

See `DOCKER-DEPLOYMENT.md` and deployment configurations in:
- `docker-compose.yml` - Development
- `docker-compose.prod.yml` - Production
- `nginx/` - Reverse proxy configuration