// Loan Product Types
export type LoanType = 
  | 'personal'
  | 'vehicle-2w'
  | 'vehicle-4w'
  | 'vehicle-ev'
  | 'gold'
  | 'msme'
  | 'home'
  | 'mortgage'
  | 'topup';

export interface LoanProduct {
  product_id: string;
  name: string;
  type: LoanType;
  description: string;
  min_amount: number;
  max_amount: number;
  min_tenure: number; // in months
  max_tenure: number; // in months
  interest_rate_min: number;
  interest_rate_max: number;
  interest_type: 'flat' | 'reducing_balance' | 'annuity';
  processing_fee: number;
  processing_fee_type: 'fixed' | 'percentage';
  prepayment_penalty: boolean;
  is_active: boolean;
}

// Loan Application
export interface LoanApplication {
  application_id: string;
  customer_id: string;
  product_id: string;
  requested_amount: number;
  tenure_months: number;
  interest_rate: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed' | 'closed';
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  underwriting_status?: 'pending' | 'processing' | 'approved' | 'rejected';
  underwriting_score?: number;
  created_at: string;
  updated_at: string;
}

// Loan Schedule
export interface LoanSchedule {
  schedule_id: string;
  loan_id: string;
  installment_no: number;
  due_date: string;
  principal: number;
  interest: number;
  total_payment: number;
  paid_amount?: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  payment_date?: string;
}

// Loan Details
export interface Loan {
  loan_id: string;
  application_id: string;
  product_id: string;
  amount: number;
  tenure_months: number;
  interest_rate: number;
  status: 'active' | 'closed' | 'defaulted' | 'npa';
  disbursement_date?: string;
  closed_date?: string;
  remaining_balance?: number;
}

// Customer Types
export interface Customer {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  risk_score?: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerDocument {
  doc_id: string;
  customer_id: string;
  type: 'id_proof' | 'address_proof' | 'pan' | 'income_proof' | 'vehicle_rc' | 'gold_valuation' | 'property_doc';
  s3_url?: string;
  uploaded_at: string;
  expiry?: string;
  verified: boolean;
  verification_result?: Record<string, unknown>;
}

// Vehicle Types
export interface VehicleDetails {
  vehicle_id?: string;
  customer_id?: string;
  vehicle_type: '2wheeler' | '4wheeler' | 'ev';
  make: string;
  model: string;
  year: number;
  registration_number?: string;
  rc_url?: string;
  chassis_number?: string;
  engine_number?: string;
  insurance_url?: string;
  insurance_expiry?: string;
}

// Gold Loan Types
export interface GoldDetails {
  gold_id?: string;
  customer_id?: string;
  ornaments: Array<{
    description: string;
    weight_grams: number;
    purity: string; // e.g., '22K', '24K'
    estimated_value: number;
  }>;
  total_weight: number;
  valuation_date?: string;
  valuation_url?: string;
}

// MSME Types
export interface MSMEDetails {
  msme_id?: string;
  customer_id?: string;
  business_name: string;
  business_type: string;
  business_registration: 'prop' | 'llp' | 'pvt_ltd' | 'partnership';
  gst_number?: string;
  annual_turnover: number;
  years_in_business: number;
  business_address: string;
  business_city: string;
  business_state: string;
  business_pincode: string;
}

// Home Loan Types
export interface HomeLoanDetails {
  home_loan_id?: string;
  customer_id?: string;
  property_type: 'residential' | 'commercial' | 'plot' | 'under_construction';
  property_value: number;
  property_address: string;
  property_city: string;
  property_state: string;
  property_pincode: string;
  property_docs_url?: string;
  construction_stage?: string;
}

// Mortgage Loan Types
export interface MortgageDetails {
  mortgage_id?: string;
  customer_id?: string;
  property_type: 'residential' | 'commercial' | 'land';
  property_value: number;
  property_address: string;
  property_city: string;
  property_state: string;
  property_pincode: string;
  property_docs_url?: string;
  occupancy_status: 'occupied' | 'rented' | 'vacant';
}

// Payment Types
export interface Payment {
  payment_id: string;
  loan_id: string;
  amount: number;
  method: 'auto_debit' | 'upi' | 'neft' | 'cash' | 'cheque';
  status: 'success' | 'pending' | 'failed';
  transaction_date: string;
  reference_number?: string;
  remarks?: string;
}

export interface Transaction {
  txn_id: string;
  customer_id: string;
  loan_id?: string;
  type: 'debit' | 'credit';
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  posted_at: string;
  description: string;
}

// Auth Types
export interface User {
  user_id: string;
  username: string;
  email: string;
  role: 'admin' | 'branch_manager' | 'loan_officer' | 'collections' | 'auditor';
  organization_id?: string;
  is_active: boolean;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// Audit Log
export interface AuditLog {
  log_id: string;
  entity_type: string;
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  performed_by: string;
  timestamp: string;
  before_data?: Record<string, unknown>;
  after_data?: Record<string, unknown>;
}