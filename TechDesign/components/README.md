# Component Documentation

## Overview

This document provides detailed documentation for each component in the NBFC-Python application. This includes both frontend Next.js components and backend API routes.

## Multi-Tenant SaaS Architecture

This application is designed as a **Software-as-a-Service (SaaS) offering** for NBFC companies. Each company operates as a separate tenant with:

- **Subdomain-based routing**: `company-name.nbfcapp.com`
- **Whitelabel branding**: Customizable logo, colors, company name
- **Independent configuration**: Each tenant has its own settings
- **Shared infrastructure**: Cost-effective multi-tenant deployment

## Frontend Components

### 1. Root Layout (`app/layout.tsx`)

The root layout component that wraps all pages.

```typescript
// Responsibilities:
// - Font configuration (Inter font)
// - Theme provider setup (next-themes)
// - Company context provider
// - Global CSS imports (globals.css)
// - Tailwind CSS directives
```

**Company Context Integration:**
- Uses `CompanyContext` provider to provide multi-tenant configuration
- Reads company config from URL subdomain or defaults to 'fintrust'
- Provides company branding, theme colors, and contact info to all components

### 2. Home Page (`app/page.tsx`)

Main landing page displaying:
- Company branding (logo, name, tagline)
- Hero section with call-to-action
- Loan products catalog (dynamic from `loan-products.ts`)
- Features section highlighting key benefits
- Footer with company details and social links

### 3. Apply Page (`app/apply/page.tsx`)

Loan product selection page:
- Displays all available loan products
- Shows amount range and tenure for each
- Links to individual application forms
- Product-specific descriptions and eligibility

### 4. Loan Application (`app/apply/[loanType]/page.tsx`)

Dynamic loan application form:
- Pre-fills based on product type
- Includes product-specific fields (vehicle details, gold details, etc.)
- Document upload section
- Form validation with error messages
- Multi-step wizard interface

### 5. KYC Page (`app/kyc/[customerId]/page.tsx`)

Customer KYC verification page:
- Document upload forms
- Aadhaar/PAN verification
- Address proof collection
- E-signature integration
- KYC status tracking

### 6. Login/Register Pages

**Login (`app/login/page.tsx`):**
- Email/phone and password authentication
- Remember me functionality
- Password reset link

**Register (`app/register/page.tsx`):**
- New customer registration form
- OTP verification
- Initial KYC document upload

### 7. Dashboard Pages

**Dashboard (`app/dashboard/page.tsx`):**
- Overview of loans, payments, collections
- Quick actions and statistics
- Recent activity feed

**Loans (`app/dashboard/loans/page.tsx`):**
- Loan application list
- Status tracking
- Application details view

**Customers (`app/dashboard/customers/page.tsx`):**
- Customer directory
- Search and filter
- Customer details view

**Reports (`app/dashboard/reports/page.tsx`):**
- Portfolio metrics
- RBI returns generation
- Export functionality

## Backend API Routes

All API routes are located under `app/api/` and follow Next.js App Router conventions.

### 1. Auth Routes (`app/api/auth/route.ts`)

```typescript
// POST /api/auth/login
// Request: { email, password }
// Response: { access_token, refresh_token, expires_in }

// POST /api/auth/logout
// Revokes the current session
```

### 2. Customers Routes (`app/api/customers/route.ts`)

```typescript
// GET /api/customers
// - List all customers (paginated)
// - Query params: search, limit, offset
// - Returns: { customers: [...], total: number }

// POST /api/customers
// - Register new customer
// - Request body: customer details
// - Validates required fields
// - Returns: created customer object

// GET /api/customers/[id]
// - Get specific customer details
// - Returns: customer object

// PUT /api/customers/[id]
// - Update customer information
// - Returns: updated customer object
```

### 3. Loans Routes (`app/api/loans/route.ts`)

