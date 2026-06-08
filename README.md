# NBFC Python - Multi-Application Monorepo

This is a **Microservices Architecture with Micro Frontend patterns** for an NBFC SaaS platform supporting 100 branches with ₹2000 Cr annual business volume.

## Architecture Overview

```
nbfc-python/
├── apps/                     # Micro Frontend Applications
│   ├── admin/               # Admin Console
│   ├── branch/              # Branch Operations
│   ├── customer/            # Customer Portal (PWA)
│   ├── field-agent/         # Field Agent (Mobile)
│   └── collections/         # Collections Management
├── services/                 # Backend Microservices
│   ├── auth/                # Authentication Service
│   ├── config/              # Configuration Service
│   ├── customer/            # Customer Service
│   ├── loan/                # Loan Service
│   ├── underwriting/        # Underwriting Service (Python)
│   ├── disbursement/        # Disbursement Service
│   ├── document/            # Document Service (Python)
│   ├── collections/         # Collections Service
│   ├── reporting/           # Reporting Service (Python)
│   └── compliance/          # Compliance Service (Java)
├── packages/                 # Shared Libraries
│   ├── ui/                  # Shared UI Components
│   ├── utils/               # Utility Functions
│   ├── types/               # TypeScript Types
│   └── config/              # Shared Configuration
├── infrastructure/           # Infrastructure as Code
└── docs/                     # Documentation
```

## Getting Started

### Prerequisites
- Node.js 20+
- Docker
- Kubernetes (for deployment)
- PostgreSQL
- Redis

### Development Setup
```bash
# Install dependencies
npm install

# Start all development servers
npm run dev:all

# Start individual apps
npm run dev:admin
npm run dev:branch
npm run dev:customer
npm run dev:field-agent
npm run dev:collections
```

### Docker Development
```bash
# Start all services locally
npm run docker:up
```

## Available Apps

| App | Port | Description |
|-----|------|-------------|
| Admin Console | 3001 | Enterprise administration |
| Branch Operations | 3002 | Branch staff operations |
| Customer Portal | 3003 | Customer self-service (PWA) |
| Field Agent | 3004 | Mobile recovery app |
| Collections | 3005 | Collections management |

## Services Overview

| Service | Port | Technology | Purpose |
|---------|------|------------|---------|
| Auth Service | 8081 | Node.js | Authentication & Authorization |
| Config Service | 8082 | Node.js | Centralized Configuration |
| Customer Service | 8083 | Node.js | Customer Management |
| Loan Service | 8084 | Node.js | Loan Processing |
| Underwriting | 8085 | Python | Risk Assessment |
| Disbursement | 8086 | Node.js | Payment Processing |
| Document | 8087 | Python | OCR & Storage |
| Collections | 8088 | Node.js | Recovery Management |
| Reporting | 8089 | Python | Analytics & Reports |
| Compliance | 8090 | Java | KYC/AML Compliance |

## Deployment

### Kubernetes
```bash
npm run k8s:deploy
```

### Production Build
```bash
npm run build:all
```

## Documentation

- [Solution Structure](./SOLUTION_STRUCTURE.md)
- [Tech Design Documentation](./TechDesign/)
