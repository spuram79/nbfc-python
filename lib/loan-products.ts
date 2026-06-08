export const loanProducts = [
  {
    id: 'personal',
    name: 'Personal Loan',
    description: 'Unsecured personal loan for your financial needs',
    type: 'personal',
    interest_type: 'reducing_balance',
    min_amount: 50000,
    max_amount: 1500000,
    min_tenure: 6,
    max_tenure: 60,
    interest_rate_min: 10.5,
    interest_rate_max: 24.0,
    processing_fee: 2.0,
    processing_fee_type: 'percentage',
    prepayment_penalty: false,
  },
  {
    id: 'vehicle-2w',
    name: 'Two Wheeler Loan',
    description: 'Finance your dream bike with our two wheeler loan',
    type: 'vehicle',
    interest_type: 'flat',
    min_amount: 50000,
    max_amount: 1500000,
    min_tenure: 12,
    max_tenure: 36,
    interest_rate_min: 9.5,
    interest_rate_max: 18.0,
    processing_fee: 1.0,
    processing_fee_type: 'percentage',
    prepayment_penalty: false,
  },
  {
    id: 'vehicle-4w',
    name: 'Four Wheeler Loan',
    description: 'Finance your car with our four wheeler loan',
    type: 'vehicle',
    interest_type: 'reducing_balance',
    min_amount: 200000,
    max_amount: 5000000,
    min_tenure: 12,
    max_tenure: 84,
    interest_rate_min: 8.5,
    interest_rate_max: 15.0,
    processing_fee: 1.5,
    processing_fee_type: 'percentage',
    prepayment_penalty: true,
  },
  {
    id: 'vehicle-ev',
    name: 'Electric Vehicle Loan',
    description: 'Special financing for electric vehicles',
    type: 'vehicle',
    interest_type: 'reducing_balance',
    min_amount: 100000,
    max_amount: 3000000,
    min_tenure: 12,
    max_tenure: 60,
    interest_rate_min: 8.0,
    interest_rate_max: 14.0,
    processing_fee: 1.0,
    processing_fee_type: 'percentage',
    prepayment_penalty: false,
  },
  {
    id: 'gold',
    name: 'Gold Loan',
    description: 'Quick loan against your gold ornaments',
    type: 'gold',
    interest_type: 'flat',
    min_amount: 10000,
    max_amount: 5000000,
    min_tenure: 3,
    max_tenure: 36,
    interest_rate_min: 7.0,
    interest_rate_max: 12.0,
    processing_fee: 0.5,
    processing_fee_type: 'percentage',
    prepayment_penalty: false,
  },
  {
    id: 'msme',
    name: 'MSME Loan',
    description: 'Business financing for Micro, Small and Medium Enterprises',
    type: 'business',
    interest_type: 'annuity',
    min_amount: 100000,
    max_amount: 25000000,
    min_tenure: 12,
    max_tenure: 120,
    interest_rate_min: 10.0,
    interest_rate_max: 16.0,
    processing_fee: 1.5,
    processing_fee_type: 'percentage',
    prepayment_penalty: true,
  },
  {
    id: 'home',
    name: 'Home Loan',
    description: 'Finance your dream home with our home loan',
    type: 'home',
    interest_type: 'reducing_balance',
    min_amount: 200000,
    max_amount: 50000000,
    min_tenure: 24,
    max_tenure: 360,
    interest_rate_min: 7.5,
    interest_rate_max: 12.0,
    processing_fee: 0.5,
    processing_fee_type: 'percentage',
    prepayment_penalty: false,
  },
  {
    id: 'mortgage',
    name: 'Mortgage Loan',
    description: 'Loan against property for your financial needs',
    type: 'home',
    interest_type: 'reducing_balance',
    min_amount: 100000,
    max_amount: 50000000,
    min_tenure: 24,
    max_tenure: 240,
    interest_rate_min: 7.0,
    interest_rate_max: 11.0,
    processing_fee: 0.75,
    processing_fee_type: 'percentage',
    prepayment_penalty: false,
  },
  {
    id: 'topup',
    name: 'Top Up Loan',
    description: 'Top up loan for existing customers',
    type: 'personal',
    interest_type: 'reducing_balance',
    min_amount: 50000,
    max_amount: 2000000,
    min_tenure: 6,
    max_tenure: 60,
    interest_rate_min: 11.0,
    interest_rate_max: 22.0,
    processing_fee: 2.0,
    processing_fee_type: 'percentage',
    prepayment_penalty: false,
  },
] as const;

export type LoanProductId = typeof loanProducts[number]['id'];

// Schedule type
export interface LoanSchedule {
  schedule_id: string;
  loan_id: string;
  installment_no: number;
  due_date: Date;
  principal: number;
  interest: number;
  total_payment: number;
  paid_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  payment_date?: Date;
  created_at: Date;
}

// Company type
export interface Company {
  id: string;
  name: string;
  full_name: string;
  tagline?: string;
  logo_config?: any;
  contact?: any;
  theme?: any;
  registration?: any;
  social?: any;
  currency?: any;
  application?: any;
  saas?: any;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}