```typescript
// GET /api/loans
// - List loans with filtering
// - Query params: customer_id, status
// - Returns: { loans: [...], total: number }

// POST /api/loans
// - Create new loan application
// - Validates product_id, amount, tenure
// - Returns: created loan application
```

### 4. Loans Dynamic Routes (`app/api/loans/[id]/route.ts`)

```typescript
// GET /api/loans/[id]
// - Get loan details
// - Returns: loan object with schedule

// PUT /api/loans/[id]
// - Update loan (status, etc.)
// - Returns: updated loan object
```

### 5. Underwrite Route (`app/api/loans/[id]/underwrite/route.ts`)

```typescript
// POST /api/loans/[id]/underwrite
// - Trigger underwriting process
// - Returns: { decision: 'APPROVE'|'REJECT', score: number }
```

### 6. Disburse Route (`app/api/loans/[id]/disburse/route.ts`)

```typescript
// POST /api/loans/[id]/disburse
// - Initiate fund disbursement
// - Request body: { bank_account, reference }
// - Returns: { disbursement_id, status }
```

### 6. Payments Routes (`app/api/payments/route.ts`)

```typescript
// GET /api/payments
// - List payments
// - Query params: loan_id
// - Returns: payments array

// POST /api/payments
// - Record a payment
// - Request body: { loan_id, amount, method, transaction_date }
// - Returns: created payment record
```

## Utility Modules

### 1. Company Store (`lib/company-store.ts`)

Multi-tenant company registry for SaaS:

```typescript
// Core Functions:
// - getCompanyBySubdomain(subdomain: string): CompanyTenant | undefined
// - getCompanyById(id: string): CompanyTenant | undefined
// - registerCompany(id, subdomain, config): CompanyTenant
// - updateCompany(id, updates): CompanyTenant | undefined
// - getAllCompanies(): CompanyTenant[]

// Tenant Structure:
interface CompanyTenant {
  id: string;           // Unique company identifier
  subdomain: string;    // Subdomain for routing (e.g., 'fintrust')
  config: CompanyConfig; // Company-specific configuration
}
```

**Pre-configured Companies:**
- `fintrust` - FinTrust Financial Services (professional plan)
- `quickfinance` - QuickFinance Limited (starter plan)
- `trustline` - TrustLine Financial Corporation (enterprise plan)

### 2. Company Context (`lib/company-context.tsx`)

React context for company configuration:
- Provides company data to all components via context
- Handles loading states and errors
- Falls back to default configuration if company not found
- Used by header, footer, and all branded components

### 3. Loan Products (`lib/loan-products.ts`)

Static configuration for loan products:

```typescript
const loanProducts = [
  {
    id: 'personal',
    name: 'Personal Loan',
    description: 'Unsecured personal loan for your financial needs',
    min_amount: 50000,
    max_amount: 1500000,
    min_tenure: 6,
    max_tenure: 60,
    interest_type: 'reducing_balance',
  },
  {
    id: 'vehicle-2w',
    name: 'Two Wheeler Loan',
    description: 'Finance your dream bike with our two wheeler loan',
    min_amount: 50000,
    max_amount: 1500000,
    min_tenure: 12,
    max_tenure: 36,
    interest_type: 'flat',
  },
  // ... more products
  // Total: 9 loan products
]

export type LoanProductId = typeof loanProducts[number]['id'];
```

