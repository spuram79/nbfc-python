/**
 * Shared TypeScript Types for NBFC Platform
 */

// User Types
export type UserRole = 'admin' | 'branch_manager' | 'field_agent' | 'customer' | 'collections';

export interface User {
  id: number;
  username: string;
  email?: string;
  role: UserRole;
  branchId?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AuthToken {
  userId: number;
  username: string;
  role: UserRole;
  branchId?: number;
  iat?: number;
  exp?: number;
}

// Customer Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Customer {
  id: number;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: Address;
  crifScore: number;
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt?: Date;
  branchId?: number;
}

export interface KYCDocument {
  type: 'aadhar' | 'pancard' | 'address_proof' | 'bank_statement';
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
  rejectedReason?: string;
}

// Loan Types
export type LoanStatus = 'applied' | 'under_review' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'closed' | 'defaulted';

export interface Loan {
  id: number;
  loanId: string;
  customerId: string;
  customerIdRef: number;
  amount: number;
  interestRate: number;
  tenure: number; // in months
  status: LoanStatus;
  disbursementDate?: Date;
  maturityDate?: Date;
  emi: number;
  branchId?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface RepaymentSchedule {
  installment: number;
  dueDate: string;
  principal: number;
  interest: number;
  balance: number;
  status: 'pending' | 'paid' | 'overdue';
}

// API Response Types
export interface ApiResponse<T> {
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

// Service Configuration
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
  };
}

// Permission Types
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
  view_delinquent_accounts: 'view_delinquent_accounts'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];