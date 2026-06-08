/**
 * Reports API Routes
 * Generates RBI-compliant reports and portfolio analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import ReportingService, { ReportType } from '@/lib/reporting-service';

// Helper to get company ID from request headers
function getCompanyId(request: NextRequest): string {
  return request.headers.get('x-company-id') || 'fintrust';
}

// GET /api/reports - List available reports
export async function GET(request: NextRequest) {
  return NextResponse.json({
    reports: [
      {
        id: 'sardi',
        name: 'SARDI Report',
        description: 'Asset Quality - RBI Monthly Return',
        frequency: 'monthly',
        format: ['json', 'xlsx', 'csv'],
      },
      {
        id: 'schedule_iii',
        name: 'Schedule III',
        description: 'Balance Sheet Data - RBI Quarterly Return',
        frequency: 'quarterly',
        format: ['json', 'xlsx', 'csv'],
      },
      {
        id: 'portfolio',
        name: 'Portfolio Summary',
        description: 'Portfolio Performance Overview',
        frequency: 'weekly',
        format: ['json', 'csv'],
      },
      {
        id: 'npa_status',
        name: 'NPA Status',
        description: 'Non-Performing Asset Analysis',
        frequency: 'monthly',
        format: ['json', 'xlsx', 'csv'],
      },
    ],
  });
}

// POST /api/reports/generate - Generate specific report
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
      format: format || 'json' as 'json' | 'xlsx' | 'csv',
    };

    let report: any;

    switch (reportTypeFromString(report_type)) {
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
        report = await ReportingService.generateNpaStatusReport(params);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown report type: ${report_type}` },
          { status: 400 }
        );
    }

    // Export to requested format
    const buffer = await ReportingService.exportReport(report, params.format);

    // Return report data
    return NextResponse.json({
      success: true,
      report_type,
      format: params.format,
      data: report,
      file_size: buffer.length,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function reportTypeFromString(s: string): ReportType {
  switch (s.toLowerCase()) {
    case 'sardi': return 'sardi';
    case 'schedule_iii': return 'schedule_iii';
    case 'portfolio': return 'portfolio';
    case 'npa_status': return 'npa_status';
    default: return 'portfolio';
  }
}