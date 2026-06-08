# Technical Design Documentation
**NBFC-Python Multi-Loan Lending Application**

## Overview

This directory contains the complete technical documentation for the NBFC-Python application. This serves as the bible for new developers contributing to or enhancing the tool.

## Quick Start

This application is a **Multi-Tenant SaaS Lending Platform** designed for NBFC companies. 

### Features
- Digital borrower onboarding with KYC
- Multi-product loan management
- Real-time disbursement and repayments
- Regulatory compliance (RBI)
- Multi-tenant SaaS architecture

## Documentation Structure

| Directory | Description |
|-----------|-------------|
| `diagrams/` | Draw.io (.vsdx) architecture and design diagrams |
| `api/` | API design and endpoint documentation |
| `data/` | Data model and database schema documentation |
| `security/` | Security architecture and compliance documentation |
| `deployment/` | Deployment, CI/CD, and infrastructure documentation |
| `components/` | Component-level documentation (frontend/backend) |
| `business-process/` | Business process flows and requirements documentation |

## Quick Links

- [Architecture Overview](./diagrams/Architecture.vsdx)
- [Component Architecture](./diagrams/ComponentArchitecture.vsdx)
- [Personal Loan Process Diagram](./diagrams/PersonalLoanProcess.vsdx)
- [Loan Disposal Process Diagram](./diagrams/LoanDisposalProcess.vsdx)
- [API Design](./api/README.md)
- [Data Model](./data/README.md)
- [Security Design](./security/README.md)
- [Deployment Guide](./deployment/README.md)
- [Components](./components/README.md)
- [Business Process Flow](./business-process/BusinessProcessFlow.md)
- [Personal Loan Business Process](./business-process/PersonalLoanBusinessProcess.md)

## Table of Contents

1. [System Architecture](./diagrams/Architecture.vsdx)
2. [Component Architecture](./diagrams/ComponentArchitecture.vsdx)
3. [Personal Loan Process Diagram](./diagrams/PersonalLoanProcess.vsdx)
4. [Loan Disposal Process Diagram](./diagrams/LoanDisposalProcess.vsdx)
5. [API Design](./api/README.md)
6. [Data Model](./data/README.md)
7. [Security Architecture](./security/README.md)
8. [Deployment Architecture](./deployment/README.md)
9. [Frontend Components](./components/README.md)
10. [Business Process Flow](./business-process/BusinessProcessFlow.md)
11. [Personal Loan Business Process](./business-process/PersonalLoanBusinessProcess.md)

## Technology Stack

### Frontend
- **Framework:** Next.js (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context API

### Backend
- **Runtime:** Node.js (Next.js API Routes)
- **Language:** TypeScript
- **Database:** PostgreSQL (primary), MongoDB (documents), Redis (cache)

### Infrastructure
- **Cloud:** AWS (ap-south-1)
- **Deployment:** ECS/Fargate (container orchestration)
- **CI/CD:** GitHub Actions + ArgoCD
- **Monitoring:** Prometheus, Grafana, CloudWatch

## Multi-Tenant SaaS Architecture

### Key Features
- **Subdomain-based routing:** `{company}.nbfcapp.com`
- **Whitelabel branding:** Customizable per company
- **Independent configuration:** Each tenant has its own settings
- **Shared infrastructure:** Cost-effective multi-tenant deployment

### Adding a New Company

1. Add entry to `lib/company-store.ts`
2. Company will be accessible at `{id}.nbfcapp.com`
3. Branded UI loads automatically based on configuration

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- AWS account (for deployment)

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Project Structure
```
/app           - Next.js app directory (pages & API routes)
/lib           - Shared utility modules (company config, etc.)
/types         - TypeScript type definitions
/public        - Static assets
/TechDesign    - Technical documentation
```

## API Endpoints Summary

| Category | Endpoints |
|----------|-----------|
| Auth | `POST /api/auth/login`, `POST /api/auth/logout` |
| Customers | `GET/POST /api/customers`, `GET/PUT /api/customers/[id]`, `POST /api/customers/[id]/kyc` |
| Loans | `GET/POST /api/loans`, `GET/PUT /api/loans/[id]`, `POST /api/loans/[id]/underwrite`, `POST /api/loans/[id]/disburse` |
| Payments | `GET/POST /api/payments` |
| Reports | `GET /api/reports/regulatory`, `GET /api/metrics/portfolio` |

## Database Schema Overview

### PostgreSQL Tables
- `customers` - Borrower information
- `loan_products` - Available loan products
- `loan_applications` - Loan applications
- `loans` - Approved and disbursed loans
- `loan_schedules` - Repayment schedules
- `payments` - Repayment records
- `companies` - Tenant configurations

### MongoDB Collections
- `kyc_documents` - KYC document metadata
- `esignatures` - E-signature records
- `audit_logs` - Immutable audit trail

## Security Highlights

- **Authentication:** JWT with 15-minute expiry
- **Authorization:** RBAC with roles (admin, loan_officer, customer)
- **Encryption:** TLS 1.3, AES-256 at rest
- **Compliance:** RBI data localization, 7-year audit logs

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Add tests if applicable
4. Submit a pull request
5. Ensure CI passes before merge

## License

Private - NBFC-Python Application