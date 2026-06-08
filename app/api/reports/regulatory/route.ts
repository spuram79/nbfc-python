/**
 * RBI Regulatory Reports API
 * Generates RBI-compliant returns: SARDI, Schedule III, Schedule IV, CSR
 */

import { NextRequest, NextResponse } from 'next/server';
import { ReportingService } from '@/lib/reporting-service';
import { db } from '@/lib/db';

// Helper to get company ID from request headers
function getCompanyId(request: NextRequest): string {
  return request.headers.get('x-company-id') || 'fintrust';
}

// GET /api/reports/regulatory - List available RBI reports
export async function GET(request: NextRequest) {
  return NextResponse.json({
    reports: [
      {
        id: 'sardi',
        form: 'SARDI',
        name: 'Schedule for Asset Quality Data for Individual Banks',
        description: 'Monthly asset quality reporting to RBI',
        frequency: 'monthly',
        deadline: '7th day of next month',
        fields: [
          'loans_disbursed',
          'total_disbursement',
          'npa_amount',
          'd1_loans',
          'd2_loans', 
          'd3_loans',
        ],
      },
      {
        id: 'schedule_iii',
        form: 'Schedule III',
        name: 'Balance Sheet',
        description: 'Quarterly balance sheet data to RBI',
        frequency: 'quarterly',
        deadline: '30 days after quarter end',
        fields: [
          'loan_count',
          'book_value',
          'npa_value',
          'standard_assets',
          'substandard_assets',
          'doubtful_assets',
        ],
      },
      {
        id: 'schedule_iv',
        form: 'Schedule IV',
        name: 'Capital Ratios',
        description: 'Quarterly capital adequacy reporting',
        frequency: 'quarterly',
        deadline: '30 days after quarter end',
        fields: [
          'tier1_capital',
          'total_capital',
          'risk_weighted_assets',
          'tier1_ratio',
          'capital_adequacy_ratio',
        ],
      },
      {
        id: 'csr',
        form: 'CSR Returns',
        name: 'Corporate Social Responsibility',
        description: 'Annual CSR activity reporting',
        frequency: 'annual',
        deadline: 'declared by RBI',
        fields: [
          'expenditure',
          'projects_undertaken',
          'beneficiaries',
        ],
      },
    ],
  });
}

// POST /api/reports/regulatory/generate - Generate RBI report
export async function POST(request: NextRequest) {
  try {
    const companyId = getCompanyId(request);
    const body = await request.json();
    const { report_type, from_date, to_date, format } = body;

    if (!report_type || !from_date || !to_date) {
      return NextResponse.json(
        { error: 'Missing required fields: report_type, from_date, to_date' },
        { status: 400 }
      );
    }

    const params = {
      company_id: companyId,
      from_date: new Date(from_date),
      to_date: new Date(to_date),
      format: (format || 'json') as 'json' | 'xlsx' | 'csv',
    };

    let report: any;

    switch (report_type.toLowerCase()) {
      case 'sardi':
        report = await ReportingService.generateSardiReport(params);
        break;
      case 'schedule_iii':
        report = await ReportingService.generateScheduleIIIReport(params);
        break;
      case 'portfolio':
        report = await ReportingService.generatePortfolioReport(params);
        break;
      case 'npa_status':
      case 'npa':
        report = await ReportingService.generateNpaStatusReport(params);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown report type: ${report_type}` },
          { status: 400 }
        );
    }

    // Log report generation
    await db.createAuditLog({
      entity_type: 'report',
      entity_id: report_type,
      action: 'report_generated',
      performed_by: 'system',
      company_id: companyId,
      after_data: { period_from: from_date, period_to: to_date, format },
    });

    return NextResponse.json({
      success: true,
      report_type,
      format: params.format,
      generated_at: new Date(),
      data: report,
    });
  } catch (error) {
    console.error('Error generating RBI report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}