/**
 * Shared Configuration for NBFC Platform
 * Centralized configuration for all microservices
 */

import { ServiceConfig, Permission, LoanProductCategory, UserRole } from '@nbfc/types';

// ============================================================================
// SERVICE CONFIGURATION
// ============================================================================

export const SERVICE_CONFIG: ServiceConfig[] = [
  {
    name: 'auth-service',
    port: 3001,
    endpoints: {
      auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    },
  },
  {
    name: 'config-service',
    port: 3002,
    endpoints: {
      config: process.env.CONFIG_SERVICE_URL || 'http://localhost:3002',
    },
  },
  {
    name: 'customer-service',
    port: 3003,
    endpoints: {
      customer: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3003',
    },
  },
  {
    name: 'loan-service',
    port: 3004,
    endpoints: {
      loan: process.env.LOAN_SERVICE_URL || 'http://localhost:3004',
    },
  },
  {
    name: 'underwriting-service',
    port: 3007,
    endpoints: {
      underwriting: process.env.UNDERWRITING_SERVICE_URL || 'http://localhost:3007',
    },
  },
  {
    name: 'disbursement-service',
    port: 3008,
    endpoints: {
      disbursement: process.env.DISBURSEMENT_SERVICE_URL || 'http://localhost:3008',
    },
  },
  {
    name: 'document-service',
    port: 3009,
    endpoints: {
      document: process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3009',
    },
  },
  {
    name: 'collections-service',
    port: 3010,
    endpoints: {
      collections: process.env.COLLECTIONS_SERVICE_URL || 'http://localhost:3010',
    },
  },
  {
    name: 'reporting-service',
    port: 3011,
    endpoints: {
      reporting: process.env.REPORTING_SERVICE_URL || 'http://localhost:3011',
    },
  },
  {
    name: 'compliance-service',
    port: 3012,
    endpoints: {
      compliance: process.env.COMPLIANCE_SERVICE_URL || 'http://localhost:3012',
    },
  },
  {
    name: 'payment-service',
    port: 3013,
    endpoints: {
      payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3013',
    },
  },
];

export const getServiceUrl = (serviceName: keyof NonNullable<ServiceConfig['endpoints']>): string => {
  const service = SERVICE_CONFIG.find(s => s.endpoints?.[serviceName]);
  return service?.endpoints?.[serviceName] || `http://localhost:${getServicePort(serviceName)}`;
};

export const getServicePort = (serviceName: keyof NonNullable<ServiceConfig['endpoints']>): number => {
  const service = SERVICE_CONFIG.find(s => s.endpoints?.[serviceName]);
  return service?.port || 3000;
};

// ============================================================================
// JWT CONFIGURATION
// ============================================================================

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  issuer: 'nbfc-platform',
  audience: 'nbfc-users',
};

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

export const DATABASE_CONFIG = {
  url: process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/nbfc',
  poolSize: parseInt(process.env.DB_POOL_SIZE || '20'),
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
};

// ============================================================================
// REDIS CONFIGURATION
// ============================================================================

export const REDIS_CONFIG = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  sessionExpiry: process.env.SESSION_EXPIRY || '24h',
  maxSessionsPerUser: parseInt(process.env.MAX_SESSIONS_PER_USER || '5'),
};

// ============================================================================
// KAFKA CONFIGURATION
// ============================================================================

export const KAFKA_CONFIG = {
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  clientId: 'nbfc-platform',
  groupId: 'nbfc-services',
  topics: {
    loanApplicationSubmitted: 'loan.application.submitted',
    loanApproved: 'loan.approved',
    loanDisbursed: 'loan.disbursed',
    loanRejected: 'loan.rejected',
    loanClosed: 'loan.closed',
    loanDefaulted: 'loan.defaulted',
    customerCreated: 'customer.created',
    customerKycUpdated: 'customer.kyc.updated',
    customerDocumentAdded: 'customer.document.added',
    customerUpdated: 'customer.updated',
    paymentReceived: 'payment.received',
  },
};

// ============================================================================
// PAYMENT GATEWAY CONFIGURATION
// ============================================================================

export const PAYMENT_CONFIG = {
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
};

// ============================================================================
// AWS CONFIGURATION
// ============================================================================

export const AWS_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  region: process.env.AWS_REGION || 'ap-south-1',
  bucketName: process.env.S3_BUCKET_NAME || 'nbfc-documents',
  documentBucket: process.env.S3_DOCUMENT_BUCKET || 'nbfc-documents',
};

// ============================================================================
// APPLICATION SETTINGS
// ============================================================================

