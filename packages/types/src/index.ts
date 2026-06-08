/**
 * Shared TypeScript Types for NBFC Platform
 * Comprehensive type definitions based on technical design documents
 */

// ============================================================================
// ENUM TYPES
// ============================================================================

export type UserRole = 'admin' | 'branch_manager' | 'field_agent' | 'customer' | 'collections' | 'branch_staff' | 'manager' | 'super_admin';

export type LoanStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'closed' | 'defaulted' | 'write_off' | 'applied';

export type KYCStatus = 'pending' | 'in_progress' | 'verified' | 'rejected';

export type CustomerStatus = 'active' | 'inactive' | 'blacklisted';

export type LoanProductCategory = 'personal' | 'home' | 'vehicle' | 'gold' | 'msme';

export type InterestRateType = 'fixed' | 'floating';

export type FeeType = 'fixed' | 'percentage';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'missed';

export type NPAStatus = 'regular' | 'rw' | 'loss';

export type Gender = 'male' | 'female' | 'other';

export type MaritalStatus = 'single' | 'married' | 'widowed' | 'separated';

export type CustomerSource = 'direct' | 'referral' | 'online' | 'branch';

export type IncomeType = 'salary' | 'business' | 'rental' | 'other';

export type DocumentType = 'aadhar' | 'pan' | 'passport' | 'driving_license' | 'address_proof' | 'income_proof';

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export interface User {
  id: string;
  tenantId: string;
  employeeId?: string;
  branchId?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: UserRole;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AuthToken {
  sub: string; // user-id
  tenantId: string;
  branchId?: string;
  role: UserRole;
  permissions: Permission[];
  iat?: number;
  exp?: number;
  tokenType?: 'access' | 'refresh';
}

export interface AccessTokenPayload {
  sub: string;
  tenantId: string;
  branchId?: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
  tokenType: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
  iat: number;
  exp: number;
  tokenType: 'refresh';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    branchId?: string;
  };
}

export interface Session {
  id: string;
  userId: string;
  tokenId: string;
  deviceId?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
}