**Available Loan Products:**
| ID | Name | Min Amount | Max Amount | Min Tenure | Max Tenure | Interest Type |
|----|------|------------|------------|------------|------------|---------------|
| personal | Personal Loan | ₹50,000 | ₹15,00,000 | 6 mo | 60 mo | Reducing Balance |
| vehicle-2w | Two Wheeler Loan | ₹50,000 | ₹15,00,000 | 12 mo | 36 mo | Flat |
| vehicle-4w | Four Wheeler Loan | ₹2,00,000 | ₹50,00,000 | 12 mo | 84 mo | Reducing Balance |
| vehicle-ev | Electric Vehicle Loan | ₹1,00,000 | ₹30,00,000 | 12 mo | 60 mo | Reducing Balance |
| gold | Gold Loan | ₹10,000 | ₹50,00,000 | 3 mo | 36 mo | Flat |
| msme | MSME Loan | ₹1,00,000 | ₹2,50,00,000 | 12 mo | 120 mo | Annuity |
| home | Home Loan | ₹2,00,000 | ₹5,00,00,000 | 24 mo | 360 mo | Reducing Balance |
| mortgage | Mortgage Loan | ₹1,00,000 | ₹5,00,00,000 | 24 mo | 240 mo | Reducing Balance |
| topup | Top Up Loan | ₹50,000 | ₹20,00,000 | 6 mo | 60 mo | Reducing Balance |

### 3. Company Config Template (`lib/company-config-template.ts`)

Default configuration structure for new NBFC companies:

```typescript
{
  // Basic Company Information
  name: string;           // Short name (e.g., "FinTrust")
  fullName: string;     // Legal name
  tagline: string;       // Company tagline
  
  // Branding
  logo: { 
    text: string;        // Text for logo fallback
    icon: string;       // Icon name
  };
  
  // Contact Information
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  
  // Theme Colors
  theme: {
    primary: string;          // Primary color
    primaryHover: string;
    primaryBg: string;
    primaryLight: string;
    primaryText: string;
    secondary: string;
  };
  
  // License & Registration
  registration: {
    rbiLicense: string;  // RBI license number
    cin: string;         // Corporate Identification Number
  };
  
  // Social Links
  social: {
    website: string;
    linkedin: string;
    twitter: string;
  };
  
  // Currency Settings
  currency: {
    symbol: string;    // ₹
    code: string;      // INR
    locale: string;    // en-IN
  };
  
  // Application Settings
  application: {
    minCreditScore: number;  // Minimum credit score
    maxProcessingDays: number; // Max processing time
    workingHours: string;
  };
  
  // SaaS Settings
  saas: {
    subdomain: string | null;  // Set dynamically
    isActive: boolean;
    plan: 'starter' | 'professional' | 'enterprise';
  };
}
```

### 4. Company Config (`lib/company-config.ts`)

Extended company configuration with additional settings:
- Registration details
- Terms and conditions
- Privacy policy
- Disclaimer

## Type Definitions

Full TypeScript type definitions are available in `types/loan.ts`:

- `LoanType` - Union type of all loan product IDs
- `LoanProduct` - Loan product schema
- `LoanApplication` - Loan application schema
- `LoanSchedule` - Repayment schedule schema
- `Loan` - Active loan schema
- `Customer` - Customer schema
- `CustomerDocument` - KYC document schema
- `Payment` - Payment schema
- `User` - User/employee schema
- `AuditLog` - Audit log schema

## Data Flow

```
User Request
    ↓
Company Context (Multi-tenant)
    ↓
API Route Handler
    ↓
Validation & Business Logic
    ↓
Mock Database (in-memory)
    ↓
Response
```

## API Response Formats

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Success Response
```json
{
  "data": {...},
  "status": "success"
}
```

## Styling & Theming

- **CSS Framework**: Tailwind CSS
- **Components**: Custom CSS classes with Tailwind utilities
- **Theme**: next-themes for dark/light mode support
- **Company-specific theming**: Dynamic colors from `CompanyConfig.theme`

## Adding a New Company (SaaS Onboarding)

To add a new NBFC company to the platform:

1. Add entry to `lib/company-store.ts`:
```typescript
'new-company': {
  id: 'new-company',
  subdomain: 'new-company',
  config: {
    ...defaultCompany,
    name: 'New Company NBFC',
    fullName: 'New Company Financial Services',
    // ... other config
  },
},
```

2. Company will be accessible at: `new-company.nbfcapp.com`
3. Branded UI and configuration will load automatically