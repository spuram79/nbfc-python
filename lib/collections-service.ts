/**
 * Collections Service
 * Handles NPA management, recovery, and collections workflows
 */

import { db, Payment } from '@/lib/db';

// Collections status
export type CollectionsStatus = 'pending' | 'dunning_1' | 'dunning_2' | 'dunning_3' | 'legal_notice' | 'legal_case' | 'recovered' | 'written_off';

// NPA thresholds (days past due)
export const NPA_THRESHOLDS = {
  D1: 30,  // 30 days - First dunning
  D2: 60,  // 60 days - Second dunning
  D3: 90,  // 90 days - Legal notice
  NPA: 120, // 120 days - Classified as NPA
};

export interface CollectionsRecord {
  collections_id: string;
  loan_id: string;
  status: CollectionsStatus;
  assigned_to?: string; // collector user_id
  last_contact_at?: Date;
  contact_count: number;
  recovery_attempts: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export class CollectionsService {
  /**
   * Identify overdue loans for collections
   */
  static async identifyOverdueLoans(companyId: string): Promise<Array<{
    loan_id: string;
    application_id: string;
    customer_id: string;
    overdue_amount: number;
    days_past_due: number;
    status: CollectionsStatus;
  }>> {
    // Query loans with overdue schedules
    const result = await db.query(`
      SELECT 
        l.loan_id,
        l.application_id,
        l.customer_id,
        COALESCE(SUM(ls.total_payment - COALESCE(ls.paid_amount, 0)), 0) as overdue_amount,
        EXTRACT(DAY FROM (NOW() - ls.due_date)) as days_past_due
      FROM loans l
      JOIN loan_schedules ls ON l.loan_id = ls.loan_id
      WHERE l.company_id = $1 
        AND l.status = 'active'
        AND ls.status IN ('pending', 'overdue', 'partial')
        AND ls.due_date < NOW()
      GROUP BY l.loan_id, l.application_id, l.customer_id, ls.due_date
      ORDER BY days_past_due DESC
    `, [companyId]);

    return result.rows.map((row: any) => ({
      loan_id: row.loan_id,
      application_id: row.application_id,
      customer_id: row.customer_id,
      overdue_amount: parseFloat(row.overdue_amount) || 0,
      days_past_due: parseInt(row.days_past_due) || 0,
      status: this.determineCollectionsStatus(parseInt(row.days_past_due) || 0),
    }));
  }

  /**
   * Determine collections status based on days past due
   */
  static determineCollectionsStatus(daysPastDue: number): CollectionsStatus {
    if (daysPastDue >= NPA_THRESHOLDS.NPA) return 'written_off';
    if (daysPastDue >= NPA_THRESHOLDS.D3) return 'legal_case';
    if (daysPastDue >= NPA_THRESHOLDS.D2) return 'dunning_3';
    if (daysPastDue >= NPA_THRESHOLDS.D1) return 'dunning_2';
    return 'dunning_1';
  }

  /**
   * Initiate first-level collections (automated SMS/email)
   */
  static async initiateDunning(loanId: string, companyId: string): Promise<void> {
    // Update loan status
    await db.query(
      'UPDATE loan_schedules SET status = \'overdue\' WHERE loan_id = $1 AND due_date < NOW()',
      [loanId]
    );

    // Send SMS/Email notification (mock)
    console.log(`Sending dunning notice to customer for loan ${loanId}`);
  }

  /**
   * Generate recovery report
   */
  static async generateRecoveryReport(companyId: string, startDate: Date, endDate: Date): Promise<{
    total_overdue: number;
    npa_amount: number;
    recovered_amount: number;
    recovery_rate: number;
    by_status: Record<string, number>;
  }> {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_overdue,
        SUM(CASE WHEN EXTRACT(DAY FROM (NOW() - ls.due_date)) >= ${NPA_THRESHOLDS.NPA} THEN ls.total_payment - COALESCE(ls.paid_amount, 0) ELSE 0 END) as npa_amount,
        COALESCE(SUM(p.amount), 0) as recovered_amount
      FROM loan_schedules ls
      JOIN loans l ON ls.loan_id = l.loan_id
      LEFT JOIN payments p ON p.schedule_id = ls.schedule_id AND p.status = 'success'
      WHERE l.company_id = $1
        AND ls.due_date BETWEEN $2 AND $3
        AND ls.status IN ('pending', 'overdue', 'partial')
    `, [companyId, startDate, endDate]);

    const row = result.rows[0];
    const total = parseFloat(row.total_overdue) || 0;
    const npa = parseFloat(row.npa_amount) || 0;
    const recovered = parseFloat(row.recovered_amount) || 0;

    return {
      total_overdue: total,
      npa_amount: npa,
      recovered_amount: recovered,
      recovery_rate: total > 0 ? (recovered / total) * 100 : 0,
      by_status: {},
    };
  }

  /**
   * Calculate NPA ratio for regulatory reporting
   */
  static async calculateNpaRatio(companyId: string): Promise<{
    net_npa: number;
    gross_npa: number;
    total_sanctioned: number;
  }> {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN ls.status = 'paid' THEN 0 ELSE ls.total_payment - COALESCE(ls.paid_amount, 0) END), 0) as net_npa,
        COALESCE(SUM(ls.total_payment), 0) as total_sanctioned,
        COUNT(*) as total_loans
      FROM loan_schedules ls
      JOIN loans l ON ls.loan_id = l.loan_id
      WHERE l.company_id = $1
    `, [companyId]);

    const row = result.rows[0];
    const sanctioned = parseFloat(row.total_sanctioned) || 0;
    const netNpa = parseFloat(row.net_npa) || 0;

    return {
      net_npa: netNpa,
      gross_npa: netNpa, // Simplified
      total_sanctioned: sanctioned,
    };
  }
}

export default CollectionsService;