// ============================================================================
// ADDRESS & LOCATION TYPES
// ============================================================================

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  street?: string;
  zipCode?: string;
}

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export interface Customer {
  id: string;
  customerId: string;
  tenantId: string;
  branchId?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  email: string;
  phone: string;
  alternatePhone?: string;
  address: Address;
  kycStatus: KYCStatus;
  status: CustomerStatus;
  source: CustomerSource;
  referralId?: string;
  crifScore?: number;
  cibilScore?: number;
  riskScore?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface KYCDocument {
  type: DocumentType;
  number?: string;
  issuedBy?: string;
  issuedAt?: Date;
  expiresAt?: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectedReason?: string;
  url?: string;
}

export interface KYCProfile {
  id: string;
  customerId: string;
  panNumber?: string;
  aadhaarNumber?: string;
  passportNumber?: string;
  voterId?: string;
  documents: KYCDocument[];
  incomes: Income[];
  riskScore?: number;
  cibilScore?: number;
  verificationNotes?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  createdAt: Date;
}

export interface Income {
  type: IncomeType;
  annualIncome: number;
  documents: string[];
}

// ============================================================================
// LOAN PRODUCT TYPES
// ============================================================================

export interface LoanProduct {
  id: string;
  code: string;
  name: string;
  description: string;
  category: LoanProductCategory;
  interestRateType: InterestRateType;
  interestRate: number;
  minInterestRate?: number;
  maxInterestRate?: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  minTenure: number;
  maxTenure: number;
  processingFee: number;
  processingFeeType: FeeType;
  prepaymentFee?: number;
  isAvailable: boolean;
  eligibilityCriteria: EligibilityCriteria;
  requiredDocuments: DocumentType[];
  createdAt: Date;
}

export interface EligibilityCriteria {
  minAge?: number;
  maxAge?: number;
  minIncome?: number;
  minCibilScore?: number;
  employmentType?: string[];
  maxExistingLoans?: number;
}

// ============================================================================
// LOAN APPLICATION TYPES
// ============================================================================

export interface LoanApplication {
  id: string;
  applicationId: string;
  customerId: string;
  productId: string;
  tenantId: string;
  branchId: string;
  loanAmount: number;
  tenure: number;
  emi: number;
  interestRate: number;
  processingFee: number;
  totalLoanAmount: number;
  status: LoanStatus;
  rejectionReason?: string;
  documents: ApplicationDocument[];
  answers?: ApplicationAnswer[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface ApplicationDocument {
  type: string;
  url: string;
  verified: boolean;
}

export interface ApplicationAnswer {
  questionId: string;
  answer: string;
}

// ============================================================================
// LOAN ACCOUNT TYPES
// ============================================================================

export interface LoanAccount {
  id: string;
  accountId: string;
  applicationId: string;
  customerId: string;
  productId: string;
  disbursementDate: Date;
  loanAmount: number;
  tenure: number;
  emi: number;
  interestRate: number;
  totalInterest: number;
  processingFee: number;
  totalAmount: number;
  startDate: Date;
  endDate: Date;
  status: LoanStatus;
  currentBalance: number;
  npaStatus: NPAStatus;
  createdAt: Date;
}

export interface RepaymentSchedule {
  id: string;
  accountId: string;
  installmentNumber: number;
  dueDate: Date;
  principal: number;
  interest: number;
  totalAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  paymentId?: string;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface Payment {
  id: string;
  loanAccountId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'upi' | 'neft' | 'rtgs' | 'cheque';
  transactionId?: string;
  collectedBy: string;
  receiptUrl?: string;
  status: PaymentStatus;
  createdAt: Date;
}

// ============================================================================
// COLLECTIONS TYPES
// ============================================================================

export interface DelinquentAccount {
  id: string;
  loanAccountId: string;
  customerId: string;
  daysOverdue: number;
  overdueAmount: number;
  lastPaymentDate?: Date;
  npaStatus: NPAStatus;
  assignedTo?: string;
  collectionStatus: 'not_assigned' | 'in_progress' | 'resolved' | 'escalated';
  escalationLevel: number;
  nextActionDate?: Date;
}

export interface CollectionActivity {
  id: string;
  delinquentAccountId: string;
  collectedBy: string;
  activityType: 'visit' | 'call' | 'sms' | 'email' | 'legal_notice';
  notes?: string;
  outcome?: string;
  collectionAmount?: number;
  activityDate: Date;
  createdAt: Date;
}

// ============================================================================
// BRANCH TYPES
// ============================================================================

export interface Branch {
  id: string;
  tenantId: string;
  branchCode: string;
  branchName: string;
  address: Address;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

// ============================================================================
// TENANT TYPES
// ============================================================================

export interface Tenant {
  id: string;
  tenantName: string;
  subdomain?: string;
  logoUrl?: string;
  address?: Address;
  contactEmail?: string;
  contactPhone?: string;
  licenseKey?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
}

// ============================================================================
// PERMISSION & RBAC TYPES
// ============================================================================

export const PERMISSIONS = {
  read: 'read',
  write: 'write',
  delete: 'delete',
  manage_users: 'manage_users',
  manage_branches: 'manage_branches',
  manage_customers: 'manage_customers',
  manage_loans: 'manage_loans',
  collect_payments: 'collect_payments',
  update_customer_info: 'update_customer_info',
  make_payments: 'make_payments',
  view_delinquent_accounts: 'view_delinquent_accounts',
  view_own_profile: 'view_own_profile',
  view_own_loan: 'view_own_loan',
  process_loan_application: 'process_loan_application',
  verify_documents: 'verify_documents',
  branch_reports: 'branch_reports',
  approve_loan_up_to_10l: 'approve_loan_up_to_10l',
  manage_branch_users: 'manage_branch_users',
  full_system_access: 'full_system_access',
  tenant_management: 'tenant_management',
  system_settings: 'system_settings',
  full_branch_access: 'full_branch_access',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export interface RolePermissions {
  customer: Permission[];
  field_agent: Permission[];
  branch_staff: Permission[];
  manager: Permission[];
  admin: Permission[];
  super_admin: Permission[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
  };
}

// ============================================================================
// SERVICE CONFIGURATION
// ============================================================================

export interface ServiceConfig {
  name: string;
  port: number;
  endpoints: {
    auth?: string;
    customer?: string;
    loan?: string;
    underwriting?: string;
    disbursement?: string;
    document?: string;
    collections?: string;
    reporting?: string;
    compliance?: string;
    config?: string;
    payment?: string;
  };
}

// ============================================================================
// KAFKA EVENT TYPES
// ============================================================================

export type KafkaEvent = 
  | 'loan.application.submitted'
  | 'loan.approved'
  | 'loan.disbursed'
  | 'loan.rejected'
  | 'loan.closed'
  | 'loan.defaulted'
  | 'customer.created'
  | 'customer.kyc.updated'
  | 'customer.document.added'
  | 'customer.updated'
  | 'payment.received';

export interface KafkaEventMessage {
  event: KafkaEvent;
  payload: Record<string, unknown>;
  timestamp: Date;
  source: string;
}