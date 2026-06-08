/**
 * Shared Configuration for NBFC Platform
 */

export const CONFIG = {
  // Service URLs
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    config: process.env.CONFIG_SERVICE_URL || 'http://localhost:3002',
    customer: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3003',
    loan: process.env.LOAN_SERVICE_URL || 'http://localhost:3004',
    underwriting: process.env.UNDERWRITING_SERVICE_URL || 'http://localhost:3007',
    disbursement: process.env.DISBURSEMENT_SERVICE_URL || 'http://localhost:3008',
    document: process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3009',
    collections: process.env.COLLECTIONS_SERVICE_URL || 'http://localhost:3010',
    reporting: process.env.REPORTING_SERVICE_URL || 'http://localhost:3011',
    compliance: process.env.COMPLIANCE_SERVICE_URL || 'http://localhost:3012',
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production',
    expiresIn: '24h',
    refreshExpiresIn: '7d',
  },
  
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/nbfc',
  },
  
  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  // Kafka Configuration
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    clientId: 'nbfc-platform',
  },
  
  // External Services
  external: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID || '',
      keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
    },
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      bucketName: process.env.S3_BUCKET_NAME || '',
      region: process.env.AWS_REGION || 'ap-south-1',
    },
  },
  
  // Application Settings
  app: {
    name: 'NBFC Multi-Application Platform',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
  },
};

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'read',
    'write',
    'delete',
    'manage_users',
    'manage_branches',
    'manage_all_loans',
    'view_reports',
  ],
  branch_manager: [
    'read',
    'write',
    'manage_customers',
    'manage_loans',
    'view_branch_reports',
  ],
  field_agent: [
    'read',
    'write',
    'collect_payments',
    'update_customer_info',
    'create_field_visits',
  ],
  customer: [
    'read',
    'make_payments',
    'view_own_loans',
    'update_profile',
  ],
  collections: [
    'read',
    'collect_payments',
    'view_delinquent_accounts',
    'generate_collection_reports',
  ],
};

// Interest rate tiers based on CRIF score
export const INTEREST_RATE_TIERS = [
  { minScore: 750, rate: 10.5 },
  { minScore: 700, rate: 11.5 },
  { minScore: 650, rate: 12.5 },
  { minScore: 600, rate: 13.5 },
  { minScore: 0, rate: 15.0 },
];

// KYC requirements
export const KYC_REQUIREMENTS = {
  individual: ['aadhar', 'pancard', 'address_proof'],
  business: ['gst_registration', 'bank_statement', 'audited_financials'],
};