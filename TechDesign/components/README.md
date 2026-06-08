# Component Documentation

## Overview

This document provides detailed documentation for each component in the NBFC-Python application.

## Frontend Components

### 1. Root Layout (`app/layout.tsx`)

The root layout component that wraps all pages.

```typescript
// Responsibilities:
// - Font configuration
// - Theme provider setup
// - Company context provider
// - Global CSS imports
```

**Company Context Integration:**
- Uses `CompanyProvider` to provide multi-tenant configuration
- Reads company config from URL subdomain or defaults

### 2. Home Page (`app/page.tsx`)

Main landing page displaying:
- Company branding
- Hero section with call-to-action
- Loan products catalog
- Features section
- Footer with company details

### 3. Apply Page (`app/apply/page.tsx`)

Loan product selection page:
- Displays all available loan products
- Shows amount range and tenure for each
- Links to individual application forms

### 4. Loan Application (`app/apply/[loanType]/page.tsx`)

Dynamic loan application form:
- Pre-fills based on product type
- Includes product-specific fields (vehicle details, gold details, etc.)
- Document upload section
- Form validation

## Backend Components

### 1. Company Store (`lib/company-store.ts`)

Multi-tenant company registry:
```typescript
// Functions:
// - getCompanyBySubdomain(subdomain)
// - registerCompany(id, subdomain, config)
// - updateCompany(id, updates)
// - getAllCompanies()

// Tenant Structure:
interface CompanyTenant {
  id: string;
  subdomain: string;
  config: CompanyConfig;
}
```

### 2. Company Context (`lib/company-context.tsx`)

React context for company configuration:
- Provides company data to all components
- Handles loading states and errors
- Falls back to default configuration

### 3. API Routes

#### `/api/loans/route.ts`
- `GET /api/loans` - List loans with filtering
- `POST /api/loans` - Create new loan application

#### `/api/loans/[id]/route.ts`
- `GET /api/loans/[id]` - Get loan details
- `PUT /api/loans/[id]` - Update loan

#### `/api/loans/[id]/underwrite/route.ts`
- `POST /api/loans/[id]/underwrite` - Trigger underwriting

#### `/api/loans/[id]/disburse/route.ts`
- `POST /api/loans/[id]/disburse` - Initiate disbursement

#### `/api/customers/route.ts`
- `GET /api/customers` - List customers
- `POST /api/customers` - Register new customer
- `GET_customer` - Get specific customer (nested route)
- `PUT` - Update customer (nested route)

#### `/api/payments/route.ts`
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment
- `GET_payment` - Get specific payment (nested route)
- `DELETE` - Refund payment (nested route)

## Utility Modules

### 1. Loan Products (`lib/loan-products.ts`)

Static configuration for loan products:
```typescript
const loanProducts = [
  {
    id: 'personal',
    name: 'Personal Loan',
    description: '...',
    min_amount: 50000,
    max_amount: 1500000,
    min_tenure: 6,
    max_tenure: 60,
    interest_type: 'reducing_balance'
  },
  // ... more products
]
```

### 2. Company Config Template (`lib/company-config-template.ts`)

Default configuration structure for new NBFC companies:
- Company name and branding
- Theme colors
- Contact information
- Currency settings
- SaaS settings

## Page Components

### Authentication Pages

| Path | Component | Purpose |
|------|-----------|---------|
| `/login` | Login form | User authentication |
| `/register` | Registration form | New user signup |

### Dashboard Pages

| Path | Component | Purpose |
|------|-----------|---------|
| `/dashboard` | Dashboard | Main dashboard |
| `/dashboard/loans` | Loans | Loan management |
| `/dashboard/customers` | Customers | Customer management |
| `/dashboard/reports` | Reports | Analytics and reports |
| `/dashboard/officer` | Officer | Officer-specific views |

### KYC Page

| Path | Component | Purpose |
|------|-----------|---------|
| `/kyc/[customerId]` | KYC form | Customer KYC verification |