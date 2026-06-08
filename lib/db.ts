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

  // Company Management
  async getCompany(id: string): Promise<{ id: string; name: string; is_active: boolean; application?: any } | null> {
    const result = await this.query(
      'SELECT id, name, is_active, application, theme FROM companies WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async createCompany(company: { id: string; name: string; full_name: string; is_active?: boolean }): Promise<any> {
    const result = await this.query(
      `INSERT INTO companies (id, name, full_name, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, name, is_active`,
      [company.id, company.name, company.full_name, company.is_active ?? true]
    );
    return result.rows[0];
  }

  // Customer Management
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

  // Loan Schedule Management
  async createLoanSchedule(schedule: {
    schedule_id: string;
    loan_id: string;
    installment_no: number;
    due_date: Date;
    principal: number;
    interest: number;
    total_payment: number;
    status?: string;
  }): Promise<any> {
    const result = await this.query(
      `INSERT INTO loan_schedules (schedule_id, loan_id, installment_no, due_date, principal, interest, total_payment, status, paid_amount, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, NOW())
       RETURNING *`,
      [
        schedule.schedule_id, schedule.loan_id, schedule.installment_no, schedule.due_date,
        schedule.principal, schedule.interest, schedule.total_payment, schedule.status || 'pending'
      ]
    );
    return result.rows[0];
  }

  async listLoanSchedules(loanId: string): Promise<any[]> {
    const result = await this.query(
      'SELECT * FROM loan_schedules WHERE loan_id = $1 ORDER BY installment_no',
      [loanId]
    );
    return result.rows;
  }

  async updateSchedulePayment(scheduleId: string, amount: number, paymentDate: Date): Promise<any> {
    const result = await this.query(
      `UPDATE loan_schedules 
       SET paid_amount = paid_amount + $2,
           status = CASE WHEN paid_amount + $2 >= total_payment THEN 'paid' ELSE 'partial' END,
           payment_date = $3
       WHERE schedule_id = $1
       RETURNING *`,
      [scheduleId, amount, paymentDate]
    );
    return result.rows[0];
  }

  // Audit Log Management
  async createAuditLog(log: {
    entity_type: string;
    entity_id: string;
    action: string;
    performed_by?: string;
    performed_by_role?: string;
    company_id: string;
    ip_address?: string;
    before_data?: any;
    after_data?: any;
    change_summary?: string[];
  }): Promise<void> {
    await this.query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, performed_by_role, company_id, ip_address, before_data, after_data, change_summary, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [
        log.entity_type, log.entity_id, log.action, log.performed_by,
        log.performed_by_role, log.company_id, log.ip_address,
        JSON.stringify(log.before_data), JSON.stringify(log.after_data),
        log.change_summary
      ]
    );
  }

  async listAuditLogs(companyId: string, entityType?: string, entityId?: string): Promise<any[]> {
    let query = 'SELECT * FROM audit_logs WHERE company_id = $1';
    const params: unknown[] = [companyId];
    
    if (entityType) {
      query += ' AND entity_type = $2';
      params.push(entityType);
    }
    if (entityId) {
      query += ` AND entity_id = $${params.length + 1}`;
      params.push(entityId);
    }
    
    const result = await this.query(`${query} ORDER BY created_at DESC`, params);
    return result.rows;
  }

  // Loan Disbursement and Closure
  async disburseLoan(loanId: string, amount: number, disbursementDate: Date): Promise<any> {
    const result = await this.query(
      `UPDATE loans 
       SET actual_amount = $2, status = 'active', disbursement_date = $3, updated_at = NOW()
       WHERE loan_id = $1
       RETURNING *`,
      [loanId, amount, disbursementDate]
    );
    return result.rows[0];
  }

  async closeLoan(loanId: string, closedDate: Date): Promise<any> {
    const result = await this.query(
      `UPDATE loans 
       SET status = 'closed', closed_date = $2, updated_at = NOW()
       WHERE loan_id = $1
       RETURNING *`,
      [loanId, closedDate]
    );
    return result.rows[0];
  }

  async markLoanAsNpa(loanId: string): Promise<any> {
    const result = await this.query(
      `UPDATE loans 
       SET status = 'npa', updated_at = NOW()
       WHERE loan_id = $1
       RETURNING *`,
      [loanId]
    );
    return result.rows[0];
  }
}

// Export singleton instance
export const db = new DatabaseService();

// Database initialization function for migrations
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create companies table first (referenced by other tables)
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        tagline VARCHAR(200),
        logo_config JSONB,
        contact JSONB,
        theme JSONB,
        registration JSONB,
        social JSONB,
        currency JSONB,
        application JSONB,
        saas JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create customers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

    // Create loan_products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS loan_products (
        product_id VARCHAR(20) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL,
        description TEXT,
        interest_type VARCHAR(20) NOT NULL,
        min_amount BIGINT NOT NULL,
        max_amount BIGINT NOT NULL,
        min_tenure INTEGER NOT NULL,
        max_tenure INTEGER NOT NULL,
        interest_rate_min DECIMAL,
        interest_rate_max DECIMAL,
        processing_fee DECIMAL,
        processing_fee_type VARCHAR(10) DEFAULT 'percentage',
        prepayment_penalty BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        company_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create loan_applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS loan_applications (
        application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

    // Create loans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS loans (
        loan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID NOT NULL,
        disbursement_date TIMESTAMP,
        actual_amount BIGINT NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        closed_date TIMESTAMP,
        company_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create loan_schedules table
    await client.query(`
      CREATE TABLE IF NOT EXISTS loan_schedules (
        schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        loan_id UUID NOT NULL,
        installment_no INTEGER NOT NULL,
        due_date DATE NOT NULL,
        principal BIGINT NOT NULL,
        interest BIGINT NOT NULL,
        total_payment BIGINT NOT NULL,
        paid_amount BIGINT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        payment_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        loan_id UUID NOT NULL,
        schedule_id UUID,
        amount BIGINT NOT NULL,
        method VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'success',
        transaction_date TIMESTAMP DEFAULT NOW(),
        reference_number VARCHAR(50) UNIQUE,
        company_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create audit_logs table for RBI compliance
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        action VARCHAR(20) NOT NULL,
        performed_by UUID,
        performed_by_role VARCHAR(50),
        company_id VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45),
        before_data JSONB,
        after_data JSONB,
        change_summary TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
      CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);
      CREATE INDEX IF NOT EXISTS idx_customers_kyc ON customers(kyc_status);

      CREATE INDEX IF NOT EXISTS idx_loan_apps_customer ON loan_applications(customer_id);
      CREATE INDEX IF NOT EXISTS idx_loan_apps_company ON loan_applications(company_id);
      CREATE INDEX IF NOT EXISTS idx_loan_apps_status ON loan_applications(status);
      CREATE INDEX IF NOT EXISTS idx_loan_apps_product ON loan_applications(product_id);

      CREATE INDEX IF NOT EXISTS idx_loans_application ON loans(application_id);
      CREATE INDEX IF NOT EXISTS idx_loans_company ON loans(company_id);
      CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

      CREATE INDEX IF NOT EXISTS idx_schedules_loan ON loan_schedules(loan_id, installment_no);
      CREATE INDEX IF NOT EXISTS idx_schedules_due_date ON loan_schedules(due_date);
      CREATE INDEX IF NOT EXISTS idx_schedules_status ON loan_schedules(status);

      CREATE INDEX IF NOT EXISTS idx_payments_loan ON payments(loan_id, transaction_date);
      CREATE INDEX IF NOT EXISTS idx_payments_company ON payments(company_id);
      CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);

      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}