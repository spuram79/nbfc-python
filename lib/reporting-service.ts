/**
 * Reporting Service
 * Generates RBI-compliant reports and analytics
 */

import { db } from '@/lib/db';

// Report types
export type ReportType = 'sardi' | 'schedule_iii' | 'portfolio' | 'npa_status' | 'disbursement';

export interface ReportParams {
  company_id: string;
  from_date: Date;
  to_date: Date;
  format?: 'json' | 'xlsx' | 'csv';
}

export class ReportingService {
  /**
   * Generate SARDI report (Asset Quality)
   * Required by RBI - monthly submission
   */
  static async generateSardiReport(params: ReportParams) {
    const result = await db.query(`
      SELECT 
        DATE_TRUNC('month', l.disbursement_date) as month,
        COUNT(DISTINCT l.loan_id) as loans_disbursed,
        COALESCE(SUM(l.actual_amount), 0) as total_disbursement,
        COALESCE(SUM(ps.total_payment - COALESCE(ps.paid_amount, 0)), 0) as npa_amount,
        COUNT(CASE WHEN EXTRACT(DAY FROM (NOW() - ps.due_date)) >= 30 THEN l.loan_id END) as d1_loans,
        COUNT(CASE WHEN EXTRACT(DAY FROM (NOW() - ps.due_date)) >= 60 THEN l.loan_id END) as d2_loans,
        COUNT(CASE WHEN EXTRACT(DAY FROM (NOW() - ps.due_date)) >= 90 THEN l.loan_id END) as d3_loans
      FROM loans l
      LEFT JOIN loan_schedules ps ON l.loan_id = ps.loan_id
      WHERE l.company_id = $1
        AND l.disbursement_date BETWEEN $2 AND $3
      GROUP BY DATE_TRUNC('month', l.disbursement_date)
      ORDER BY month DESC
    `, [params.company_id, params.from_date, params.to_date]);

    return {
      report_type: 'SARDI',
      generated_at: new Date(),
      period: {
        from: params.from_date,
        to: params.to_date,
      },
      data: result.rows,
    };
  }

  /**
   * Generate Schedule III report (Balance Sheet)
   * Required by RBI - quarterly submission
   */
  static async generateScheduleIIIReport(params: ReportParams) {
    const result = await db.query(`
      SELECT 
        l.status,
        COUNT(*) as loan_count,
        COALESCE(SUM(l.actual_amount), 0) as book_value,
        COALESCE(SUM(CASE WHEN EXTRACT(DAY FROM (NOW() - ps.due_date)) >= 90 THEN l.actual_amount ELSE 0 END), 0) as npa_value
      FROM loans l
      LEFT JOIN loan_schedules ps ON l.loan_id = ps.loan_id
      WHERE l.company_id = $1
        AND l.disbursement_date BETWEEN $2 AND $3
      GROUP BY l.status
    `, [params.company_id, params.from_date, params.to_date]);

    return {
      report_type: 'Schedule_III',
      generated_at: new Date(),
      period: {
        from: params.from_date,
        to: params.to_date,
      },
      data: result.rows,
    };
  }

  /**
   * Generate portfolio summary
   */
  static async generatePortfolioReport(params: ReportParams) {
    const loans = await db.listLoans(params.company_id);
    const payments = await db.listPayments(params.company_id);

    const totalSanctioned = loans.loans.reduce((sum, l: any) => sum + (l.requested_amount || 0), 0);
    const activeLoans = loans.loans.filter((l: any) => l.status === 'submitted' || l.status === 'approved' || l.status === 'disbursed');
    const totalActive = activeLoans.reduce((sum, l: any) => sum + (l.requested_amount || 0), 0);

    const totalCollected = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

    return {
      report_type: 'Portfolio_Summary',
      generated_at: new Date(),
      period: {
        from: params.from_date,
        to: params.to_date,
      },
      summary: {
        total_loans: loans.total,
        active_loans: activeLoans.length,
        total_sanctioned: totalSanctioned,
        total_active: totalActive,
        total_collected: totalCollected,
        collection_rate: totalSanctioned > 0 ? (totalCollected / totalSanctioned) * 100 : 0,
      },
    };
  }

  /**
   * Generate NPA status report
   */
  static async generateNpaStatusReport(params: ReportParams) {
    const result = await db.query(`
      SELECT 
        EXTRACT(DAY FROM (NOW() - ps.due_date)) as days_past_due,
        COUNT(*) as loan_count,
        COALESCE(SUM(ps.total_payment - COALESCE(ps.paid_amount, 0)), 0) as outstanding_amount
      FROM loan_schedules ps
      JOIN loans l ON ps.loan_id = l.loan_id
      WHERE l.company_id = $1
        AND ps.due_date < NOW()
        AND ps.status IN ('pending', 'overdue', 'partial')
      GROUP BY EXTRACT(DAY FROM (NOW() - ps.due_date))
      ORDER BY days_past_due DESC
    `, [params.company_id]);

    const npaLoans = result.rows.filter((r: any) => r.days_past_due >= 90);
    const totalNpa = npaLoans.reduce((sum: number, r: any) => sum + parseFloat(r.outstanding_amount), 0);

    return {
      report_type: 'NPA_Status',
      generated_at: new Date(),
      period: {
        from: params.from_date,
        to: params.to_date,
      },
      data: result.rows,
      summary: {
        npa_loans: npaLoans.length,
        total_npa_amount: totalNpa,
        npa_percentage: 0, // Would need total book value
      },
    };
  }

  /**
   * Export report to file format
   */
  static async exportReport(report: any, format: string): Promise<Buffer> {
    // Simple JSON export for now
    // In production, usexlsx or similar for Excel export
    if (format === 'json') {
      return Buffer.from(JSON.stringify(report, null, 2));
    }
    if (format === 'csv') {
      // Simple CSV conversion
      const headers = Object.keys(report.data[0] || {}).join(',');
      const rows = report.data.map((r: any) => Object.values(r).join(','));
      return Buffer.from([headers, ...rows].join('\n'));
    }
    return Buffer.from(JSON.stringify(report, null, 2));
  }
}