export const APP_CONFIG = {
  name: 'NBFC Multi-Application Platform',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  baseApiPath: '/api/v1',
};

// ============================================================================
// ROLE PERMISSIONS MAPPING
// ============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'read',
    'write',
    'delete',
    'manage_users',
    'manage_branches',
    'manage_customers',
    'manage_loans',
    'collect_payments',
    'view_delinquent_accounts',
    'branch_reports',
    'approve_loan_up_to_10l',
    'manage_branch_users',
    'full_system_access',
    'tenant_management',
    'system_settings',
    'full_branch_access',
  ],
  admin: [
    'read',
    'write',
    'delete',
    'manage_users',
    'manage_branches',
    'manage_customers',
    'manage_loans',
    'view_reports',
  ],
  manager: [
    'read',
    'write',
    'manage_customers',
    'manage_loans',
    'branch_reports',
    'approve_loan_up_to_10l',
    'manage_branch_users',
  ],
  branch_staff: [
    'read',
    'write',
    'manage_customers',
    'manage_loans',
    'process_loan_application',
    'verify_documents',
    'collect_payments',
  ],
  field_agent: [
    'read',
    'write',
    'collect_payments',
    'view_delinquent_accounts',
    'update_customer_info',
  ],
  customer: [
    'read',
    'make_payments',
    'view_own_profile',
    'view_own_loan',
  ],
  collections: [
    'read',
    'collect_payments',
    'view_delinquent_accounts',
  ],
};

// ============================================================================
// INTEREST RATE TIERS
// ============================================================================

export const INTEREST_RATE_TIERS = [
  { minScore: 750, rate: 10.5, category: 'personal' },
  { minScore: 700, rate: 11.5, category: 'personal' },
  { minScore: 650, rate: 12.5, category: 'personal' },
  { minScore: 600, rate: 13.5, category: 'personal' },
  { minScore: 0, rate: 15.0, category: 'personal' },
];

// ============================================================================
// LOAN CATEGORY LIMITS
// ============================================================================

export const LOAN_CATEGORY_LIMITS: Record<LoanProductCategory, { maxTenure: number; maxLoanAmount: number }> = {
  personal: { maxTenure: 60, maxLoanAmount: 500000 },
  home: { maxTenure: 240, maxLoanAmount: 5000000 },
  vehicle: { maxTenure: 120, maxLoanAmount: 1000000 },
  gold: { maxTenure: 24, maxLoanAmount: 100000 },
  msme: { maxTenure: 120, maxLoanAmount: 2000000 },
};

// ============================================================================
// KYC REQUIREMENTS BY CUSTOMER TYPE
// ============================================================================

export const KYC_REQUIREMENTS = {
  individual: ['aadhar', 'pancard', 'address_proof'],
  business: ['gst_registration', 'bank_statement', 'audited_financials'],
};

// ============================================================================
// RATE LIMITING CONFIGURATION
// ============================================================================

export const RATE_LIMIT_CONFIG = {
  loginAttempts: {
    windowMs: parseInt(process.env.LOGIN_WINDOW_MS || '60000'),
    max: parseInt(process.env.LOGIN_MAX_ATTEMPTS || '5'),
  },
  apiCalls: {
    windowMs: parseInt(process.env.API_WINDOW_MS || '60000'),
    max: parseInt(process.env.API_MAX_CALLS || '100'),
  },
  passwordReset: {
    windowMs: parseInt(process.env.RESET_WINDOW_MS || '3600000'),
    max: parseInt(process.env.RESET_MAX_ATTEMPTS || '3'),
  },
};

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

export const CORS_CONFIG = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
};

// ============================================================================
// EXPORT ALL CONFIG
// ============================================================================

export const CONFIG = {
  services: SERVICE_CONFIG.reduce((acc, service) => {
    Object.assign(acc, service.endpoints);
    return acc;
  }, {} as Record<string, string>),
  jwt: JWT_CONFIG,
  database: DATABASE_CONFIG,
  redis: REDIS_CONFIG,
  kafka: KAFKA_CONFIG,
  payment: PAYMENT_CONFIG,
  aws: AWS_CONFIG,
  app: APP_CONFIG,
  rolePermissions: ROLE_PERMISSIONS,
  interestRateTiers: INTEREST_RATE_TIERS,
  loanCategoryLimits: LOAN_CATEGORY_LIMITS,
  kycRequirements: KYC_REQUIREMENTS,
  rateLimiting: RATE_LIMIT_CONFIG,
  cors: CORS_CONFIG,
};