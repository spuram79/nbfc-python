/**
 * Database Service Layer
 * Provides PostgreSQL integration for the NBFC-Python application
 * 
 * This replaces the in-memory storage with persistent PostgreSQL storage
 * using row-level security for multi-tenant isolation.
 */

import { Pool, PoolClient, PoolConfig } from 'pg';

// Database configuration - uses environment variables
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// Create connection pool
const pool = new Pool(poolConfig);

// Database types
export interface Customer {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  risk_score?: number;
  company_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface LoanApplication {
  application_id: string;
  customer_id: string;
  product_id: string;
  requested_amount: number;
  tenure_months: number;
  interest_rate?: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed' | 'closed';
  underwriting_status?: 'pending' | 'processing' | 'approved' | 'rejected';
  underwriting_score?: number;
  rejection_reason?: string;
  company_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Loan {
  loan_id: string;
  application_id: string;
  disbursement_date?: Date;
  actual_amount: number;
  status: 'active' | 'closed' | 'defaulted' | 'npa';
  closed_date?: Date;
  company_id: string;
}

export interface Payment {
  payment_id: string;
  loan_id: string;
  schedule_id?: string;
  amount: number;
  method: 'manual' | 'auto_debit' | 'upi' | 'neft' | 'cash';
  status: 'success' | 'failed' | 'refunded';
  transaction_date: Date;
  reference_number: string;
  company_id: string;
}

export interface KYCStatus {
  kyc_id: string;
  customer_id: string;
  document_type: 'id_proof' | 'address_proof' | 'income_proof' | 'pan';
  document_number: string;
  status: 'pending' | 'verified' | 'rejected';
  verified_at?: Date;
  company_id: string;
}

// Database helper functions
export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async query(text: string, params: unknown[] = []): Promise<{ rows: unknown[] }> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  async getCustomer(id: string, companyId: string): Promise<Customer | null> {
    const result = await this.query(
      'SELECT * FROM customers WHERE customer_id = $1 AND company_id = $2',
      [id, companyId]
    );
    return result.rows[0] || null;
  }

  async createCustomer(customer: Omit<Customer, 'created_at' | 'updated_at'>): Promise<Customer> {
    const now = new Date();
    const result = await this.query(
      `INSERT INTO customers (customer_id, first_name, last_name, email, mobile, dob, address, city, state, pincode, kyc_status, risk_score, company_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        customer.customer_id, customer.first_name, customer.last_name, customer.email, customer.mobile,
        customer.dob, customer.address, customer.city, customer.state, customer.pincode,
        customer.kyc_status, customer.risk_score, customer.company_id, now, now
      ]
    );
    return result.rows[0];
  }

  async listCustomers(companyId: string, search?: string): Promise<{ customers: Customer[]; total: number }> {
    let query = 'SELECT * FROM customers WHERE company_id = $1';
    const params: unknown[] = [companyId];
    
    if (search) {
      query += ' AND (first_name ILIKE $2 OR last_name ILIKE $2 OR mobile ILIKE $2)';
      params.push(`%${search}%`);
    }
    
    const countResult = await this.query(
      `SELECT COUNT(*) FROM (${query}) AS count_query`,
      params
    );
    
    const dataResult = await this.query(
      `${query} ORDER BY created_at DESC`,
      params
    );
    
    return {
      customers: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
  }

  async getLoanApplication(id: string, companyId: string): Promise<LoanApplication | null> {
    const result = await this.query(
      'SELECT * FROM loan_applications WHERE application_id = $1 AND company_id = $2',
      [id, companyId]
    );
    return result.rows[0] || null;
  }

  async createLoanApplication(application: Omit<LoanApplication, 'created_at' | 'updated_at'>): Promise<LoanApplication> {
    const now = new Date();
    const result = await this.query(
      `INSERT INTO loan_applications (application_id, customer_id, product_id, requested_amount, tenure_months, interest_rate, status, underwriting_status, underwriting_score, rejection_reason, company_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        application.application_id, application.customer_id, application.product_id, application.requested_amount,
        application.tenure_months, application.interest_rate, application.status,
        application.underwriting_status, application.underwriting_score, application.rejection_reason,
        application.company_id, now, now
      ]
    );
    return result.rows[0];
  }

  async listLoans(companyId: string, filters?: { customerId?: string; status?: string }): Promise<{ loans: LoanApplication[]; total: number }> {
    let query = 'SELECT * FROM loan_applications WHERE company_id = $1';
    const params: unknown[] = [companyId];
    let countQuery = `SELECT COUNT(*) FROM loan_applications WHERE company_id = $1`;
    let countParams = [companyId];
    
    if (filters?.customerId) {
      query += ' AND customer_id = $2';
      countQuery += ' AND customer_id = $2';
      params.push(filters.customerId);
      countParams.push(filters.customerId);
    }
    if (filters?.status) {
      query += ` AND status = $${params.length + 1}`;
      countQuery += ` AND status = $${countParams.length + 1}`;
      params.push(filters.status);
      countParams.push(filters.status);
    }
    
    const countResult = await this.query(countQuery, countParams);
    const dataResult = await this.query(`${query} ORDER BY created_at DESC`, params);
    
    return {
      loans: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
  }

  async getLoan(id: string, companyId: string): Promise<Loan | null> {
    const result = await this.query(
      'SELECT * FROM loans WHERE loan_id = $1 AND company_id = $2',
      [id, companyId]
    );
    return result.rows[0] || null;
  }

  async createLoan(loan: Omit<Loan, 'company_id'> & { company_id: string }): Promise<Loan> {
    const result = await this.query(
      `INSERT INTO loans (loan_id, application_id, disbursement_date, actual_amount, status, closed_date, company_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [loan.loan_id, loan.application_id, loan.disbursement_date, loan.actual_amount, loan.status, loan.closed_date, loan.company_id]
    );
    return result.rows[0];
  }

  async createPayment(payment: Omit<Payment, 'company_id'> & { company_id: string }): Promise<Payment> {
    const result = await this.query(
      `INSERT INTO payments (payment_id, loan_id, schedule_id, amount, method, status, transaction_date, reference_number, company_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [payment.payment_id, payment.loan_id, payment.schedule_id, payment.amount, payment.method, payment.status, payment.transaction_date, payment.reference_number, payment.company_id]
    );
    return result.rows[0];
  }

  async listPayments(companyId: string, loanId?: string): Promise<Payment[]> {
    let query = 'SELECT * FROM payments WHERE company_id = $1';
    const params: unknown[] = [companyId];
    
    if (loanId) {
      query += ' AND loan_id = $2';
      params.push(loanId);
    }
    
    const result = await this.query(`${query} ORDER BY transaction_date DESC`, params);
    return result.rows;
  }
}

// Export singleton instance
export const db = new DatabaseService();

// Database initialization function for migrations
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        customer_id UUID PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mobile VARCHAR(20) UNIQUE NOT NULL,
        dob DATE,
        address TEXT,
        city VARCHAR(50),
        state VARCHAR(50),
        pincode VARCHAR(10),
        kyc_status VARCHAR(20) DEFAULT 'pending',
        risk_score INTEGER,
        company_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS loan_applications (
        application_id UUID PRIMARY KEY,
        customer_id UUID NOT NULL,
        product_id VARCHAR(20) NOT NULL,
        requested_amount BIGINT NOT NULL,
        tenure_months INTEGER NOT NULL,
        interest_rate DECIMAL,
        status VARCHAR(20) DEFAULT 'draft',
        underwriting_status VARCHAR(20),
        underwriting_score INTEGER,
        rejection_reason TEXT,
        company_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS loans (
        loan_id UUID PRIMARY KEY,
        application_id UUID NOT NULL,
        disbursement_date TIMESTAMP,
        actual_amount BIGINT NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        closed_date TIMESTAMP,
        company_id VARCHAR(50) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        payment_id UUID PRIMARY KEY,
        loan_id UUID NOT NULL,
        schedule_id UUID,
        amount BIGINT NOT NULL,
        method VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'success',
        transaction_date TIMESTAMP DEFAULT NOW(),
        reference_number VARCHAR(50) UNIQUE,
        company_id VARCHAR(50) NOT NULL
      );
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}